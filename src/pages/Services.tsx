import { useState } from 'react'
import { INSTRUMENTS, SKILLS } from '../data/product'

/* /services — the five instruments up close plus the six assistant skills
   shown on the site. All copy sourced (see src/data/product.ts). */

export default function Services() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="page">
      <p className="mono">SERVICES — WHAT WE DO</p>
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
    </div>
  )
}
