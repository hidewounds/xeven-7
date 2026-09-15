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

function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el || window.matchMedia('(pointer: coarse)').matches) return
        const r = el.getBoundingClientRect()
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -8
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 10
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      }}
      onMouseLeave={() => {
        ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
      }}
    >
      {children}
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

      // showreel STAGE: one pinned viewport, one item at a time taking it
      // full — each panel assembles (scale + fade in), holds, then yields
      // to the next through the frame. No conveyor, no tilt: cuts through
      // space, not across it. Single timeline owns every cell's opacity and
      // scale end to end (nothing else writes them).
      const cells = gsap.utils.toArray<HTMLElement>('.reel-cell')
      // reel counter readout: 01→N scrubbed to pin progress (direct DOM
      // write, no react state down the scroll path)
      const reelCount = root.current.querySelector('.reel-count span')
      const stageTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.st-reel',
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (reelCount) {
              reelCount.textContent = String(Math.min(cells.length, Math.floor(self.progress * cells.length) + 1)).padStart(2, '0')
            }
          },
        },
      })
      const STEP = 1.2
      cells.forEach((cell, i) => {
        const at = i * STEP
        // assemble: rise from small to full
        stageTl.fromTo(
          cell,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, ease: 'none', duration: 0.5, immediateRender: false },
          at,
        )
        // yield: push past full and dissolve for the next (the last cell
        // holds longest, then clears as the pin releases for departure)
        stageTl.to(cell, { opacity: 0, scale: 1.06, ease: 'none', duration: 0.5 }, at + (i < cells.length - 1 ? 0.7 : 1.0))
      })
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

      // capability deck: all 4 cards rest stacked directly BEHIND the
      // fixed mark (small held deck, fanned ±16°, edges peeking) and get
      // THROWN one-by-one to their alternating slots as you scroll.
      // Measured per-card deltas to the live mark point, recomputed on
      // refresh so resize never strands them. Transform + opacity only.
      const markEl = document.querySelector('.mark-fixed')
      const fanRot = [-16, -6, 6, 16]
      gsap.utils.toArray<HTMLElement>('.cap-card').forEach((card, i) => {
        // ghost numeral drifts against its card (yPercent only — the throw
        // timeline owns y, so the two never contest one property)
        const ghost = card.querySelector('.cap-ghost')
        if (ghost) {
          gsap.fromTo(
            ghost,
            { yPercent: 14 },
            {
              yPercent: -14,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
            },
          )
        }
        // deck peek: stacked cards offset a few px so the deck edges read
        // behind the logo before each card deals out
        const peekY = (i - 1.5) * 12
        const delta = () => {
          const m = (
            markEl ?? { getBoundingClientRect: () => ({ left: window.innerWidth / 2, top: window.innerHeight - 48, width: 0, height: 0 }) }
          ).getBoundingClientRect()
          const b = card.getBoundingClientRect()
          const gx = gsap.getProperty(card, 'x') as number
          const gy = gsap.getProperty(card, 'y') as number
          return {
            dx: m.left + m.width / 2 - (b.left + b.width / 2) + gx,
            dy: m.top + m.height / 2 - (b.top + b.height / 2) + gy,
          }
        }
        // THROW: the deck materializes behind the mark, then each card is
        // thrown arcing onto the page — x runs linear while y eases out, so
        // the flight path curves; rotation unwinds and scale blooms as it
        // lands. One timeline per card owns all its props (ghost parallax
        // owns yPercent only — never contested). Lazy render: the deck
        // displacement must not poison trigger measurement.
        const throwTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 110%',
            end: 'top 45%',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
        throwTl
          .fromTo(
            card,
            {
              x: () => delta().dx,
              y: () => delta().dy + peekY,
              scale: 0.25,
              rotation: fanRot[i % fanRot.length],
              opacity: 0,
              transformOrigin: '50% 50%',
            },
            { opacity: 1, ease: 'none', duration: 0.25, immediateRender: false },
            0,
          )
          .to(card, { x: 0, ease: 'none', duration: 0.7 }, 0.05)
          .to(card, { y: 0, ease: 'power2.out', duration: 0.7 }, 0.05)
          .to(card, { scale: 1, rotation: 0, ease: 'none', duration: 0.7 }, 0.05)
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
        {CAPS.map((c, i) => (
          <Tilt key={c.t} className={i % 2 ? 'cap-card cap-right' : 'cap-card cap-left'}>
            <span className="cap-ghost" aria-hidden="true">
              {`0${i + 1}`}
            </span>
            <VideoCard src={c.src} title={c.t} sub={c.d} />
            <div className="cap-specs" aria-label={`${c.t} stack`}>
              {c.specs.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </Tilt>
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
