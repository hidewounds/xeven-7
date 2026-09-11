import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import Lenis from 'lenis'
import Works from './Works'
import type { BgState } from './scroll-state'
import { Hero } from './Hero'
import { Mission, Platform, Service, Vision } from './Sections'
import { Footer, Header, Loader, Menu, Outro, Rail } from './Chrome'
import './Works.css'
import './sections.css'
import './chrome.css'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)
ScrollTrigger.config({ ignoreMobileResize: true })

// three.js rides in its own chunk — first paint never waits for WebGL
const WorksBackground = lazy(() => import('./WorksBackground'))

/* decode-on-hover for [data-scramble] links (react-bits ScrambledText pattern, gsap-core only) */
function useScramble() {
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
  }, [])
}

export default function App() {
  const bg = useRef<BgState>({ progress: 0, velocity: 0, active: 0, pulse: 0, hero: 0 }).current
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [menu, setMenu] = useState(false)
  const lenis = useRef<Lenis | null>(null)
  useScramble()

  useEffect(() => {
    const l = new Lenis({ lerp: reduced ? 1 : 0.09, anchors: true })
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

  // lenis skill: freeze the transport while a fullscreen overlay owns the screen
  useEffect(() => {
    if (menu) lenis.current?.stop()
    else lenis.current?.start()
  }, [menu])

  // gsap skill: re-measure pins after anything that shifts layout
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(() => {})
    }
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <div className="xvn-works" id="top">
      <Loader />
      <div className="gl-fixed" aria-hidden="true">
        <Suspense fallback={null}>
          <WorksBackground bg={bg} reduced={reduced} />
        </Suspense>
      </div>
      <Header onMenu={() => setMenu(true)} />
      <Rail />
      <Menu open={menu} onClose={() => setMenu(false)} />
      <div className="xvn-works-body">
        <main>
          <Hero bg={bg} reduced={reduced} />
          <Works bg={bg} />
          <Mission />
          <Vision />
          <Service />
          <Platform />
        </main>
        <Outro onTop={() => lenis.current?.scrollTo(0, { duration: 2 })} />
        <Footer />
      </div>
    </div>
  )
}
