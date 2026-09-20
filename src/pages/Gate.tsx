import { useEffect, useRef, useState } from 'react'

/* Gate — the SWARM intro (index fresh loads only). A living creature built
   the way the reference does it: hundreds of magenta streak-particles
   churning around a white-hot core, motion-trail rendering, a reflection
   pool beneath. It thinks ~2.4s breathing inward, then stretches to the four
   corners and floods pink — that flood IS the index reveal. Click skips to
   the stretch. Hook classes kept for the capture rig. Reduced: one still. */

const WORDS = ['GATHERING', 'CONDENSING', 'OPENING']
const N = 520

interface P {
  a: number
  r: number
  sp: number
  dir: 1 | -1
  wob: number
  wobSp: number
  size: number
  col: string
}

const PALETTE = ['#3d0a24', '#3d0a24', '#a4124f', '#a4124f', '#ff2d78', '#ff2d78', '#ffd9e8', '#4df3ff']

function makeSwarm(seedR: number): P[] {
  let s = seedR
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: N }, () => {
    const core = rnd()
    return {
      a: rnd() * Math.PI * 2,
      r: 0.12 + 0.88 * Math.pow(rnd(), 0.55),
      sp: 0.25 + rnd() * 0.85,
      dir: rnd() < 0.72 ? 1 : -1,
      wob: rnd() * Math.PI * 2,
      wobSp: 0.6 + rnd() * 1.6,
      size: core > 0.93 ? 1.6 : 0.6 + rnd() * 1.1,
      col: core > 0.965 ? '#4df3ff' : core > 0.9 ? '#ffd9e8' : PALETTE[Math.floor(rnd() * 6)],
    }
  })
}

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const done = useRef(false)
  const canvas = useRef<HTMLCanvasElement>(null!)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [n, setN] = useState(() => (reduced ? 100 : 0))
  const [wi, setWi] = useState(0)
  const [cover, setCover] = useState(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onEnter()
  }
  const toCover = () => {
    if (done.current) return
    setCover(true)
    setN(100)
    window.setTimeout(finish, reduced ? 0 : 480)
  }

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    if (!ctx) {
      finish()
      return
    }
    const S = 300
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    cv.width = S * dpr
    cv.height = S * dpr
    ctx.scale(dpr, dpr)
    const swarm = makeSwarm(1234567)
    const cx = S / 2
    const cy = S / 2 - 6
    const R = S * 0.36
    let raf = 0
    const t0 = performance.now()

    const draw = (t: number, contract: number) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(6, 9, 15, 0.3)'
      ctx.fillRect(0, 0, S, S)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const p of swarm) {
        const ang = p.a + t * p.sp * p.dir * 0.9
        const rr = p.r * R * contract * (1 + 0.08 * Math.sin(t * p.wobSp + p.wob))
        const x = cx + Math.cos(ang) * rr + Math.sin(t * 1.7 + p.wob) * 3
        const y = cy + Math.sin(ang) * rr * 0.94 + Math.cos(t * 1.3 + p.wob) * 3
        const px = cx + Math.cos(ang - p.sp * p.dir * 0.05) * rr
        const py = cy + Math.sin(ang - p.sp * p.dir * 0.05) * rr * 0.94
        ctx.strokeStyle = p.col
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      // reflection pool: squashed magenta echo beneath
      ctx.globalCompositeOperation = 'source-over'
      const g = ctx.createRadialGradient(cx, cy + R * 0.98, 4, cx, cy + R * 0.98, R * 1.15)
      g.addColorStop(0, 'rgba(255, 45, 120, 0.4)')
      g.addColorStop(1, 'rgba(255, 45, 120, 0)')
      ctx.fillStyle = g
      ctx.save()
      ctx.translate(cx, cy + R * 0.98)
      ctx.scale(1, 0.22)
      ctx.translate(-cx, -(cy + R * 0.98))
      ctx.fillRect(cx - R * 1.2, cy + R * 0.98 - R * 1.2, R * 2.4, R * 2.4)
      ctx.restore()
    }

    if (reduced) {
      draw(1.2, 0.9)
      const t = window.setTimeout(finish, 400)
      return () => window.clearTimeout(t)
    }
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 2400)
      setN(Math.floor(p * 100))
      setWi(Math.min(WORDS.length - 1, Math.floor(p * WORDS.length)))
      draw((now - t0) / 1000, 1 - p * 0.18)
      if (p >= 1) {
        toCover()
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div
      className={`intro orb-intro${cover ? ' cover' : ''}`}
      onClick={toCover}
      role="button"
      aria-label="Enter the site"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toCover()
      }}
    >
      <div className="intro-stage orb-stage">
        <div className="orb-creature" aria-hidden="true">
          <canvas ref={canvas} className="orb-canvas" width={300} height={300} />
        </div>
        <p className="intro-count">
          {String(n).padStart(3, '0')} — {WORDS[wi]}
        </p>
      </div>
    </div>
  )
}
