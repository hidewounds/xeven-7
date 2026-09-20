import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* RulerBar — route survey instrument. Seven stops, glowing active tick,
   click-to-travel. Hidden on small screens and (via CSS) never animated
   under reduced motion. */

export default function RulerBar({ route }: { route: Route }) {
  return (
    <ol className="ruler" aria-label="Sections">
      {NAV_LINKS.map((l) => (
        <li key={l.to}>
          <button
            className={`ruler-stop${route === l.to ? ' on' : ''}`}
            aria-label={l.label}
            aria-current={route === l.to ? 'page' : undefined}
            onClick={() => navBus.go?.(l.to)}
          >
            {l.short}
          </button>
        </li>
      ))}
    </ol>
  )
}
