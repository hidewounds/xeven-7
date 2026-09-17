import { BOLT, MISSION, PRINCIPLES } from '../data/product'

/* /about — mission, measured stats, principles. All sourced from the
   marketing site (see src/data/product.ts). */

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
    </div>
  )
}
