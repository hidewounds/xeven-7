import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* SiteFooter — wordmark yield, studio inbox, route index. */

export default function SiteFooter({ route }: { route: Route }) {
  return (
    <footer className="sitefoot">
      <div className="foot-grid">
        <div>
          <p className="foot-mark">XEVEN</p>
          <nav className="foot-nav" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <a
                key={l.to}
                href={`#/${l.to}`}
                onClick={(e) => {
                  e.preventDefault()
                  navBus.go?.(l.to)
                }}
                aria-current={route === l.to ? 'page' : undefined}
              >
                {l.label.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <p className="mono" style={{ margin: '0 0 var(--s16)' }}>NIGHT SHIFT — ALWAYS ON</p>
          <a className="foot-mail" href="mailto:hello@xeven.world">
            HELLO@XEVEN.WORLD
          </a>
        </div>
      </div>
    </footer>
  )
}
