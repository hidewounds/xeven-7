import { useState } from 'react'
import { ADDONS, PLANS, PRODUCT, TRIAL, yearlyTotal } from '../data/product'
import { navigate } from '../app/store'
import { useMagnetic } from '../useMagnetic'
import Reveal from '../components/Reveal'

/* WAGES — a configurator, not a table. Tell it your volume and it points
   at your tier. Arithmetic straight from the single source of truth. */

function tierForVolume(v: number): string {
  if (v <= 1000) return 'Launch'
  if (v <= 10000) return 'Growth'
  return 'Scale'
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const [volume, setVolume] = useState(10000)
  const mag = useMagnetic<HTMLDivElement>()
  const pick = tierForVolume(volume)

  return (
    <div className="page">
      <Reveal>
        <p className="mono">WAGES — WHAT THE SHIFT COSTS</p>
        <h1 className="page-title">One employee, four wages.</h1>
        <p className="page-lede">
          {TRIAL.lede} {PRODUCT.trial} Yearly billing is 20% off — setup free.
        </p>
      </Reveal>

      <Reveal>
        <div className="kb-demo" aria-label="Wage configurator">
          <p className="mono" style={{ margin: '0 0 var(--s12)' }}>
            HOW MANY CONVERSATIONS A MONTH?
          </p>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Monthly conversations"
            aria-valuetext={`${volume.toLocaleString('en-US')} conversations — ${pick}`}
            style={{ accentColor: 'var(--glow)' }}
          />
          <p className="kb-hit" role="status">
            <b>{volume.toLocaleString('en-US')}</b> conversations — your wage is <b>{pick}</b>
            {pick === 'Scale' && volume >= 50000 ? ' (or Custom, for bespoke).' : '.'}
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="bill-toggle" role="group" aria-label="Billing period">
          <button
            className={yearly ? 'pill pill-ghost' : 'pill'}
            aria-pressed={!yearly}
            data-cursor="MO"
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            className={yearly ? 'pill' : 'pill pill-ghost'}
            aria-pressed={yearly}
            data-cursor="YR"
            onClick={() => setYearly(true)}
          >
            Yearly −20%
          </button>
        </div>
      </Reveal>

      <div className="tier-grid">
        {PLANS.map((p) => (
          <Reveal key={p.n}>
            <div
              ref={p.n === 'Growth' ? mag : undefined}
              className={`tier${p.n === pick || (p.n === 'Growth' && pick === 'Growth') ? ' hot' : ''}${p.n === 'Growth' ? ' hot' : ''}`}
            >
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
                  data-cursor="BOOK"
                  onClick={() => navigate('demo', `plan=${p.n.toLowerCase()}`)}
                >
                  Begin with {p.n} →
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mono">ADD-ONS</p>
        <div className="tier-grid">
          {ADDONS.map((a) => (
            <div key={a.n} className="tier">
              <h3 style={{ fontSize: 24 }}>{a.n}</h3>
              <p className="tier-price">{a.p.toUpperCase()}</p>
              <p className="wage-note">{a.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="tier hot">
          <p className="mono">{TRIAL.kicker}</p>
          <h3>{TRIAL.title}</h3>
          <p className="wage-note">{TRIAL.lede}</p>
          <div>
            <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>
              Start the trial →
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
