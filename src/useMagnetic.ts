import { useEffect, useRef } from 'react'

/* Magnetic pull for UI targets. Zero deps, rAF LERP, transform-only.
   Fine pointers + full motion only. */

export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null!)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0
    let hot = false

    const loop = () => {
      const k = 0.18
      cur.x += ((hot ? target.x : 0) - cur.x) * k
      cur.y += ((hot ? target.y : 0) - cur.y) * k
      el.style.transform = `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px)`
      if (hot || Math.abs(cur.x) > 0.05 || Math.abs(cur.y) > 0.05) {
        raf = requestAnimationFrame(loop)
      } else {
        el.style.transform = ''
        raf = 0
      }
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const enter = () => {
      hot = true
      kick()
    }
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      target.x = (e.clientX - (r.left + r.width / 2)) * strength
      target.y = (e.clientY - (r.top + r.height / 2)) * strength
    }
    const leave = () => {
      hot = false
      kick()
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      if (raf) cancelAnimationFrame(raf)
      el.style.transform = ''
    }
  }, [strength])

  return ref
}
