import { useState } from 'react'
import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* TopBar — mark left ONLY, everything else right: nav, CTA, burger. */

export default function TopBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const go = (to: Route) => {
    setOpen(false)
    navBus.go?.(to)
  }

  return (
    <>
      <header className="tb">
        <a
          className="tb-logo"
          href="#/enter"
          onClick={(e) => {
            e.preventDefault()
            go('enter')
          }}
        >
          XEVEN
        </a>
        <div className="tb-right">
          <nav className="tb-nav" aria-label="Primary">
            {NAV_LINKS.filter((l) => l.to !== 'enter' && l.to !== 'demo').map((l) => (
              <a
                key={l.to}
                href={`#/${l.to}`}
                className={route === l.to ? 'active' : ''}
                aria-current={route === l.to ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.to)
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            className="tb-cta"
            href="#/demo"
            onClick={(e) => {
              e.preventDefault()
              go('demo')
            }}
          >
            BOOK A DEMO
          </a>
          <button
            className={`tb-burger${open ? ' open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </button>
        </div>
      </header>
      <nav className={`mnav${open ? ' open' : ''}`} aria-label="Menu" aria-hidden={!open}>
        {NAV_LINKS.map((l) => (
          <a
            key={l.to}
            href={`#/${l.to}`}
            className={route === l.to ? 'active' : ''}
            tabIndex={open ? 0 : -1}
            onClick={(e) => {
              e.preventDefault()
              go(l.to)
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </>
  )
}
