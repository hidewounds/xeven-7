import { useEffect, useMemo, useRef } from 'react'

/* Intro — GRID IGNITION (original, buttermax-schooled grammar). Bone-white
   flash, hard cut to a void dot-grid with the micro-nav already up, an
   ignition wave blooms from center — dots swell, ignite ember and merge
   into a liquid mass with chromatic fringe — the mass takes the whole
   screen ember, holds, and releases into the index. Pure rAF + 2D canvas,
   no libraries to drift. Click skips. Reduced skips. */

const DUR = 3.3
const WHITE_END = 0.35
const FADE_AT = 2.8

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
      cols = Math.max(8, Math.floor(w / 120))
      rows = Math.max(6, Math.floor(h / 120))
    }
    build()
    window.addEventListener('resize', build)

    const mouse = { x: -9999, y: -9999 }
    const sm = { x: -9999, y: -9999 }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    // touch devices never hover — no dead listener (taps still ride the wavefront)
    if (!window.matchMedia('(pointer: coarse)').matches) {
      window.addEventListener('mousemove', onMove, { passive: true })
    }

    startRef.current = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = (performance.now() - startRef.current) / 1000
      if (t >= DUR) {
        finish()
        return
      }
      if (mouse.x > -9000) {
        sm.x += (mouse.x - sm.x) * 0.12
        sm.y += (mouse.y - sm.y) * 0.12
      }

      // white beat: pure bone for exactly WHITE_END, then a hard cut to the
      // grid — no fade (a fade would read as gray frames over the dark field)
      white.style.opacity = t < WHITE_END ? '1' : '0'
      mini.style.opacity = clamp01((t - 0.45) / 0.5).toFixed(3)

      // ignition ledger: 000→100 counter + phase word, textContent writes
      // only (no react state down the rAF path)
      if (count) count.textContent = String(Math.round(clamp01((t - 0.4) / 2.4) * 100)).padStart(3, '0')
      if (word) {
        word.textContent =
          t < 1.0 ? 'SIGNAL' : t < 1.6 ? 'WORLD' : t < 2.2 ? 'IGNITE' : 'LIVE'
      }

      // ignition wavefront (linear slow burn) + ember wash + release
      const front = clamp01((t - 0.4) / 1.9) * maxR * 1.25
      const wash = clamp01((t - 2.2) / 0.6)
      const fade = 1 - clamp01((t - FADE_AT) / (DUR - FADE_AT))
      el.style.opacity = fade.toFixed(3)

      // backdrop warms toward ember as the wash takes over —
      // dots stay visible through it, never buried under a lid
      ctx.globalCompositeOperation = 'source-over'
      const wr = Math.round(6 + 194 * wash * 0.9)
      const wg = Math.round(9 + 65 * wash * 0.9)
      const wb = Math.round(15 + 3 * wash * 0.9)
      ctx.fillStyle = `rgb(${wr},${wg},${wb})`
      ctx.fillRect(0, 0, w, h)
      // hot center grade: the takeover burns from the middle outward
      if (wash > 0.01) {
        const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.9)
        hg.addColorStop(0, `rgba(255,138,61,${(wash * 0.55 * fade).toFixed(3)})`)
        hg.addColorStop(1, 'rgba(255,138,61,0)')
        ctx.fillStyle = hg
        ctx.fillRect(0, 0, w, h)
      }

      const gx = w / (cols + 1)
      const gy = h / (rows + 1)
      ctx.globalCompositeOperation = 'lighter'
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          // deterministic jitter breaks the grid — organic field, not wallpaper
          const jx = ((i * 37 + j * 91) % 17) / 16 - 0.5
          const jy = ((i * 53 + j * 29) % 19) / 18 - 0.5
          const bx = gx * (i + 1) + jx * 24
          const by = gy * (j + 1) + jy * 24
          const dist = Math.hypot(bx - cx, by - cy)
          // heat: warm inside the front, igniting ring at the front —
          // with radial falloff so the edges stay dark and brooding
          const fall = Math.max(0.12, 1 - dist / (maxR * 0.95))
          const inside = dist < front ? 0.9 : 0
          const ring = Math.max(0, 1 - Math.abs(dist - front) / 200)
          const heat = Math.min(1, inside + ring)
          // cursor stokes nearby dots hotter
          let hm = 0
          if (sm.x > -9000) {
            const md = Math.hypot(bx - sm.x, by - sm.y)
            if (md < 170) hm = (1 - md / 170) * 0.7
          }
          const hh = Math.min(1, Math.max(heat, wash * 0.95) + hm) * (0.3 + 0.7 * fall)
          const shimmer = 1 + 0.1 * Math.sin(t * 3 + (i * 7 + j * 13) * 0.7)
          const r = (1.6 + Math.pow(hh, 1.5) * 44 * shimmer) * (smallFix(w))
          if (r <= 0.2) continue
          // chromatic fringe: ember + mint ghosts offset each side of the core —
          // ignition edge only (the front band), so merged interiors read clean
          if (ring > 0.15) {
            ctx.fillStyle = `rgba(255,110,50,${(0.5 * hh * fade).toFixed(3)})`
            ctx.beginPath()
            ctx.arc(bx - 2.5, by, r, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = `rgba(156,245,211,${(0.5 * hh * fade).toFixed(3)})`
            ctx.beginPath()
            ctx.arc(bx + 2.5, by, r, 0, Math.PI * 2)
            ctx.fill()
          }
          // halo bleed: hot dots glow into their neighbors like liquid
          if (hh > 0.3) {
            ctx.fillStyle = `rgba(255,122,53,${(0.22 * hh * fade).toFixed(3)})`
            ctx.beginPath()
            ctx.arc(bx, by, r * 1.9, 0, Math.PI * 2)
            ctx.fill()
          }
          const cr = Math.round(232 + 23 * hh)
          const cg = Math.round(237 - 115 * hh)
          const cb = Math.round(238 - 168 * hh)
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${(Math.min(1, 0.3 + hh) * fade * (1 - wash * 0.35)).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(bx, by, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // wash lives in the backdrop mix + dot heat above — no lid, no cut
    }
    // hidden-tab pause: hidden time must not advance the 3.3s choreography
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
      window.removeEventListener('mousemove', onMove)
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
