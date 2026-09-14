import { useEffect, useRef } from 'react'

/* Stripped cursor — one crisp marker, fully opaque, tracking the native
 * pointer 1:1 with a fast settle (no lag ring, no satellite shapes, no
 * trail). Difference blend keeps it visible on void and on white. The
 * native cursor stays authoritative; this is pure response. Dead on coarse
 * pointers, reduced motion, and whenever the pointer leaves the document.
 */

export default function CursorReticle() {
  const dot = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const d = dot.current
    if (!d) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let dx = mx
    let dy = my
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      d.style.opacity = '1'
    }
    const onLeave = () => {
      d.style.opacity = '0'
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      dx += (mx - dx) * 0.6
      dy += (my - dy) * 0.6
      d.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <div ref={dot} className="reticle-dot" aria-hidden="true" />
}
