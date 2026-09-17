import { MISSION, PRINCIPLES } from '../data/nova'

/* /vision — mission + principles. Sourced from the NOVA platform and
   marketing site (see src/data/nova.ts). No roster is published in either
   source, so none is claimed here. */

export default function Vision() {
  return (
    <div className="page">
      <p className="mono">{MISSION.kicker}</p>
      <h1 className="page-title">{MISSION.title}</h1>
      <p className="page-lede">{MISSION.lede}</p>
      <div className="rows">
        {PRINCIPLES.map((p) => (
          <div key={p.n} className="proc-row">
            <span className="proc-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
