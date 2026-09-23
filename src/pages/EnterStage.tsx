import { PROOF, PRODUCT, TELEMETRY, TRANSCRIPTS, TRIAL } from '../data/product'
import { navigate } from '../app/store'
import Reveal from '../components/Reveal'
import ProofStats from '../components/ProofStats'

const SIGNAL_STATES = [
  { label: 'HEAR', short: 'Context enters', detail: 'Every message read for intent, situation and history — not just keywords.' },
  { label: 'HOLD', short: 'Memory stays', detail: 'Names, sizes, budgets and carts are recalled mid-sentence, per customer.' },
  { label: 'ANSWER', short: 'Knowledge grounds', detail: 'XEVEN answers from what it can verify. Where it cannot, it stays silent.' },
  { label: 'EARN', short: 'Action lands', detail: 'Slots held. Carts recovered. Browsers become buyers.' },
]

const RECEIPT = TRANSCRIPTS[0]

function SignalDiagram() {
  return (
    <div className="signal-diagram" aria-label="Signal moves from context to action">
      <svg viewBox="0 0 640 520" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="signal-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#4df3ff" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#4df3ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff4d2e" stopOpacity="0.7" />
          </linearGradient>
          <filter id="signal-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path className="signal-grid" d="M48 80H590M48 180H590M48 280H590M48 380H590M48 480H590M100 36V484M220 36V484M340 36V484M460 36V484M580 36V484" />
        <path className="signal-trace signal-trace-a" d="M54 380 C150 380 140 140 244 140 S330 420 420 320 S500 120 586 120" />
        <path className="signal-trace signal-trace-b" d="M54 180 C120 180 160 420 256 420 S360 90 454 180 S520 380 586 380" />
        <circle className="signal-node node-a" cx="54" cy="380" r="8" />
        <circle className="signal-node node-b" cx="244" cy="140" r="8" />
        <circle className="signal-node node-c" cx="420" cy="320" r="8" />
        <circle className="signal-node node-d" cx="586" cy="120" r="12" filter="url(#signal-glow)" />
        <circle className="signal-core" cx="340" cy="260" r="42" />
        <text className="signal-core-label" x="340" y="256" textAnchor="middle">XEVEN</text>
        <text className="signal-core-sub" x="340" y="276" textAnchor="middle">VERIFIED → ACTION</text>
      </svg>
      <div className="signal-caption mono"><span className="live-dot" aria-hidden="true" /> SIGNAL / DEPTH · 04 STATES</div>
    </div>
  )
}

export default function EnterStage() {
  return (
    <div className="page home-page">
      <section className="signal-hero" id="top" aria-labelledby="hero-title">
        <div className="signal-hero-copy">
          <Reveal>
            <p className="mono hero-kicker">XEVEN / SIGNAL TO DEPTH / 00</p>
            <h1 id="hero-title" className="signal-title">THE AI EMPLOYEE FOR BUSINESS WEBSITES.</h1>
            <p className="signal-lede">{PRODUCT.sub} {PRODUCT.trial}</p>
            <div className="hero-cta-row">
              <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>Book a demo →</button>
              <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('features')}>Open the moves</button>
            </div>
            <p className="mono hero-proof"><span className="live-dot" aria-hidden="true" /> 12,408 CHATS THIS WEEK · 0 INVENTED PRICES</p>
          </Reveal>
        </div>
        <Reveal className="signal-hero-art">
          <SignalDiagram />
        </Reveal>
        <div className="hero-index mono" aria-label="Scroll narrative chapters">
          <span>SCROLL TO TRACE THE SIGNAL</span><span>01 — 04</span>
        </div>
      </section>

      <Reveal><ProofStats /></Reveal>

      <section className="signal-chapter-intro" aria-labelledby="chapter-title">
        <Reveal>
          <p className="mono">THE OPERATING SYSTEM / ONE CONTINUOUS EXPERIENCE</p>
          <h2 id="chapter-title" className="zone-title">From signal to action.</h2>
          <p className="page-lede">XEVEN reads the room before it replies. Trace the four states that turn a website visit into a useful next move.</p>
        </Reveal>
      </section>

      <section className="signal-chapters" aria-label="XEVEN signal states">
        {SIGNAL_STATES.map((state, i) => {
          const telemetry = TELEMETRY[i]
          return (
            <Reveal key={state.label} className={`signal-chapter signal-state-${i + 1}`}>
              <div className="signal-chapter-index"><span className="mono">0{i + 1}</span><span className="chapter-line" /></div>
              <div className="signal-chapter-body">
                <p className="mono">{telemetry.meta}</p>
                <h3>{state.label}</h3>
                <p className="signal-chapter-short">{state.short}</p>
                <p className="signal-chapter-detail">{state.detail}</p>
              </div>
              <div className="signal-chapter-receipt mono">{telemetry.d}</div>
            </Reveal>
          )
        })}
      </section>

      <section className="signal-proof-section" aria-labelledby="receipt-title">
        <Reveal>
          <p className="mono">ONE RECEIPT FROM THE FLOOR / VERIFIED TRANSCRIPT</p>
          <h2 id="receipt-title" className="zone-title">Not a promise. A shift log.</h2>
        </Reveal>
        <Reveal className="receipt signal-receipt">
          <div className="receipt-head"><span className="live-dot mint" aria-hidden="true" /> {RECEIPT.room} · {RECEIPT.time}</div>
          <div className="receipt-lines">{RECEIPT.lines.map((line, i) => <div key={i} className={`msg-row ${line.who === 'XEVEN' ? 'bot' : 'user'}`}><span className="msg-who">{line.who}</span>{line.text}</div>)}</div>
        </Reveal>
        <div className="signal-proof-note">
          <p className="mono">PUBLISHED RECEIPTS</p>
          {PROOF.map((item) => <div className="proof-note-row" key={item.label}><strong>{item.display}</strong><span>{item.label}</span></div>)}
        </div>
      </section>

      <section className="fin signal-finale" id="finale" aria-labelledby="finale-title">
        <Reveal>
          <p className="mono">{TRIAL.kicker}</p>
          <h2 id="finale-title" className="zone-title">Give the signal somewhere to go.</h2>
          <p className="page-lede">{TRIAL.title} {TRIAL.lede} {PRODUCT.trial}</p>
          <div className="hero-cta-row" style={{ marginTop: 'var(--s24)' }}>
            <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>Book a demo →</button>
            <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('worlds')}>Walk the worlds</button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
