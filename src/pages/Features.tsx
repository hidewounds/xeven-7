import { Suspense, lazy, useState } from 'react'
import { INSTRUMENTS, KB, KB_EMPTY, SKILLS } from '../data/product'

/* FEATURES — the five instruments up close, the six skills, the live
   knowledge index, and a copilot that operates this very page. */

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
      <p className="mono">MOVES — WHAT IT DOES</p>
      <h1 className="page-title">Don’t read features. Open them.</h1>
      <div className="rows">
        {INSTRUMENTS.map((r, i) => (
          <div key={r.t} className="proc-row">
            <button
              className="row-head"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              data-cursor
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--s16)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              <span className="proc-n">0{i + 1}</span>
              <h3 style={{ flex: 1 }}>{r.t}</h3>
              <span className="proc-n" aria-hidden="true">
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <div className="row-body">
                <p style={{ color: 'var(--muted)', margin: 'var(--s8) 0' }}>{r.d}</p>
                <p className="mono">{r.s}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mono">SKILLS — ONE WIDGET, SIX TRADES</p>
      <div className="team" role="group" aria-label="Filter knowledge by skill">
        {SKILLS.map((s) => (
          <button
            key={s}
            type="button"
            className={`team-chip${kbq === skillQuery[s] ? ' on' : ''}`}
            data-cursor
            aria-pressed={kbq === skillQuery[s]}
            onClick={() => setKbq(kbq === skillQuery[s] ? '' : skillQuery[s])}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mono">KNOWLEDGE — VERIFIED OR SILENT</p>
      <KBDemo q={kbq} onQ={setKbq} />
      <p className="mono">COPILOT — COMMAND THIS PAGE</p>
      <p className="page-lede">
        One script gives this page its own AI operator. Bring any OpenAI-compatible key — or a local
        Ollama endpoint — and drive the site in plain words. The key never leaves this browser.
      </p>
      <Suspense fallback={<p className="kb-hit">Loading the copilot…</p>}>
        <CopilotDemo />
      </Suspense>
    </div>
  )
}

