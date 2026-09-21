import { useEffect, useRef, useState } from 'react'

/* Gate — the CREATURE intro (index fresh loads only). A living orb built from
   three systems that real organisms and ferrofluid sculptures share:
   1. SPIKES — rim tendrils extending/retracting along radial field lines,
      gated by traveling waves (never still, never symmetric).
   2. PULSE — jellyfish contract/release asymmetry (fast squash, slow refill)
      plus a metachronal wave running around the circumference.
   3. BODY — heterogeneous filamented interior: bright forward-scattering
      core, dark absorption mid-band, ember inclusions, specular glints
      arcing over the rim, reflection pool beneath.
   Arc: BREATHE → SURGE → BLOOM (one synchronous startle contraction, then
   scatter into the field + veil lift + index fade + dust). Click skips.
   No counter. Reduced: one still, fast exit. */

const WORDS = ['BREATHE', 'SURGE', 'BLOOM']
const N = 620

interface P {
  kind: 0 | 1 | 2 | 3 // body | spike | core | glint
  a: number
  r: number
  sp: number
  dir: 1 | -1
  tilt: number
  wob: number
  size: number
  col: string
  core: number
  dx: number
  dy: number
}

const BODY = ['#3d0a24', '#3d0a24', '#6e0d38', '#a4124f', '#a4124f', '#ff2d78', '#ff2d78']

function makeSwarm(seedR: number): P[] {
  let s = seedR
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: N }, () => {
    const u = rnd()
    const kind: P['kind'] = u < 0.52 ? 0 : u < 0.78 ? 1 : u < 0.93 ? 2 : 3
    const core = rnd()
    const a = rnd() * Math.PI * 2
    return {
      kind,
      a,
      core,
      r: kind === 2 ? 0.05 + 0.22 * rnd() : 0.15 + 0.85 * Math.pow(rnd(), 0.55),
      sp: 0.25 + rnd() * 0.9,
      dir: rnd() < 0.7 ? 1 : -1,
      tilt: (rnd() - 0.5) * 0.9,
      wob: rnd() * Math.PI * 2,
      size: kind === 3 ? 1.1 + rnd() * 0.6 : kind === 2 ? 1.5 : 0.6 + rnd() * 1.2,
      col:
        kind === 3
          ? core > 0.5 ? '#ffffff' : '#4df3ff'
          : kind === 2
            ? core > 0.6 ? '#ffe3ef' : '#ff2d78'
            : BODY[Math.floor(rnd() * BODY.length)],
      dx: Math.cos(a),
      dy: Math.sin(a),
    }
  })
}

