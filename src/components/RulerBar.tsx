import { useEffect, useRef } from 'react'
import { navigate } from '../app/store'
import type { Route } from '../app/store'
import { NAV_LINKS } from '../nav'

/* RulerBar: a fake left-edge ruler, mounted globally. Inch marks are the
   main points (routes, from the single nav model); cm ticks subdivide the
   travel between; a needle rides page scroll top→bottom — cm by cm until
   the next inch. Clicking an inch navigates. Hidden on small screens;
   scroll-linked (no animation) so it stands down cleanly under reduced
   motion. */

export default function RulerBar({ route }: { route: Route }) {
  const needle = useRef<HTMLDivElement>(null!)
  const track = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    let raf = 0
    const place = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      needle.current.style.transform = `translateY(${(p * track.current.clientHeight).toFixed(1)}px)`
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(place)
    }
    place()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [route])

  return (
    <aside className="ruler" aria-label="Site ruler">
      {/* subdivisions: exactly two cm ticks + one big mid-inch per gap,
          positioned at quarters so every gap reads identically */}
      <div className="ruler-subs" aria-hidden="true">
        {NAV_LINKS.slice(0, -1).map((s, i) => (
          <div
            key={s.to}
            className="ruler-gap"
            style={{ top: `${(i / (NAV_LINKS.length - 1)) * 100}%`, height: `${100 / (NAV_LINKS.length - 1)}%` }}
          >
            <i className="ruler-cm" />
            <i className="ruler-mid" />
            <i className="ruler-cm" />
          </div>
        ))}
      </div>
      <div className="ruler-inches" ref={track}>
        {NAV_LINKS.map((s, i) => (
          <button
            key={s.to}
            className={route === s.to ? 'ruler-inch ruler-on' : 'ruler-inch'}
            onClick={() => navigate(s.to)}
            aria-label={`0${i} — ${s.label}`}
            aria-current={route === s.to ? 'page' : undefined}
          >
            <span className="ruler-n">0{i}</span>
            <i className="ruler-tick" aria-hidden="true" />
            <span className="ruler-tag">{s.short.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <div className="ruler-needle" ref={needle} aria-hidden="true" />
    </aside>
  )
}
