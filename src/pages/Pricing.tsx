import { useState } from 'react'
import { navigate } from '../app/store'

/* /pricing — table + FAQ accordion. */

const TIERS = [
  { n: 'Spark', p: '$8k', d: 'One living page. Hero world, motion system, launch in 3 weeks.', f: ['1 immersive page', 'Motion + interaction', '2 revision orbits'] },
  { n: 'World', p: '$24k', d: 'A full dimensional site. Multi-scene world, CMS-ready content.', f: ['Up to 7 scenes', '3D configurator option', 'Performance budget 90+'] },
  { n: 'Engine', p: 'Custom', d: 'Us, embedded in your team. Ongoing worlds, systems, tuning.', f: ['Dedicated pod', 'Design engineering retainer', 'SLA + training'] },
]

const FAQ = [
  { q: 'How long does a world take?', a: 'Spark ships in 3 weeks, World in 6–8. Engine is ongoing.' },
  { q: 'Will it run on phones?', a: 'Yes — dedicated mobile paths, reduced geometry, touch-first interaction. 90+ Lighthouse or it does not ship.' },
  { q: 'What about accessibility?', a: 'Reduced-motion parity, keyboard paths, semantic landmarks and a WebGL fallback are standard, not add-ons.' },
]

export default function Pricing() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="page">
      <p className="mono">PRICING — ENGAGE</p>
      <h1 className="page-title">Three ways in.</h1>
      <div className="tier-grid">
        {TIERS.map((t) => (
          <div key={t.n} className="tier" data-cursor>
            <h3>{t.n}</h3>
            <div className="tier-price">{t.p}</div>
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
