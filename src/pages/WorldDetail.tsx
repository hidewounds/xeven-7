import { useEffect } from 'react'
import VideoCard from '../components/VideoCard'
import { WORKS } from '../data/works'

/* /worlds/<slug> — single motion-study view. Content is limited to what
   the study actually is (discipline + focus + the piece itself): no
   clients, metrics, or testimonials are claimed. Prev/next walk the
   index order; Back returns to the grid, which restores filter, scroll,
   and focus from session memory. */

export default function WorldDetail({ slug }: { slug: string }) {
  const i = WORKS.findIndex((w) => w.slug === slug)
  const work = i >= 0 ? WORKS[i] : null
  const prev = i > 0 ? WORKS[i - 1] : null
  const next = i >= 0 && i < WORKS.length - 1 ? WORKS[i + 1] : null

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
        WORLDS — STUDY {String(i + 1).padStart(2, '0')} / {String(WORKS.length).padStart(2, '0')}
      </p>
      <h1 className="page-title" tabIndex={-1} id="study-title">
        {work.title}
      </h1>
      <p className="page-lede">
        {work.tag} — {work.sub}. A studio motion study: technique and feel, not client work.
      </p>
      <VideoCard src={work.src} title={work.title} sub={`${work.tag} — ${work.sub}`} poster={work.poster} />
      <div className="study-nav">
        <a className="pill" href="#/worlds" data-cursor aria-label="Back to all worlds">
          ← All worlds
        </a>
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
