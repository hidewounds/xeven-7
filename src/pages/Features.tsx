import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { INSTRUMENTS, KB, KB_EMPTY, SKILLS } from '../data/product'
import Reveal from '../components/Reveal'

/* MOVES — five instruments, each operable. The accordion explains; the
   Chrono and Echo consoles prove. Skills filter the knowledge index; the
   empty state demonstrates the guardrail. Copilot drives the page itself. */

const CopilotDemo = lazy(() => import('../components/CopilotDemo'))

function KBDemo({ q, onQ }: { q: string; onQ: (v: string) => void }) {
  const f = q.toLowerCase().trim()
  const hits = KB.filter((k) => !f || `${k.t} ${k.c} ${k.k}`.toLowerCase().includes(f))
  return (
    <div className="kb-demo">
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Try: returns, shipping, booking…"
        autoComplete="off"
        aria-label="Search the knowledge index"
      />
      <div role="status">
        {hits.length ? (
          hits.map((k) => (
            <p key={k.t} className="kb-hit">
              <b>{k.t}</b> · verified — {k.c}
            </p>
          ))
        ) : (
          <p className="kb-hit">{KB_EMPTY}</p>
        )}
      </div>
    </div>
  )
}

/* Chrono console — press to hold a slot the way Chrono does. */
function ChronoDemo() {
  const [heldAt, setHeldAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (heldAt === null) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [heldAt])
  const left = heldAt === null ? 300 : Math.max(0, 300 - Math.floor((now - heldAt) / 1000))
  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <div className="kb-demo" aria-label="Chrono hold demonstration">
      <p className="mono" style={{ margin: '0 0 var(--s12)' }}>CHRONO CONSOLE — LIVE</p>
      {heldAt === null ? (
        <button
          type="button"
          className="pill"
          data-cursor="HOLD"
          onClick={() => {
            setHeldAt(Date.now())
            setNow(Date.now())
          }}
        >
          Hold a slot →
        </button>
      ) : (
        <>
          <p className="mono hold-timer" aria-live="polite">
            HELD {label} — CONFLICT-CHECKED, INSIDE BUSINESS HOURS
          </p>
          <button
            type="button"
            className="pill pill-ghost"
            data-cursor="RESET"
            onClick={() => setHeldAt(null)}
          >
            Release
          </button>
        </>
      )}
    </div>
  )
}

/* Echo console — press and hold to simulate the mic handoff. Honestly
   labeled: the real Echo listens on your site; this is the shape of it. */
function EchoDemo() {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'heard'>('idle')
  const start = useRef(0)
  const down = () => {
    start.current = Date.now()
    setPhase('listening')
  }
  const up = () => {
    if (phase !== 'listening') return
    if (Date.now() - start.current >= 800) setPhase('heard')
    else setPhase('idle')
  }
  return (
    <div className="kb-demo" aria-label="Echo mic demonstration">
      <p className="mono" style={{ margin: '0 0 var(--s12)' }}>ECHO CONSOLE — SIMULATED MIC</p>
      <button
        type="button"
        className={phase === 'listening' ? 'pill' : 'pill pill-ghost'}
        data-cursor="TALK"
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={() => phase === 'listening' && setPhase('idle')}
        onKeyDown={(e) => e.key === 'Enter' && setPhase('heard')}
      >
        {phase === 'listening' ? 'Listening…' : phase === 'heard' ? 'Heard ✓' : 'Hold to talk'}
      </button>
      <p className="kb-hit" role="status" style={{ marginTop: 'var(--s12)' }}>
        {phase === 'heard'
          ? '“Oat-milk-first, Maya.” — transcribed, filed to memory.'
          : phase === 'listening'
            ? 'Speak now — hold at least a second.'
            : 'The real Echo listens on your site; this is the shape of it.'}
      </p>
    </div>
  )
}

export default function Features() {
  const [open, setOpen] = useState<number | null>(0)
  const [kbq, setKbq] = useState('')
  const skillQuery: Record<string, string> = {
    Support: 'returns',
    Sales: 'trial',
    Shopping: 'shipping',
    Advisor: 'voice',
    Booking: 'booking',
    Leads: 'booking',
  }
  return (
    <div className="page">
      <Reveal>
        <p className="mono">MOVES — WHAT IT DOES</p>
        <h1 className="page-title">Don’t read features. Open them.</h1>
        <p className="page-lede">Five instruments. Each one below runs, right here, before you pay anything.</p>
      </Reveal>
      <div className="rows">
        {INSTRUMENTS.map((r, i) => (
          <div key={r.t} className="proc-row">
            <button
              className="row-head"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              data-cursor={open === i ? 'SHUT' : 'OPEN'}
            >
              <span className="proc-n">0{i + 1}</span>
              <h3>{r.t}</h3>
              <span className="proc-n" aria-hidden="true">
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <div className="row-body">
                <p style={{ color: 'var(--muted)', margin: 'var(--s8) 0' }}>{r.d}</p>
                <p className="mono">{r.s}</p>
                {r.t === 'Chrono Booking' && (
                  <div style={{ marginTop: 'var(--s16)' }}>
                    <ChronoDemo />
                  </div>
                )}
                {r.t === 'Echo Voice' && (
                  <div style={{ marginTop: 'var(--s16)' }}>
                    <EchoDemo />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <Reveal>
        <p className="mono">SKILLS — ONE WIDGET, SIX TRADES</p>
        <div className="team" role="group" aria-label="Filter knowledge by skill">
          {SKILLS.map((s) => (
            <button
              key={s}
              type="button"
              className={`team-chip${kbq === skillQuery[s] ? ' on' : ''}`}
              data-cursor="FILTER"
              aria-pressed={kbq === skillQuery[s]}
              onClick={() => setKbq(kbq === skillQuery[s] ? '' : skillQuery[s])}
            >
              {s}
            </button>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <p className="mono">KNOWLEDGE — VERIFIED OR SILENT</p>
        <KBDemo q={kbq} onQ={setKbq} />
      </Reveal>
      <Reveal>
        <p className="mono">COPILOT — COMMAND THIS PAGE</p>
        <p className="page-lede">
          One script gives this page its own AI operator. Bring any OpenAI-compatible key — or a local
          Ollama endpoint — and drive the site in plain words. The key never leaves this browser.
        </p>
        <Suspense fallback={<p className="kb-hit">Loading the copilot…</p>}>
          <CopilotDemo />
        </Suspense>
      </Reveal>
    </div>
  )
}
