import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import VideoCard, { PH } from '../components/VideoCard'
import SectionRail from '../components/SectionRail'
import { navigate, xs } from '../app/store'
import { useMagnetic } from '../useMagnetic'

gsap.registerPlugin(ScrollTrigger, SplitText)

const CAPS = [
  { t: 'Living 3D Worlds', d: 'Real-time scenes that breathe, react and remember.', src: PH.head },
  { t: 'Cinematic Motion', d: 'Scroll-choreographed camera, cut like film.', src: PH.chrome },
  { t: 'Interactive Systems', d: 'Every pixel answers the pointer.', src: PH.aerial },
  { t: 'Reactive Systems', d: 'Interfaces that sense, respond and adapt.', src: PH.metal },
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

const STATS = [
  { n: 47, suffix: '', label: 'worlds shipped' },
  { n: 12, suffix: '', label: 'international awards' },
  { n: 60, suffix: 'fps', label: 'or it does not ship' },
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

/* Engage tier card: magnetic pull + pointer-tracked spotlight sheen.
   Magnetic writes inline translate — the scrubbed fade is opacity-only,
   so the two never contest a property. */
function TierCard({ name, desc }: { name: string; desc: string }) {
  const mag = useMagnetic<HTMLButtonElement>(0.22)
  return (
    <button
      ref={mag}
      className="tier"
      onClick={() => navigate('pricing')}
      data-cursor
      onMouseMove={(e) => {
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`)
        el.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`)
      }}
    >
      <h3>{name}</h3>
      <p>{desc}</p>
      <span>See pricing →</span>
    </button>
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
          scrollTrigger: { trigger: '.st-stats', start: 'top 90%', end: 'top 50%', scrub: 1.2 },
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

      // manifesto pinned word scrub
      const words = gsap.utils.toArray<HTMLElement>('.mani-word')
      gsap.to(words, {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: '.st-mani',
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          fastScrollEnd: true,
        },
      })
      // ember keywords ignite at full illumination (color-only writer —
      // the word tween owns opacity, nothing else touches color)
      gsap.to('.mani-ember', {
        color: '#ff4d2e',
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.st-mani',
          start: 'top top',
          end: '+=160%',
          scrub: 1.2,
        },
      })

      // showreel as an image globe in diagonal-row sequence — pinned
      // horizontal, exact full travel, re-measured on resize. Cells rest
      // on a diagonal (each step down-right from the last) and enter one
      // by one along that same diagonal with un-tilt; exit fade as each
      // panel has passed (containerAnimation triggers). Camera stays dead
      // level: the diagonal is layout, never a tilted camera.
      const cells = gsap.utils.toArray<HTMLElement>('.reel-cell')
      const mid = (cells.length - 1) / 2
      // reel counter readout: 01→N scrubbed to pin progress (direct DOM
      // write, no react state down the scroll path)
      const reelCount = root.current.querySelector('.reel-count span')
      const rowTween = gsap.to('.reel-track', {
        x: () => -(document.querySelector('.reel-track')!.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.st-reel',
          start: 'top top',
          end: '+=220%',
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
      cells.forEach((cell, i) => {
        // resting slot on the diagonal: down-right cascade, ± slope
        const restY = (i - mid) * 44
        const restX = (i - mid) * 28
        // entrance: further out along the same diagonal, tilted, then
        // settle into the diagonal slot (sequence falls out of scroll
        // position — strict diagonal order, one image at a time)
        gsap.fromTo(
          cell,
          { x: restX + 200, y: restY - 160, rotation: -8 + i * 3, opacity: 0 },
          {
            x: restX,
            y: restY,
            rotation: 0,
            opacity: 1,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: cell,
              containerAnimation: rowTween,
              start: 'left 100%',
              end: 'left 45%',
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          },
        )
        // exit: passed panels leave back UP the same diagonal they entered
        // on, converging as they fade (symmetric path — enter and exit
        // mirror, so the second half reads smooth; lazy — writes nothing
        // until its own range starts, so the entrance tween owns these
        // props uncontested before that)
        gsap.to(cell, {
          x: restX + 200,
          y: restY - 160,
          rotation: -8 + i * 3,
          opacity: 0,
          scale: 0.96,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: cell,
            containerAnimation: rowTween,
            start: 'right 55%',
            end: 'right -10%',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
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
      // process bloom: horizontal white band born from a straight center
      // line — ONE timeline owns bloom, mark color, proc background and
      // proc ink end to end (sole writer of each; the reel veil never
      // touches these). Band wipes open on approach → holds full white
      // through the steps → clears only at proc exit under the black X
      // cover (never dies back mid-process; mark stays black into the
      // flip so the giant X reads black-on-white to all corners).
      const procBloomTl = gsap.timeline({
        scrollTrigger: { trigger: '.st-proc', start: 'top 110%', end: 'bottom 30%', scrub: 1.2 },
      })
      procBloomTl
        .fromTo(
          '.proc-bloom',
          { clipPath: 'inset(50% 0 50% 0)', opacity: 0 },
          { clipPath: 'inset(0% 0 0% 0)', opacity: 1, ease: 'none', duration: 1 },
          0,
        )
        .fromTo('.mark-fixed', { color: '#e8edee' }, { color: '#0b0d0e', ease: 'none', duration: 1 }, 0)
        .fromTo(
          '.st-proc',
          { backgroundColor: 'rgba(6,9,15,0)' },
          { backgroundColor: '#f2f0ea', ease: 'none', duration: 1 },
          0,
        )
        .to('.st-proc .mono', { color: '#5a6068', ease: 'none', duration: 1 }, 0)
        .to('.st-proc h3', { color: '#0b0d0e', ease: 'none', duration: 1 }, 0)
        .to('.st-proc p', { color: '#2c3138', ease: 'none', duration: 1 }, 0)
        .to('.proc-points li', { color: '#2c3138', ease: 'none', duration: 1 }, 0)
        .to('.proc-n, .proc-meta', { color: '#075e43', ease: 'none', duration: 1 }, 0)
        // exit wipe happens under the black-X cover at proc exit: band
        // collapses back to the center line while the giant black X owns
        // the frame (mark color deliberately NOT reverted — stays black
        // through the cover; mark is faded by the flip timeline after).
        .to('.proc-bloom', { clipPath: 'inset(50% 0 50% 0)', opacity: 0, ease: 'none', duration: 0.6 }, 2.6)
        .to('.st-proc', { backgroundColor: 'rgba(6,9,15,0)', ease: 'none', duration: 0.6 }, 2.6)
        .to('.st-proc .mono', { color: '#93a3a8', ease: 'none', duration: 0.6 }, 2.6)
        .to('.st-proc h3', { color: '#e8edee', ease: 'none', duration: 0.6 }, 2.6)
        .to('.st-proc p, .proc-points li', { color: '#93a3a8', ease: 'none', duration: 0.6 }, 2.6)
        .to('.proc-n, .proc-meta', { color: '#9cf5d3', ease: 'none', duration: 0.6 }, 2.6)
      // rise: the mark detaches from bottom-center and travels to screen
      // center while crossing process (lazy render: the hero-range tween
      // owns y until this trigger starts — two scrubbed writers on one
      // property resolve nondeterministically on jumps)
      gsap.fromTo(
        '.mark-fixed',
        { y: 0 },
        {
          y: () => 48 - window.innerHeight / 2,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-proc', start: 'top 70%', end: 'bottom 30%', scrub: 1.2, invalidateOnRefresh: true },
        },
      )
      // slide-cover into the reel (NO flip/spin): anchored to PROC exit.
      // Beat 1 — the black X slides sideways. Beat 2 — it grows slowly
      // from center until it covers every corner perfectly. The new
      // screen opens FROM INSIDE the X: the reel track fades + settles
      // from a small scale to full across the cover (transform/opacity
      // only — compositor-friendly, no layout-property animation), so the
      // continuation appears inside the growing X rather than after a
      // white end. Single timeline owns word/X opacity, mark x/scale and
      // reel-track opacity/scale — rise owns y, bloom owns color, the pin
      // tween owns reel-track x, nothing else writes these. Mark stays
      // black from the bloom timeline.
      const flipTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.st-proc',
          start: 'bottom 95%',
          end: 'bottom 10%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })
      flipTl
        .to('.mark-word', { opacity: 0, ease: 'none', duration: 0.15 }, 0)
        .to('.mark-x', { opacity: 1, ease: 'none', duration: 0.15 }, 0)
        // beat 1: sideways travel, scale parked
        .fromTo(
          '.mark-fixed',
          { scale: 1, x: 0 },
          {
            x: () => -window.innerWidth * 0.28,
            ease: 'none',
            duration: 0.6,
          },
          0.15,
        )
        // beat 2: glide back toward center while growing slowly to a
        // guaranteed full-viewport cover (90× ≈ 2–3× viewport on all
        // corners, perspective kept flat — no rotationY flip), then a
        // deterministic impact punch (90→94→90) so the takeover lands
        // with weight instead of just arriving
        .to(
          '.mark-fixed',
          {
            x: () => window.innerWidth * 0.1,
            scale: 90,
            transformOrigin: '50% 50%',
            ease: 'none',
            duration: 1.4,
          },
          0.75,
        )
        .to('.mark-fixed', { scale: 94, ease: 'none', duration: 0.1 }, 2.05)
        .to('.mark-fixed', { scale: 90, ease: 'none', duration: 0.1 }, 2.15)
        // the continuation opens inside the X: track blooms from a small
        // scale to full while fading in (lazy render — must not hide the
        // reel on first paint before its range starts)
        .fromTo(
          '.reel-track',
          { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, ease: 'none', duration: 1.4, immediateRender: false },
          0.75,
        )
        .to('.mark-fixed', { autoAlpha: 0, ease: 'none', duration: 0.3 }, 2.25)

      // capability deck: all 4 cards rest stacked directly BEHIND the
      // fixed mark (small held deck, fanned ±16°, edges peeking) and deal
      // out one-by-one to their alternating slots as you scroll.
      // Measured per-card deltas to the live mark point, recomputed on
      // refresh so resize never strands them. Transform + opacity only.
      const markEl = document.querySelector('.mark-fixed')
      const fanRot = [-16, -6, 6, 16]
      gsap.utils.toArray<HTMLElement>('.cap-card').forEach((card, i) => {
        // ghost numeral drifts against its card (yPercent only — the deal
        // tween owns y, so the two never contest one property)
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
        gsap.fromTo(
          card,
          {
            x: () => delta().dx,
            y: () => delta().dy + peekY,
            scale: 0.3,
            rotation: fanRot[i % fanRot.length],
            opacity: 0,
            transformOrigin: '50% 50%',
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            ease: 'none',
            // the from-state displaces cards ~1100px to the mark — if it
            // rendered at creation, trigger positions would be measured on
            // the displaced boxes (all starts went negative). Render lazily.
            immediateRender: false,
            scrollTrigger: { trigger: card, start: 'top 100%', end: 'top 62%', scrub: 1.2, invalidateOnRefresh: true },
          },
        )
      })

      // connector thread: a stub leaves the mark's side (center) and runs
      // to the spine, then the proc spine draws top→bottom — ONE timeline
      // owns stub, node and spine (single writer; scale/translate only,
      // chained origins). The ember node rides the same path: across the
      // stub (0–0.3), then down the spine (0.3–1).
      const spineH = () => document.querySelector('.proc-line')?.clientHeight ?? 0
      const stubW = () => -(window.innerWidth * 0.42 - 22)
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

      // second-half rhythm: stats rise, tiers fade, footer title rises —
      // all on the same scrub:1.2 heartbeat, one tempo end to end. Tiers
      // fade opacity-only (.tier has a CSS transform transition for hover
      // that a scrubbed y would fight). Lazy render throughout.
      gsap.utils.toArray<HTMLElement>('.stat').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 68%', scrub: 1.2 },
          },
        )
        // stat hairline scrub-fills with its own stat (own element, own
        // property — the rise tween never touches scaleX)
        const rule = el.querySelector('.stat-rule')
        if (rule) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 68%', scrub: 1.2 },
            },
          )
        }
      })
      gsap.utils.toArray<HTMLElement>('.tier').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 70%', scrub: 1.2 },
          },
        )
      })
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

      // counters
      gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
        const end = Number(el.dataset.n || 0)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: end,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: reduced ? 'play none none none' : 'play none none reverse' },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.v)}${el.dataset.suffix || ''}`
          },
        })
      })
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
      <div className="proc-bloom" aria-hidden="true" />
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
        <p className="mono st-fade">00 — HERO VOID</p>
        <h1 className="st-hero-title">WHAT IS XEVEN?</h1>
        <p className="st-sub st-fade">Experience engine. Living systems. Nothing static survives.</p>
        <p className="st-hint st-fade">
          <span>scroll to explore →</span>
          <i className="st-cue" aria-hidden="true">
            <b />
          </i>
        </p>
      </section>

      <section className="st-mani">
        <p className="mono">01 — MANIFESTO</p>
        <p className="mani-text">
          {['The', 'web', 'went', 'flat.', 'We', 'build', 'places', 'with', 'weather,', 'gravity', 'and', 'mood.', 'Every', 'pixel', 'answers', 'back.'].map((w, i) => (
            <span key={i} className={w === 'weather,' || w === 'gravity' || w === 'mood.' ? 'mani-word mani-ember' : 'mani-word'}>
              {w}{' '}
            </span>
          ))}
        </p>
      </section>

      <section className="st-caps">
        <p className="mono">02 — CAPABILITIES</p>
        {CAPS.map((c, i) => (
          <Tilt key={c.t} className={i % 2 ? 'cap-card cap-right' : 'cap-card cap-left'}>
            <span className="cap-ghost" aria-hidden="true">
              {`0${i + 1}`}
            </span>
            <VideoCard src={c.src} title={c.t} sub={c.d} />
          </Tilt>
        ))}
      </section>

      <section className="st-proc">
        <p className="mono">03 — PROCESS</p>
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

      <section className="st-stats">
        <p className="mono">05 — PROOF</p>
        <div className="stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-num" data-n={s.n} data-suffix={s.suffix}>
                {reduced ? `${s.n}${s.suffix}` : 0}
              </div>
              <i className="stat-rule" aria-hidden="true" />
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="st-tier">
        <p className="mono">06 — ENGAGE</p>
        <div className="tier-grid">
          {['Spark — a single living page', 'World — a full dimensional site', 'Engine — us, embedded in your team'].map((t) => {
            const [name, desc] = t.split(' — ')
            return <TierCard key={name} name={name} desc={desc} />
          })}
        </div>
      </section>

      <footer className="st-foot">
        <p className="mono">07 — DEPARTURE</p>
        <h2>STEP INSIDE</h2>
        <a href="mailto:hello@xeven.world" data-cursor>
          hello@xeven.world
        </a>
        <FootTime />
      </footer>
    </div>
  )
}
