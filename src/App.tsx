import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Experience, { type Shared } from './xeven/Experience'
import Decrypt from './xeven/Decrypt'
import { ScreenDriver } from './xeven/screen'
import { freshCtl } from './xeven/ConsoleModel'
import { BUSINESS, DEMO_QS, LAYERS, PATTERNS, PROFILE_ROWS } from './xeven/content'
import './App.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

function DemoBar({ ask }: { ask: (q: string, btn: 'a' | 'b') => void }) {
  const [val, setVal] = useState('')
  const submit = (q: string) => {
    const text = q.trim()
    if (!text) return
    ask(text, text.length % 2 === 0 ? 'a' : 'b')
    setVal('')
  }
  return (
    <div className="demo-bar">
      <div className="demo-input">
        <span className="demo-x">X</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(val)
          }}
          placeholder="What can I do for you?"
          aria-label="Ask XEVEN"
        />
        <button className="demo-go" onClick={() => submit(val)} aria-label="Ask">
          ↗
        </button>
      </div>
      <div className="demo-chips">
        {DEMO_QS.map((q) => (
          <button key={q} className="demo-chip" onClick={() => submit(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function Cursor() {  const dot = useRef<HTMLDivElement>(null!)
  const ring = useRef<HTMLDivElement>(null!)
  useEffect(() => {
    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = (e.target as HTMLElement).closest('a,button,.pat,.demo-input')
      ring.current?.classList.toggle('hot', !!t)
      const cv = (e.target as HTMLElement).closest('.xvn-canvas')
      ring.current?.classList.toggle('field', !!cv && !t)
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <>
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null!)
  const shared = useMemo<Shared>(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return {
      progress: { current: 0 },
      velocity: { current: 0 },
      mouse: { current: { x: 0, y: 0 } },
      drag: { x: 0, y: 0, moved: 0, down: false },
      screen: new ScreenDriver(),
      ctl: freshCtl(),
      reduced,
    }
  }, [])
  const [pat, setPat] = useState(0)
  const [layer, setLayer] = useState(-1)
  const [touched, setTouched] = useState(false)
  const lastTap = useRef(0)

  // drag hint retires on first console grab
  useEffect(() => {
    const el = document.querySelector('.xvn-canvas')
    if (!el) return
    const go = () => setTouched(true)
    el.addEventListener('pointerdown', go, { once: true })
    return () => el.removeEventListener('pointerdown', go)
  }, [])

  // spotlight follows the pointer across pattern buttons
  useEffect(() => {
    const pats = Array.from(document.querySelectorAll<HTMLElement>('.pat'))
    const cleanups = pats.map((p) => {
      const mv = (e: PointerEvent) => {
        const r = p.getBoundingClientRect()
        p.style.setProperty('--mx', `${e.clientX - r.left}px`)
        p.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      p.addEventListener('pointermove', mv)
      return () => p.removeEventListener('pointermove', mv)
    })
    return () => cleanups.forEach((c) => c())
  }, [])

  // progress + velocity + mouse/touch feeds
  useEffect(() => {
    let raf = 0
    let lastTop = window.scrollY
    let vel = 0
    // TEMP-PROOF probe (?p=0..1, WebGL only, no scroll writes). REMOVED before ship.
    const probe = (() => {
      const v = new URLSearchParams(window.location.search).get('p')
      const f = v === null ? NaN : parseFloat(v)
      return Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : NaN
    })()
    const update = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      if (!Number.isNaN(probe)) shared.progress.current = probe
      else shared.progress.current = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0
      vel = vel * 0.9 + (h.scrollTop - lastTop) * 0.1
      lastTop = h.scrollTop
      shared.velocity.current = vel
      document.querySelector('.xvn-nav')?.classList.toggle('scrolled', h.scrollTop > 60)
      // auto-cycle patterns inside patterns phase unless user just tapped
      const p = shared.progress.current
      if (p > 0.7 && p < 0.82 && Date.now() - lastTap.current > 6000) {
        const i = Math.min(5, Math.floor(((p - 0.7) / 0.12) * 6))
        setPat((prev) => {
          if (prev !== i) shared.screen.setPattern(i)
          return i
        })
      }
      if (p > 0.82 && p < 0.945) {
        setLayer(Math.min(6, Math.floor(((p - 0.82) / 0.125) * 7)))
      } else {
        setLayer(-1)
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    const move = (e: PointerEvent) => {
      shared.mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      shared.mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const touch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      shared.mouse.current.x = ((t.clientX / window.innerWidth) * 2 - 1) * 0.5
      shared.mouse.current.y = -((t.clientY / window.innerHeight) * 2 - 1) * 0.5
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('touchmove', touch, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('touchmove', touch)
    }
  }, [shared])

  // Lenis + GSAP film transitions
  useEffect(() => {
    const lenis = new Lenis({ lerp: shared.reduced ? 1 : 0.09, anchors: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [shared])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // hero typography appears only after the machine wakes
      gsap.fromTo(
        '.boot-in',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 2, ease: 'power2.out', delay: 1.5 },
      )
      gsap.utils.toArray<HTMLElement>('.fade').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 90, filter: 'blur(12px)', clipPath: 'inset(0 0 100% 0)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clipPath: 'inset(0 0 0% 0)',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 40%', scrub: 1 },
          },
        )
      })
      gsap.utils.toArray<HTMLElement>('.fade-out').forEach((el) => {
        gsap.to(el, {
          opacity: 0,
          y: -60,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 30%', end: 'bottom top', scrub: 1 },
        })
      })
      // architecture beat holds while camera travels the layers
      ScrollTrigger.create({
        trigger: '#arch',
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 1,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const ask = (q: string, btn: 'a' | 'b') => {
    if (btn === 'a') shared.ctl.pressA.current = 1
    else shared.ctl.pressB.current = 1
    shared.screen.ask(q)
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const pickPat = (i: number) => {
    lastTap.current = Date.now()
    setPat(i)
    shared.screen.setMode('pattern')
    shared.screen.setPattern(i)
  }

  const [tier, setTier] = useState<'high' | 'medium' | 'low'>(() => {
    const mobile = window.innerWidth < 760
    const weak = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency <= 4
    return mobile || weak ? 'low' : 'high'
  })

  // magnetic CTAs: subtle pull toward cursor, spring back on leave
  useEffect(() => {
    const btns = Array.from(document.querySelectorAll<HTMLElement>('.btn'))
    const cleanups: (() => void)[] = []
    for (const b of btns) {
      const mv = (e: PointerEvent) => {
        const r = b.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        b.style.transform = `translate(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.18).toFixed(1)}px)`
      }
      const lv = () => {
        b.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        b.style.transform = ''
        setTimeout(() => {
          b.style.transition = ''
        }, 500)
      }
      b.addEventListener('pointermove', mv)
      b.addEventListener('pointerleave', lv)
      cleanups.push(() => {
        b.removeEventListener('pointermove', mv)
        b.removeEventListener('pointerleave', lv)
      })
    }
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <div className="xvn" ref={root}>
      <Cursor />
      <div className="xvn-canvas">
        <Experience s={shared} tier={tier} onSlow={() => setTier('low')} />
      </div>

      <header className="xvn-nav">
        <div className="xvn-logo">XEVEN</div>
        <nav>
          <a href="#understand">PRODUCT</a>
          <a href="#business">HOW IT WORKS</a>
          <a href="#final">PRICING</a>
        </nav>
        <span className="sys">
          <i /> SYSTEM ONLINE
        </span>
      </header>

      <main>
        <section className="ph boot">
          <div className="boot-in">
            <p className="mono dim"><Decrypt text="XEVEN // SYSTEM BOOT" /></p>
            <h1>
              THE WEB,
              <br />
              REIMAGINED.
            </h1>
            <p className="sub">AI personalization that remembers the user, understands context, and adapts the experience.</p>
            <div className="cta-row">
              <a className="btn solid" href="#final">BUILD WITH XEVEN →</a>
              <a className="btn" href="#understand">EXPLORE SYSTEM ↓</a>
            </div>
            <p className={`drag-hint mono dim${touched ? ' gone' : ''}`}>DRAG TO INSPECT — SCROLL TO TRAVEL</p>
          </div>
        </section>

        <section id="understand" className="ph understand">
          <div className="fade mono-block">
            <p className="mono"><Decrypt text="USER DETECTED" /></p>
            <p className="mono dim"><Decrypt text="CONTEXT FOUND — PROCESSING" /></p>
          </div>
        </section>

        <section id="memory" className="ph memory">
          <div className="fade readout">
            <p className="mono dim"><Decrypt text="XEVEN // MEMORY" /></p>
            {PROFILE_ROWS.map(([k, v]) => (
              <div className="rrow" key={k}>
                <span>{k}</span>
                <span className="rv">{v}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="personal" className="ph personal">
          <div className="fade">
            <p className="mono dim"><Decrypt text="XEVEN // PERSONALIZATION" /></p>
            <h2>
              It changes
              <br />
              because it remembers.
            </h2>
          </div>
        </section>

        <section id="business" className="ph business">
          {BUSINESS.map((b) => (
            <div className="fade brow" key={b.n}>
              <span className="mono dim">{b.n}</span>
              <h3>{b.t}</h3>
              <p className="sub">{b.d}</p>
            </div>
          ))}
        </section>

        <section id="patterns" className="ph patterns">
          <div className="fade">
            <p className="mono dim"><Decrypt text="XEVEN // MODES" /></p>
            <h2>
              ONE BRAIN.
              <br />
              SIX PATTERNS.
            </h2>
            <div className="pats">
              {PATTERNS.map((p, i) => (
                <button key={p.t} className={`pat${i === pat ? ' on' : ''}`} onClick={() => pickPat(i)}>
                  <strong>{p.t}</strong>
                  <span>{p.d}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="arch" className="ph arch">
          <div className="layers">
            {LAYERS.map((l, i) => (
              <p key={l} className={`mono${i === layer ? ' on' : ''}`}>
                {i === layer ? '▸ ' : '·· '} {l}
              </p>
            ))}
          </div>
        </section>

        <section id="final" className="ph final">
          <div className="fade">
            <h2>
              THE WEB
              <br />
              SHOULD
              <br />
              REMEMBER.
            </h2>
            <p className="xvn-big">XEVEN</p>
            <p className="mono dim"><Decrypt text="PERSONALIZATION AS INFRASTRUCTURE." /></p>
            <div className="cta-row">
              <a className="btn solid" href="#demo">BUILD WITH XEVEN →</a>
              <a className="btn" href="#understand">SEE HOW IT WORKS</a>
            </div>
          </div>
        </section>

        <section id="demo" className="ph demo">
          <div className="fade">
            <p className="mono dim"><Decrypt text="XEVEN // LIVE DEMO" /></p>
            <DemoBar ask={ask} />
            <p className="sub dim">Watch the console — buttons depress, screen answers.</p>
          </div>
        </section>
      </main>

      <footer className="xvn-foot">
        <span>XEVEN</span>
        <span className="mono dim">© 2026 — THE WEB SHOULD REMEMBER.</span>
      </footer>
    </div>
  )
}
