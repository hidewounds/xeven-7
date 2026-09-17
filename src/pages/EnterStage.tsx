import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { navigate, xs } from '../app/store'
import type { Route } from '../app/store'
import { T } from '../motion'
import { INSTRUMENTS, PRODUCT, TELEMETRY } from '../data/product'
gsap.registerPlugin(ScrollTrigger, SplitText)

/* Index — XEVEN, the AI employee SaaS: hero, five instruments, three-step
   setup, worlds teaser, mechanism lab, finale. Frameless stations, one
   timeline per property, transform/opacity only. All copy sourced from
   the platform repo and marketing site (see src/data/product.ts). */

const CAPS = INSTRUMENTS

const STEPS = TELEMETRY

const TEASE: Array<{ t: string; d: string; c: string; to: Route }> = [
  { t: 'Worlds', d: 'Three live demo worlds: Reactor, Helm, Melt.', c: 'tease-ember', to: 'worlds' },
  { t: 'Vision', d: 'An employee, not a widget.', c: 'tease-mint', to: 'vision' },
  { t: 'Services', d: 'Conversation, memory, booking, voice, knowledge.', c: 'tease-bone', to: 'services' },
]

/* X console — matching HTML controls for the procedural mechanism.
   Config + material are instant state writes the scene loop reads (never
   React state in the hot path); the drag strip writes a bounded offset
   (±0.9 rad) with keyboard parity. Reduced motion: all writes apply on
   the next frame with no travel animation. */
function XConsole() {
  const [cfg, setCfg] = useState(xs.xcfg)
  const [mat, setMat] = useState(xs.xmat)
  const [deg, setDeg] = useState(() => Math.round((xs.xspin * 180) / Math.PI))
  const drag = useRef<{ x: number; s: number } | null>(null)
  const clampSpin = (v: number) => Math.min(0.9, Math.max(-0.9, v))
  const applySpin = (v: number) => {
    xs.xspin = clampSpin(v)
    setDeg(Math.round((xs.xspin * 180) / Math.PI))
  }

  return (
    <div className="x-console">
      <div className="pills" role="group" aria-label="Mechanism configuration">
        {(['auto', 'arrival', 'display', 'capability'] as const).map((c) => (
          <button
            key={c}
            className={cfg === c ? 'pill' : 'pill pill-ghost'}
            aria-pressed={cfg === c}
            data-cursor
            onClick={() => {
              xs.xcfg = c
              setCfg(c)
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="pills" role="group" aria-label="Mechanism material">
        {(['matte', 'metal', 'glass'] as const).map((m) => (
          <button
            key={m}
            className={mat === m ? 'pill' : 'pill pill-ghost'}
            aria-pressed={mat === m}
            data-cursor
            onClick={() => {
              xs.xmat = m
              setMat(m)
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div
        className="x-stage"
        role="slider"
        tabIndex={0}
        aria-label="Rotate the mechanism"
        aria-valuemin={-51}
        aria-valuemax={51}
        aria-valuenow={deg}
        aria-valuetext={`${deg} degrees`}
        data-cursor
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            /* synthetic / already-released pointers: drag still tracks */
          }
          drag.current = { x: e.clientX, s: xs.xspin }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          applySpin(drag.current.s + (e.clientX - drag.current.x) / 220)
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault()
            applySpin(xs.xspin + (e.key === 'ArrowLeft' ? -0.1 : 0.1))
          }
        }}
      >
        <span aria-hidden="true">DRAG ⟷ TO ROTATE</span>
        <b>{deg}°</b>
      </div>
      <button className="pill pill-ghost" data-cursor onClick={() => applySpin(0)}>
        Reset spin
      </button>
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
  // no-WebGL presentation: when the scene cannot start (or the context is
  // lost), it announces itself and the hero shows a static X emblem —
  // the mechanism as content, not a missing canvas.
  const [noGL, setNoGL] = useState(
    () => !!document.querySelector<HTMLCanvasElement>('canvas.world-fixed')?.dataset.webgl,
  )
  useEffect(() => {
    const on = () => setNoGL(true)
    const off = () => setNoGL(false)
    window.addEventListener('xeven:nowebgl', on)
    window.addEventListener('xeven:webgl', off)
    return () => {
      window.removeEventListener('xeven:nowebgl', on)
      window.removeEventListener('xeven:webgl', off)
    }
  }, [])

  useLayoutEffect(() => {
    // reduced motion: no SplitText, pins, or scrubs — no ticker burn.
    // Readable final states come from CSS + initial values below.
    if (reduced) return
    const ctx = gsap.context(() => {
      // headline reveal
      const split = new SplitText('.st-hero-title', { type: 'lines,words,chars', mask: 'lines', autoSplit: true })
      gsap.from(split.chars, { yPercent: 120, duration: T.scene, ease: T.expo, stagger: 0.02, delay: 0.3 })
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

      // mechanism lab rises as one sheet
      gsap.fromTo(
        '.x-console',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-xlab', start: 'top 80%', end: 'top 50%', scrub: 1.2 },
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
        {noGL && (
          <svg className="x-emblem" viewBox="0 0 200 200" role="img" aria-label="Xeven mechanism, static preview">
            <line x1="48" y1="48" x2="152" y2="152" stroke="#e8edee" strokeWidth="16" />
            <line x1="152" y1="48" x2="48" y2="152" stroke="#9cf5d3" strokeWidth="16" />
          </svg>
        )}
        <p className="mono st-fade">{PRODUCT.byline} — 00 TOP</p>
        <h1 className="st-hero-title">{PRODUCT.hero}</h1>
        <p className="st-sub st-fade">{PRODUCT.sub}</p>
        <p className="st-hint">
          <span>scroll to explore →</span>
          <i className="st-cue" aria-hidden="true">
            <b />
          </i>
        </p>
      </section>

      <section className="st-caps">
        <p className="mono">01 — INSTRUMENTS</p>
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
        <p className="mono">02 — TELEMETRY</p>
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

      <section className="st-xlab">
        <p className="mono">04 — MECHANISM</p>
        <h2>ONE OBJECT, THREE STATES.</h2>
        <p className="cap-desc">
          The X behind this page is procedural — arrival holds the hero, display steps aside for
          projects, capability tilts into the lattice. Drive it: configuration, material, spin.
        </p>
        <XConsole />
      </section>

      <footer className="st-fin">
        <p className="mono">05 — DEPARTURE</p>
        <h2>STEP INSIDE</h2>
        <a href="mailto:hello@xeven.world" data-cursor>
          hello@xeven.world
        </a>
        <FootTime />
      </footer>
    </div>
  )
}
