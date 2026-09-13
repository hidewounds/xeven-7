import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import TopBar from './components/TopBar'
import CursorTrail from './components/CursorTrail'
import GraphBg from './components/GraphBg'
import { Curtain, curtainBus } from './components/Curtain'
import { navBus, routeFromHash, unknownHash, xs } from './app/store'
import type { Route } from './app/store'

/* Route-level code splitting: three.js / gsap SplitText ride in async
   chunks so the first paint is shell + copy only. */
const Gate = lazy(() => import('./pages/Gate'))
const EnterStage = lazy(() => import('./pages/EnterStage'))
const Worlds = lazy(() => import('./pages/Worlds'))
const Vision = lazy(() => import('./pages/Vision'))
const Services = lazy(() => import('./pages/Services'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Contact = lazy(() => import('./pages/Contact'))

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  // fresh loads play the intro over the index — one page, no gate
  const [route, setRoute] = useState<Route>(() => routeFromHash())
  const [intro, setIntro] = useState(true)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    xs.reduced = reduced
    if (reduced) return
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0, anchors: true })
    lenis.current = l
    l.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => l.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      l.destroy()
      lenis.current = null
    }
  }, [reduced])

  useEffect(() => {
    const settle = () => {
      // 404 fallback: unknown hash → canonical enter URL (replace, no
      // history entry), preserving the cursor-debug flag when present
      if (unknownHash()) {
        const keep = window.location.hash.includes('cursor-debug') ? '?cursor-debug' : ''
        window.location.replace(`#/enter${keep}`)
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
    navBus.go = (to: Route) => {
      if (to === xs.route) return
      const apply = () => {
        window.location.hash = `#/${to}`
      }
      if (curtainBus.play) curtainBus.play(apply)
      else apply()
    }
    return () => {
      navBus.go = undefined
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
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
      <Curtain />
      <CursorTrail />
      <TopBar route={route} />
      <GraphBg />
      <main id="main" key={route}>
        <Suspense fallback={null}>
          {route === 'enter' && <EnterStage />}
          {route === 'worlds' && <Worlds />}
          {route === 'vision' && <Vision />}
          {route === 'services' && <Services />}
          {route === 'pricing' && <Pricing />}
          {route === 'contact' && <Contact />}
        </Suspense>
      </main>
      {intro && <Gate onEnter={finishIntro} />}
    </div>
  )
}
