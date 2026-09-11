import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BgState } from './scroll-state'

gsap.registerPlugin(ScrollTrigger)

/* KV entry — prism + hint fade as the pin approaches.
   Title uses a hand-rolled masked char reveal (React-Bits SplitText pattern,
   gsap-core only, no new deps). Skipped under reduced-motion. */
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

export function Hero({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const root = useRef<HTMLElement>(null!)
  useLayoutEffect(() => {
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
          { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.028, delay: 1.15 },
        )
      }
    }, root)
    return () => ctx.revert()
  }, [bg, reduced])
  return (
    <section id="kv" className="kv" ref={root}>
      <p className="kv-kicker kv-fade">XEVEN // SYSTEM ONLINE</p>
      {reduced ? (
        <h1 className="kv-title kv-fade">
          THE WEB,
          <br />
          REIMAGINED.
        </h1>
      ) : (
        <h1 className="kv-title kv-fade" aria-label="THE WEB, REIMAGINED.">
          <span className="kv-mask">
            <Chars text="THE WEB," />
          </span>
          <br />
          <span className="kv-mask">
            <Chars text="REIMAGINED." />
          </span>
        </h1>
      )}
      <p className="kv-sub kv-fade">AI personalization that remembers the user — and adapts.</p>
      <p className="kv-hint">
        <span>scroll to explore →</span>
      </p>
    </section>
  )
}
