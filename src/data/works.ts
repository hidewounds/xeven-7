import { WORLDS } from './nova'

/* Worlds project model — the three live NOVA demo worlds. These are real
   external interactive builds (nova-web/worlds); cards link out, and the
   internal study route carries the worlds' own captions plus the open
   link. No clients, metrics, or testimonials are claimed anywhere. */

export { WORLDS }
export type { World } from './nova'
import type { World } from './nova'

export const SLUGS = new Set(WORLDS.map((w) => w.slug))

export const FILTERS = ['All', 'GLSL', 'Console', 'Shader']

export function workFilter(w: World, f: string): boolean {
  return f === 'All' || w.tag === f
}

/* Persisted index state so Back from a study restores filter, scroll,
   and focus instead of resetting the grid. */
const KEY = 'xeven.worlds'

export interface WorldsMemory {
  f: string
  y: number
  slug: string
}

export function saveWorldsMemory(m: WorldsMemory): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    /* private mode — restoration just won't happen */
  }
}

export function loadWorldsMemory(): WorldsMemory | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const m = JSON.parse(raw) as Partial<WorldsMemory>
    if (typeof m.y !== 'number') return null
    return {
      f: typeof m.f === 'string' ? m.f : 'All',
      y: m.y,
      slug: typeof m.slug === 'string' ? m.slug : '',
    }
  } catch {
    return null
  }
}
