import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BOLT, MISSION, PRINCIPLES, TRUSTLINE } from '../data/product'
import { xs } from '../app/store'

/* ABOUT — why it exists. Mission, live field study, bolt stats, principles,
   and the trustline the whole company stands on. */

const R3FDemo = lazy(() => import('../components/R3FDemo'))

export default function About() {
  const [reduced] = useState(() => xs.reduced)
  const fig = useRef<HTMLElement>(null!)

  useEffect(() => {
    const el = fig.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('landed')
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div className="page">
      <p className="mono">{MISSION.kicker}</p>
      <h1 className="page-title">{MISSION.title}</h1>
      <p className="page-lede">{MISSION.lede}</p>

      <figure ref={fig} className="field-study">
        {reduced ? (
          <div className="field-study-still" aria-hidden="true" />
        ) : (
          <Suspense fallback={<div className="field-study-still" aria-hidden="true" />}>
            <R3FDemo />
          </Suspense>
        )}
        <figcaption className="mono">FIELD STUDY — PROCEDURAL WEBGL</figcaption>
      </figure>

      <div className="rows">
        {BOLT.map((p) => (
          <div key={p.n} className="proc-row">
            <span className="proc-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
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
      <div className="team" aria-label="Standing promises">
        {TRUSTLINE.map((t) => (
          <span key={t} className="team-chip">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
