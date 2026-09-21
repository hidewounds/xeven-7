import { useState } from 'react'
import { ADDONS, PLANS, PRODUCT, TRIAL, yearlyTotal } from '../data/product'
import { navigate, useRouteReady } from '../app/store'
import { useMagnetic } from '../useMagnetic'

/* PRICING — monthly/yearly arithmetic straight from the single source of
   truth, add-ons, trial banner. Tier cards carry the magnetic pull. */

export default function Pricing() {
  useRouteReady()
  const [yearly, setYearly] = useState(false)
  const mag = useMagnetic<HTMLDivElement>()

  return (
    <div className="page">
      <p className="mono">PRICING — WHAT THE SHIFT COSTS</p>
      <h1 className="page-title">One employee, four wages.</h1>
      <div className="bill-toggle" role="group" aria-label="Billing period">
        <button
          className={yearly ? 'pill pill-ghost' : 'pill'}
          aria-pressed={!yearly}
          data-cursor
          onClick={() => setYearly(false)}
        >
          Monthly
        </button>
        <button
          className={yearly ? 'pill' : 'pill pill-ghost'}
          aria-pressed={yearly}
          data-cursor
          onClick={() => setYearly(true)}
        >
          Yearly −20%
        </button>
      </div>
      <p className="mono" style={{ alignSelf: 'flex-start' }}>
        {TRIAL.lede} {PRODUCT.trial}
      </p>
      <div className="tier-grid">
        {PLANS.map((p) => (
          <div key={p.n} ref={p.n === 'Growth' ? mag : undefined} className={`tier${p.n === 'Growth' ? ' hot' : ''}`}>
            <h3>{p.n}</h3>
            <p className="tier-price">
              {p.m === null
                ? 'BESPOKE'
                : yearly
                  ? `$${yearlyTotal(p.m)}/YR — SETUP FREE`
                  : `$${p.m}/MO${p.setup ? ` + $${p.setup} SETUP` : ''}`}
            </p>
            <ul>
              {p.inc.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
              {p.exc.map((f) => (
                <li key={f} className="no">✕ {f}</li>
              ))}
            </ul>
            <div>
              <button
                className={p.n === 'Growth' ? 'pill' : 'pill pill-ghost'}
                data-cursor
                onClick={() => navigate('demo', `plan=${p.n.toLowerCase()}`)}
              >
                Begin with {p.n} →
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mono">ADD-ONS</p>
      <div className="tier-grid">
        {ADDONS.map((a) => (
          <div key={a.n} className="tier">
            <h3 style={{ fontSize: 24 }}>{a.n}</h3>
            <p className="tier-price">{a.p.toUpperCase()}</p>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{a.d}</p>
          </div>
        ))}
      </div>
      <div className="tier hot" style={{ marginTop: 'var(--s16)' }}>
        <p className="mono">{TRIAL.kicker}</p>
        <h3>{TRIAL.title}</h3>
        <p style={{ color: 'var(--muted)', margin: 0 }}>{TRIAL.lede}</p>
        <div>
          <button className="pill" data-cursor onClick={() => navigate('demo')}>
            Start the trial →
          </button>
        </div>
      </div>
    </div>
  )
}
