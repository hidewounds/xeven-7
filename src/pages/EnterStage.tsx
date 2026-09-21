import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRODUCT, TRIAL } from '../data/product'
import { navigate, useRouteReady, xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* ENTER — the field is the page. Empty hero viewport over the living XEVEN
   mark, then the field's own anatomy as specimen rows, then departure. */

const ANATOMY = [
  { n: '01', t: 'Hairlines', d: 'Every diamond outlined, never glowing. Boundaries, not decoration.' },
  { n: '02', t: 'RGB drift', d: 'Channel weather phases across the grid — green to red to violet, always moving on index.' },
  { n: '03', t: 'Cinema clock', d: 'Sparse panels light on a seven-second loop. The field keeps its own time.' },
  { n: '04', t: 'Hollow mark', d: 'The word hangs in the field itself, outlined and weightless — never laid on top.' },
]

export default function EnterStage() {
  useRouteReady()
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
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="page">
      <section className="st-hero hero-center" id="top" aria-label="XEVEN">
        <h1 className="sr-only">{PRODUCT.hero}</h1>
        <p className="hero-sub">{PRODUCT.sub}</p>
      </section>
      <section className="zone" id="anatomy" aria-label="Field anatomy">
        <p className="mono zone-kicker rv">ANATOMY OF THE FIELD</p>
        <h2 className="zone-title rv">Built from four moves.</h2>
        {ANATOMY.map((r) => (
          <div className="t-row rv" key={r.n}>
            <span className="t-n">{r.n}</span>
            <div>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="fin" id="finale" aria-label="Departure">
        <p className="mono rv">{TRIAL.kicker}</p>
        <h2 className="zone-title rv">{TRIAL.title}</h2>
        <p className="page-lede rv">{TRIAL.lede}</p>
        <div className="hero-cta-row rv" style={{ marginTop: 'var(--s24)' }}>
          <button className="pill" data-cursor onClick={() => navigate('demo')}>
            Book a demo →
          </button>
          <button className="pill pill-ghost" data-cursor onClick={() => navigate('worlds')}>
            See the worlds
          </button>
        </div>
      </section>
    </div>
  )
}
