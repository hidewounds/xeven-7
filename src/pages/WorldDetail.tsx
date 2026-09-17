import { useEffect } from 'react'
import VideoCard from '../components/VideoCard'
import { WORLDS } from '../data/works'

/* /worlds/<slug> — single demo-world view. Copy is limited to the worlds'
   own published captions: no clients, metrics, or testimonials are
   claimed. The piece itself is an external interactive build — this page
   presents it and hands off. Prev/next walk the index order; Back returns
   to the grid, which restores filter, scroll, and focus from memory. */

export default function WorldDetail({ slug }: { slug: string }) {
  const i = WORLDS.findIndex((w) => w.slug === slug)
  const work = i >= 0 ? WORLDS[i] : null
  const prev = i > 0 ? WORLDS[i - 1] : null
  const next = i >= 0 && i < WORLDS.length - 1 ? WORLDS[i + 1] : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const base = document.title
    if (work) document.title = `XEVEN — ${work.title}`
    return () => {
      document.title = base
    }
  }, [work])

  if (!work) {
    return (
      <div className="page">
        <p className="mono">WORLDS — STUDY</p>
        <h1 className="page-title">No such study.</h1>
        <p className="page-lede">That link does not match anything in the index.</p>
        <a className="pill" href="#/worlds" data-cursor>
          ← Back to worlds
        </a>
      </div>
    )
  }

  return (
    <div className="page">
      <p className="mono">
        WORLDS — STUDY {String(i + 1).padStart(2, '0')} / {String(WORLDS.length).padStart(2, '0')}
      </p>
      <h1 className="page-title" tabIndex={-1} id="study-title">
        {work.title}
      </h1>
      <p className="page-lede">{work.caption}</p>
      <VideoCard title={work.title} sub={`${work.tag} — ${work.sub}`} poster={work.poster} />
      <div className="study-nav">
        <span className="study-steps">
          <a className="pill" href="#/worlds" data-cursor aria-label="Back to all worlds">
            ← All worlds
          </a>
          <a className="pill pill-ghost" href={work.href} target="_blank" rel="noreferrer" data-cursor>
            Open the live world ↗
          </a>
        </span>
        <span className="study-steps">
          {prev && (
            <a className="pill pill-ghost" href={`#/worlds/${prev.slug}`} data-cursor aria-label={`Previous study: ${prev.title}`}>
              ← {prev.title}
            </a>
          )}
          {next && (
            <a className="pill pill-ghost" href={`#/worlds/${next.slug}`} data-cursor aria-label={`Next study: ${next.title}`}>
              {next.title} →
            </a>
          )}
        </span>
      </div>
    </div>
  )
}
