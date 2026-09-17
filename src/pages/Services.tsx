import { useState } from 'react'
import { ROLES, SERVICES } from '../data/product'

/* /services — what Xeven delivers, plus the nine agent roles the platform
   ships with. All copy sourced (see src/data/product.ts). */

export default function Services() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="page">
      <p className="mono">SERVICES — WHAT WE DO</p>
      <h1 className="page-title">One employee, fully staffed.</h1>
      <div className="rows">
        {SERVICES.map((r, i) => (
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
      <p className="mono">NINE ROLES — ONE CLICK RE-STAFFS YOUR SITE</p>
      <div className="team">
        {ROLES.map((r) => (
          <span key={r.n} className="team-chip" data-cursor title={r.d}>
            {r.n}
          </span>
        ))}
      </div>
    </div>
  )
}
