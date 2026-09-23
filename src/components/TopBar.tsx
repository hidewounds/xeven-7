import { useEffect, useRef, useState } from 'react'
import { NAV_LINKS } from '../nav'
import { navBus } from '../app/store'
import type { Route } from '../app/store'

/* TopBar — mark left ONLY, everything else right: nav, CTA, burger.
   Fullscreen staggered menu on small screens. */

export default function TopBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const burger = useRef<HTMLButtonElement>(null!)
  const go = (to: Route) => {
    setOpen(false)
    navBus.go?.(to)
  }

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
          data-cursor="SHIFT"
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
                data-cursor="GO"
                onClick={(e) => {
                  e.preventDefault()
                  go(l.to)
                }}
              >
                <span>{l.label}</span>
                <small aria-hidden="true">{l.to === 'worlds' ? 'situations' : l.to === 'about' ? 'why it works' : l.to === 'features' ? 'capabilities' : l.to === 'pricing' ? 'plans' : ''}</small>
              </a>
            ))}
          </nav>
          <a
            className="tb-cta"
            href="#/demo"
            data-cursor="BOOK"
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
            <span>{l.label}</span>
            <small>{l.to === 'enter' ? 'Start here' : l.to === 'worlds' ? 'See the situations' : l.to === 'about' ? 'Why it works' : l.to === 'features' ? 'Product capabilities' : l.to === 'pricing' ? 'Plans and pricing' : 'Talk to the team'}</small>
          </a>
        ))}
      </nav>
    </>
  )
}