// fast contract, slow refill — jellyfish asymmetry + metachronal offset
function pulseAt(t: number, angle: number): number {
  const ph = (((t * 0.9 - angle / (Math.PI * 2)) * 0.5) % 1 + 1) % 1
  return ph < 0.35 ? ph / 0.35 : 1 - (ph - 0.35) / 0.65
}

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const done = useRef(false)
  const canvas = useRef<HTMLCanvasElement>(null!)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [wi, setWi] = useState(0)
  const [bloom, setBloom] = useState(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onEnter()
  }
  const toBloom = () => {
    if (done.current) return
    setBloom(true)
    window.dispatchEvent(new CustomEvent('xeven:orb-bloom'))
    window.setTimeout(finish, reduced ? 0 : 1450)
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

    const drawSwarm = (t: number, breathe: number, alpha: number, scatter: number, startle: number) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(6, 9, 15, 0.3)'
      ctx.fillRect(0, 0, S, S)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      const tumble = t * 0.35
      const ct = Math.cos(tumble)
      const st = Math.sin(tumble)
      // global squash from the base pulse (contract fast, refill slow)
      const gp = pulseAt(t, 0)
      const squashY = 1 - 0.13 * gp * (1 - startle * 0.5)
      const squashX = 1 + 0.07 * gp * (1 - startle * 0.5)
      const startleSuck = 1 - startle * 0.3
      for (const p of swarm) {
        const wob = 1 + 0.07 * Math.sin(t * 1.6 + p.wob)
        if (p.kind === 1) {
          // SPIKES: extend along radial field lines, gated by traveling wave
          const wave = Math.pow(Math.max(0, Math.sin(3 * p.a - t * 2.3)), 2)
          const met = 0.4 + 0.6 * pulseAt(t, p.a)
          const env = wave * met * (1 - startle * 0.85)
          if (env < 0.03 && scatter <= 0) continue
          const r0 = R * breathe * 0.9 * startleSuck
          const len = R * (0.04 + 0.34 * env) * breathe
          const x0 = cx + Math.cos(p.a) * r0
          const y0 = cy + Math.sin(p.a) * r0 * squashY
          const x1 = cx + Math.cos(p.a) * (r0 + len) + p.dx * scatter
          const y1 = cy + Math.sin(p.a) * (r0 + len) * squashY + p.dy * scatter
          ctx.strokeStyle = p.col
          ctx.globalAlpha = alpha * Math.min(1, 0.25 + env)
          ctx.lineWidth = p.size * (0.7 + env * 0.9)
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.stroke()
          continue
        }
        if (p.kind === 3) {
          // GLINTS: fast bright sparks arcing over the rim
          const ga = p.a + t * (1.6 + p.sp) * p.dir
          const gr = R * breathe * 0.97 * startleSuck
          const x = cx + Math.cos(ga) * gr * squashX + p.dx * scatter
          const y = cy + Math.sin(ga) * gr * squashY + p.dy * scatter
          const tw = 0.5 + 0.5 * Math.sin(t * 7 + p.wob)
          ctx.strokeStyle = p.col
          ctx.globalAlpha = alpha * tw
          ctx.lineWidth = p.size
          ctx.beginPath()
          ctx.moveTo(x - 2, y)
          ctx.lineTo(x + 2, y)
          ctx.stroke()
          continue
        }
        // BODY + CORE: tumbled disc with depth shading
        const ang = p.a + t * p.sp * p.dir * 0.85
        const ox = Math.cos(ang) * p.r
        const oy = Math.sin(ang) * p.r * Math.cos(p.tilt)
        const oz = Math.sin(ang) * p.r * Math.sin(p.tilt)
        const rx = ox * ct - oz * st
        const rz = ox * st + oz * ct
        const depth = 0.5 + 0.5 * (rz / Math.max(p.r, 1e-3))
        const bright = p.kind === 2 ? 0.75 + 0.45 * depth : 0.3 + 0.7 * depth
        const rr = p.r * R * breathe * wob * startleSuck
        const bx = (rx / Math.max(p.r, 1e-3)) * rr * squashX
        const by = (oy / Math.max(p.r, 1e-3)) * rr * squashY + Math.sin(t * 1.2 + p.wob) * 2.5
        const edge = Math.min(1, Math.hypot(bx, by) / (R * breathe))
        const rim = edge > 0.78 ? (edge - 0.78) * 3.2 : 0
        const x = cx + bx + p.dx * scatter
        const y = cy + by + p.dy * scatter
        ctx.strokeStyle = p.col
        ctx.globalAlpha = alpha * Math.min(1, bright + rim * 0.7)
        ctx.lineWidth = p.size * (0.55 + 0.65 * depth) * (1 + rim * 0.8)
        ctx.beginPath()
        ctx.moveTo(x - Math.cos(ang) * 3 * p.sp, y - Math.sin(ang) * 3 * p.sp)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      ctx.globalAlpha = alpha
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
      ctx.globalAlpha = 1
    }

    if (reduced) {
      drawSwarm(1.2, 0.9, 1, 0, 0)
      const t = window.setTimeout(toBloom, 400)
      return () => window.clearTimeout(t)
    }
    let bloomed = false
    let bloomT = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 2600)
      setWi(p < 0.45 ? 0 : p < 0.8 ? 1 : 2)
      if (p < 1) {
        const breathe = p < 0.45 ? 1 - (p / 0.45) * 0.2 : 0.8 + ((p - 0.45) / 0.35) * 0.9
        drawSwarm((now - t0) / 1000, breathe, 1, 0, 0)
        raf = requestAnimationFrame(step)
        return
      }
      if (!bloomed) {
        bloomed = true
        toBloom()
      }
      // startle: one synchronous contraction, then scatter into the field
      // bloom: slow scatter into the field over ~1.2s while the veil breathes out
      bloomT += 1 / 60
      const k = Math.min(1, bloomT / 1.2)
      const startle = k < 0.2 ? k / 0.2 : Math.max(0, 1 - (k - 0.2) / 0.25)
      drawSwarm((now - t0) / 1000, 1.7, 1 - k, k * k, startle)
      if (k >= 1) return
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div
      className={`intro orb-intro${bloom ? ' bloom' : ''}`}
      onClick={toBloom}
      role="button"
      aria-label="Enter the site"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toBloom()
      }}
    >
      <div className="intro-veil" aria-hidden="true" />
      <div className="intro-stage orb-stage">
        <div className="orb-creature" aria-hidden="true">
          <canvas ref={canvas} className="orb-canvas" width={300} height={300} />
        </div>
        <p className="intro-count">{WORDS[wi]}</p>
      </div>
    </div>
  )
}
