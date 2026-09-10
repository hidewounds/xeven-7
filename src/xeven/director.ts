// Central cinematic configuration — every animation system reads from here.
// Master progress p in [0,1] maps to overlapping phases; no hard cuts.

export const PHASES = {
  boot: [0.0, 0.12],
  understand: [0.08, 0.25],
  memory: [0.22, 0.4],
  personal: [0.37, 0.55],
  business: [0.52, 0.7],
  patterns: [0.67, 0.82],
  arch: [0.79, 0.94],
  final: [0.92, 1.0],
} as const

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)
/** eased segment of master progress */
export const seg = (p: number, e0: number, e1: number) => smooth(clamp01((p - e0) / (e1 - e0)))

type V3 = [number, number, number]
const lerpV = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
export function pathV(p: number, keys: { at: number; v: V3 }[]): V3 {
  if (p <= keys[0].at) return keys[0].v
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].at) {
      const t = smooth((p - keys[i - 1].at) / (keys[i].at - keys[i - 1].at))
      return lerpV(keys[i - 1].v, keys[i].v, t)
    }
  }
  return keys[keys.length - 1].v
}

// Shot list: extreme wide → approach → product → macro screen → low hw →
// orbit → console interior → macro pcb → memory → full → layer travel → hero
export const CAM_POS = [
  { at: 0.0, v: [0.0, 0.8, 19.0] as V3 },
  { at: 0.1, v: [0.6, 0.6, 12.0] as V3 },
  { at: 0.22, v: [3.6, 1.2, 8.4] as V3 },
  { at: 0.34, v: [0.9, 0.7, 4.6] as V3 }, // macro screen
  { at: 0.44, v: [-2.8, -0.6, 6.4] as V3 }, // low hardware angle
  { at: 0.5, v: [0.0, 1.3, 4.4] as V3 }, // screen macro: display fills frame
  { at: 0.56, v: [0.0, 1.0, 7.2] as V3 },
  { at: 0.68, v: [-3.0, 1.6, 9.8] as V3 },
  { at: 0.78, v: [2.0, 1.0, 8.4] as V3 },
  { at: 0.88, v: [4.8, 0.4, 8.6] as V3 }, // layer travel
  { at: 1.0, v: [0.0, 0.5, 12.8] as V3 }, // quiet hero
]
export const CAM_LOOK = [
  { at: 0.0, v: [0, 0.2, 0] as V3 },
  { at: 0.22, v: [0, 0.2, 0] as V3 },
  { at: 0.34, v: [0, 1.25, 0.5] as V3 },
  { at: 0.44, v: [0, -0.7, 0.4] as V3 },
  { at: 0.5, v: [0, 1.32, 0.5] as V3 },
  { at: 0.56, v: [0, 0.6, 0.4] as V3 },
  { at: 0.68, v: [-0.4, 0.3, 0] as V3 },
  { at: 0.78, v: [0, 0.6, 0] as V3 },
  { at: 0.88, v: [0, 0.1, 0] as V3 },
  { at: 1.0, v: [0, 0.5, 0] as V3 },
]
export const DUTCH: { at: number; v: number }[] = [
  { at: 0.0, v: 0 },
  { at: 0.8, v: 0 },
  { at: 0.88, v: 0.05 },
  { at: 0.95, v: 0 },
  { at: 1.0, v: 0 },
]
export function pathS(p: number, keys: { at: number; v: number }[]): number {
  if (p <= keys[0].at) return keys[0].v
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].at) {
      const t = smooth((p - keys[i - 1].at) / (keys[i].at - keys[i - 1].at))
      return lerp(keys[i - 1].v, keys[i].v, t)
    }
  }
  return keys[keys.length - 1].v
}

/** spring integrator: returns new {x, v} with overshoot + settle */
export function spring(x: number, v: number, target: number, stiff: number, damp: number, dt: number) {
  const f = (target - x) * stiff - v * damp
  v += f * dt
  x += v * dt
  return { x, v }
}

/** console state curves — all pure functions of master progress */
export const consoleState = (p: number) => ({
  open: seg(p, 0.27, 0.35) * (1 - seg(p, 0.45, 0.52)),
  explode: seg(p, 0.83, 0.895) * (1 - seg(p, 0.945, 0.985)),
  mem: seg(p, 0.3, 0.37) * (1 - seg(p, 0.5, 0.58)) + seg(p, 0.84, 0.9) * 0.7,
  core: seg(p, 0.82, 0.9),
  scale: lerp(lerp(0.55, 1.45, seg(p, 0.03, 0.18)), 1.0, seg(p, 0.72, 0.94)),
  yawBase:
    lerp(0.5, -0.35, seg(p, 0.1, 0.25)) +
    lerp(0, 0.55, seg(p, 0.5, 0.62)) +
    lerp(0, 0.5, seg(p, 0.66, 0.78)),
  posX: lerp(2.5, 0, seg(p, 0.12, 0.22)),
})

/** lighting choreography: [key, rim, screen, internal] */
export const lightState = (p: number): [number, number, number, number] => [
  lerp(0.2, 1.9, seg(p, 0.04, 0.18)),
  lerp(0.4, 2.6, seg(p, 0.0, 0.12)) + seg(p, 0.82, 0.9) * 0.8,
  lerp(0.4, 1.6, seg(p, 0.06, 0.2)) + seg(p, 0.4, 0.5) * 1.6,
  seg(p, 0.28, 0.36) * 2.2 + seg(p, 0.82, 0.9) * 2.4,
]

/** particle behavior weights: [flow, ring(structure), velocityBoost] */
export const particleState = (p: number, vel: number): [number, number, number] => {
  const flow = Math.max(seg(p, 0.1, 0.18) * (1 - seg(p, 0.5, 0.6)), seg(p, 0.8, 0.87))
  const ring = seg(p, 0.82, 0.88) * (1 - seg(p, 0.93, 0.97))
  return [flow, ring, Math.min(1, Math.abs(vel) * 0.06)]
}

export const PERF = {
  high: { dpr: 1.75 as const, particles: 1400, bloom: true },
  medium: { dpr: 1.25 as const, particles: 800, bloom: true },
  low: { dpr: 1 as const, particles: 350, bloom: false },
} as const
export type PerfTier = keyof typeof PERF
