/* /vision — mission + principles + team. Same system, shorter. */

const PRINCIPLES = [
  { n: '01', t: 'Worlds, not pages', d: 'If it could be a PDF, we refuse to build it.' },
  { n: '02', t: 'Motion is meaning', d: 'Every ease carries information. Nothing decorates.' },
  { n: '03', t: 'Performance is respect', d: '60fps or it does not ship. No exceptions.' },
]

const TEAM = ['Ava — Direction', 'Rook — WebGL', 'Mira — Motion', 'Theo — Systems', 'June — Film']

export default function Vision() {
  return (
    <div className="page">
      <p className="mono">VISION — WHY WE EXIST</p>
      <h1 className="page-title">The static web is over.</h1>
      <p className="page-lede">
        Attention is a place. We architect locations on the internet where cinematic 3D, real-time
        data and human emotion intersect — and where visitors become inhabitants.
      </p>
      <div className="rows">
        {PRINCIPLES.map((p) => (
          <div key={p.n} className="proc-row">
            <span className="proc-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
      <p className="mono">THE STUDIO</p>
      <div className="team">
        {TEAM.map((t) => (
          <span key={t} className="team-chip" data-cursor>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
