import { BOLT, MISSION, PRINCIPLES, TRUSTLINE } from '../data/product'

/* ABOUT — why it exists. Mission, bolt stats, principles, and the trustline
   the whole company stands on. No vignette: the field behind is the art. */

export default function About() {
  return (
    <div className="page">
      <p className="mono">{MISSION.kicker}</p>
      <h1 className="page-title">{MISSION.title}</h1>
      <p className="page-lede">{MISSION.lede}</p>
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
