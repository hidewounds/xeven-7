import { useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* masked line rise — scrubbed, reversible mid-line like Alche's markers */
function Rise({ children, shift = 0 }: { children: ReactNode; shift?: number }) {
  const root = useRef<HTMLDivElement>(null!)
  const inner = useRef<HTMLDivElement>(null!)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: 115 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: `top ${88 - shift}%`,
            end: `top ${48 - shift}%`,
            scrub: 1,
          },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [shift])
  return (
    <div ref={root} className="mask">
      <div ref={inner}>{children}</div>
    </div>
  )
}

/* soft entrance — opacity / rise / deblur, scrubbed */
function Fade({ children, shift = 0 }: { children: ReactNode; shift?: number }) {
  const ref = useRef<HTMLDivElement>(null!)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: `top ${90 - shift}%`,
            end: `top ${55 - shift}%`,
            scrub: 1,
          },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [shift])
  return (
    <div ref={ref} className="fadewipe">
      {children}
    </div>
  )
}

/* ABOUT — statement block, normal scroll */
export function Mission() {
  return (
    <section id="mission" className="sec mission">
      <Fade>
        <p className="kicker">XEVEN // MEMORY</p>
      </Fade>
      <Fade shift={4}>
        <h2 className="sec-outline">ABOUT</h2>
      </Fade>
      <div className="sec-lines">
        <Rise>It remembers</Rise>
        <Rise shift={5}>the user,</Rise>
        <Rise shift={10}>not the session.</Rise>
      </div>
      <Fade shift={6}>
        <p className="sec-sub">
          XEVEN stores who someone is — size, budget, taste, context — and brings it back on
          every visit. No repeated questions. No cold starts.
        </p>
      </Fade>
    </section>
  )
}

/* VISION — 1.8x hold: sticky stage, timeline scrubbed across 180vh */
export function Vision() {
  const root = useRef<HTMLElement>(null!)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
      })
      tl.fromTo('.v-title', { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
        .fromTo('.v-l1', { yPercent: 115 }, { yPercent: 0, ease: 'none', duration: 1 }, 0.3)
        .fromTo('.v-l2', { yPercent: 115 }, { yPercent: 0, ease: 'none', duration: 1 }, 0.9)
        .fromTo(
          '.v-en',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: 'none', duration: 1 },
          1.6,
        )
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section id="vision" className="sec vision" ref={root}>
      <div className="vision-stick">
        <p className="kicker">XEVEN // PERSONALIZATION</p>
        <h2 className="sec-outline v-title">VISION</h2>
        <div className="sec-lines">
          <div className="mask">
            <div className="v-l1">The web should</div>
          </div>
          <div className="mask">
            <div className="v-l2">remember.</div>
          </div>
        </div>
        <p className="sec-sub v-en">
          Interfaces that change because they remember. Personalization as infrastructure.
        </p>
      </div>
    </section>
  )
}

/* SERVICE — pinned cards, scrub crossfade */
export function Service() {
  const root = useRef<HTMLElement>(null!)
  const a = useRef<HTMLDivElement>(null!)
  const b = useRef<HTMLDivElement>(null!)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress
          const ao = p < 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) * 2.4)
          const bo = p < 0.5 ? Math.max(0, (p - 0.08) * 2.4) : 1
          if (a.current) {
            a.current.style.opacity = ao.toFixed(3)
            a.current.style.transform = `translateY(${(-p * 60).toFixed(1)}px)`
          }
          if (b.current) {
            b.current.style.opacity = bo.toFixed(3)
            b.current.style.transform = `translateY(${((1 - p) * 60).toFixed(1)}px)`
          }
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section id="service" className="sec service" ref={root}>
      <div className="service-stick">
        <p className="kicker">XEVEN // SYSTEM</p>
        <h2 className="sec-outline">SERVICE</h2>
        <div className="service-cards">
          <div ref={a} className="service-card">
            <span className="mono dim">01</span>
            <h3>Never asks twice.</h3>
            <p>
              Memory rows persist across visits — the shopper picks up exactly where they left
              off, on any device.
            </p>
            <ul className="spec-rows">
              <li>
                <span>SIZE</span>
                <span>42</span>
              </li>
              <li>
                <span>BUDGET</span>
                <span>₹80K</span>
              </li>
              <li>
                <span>INTEREST</span>
                <span>GAMING</span>
              </li>
            </ul>
          </div>
          <div ref={b} className="service-card">
            <span className="mono dim">02</span>
            <h3>Changes because it remembers.</h3>
            <p>
              One brain, six patterns — support, sales, shopping, advice, qualification, general —
              all reading the same memory.
            </p>
            <ul className="spec-chips">
              {['SUPPORT', 'SALES', 'SHOPPING', 'ADVISOR', 'QUALIFY', 'GENERAL'].map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* PLATFORM — spec block with reticle frame draw */
export function Platform() {
  const root = useRef<HTMLElement>(null!)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.plat-frame', start: 'top 78%', end: 'top 25%', scrub: 1 },
      })
      tl.fromTo('.fl-t', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        .fromTo('.fl-b', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0.2)
        .fromTo('.fl-l', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 1 }, 0.4)
        .fromTo('.fl-r', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 1 }, 0.6)
        .fromTo('.plat-cross', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.4, stagger: 0.15 }, 0.8)
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section id="platform" className="sec platform" ref={root}>
      <Fade>
        <p className="kicker">XEVEN // PLATFORM</p>
      </Fade>
      <div className="plat-frame">
        <span className="plat-cross c1">+</span>
        <span className="plat-cross c2">+</span>
        <span className="plat-cross c3">+</span>
        <span className="plat-cross c4">+</span>
        <span className="fl-t" />
        <span className="fl-r" />
        <span className="fl-b" />
        <span className="fl-l" />
        <div className="plat-inner">
          <div className="plat-logo">XEVEN Core</div>
          <p>
            A personalization layer for any site — memory, context, and six behavior patterns in
            one embed. Unreal-grade presence, checkout-grade reliability.
          </p>
          <ul className="plat-rows">
            {['SHELL', 'SCREEN', 'PCB', 'AI CORE', 'MEMORY', 'CONTEXT', 'DATA'].map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
