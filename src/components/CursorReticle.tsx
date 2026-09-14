import { useEffect, useRef } from 'react'

/* Reticle cursor — a difference-blend ring + dot that trails the native
 * pointer with lerped physics and blooms over interactive targets. The
 * native cursor stays visible and authoritative (no hijack, no lockout);
 * the reticle is pure response. Dead on coarse pointers, reduced motion,
 * and whenever the pointer leaves the document.
 */

export default function CursorReticle() {
  const ring = useRef<HTMLDivElement>(null!)
  const dot = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = ring.current
    const d = dot.current
    if (!r || !d) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let dx = mx
    let dy = my
    let hot = false
    let visible = false
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!visible) {
        visible = true
        r.style.opacity = '1'
        d.style.opacity = '1'
        rx = dx = mx
        ry = dy = my
      }
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null
      hot = !!t?.closest?.('button, a, [data-cursor]')
    }
    const onLeave = () => {
      visible = false
      r.style.opacity = '0'
      d.style.opacity = '0'
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      dx += (mx - dx) * 0.45
      dy += (my - dy) * 0.45
      const s = hot ? 2.1 : 1
      r.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) scale(${s})`
      d.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <div ref={ring} className="reticle" aria-hidden="true" />
      <div ref={dot} className="reticle-dot" aria-hidden="true" />
    </>
  )
}
