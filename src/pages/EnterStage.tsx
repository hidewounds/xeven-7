import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { navigate, xs } from '../app/store'
import { T } from '../motion'
import { INSTRUMENTS, PRODUCT, TELEMETRY, TRIAL, TRUSTLINE, BOLT } from '../data/product'
gsap.registerPlugin(ScrollTrigger, SplitText)

/* Index — XEVEN home: hero, telemetry, instruments, measured play, trial
   commission. Frameless stations, one timeline per property,
   transform/opacity only. All copy sourced from the platform repo and
   marketing site (see src/data/product.ts). */

const CAPS = INSTRUMENTS

const STEPS = TELEMETRY

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

      // wordmark yields while the field owns the page, returns at the trial
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
          scrollTrigger: { trigger: '.st-trial', start: 'top 95%', end: 'top 55%', scrub: 1.2 },
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

      // measured play + trial commission rise as sheets
      gsap.fromTo(
        '.bolt-stat',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          immediateRender: false,
          scrollTrigger: { trigger: '.st-bolt', start: 'top 80%', end: 'top 45%', scrub: T.scrub },
        },
      )
      gsap.fromTo(
        '.st-trial .trial-card',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.st-trial', start: 'top 80%', end: 'top 50%', scrub: T.scrub },
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

      <section className="st-proc">
        <p className="mono">01 — TELEMETRY</p>
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

      <section className="st-caps">
        <p className="mono">02 — INSTRUMENTS</p>
        {CAPS.map((c, i) => (
          <article key={c.t} className="cap-station" aria-label={`${c.t}, instrument ${i + 1} of ${CAPS.length}`}>
            <span className="cap-ghost" aria-hidden="true">
              {`0${i + 1}`}
            </span>
            <p className="mono cap-kicker">
              INSTRUMENT {`0${i + 1}`} / {`0${CAPS.length}`}
            </p>
            <h3>{c.t}</h3>
            <p className="cap-desc">{c.d}</p>
            <p className="cap-stack">{c.s}</p>
          </article>
        ))}
      </section>

      <section className="st-bolt">
        <p className="mono">03 — MEASURED PLAY</p>
        <h2>
          More conversations. <em>More customers.</em>
        </h2>
        <div className="bolt-grid">
          {BOLT.map((b) => (
            <div key={b.n} className="bolt-stat">
              <b>{b.n}</b>
              <h3>{b.t}</h3>
              <p>{b.d}</p>
            </div>
          ))}
        </div>
        <p className="mono trustline">{TRUSTLINE.join(' · ')}</p>
      </section>

      <section className="st-trial">
        <p className="mono">04 — START</p>
        <div className="trial-card">
          <p className="mono">{TRIAL.kicker}</p>
          <h2>{TRIAL.title}</h2>
          <p className="cap-desc">{TRIAL.lede}</p>
          <div className="pills">
            <button className="pill" onClick={() => navigate('demo')} data-cursor>
              Start free trial →
            </button>
            <button className="pill pill-ghost" onClick={() => navigate('pricing')} data-cursor>
              See pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
