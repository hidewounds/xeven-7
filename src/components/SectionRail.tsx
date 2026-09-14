import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Index section rail: a fixed measurement-style ruler on the left edge.
   Five ticks (00–04) mirror the enter sections; the live section lights
   mint with its tag. Clicking a tick scrolls there. Index-only by
   construction (mounted inside EnterStage), hidden on small screens, and
   fully static under reduced motion. */

const STOPS = [
  { n: '00', label: 'TOP', sel: '.st-hero' },
  { n: '01', label: 'CAPABILITIES', sel: '.st-caps' },
  { n: '02', label: 'PROCESS', sel: '.st-proc' },
  { n: '03', label: 'SHOWREEL', sel: '.st-reel' },
  { n: '04', label: 'DEPARTURE', sel: '.st-foot' },
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
    // progress hairline: fills top→bottom with page scroll (scrubbed,
    // transform-only; static zero under reduced motion)
    let st: ScrollTrigger | undefined
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        animation: gsap.to('.rail-progress', { scaleY: 1, ease: 'none', paused: true }),
      })
    }
    return () => {
      io.disconnect()
      st?.kill()
    }
  }, [])

  const jump = (sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav className="rail" aria-label="Index sections">
      <span className="rail-progress" aria-hidden="true" />
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
