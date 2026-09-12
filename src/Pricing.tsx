import { useState } from 'react'
import { ADDONS, PLANS, TRUSTLINE, yearlyTotal } from './data'
import { CtaBand, Fade, Rise } from './fx'

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  return (
    <>
      <section className="sec" style={{ paddingTop: '22vh' }}>
        <div className="wrap">
          <Fade>
            <p className="kicker">XEVEN // PRICING</p>
          </Fade>
          <h1 className="giant">
            <Rise>Press start</Rise>
            <Rise shift={5}>on growth.</Rise>
          </h1>
          <Fade shift={4}>
            <p className="lede">
              Fourteen days, $0 today, live in one day. Yearly billing takes 20% off. Cancel in
              one click.
            </p>
          </Fade>
          <div className="toggle" role="tablist" aria-label="Billing period">
            {(['Monthly', 'Yearly −20%'] as const).map((label, i) => (
              <button
                key={label}
                role="tab"
                aria-selected={yearly === (i === 1)}
                className={yearly === (i === 1) ? 'tab on' : 'tab'}
                onClick={() => setYearly(i === 1)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="plans">
            {PLANS.map((p) => (
              <article className={p.id === 'growth' ? 'plan hot magnetic' : 'plan magnetic'} key={p.id}>
                {p.id === 'growth' && <span className="plan-flag">MOST PICKED</span>}
                <h3>{p.label}</h3>
                <p className="plan-blurb">{p.blurb}</p>
                <p className="price">
                  {p.m === null ? (
                    <>Custom</>
                  ) : yearly ? (
                    <>
                      ${yearlyTotal(p.m)}
                      <span>/yr</span>
                    </>
                  ) : (
                    <>
                      ${p.m}
                      <span>/mo</span>
                    </>
                  )}
                </p>
                <p className="setup">+ ${p.setup} one-time setup</p>
                <ul>
                  {p.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <span className="plan-cta">14-day trial →</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Fade>
            <p className="kicker">ADD-ONS</p>
          </Fade>
          <div className="addons">
            <div className="arow ahead">
              <span />
              {PLANS.map((p) => (
                <span key={p.id}>{p.label}</span>
              ))}
            </div>
            {ADDONS.map((a) => (
              <div className="arow" key={a.label}>
                <span>{a.label}</span>
                {a.prices.map((price, i) => (
                  <span key={PLANS[i].id} className={price === 'Included' ? 'inc' : ''}>
                    {price}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="trust">
            {TRUSTLINE.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Fourteen days. <em>$0 today.</em>
          </>
        }
        sub="Live in one day. Cancel in one click."
        primary={{ label: 'Start free trial →', href: '#/pricing' }}
      />
    </>
  )
}
