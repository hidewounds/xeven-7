import { useEffect, useMemo, useRef } from 'react'

/* Intro — MERGE (bone/mint sphere field gathers into one mass, then the
   veil lifts). Full-screen dots drift to the centre on a distance-delayed
   wave, growing and warming mint as they merge — overlaps add, never burst.
   Live 000→100 ledger + phase word. Pure rAF + 2D canvas, no libraries to
   drift. Click skips. Reduced skips. */

const DUR = 1.9
const WHITE_END = 0.22
const FADE_AT = 1.55

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const root = useRef<HTMLDivElement>(null!)
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const whiteRef = useRef<HTMLDivElement>(null!)
  const miniRef = useRef<HTMLDivElement>(null!)
  const countRef = useRef<HTMLSpanElement>(null!)
  const wordRef = useRef<HTMLSpanElement>(null!)
  const done = useRef(false)
  const startRef = useRef(0)
  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const finish = () => {
    if (done.current) return
    done.current = true
    onEnter()
  }

  const skip = () => {
    if (done.current || reduced) return
    const t = (performance.now() - startRef.current) / 1000
    if (t < FADE_AT) startRef.current -= (FADE_AT - t) * 1000
  }

  useEffect(() => {
    if (reduced) {
      finish()
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const white = whiteRef.current
    const mini = miniRef.current
    const count = countRef.current
    const word = wordRef.current
    const el = root.current
    if (!ctx || !white || !mini || !el) {
      finish()
      return
    }

    let w = 0
    let h = 0
    let cx = 0
    let cy = 0
    let maxR = 0
    let cols = 0
    let rows = 0
    const build = () => {
      // mobile pixel cap 1.25, desktop 1.5
      const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
      w = window.innerWidth
      h = window.innerHeight
      cx = w / 2
      cy = h / 2
      maxR = Math.hypot(w, h) / 2
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.max(10, Math.floor(w / 90))
      rows = Math.max(8, Math.floor(h / 90))
    }
    build()
    window.addEventListener('resize', build)

    startRef.current = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = (performance.now() - startRef.current) / 1000
      if (t >= DUR) {
        finish()
        return
      }
      // white beat: pure bone for exactly WHITE_END, then a hard cut to the
      // grid — no fade (a fade would read as gray frames over the dark field)
      white.style.opacity = t < WHITE_END ? '1' : '0'
      mini.style.opacity = clamp01((t - 0.3) / 0.3).toFixed(3)

      // ignition ledger: 000→100 counter + phase word, textContent writes
      // only (no react state down the rAF path)
      if (count) count.textContent = String(Math.round(clamp01((t - 0.25) / 1.3) * 100)).padStart(3, '0')
      if (word) {
        word.textContent = t < 0.6 ? 'SIGNAL' : t < 1.1 ? 'WORLD' : 'LIVE'
      }

      // MERGE: a full-screen field of theme spheres (bone shells, mint
      // hearts) drifts together and slowly merges — overlaps add in
      // 'lighter' so the gathering reads as one mass forming, never
      // bursting. Outer spheres join late (distance-delayed) for an inward
      // wave; the veil lifts into the index at the end.
      const fade = 1 - clamp01((t - FADE_AT) / (DUR - FADE_AT))
      el.style.opacity = fade.toFixed(3)

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const gx = w / (cols + 1)
      const gy = h / (rows + 1)
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          // deterministic jitter breaks the grid — organic field, not wallpaper
          const jx = ((i * 37 + j * 91) % 17) / 16 - 0.5
          const jy = ((i * 53 + j * 29) % 19) / 18 - 0.5
          const bx = gx * (i + 1) + jx * 24
          const by = gy * (j + 1) + jy * 24
          const dist = Math.hypot(bx - cx, by - cy)
          // gather: 0 resting out in the field, 1 merged at the centre
          const raw = (t - 0.2 - (dist / maxR) * 0.35) / 1.1
          const u = Math.min(1, Math.max(0, raw))
          const e = u * u * (3 - 2 * u)
          if (e <= 0.001) continue
          const px = bx + (cx - bx) * e
          const py = by + (cy - by) * e
          const r = (1.4 + e * 22) * smallFix(w)
          const heart = e > 0.65
          const a = ((heart ? 0.5 : 0.22) + e * 0.4) * fade
          ctx.fillStyle = heart
            ? `rgba(156,245,211,${a.toFixed(3)})`
            : `rgba(232,237,238,${a.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    // hidden-tab pause: hidden time must not advance the choreography
    let hiddenAt = 0
    const onVis = () => {
      if (document.hidden) {
        hiddenAt = performance.now()
        cancelAnimationFrame(raf)
        raf = 0
      } else {
        if (hiddenAt > 0) startRef.current += performance.now() - hiddenAt
        hiddenAt = 0
        if (!raf) raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // small screens: slightly slimmer dots so the mass stays liquid, not blobby
  function smallFix(vw: number) {
    return vw < 768 ? 0.8 : 1
  }

  return (
    <div className="intro" ref={root} onClick={skip}>
      <canvas ref={canvasRef} className="intro-stage" aria-hidden="true" />
      <div ref={miniRef} className="intro-mini" aria-hidden="true">
        <span>XEVEN®</span>
        <span>EST. MMXXVI</span>
      </div>
      <div className="intro-ledger" aria-hidden="true">
        <span ref={wordRef} className="intro-word">
          SIGNAL
        </span>
        <span ref={countRef} className="intro-count">
          000
        </span>
      </div>
      <div ref={whiteRef} className="intro-white" aria-hidden="true" />
    </div>
  )
}
