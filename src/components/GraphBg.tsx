import { useEffect, useRef } from 'react'
import { xs } from '../app/store'

/* Infinite dot grid: adaptive cells, connecting lines under 140px, slow drift,
   brightening near cursor + scroll velocity. Lattice ignition: the pointer
   trail heats a coarse grid, heat diffuses to neighbors and cools — waves
   of warm light chase movement, clicks detonate a burst. 2D canvas,
   DPR<=1.75, pauses offscreen. Opacity .25 additive. */

interface Dot {
  x: number
  y: number
}

export default function GraphBg() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // mobile pixel cap 1.25, desktop 1.5 (was 1.75 — over budget).
    // Index gets the showcase treatment: denser, sharper, further links.
    const indexBoost = () => xs.route === 'enter'
    const dprCap = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
      if (indexBoost()) return coarse ? 1.5 : 1.65
      return coarse ? 1.25 : 1.5
    }
    // link reach is a quality tier too — longer lines on the index
    let linkDist = 140
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap())
    let w = 0
    let h = 0
    let dots: Dot[] = []
    let gap = 32
    let running = true
    let off = 0
    const mouse = { x: -9999, y: -9999 }
    // eased pointer — the warp never steps between mouse events
    const sm = { x: -9999, y: -9999 }
    // ignition trail: recent pointer samples feeding the heat grid
    const trail: Array<{ x: number; y: number; t: number }> = []
    const CELL = 64
    let gw = 0
    let gh = 0
    let heat = new Float32Array(0)
    let heat2 = new Float32Array(0)
    let curveAmp = 0
    // route the field was built for — rebuild on change so the index
    // keeps showcase density and subpages keep the cheap tier
    let builtRoute = ''
    // eased live value — the curve morphs instead of popping on route change
    let curveLive = 0
    let buckets = new Map<string, number[]>()

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, dprCap())
      w = window.innerWidth
      h = window.innerHeight
      const enter = indexBoost()
      // adaptive density: same lattice feel, bounded per-frame cost.
      // Index runs one tier denser (its curve + glow carry the show).
      const area = w * h
      gap = enter ? (area > 2500000 ? 40 : area > 1400000 ? 36 : 30) : area > 2500000 ? 44 : area > 1400000 ? 38 : 32
      linkDist = enter ? 150 : 140
      builtRoute = xs.route
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      gw = Math.max(1, Math.ceil(w / CELL))
      gh = Math.max(1, Math.ceil(h / CELL))
      heat = new Float32Array(gw * gh)
      heat2 = new Float32Array(gw * gh)
      buckets = new Map<string, number[]>()
      // index curve: centered inside-cylinder — viewer at the middle of
      // the diameter AND the height. Flanks squeeze, crown lifts, floor
      // drops, all terms zero at viewport center: unmistakable wrap with
      // zero tilt. Subpages stay flat so copy owns the frame.
      curveAmp = indexBoost() ? Math.min(150, h * 0.13) : Math.min(30, h * 0.035)
      dots = []
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          dots.push({ x, y })
        }
      }
    }
    // reduced motion: a single static frame, zero loops — the dot texture
    // stays, nothing burns (no heat, trail, warp, or drift)
    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(156,245,211,0.1)'
      const hw = w / 2
      // the curve lives on the index only — everywhere else the field is flat
      const ca = xs.route === 'enter' ? curveAmp : 0
      for (const d of dots) {
        // centered inside-cylinder: flanks squeeze, crown lifts, floor
        // drops — all zero at viewport middle, so no tilt in any direction
        const nx = (d.x - hw) / hw
        const ny = (d.y - h / 2) / (h / 2)
        ctx.fillRect(d.x - ca * nx * Math.abs(nx) - 1, d.y + ca * ny * Math.abs(ny) - 1, 2, 2)
      }
    }
    build()
    if (reduced) {
      drawStatic()
      const onResize = () => {
        build()
        drawStatic()
      }
      // hash route swaps tiers too — static frame follows without a loop
      const onHash = () => {
        build()
        drawStatic()
      }
      window.addEventListener('resize', onResize)
      window.addEventListener('hashchange', onHash)
      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('hashchange', onHash)
      }
    }
    window.addEventListener('resize', build)

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      trail.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (trail.length > 48) trail.splice(0, trail.length - 48)
      kick()
    }
    const onDown = (e: PointerEvent) => {
      // click burst: ignite the lattice around the impact point
      const cx = Math.floor(e.clientX / CELL)
      const cy = Math.floor(e.clientY / CELL)
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          const ix = cx + ox
          const iy = cy + oy
          if (ix < 0 || iy < 0 || ix >= gw || iy >= gh) continue
          const idx = iy * gw + ix
          heat[idx] = Math.min(1.6, heat[idx] + 1.2 - (Math.abs(ox) + Math.abs(oy)) * 0.25)
        }
      }
      kick()
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    const io = new IntersectionObserver((entries) => {
      running = entries[0]?.isIntersecting ?? true
    })
    io.observe(canvas)

    // cell buckets for bounded neighbor lookups — the pool above is
    // allocated once per resize and REUSED every frame (fresh arrays per
    // frame promoted to old-gen and caused full-GC pauses after minutes)
    const cell = 140
    let raf = 0
    let lastInput = performance.now()
    const kick = () => {
      lastInput = performance.now()
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else kick()
    }
    document.addEventListener('visibilitychange', onVis)
    // touch + keyboard scroll never fire mousemove — wake on those too,
    // or mobile / keyboard users would sleep through their own scrolling
    window.addEventListener('pointermove', kick, { passive: true })
    window.addEventListener('wheel', kick, { passive: true })
    window.addEventListener('scroll', kick, { passive: true })
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!running) return
      // route-tier swap: rebuild once when crossing to/from the index so
      // density, reach and stride always match the current tier
      if (xs.route !== builtRoute) build()
      // idle sleep: 4s with no input, empty trail and settled scroll
      // velocity — the heat sim has decayed below visibility by then
      if (trail.length === 0 && xs.vel < 0.005 && performance.now() - lastInput > 4000) {
        cancelAnimationFrame(raf)
        raf = 0
        return
      }
      off = (off + 0.15) % gap
      ctx.clearRect(0, 0, w, h)
      // --- ignition sim: cool, splat the trail, diffuse to neighbors
      const nowMs = performance.now()
      while (trail.length && nowMs - trail[0].t > 600) trail.shift()
      for (let i = 0; i < heat.length; i++) heat2[i] = heat[i] * 0.93
      for (const p of trail) {
        const age = (nowMs - p.t) / 600
        const wgt = (1 - age) * 0.55
        const cx = Math.floor(p.x / CELL)
        const cy = Math.floor(p.y / CELL)
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const ix = cx + ox
            const iy = cy + oy
            if (ix < 0 || iy < 0 || ix >= gw || iy >= gh) continue
            const idx = iy * gw + ix
            heat2[idx] = Math.min(1.6, heat2[idx] + wgt * (ox === 0 && oy === 0 ? 1 : 0.4))
          }
        }
      }
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = y * gw + x
          let sum = 0
          let n = 0
          if (x > 0) { sum += heat2[i - 1]; n++ }
          if (x < gw - 1) { sum += heat2[i + 1]; n++ }
          if (y > 0) { sum += heat2[i - gw]; n++ }
          if (y < gh - 1) { sum += heat2[i + gw]; n++ }
          heat[i] = heat2[i] * 0.985 + (n ? (sum / n) * 0.06 : 0)
        }
      }
      ctx.globalCompositeOperation = 'lighter'
      xs.vel *= 0.9
      // curve morphs with the route — flat everywhere but the index
      const curveTarget = xs.route === 'enter' ? curveAmp : 0
      curveLive += (curveTarget - curveLive) * 0.06
      sm.x += (mouse.x - sm.x) * 0.22
      sm.y += (mouse.y - sm.y) * 0.22
      const boost = Math.min(1, xs.vel * 2)
      // reuse the pooled bucket arrays — just truncate, never reallocate
      for (const arr of buckets.values()) arr.length = 0
      for (let i = 0; i < dots.length; i++) {
        const key = `${Math.floor(dots[i].x / cell)},${Math.floor(dots[i].y / cell)}`
        let arr = buckets.get(key)
        if (!arr) {
          arr = []
          buckets.set(key, arr)
        }
        arr.push(i)
      }
      ctx.lineWidth = 1
      for (let i = 0; i < dots.length; i++) {
        // drift runs purely horizontal — a vertical crawl reads as a
        // tilted camera, and this camera sits dead level
        let dx = ((dots[i].x + off) % w + w) % w
        let dy = dots[i].y
        // level cylinder: flanks squeeze toward center, horizon untouched
        const nc = (dx - w / 2) / (w / 2)
        dx -= curveLive * nc * Math.abs(nc)
        // centered wrap: crown lifts, floor drops, equator never moves
        const nl = (dy - h / 2) / (h / 2)
        dy += curveLive * nl * Math.abs(nl)
        // spatial warp: the lattice yields around the pointer like fabric,
        // lines stretch with it since they join the displaced dots
        let mdx = dx - sm.x
        let mdy = dy - sm.y
        let md = Math.hypot(mdx, mdy)
        if (md < 260 && md > 0.001) {
          const fall = 1 - md / 260
          const push = fall * fall * 26
          dx += (mdx / md) * push
          dy += (mdy / md) * push
          mdx = dx - sm.x
          mdy = dy - sm.y
          md = Math.hypot(mdx, mdy)
        }
        const near = Math.max(0, 1 - md / 220)
        const hx = Math.max(0, Math.min(gw - 1, Math.floor(dx / CELL)))
        const hy = Math.max(0, Math.min(gh - 1, Math.floor(dy / CELL)))
        const hh = Math.min(1, heat[hy * gw + hx])
        // cylinder shading (index only): rims fall into shadow so the
        // wrap reads even in a still — pure alpha, symmetric, zero tilt
        const shade = xs.route === 'enter' ? 1 - 0.4 * (nc * nc + nl * nl) : 1
        const a = Math.min(1, (0.1 + near * 0.5 + boost * 0.2 + hh * 0.9) * shade)
        const hr = Math.round(156 + 99 * hh)
        const hg2 = Math.round(245 - 31 * hh)
        const hb = Math.round(211 - 41 * hh)
        ctx.fillStyle = `rgba(${hr},${hg2},${hb},${a.toFixed(3)})`
        // ignited nodes swell slightly — the wave reads as alive
        const ds = hh > 0.4 ? 3 : 2
        ctx.fillRect(dx - 1, dy - 1, ds, ds)
        const cx = Math.floor(dots[i].x / cell)
        const cy = Math.floor(dots[i].y / cell)
        // checker-stride the line pass: halves strokes/frame, invisible at 0.16 alpha
        if ((i & 1) === 0) {
          for (let gx = cx - 1; gx <= cx + 1; gx++) {
            for (let gy = cy - 1; gy <= cy + 1; gy++) {
              const arr = buckets.get(`${gx},${gy}`)
              if (!arr) continue
              for (const j of arr) {
                if (j <= i) continue
                const ox = ((dots[j].x + off) % w + w) % w
                const npc = (ox - w / 2) / (w / 2)
                const oy = dots[j].y
                const oxc = ox - curveLive * npc * Math.abs(npc)
                const nyc = (oy - h / 2) / (h / 2)
                const oyc = oy + curveLive * nyc * Math.abs(nyc)
                let ddx = Math.abs(oxc - dx)
                let ddy = Math.abs(oyc - dy)
                ddx = Math.min(ddx, w - ddx)
                ddy = Math.min(ddy, h - ddy)
                const d = Math.hypot(ddx, ddy)
              if (d < linkDist && d > 4) {
                const oxh = Math.max(0, Math.min(gw - 1, Math.floor(oxc / CELL)))
                const oyh = Math.max(0, Math.min(gh - 1, Math.floor(oyc / CELL)))
                const have = (hh + Math.min(1, heat[oyh * gw + oxh])) / 2
                const la = Math.min(0.85, (1 - d / linkDist) * 0.16 * (0.5 + near + boost * 0.5) * (1 + have * 3) * shade)
                ctx.strokeStyle =
                  have > 0.15
                    ? `rgba(255,214,170,${la.toFixed(3)})`
                    : `rgba(156,245,211,${la.toFixed(3)})`
                  ctx.beginPath()
                  ctx.moveTo(dx, dy)
                  ctx.lineTo(oxc, oyc)
                  ctx.stroke()
                }
              }
            }
          }
        }
      }
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', kick)
      window.removeEventListener('wheel', kick)
      window.removeEventListener('scroll', kick)
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="graph-fixed" aria-hidden="true" />
}
