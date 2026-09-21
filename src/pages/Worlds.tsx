import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navigate, xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* WORLDS — three rooms, same employee. Café rush, clinic desk, store night
   shift. Pure CSS light; the field behind does the glowing. */

const STATIONS = [
  {
    art: 'cafe',
    num: '01',
    time: '06:40 — RUSH',
    name: 'Café — Morning Rush',
    body: 'Six-forty and the line is out the door. XEVEN remembers every regular — oat-milk-first, name on the cup before they speak — while the humans pour.',
    chips: ['REGULARS HELD', '0 MISSED ORDERS', 'CHAT + VOICE'],
    receipt: 'RECEIPT — “Oat-milk-first, Maya.” Held before she spoke. Verified.',
  },
  {
    art: 'clinic',
    num: '02',
    time: '13:00 — DESK',
    name: 'Clinic — Front Desk',
    body: 'Nobody waits on hold. XEVEN ranks real availability inside office hours, holds five minutes, confirms in two taps — nights, launches, holidays.',
    chips: ['5-MIN HOLDS', '60-DAY WINDOW', 'NO HOLD MUSIC'],
    receipt: 'RECEIPT — Ranked 3 real slots. Held 5:00. Confirmed in 2 taps.',
  },
  {
    art: 'store',
    num: '03',
    time: '03:00 — NIGHT',
    name: 'Store — Night Shift',
    body: 'While you sleep it watches every cart, nudges the waverers, answers sizing at 3AM from verified stock — browsers become buyers by morning.',
    chips: ['CARTS RECOVERED', '0 INVENTED PRICES', '24/7'],
    receipt: 'RECEIPT — 3AM sizing answered from stock. Silent where unverified.',
  },
]

export default function Worlds() {
  const root = useRef<HTMLDivElement>(null!)

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

      <div className="world-grid">
        {STATIONS.map((s) => (
          <article className="station rv" key={s.num}>
            <div className={`station-art ${s.art}`} aria-hidden="true">
              <span className="station-num">{s.num}</span>
              <span className="station-time mono">{s.time}</span>
            </div>
            <div className="station-body">
              <h2>{s.name}</h2>
              <p>{s.body}</p>
              <div className="station-chips">
                {s.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <p className="mono receipt-line">{s.receipt}</p>
              <button className="pill pill-ghost" data-cursor onClick={() => navigate('demo')}>
                Staff my shop →
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

