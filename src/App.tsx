import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import TopBar from './components/TopBar'
import XLoader, { XMark } from './components/XLoader'
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
    navBus.go = (to: Route) => {
      if (to === xs.route) return
      // page switch runs behind the revolving X, not the ember curtain
      setSwitching(true)
      window.setTimeout(() => {
        window.location.hash = `#/${to}`
      }, 450)
    }
    return () => {
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
      {/* the index is navigated by the rail instrument — the topbar stays
          invisible there and returns on subpages where it owns navigation */}
      {route !== 'enter' && <TopBar route={route} />}
      <Suspense fallback={null}>
        <VoidWorld />
      </Suspense>
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
      {!booted && <XLoader onDone={finishBoot} />}
      {switching && (
        <div className="xload xload-fast" role="status" aria-label="Loading">
          <XMark />
        </div>
      )}
    </div>
  )
}
