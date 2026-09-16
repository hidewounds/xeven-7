import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import FilmStage from '../components/FilmStage'
import { xs } from '../app/store'
gsap.registerPlugin(ScrollTrigger, SplitText)

/* Index v2 — BURST: the model is the hero. Sharp stage film up top,
   anatomy stations on the descent, rotation-study cards, contact finale.
   One timeline per property, transform/opacity only, lazy render. */

const PARTS = [
  {
    n: '01',
    t: 'Halo',
    d: 'Starburst crown in sparse white linework — ten thousand sticks pretending to be ten million.',
  },
  {
    n: '02',
    t: 'Visor',
    d: 'Smoked dark, drawn by absence. The face is what the lines refuse to say.',
  },
  {
    n: '03',
    t: 'Grin',
    d: 'Gap-tooth grin over a ∇ torso. Friendly the way a signal flare is friendly.',
  },
  {
    n: '04',
    t: 'Hands',
    d: 'Free hands floating on sine waves, out of phase with each other forever.',
  },
]

const ANGLES = [
  { src: '/assets/stills/front.png', t: 'Front', sub: '00 — face on' },
  { src: '/assets/stills/three-quarter.png', t: 'Three-quarter', sub: '01 — mid-turn' },
  { src: '/assets/stills/side.png', t: 'Side', sub: '02 — profile' },
]

export default function EnterStage() {
  const root = useRef<HTMLDivElement>(null!)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // title reveal on load
      const split = new SplitText('.bx-title', { type: 'lines,words,chars', mask: 'lines', autoSplit: true })
      gsap.from(split.chars, { yPercent: 120, duration: 1.1, ease: 'expo.out', stagger: 0.02, delay: 0.3 })
      // stage settles: near-native scale lands as the hero arrives
      gsap.fromTo(
        '.stage-film',
        { scale: 1.06 },
        {
          scale: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.bx-hero', start: 'top top', end: 'bottom 40%', scrub: 1.2 },
        },
      )
      // scroll cue draws as the hero leaves
      gsap.fromTo(
        '.st-cue b',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.bx-hero', start: 'top top', end: 'bottom 35%', scrub: 1.2 },
        },
      )
      // wordmark yields while the model owns the page, returns for departure
      const tbLogo = document.querySelector('.tb-logo')
      if (tbLogo) {
        gsap.to(tbLogo, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.bx-hero', start: 'bottom 75%', end: 'bottom 30%', scrub: 1.2 },
        })
        gsap.to(tbLogo, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.bx-fin', start: 'top 95%', end: 'top 55%', scrub: 1.2 },
        })
      }
      // scroll velocity mirror for the world kindle
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          xs.vel = Math.min(1, Math.abs(self.getVelocity()) / 3000)
        },
      })
      // anatomy stations rise on the descent — one writer per row
      gsap.utils.toArray<HTMLElement>('.bx-part').forEach((row) => {
        gsap.fromTo(
          row,
          { y: 60, opacity: 0.3 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 48%', scrub: 1.2 },
          },
        )
      })
      // rotation cards land in stagger
      gsap.fromTo(
        '.bx-card',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          immediateRender: false,
          scrollTrigger: { trigger: '.bx-cards', start: 'top 85%', end: 'top 45%', scrub: 1.2 },
        },
      )
      // finale title rises
      gsap.fromTo(
        '.bx-fin h2',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.bx-fin', start: 'top 85%', end: 'top 60%', scrub: 1.2 },
        },
      )
    }, root)
    return () => {
      ctx.revert()
    }
  }, [reduced])

  return (
    <div className="st-scroll" ref={root}>
      <section className="bx-hero">
        <p className="mono">XEVEN — BURST STUDY X-002</p>
        <FilmStage />
        <h1 className="bx-title">THE MODEL MOVES</h1>
        <p className="bx-sub">Eight million white sticks. One red room. Nothing static survives.</p>
        <p className="st-hint">
          <span>scroll →</span>
          <i className="st-cue" aria-hidden="true">
            <b />
          </i>
        </p>
      </section>

      <section className="bx-fig">
        <p className="mono">ANATOMY — FOUR PARTS</p>
        {PARTS.map((p) => (
          <article key={p.n} className="bx-part">
            <span className="bx-ghost" aria-hidden="true">
              {p.n}
            </span>
            <span className="proc-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </article>
        ))}
      </section>

      <section className="bx-work">
        <p className="mono">ROTATION STUDY — THREE ANGLES</p>
        <div className="bx-cards">
          {ANGLES.map((a) => (
            <a key={a.t} className="bx-card" href="#/worlds">
              <img src={a.src} alt={`Burst model — ${a.t}`} loading="lazy" />
              <span className="bx-cardmeta">
                <b>{a.t}</b>
                <i>{a.sub}</i>
              </span>
            </a>
          ))}
        </div>
      </section>

      <footer className="bx-fin">
        <p className="mono">DEPARTURE</p>
        <h2>STEP INSIDE</h2>
        <a href="mailto:hello@xeven.world" data-cursor>
          hello@xeven.world
        </a>
      </footer>
    </div>
  )
}
