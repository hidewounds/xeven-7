import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import type { BgState } from './scroll-state'
import { freshBg } from './scroll-state'
import { useDecodeOnView, useMagnetic, useScramble } from './fx'
import { Ticker } from './effects'
import { Cursor, Footer, Header, Loader, Menu, type Route } from './chrome'
import { Hud } from './hud'
import { Home } from './Home'
import { Features } from './Features'
import { Pricing } from './Pricing'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// three.js rides in its own chunk — first paint never waits for WebGL
const Background = lazy(() => import('./Background'))

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h === 'features' || h === 'pricing' ? h : 'home'
}

export default function App() {
  const bg = useRef<BgState>(freshBg()).current
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [menu, setMenu] = useState(false)
  const [route, setRoute] = useState<Route>(() => parseHash())
  const lenis = useRef<Lenis | null>(null)
  const page = useRef<HTMLDivElement>(null!)

  useScramble(route)
  useDecodeOnView(route)
  useMagnetic(route)

  useEffect(() => {
    const l = new Lenis({ lerp: reduced ? 1 : 0.09, anchors: false })
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

  // global scroll progress feeds the tube drift (no pin on these pages)
  useEffect(() => {
    let raf = 0
    let last = window.scrollY
    let vel = 0
    const loop = () => {
      const y = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      bg.progress = Math.min(1, Math.max(0, y / max))
      vel = vel * 0.9 + (y - last) * 0.1
      last = y
      bg.velocity = vel / 16
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [bg])

  // hash routing: swap page, top up, re-measure, pulse the wall
  useEffect(() => {
    const onHash = () => {
      const r = parseHash()
      bg.mode = r === 'home' ? 'home' : 'inner'
      bg.pulse += 1
      setRoute(r)
      setMenu(false)
    }
    window.addEventListener('hashchange', onHash)
    bg.mode = parseHash() === 'home' ? 'home' : 'inner'
    return () => window.removeEventListener('hashchange', onHash)
  }, [bg])

  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true })
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    )
    return () => cancelAnimationFrame(id)
  }, [route])

  // route-link delegation (keeps Lenis anchor handling out of the way)
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#/"]') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      const href = a.getAttribute('href')!
      if (window.location.hash === href) {
        lenis.current?.scrollTo(0)
        return
      }
      window.location.hash = href
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])

  // lenis skill: freeze the transport while a fullscreen overlay owns the screen
  useEffect(() => {
    if (menu) lenis.current?.stop()
    else lenis.current?.start()
  }, [menu])

  // re-measure after anything that shifts layout
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(() => {})
    }
    return () => window.removeEventListener('load', refresh)
  }, [])

  // swup-like enter transition per route
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.page-enter',
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power4.inOut' },
      )
    }, page)
    return () => ctx.revert()
  }, [route])

  return (
    <div className="xvn" id="top">
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Loader />
      <div className="gl-fixed" aria-hidden="true">
        <Suspense fallback={null}>
          <Background bg={bg} reduced={reduced} />
        </Suspense>
      </div>
      <Header onMenu={() => setMenu(true)} />
      <Menu open={menu} onClose={() => setMenu(false)} />
      <Hud route={route} />
      <div key={route} ref={page} className="page page-enter">
        <main>
          {route === 'home' && <Home bg={bg} reduced={reduced} />}
          {route === 'features' && <Features />}
          {route === 'pricing' && <Pricing />}
        </main>
        <Ticker items={['THE WEB SHOULD REMEMBER', 'XEVEN', 'AI EMPLOYEE', 'GROUNDED']} />
        <Footer />
      </div>
    </div>
  )
}
