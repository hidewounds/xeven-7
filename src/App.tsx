import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import TopBar from './components/TopBar'
import RulerBar from './components/RulerBar'
import SiteFooter from './components/SiteFooter'
import XLoader, { XMark } from './components/XLoader'
import { navBus, routeFromHash, scrollBus, unknownHash, xs } from './app/store'
import type { Route } from './app/store'

/* Route-level code splitting: three.js / gsap SplitText ride in async
   chunks so the first paint is shell + copy only. */
const Gate = lazy(() => import('./pages/Gate'))
const EnterStage = lazy(() => import('./pages/EnterStage'))
const About = lazy(() => import('./pages/About'))
const Features = lazy(() => import('./pages/Features'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Demo = lazy(() => import('./pages/Demo'))
// VOIDWORLD unifies field + objects + cursor presence in one canvas, one
// ticker, one journey — first paint never waits for three.js.
const VoidWorld = lazy(() => import('./components/VoidWorld'))

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  // the cinematic intro plays only over a fresh index load — every other
  // route boots behind a revolving X instead
  const [route, setRoute] = useState<Route>(() => routeFromHash())
  const [intro, setIntro] = useState(() => routeFromHash() === 'enter')
  const [booted, setBooted] = useState(() => routeFromHash() === 'enter')
  const [switching, setSwitching] = useState(false)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    xs.reduced = reduced
    if (reduced) {
      // no Lenis under reduced motion: section links jump natively
      scrollBus.scrollTo = (target: string | number) => {
        if (typeof target === 'number') window.scrollTo(0, target)
        else document.querySelector(target)?.scrollIntoView()
      }
      return () => {
        scrollBus.scrollTo = undefined
      }
    }
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0, anchors: true })
    lenis.current = l
    scrollBus.stop = () => l.stop()
    scrollBus.start = () => l.start()
    scrollBus.scrollTo = (target: string | number) => {
      if (typeof target === 'number') l.scrollTo(target)
      else {
        const el = document.querySelector(target)
        if (el) l.scrollTo(el as HTMLElement)
      }
    }
    l.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => l.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      l.destroy()
      lenis.current = null
      scrollBus.stop = undefined
      scrollBus.start = undefined
      scrollBus.scrollTo = undefined
    }
  }, [reduced])

  useEffect(() => {
    const settle = () => {
      // 404 fallback: unknown hash → canonical enter URL (replace, no
      // history entry)
      if (unknownHash()) {
        window.location.replace(`#/enter`)
        return
      }
      // bare fragments (#main) are in-page anchors — never a route change
      if (window.location.hash !== '' && !window.location.hash.startsWith('#/')) return
      const r = routeFromHash()
      xs.route = r
      setRoute(r)
    }
    settle()
    window.addEventListener('hashchange', settle)
    return () => window.removeEventListener('hashchange', settle)
  }, [])

  useEffect(() => {
    let pending = 0
    navBus.go = (to: Route, query?: string) => {
      const hash = query ? `#/${to}?${query}` : `#/${to}`
      if (to === xs.route && window.location.hash === hash) return
      // interruptible: a second navigation retargets the pending switch
      // instead of queuing behind it
      window.clearTimeout(pending)
      setSwitching(true)
      pending = window.setTimeout(() => {
        window.location.hash = hash
      }, 450)
    }
    return () => {
      window.clearTimeout(pending)
      navBus.go = undefined
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
    // the switch veil lifts once the new route has rendered
    setSwitching(false)
    // webfonts shift layout — re-measure after they land
    if (document.fonts) {
      void document.fonts.ready.then(() => ScrollTrigger.refresh())
    }
    if (reduced) window.scrollTo(0, 0)
    else lenis.current?.scrollTo(0, { immediate: true })
  }, [route, reduced])

  const finishIntro = useCallback(() => {
    xs.entered = true
    setIntro(false)
  }, [])

  const finishBoot = useCallback(() => {
    xs.entered = true
    setBooted(true)
  }, [])

  useEffect(() => {
    if (!lenis.current) return
    if (intro) lenis.current.stop()
    else lenis.current.start()
  }, [intro])

  return (
    <div className="xp" id="top">
      <a className="skip" href="#main">
        Skip to content
      </a>
      {/* bar-free everywhere: content floats, the field is the chrome */}
      <TopBar route={route} />
      {/* fake survey ruler: inches are routes, cm ticks the scroll travel */}
      <RulerBar route={route} />
      <Suspense fallback={null}>
        <VoidWorld />
      </Suspense>
      {/* glass finish: a lens grade between world and content — sheen +
          depth vignette, zero blur, zero backdrop-filter, pointer-transparent */}
      <div className="glass-finish" aria-hidden="true" />
      <main id="main" key={route}>
        <Suspense fallback={null}>
          {route === 'enter' && <EnterStage />}
          {route === 'about' && <About />}
          {route === 'features' && <Features />}
          {route === 'pricing' && <Pricing />}
          {route === 'demo' && <Demo />}
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <SiteFooter route={route} />
      </Suspense>
      {intro && <Gate onEnter={finishIntro} />}
      {!booted && <XLoader onDone={finishBoot} />}
      {switching && (
        <div className="xload xload-fast" role="status" aria-label="Loading">
          <XMark />
        </div>
      )}
    </div>
  )
}
