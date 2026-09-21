import { useState } from 'react'
import { AUDIT, BOLT, FAQ, MISSION, PRINCIPLES, TRUSTLINE } from '../data/product'
import Reveal from '../components/Reveal'

/* MANUAL — why it exists. Mission, bolt stats, principles, audit receipts,
   quotable FAQs. The trust page: every claim traceable, nothing decorative. */

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return (
    <div className="page">
      <Reveal>
        <p className="mono">{MISSION.kicker}</p>
        <h1 className="page-title">{MISSION.title}</h1>
        <p className="page-lede">{MISSION.lede}</p>
      </Reveal>

      <div className="rows">
        {BOLT.map((p) => (
          <Reveal key={p.n} className="proc-row">
            <span className="proc-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mono">PRINCIPLES</p>
        <div className="rows">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="proc-row">
              <span className="proc-n">{p.n}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p className="mono">AUDIT — RECEIPTS, NOT PROMISES</p>
        <div className="ledger-mini" aria-label="Audited actions">
          {AUDIT.map((a, i) => (
            <p key={a} className="mono">
              <span className={`live-dot ${i === 1 ? 'ember' : 'mint'}`} aria-hidden="true" /> {a}
            </p>
          ))}
        </div>
        <div className="team" aria-label="Standing promises">
          {TRUSTLINE.map((t) => (
            <span key={t} className="team-chip">
              {t}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p className="mono">QUESTIONS — ANSWERED ONCE, QUOTED ANYWHERE</p>
      </Reveal>
      <div>
        {FAQ.map((f, i) => (
          <div key={f.q} className="faq-item">
            <button
              className="faq-q"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              data-cursor={openFaq === i ? 'SHUT' : 'OPEN'}
            >
              <span className="proc-n">Q{i + 1}</span>
              <span>{f.q}</span>
            </button>
            {openFaq === i && <p className="faq-a">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
