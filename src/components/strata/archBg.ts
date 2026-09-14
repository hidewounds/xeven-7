/* STRATA arch-field — XEVEN background lineage (ported from G:\mocks\background,
 * mock 01, then hardened for the repo).
 *
 * A high-fps monochrome display surface: void sheet, linework only. The 45°
 * diamond lattice is printed on a sheet bowed into a convex cylinder at 0
 * degrees — vertical bow axis, centre bulging toward you, flanks falling
 * away. Rails stay 45° true while positions breathe with the bow exactly
 * like print on a real curved sheet.
 *
 * Each 4x4 square is a black panel in a bold black shared mesh with a faint
 * white shimmer breathing inside. A roaming cast of panels plays live cinema
 * clipped inside them — scan, hatch, chevrons, rarely the name — on a slow
 * 7s phase clock. All vector-crisp at any DPR including 4K.
 *
 * Locked (from the mock, kept): the sheet never follows the cursor — no
 * drift, no pull, no velocity kick. It renders oversized and stays parked.
 * The cursor is a shapeless blob: energy follows motion intensity, never
 * position — in movement an irregular mass with no boundary, on stop it
 * drains away completely. Native cursor stays native, always.
 *
 * Repo adaptations (improvements over the mock):
 * - base sheet is void #06090f (not pure black) so the canvas melts into the
 *   page; the black mesh still carves panels out of it.
 * - micro-fractures are mint (house law: no purple anywhere).
 * - showcase tier: index runs the full convex bow + full glow; subpages run
 *   flat + half glow (wrapper rebuilds on hash change).
 * - scroll-velocity kindle: fast scrolls stir the field via xs.vel (decayed
 *   in-frame, mirroring the old lattice feel).
 * - idle sleep at 6s without input/agitation (last frame persists, zero
 *   ticker burn); wakes on pointer/wheel/scroll/click.
 * - hidden-tab pause (dt clamp alone would survive it, but sleeping saves
 *   the battery for real).
 * - static layers baked once per resize into offscreen canvases; frames are
 *   blits + low-alpha fills. `motion: false` / reduced-motion = one clean
 *   static frame, zero rAF. Adaptive DPR sheds before frames do.
 */

import { xs } from '../../app/store'
import { initStrataPointer, strataPointer } from './strataPointer'
import { CursorBlob } from './blob'

export interface StrataOpts {
  grid: boolean
  micro: boolean
  quads: boolean
  plus: boolean
  motion: boolean
  showcase: boolean
}

export const defaultStrataOpts: StrataOpts = {
  grid: true,
  micro: true,
  quads: true,
  plus: true,
  motion: true,
  showcase: true,
}

export interface StrataStats {
  cells: number
  dpr: number
  gap: number
}

const VOID = '#06090f'
const QUAD = 4
const MICRO = 5
const OCT = 8
const QUAD_INSET = 1 // frames sit almost on the block boundary: neighbours
// merge into one bold shared mesh that swallows the grid line beneath
const PLUS_ARM = 8
const TURN = Math.PI / 4 // whole field rotated 45 degrees
const TRACE_STEP = 14 // source px between warp samples: curves stay smooth
const PAD = 48 // overscan px per side: keeps rotated field full-bleed
const IDLE_MS = 6000

interface QuadPoly {
  cx: number // centroid x: wave phase follows the bow axis
  cy: number
  pts: Array<[number, number]> // inset ring (corners only — fills stay cheap)
  qi: number // tiling indices — drive the roaming animation cast
  qj: number
}

