import { useState } from 'react'
import { navigate } from '../app/store'
import { ADDONS, PLANS, PRODUCT, yearlyTotal } from '../data/product'

/* /pricing — the four plans with a monthly/yearly toggle (yearly saves
   20% and setup goes free, per the pricing toggle and checkout), plus
   add-ons. Prices follow pricing-config.js (see src/data/product.ts). */

type Cycle = 'm' | 'y'

export default function Pricing() {
  const [cycle, setCycle] = useState<Cycle>('m')
  return (
    <div className="page">
      <p className="mono">PRICING — PLANS</p>
      <h1 className="page-title">Pay for intelligence, not seats.</h1>
      <p className="page-lede">
        {PRODUCT.trial} {cycle === 'y' ? 'Yearly billing saves 20% — setup free.' : 'Switch to yearly and save 20% — setup free.'}
      </p>
      <div className="pills" role="group" aria-label="Billing period">
        {(['m', 'y'] as const).map((c) => (
          <button
            key={c}
            className={cycle === c ? 'pill' : 'pill pill-ghost'}
            aria-pressed={cycle === c}
            data-cursor
            onClick={() => setCycle(c)}
          >
            {c === 'm' ? 'Monthly' : 'Yearly · −20%'}
          </button>
        ))}
      </div>
      <div className="tier-grid">
        {PLANS.map((t) => (
          <div key={t.n} className="tier" data-cursor>
            <h3>{t.n}</h3>
            <div className="tier-price">
              {t.m === null ? 'Custom' : cycle === 'm' ? `$${t.m}/mo` : `$${yearlyTotal(t.m)}/yr`}
            </div>
            <p className="mono">
              {t.setup === null ? 'bespoke setup' : cycle === 'm' ? `+ $${t.setup} setup` : 'setup free ✓'}
            </p>
            <ul>
              {t.inc.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
              {t.exc.map((f) => (
                <li key={f} className="tier-na">
                  — {f}
                </li>
              ))}
            </ul>
            <button
              className="tier-go"
              onClick={() => navigate('demo', t.m === null ? undefined : `plan=${t.n.toLowerCase()}`)}
              data-cursor
            >
              {t.m === null ? 'Book a call' : cycle === 'm' ? 'Start trial →' : 'Start yearly →'}
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
