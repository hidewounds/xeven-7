import { useEffect, useRef, useState } from 'react'
import { useMagnetic } from './useMagnetic'

/* L3 — global progress meter rail */
const RAIL_ITEMS: [string, string][] = [
  ['TOP', 'kv'],
  ['WORKS', 'works'],
  ['ABOUT', 'mission'],
  ['VISION', 'vision'],
  ['SERVICE', 'service'],
]

export function Rail() {
  const root = useRef<HTMLElement>(null!)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const mid = window.innerHeight * 0.5
      let best = -1
      const items = root.current?.children
      RAIL_ITEMS.forEach(([, id], i) => {
        const el = document.getElementById(id)
        const item = items?.[i] as HTMLElement | undefined
        if (!el || !item) return
        const r = el.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)))
        item.style.setProperty('--p', p.toFixed(3))
        item.classList.toggle('t1', p > 0.33)
        item.classList.toggle('t2', p > 0.66)
        if (p > 0.02) best = i
      })
      RAIL_ITEMS.forEach((_, i) => {
        ;(items?.[i] as HTMLElement | undefined)?.classList.toggle('on', i === best)
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <aside className="rail-fixed" ref={root} aria-hidden="true">
      {RAIL_ITEMS.map(([label]) => (
        <div className="rail-item" key={label}>
          <span className="rail-label">{label}</span>
          <span className="rail-track">
            <span className="rail-fill" />
          </span>
          <span className="rail-ticks">
            <i />
            <i />
          </span>
        </div>
      ))}
    </aside>
  )
}

/* L7 — loading veil: covers all until first paint settles, then wipes away */
export function Loader() {
  const [gone, setGone] = useState(false)
  const [dead, setDead] = useState(false)
  useEffect(() => {
    const t1 = window.setTimeout(() => setGone(true), 1100)
    const t2 = window.setTimeout(() => setDead(true), 1900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])
  if (dead) return null
  return (
    <div className={gone ? 'veil veil-gone' : 'veil'} aria-hidden="true">
      <div className="veil-mark">XEVEN</div>
      <div className="veil-bar">
        <span />
      </div>
      <p className="veil-sub">THE WEB SHOULD REMEMBER.</p>
    </div>
  )
}

/* L4 — fixed header chrome */
export function Header({ onMenu }: { onMenu: () => void }) {
  const mag = useMagnetic<HTMLButtonElement>(0.4)
  return (
    <header className="chr-head">
      <a className="chr-logo" href="#top">
        XEVEN
      </a>
      <nav className="chr-nav">
        <a href="#works" data-scramble>WORKS</a>
        <a href="#mission" data-scramble>MISSION</a>
        <a href="#vision" data-scramble>VISION</a>
        <a href="#service" data-scramble>SERVICE</a>
      </nav>
      <span className="chr-sys">
        <i />
        SYSTEM ONLINE
      </span>
      <button ref={mag} className="chr-burger" onClick={onMenu} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}

/* L5 — side menu overlay */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className={open ? 'chr-menu chr-menu-open' : 'chr-menu'} aria-hidden={!open}>
      <div className="chr-menu-bg" onClick={onClose} />
      <nav className="chr-menu-panel">
        <button className="chr-menu-x" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        {[
          ['Top', '#top'],
          ['Works', '#works'],
          ['Mission', '#mission'],
          ['Vision', '#vision'],
          ['Service', '#service'],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={onClose} className="slot">
            <span>{label}</span>
            <span aria-hidden="true">{label}</span>
          </a>
        ))}
        <div className="chr-menu-social">
          <span>X</span>
          <span>YouTube</span>
        </div>
      </nav>
    </div>
  )
}

/* L8 — outro bridge between content end and footer */
export function Outro({ onTop }: { onTop: () => void }) {
  const mag = useMagnetic<HTMLButtonElement>(0.3)
  return (
    <section id="outro" className="chr-outro">
      <p className="chr-outro-kicker">XEVEN // OUTRO</p>
      <h2>
        THE WEB
        <br />
        SHOULD
        <br />
        REMEMBER.
      </h2>
      <p className="chr-outro-big decode-view" data-text="XEVEN" aria-hidden="true">
        XEVEN
      </p>
      <button ref={mag} className="chr-btn slot" onClick={onTop}>
        <span>BACK TO TOP ↑</span>
        <span aria-hidden="true">BACK TO TOP ↑</span>
      </button>
    </section>
  )
}

/* L9 — footer slab */
export function Footer() {
  return (
    <footer className="chr-foot">
      <div className="chr-foot-top">
        <div className="chr-foot-links">
          <a href="#top" data-scramble>Top</a>
          <a href="#works" data-scramble>Works</a>
          <a href="#outro" data-scramble>About</a>
        </div>
        <span className="chr-foot-copy">© 2026 XEVEN</span>
      </div>
      <div className="chr-foot-logo decode-view" data-text="XEVEN" aria-hidden="true">
        XEVEN
      </div>
    </footer>
  )
}
