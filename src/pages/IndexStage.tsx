import { PROOF, PRODUCT, TELEMETRY, TRANSCRIPTS, TRIAL } from '../data/product'
import { navigate } from '../app/store'
import Reveal from '../components/Reveal'
import ProofStats from '../components/ProofStats'

const SIGNAL_STATES = [
  { label: 'HEAR', short: 'Context enters.', detail: 'Every message is read for intent, situation and history — not just keywords.', accent: 'cyan', code: 'INGRESS / 01' },
  { label: 'HOLD', short: 'Memory stays.', detail: 'Names, sizes, budgets and carts remain available mid-sentence, per customer.', accent: 'moon', code: 'MEMORY / 02' },
  { label: 'ANSWER', short: 'Knowledge grounds.', detail: 'XEVEN answers from what it can verify. Where it cannot, it stays silent.', accent: 'cyan', code: 'VERIFY / 03' },
  { label: 'EARN', short: 'Action lands.', detail: 'Slots held. Carts recovered. Browsers become buyers.', accent: 'ember', code: 'ACTION / 04' },
]

const RECEIPT = TRANSCRIPTS[0]

function Room() {
  return (
    <div className="architecture-room" role="img" aria-label="XEVEN signal room: context resolves into verified action">
      <div className="room-topline"><span>ROOM 04</span><span>ALWAYS ON / 24:7</span></div>
      <div className="room-skyline" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="room-axis room-axis-x" aria-hidden="true" />
      <div className="room-axis room-axis-y" aria-hidden="true" />
      <div className="room-floor" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="room-core">
        <span className="room-core-orbit orbit-a" />
        <span className="room-core-orbit orbit-b" />
        <span className="room-core-orbit orbit-c" />
        <div className="room-core-dot" />
        <strong>XEVEN</strong>
        <small>VERIFIED → ACTION</small>
      </div>
      <div className="room-signal signal-one"><b>01</b><span>CONTEXT</span></div>
      <div className="room-signal signal-two"><b>02</b><span>MEMORY</span></div>
      <div className="room-signal signal-three"><b>03</b><span>KNOWLEDGE</span></div>
      <div className="room-readout readout-a"><span>WEEKLY SIGNAL</span><strong>12,408</strong></div>
      <div className="room-readout readout-b"><span>TRUST STATE</span><strong>0 INVENTED</strong></div>
      <div className="room-readout readout-c"><span>TRIAL</span><strong>14 DAYS</strong></div>
      <div className="room-stamp mono">SIGNAL / IN MOTION <span>↗</span></div>
      <div className="room-scan" aria-hidden="true" />
    </div>
  )
}

function RailMark({ index, active = false }: { index: string; active?: boolean }) {
  return <span className={`rail-mark${active ? ' active' : ''}`}><b>{index}</b><i /></span>
}

const MONTAGE_SHOTS = [
  { code: '01 / ORBIT', title: 'Ideas in orbit.', copy: 'The first signal is always a point of light.', kind: 'orbit' },
  { code: '02 / ARCHITECTURE', title: 'Make the invisible legible.', copy: 'Systems become spaces. Spaces become instinct.', kind: 'structure' },
  { code: '03 / TENSION', title: 'Hold the frame.', copy: 'A little friction makes the next move feel earned.', kind: 'tension' },
  { code: '04 / RELEASE', title: 'Give the signal somewhere to go.', copy: 'XEVEN turns attention into an action you can verify.', kind: 'release' },
]

function MontageSequence() {
  return <section className="montage-sequence" aria-label="XEVEN visual montage">
    {MONTAGE_SHOTS.map((shot) => <article className={`montage-shot montage-${shot.kind}`} key={shot.code}>
      <div className="montage-shot-inner"><div className="montage-meta mono"><span>{shot.code}</span><span>SCROLL / PLAY</span></div><div className="montage-art" aria-hidden="true"><span className="montage-core" /><span className="montage-wire wire-a" /><span className="montage-wire wire-b" /><span className="montage-plane plane-a" /><span className="montage-plane plane-b" /><span className="montage-particle particle-a" /><span className="montage-particle particle-b" /></div><div className="montage-copy"><p className="mono">XEVEN / FIELD NOTE</p><h2>{shot.title}</h2><p>{shot.copy}</p></div><span className="montage-progress mono">{shot.code.split(' / ')[0]} <i /> 04</span></div>
    </article>)}
  </section>
}

