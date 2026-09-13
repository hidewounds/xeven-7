import { useState } from 'react'
import VideoCard, { PH } from '../components/VideoCard'

/* /worlds — grid of 6 video thumbs with filter pills. */

const WORKS = [
  { src: PH.ink, title: 'Ink Study', tag: '3D', sub: 'fluid system' },
  { src: PH.aerial, title: 'Night Passage', tag: 'Motion', sub: 'aerial drift' },
  { src: PH.chrome, title: 'Chrome Drift', tag: '3D', sub: 'metal study' },
  { src: PH.head, title: 'Signal Head', tag: 'System', sub: 'particle identity' },
  { src: PH.metal, title: 'Melt 04', tag: 'Motion', sub: 'heat study' },
  { src: PH.ink, title: 'Undertow', tag: 'System', sub: 'current logic' },
]

const FILTERS = ['All', '3D', 'Motion', 'System']

export default function Worlds() {
  const [f, setF] = useState('All')
  const list = WORKS.filter((w) => f === 'All' || w.tag === f)
  return (
    <div className="page">
      <p className="mono">WORLDS — SELECTED SYSTEMS</p>
      <h1 className="page-title">Built worlds.</h1>
      <div className="pills" role="group" aria-label="Filter worlds">
        {FILTERS.map((p) => (
          <button key={p} className={f === p ? 'pill' : 'pill pill-ghost'} onClick={() => setF(p)} data-cursor aria-pressed={f === p}>
            {p}
          </button>
        ))}
      </div>
      <div className="works-grid">
        {list.map((w) => (
          <div key={w.title} className="work-cell" data-cursor>
            <VideoCard src={w.src} title={w.title} sub={`${w.tag} — ${w.sub}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
