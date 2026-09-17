import { useEffect, useRef, useState } from 'react'
import { scrollBus } from '../app/store'
import type { Route } from '../app/store'

/* RulerBar: index-only section navigator. On the home journey it shows
   the five section stops (never routes); clicking one smooth-scrolls to
   it, the needle rides page scroll, and the active inch tracks the
   section in view. Hidden on all other routes and small screens;
   scroll-linked (no animation) so it stands down under reduced motion. */

const STOPS = [
  { n: '00', label: 'TOP', sel: '.st-hero' },
  { n: '01', label: 'TELEMETRY', sel: '.st-proc' },
  { n: '02', label: 'INSTRUMENTS', sel: '.st-caps' },
  { n: '03', label: 'PROOF', sel: '.st-bolt' },
  { n: '04', label: 'START', sel: '.st-trial' },
]

export default function RulerBar({ route }: { route: Route }) {
  const needle = useRef<HTMLDivElement>(null!)
  const track = useRef<HTMLDivElement>(null!)
  const [at, setAt] = useState(0)
  const atRef = useRef(0)

  useEffect(() => {
    if (route !== 'enter') return
    let raf = 0
    const place = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
      if (needle.current && track.current) {
        needle.current.style.transform = `translateY(${(p * track.current.clientHeight).toFixed(1)}px)`
      }
      // active stop: last section whose top cleared the upper-middle band
      const line = y + window.innerHeight * 0.45
      let cur = 0
      STOPS.forEach((s, i) => {
        const el = document.querySelector(s.sel)
        if (el && el.getBoundingClientRect().top + y <= line) cur = i
      })
      if (cur !== atRef.current) {
        atRef.current = cur
        setAt(cur)
      }
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

  if (route !== 'enter') return null

  return (
    <aside className="ruler" aria-label="Page sections">
      {/* subdivisions: exactly two cm ticks + one big mid-inch per gap,
          positioned at quarters so every gap reads identically */}
      <div className="ruler-subs" aria-hidden="true">
        {STOPS.slice(0, -1).map((s, i) => (
          <div
            key={s.n}
            className="ruler-gap"
            style={{ top: `${(i / (STOPS.length - 1)) * 100}%`, height: `${100 / (STOPS.length - 1)}%` }}
          >
            <i className="ruler-cm" />
            <i className="ruler-mid" />
            <i className="ruler-cm" />
          </div>
        ))}
      </div>
      <div className="ruler-inches" ref={track}>
        {STOPS.map((s, i) => (
          <button
            key={s.n}
            className={at === i ? 'ruler-inch ruler-on' : 'ruler-inch'}
            onClick={() => scrollBus.scrollTo?.(s.sel)}
            aria-label={`${s.n} — ${s.label}`}
            aria-current={at === i ? 'true' : undefined}
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
