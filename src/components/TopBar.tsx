import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { navigate, scrollBus } from '../app/store'
import { T } from '../motion'
import type { Route } from '../app/store'
import { MENU_LINKS } from '../nav'
import { useMagnetic } from '../useMagnetic'

/* TopBar: fixed, mix-blend-difference. Logotype, center index,
   mobile fullscreen staggered overlay menu. Links come from the single
   nav model (see src/nav.ts). */

export default function TopBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null!)
  const burger = useMagnetic<HTMLButtonElement>(0.4)
  const closeBtn = useRef<HTMLButtonElement>(null!)

  useEffect(() => {
    setOpen(false)
  }, [route])

  // scroll lock + focus management: lock Lenis while the overlay is open,
  // move focus in on open, trap Tab inside, restore on close.
  useEffect(() => {
    if (open) {
      scrollBus.stop?.()
      document.body.style.overflow = 'hidden'
      // focus the close control once the overlay is mounted
      const t = window.setTimeout(() => closeBtn.current?.focus(), 60)
      return () => {
        window.clearTimeout(t)
        document.body.style.overflow = ''
        scrollBus.start?.()
      }
    }
    document.body.style.overflow = ''
    scrollBus.start?.()
  }, [open])

  // return focus to the burger when the menu closes via route change
  // (the open->close transition above handles the direct-toggle case by
  // focusing only on open; closing refocuses here through the stored flag)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) burger.current?.focus()
    wasOpen.current = open
  }, [open, burger])

  useEffect(() => {
    if (!panel.current) return
    if (open) {
      gsap.fromTo(
        '.mnav-link',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: T.panel, ease: T.expo, stagger: 0.06, delay: 0.15, overwrite: true },
      )
    }
  }, [open ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      // focus trap: keep Tab cycling inside the overlay
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(
          panel.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement)
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="topbar">
        <button className="tb-logo" onClick={() => navigate('enter')} data-cursor>
          XEVEN
        </button>
        <nav className="tb-center" aria-label="Primary">
          {MENU_LINKS.map((l) => (
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

      <div
        className={open ? 'mnav mnav-open' : 'mnav'}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <div ref={panel} className="mnav-panel">
          <button ref={closeBtn} className="mnav-x" onClick={() => setOpen(false)} aria-label="Close menu" data-cursor>
            ×
          </button>
          {MENU_LINKS.map((l) => (
            <button key={l.to} className="mnav-link" onClick={() => { navigate(l.to); setOpen(false) }} data-cursor>
              {l.label}
            </button>
          ))}
          <p className="mnav-foot">AI EMPLOYEE THAT CHANGES BUSINESS</p>
        </div>
      </div>
    </>
  )
}
