import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navigate, xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* WORLDS — three rooms, same employee. Each station is a business XEVEN
   already runs at night: the rush, the desk, the graveyard shift. One lazy
   R3F vignette opens the tour; the rooms themselves are pure CSS light. */

const R3FDemo = lazy(() => import('../components/R3FDemo'))

const STATIONS = [
  {
    art: 'cafe',
    num: '01',
    name: 'Café — Morning Rush',
    body: 'Six-forty and the line is out the door. XEVEN remembers every regular — oat-milk-first, name on the cup before they speak — while the humans pour.',
    chips: ['REGULARS HELD', '0 MISSED ORDERS', 'CHAT + VOICE'],
  },
  {
    art: 'clinic',
    num: '02',
    name: 'Clinic — Front Desk',
    body: 'Nobody waits on hold. XEVEN ranks real availability inside office hours, holds five minutes, confirms in two taps — nights, launches, holidays.',
    chips: ['5-MIN HOLDS', '60-DAY WINDOW', 'NO HOLD MUSIC'],
  },
  {
    art: 'store',
    num: '03',
    name: 'Store — Night Shift',
    body: 'While you sleep it watches every cart, nudges the waverers, answers sizing at 3AM from verified stock — browsers become buyers by morning.',
    chips: ['CARTS RECOVERED', '0 INVENTED PRICES', '24/7'],
  },
]

export default function Worlds() {
  const root = useRef<HTMLDivElement>(null!)
  const [reduced] = useState(() => xs.reduced)

  useEffect(() => {
    if (xs.reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.rv').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="page" ref={root}>
      <p className="mono">WORLDS — WHERE IT WORKS</p>
      <h1 className="page-title">One employee, every kind of shop.</h1>
      <p className="page-lede">Walk the rooms. Each one is a real shift, running right now.</p>

      <figure className="field-study landed">
        {reduced ? (
          <div className="field-study-still" aria-hidden="true" />
        ) : (
          <Suspense fallback={<div className="field-study-still" aria-hidden="true" />}>
            <R3FDemo />
          </Suspense>
        )}
        <figcaption className="mono">FIELD STUDY — THE SHIFT, PROCEDURAL</figcaption>
      </figure>

      <div className="world-grid">
        {STATIONS.map((s) => (
          <article className="station rv" key={s.num}>
            <div className={`station-art ${s.art}`} aria-hidden="true">
              <span className="station-num">{s.num}</span>
            </div>
            <div className="station-body">
              <h2>{s.name}</h2>
              <p>{s.body}</p>
              <div className="station-chips">
                {s.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <button className="pill pill-ghost" data-cursor onClick={() => navigate('playground')}>
                Work this room →
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-cta-row" style={{ marginTop: 'var(--s32)' }}>
        <button className="pill" data-cursor onClick={() => navigate('demo')}>
          Put it in your shop →
        </button>
      </div>
    </div>
  )
}
