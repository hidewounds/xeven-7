/* Shared mutable scroll/GL bridge. Plain object mutated in rAF/ScrollTrigger
   callbacks — never React state, so the 60fps path never re-renders. */
export type BgState = {
  progress: number
  velocity: number
  active: number
  pulse: number
  hero: number
  mode: 'home' | 'inner'
}

export function freshBg(): BgState {
  return { progress: 0, velocity: 0, active: 0, pulse: 0, hero: 0, mode: 'home' }
}
