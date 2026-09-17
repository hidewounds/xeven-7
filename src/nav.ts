import type { Route } from './app/store'

/* Single navigation model — TopBar, RulerBar, mobile menu, and footer all
   render from here, so labels, order, and targets can never drift apart. */

export interface NavLink {
  to: Route
  label: string
  /** compact label for the ruler inch */
  short: string
}

export const NAV_LINKS: NavLink[] = [
  { to: 'enter', label: 'Home', short: 'Top' },
  { to: 'about', label: 'About', short: 'About' },
  { to: 'features', label: 'Features', short: 'Features' },
  { to: 'pricing', label: 'Pricing', short: 'Pricing' },
  { to: 'demo', label: 'Book a demo', short: 'Demo' },
]

/** Primary links excluding Home (used by inline menus). */
export const MENU_LINKS: NavLink[] = NAV_LINKS.filter((l) => l.to !== 'enter')
