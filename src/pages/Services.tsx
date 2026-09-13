import { useState } from 'react'

/* /services — expanding rows. */

const ROWS = [
  { t: 'Living 3D Worlds', d: 'Real-time scenes with law and weather: product films, configurators, explorable brand space. Three.js + R3F, procedural-first, Draco-compressed delivery.' },
  { t: 'Cinematic Motion', d: 'Scroll choreography, GSAP systems, SplitText typography, pinned sequences cut like film and timed to the frame.' },
  { t: 'Interactive Systems', d: 'Cursor physics, magnetic controls, hover fields, shockwaves — interfaces that answer back, with reduced-motion parity.' },
  { t: 'Realtime Systems', d: 'State, data and interaction wired live — configurators, dashboards, worlds that update in real time.' },
]

export default function Services() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="page">
      <p className="mono">SERVICES — WHAT WE DO</p>
      <h1 className="page-title">Four disciplines. One world.</h1>
      <div className="rows">
        {ROWS.map((r, i) => (
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
    </div>
  )
}
