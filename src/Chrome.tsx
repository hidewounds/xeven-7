import { useEffect, useRef, useState } from 'react'

export type Route = 'home' | 'features' | 'pricing'

/* loading veil — counter + curtain lift, once per session */
export function Loader() {
  const [gone, setGone] = useState(false)
  const [dead, setDead] = useState(false)
  const [count, setCount] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      const p = Math.min(1, (t - t0) / 1300)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const t1 = window.setTimeout(() => setGone(true), 1500)
    const t2 = window.setTimeout(() => setDead(true), 2500)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])
  if (dead) return null
  return (
    <div className={gone ? 'veil veil-gone' : 'veil'} aria-hidden="true">
      <div className="veil-mark">XEVEN</div>
      <div className="veil-count">{String(count).padStart(3, '0')}</div>
      <div className="veil-bar">
        <span />
      </div>
      <p className="veil-sub">THE WEB SHOULD REMEMBER.</p>
    </div>
  )
}

/* fixed header */
export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="hd">
      <a className="hd-logo" href="#/">
        XEVEN
      </a>
      <nav className="hd-nav">
        <a href="#/features" data-scramble>
          FEATURES
        </a>
        <a href="#/pricing" data-scramble>
          PRICING
        </a>
      </nav>
      <a className="hd-cta magnetic" href="#/pricing">
        Start trial
      </a>
      <button className="hd-burger" onClick={onMenu} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}

/* fullscreen menu overlay */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className={open ? 'menu open' : 'menu'} aria-hidden={!open}>
      <div className="menu-bg" onClick={onClose} />
      <nav className="menu-panel">
        <button className="menu-x" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        {[
          ['Home', '#/'],
          ['Features', '#/features'],
          ['Pricing', '#/pricing'],
        ].map(([label, href], i) => (
          <a key={href} href={href} onClick={onClose} className="slot">
            <span>
              <i className="midx">0{i + 1}</i>
              {label}
            </span>
            <span aria-hidden="true">
              <i className="midx">0{i + 1}</i>
              {label}
            </span>
          </a>
        ))}
        <div className="menu-foot">XEVEN — THE WEB SHOULD REMEMBER.</div>
      </nav>
    </div>
  )
}

/* footer slab */
export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-grid">
        <div>
          <a className="hd-logo" href="#/">
            XEVEN
          </a>
          <p>AI employee that changes business — not just a widget.</p>
        </div>
        <div className="ft-col">
          <h4>Product</h4>
          <a href="#/features" data-scramble>
            Features
          </a>
          <a href="#/pricing" data-scramble>
            Pricing
          </a>
        </div>
        <div className="ft-col">
          <h4>Start</h4>
          <a href="#/pricing" data-scramble>
            Trial
          </a>
          <a href="#/" data-scramble>
            Top
          </a>
        </div>
      </div>
      <div className="ft-mega decode-view" data-text="XEVEN" aria-hidden="true">
        XEVEN
      </div>
      <div className="ft-bottom">
        <span>© 2026 XEVEN</span>
        <span>
          <a href="#/features">Features</a>
          <a href="#/pricing">Pricing</a>
        </span>
      </div>
    </footer>
  )
}

/* Invisible cursor, unmistakable motion: a rope trail + ambient glow.
   No dot, no backdrop-filter (that flashes white over WebGL) — the trail
   IS the cursor. Fine pointers only, dead under reduced-motion. */
const TRAIL_N = 22
export function Cursor() {
  const poly = useRef<SVGPolylineElement>(null!)
  const glow = useRef<HTMLDivElement>(null!)
  const [on] = useState(
    () =>
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (!on) return
    const pts = Array.from({ length: TRAIL_N }, () => ({ x: -100, y: -100 }))
    const mouse = { x: -100, y: -100 }
    const g = { x: -100, y: -100 }
    let pulse = 0
    let visible = false
    let raf = 0
    const move = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!visible) {
        visible = true
        for (const p of pts) {
          p.x = mouse.x
          p.y = mouse.y
        }
        g.x = mouse.x
        g.y = mouse.y
      }
    }
    const leave = () => {
      visible = false
    }
    const down = () => {
      pulse = 1
    }
    const loop = () => {
      const head = pts[0]
      head.x += (mouse.x - head.x) * 0.4
      head.y += (mouse.y - head.y) * 0.4
      for (let i = 1; i < TRAIL_N; i++) {
        const p = pts[i]
        const q = pts[i - 1]
        p.x += (q.x - p.x) * 0.38
        p.y += (q.y - p.y) * 0.38
      }
      g.x += (mouse.x - g.x) * 0.16
      g.y += (mouse.y - g.y) * 0.16
      pulse *= 0.9
      if (poly.current) {
        poly.current.setAttribute(
          'points',
          pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
        )
        poly.current.style.opacity = visible ? '1' : '0'
      }
      if (glow.current) {
        const s = 1 + pulse * 0.8
        glow.current.style.transform = `translate(${g.x - 160}px, ${g.y - 160}px) scale(${s.toFixed(3)})`
        glow.current.style.opacity = visible ? '1' : '0'
      }
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    window.addEventListener('pointerdown', down)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
      window.removeEventListener('pointerdown', down)
      cancelAnimationFrame(raf)
    }
  }, [on])
  if (!on) return null
  return (
    <div className="cur" aria-hidden="true">
      <div className="cur-glow" ref={glow} />
      <svg className="cur-trail">
        <polyline
          ref={poly}
          points=""
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
