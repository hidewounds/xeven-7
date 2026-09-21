/* Shared mutable experience store. Plain object — never React state in hot paths. */

export type Route = 'enter' | 'worlds' | 'about' | 'features' | 'pricing' | 'demo'

export interface XStore {
  route: Route
  reduced: boolean
}

export const xs: XStore = {
  route: 'enter',
  reduced: false,
}

/** Animated navigation bus — App registers the curtain-wipe version. */
export const navBus: { go?: (to: Route, query?: string) => void } = {}

/** Scroll bus — App registers Lenis stop/start/scrollTo so overlays and
   section links (menu, ruler) can drive page scroll without touching the
   Lenis instance directly. */
export const scrollBus: { stop?: () => void; start?: () => void; scrollTo?: (target: string | number) => void } = {}

export function navigate(to: Route, query?: string): void {
  const hash = query ? `#/${to}?${query}` : `#/${to}`
  if (navBus.go) navBus.go(to, query)
  else window.location.hash = hash
}

/** Query value from hashes like `#/demo?plan=growth`. */
export function hashQuery(key: string): string | null {
  const q = window.location.hash.split('?')[1]
  if (!q) return null
  return new URLSearchParams(q.split('#')[0]).get(key)
}

const KNOWN: Route[] = ['enter', 'worlds', 'about', 'features', 'pricing', 'demo']

export function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return (KNOWN.includes(h as Route) ? h : 'enter') as Route
}

/** True for non-empty unknown `#/route` hashes — the 404 case.
 * Bare fragments (`#main`, `#cursor-debug`) are in-page anchors, never
 * routes: stomping them would break the skip link and debug flags. */
export function unknownHash(): boolean {
  const hash = window.location.hash
  if (!hash.startsWith('#/')) return false
  const h = hash.replace(/^#\/?/, '').split('?')[0]
  return h !== '' && !KNOWN.includes(h as Route)
}
