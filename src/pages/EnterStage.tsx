import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { navigate, xs } from '../app/store'
import type { Route } from '../app/store'
gsap.registerPlugin(ScrollTrigger, SplitText)

/* Index v3 — full site: hero, capabilities, process, worlds, finale.
   Frameless stations, one timeline per property, transform/opacity only. */

const CAPS = [
  { t: 'Living 3D Worlds', d: 'Real-time scenes that breathe, react and remember.', s: 'WebGL · GLSL · 60fps' },
  { t: 'Cinematic Motion', d: 'Scroll-choreographed camera, cut like film.', s: 'GSAP · Scroll · Lenis' },
  { t: 'Interactive Systems', d: 'Every pixel answers the pointer.', s: 'Pointer · State · Realtime' },
  { t: 'Reactive Systems', d: 'Interfaces that sense, respond and adapt.', s: 'Sensors · Motion · Adapt' },
]

const STEPS = [
  {
    n: '01',
    t: 'Signal',
    d: 'We listen first. Every world starts as a frequency.',
    meta: 'PHASE 01 · LISTEN — WEEK 1',
    points: [
      'Deep-dive call — goals, audience, taboos.',
      'Signal map: what the world must feel like.',
      'One metric that decides launch.',
    ],
  },
  {
    n: '02',
    t: 'Worldbuild',
    d: 'Geometry, light and law — the physics of the place.',
    meta: 'PHASE 02 · BUILD — WEEKS 2–3',
    points: [
      'Scene architecture and art direction.',
      'Light, physics and layout laws.',
      'Playable grey-box draft in your hands.',
    ],
  },
  {
    n: '03',
    t: 'Ignite',
    d: 'Motion and interaction switch on together.',
    meta: 'PHASE 03 · MOTION — WEEK 4',
    points: [
      'Scroll choreography pass, cut like film.',
      'Interaction and sound hooks wired.',
      '60fps budget enforced on real hardware.',
    ],
  },
  {
    n: '04',
    t: 'Live',
    d: 'Ship it breathing. Tune it forever.',
    meta: 'PHASE 04 · SHIP — ONGOING',
    points: [
      'Deploy, then measure the one metric.',
      'Weekly tuning loop with your team.',
      'You own everything — no hostages.',
    ],
  },
]

const TEASE: Array<{ t: string; d: string; c: string; to: Route }> = [
  { t: 'Worlds', d: 'Built locations, not pages.', c: 'tease-ember', to: 'worlds' },
  { t: 'Vision', d: 'Why the static web is over.', c: 'tease-mint', to: 'vision' },
  { t: 'Services', d: 'Four disciplines, one world.', c: 'tease-bone', to: 'services' },
]

/* Departure clock: local time, per-minute tick (one interval, one text
   node — zero scroll-path cost). */
function FootTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="mono foot-time">
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — LOCAL
    </p>
  )
}

