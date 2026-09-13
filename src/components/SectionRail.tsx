import { useEffect, useState } from 'react'

/* Index section rail: a fixed measurement-style ruler on the left edge.
   Eight ticks (00–07) mirror the enter sections; the live section lights
   mint with its tag. Clicking a tick scrolls there. Index-only by
   construction (mounted inside EnterStage), hidden on small screens, and
   fully static under reduced motion. */

const STOPS = [
  { n: '00', label: 'HERO VOID', sel: '.st-hero' },
  { n: '01', label: 'MANIFESTO', sel: '.st-mani' },
  { n: '02', label: 'CAPABILITIES', sel: '.st-caps' },
  { n: '03', label: 'SHOWREEL', sel: '.st-reel' },
  { n: '04', label: 'PROCESS', sel: '.st-proc' },
  { n: '05', label: 'PROOF', sel: '.st-stats' },
  { n: '06', label: 'ENGAGE', sel: '.st-tier' },
  { n: '07', label: 'DEPARTURE', sel: '.st-foot' },
]

export default function SectionRail() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const els = STOPS.map((s) => document.querySelector(s.sel)).filter(
      (el): el is Element => el !== null,
    )
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = STOPS.findIndex((s) => e.target.matches(s.sel))
          if (i >= 0) setActive(i)
        }
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const jump = (sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav className="rail" aria-label="Index sections">
      {STOPS.map((s, i) => (
        <button
          key={s.n}
          className={i === active ? 'rail-btn rail-on' : 'rail-btn'}
          onClick={() => jump(s.sel)}
          aria-label={`${s.n} — ${s.label}`}
          aria-current={i === active ? 'true' : undefined}
        >
          <span className="rail-n" aria-hidden="true">
            {s.n}
          </span>
          <span className="rail-tick" aria-hidden="true" />
          {i === active && (
            <span className="rail-tag" aria-hidden="true">
              {s.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
