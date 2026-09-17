import { useEffect, useState } from 'react'
import VideoCard from '../components/VideoCard'
import { FILTERS, WORLDS, loadWorldsMemory, saveWorldsMemory, workFilter } from '../data/works'

/* /worlds — the three live NOVA demo worlds. Cards are real links to
   stable study routes (`#/worlds/<slug>`), so keyboard, touch, and
   screen-reader users get the same index as pointer users. Activating a
   card stores filter + scroll + identity so Back restores the exact grid
   position and focus. */

export default function Worlds() {
  const [mem] = useState(loadWorldsMemory)
  const [f, setF] = useState(mem && FILTERS.includes(mem.f) ? mem.f : 'All')
  const list = WORLDS.filter((w) => workFilter(w, f))

  // restore scroll + focus after returning from a study; otherwise start
  // at the top (fresh visit). Focus restores even when there was no
  // scroll offset (short filtered grids) — return focus belongs to the
  // originating card regardless of position.
  useEffect(() => {
    if (mem) {
      window.scrollTo(0, mem.y > 0 ? mem.y : 0)
      if (mem.slug) {
        requestAnimationFrame(() => {
          document.getElementById(`work-${mem.slug}`)?.focus({ preventScroll: true })
        })
      }
    } else {
      window.scrollTo(0, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (next: string) => {
    setF(next)
    saveWorldsMemory({ f: next, y: window.scrollY, slug: '' })
  }

  const open = (slug: string) => {
    saveWorldsMemory({ f, y: window.scrollY, slug })
  }

  return (
    <div className="page">
      <p className="mono">WORLDS — LIVE DEMOS</p>
      <h1 className="page-title">Three live worlds.</h1>
      <p className="page-lede">
        Interactive builds running on the NOVA site — sound optional, everything works silent.
      </p>
      <div className="pills" role="group" aria-label="Filter worlds">
        {FILTERS.map((p) => (
          <button key={p} className={f === p ? 'pill' : 'pill pill-ghost'} onClick={() => pick(p)} data-cursor aria-pressed={f === p}>
            {p}
          </button>
        ))}
      </div>
      <div className="works-grid">
        {list.map((w) => (
          <a
            key={w.slug}
            id={`work-${w.slug}`}
            className="work-cell"
            href={`#/worlds/${w.slug}`}
            onClick={() => open(w.slug)}
            data-cursor
            aria-label={`${w.title}, ${w.tag}, ${w.sub} — open study`}
          >
            <VideoCard title={w.title} sub={`${w.tag} — ${w.sub}`} poster={w.poster} />
          </a>
        ))}
      </div>
    </div>
  )
}