export default function EnterStage() {
  return (
    <div className="page home-page architecture-page">
      <MontageSequence />
      <section className="architecture-hero" id="top" aria-labelledby="hero-title">
        <div className="hero-rail mono"><RailMark index="00" active /><span>ENTRY / SIGNAL ROOM</span><span>SCROLL TO MOVE THROUGH THE SYSTEM</span></div>
        <div className="architecture-hero-copy">
          <Reveal>
            <p className="mono hero-kicker">XEVEN / AI EMPLOYEE / BUSINESS WEBSITES</p>
            <h1 id="hero-title" className="architecture-title"><span>MAKE</span><span>EVERY VISIT</span><em>COUNT.</em></h1>
            <p className="architecture-lede">{PRODUCT.sub} <b>{PRODUCT.trial}</b></p>
            <div className="hero-cta-row">
              <button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>Book a demo <span>↗</span></button>
              <button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('features')}>Open the moves <span>↘</span></button>
            </div>
            <div className="hero-proofline"><span className="live-dot" aria-hidden="true" /> <span>12,408 chats this week</span><i /> <span>0 invented prices</span></div>
          </Reveal>
        </div>
        <Reveal className="architecture-hero-stage"><Room /></Reveal>
        <div className="hero-footnote mono"><span>SCROLL / 01—04</span><span>THE FRONT DOOR, STILL OPEN</span></div>
      </section>

      <section className="architecture-statement" aria-labelledby="statement-title">
        <div className="section-index mono"><RailMark index="01" /><span>THE PREMISE</span></div>
        <Reveal className="statement-copy">
          <p className="mono">ONE CONTINUOUS EXPERIENCE / NO DEAD ENDS</p>
          <h2 id="statement-title">A website that <em>keeps working</em> after the room goes quiet.</h2>
          <p>Visitors arrive with fragments: a size, a deadline, a half-formed question. XEVEN reads the signal, holds the useful parts, and turns the next true thing into action.</p>
        </Reveal>
        <div className="statement-aside"><span className="mono">SYSTEM NOTE / 001</span><strong>Context is the interface.</strong><span>Not another widget. A dependable layer between curiosity and the next move.</span></div>
      </section>

      <Reveal><ProofStats /></Reveal>

      <section className="architecture-chapters" aria-labelledby="chapters-title">
        <div className="chapter-header">
          <div className="section-index mono"><RailMark index="02" active /><span>OPERATING STATES</span></div>
          <div><p className="mono">TRACE THE SIGNAL / FOUR MOVES</p><h2 id="chapters-title">From signal to action.</h2></div>
          <p>Open each state like a room in the system. The signal changes shape, but never loses the plot.</p>
        </div>
        <div className="chapter-list">
          {SIGNAL_STATES.map((state, i) => {
            const telemetry = TELEMETRY[i]
            return (
              <Reveal key={state.label} className={`architecture-chapter chapter-${state.accent}`}>
                <div className="chapter-index mono"><RailMark index={`0${i + 1}`} active={i === 0} /><span>{state.code}</span></div>
                <div className="chapter-main"><p className="mono">{telemetry.meta}</p><h3>{state.label}</h3><p className="chapter-short">{state.short}</p><p className="chapter-detail">{state.detail}</p></div>
                <div className="chapter-geometry" aria-hidden="true"><span className="geo-ring ring-1" /><span className="geo-ring ring-2" /><span className="geo-line" /><b>{String(i + 1).padStart(2, '0')}</b></div>
                <div className="chapter-receipt mono">{telemetry.d}<span className="receipt-arrow">↗</span></div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="architecture-proof" aria-labelledby="receipt-title">
        <div className="section-index mono"><RailMark index="03" /><span>PROOF / NOT PROMISE</span></div>
        <div className="proof-heading"><p className="mono">ONE RECEIPT FROM THE FLOOR / VERIFIED TRANSCRIPT</p><h2 id="receipt-title">The best automation feels <em>human</em> at the edge.</h2></div>
        <Reveal className="receipt signal-receipt">
          <div className="receipt-head"><span className="live-dot mint" aria-hidden="true" /> {RECEIPT.room} <span>·</span> {RECEIPT.time}<span className="receipt-status">RESOLVED / 00:42</span></div>
          <div className="receipt-lines">{RECEIPT.lines.map((line, i) => <div key={i} className={`msg-row ${line.who === 'XEVEN' ? 'bot' : 'user'}`}><span className="msg-who">{line.who}</span>{line.text}</div>)}</div>
        </Reveal>
        <div className="proof-ledger"><p className="mono">PUBLISHED RECEIPTS</p>{PROOF.map((item) => <div className="proof-note-row" key={item.label}><strong>{item.display}</strong><span>{item.label}</span></div>)}</div>
      </section>

      <section className="architecture-finale" id="finale" aria-labelledby="finale-title">
        <div className="finale-wire" aria-hidden="true"><span /><span /><span /></div>
        <div className="section-index mono"><RailMark index="04" active /><span>OPEN THE DOOR</span></div>
        <Reveal>
          <p className="mono">{TRIAL.kicker}</p>
          <h2 id="finale-title">Give the signal<br /><em>somewhere to go.</em></h2>
          <p className="page-lede">{TRIAL.title} {TRIAL.lede} {PRODUCT.trial}</p>
          <div className="hero-cta-row"><button className="pill" data-cursor="BOOK" onClick={() => navigate('demo')}>Book a demo <span>↗</span></button><button className="pill pill-ghost" data-cursor="OPEN" onClick={() => navigate('worlds')}>Walk the worlds <span>↘</span></button></div>
        </Reveal>
      </section>
    </div>
  )
}
