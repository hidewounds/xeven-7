import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* FootBar — slim fixed bar pinned to the viewport bottom on every route:
   mark left, route position center, demo CTA right. The big end-of-page
   footer is untouched; this is the persistent instrument. */

export default function FootBar({ route }: { route: Route }) {
  const idx = Math.max(
    0,
    NAV_LINKS.findIndex((l) => l.to === route),
  )
  const go = (to: Route) => navBus.go?.(to)
  return (
    <div className="footbar">
      <a
        className="footbar-mark"
        href="#/enter"
        onClick={(e) => {
          e.preventDefault()
          go('enter')
        }}
      >
        XEVEN
      </a>
      <span className="mono footbar-pos" aria-live="polite">
        {String(idx).padStart(2, '0')} / {route.toUpperCase()}
      </span>
      <a
        className="footbar-cta"
        href="#/demo"
        onClick={(e) => {
          e.preventDefault()
          go('demo')
        }}
      >
        BOOK A DEMO
      </a>
    </div>
  )
}
