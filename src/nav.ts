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
  { to: 'enter', label: 'Shift', short: '00' },
  { to: 'worlds', label: 'Worlds', short: '01' },
  { to: 'about', label: 'About', short: '02' },
  { to: 'features', label: 'Features', short: '03' },
  { to: 'pricing', label: 'Pricing', short: '04' },
  { to: 'demo', label: 'Book a demo', short: '05' },
]
