import { useState } from 'react'
import { MENU_LINKS } from '../nav'
import { navigate } from '../app/store'
import type { Route } from '../app/store'

/* Site footer — one shared departure rendered on every route: brand,
   product/start columns from the single nav model, trial CTA, email,
   auto year. Professional close instead of a dead end. */

export default function SiteFooter({ route }: { route: Route }) {
  const [year] = useState(() => new Date().getFullYear())
  return (
    <footer className="sitefoot">
      <div className="sitefoot-mega" aria-hidden="true">
        XEVEN
      </div>
      <div className="sitefoot-grid">
        <div>
          <p className="mono">XEVEN</p>
          <p className="sitefoot-tag">AI employee that changes business.</p>
          <button className="pill" onClick={() => navigate('demo')} data-cursor>
            Start free trial →
          </button>
        </div>
        <nav aria-label="Footer">
          <p className="mono">PRODUCT</p>
          {MENU_LINKS.filter((l) => l.to !== 'demo').map((l) => (
            <button
              key={l.to}
              className={route === l.to ? 'sitefoot-link is-here' : 'sitefoot-link'}
              onClick={() => navigate(l.to)}
              data-cursor
            >
              {l.label}
            </button>
          ))}
          <a className="sitefoot-link" href="/architecture.html" data-cursor>
            Architecture
          </a>
        </nav>
        <div>
          <p className="mono">START</p>
          <button className="sitefoot-link" onClick={() => navigate('demo')} data-cursor>
            Book a demo
          </button>
          <a className="sitefoot-link" href="mailto:hello@xeven.world" data-cursor>
            hello@xeven.world
          </a>
        </div>
      </div>
      <p className="mono sitefoot-base">© {year} XEVEN · 14-DAY FREE TRIAL · CANCEL IN ONE CLICK</p>
    </footer>
  )
}
