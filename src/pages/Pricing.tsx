import { useState } from 'react'
import { navigate } from '../app/store'
import { ADDONS, FAQ, PLANS, PRODUCT } from '../data/nova'

/* /pricing — the four NOVA plans plus add-ons and the sourced FAQ.
   Prices follow pricing-config.js (see src/data/nova.ts). */

export default function Pricing() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="page">
      <p className="mono">PRICING — ENGAGE</p>
      <h1 className="page-title">Pay for intelligence, not seats.</h1>
      <p className="page-lede">
        {PRODUCT.trial} Yearly billing saves 20%.
      </p>
      <div className="tier-grid">
        {PLANS.map((t) => (
          <div key={t.n} className="tier" data-cursor>
            {t.tag && <p className="mono">{t.tag}</p>}
            <h3>{t.n}</h3>
            <div className="tier-price">{t.p}</div>
            <p className="mono">{t.setup}</p>
            <p>{t.d}</p>
            <ul>
              {t.f.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button className="tier-go" onClick={() => navigate('contact')} data-cursor>
              Begin with {t.n} →
            </button>
          </div>
        ))}
      </div>
      <p className="mono">ADD-ONS — EXTEND ANY PLAN</p>
      <div className="rows">
        {ADDONS.map((a) => (
          <div key={a.n} className="row">
            <div className="row-head" style={{ cursor: 'default' }}>
              <span className="row-n">{a.p}</span>
              <h3>{a.n}</h3>
              <span className="row-x" aria-hidden="true" />
            </div>
            <div className="row-body" style={{ gridTemplateRows: '1fr' }}>
              <p style={{ marginBottom: 'var(--s24)' }}>{a.d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mono">QUESTIONS</p>
      <div className="rows">
        {FAQ.map((f, i) => (
          <div key={f.q} className={open === i ? 'row open' : 'row'}>
            <button className="row-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} data-cursor>
              <span className="row-n">Q{i + 1}</span>
              <h3>{f.q}</h3>
              <span className="row-x" aria-hidden="true">
                {open === i ? '−' : '+'}
              </span>
            </button>
            <div className="row-body">
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
