import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import VideoCard, { PH } from '../components/VideoCard'
import SectionRail from '../components/SectionRail'
import { navigate, xs } from '../app/store'
gsap.registerPlugin(ScrollTrigger, SplitText)

const CAPS = [
  { t: 'Living 3D Worlds', d: 'Real-time scenes that breathe, react and remember.', src: PH.head, specs: ['WebGL', 'GLSL', '60fps'] },
  { t: 'Cinematic Motion', d: 'Scroll-choreographed camera, cut like film.', src: PH.chrome, specs: ['GSAP', 'Scroll', 'Lenis'] },
  { t: 'Interactive Systems', d: 'Every pixel answers the pointer.', src: PH.aerial, specs: ['Pointer', 'State', 'Realtime'] },
  { t: 'Reactive Systems', d: 'Interfaces that sense, respond and adapt.', src: PH.metal, specs: ['Sensors', 'Motion', 'Adapt'] },
]

const REEL = [
  { src: PH.ink, title: 'Ink study 01', sub: 'fluid' },
  { src: PH.aerial, title: 'Night passage', sub: 'aerial' },
  { src: PH.chrome, title: 'Chrome drift', sub: 'metal' },
  { src: PH.head, title: 'Signal head', sub: 'particles' },
  { src: PH.metal, title: 'Melt 04', sub: 'heat' },
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

/* Specimen index: editorial rows that open as they cross center —
   IO-driven (rail/proc pattern: zero GSAP writers, zero conflicts).
   Clicking a row opens it exclusively. First specimen open by default. */
function SpecimenRows() {
  const [open, setOpen] = useState(0)
  const list = useRef<HTMLDivElement>(null!)
  useEffect(() => {
    const el = list.current
    if (!el) return
    const rows = [...el.querySelectorAll('.spec-row')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = rows.indexOf(e.target as Element)
          if (i >= 0) setOpen(i)
        }
      },
      { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
    )
    rows.forEach((r) => io.observe(r))
    return () => io.disconnect()
  }, [])
  return (
    <div className="spec-list" ref={list}>
      {CAPS.map((c, i) => (
        <div key={c.t} className={i === open ? 'spec-row spec-open' : 'spec-row'}>
          <button
            className="spec-head"
            onClick={() => setOpen(i)}
            aria-expanded={i === open}
            data-cursor
          >
            <span className="spec-n" aria-hidden="true">
              {`0${i + 1}`}
            </span>
            <span className="spec-title">{c.t}</span>
            <span className="spec-x" aria-hidden="true">
              {i === open ? '—' : '+'}
            </span>
          </button>
          <div className="spec-body" aria-hidden={i !== open}>
            <div className="spec-inner">
              <div className="spec-media">
                <VideoCard src={c.src} title={c.t} sub={c.d} />
              </div>
              <div className="spec-info">
                <p>{c.d}</p>
                <div className="cap-specs" aria-label={`${c.t} stack`}>
                  {c.specs.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

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

  const toTop = () => {
    navigate('enter')
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

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

      // migrating mark: the topbar wordmark yields as a small fixed mark
      // rises bottom-center (both directions scrub cleanly)
      const tbLogo = document.querySelector('.tb-logo')
      if (tbLogo) {
        gsap.to(tbLogo, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.st-hero', start: 'bottom 75%', end: 'bottom 30%', scrub: 1.2 },
        })
        // the wordmark returns for departure once the wipe has cleared
        gsap.to(tbLogo, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.st-foot', start: 'top 95%', end: 'top 55%', scrub: 1.2 },
        })
      }
      gsap.fromTo(
        '.mark-fixed',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.st-hero', start: 'bottom 75%', end: 'bottom 30%', scrub: 1.2 },
        },
      )

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

      // showreel ORBIT: the takes ride a shared ellipse around the frame
      // centre as the pin scrubs — upright always (no self-rotation, titles
      // stay readable), depth driving scale/opacity/zIndex. Front = bottom
      // of the ellipse; one full revolution cycles every take through it.
      // ONE layout writer (scrub proxy + resize share it); transform-only.
      const cells = gsap.utils.toArray<HTMLElement>('.reel-cell')
      // reel counter readout: front-take index (direct DOM write, only on
      // change — no react state down the scroll path)
      const reelCount = root.current.querySelector('.reel-count span')
      let lastCount = ''
      const TAU = Math.PI * 2
      const layoutOrbit = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const RX = Math.min(vw * 0.36, 560)
        const RY = Math.min(vh * 0.22, 240)
        let best = 0
        let bf = -1
        cells.forEach((cell, i) => {
          const a = ((i / cells.length) * TAU + orbit.rot + Math.PI / 2) % TAU
          const f = (Math.sin(a) + 1) / 2
          gsap.set(cell, {
            x: Math.cos(a) * RX,
            y: Math.sin(a) * RY,
            scale: 0.62 + f * 0.48,
            opacity: 0.2 + f * 0.8,
            zIndex: Math.round(f * 10),
          })
          if (f > bf) {
            bf = f
            best = i
          }
        })
        if (reelCount) {
          const t = String(best + 1).padStart(2, '0')
          if (t !== lastCount) {
            lastCount = t
            reelCount.textContent = t
          }
        }
      }
      const orbit = { rot: 0 }
      const orbitTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.st-reel',
          start: 'top top',
          end: '+=280%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      })
      orbitTl.fromTo(
        orbit,
        { rot: 0 },
        { rot: TAU, ease: 'none', duration: 1, onUpdate: layoutOrbit },
        0,
      )
      // letterbox: cinematic bars close over the pin and lift at release
      orbitTl.fromTo(
        '.reel-bar-top',
        { yPercent: -100 },
        { yPercent: 0, ease: 'none', duration: 0.08 },
        0,
      )
      orbitTl.fromTo(
        '.reel-bar-bottom',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 0.08 },
        0,
      )
      orbitTl.to('.reel-bar-top', { yPercent: -100, ease: 'none', duration: 0.08 }, 0.92)
      orbitTl.to('.reel-bar-bottom', { yPercent: 100, ease: 'none', duration: 0.08 }, 0.92)
      layoutOrbit()
      // white wash: a soft light that integrates with the dark field instead
      // of covering it — one timeline owns the veil end to end (two
      // competing scrubbed tweens on one property resolve
      // nondeterministically on discontinuous jumps)
      const veilTl = gsap.timeline({
        scrollTrigger: { trigger: '.st-reel', start: 'top 90%', end: 'bottom -120%', scrub: 1.2 },
      })
      veilTl
        .fromTo(
          '.veil-white',
          { clipPath: 'circle(0px at 50% calc(100% - 48px))', opacity: 0 },
          { clipPath: 'circle(150vmax at 50% calc(100% - 48px))', opacity: 1, ease: 'none', duration: 0.8 },
          0,
        )
        .to('.veil-white', { clipPath: 'circle(0px at 50% calc(100% - 48px))', opacity: 0, ease: 'none', duration: 1 }, 2.2)
      // process lives on the dark field — no spread, no takeover. The ink
      // stays bone/muted/mint throughout (pure CSS); the thread, the node
      // and the active-row light carry the motion instead.
      // departure handoff: the fixed mark simply yields as process ends so
      // the returning wordmark owns the finale — no rise, no growth, no
      // cover. Just release.
      gsap.to('.mark-fixed', {
        autoAlpha: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '.st-proc', start: 'bottom 100%', end: 'bottom 40%', scrub: 1.2 },
      })

      // connector thread: a stub leaves the mark's side (center) and runs
      // to the spine, then the proc spine draws top→bottom — ONE timeline
      // owns stub, node and spine (single writer; scale/translate only,
      // chained origins). The ember node rides the same path: across the
      // stub (0–0.3), then down the spine (0.3–1).
      const spineH = () => document.querySelector('.proc-line')?.clientHeight ?? 0
      // stub travel: viewport center → spine x (spine sits right of the rail
      // on desktop, at the row gutter on small screens where the rail hides)
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

      // second-half rhythm: footer title rises on the scrub:1.2 heartbeat.
      // Lazy render throughout.
      gsap.fromTo(
        '.st-foot h2',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-foot', start: 'top 85%', end: 'top 60%', scrub: 1.2 },
        },
      )
    }, root)

    // active process row: IntersectionObserver toggles a class (discrete,
    // rail-pattern — deliberately NOT a GSAP color writer, which would
    // contest the bloom timeline's ink on jumps; the class only touches
    // text-shadow + the ::after bar, props bloom never writes)
    const rows = root.current.querySelectorAll('.proc-row')
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
      <SectionRail />
      <div className="veil-white" aria-hidden="true" />
      <button className="mark-fixed" onClick={toTop} data-cursor aria-label="XEVEN — back to top">
        <span className="mark-word">XEVEN</span>
        <span className="mark-x" aria-hidden="true">
          X
        </span>
      </button>
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
        <SpecimenRows />
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

      <section className="st-reel">
        <div className="reel-ghost" aria-hidden="true">
          SHOWREEL — SHOWREEL — SHOWREEL
        </div>
        <p className="reel-count" aria-hidden="true">
          <span>01</span> / {String(REEL.length).padStart(2, '0')}
        </p>
        <div className="reel-track">
          {REEL.map((r) => (
            <div key={r.title} className="reel-cell">
              <VideoCard src={r.src} title={r.title} sub={r.sub} />
            </div>
          ))}
        </div>
        <div className="reel-bar reel-bar-top" aria-hidden="true" />
        <div className="reel-bar reel-bar-bottom" aria-hidden="true" />
      </section>

      <footer className="st-foot">
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
