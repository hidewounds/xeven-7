import { useEffect, useRef, useState } from 'react'
import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* TopBar — mark left ONLY, everything else right: nav, CTA, burger. */

export default function TopBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const burger = useRef<HTMLButtonElement>(null!)
  const go = (to: Route) => {
    setOpen(false)
    navBus.go?.(to)
  }

  // overlay a11y: Escape closes, background scroll locks, focus moves
  // into the menu on open and back to the burger on close.
  useEffect(() => {
    if (!open) return
    const btn = burger.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = document.querySelector<HTMLElement>('.mnav.open a')
    first?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      btn?.focus()
    }
  }, [open])

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
            ref={burger}
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
