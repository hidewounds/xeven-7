import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import VideoCard, { PH } from '../components/VideoCard'
import SectionRail from '../components/SectionRail'
import { navigate, xs } from '../app/store'

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
  { n: '01', t: 'Signal', d: 'We listen first. Every world starts as a frequency.' },
  { n: '02', t: 'Worldbuild', d: 'Geometry, light and law — the physics of the place.' },
  { n: '03', t: 'Ignite', d: 'Motion and interaction switch on together.' },
  { n: '04', t: 'Live', d: 'Ship it breathing. Tune it forever.' },
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

      // showreel cells arrive left-to-right over the white field
      gsap.utils.toArray<HTMLElement>('.reel-cell').forEach((cell) => {
        gsap.fromTo(
          cell,
          { x: () => -window.innerWidth * 0.15, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: cell, start: 'top 90%', end: 'top 55%', scrub: 1.2 },
          },
        )
      })

      // ink into the reel and back out — ONE timeline owns veil, ink and
      // nav color together (two competing scrubbed tweens on one property
      // resolve nondeterministically on discontinuous jumps; a single
      // timeline seeks deterministically): fill → hold while cells play →
      // drain everything back as the reel clears
      const navEls = gsap.utils.toArray<HTMLElement>(
        document.querySelectorAll('.tb-logo, .tb-link'),
      )
      const veilTl = gsap.timeline({
        scrollTrigger: { trigger: '.st-reel', start: 'top 70%', end: 'bottom 100%', scrub: 1.2 },
      })
      veilTl
        .fromTo(
          '.mark-ink',
          { clipPath: 'circle(0% at 50% 50%)' },
          { clipPath: 'circle(75% at 50% 50%)', ease: 'none', duration: 1 },
          0,
        )
        .fromTo(
          '.veil-white',
          { clipPath: 'circle(0px at 50% calc(100% - 48px))' },
          { clipPath: 'circle(150vmax at 50% calc(100% - 48px))', ease: 'none', duration: 1 },
          0,
        )
        // nav ink tracks the veil deterministically (difference-blend math
        // proved unreliable over the white field — explicit color wins).
        // NOTE: element refs, not selector text — the topbar lives outside
        // this gsap context, where selector text resolves to nothing.
        .to(navEls, { color: '#0b0d0e', ease: 'none', duration: 1 }, 0)
        .to('.veil-white', { clipPath: 'circle(0px at 50% calc(100% - 48px))', ease: 'none', duration: 1 }, 1.6)
        .to('.mark-ink', { clipPath: 'circle(0% at 50% 50%)', ease: 'none', duration: 1 }, 1.6)
        .to(navEls, { color: '#ffffff', ease: 'none', duration: 1 }, 1.6)
      // grow/flip wipe into process: the white mark swells flipping to
      // cover the page as process arrives
      const wipe = gsap.timeline({
        scrollTrigger: { trigger: '.st-proc', start: 'top 130%', end: 'top 50%', scrub: 1.2 },
      })
      wipe
        .fromTo(
          '.mark-fixed',
          { scale: 1, rotationY: 0 },
          { scale: 30, rotationY: 180, transformOrigin: '50% 50%', ease: 'none', duration: 1.6 },
          0,
        )
        .to('.mark-fixed', { autoAlpha: 0, ease: 'none', duration: 0.3 }, 1.3)

      // capability cards rise out of the mark into alternating slots
      // (smaller, zigzag — never filter, transform only)
      gsap.utils.toArray<HTMLElement>('.cap-card').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 140, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top 94%', end: 'top 58%', scrub: 1.2 },
          },
        )
      })

      // process line draw
      gsap.fromTo(
        '.proc-line span',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.st-proc', start: 'top 70%', end: 'bottom 60%', scrub: 1.2 } },
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
    return () => ctx.revert()
  }, [reduced])

  return (
    <div className="st-scroll" ref={root}>
      <SectionRail />
      <div className="veil-white" aria-hidden="true" />
      <button className="mark-fixed" onClick={toTop} data-cursor aria-label="XEVEN — back to top">
        <span className="mark-word">XEVEN</span>
        <span className="mark-word mark-ink" aria-hidden="true">
          XEVEN
        </span>
      </button>
      <section className="st-hero">
        <p className="mono st-fade">00 — HERO VOID</p>
        <h1 className="st-hero-title">WHAT IS XEVEN?</h1>
        <p className="st-sub st-fade">Experience engine. Living systems. Nothing static survives.</p>
        <p className="st-hint st-fade">
          <span>scroll to explore →</span>
        </p>
      </section>

      <section className="st-mani">
        <p className="mono">01 — MANIFESTO</p>
        <p className="mani-text">
          {['The', 'web', 'went', 'flat.', 'We', 'build', 'places', 'with', 'weather,', 'gravity', 'and', 'mood.', 'Every', 'pixel', 'answers', 'back.'].map((w, i) => (
            <span key={i} className="mani-word">
              {w}{' '}
            </span>
          ))}
        </p>
      </section>

      <section className="st-caps">
        <p className="mono">02 — CAPABILITIES</p>
        {CAPS.map((c, i) => (
          <Tilt key={c.t} className={i % 2 ? 'cap-card cap-right' : 'cap-card cap-left'}>
            <VideoCard src={c.src} title={c.t} sub={c.d} />
          </Tilt>
        ))}
      </section>

      <section className="st-reel">
        <div className="reel-ghost" aria-hidden="true">
          SHOWREEL — SHOWREEL — SHOWREEL
        </div>
        <div className="reel-track">
          {REEL.map((r) => (
            <div key={r.title} className="reel-cell">
              <VideoCard src={r.src} title={r.title} sub={r.sub} />
            </div>
          ))}
        </div>
      </section>

      <section className="st-proc">
        <p className="mono">04 — PROCESS</p>
        <div className="proc-line" aria-hidden="true">
          <span />
        </div>
        {STEPS.map((s) => (
          <div key={s.n} className="proc-row">
            <span className="proc-n">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </section>

      <section className="st-stats">
        <p className="mono">05 — PROOF</p>
        <div className="stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-num" data-n={s.n} data-suffix={s.suffix}>
                {reduced ? `${s.n}${s.suffix}` : 0}
              </div>
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
            return (
              <button key={name} className="tier" onClick={() => navigate('pricing')} data-cursor>
                <h3>{name}</h3>
                <p>{desc}</p>
                <span>See pricing →</span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="st-foot">
        <p className="mono">07 — DEPARTURE</p>
        <h2>STEP INSIDE</h2>
        <a href="mailto:hello@xeven.world" data-cursor>
          hello@xeven.world
        </a>
      </footer>
    </div>
  )
}