export function createStrataBg(
  canvas: HTMLCanvasElement,
  opts: StrataOpts,
  onStats: (s: StrataStats) => void,
  onFps?: (fps: number) => void,
): () => void {
  const ctx0 = canvas.getContext('2d')
  if (!ctx0) return () => undefined
  const ctx: CanvasRenderingContext2D = ctx0
  initStrataPointer()

  const coarse =
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const live = opts.motion && !reduced

  let dpr = 1
  let dprCap = coarse ? 1.25 : 2 // 4K-crisp vector layers, adaptive sheds
  let w = 0 // viewport (bow shape uses these)
  let h = 0
  let cw = 0 // oversized canvas (covers viewport for rotated field)
  let ch = 0
  let gap = 32
  let n = 0 // source cells across the field (multiple of 8)
  let m = 0 // source cells down the field (multiple of 8)
  let uMin = 0 // field rect bounds (u along the diagonal rails)
  let uMax = 0
  let vMin = 0 // v across them
  let vMax = 0
  let stepU = 0
  let stepV = 0
  let curve = 0 // cylinder strength, positive = convex bulge (centre near)
  let cylS = 1 // renormalization keeping both screen edges pinned
  let glowScale = 1 // subpages run dimmer so copy owns the frame
  let quads: QuadPoly[] = []
  let baseC: HTMLCanvasElement | null = null
  let lineC: HTMLCanvasElement | null = null
  let raf = 0
  const blob = new CursorBlob()

  // field basis (rotated 45 deg) + cylinder warp, rebuilt per resize
  let cX = 0
  let cY = 0
  let eXx = 0
  let eXy = 0
  let eYx = 0
  let eYy = 0

  // straight 45-degree field printed on a 0-degree convex sheet:
  // rotate about the canvas centre, then draw x toward the centre
  // (positive curve: bulge at centre, renormalized so both viewport edges
  // stay pinned). Diagonal rails keep their 45° character; positions
  // breathe with the bow exactly like print on a real curved sheet.
  const warp = (u: number, v: number): [number, number] => {
    const px = cX + u * eXx + v * eYx
    const py = cY + u * eXy + v * eYy
    const nx = (px - cX) / (w / 2)
    const raw = px - curve * nx * Math.abs(nx)
    return [(raw - curve) * cylS, py]
  }

  // trace a field-space segment as a warp-following polyline
  const trace = (
    u0: number,
    v0: number,
    u1: number,
    v1: number,
  ): Array<[number, number]> => {
    const span = Math.hypot(u1 - u0, v1 - v0)
    const k = Math.max(1, Math.ceil(span / TRACE_STEP))
    const pts: Array<[number, number]> = []
    for (let i = 0; i <= k; i++) {
      const t = i / k
      pts.push(warp(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t))
    }
    return pts
  }

  const strokePts = (
    g: CanvasRenderingContext2D,
    pts: Array<[number, number]>,
    close: boolean,
  ) => {
    if (pts.length === 0) return
    g.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1])
    if (close) g.closePath()
  }

  const fieldU = (i: number): number => uMin + i * stepU
  const fieldV = (j: number): number => vMin + j * stepV

  // quad inset ring (corners only) + centroid, in canvas px
  const quadRing = (
    u0: number,
    u1: number,
    v0: number,
    v1: number,
  ): Omit<QuadPoly, 'qi' | 'qj'> => {
    const corners: Array<[number, number]> = [
      warp(u0, v0),
      warp(u1, v0),
      warp(u1, v1),
      warp(u0, v1),
    ]
    const cx = (corners[0][0] + corners[2][0]) / 2
    const cy = (corners[0][1] + corners[2][1]) / 2
    const pts = corners.map(([px, py]): [number, number] => {
      const vx = px - cx
      const vy = py - cy
      const len = Math.hypot(vx, vy) || 1
      const pull = Math.min(QUAD_INSET, len * 0.4)
      return [px - (vx / len) * pull, py - (vy / len) * pull]
    })
    return { cx, cy, pts }
  }

  // static layer 1: void panel — the canvas melts into the page
  const paintBase = (g: CanvasRenderingContext2D) => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
    g.fillStyle = VOID
    g.fillRect(0, 0, cw, ch)
  }

  // static layer 2: the full crisp linework (transparent background)
  const paintLines = (g: CanvasRenderingContext2D) => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.globalCompositeOperation = 'source-over'
    g.clearRect(0, 0, cw, ch)
    if (opts.grid) {
      g.lineWidth = 1
      g.strokeStyle = '#ffffff'
      g.globalAlpha = 0.16
      g.beginPath()
      for (let i = 0; i <= n; i++) {
        strokePts(g, trace(fieldU(i), vMin, fieldU(i), vMax), false)
      }
      for (let j = 0; j <= m; j++) {
        strokePts(g, trace(uMin, fieldV(j), uMax, fieldV(j)), false)
      }
      g.stroke()
    }
    if (opts.micro) {
      g.lineWidth = 1
      g.strokeStyle = 'rgba(156,245,211,0.7)' // mint fractures, never purple
      g.globalAlpha = 0.12
      g.beginPath()
      for (let i = 0; i < n; i++) {
        const a = fieldU(i)
        const b = fieldU(i + 1)
        for (let k = 1; k < MICRO; k++) {
          const u = a + ((b - a) * k) / MICRO
          strokePts(g, trace(u, vMin, u, vMax), false)
        }
      }
      for (let j = 0; j < m; j++) {
        const a = fieldV(j)
        const b = fieldV(j + 1)
        for (let k = 1; k < MICRO; k++) {
          const v = a + ((b - a) * k) / MICRO
          strokePts(g, trace(uMin, v, uMax, v), false)
        }
      }
      g.stroke()
    }
    if (opts.quads) {
      g.lineWidth = 6
      g.strokeStyle = '#000000' // bold black shared mesh, carved out of void
      g.globalAlpha = 1
      g.beginPath()
      for (const q of quads) {
        g.moveTo(q.pts[0][0], q.pts[0][1])
        for (let i = 1; i < q.pts.length; i++) {
          g.lineTo(q.pts[i][0], q.pts[i][1])
        }
        g.closePath()
      }
      g.stroke()
    }
    if (opts.plus) {
      g.lineWidth = 1
      g.strokeStyle = '#ffffff'
      g.globalAlpha = 0.9
      const ax = PLUS_ARM * Math.SQRT1_2
      g.beginPath()
      for (let aj = 0; aj <= m / OCT; aj++) {
        for (let ai = 0; ai <= n / OCT; ai++) {
          const [pdx, pdy] = warp(fieldU(ai * OCT), fieldV(aj * OCT))
          g.moveTo(pdx - ax, pdy - ax)
          g.lineTo(pdx + ax, pdy + ax)
          g.moveTo(pdx - ax, pdy + ax)
          g.lineTo(pdx + ax, pdy - ax)
        }
      }
      g.stroke()
    }
    g.globalAlpha = 1
  }

  const build = () => {
    dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    w = Math.max(1, window.innerWidth)
    h = Math.max(1, window.innerHeight)
    cw = w + PAD * 2
    ch = h + PAD * 2
    const area = w * h
    gap = area > 2500000 ? 36 : area > 1400000 ? 32 : 28

    // overscan: square field spanning the rotated viewport diagonal,
    // so every edge stays covered while parked.
    const diagHalf = (w + h) / (2 * Math.SQRT2)
    const uHalf = diagHalf + gap * 4 + PAD * 2
    uMin = -uHalf
    uMax = uHalf
    vMin = -uHalf
    vMax = uHalf
    // showcase runs the full convex bow (you are the centre of the
    // cylinder); subpages run flat so copy owns the frame.
    curve = opts.showcase ? Math.min(260, h * 0.22, w * 0.13) : 0
    cylS = w / Math.max(1, w - 2 * curve)
    glowScale = opts.showcase ? 1 : 0.5

    n = Math.max(OCT, Math.round((uMax - uMin) / gap / OCT) * OCT)
    m = Math.max(OCT, Math.round((vMax - vMin) / gap / OCT) * OCT)
    stepU = (uMax - uMin) / n
    stepV = (vMax - vMin) / m

    cX = cw / 2
    cY = ch / 2
    const c = Math.cos(TURN)
    const s = Math.sin(TURN)
    eXx = c
    eXy = s
    eYx = -s
    eYy = c

    canvas.width = Math.floor(cw * dpr)
    canvas.height = Math.floor(ch * dpr)
    canvas.style.width = `${cw}px`
    canvas.style.height = `${ch}px`
    canvas.style.left = `${-PAD}px`
    canvas.style.top = `${-PAD}px`
    canvas.style.transform = ''

    // animation polygons follow the exact quad tiling (multiples of 8)
    quads = []
    if (opts.quads) {
      for (let qj = 0; qj < m / QUAD; qj++) {
        for (let qi = 0; qi < n / QUAD; qi++) {
          quads.push({
            ...quadRing(
              fieldU(qi * QUAD),
              fieldU(qi * QUAD + QUAD),
              fieldV(qj * QUAD),
              fieldV(qj * QUAD + QUAD),
            ),
            qi,
            qj,
          })
        }
      }
    }

    // bake both static layers once — frames are pure blits + cheap fills
    if (!baseC) baseC = document.createElement('canvas')
    if (!lineC) lineC = document.createElement('canvas')
    baseC.width = canvas.width
    baseC.height = canvas.height
    lineC.width = canvas.width
    lineC.height = canvas.height
    const bg = baseC.getContext('2d')
    const lg = lineC.getContext('2d')
    if (bg) paintBase(bg)
    if (lg) paintLines(lg)
    blob.reset(cw / 2, ch / 2)

    onStats({ cells: n * m, dpr, gap })
  }

  const blit = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    if (baseC) ctx.drawImage(baseC, 0, 0, cw, ch)
    if (lineC) ctx.drawImage(lineC, 0, 0, cw, ch)
  }

  const t0 = performance.now()
  let lastT = t0
  let lastInput = t0
  // damped cursor feed: raw data in, buttery reaction out — the scene
  // eases, the cursor stays native
  let ccx = strataPointer.tx + PAD
  let ccy = strataPointer.ty + PAD
  let ecx = ccx // echo follower — the "ring" role, slower and wider
  let ecy = ccy
  let cvx = 0
  let cvy = 0
  let stir = 0
  let bloom = 0
  let ptx = strataPointer.tx
  let pty = strataPointer.ty
  let frames = 0
  let fpsMark = t0
  let fpsEma = 60
  let slowStreak = 0 // consecutive slow reports for adaptive quality

  const kick = () => {
    lastInput = performance.now()
    lastT = performance.now()
    ptx = strataPointer.tx
    pty = strataPointer.ty
    if (!live || raf || document.hidden) return
    raf = requestAnimationFrame(frame)
  }

  const poke = () => {
    lastInput = performance.now()
  }

  build()
  if (!live) {
    blit()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }

  function onResize() {
    build()
    kick()
  }

  // live: white shimmer breathing inside each black square (phase riding
  // the bow axis). The finger is a light source: cells kindle near it, a
  // slower echo trails behind like a comet tail, flicks agitate the whole
  // field, clicks bloom — but nothing ever moves positionally.
  const fract = (x: number): number => x - Math.floor(x)
  const sstep = (a: number, b: number, x: number): number => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return u * u * (3 - 2 * u)
  }

  // quiet quad cinema — a sparse few panels breathe on a slow 7s phase
  // clock, never a wall of screens. Everything draws live in device pixels
  // (vector-crisp at any DPR, 4K included) and stays clipped inside each
  // panel: a passing scan, a faint hatch, rising chevrons, rarely the name
  // running sideways.
  const paintQuadLife = (t: number) => {
    const slot = Math.floor(t / 7)
    const lp = t / 7 - slot
    for (const q of quads) {
      if ((q.qi * 7 + q.qj * 13 + slot * 5) % 89 >= 3) continue
      const hh0 = fract(
        Math.sin(q.qi * 12.9898 + q.qj * 78.233 + slot * 0.7) * 43758.5453,
      )
      const p = (lp + hh0) % 1
      const a = sstep(0, 0.3, p) * (1 - sstep(0.62, 1, p))
      if (a <= 0.01) continue
      let x0 = 1e9
      let y0 = 1e9
      let x1 = -1e9
      let y1 = -1e9
      for (const [px, py] of q.pts) {
        if (px < x0) x0 = px
        if (py < y0) y0 = py
        if (px > x1) x1 = px
        if (py > y1) y1 = py
      }
      const ww = Math.max(1, x1 - x0)
      const hhh = Math.max(1, y1 - y0)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(q.pts[0][0], q.pts[0][1])
      for (let i = 1; i < q.pts.length; i++) {
        ctx.lineTo(q.pts[i][0], q.pts[i][1])
      }
      ctx.closePath()
      ctx.clip()
      const kind = (q.qi + q.qj * 2 + slot) % 5
      if (kind === 0) {
        // scan — a dim line drifting down the panel + faint echo
        const sy = y0 + hhh * fract(t * 0.3 + hh0)
        ctx.lineWidth = 1.5
        ctx.strokeStyle = `rgba(255,255,255,${(0.32 * a).toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(x0, sy)
        ctx.lineTo(x1, sy)
        ctx.stroke()
        ctx.strokeStyle = `rgba(255,255,255,${(0.09 * a).toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(x0, sy - 9)
        ctx.lineTo(x1, sy - 9)
        ctx.stroke()
      } else if (kind === 1 || kind === 3) {
        // hatch — barely-there diagonal weave breathing in the panel
        const ha = (0.06 + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.4 + hh0 * 9))) * a
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(255,255,255,${ha.toFixed(3)})`
        ctx.beginPath()
        for (let d = -hhh; d < ww + hhh; d += ww / 3) {
          ctx.moveTo(x0 + d, y1)
          ctx.lineTo(x0 + d + hhh, y0)
        }
        ctx.stroke()
      } else if (kind === 2) {
        // chevrons — small marks rising slowly, dissolving at the top
        const s = Math.min(ww, hhh) * 0.24
        const cxp = (x0 + x1) / 2
        ctx.lineWidth = 1.5
        for (let cxi = 0; cxi < 2; cxi++) {
          const f2 = fract(t * 0.22 + hh0 + cxi * 0.5)
          const yy = y1 - f2 * hhh
          const aa = a * (1 - f2) * 0.5
          if (aa <= 0.01) continue
          ctx.strokeStyle = `rgba(255,255,255,${aa.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(cxp - s, yy + s * 0.5)
          ctx.lineTo(cxp, yy - s * 0.5)
          ctx.lineTo(cxp + s, yy + s * 0.5)
          ctx.stroke()
        }
      } else {
        // name — XEVEN gliding sideways, rare by design
        const fs = hhh * 0.4
        ctx.font = `600 ${fs.toFixed(1)}px 'Space Grotesk', sans-serif`
        ctx.textBaseline = 'middle'
        const word = 'XEVEN · '
        const wTxt = Math.max(1, ctx.measureText(word).width)
        const xoff = x0 - fract(t * 0.08 + hh0) * (wTxt + ww)
        ctx.fillStyle = `rgba(255,255,255,${(0.36 * a).toFixed(3)})`
        for (let x = xoff; x < x1; x += wTxt) {
          ctx.fillText(word, x, (y0 + y1) / 2)
        }
      }
      ctx.restore()
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(50, Math.max(1, now - lastT))
    lastT = now
    // idle sleep: no input, no bloom, settled stir — the last frame
    // persists on canvas, zero ticker burn (wake via kick)
    if (now - lastInput > IDLE_MS && bloom <= 0.01 && stir <= 0.03) {
      xs.vel = 0
      cancelAnimationFrame(raf)
      raf = 0
      return
    }
    const t = (now - t0) / 1000
    // ease the cursor + velocity toward the raw feed; park when gone
    if (strataPointer.inside) {
      ccx += (strataPointer.tx + PAD - ccx) * 0.18
      ccy += (strataPointer.ty + PAD - ccy) * 0.18
      ecx += (strataPointer.tx + PAD - ecx) * 0.07
      ecy += (strataPointer.ty + PAD - ecy) * 0.07
    }
    const rvx = (strataPointer.tx - ptx) / dt
    const rvy = (strataPointer.ty - pty) / dt
    ptx = strataPointer.tx
    pty = strataPointer.ty
    cvx += (rvx - cvx) * 0.15
    cvy += (rvy - cvy) * 0.15
    const spd = Math.hypot(cvx, cvy)
    const target = strataPointer.inside ? Math.min(1, spd * 0.9) : 0
    stir += (target - stir) * 0.08
    bloom = Math.max(strataPointer.bloom, bloom * Math.pow(0.93, dt / 16.7))
    strataPointer.bloom = 0
    // scroll-velocity kindle (decayed in-frame — stale velocity never sticks)
    const vBoost = Math.min(1, xs.vel * 1.5) * 0.3
    xs.vel *= 0.9
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    if (baseC) ctx.drawImage(baseC, 0, 0, cw, ch)
    if (quads.length > 0) {
      const sig1 = 2 * 190 * 190 // finger light, σ ≈ 190px
      const sig2 = 2 * 330 * 330 // echo light, σ ≈ 330px
      const amp = 1 + stir * 0.9 + bloom * 0.6 + vBoost
      for (const q of quads) {
        const wave =
          0.03 + 0.04 * (0.5 + 0.5 * Math.sin(t * 1.5 - (q.cx * 0.0055 + q.cy * 0.0018)))
        let glow = wave * amp
        if (strataPointer.inside || bloom > 0.01) {
          const dx = q.cx - ccx
          const dy = q.cy - ccy
          glow += (0.11 + bloom * 0.1) * Math.exp(-(dx * dx + dy * dy) / sig1)
          const ex = q.cx - ecx
          const ey = q.cy - ecy
          glow += 0.045 * Math.exp(-(ex * ex + ey * ey) / sig2)
        }
        glow *= glowScale
        ctx.fillStyle = `rgba(255,255,255,${glow.toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(q.pts[0][0], q.pts[0][1])
        for (let i = 1; i < q.pts.length; i++) {
          ctx.lineTo(q.pts[i][0], q.pts[i][1])
        }
        ctx.closePath()
        ctx.fill()
      }
    }
    // roaming cinema plays inside the panels, under the mesh frames
    paintQuadLife(t)
    if (lineC) ctx.drawImage(lineC, 0, 0, cw, ch)
    // cursor blob — shapeless in motion, gone at rest
    blob.update(dt, ccx, ccy, strataPointer.inside, t, spd)
    blob.draw(ctx)
    ctx.globalAlpha = 1

    frames++
    if (onFps && now - fpsMark >= 500) {
      const fps = Math.round((frames * 1000) / (now - fpsMark))
      onFps(fps)
      frames = 0
      fpsMark = now
      // adaptive quality — shed pixel ratio before shedding frames
      fpsEma = fpsEma * 0.6 + fps * 0.4
      const maxCap = coarse ? 1.25 : 2
      if (fpsEma < 42 && dprCap > 1) {
        if (++slowStreak >= 3) {
          slowStreak = 0
          dprCap = 1
          build()
        }
      } else {
        slowStreak = 0
        if (fpsEma > 57 && dprCap < maxCap) {
          dprCap = maxCap
          build()
        }
      }
    }
  }

  const onVis = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    } else {
      kick()
    }
  }

  raf = requestAnimationFrame(frame)
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', poke, { passive: true })
  window.addEventListener('wheel', kick, { passive: true })
  window.addEventListener('scroll', kick, { passive: true })
  window.addEventListener('pointerdown', kick, { passive: true })
  document.addEventListener('visibilitychange', onVis)
  return () => {
    cancelAnimationFrame(raf)
    raf = 0
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', poke)
    window.removeEventListener('wheel', kick)
    window.removeEventListener('scroll', kick)
    window.removeEventListener('pointerdown', kick)
    document.removeEventListener('visibilitychange', onVis)
  }
}
