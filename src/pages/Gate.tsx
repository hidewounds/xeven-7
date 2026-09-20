import { useEffect, useRef, useState } from 'react'

/* Gate — the SPHERE intro (index fresh loads only). A living 3D ball built
   the reference way: 560 streak-particles with real depth (front bright and
   large, back dim and small, rim-lit silhouette), slow two-axis tumble,
   white-hot core with cyan sparks. Arc: GATHER (condense) → DIFFUSE (radii
   breathe outward) → BLOOM (pink flood carrying a diamond lattice that grows
   on it, then dissolves into the index). Click skips to the bloom. Reduced:
   one still, fast exit. */

const WORDS = ['GATHER', 'DIFFUSE', 'BLOOM']
const N = 560

interface P {
  a: number
  r: number
  sp: number
  dir: 1 | -1
  tilt: number
  wob: number
  size: number
  col: string
  core: boolean
}

const BODY = ['#3d0a24', '#3d0a24', '#6e0d38', '#a4124f', '#a4124f', '#ff2d78', '#ff2d78']

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
      r: 0.1 + 0.9 * Math.pow(rnd(), 0.5),
      sp: 0.3 + rnd() * 0.9,
      dir: rnd() < 0.7 ? 1 : -1,
      tilt: (rnd() - 0.5) * 0.9,
      wob: rnd() * Math.PI * 2,
      size: core > 0.94 ? 1.7 : 0.6 + rnd() * 1.2,
      col: core > 0.968 ? '#4df3ff' : core > 0.9 ? '#ffe3ef' : BODY[Math.floor(rnd() * BODY.length)],
      core: core > 0.9,
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
    window.dispatchEvent(new CustomEvent('xeven:orb-bloom'))
    window.setTimeout(finish, reduced ? 0 : 950)
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
    const swarm = makeSwarm(987654321)
    const cx = S / 2
    const cy = S / 2 - 6
    const R = S * 0.36
    let raf = 0
    const t0 = performance.now()

    const draw = (t: number, breathe: number) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(6, 9, 15, 0.3)'
      ctx.fillRect(0, 0, S, S)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      // slow two-axis tumble so the ball turns in depth
      const tumble = t * 0.35
      const ct = Math.cos(tumble)
      const st = Math.sin(tumble)
      for (const p of swarm) {
        const ang = p.a + t * p.sp * p.dir * 0.85
        // orbit plane tilted per particle, then tumbled: z decides depth
        const ox = Math.cos(ang) * p.r
        const oy = Math.sin(ang) * p.r * Math.cos(p.tilt)
        const oz = Math.sin(ang) * p.r * Math.sin(p.tilt)
        const rx = ox * ct - oz * st
        const rz = ox * st + oz * ct
        const depth = 0.5 + 0.5 * (rz / Math.max(p.r, 1e-3))
        const bright = 0.3 + 0.7 * depth
        const wob = 1 + 0.07 * Math.sin(t * 1.6 + p.wob)
        const rr = p.r * R * breathe * wob
        const x = cx + (rx / Math.max(p.r, 1e-3)) * rr
        const y = cy + (oy / Math.max(p.r, 1e-3)) * rr * 0.94 + Math.sin(t * 1.2 + p.wob) * 2.5
        // rim light: silhouette edge burns brighter
        const edge = Math.min(1, Math.hypot(x - cx, y - cy) / (R * breathe))
        const rim = edge > 0.78 ? (edge - 0.78) * 3.2 : 0
        const px = x - Math.cos(ang) * 3 * p.sp
        const py = y - Math.sin(ang) * 3 * p.sp
        ctx.strokeStyle = p.col
        ctx.globalAlpha = Math.min(1, bright * (p.core ? 1 : 0.85) + rim * 0.7)
        ctx.lineWidth = p.size * (0.55 + 0.65 * depth) * (1 + rim * 0.8)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      // reflection pool
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
      const t = window.setTimeout(toCover, 400)
      return () => window.clearTimeout(t)
    }
    // GATHER 0–0.45 (condense 1→0.8) · DIFFUSE 0.45–0.8 (breathe 0.8→1.7) · BLOOM 0.8–1
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 3000)
      setN(Math.floor(p * 100))
      setWi(p < 0.45 ? 0 : p < 0.8 ? 1 : 2)
      const breathe = p < 0.45 ? 1 - (p / 0.45) * 0.2 : 0.8 + ((p - 0.45) / 0.35) * 0.9
      draw((now - t0) / 1000, breathe)
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
      <div className="orb-diamonds" aria-hidden="true" />
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
