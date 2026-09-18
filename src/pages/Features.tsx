import { Suspense, lazy, useState } from 'react'
import { INSTRUMENTS, KB, KB_EMPTY, SKILLS } from '../data/product'

/* /features — the five instruments up close, the six assistant skills,
   the live knowledge index, and a copilot that operates this very page.
   All copy sourced (see src/data/product.ts). */

const CopilotDemo = lazy(() => import('../components/CopilotDemo'))

/* Knowledge index demo: static client-side filter over the published
   entries, mirroring the site's own index behavior. */
function KBDemo() {
  const [q, setQ] = useState('')
  const f = q.toLowerCase().trim()
  const hits = KB.filter((k) => !f || `${k.t} ${k.c} ${k.k}`.toLowerCase().includes(f))
  return (
    <div className="kb-demo">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
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
  return (
    <div className="page">
      <p className="mono">FEATURES — WHAT IT DOES</p>
      <h1 className="page-title">Don’t read features. Play them.</h1>
      <div className="rows">
        {INSTRUMENTS.map((r, i) => (
          <div key={r.t} className={open === i ? 'row open' : 'row'}>
            <button className="row-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} data-cursor>
              <span className="row-n">0{i + 1}</span>
              <h3>{r.t}</h3>
              <span className="row-x" aria-hidden="true">
                {open === i ? '−' : '+'}
              </span>
            </button>
            <div className="row-body">
              <p>{r.d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mono">SKILLS — ONE WIDGET, SIX TRADES</p>
      <div className="team">
        {SKILLS.map((s) => (
          <span key={s} className="team-chip" data-cursor>
            {s}
          </span>
        ))}
      </div>
      <p className="mono">KNOWLEDGE — VERIFIED OR SILENT</p>
      <KBDemo />
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
