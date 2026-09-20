import { useEffect, useRef } from 'react'

/* ORBITALS — the cursor companion. Three dots (mint/ember/bone) orbit the
   pointer on decaying lerp physics: wide and fast while you move, collapsing
   into a tight slow triangle at rest. Clicks flare the system and emit one
   expanding ring. Native cursor stays authoritative; this only accompanies.
   Self-gates: hidden on touch, under reduced motion, and off-window. */

const ORBS = [
  { r: 15, period: 1200, dir: 1, color: 'var(--mint)', size: 6 },
  { r: 23, period: 1900, dir: -1, color: 'var(--ember)', size: 5 },
  { r: 32, period: 2800, dir: 1, color: 'var(--bone)', size: 4 },
]

export default function CursorOrbitals() {
  const root = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const host = root.current
    const dots = Array.from(host.querySelectorAll<HTMLDivElement>('.orb'))
    let cx = window.innerWidth / 2
    let cy = window.innerHeight / 2
    let tx = cx
    let ty = cy
    let lastMove = 0
    let inside = false
    let raf = 0
    let alive = true
    const t0 = performance.now()
    const rings: Array<{ el: HTMLDivElement; born: number }> = []

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      lastMove = performance.now()
      if (!inside) {
        inside = true
        host.style.opacity = '1'
      }
    }
    const onGone = () => {
      inside = false
      host.style.opacity = '0'
    }
    const onDown = (e: PointerEvent) => {
      if (rings.length > 2) return
      const el = document.createElement('div')
      el.className = 'orb-ring'
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      host.appendChild(el)
      rings.push({ el, born: performance.now() })
    }

    const loop = (now: number) => {
      if (!alive) return
      raf = requestAnimationFrame(loop)
      const k = 0.32
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      const idle = now - lastMove > 650
      const flare = rings.length > 0 ? 2.1 : 1
      const spread = (idle ? 0.35 : 1) * flare
      dots.forEach((d, i) => {
        const o = ORBS[i]
        const a = ((now - t0) / o.period) * Math.PI * 2 * o.dir + i * 2.1
        const x = cx + Math.cos(a) * o.r * spread
        const y = cy + Math.sin(a) * o.r * spread
        d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`
        d.style.opacity = inside ? '1' : '0'
      })
      for (let i = rings.length - 1; i >= 0; i--) {
        const p = (now - rings[i].born) / 700
        if (p >= 1) {
          rings[i].el.remove()
          rings.splice(i, 1)
          continue
        }
        rings[i].el.style.transform = `translate(-50%, -50%) scale(${(0.2 + p * 2.6).toFixed(2)})`
        rings[i].el.style.opacity = String(1 - p)
      }
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onGone)
    window.addEventListener('blur', onGone)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onGone)
      window.removeEventListener('blur', onGone)
    }
  }, [])

  return (
    <div ref={root} className="orbs" aria-hidden="true" style={{ opacity: 0 }}>
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="orb"
          style={{ width: o.size, height: o.size, background: o.color }}
        />
      ))}
    </div>
  )
}
