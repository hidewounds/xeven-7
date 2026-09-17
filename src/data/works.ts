import { PH } from '../components/VideoCard'

/* Worlds project model — one record per motion study. These are studio
   technique pieces (discipline + study focus), not client case work:
   no clients, metrics, or testimonials are claimed anywhere. */

export interface Work {
  slug: string
  title: string
  tag: string
  sub: string
  src: string
  poster: string
}

export const WORKS: Work[] = [
  { slug: 'ink-study', title: 'Ink Study', tag: '3D', sub: 'fluid system', src: PH.ink, poster: '/posters/ink.svg' },
  { slug: 'night-passage', title: 'Night Passage', tag: 'Motion', sub: 'aerial drift', src: PH.aerial, poster: '/posters/aerial.svg' },
  { slug: 'chrome-drift', title: 'Chrome Drift', tag: '3D', sub: 'metal study', src: PH.chrome, poster: '/posters/chrome.svg' },
  { slug: 'signal-head', title: 'Signal Head', tag: 'System', sub: 'particle identity', src: PH.head, poster: '/posters/head.svg' },
  { slug: 'melt-04', title: 'Melt 04', tag: 'Motion', sub: 'heat study', src: PH.metal, poster: '/posters/metal.svg' },
  { slug: 'undertow', title: 'Undertow', tag: 'System', sub: 'current logic', src: PH.ink, poster: '/posters/undertow.svg' },
]

export const SLUGS = new Set(WORKS.map((w) => w.slug))

export const FILTERS = ['All', '3D', 'Motion', 'System']

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
