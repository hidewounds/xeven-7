import { useEffect, useRef } from 'react'

/* Cursor — fine pointers only. Dot follows instantly, ring trails behind.
   [data-cursor] grows the ring; data-cursor="LABEL" stamps a micro-label.
   Touch devices never see it (matchMedia gate + CSS hover guard). */

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null!)
  const ring = useRef<HTMLDivElement>(null!)
  const label = useRef<HTMLSpanElement>(null!)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.body.classList.add('has-cursor')
    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null
      const big = !!t
      ring.current?.classList.toggle('big', big)
      if (label.current) label.current.textContent = t?.getAttribute('data-cursor') || ''
    }
    window.addEventListener('mousemove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div className="c-dot" ref={dot} aria-hidden="true" />
      <div className="c-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
    </>
  )
}
