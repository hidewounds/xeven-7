import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import TopBar from './components/TopBar'
import RulerBar from './components/RulerBar'
import SiteFooter from './components/SiteFooter'
import { navBus, routeFromHash, scrollBus, unknownHash, xs } from './app/store'
import type { Route } from './app/store'

/* SHIFT — app shell. Hash routes, lazy pages, Lenis heartbeat, orb intro on
   index fresh loads ONLY. No loaders anywhere else: route shifts are instant
   app-swipes (incoming page slides in, no veil, no delay). */
const EnterStage = lazy(() => import('./pages/EnterStage'))
const Worlds = lazy(() => import('./pages/Worlds'))
const About = lazy(() => import('./pages/About'))
const Features = lazy(() => import('./pages/Features'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Demo = lazy(() => import('./pages/Demo'))
const Gate = lazy(() => import('./pages/Gate'))
const ShiftWorld = lazy(() => import('./components/ShiftWorld'))

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromHash())
  const [intro, setIntro] = useState(() => routeFromHash() === 'enter')
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    xs.reduced = reduced
    if (reduced) {
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
      if (unknownHash()) {
        window.location.replace(`#/enter`)
        return
      }
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
    // instant app-swipe: no veil, no delay
    navBus.go = (to: Route, query?: string) => {
      const hash = query ? `#/${to}?${query}` : `#/${to}`
      if (to === xs.route && window.location.hash === hash) return
      window.location.hash = hash
    }
    return () => {
      navBus.go = undefined
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
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
      <TopBar route={route} />
      <RulerBar route={route} />
      <Suspense fallback={null}>
        <ShiftWorld />
      </Suspense>
      <div className="glass-finish" aria-hidden="true" />
      <main id="main" key={route} className="page-swipe">
        <Suspense fallback={null}>
          {route === 'enter' && <EnterStage />}
          {route === 'worlds' && <Worlds />}
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
    </div>
  )
}
