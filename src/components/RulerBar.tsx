import { useEffect, useState } from 'react'
import { scrollBus } from '../app/store'
import type { Route } from '../app/store'

/* RulerBar — index ONLY. Tracks the index sections (scroll-spy), jumps on
   tap. Renders nothing on any other route. */

const STOPS = [{ id: 'top', short: '00', label: 'Top' }]

export default function RulerBar({ route }: { route: Route }) {
  const [active, setActive] = useState('top')
  useEffect(() => {
    if (route !== 'enter') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    STOPS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [route])

  if (route !== 'enter') return null
  return (
    <ol className="ruler" aria-label="Index sections">
      {STOPS.map((s) => (
        <li key={s.id}>
          <button
            className={`ruler-stop${active === s.id ? ' on' : ''}`}
            aria-label={s.label}
            onClick={() => scrollBus.scrollTo?.(`#${s.id}`)}
          >
            {s.short}
          </button>
        </li>
      ))}
    </ol>
  )
}
