import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INSTRUMENTS, PRODUCT, TELEMETRY, TRIAL } from '../data/product'
import { navigate, xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* ENTER — the night shift, rebuilt. Free-floating XEVEN mark opens the hero,
   then the live ledger, capabilities, worlds teaser, process, departure.
   Sections carry ids for the index-only rail. Reveals are transform/opacity
   only; reduced motion gets final states. */

const LEDGER: Array<[string, string[]]> = [
  ['CHATS', ['12,408 this week', 'midnight rush handled', '3 languages tonight']],
  ['CARTS', ['2 recovered', '1 held at checkout', '0 abandoned twice']],
  ['SLOTS', ['96 demos held', 'Tue 3PM just went', 'holds expire in 5:00']],
  ['FACTS', ['38K held', '0 invented', '1 erased on request']],
]

function Ledger() {
  const refs = useRef<Array<HTMLSpanElement | null>>([])
  useEffect(() => {
    if (xs.reduced) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const s = Math.floor((now - t0) / 2600)
      refs.current.forEach((el, i) => {
        if (el) el.textContent = LEDGER[i][1][s % LEDGER[i][1].length]
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="ledger" aria-label="Live shift board">
      {LEDGER.map(([word, notes], i) => (
        <div className="ledger-row" key={word}>
          <span className={`ledger-dot${i === 2 ? ' ember' : ' mint'}`} aria-hidden="true" />
          <span className="ledger-word">{word}</span>
          <span className="ledger-note" ref={(el) => { refs.current[i] = el }}>
            {notes[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

function Clock() {
  const ref = useRef<HTMLParagraphElement>(null!)
  useEffect(() => {
    if (xs.reduced) {
      ref.current.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return
    }
    let raf = 0
    const tick = () => {
      ref.current.textContent =
        'SHIFT TIME ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <p className="clock" ref={ref} aria-live="off" />
}

export default function EnterStage() {
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
      <section className="st-hero" id="top">
        <p className="hero-mark" aria-hidden="true">XEVEN</p>
        <p className="mono rv">XEVEN — THE NIGHT SHIFT</p>
        <h1 className="hero-title rv">{PRODUCT.hero}</h1>
        <p className="hero-sub rv">{PRODUCT.sub}</p>
        <div className="hero-cta-row rv">
          <button className="pill" data-cursor onClick={() => navigate('demo')}>
            Book a demo →
          </button>
          <button className="pill pill-ghost" data-cursor onClick={() => navigate('worlds')}>
            See the worlds
          </button>
        </div>
        <Ledger />
      </section>

      <section className="zone" id="caps" aria-label="Capabilities">
        <p className="mono zone-kicker rv">01 — WHAT IT DOES ON SHIFT</p>
        <h2 className="zone-title rv">Five instruments, one employee.</h2>
        {INSTRUMENTS.map((r) => (
          <div className="t-row rv" key={r.t}>
            <span className="t-n">{r.s}</span>
            <div>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="zone" id="worlds" aria-label="Worlds">
        <p className="mono zone-kicker rv">02 — WHERE IT WORKS</p>
        <h2 className="zone-title rv">Three rooms, same employee.</h2>
        <div className="tease-grid">
          {[
            ['Café', 'Morning rush, remembered regulars, oat-milk-first.'],
            ['Clinic', 'Front desk that never puts anyone on hold.'],
            ['Store', 'Night shift that recovers carts while you sleep.'],
          ].map(([t, d]) => (
            <button key={t} className="tease rv" data-cursor onClick={() => navigate('worlds')} style={{ textAlign: 'left' }}>
              <p className="mono">{t.toUpperCase()} STATION</p>
              <h3>{t}</h3>
              <p>{d}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="zone" id="process" aria-label="Process">
        <p className="mono zone-kicker rv">03 — HOW A MESSAGE MOVES</p>
        <h2 className="zone-title rv">Hear, hold, answer, earn.</h2>
        {TELEMETRY.map((r) => (
          <div className="t-row rv" key={r.n}>
            <span className="t-n">{r.n}</span>
            <div>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
              <p className="mono">{r.meta}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="fin" id="departure" aria-label="Departure">
        <p className="mono rv">{TRIAL.kicker}</p>
        <h2 className="zone-title rv">{TRIAL.title}</h2>
        <p className="page-lede rv">{TRIAL.lede} {PRODUCT.trial}</p>
        <div className="hero-cta-row rv" style={{ marginTop: 'var(--s24)' }}>
          <button className="pill" data-cursor onClick={() => navigate('demo')}>
            Start the trial →
          </button>
          <button className="pill pill-ghost" data-cursor onClick={() => navigate('pricing')}>
            See pricing
          </button>
        </div>
        <Clock />
      </section>
    </div>
  )
}
