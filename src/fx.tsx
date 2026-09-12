import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

/* masked line rise — scrubbed, reversible mid-line */
export function Rise({ children, shift = 0 }: { children: ReactNode; shift?: number }) {
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
export function Fade({ children, shift = 0 }: { children: ReactNode; shift?: number }) {
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

/* decode-on-hover for [data-scramble] links */
export function useScramble(dep: unknown) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-scramble]'))
    const cleanups = els.map((el) => {
      const orig = el.textContent ?? ''
      const enter = () => {
        gsap.to(el, {
          duration: 0.45,
          ease: 'none',
          overwrite: true,
          scrambleText: { text: orig, chars: '.:/<>*+_' },
        })
      }
      el.addEventListener('pointerenter', enter)
      return () => el.removeEventListener('pointerenter', enter)
    })
    return () => cleanups.forEach((fn) => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}

/* decode-once when giant wordmarks scroll into view */
export function useDecodeOnView(dep: unknown) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.decode-view'))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          gsap.to(el, {
            duration: 1,
            ease: 'none',
            overwrite: true,
            scrambleText: { text: el.dataset.text ?? '', chars: '/_<>*+_' },
          })
          io.unobserve(el)
        })
      },
      { threshold: 0.4 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}

/* shared CTA band */
export function CtaBand({
  title,
  sub,
  primary,
}: {
  title: ReactNode
  sub: string
  primary: { label: string; href: string }
}) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <Fade>
          <p className="kicker" style={{ textAlign: 'center' }}>
            XEVEN // START
          </p>
        </Fade>
        <h2>
          <Rise>{title}</Rise>
        </h2>
        <Fade shift={4}>
          <p>{sub}</p>
        </Fade>
        <div className="cta-row">
          <a className="btn btn-solid magnetic" href={primary.href}>
            {primary.label}
          </a>
        </div>
      </div>
    </section>
  )
}
/* magnetic pull toward cursor (lenis-demo pattern, zero deps) */
export function useMagnetic(dep: unknown, strength = 0.3) {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'))
    const states = els.map((el) => ({ el, tx: 0, ty: 0, x: 0, y: 0, hot: false }))
    let raf = 0
    const loop = () => {
      for (const s of states) {
        s.x += (s.tx - s.x) * 0.14
        s.y += (s.ty - s.y) * 0.14
        s.el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    const cleanups = states.map((s) => {
      const enter = () => {
        s.hot = true
      }
      const move = (e: PointerEvent) => {
        const r = s.el.getBoundingClientRect()
        s.tx = (e.clientX - (r.left + r.width / 2)) * strength
        s.ty = (e.clientY - (r.top + r.height / 2)) * strength
      }
      const leave = () => {
        s.hot = false
        s.tx = 0
        s.ty = 0
      }
      s.el.addEventListener('pointerenter', enter)
      s.el.addEventListener('pointermove', move)
      s.el.addEventListener('pointerleave', leave)
      return () => {
        s.el.removeEventListener('pointerenter', enter)
        s.el.removeEventListener('pointermove', move)
        s.el.removeEventListener('pointerleave', leave)
      }
    })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      cleanups.forEach((fn) => fn())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}