export default function EnterStage() {
  const root = useRef<HTMLDivElement>(null!)
  const scroll = useRef({ v: 0 })
  const vel = useRef({ v: 0 })
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useLayoutEffect(() => {
    // reduced motion: no SplitText, pins, or scrubs — no ticker burn.
    // Readable final states come from CSS + initial values below.
    if (reduced) return
    const ctx = gsap.context(() => {
      // headline reveal
      const split = new SplitText('.st-hero-title', { type: 'lines,words,chars', mask: 'lines', autoSplit: true })
      gsap.from(split.chars, { yPercent: 120, duration: 1.1, ease: 'expo.out', stagger: 0.02, delay: 0.3 })
      gsap.to('.st-fade', { opacity: 0, y: -50, ease: 'none', scrollTrigger: { trigger: '.st-hero', start: 'top top', end: 'bottom 30%', scrub: 1.2 } })
      // dolly through space: the title pushes toward the camera and drifts
      // up as the hero exits (parent scale — the SplitText chars own their
      // own transforms, never contested)
      gsap.to('.st-hero-title', {
        scale: 1.18,
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: '.st-hero', start: 'top top', end: 'bottom 20%', scrub: 1.2 },
      })
      // ghost echo drifts slower than the title (depth without parallax
      // libraries — transform-only, own property, own trigger range)
      gsap.to('.hero-echo', {
        yPercent: 24,
        ease: 'none',
        scrollTrigger: { trigger: '.st-hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      })
      // scroll cue: mint hairline draws as the hero leaves
      gsap.fromTo(
        '.st-cue b',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-hero', start: 'top top', end: 'bottom 35%', scrub: 1.2 },
        },
      )

      // wordmark yields while the field owns the page, returns for departure
      const tbLogo = document.querySelector('.tb-logo')
      if (tbLogo) {
        gsap.to(tbLogo, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.st-hero', start: 'bottom 75%', end: 'bottom 30%', scrub: 1.2 },
        })
        gsap.to(tbLogo, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.st-fin', start: 'top 95%', end: 'top 55%', scrub: 1.2 },
        })
      }

      // progress mirrors — trigger is the context root itself: selector text
      // inside gsap.context only matches descendants, so '.st-scroll'
      // resolves to nothing (GSAP "Element not found", mirror never fires)
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scroll.current.v = self.progress
          const v = Math.min(1, Math.abs(self.getVelocity()) / 3000)
          vel.current.v = v
          xs.vel = v
        },
      })

      // capability stations arrive on the descent — one writer per station
      gsap.utils.toArray<HTMLElement>('.cap-station').forEach((row) => {
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

      // connector thread: stub runs center→spine, spine draws, ember node
      // rides stub→spine — ONE timeline owns stub, node and spine
      const spineH = () => document.querySelector('.proc-line')?.clientHeight ?? 0
      const stubW = () =>
        -(window.innerWidth * 0.42 - (window.innerWidth <= 900 ? 22 : 114))
      const lineTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.st-proc',
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })
      lineTl
        .fromTo('.proc-stub', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 0.3 }, 0)
        .fromTo(
          '.thread-node',
          { x: 0, y: 0, scale: 0 },
          { x: stubW, y: 0, scale: 1, ease: 'none', duration: 0.3 },
          0,
        )
        .to('.thread-node', { y: spineH, ease: 'none', duration: 0.7 }, 0.3)
        .fromTo('.proc-line > span', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 0.7 }, 0.3)

      // process rows arrive — one writer per row (observer owns classes)
      gsap.utils.toArray<HTMLElement>('.st-proc .proc-row').forEach((row) => {
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

      // worlds teaser lands in stagger
      gsap.fromTo(
        '.tease-card',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          immediateRender: false,
          scrollTrigger: { trigger: '.tease-grid', start: 'top 85%', end: 'top 45%', scrub: 1.2 },
        },
      )

      // finale title rises
      gsap.fromTo(
        '.st-fin h2',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-fin', start: 'top 85%', end: 'top 60%', scrub: 1.2 },
        },
      )
    }, root)

    // active process row: IntersectionObserver toggles a class (discrete —
    // deliberately NOT a GSAP color writer; the class only touches
    // text-shadow + the ::after bar, props nothing else writes)
    const rows = root.current.querySelectorAll('.st-proc .proc-row')
    const rio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            rows.forEach((r) => r.classList.remove('proc-on'))
            e.target.classList.add('proc-on')
          }
        }
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    rows.forEach((r) => rio.observe(r))

    return () => {
      ctx.revert()
      rio.disconnect()
    }
  }, [reduced])

  return (
    <div className="st-scroll" ref={root}>
      <section className="st-hero">
        <div className="hero-echo" aria-hidden="true">
          XEVEN
        </div>
        <p className="mono st-fade">00 — TOP</p>
        <h1 className="st-hero-title">WHAT IS XEVEN?</h1>
        <p className="st-sub st-fade">Experience engine. Living systems. Nothing static survives.</p>
        <p className="st-hint">
          <span>scroll to explore →</span>
          <i className="st-cue" aria-hidden="true">
            <b />
          </i>
        </p>
      </section>

      <section className="st-caps">
        <p className="mono">01 — CAPABILITIES</p>
        {CAPS.map((c, i) => (
          <article key={c.t} className="cap-station" aria-label={`${c.t}, capability ${i + 1} of ${CAPS.length}`}>
            <span className="cap-ghost" aria-hidden="true">
              {`0${i + 1}`}
            </span>
            <p className="mono cap-kicker">
              CAPABILITY {`0${i + 1}`} / {`0${CAPS.length}`}
            </p>
            <h3>{c.t}</h3>
            <p className="cap-desc">{c.d}</p>
            <p className="cap-stack">{c.s}</p>
          </article>
        ))}
      </section>

      <section className="st-proc">
        <p className="mono">02 — PROCESS</p>
        <i className="thread-node" aria-hidden="true" />
        <div className="proc-line" aria-hidden="true">
          <i className="proc-stub" />
          <span />
        </div>
        {STEPS.map((s) => (
          <div key={s.n} className="proc-row">
            <span className="proc-n">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <p className="proc-meta">{s.meta}</p>
            <ul className="proc-points">
              {s.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="st-work">
        <p className="mono">03 — WORLDS</p>
        <div className="tease-grid">
          {TEASE.map((w) => (
            <button key={w.t} className="tease-card" onClick={() => navigate(w.to)} data-cursor aria-label={`Go to ${w.t}`}>
              <span className={`tease-thumb ${w.c}`} aria-hidden="true" />
              <b>{w.t}</b>
              <i>{w.d}</i>
            </button>
          ))}
        </div>
      </section>

      <footer className="st-fin">
        <p className="mono">04 — DEPARTURE</p>
        <h2>STEP INSIDE</h2>
        <a href="mailto:hello@xeven.world" data-cursor>
          hello@xeven.world
        </a>
        <FootTime />
      </footer>
    </div>
  )
}
