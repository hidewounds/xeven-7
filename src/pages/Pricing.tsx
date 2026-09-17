import { navigate } from '../app/store'
import { ADDONS, PLANS, PRODUCT } from '../data/product'

/* /pricing — the four plans plus add-ons. Prices follow
   pricing-config.js (see src/data/product.ts). */

export default function Pricing() {
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
            <h3>{t.n}</h3>
            <div className="tier-price">{t.p}</div>
            <p className="mono">{t.setup}</p>
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
    </div>
  )
}
