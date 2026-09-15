import { useEffect, useRef } from 'react'
import { navigate, type Route } from '../app/store'

/* RulerBar: a fake left-edge ruler, mounted globally. Inch marks are the
   main points (routes); cm ticks subdivide the travel between; a needle
   rides page scroll top→bottom — cm by cm until the next inch. Clicking
   an inch navigates. Hidden on small screens; scroll-linked (no animation)
   so it stands down cleanly under reduced motion. */

const INCHES: Array<{ n: string; label: string; to: Route }> = [
  { n: '00', label: 'TOP', to: 'enter' },
  { n: '01', label: 'WORLDS', to: 'worlds' },
  { n: '02', label: 'VISION', to: 'vision' },
  { n: '03', label: 'SERVICES', to: 'services' },
  { n: '04', label: 'PRICING', to: 'pricing' },
  { n: '05', label: 'CONTACT', to: 'contact' },
]

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
      <div className="ruler-cm" aria-hidden="true" />
      <div className="ruler-inches" ref={track}>
        {INCHES.map((s) => (
          <button
            key={s.n}
            className={route === s.to ? 'ruler-inch ruler-on' : 'ruler-inch'}
            onClick={() => navigate(s.to)}
            aria-label={`${s.n} — ${s.label}`}
            aria-current={route === s.to ? 'page' : undefined}
          >
            <span className="ruler-n">{s.n}</span>
            <i className="ruler-tick" aria-hidden="true" />
            <span className="ruler-tag">{s.label}</span>
          </button>
        ))}
      </div>
      <div className="ruler-needle" ref={needle} aria-hidden="true" />
    </aside>
  )
}
