import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BgState } from './scroll-state'
import { INSTRUMENTS, TRUSTLINE, VALUE_PROPS } from './data'
import { CtaBand, Fade, Rise } from './fx'
import { AuditWidget, ProofWall } from './proof'
import { Ticker } from './effects'
import { ChatDemo, HOME_CHIPS } from './chat'

gsap.registerPlugin(ScrollTrigger)

function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span key={i} className="kv-char" aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  )
}

export function Home({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const root = useRef<HTMLElement>(null!)
  useLayoutEffect(() => {
    bg.hero = 0
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          bg.hero = self.progress
        },
      })
      gsap.to('.kv-fade', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
      })
      if (!reduced) {
        gsap.fromTo(
          '.kv-char',
          { yPercent: 120 },
          { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.028, delay: 1.15, clearProps: 'transform' },
        )
      }
    }, root)
    return () => ctx.revert()
  }, [bg, reduced])

  return (
    <>
      <section className="hero" ref={root}>
        <p className="hero-kicker kv-fade">XEVEN // AI EMPLOYEE — LIVE IN A DAY</p>
        {reduced ? (
          <h1 className="hero-title kv-fade">
            Hold the whole
            <br />
            business.
          </h1>
        ) : (
          <h1 className="hero-title kv-fade" aria-label="Hold the whole business.">
            <span className="kv-mask">
              <Chars text="Hold the whole" />
            </span>
            <br />
            <span className="kv-mask">
              <Chars text="business." />
            </span>
          </h1>
        )}
        <p className="hero-sub kv-fade">
          XEVEN chats 24/7, remembers every shopper, recovers carts, books with Chrono and talks
          with Echo — one snippet.
        </p>
        <div className="hero-ctas kv-fade">
          <a className="btn btn-solid magnetic" href="#/pricing">
            Start free trial →
          </a>
          <a className="btn btn-ghost magnetic" href="#/features">
            See features
          </a>
        </div>
        <p className="hero-hint">
          <span>scroll to explore →</span>
        </p>
      </section>

      <Ticker items={['24/7', 'REMEMBERS YOU', 'CHRONO', 'ECHO', 'VERIFIED OR SILENT']} />

      <section className="sec">
        <div className="wrap">
          <Fade>
            <p className="kicker">THREE THINGS THAT MOVE REVENUE</p>
          </Fade>
          <h2 className="giant">
            <Rise>
              Never miss. <em>Always close.</em>
            </Rise>
          </h2>
          <div className="vgrid">
            {VALUE_PROPS.map((v) => (
              <div className="vcard magnetic" key={v.n}>
                <span className="mono dim">{v.n}</span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Fade>
            <p className="kicker">LOADOUT — FIVE STRANDS, ONE FABRIC</p>
          </Fade>
          <h2 className="giant">
            <Rise>
              Pick a key, <em>any key.</em>
            </Rise>
          </h2>
          <div className="preview-rows">
            {INSTRUMENTS.map((f) => (
              <a className="prow" key={f.n} href={`#/features`}>
                <span className="mono dim">{f.n}</span>
                <h3>
                  <small>{f.t}</small>
                  {f.s}
                </h3>
                <span className="r">
                  <b>{f.stat.split(' ')[0]}</b>
                  {f.stat.split(' ').slice(1).join(' ')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ChatDemo
        script="home"
        chips={HOME_CHIPS}
        interactive
        kicker="LIVE // TRY IT"
        title={
          <>
            Talk to it <em>right here.</em>
          </>
        }
      />

      <section className="sec">
        <div className="wrap">
          <Fade>
            <p className="kicker">HIGH SCORE — MEASURED PLAY</p>
          </Fade>
          <h2 className="giant">
            <Rise>
              More conversations. <em>More customers.</em>
            </Rise>
          </h2>
          <ProofWall />
          <div className="trust">
            {TRUSTLINE.map((t) => (
              <span key={t}>
                <b>{t.split(' ')[0]}</b> {t.split(' ').slice(1).join(' ')}
              </span>
            ))}
          </div>
        </div>
      </section>

      <AuditWidget />

      <CtaBand
        title={
          <>
            Press start <em>on growth.</em>
          </>
        }
        sub="Fourteen days, $0 today, live in one day. Cancel in one click."
        primary={{ label: 'Start free trial →', href: '#/pricing' }}
      />
    </>
  )
}
