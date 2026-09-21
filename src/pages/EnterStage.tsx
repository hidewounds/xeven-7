import { PRODUCT, TRANSCRIPTS, TRIAL } from '../data/product'
import { navigate } from '../app/store'
import Reveal from '../components/Reveal'
import ProofStats from '../components/ProofStats'

/* SHIFT — the night shift, explained in one scroll. Empty hero viewport over
   the living XEVEN mark, proof numbers, the field's anatomy, one receipt
   from the floor, then departure. Section ids feed the ruler scroll-spy. */

const ANATOMY = [
  { n: '01', t: 'Hairlines', d: 'Every diamond outlined, never glowing. Boundaries, not decoration.' },
  { n: '02', t: 'RGB drift', d: 'Channel weather phases across the grid — green to red to violet, always moving on index.' },
  { n: '03', t: 'Cinema clock', d: 'Sparse panels light on a seven-second loop. The field keeps its own time.' },
  { n: '04', t: 'Hollow mark', d: 'The word hangs in the field itself, outlined and weightless — never laid on top.' },
]

const RECEIPT = TRANSCRIPTS[0]

export default function EnterStage() {
  return (
    <div className="page">
      <section className="st-hero hero-center" id="top" aria-label="XEVEN">
        <h1 className="sr-only">{PRODUCT.hero}</h1>
        <p className="hero-sub">{PRODUCT.sub}</p>
        <p className="mono live-line" aria-live="polite">
          <span className="live-dot" aria-hidden="true" /> LIVE — 12,408 CHATS THIS WEEK
        </p>
        <div className="hero-cta-row">
          <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>
            Book a demo →
          </button>
          <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('worlds')}>
            Walk the worlds
          </button>
        </div>
        <p className="mono scroll-cue" aria-hidden="true">SCROLL — THE FIELD KEEPS TIME</p>
      </section>

      <Reveal>
        <ProofStats />
      </Reveal>

      <section className="zone" id="anatomy" aria-label="Field anatomy">
        <Reveal>
          <p className="mono zone-kicker">ANATOMY OF THE FIELD</p>
          <h2 className="zone-title">Built from four moves.</h2>
        </Reveal>
        {ANATOMY.map((r) => (
          <Reveal key={r.n} className="t-row">
            <span className="t-n">{r.n}</span>
            <div>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="zone" aria-label="One receipt from the floor">
        <Reveal>
          <p className="mono zone-kicker">ONE RECEIPT FROM THE FLOOR</p>
          <h2 className="zone-title">Not a promise. A shift log.</h2>
        </Reveal>
        <Reveal className="receipt">
          <div className="receipt-head">
            <span className="live-dot mint" aria-hidden="true" />
            {RECEIPT.room} · {RECEIPT.time}
          </div>
          <div className="receipt-lines">
            {RECEIPT.lines.map((l, i) => (
              <div key={i} className={`msg-row ${l.who === 'XEVEN' ? 'bot' : 'user'}`}>
                <span className="msg-who">{l.who}</span>
                {l.text}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="hero-cta-row" style={{ marginTop: 'var(--s24)' }}>
            <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('worlds')}>
              See every room →
            </button>
          </div>
        </Reveal>
      </section>

      <section className="fin" id="finale" aria-label="Departure">
        <Reveal>
          <p className="mono">{TRIAL.kicker}</p>
          <h2 className="zone-title">{TRIAL.title}</h2>
          <p className="page-lede">{TRIAL.lede}</p>
          <div className="hero-cta-row" style={{ marginTop: 'var(--s24)' }}>
            <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>
              Book a demo →
            </button>
            <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('worlds')}>
              See the worlds
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
