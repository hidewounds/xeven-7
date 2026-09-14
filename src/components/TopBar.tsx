import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { navigate } from '../app/store'
import type { Route } from '../app/store'
import { useMagnetic } from '../useMagnetic'

/* TopBar: fixed, mix-blend-difference. Logotype, center index,
   mobile fullscreen staggered overlay menu. Hidden on the gate. */

const LINKS: { label: string; to: Route }[] = [
  { label: 'Worlds', to: 'worlds' },
  { label: 'Vision', to: 'vision' },
  { label: 'Services', to: 'services' },
  { label: 'Pricing', to: 'pricing' },
  { label: 'Contact', to: 'contact' },
]

export default function TopBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null!)
  const burger = useMagnetic<HTMLButtonElement>(0.4)

  useEffect(() => {
    setOpen(false)
  }, [route])

  useEffect(() => {
    if (!panel.current) return
    if (open) {
      gsap.fromTo(
        '.mnav-link',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.15, overwrite: true },
      )
    }
  }, [open ])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  return (
    <>
      <header className="topbar">
        <button className="tb-logo" onClick={() => navigate('enter')} data-cursor>
          XEVEN
        </button>
        <nav className="tb-center" aria-label="Primary">
          {LINKS.map((l) => (
            <button
              key={l.to}
              className={route === l.to ? 'tb-link is-here' : 'tb-link'}
              onClick={() => navigate(l.to)}
              data-cursor
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="tb-right">
          <button
            ref={burger}
            className="tb-burger"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-cursor
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={open ? 'mnav mnav-open' : 'mnav'} aria-hidden={!open}>
        <div ref={panel} className="mnav-panel">
          <button className="mnav-x" onClick={() => setOpen(false)} aria-label="Close menu" data-cursor>
            ×
          </button>
          {LINKS.map((l) => (
            <button key={l.to} className="mnav-link" onClick={() => { navigate(l.to); setOpen(false) }} data-cursor>
              {l.label}
            </button>
          ))}
          <p className="mnav-foot">STEP BEYOND THE STATIC WEB</p>
        </div>
      </div>
    </>
  )
}
