import { useEffect, useRef, useState } from 'react'

/* Cursor FX v2 — rebuilt from scratch, zero WebGL. The native cursor is
   hidden (see index.css) and two notice-it layers follow one smoothed head:
   1. aura: DOM glow riding the head (transform-only, no layout cost)
   2. wake: 2D-canvas ribbon through recent head positions, width by speed
   One rAF loop, coalesced pointer events, exponential follow — no stepping.
   Debug: open with ?cursor-debug (or #cursor-debug) for a red head dot
   plus a live coordinate readout. */

interface Pt {
  x: number
  y: number
  t: number
}

const MAX_PTS = 30
const LIFE_MS = 650

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const aura = useRef<HTMLDivElement>(null!)
  const [on] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!on) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const debug =
      window.location.hash.includes('cursor-debug') ||
      new URLSearchParams(window.location.search).has('cursor-debug')
    if (debug) console.info('[cursor-fx] alive — debug head enabled')

    let w = 0
    let h = 0
    const resize = () => {
      // mobile pixel cap 1.25, desktop 1.5
      const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const target = { x: -100, y: -100 }
    const head = { x: -100, y: -100 }
    const pts: Pt[] = []
    let seen = false
    let hot = false
    let glow = 0.55

    const onMove = (e: MouseEvent) => {
      const anyE = e as unknown as { getCoalescedEvents?: () => Array<MouseEvent> }
      const list = typeof anyE.getCoalescedEvents === 'function' ? anyE.getCoalescedEvents() : [e]
      for (const ev of list) {
        target.x = (ev as MouseEvent).clientX
        target.y = (ev as MouseEvent).clientY
      }
      if (!seen) {
        // snap on first contact — never streak in from offscreen
        head.x = target.x
        head.y = target.y
        seen = true
      }
      lastAct = performance.now()
      kick()
    }
    const onOver = (e: MouseEvent) => {
      hot = !!(e.target as HTMLElement).closest?.('a, button, [data-cursor]')
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })

    let raf = 0
    let last = performance.now()
    let lastAct = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      // idle sleep: no input for 3s and no live residue — drop the loop
      // until the pointer returns (kick), instead of clearRect-ing forever
      if (pts.length === 0 && now - lastAct > 3000) {
        cancelAnimationFrame(raf)
        raf = 0
        return
      }
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // tight exponential follow — head never steps between events
      const k = 1 - Math.pow(0.00005, dt)
      head.x += (target.x - head.x) * k
      head.y += (target.y - head.y) * k
      const goal = hot ? 0.9 : 0.55
      glow += (goal - glow) * (1 - Math.pow(0.002, dt))

      if (aura.current) {
        aura.current.style.transform = `translate3d(${head.x.toFixed(1)}px,${head.y.toFixed(1)}px,0)`
      }
      if (!seen) return

      const tail = pts[pts.length - 1]
      if (!tail || Math.hypot(head.x - tail.x, head.y - tail.y) > 1.5) {
        pts.push({ x: head.x, y: head.y, t: now })
        if (pts.length > MAX_PTS) pts.splice(0, pts.length - MAX_PTS)
      }
      while (pts.length && now - pts[0].t > LIFE_MS) pts.shift()

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // newest-first ribbon: alpha + width grow toward the head
      for (let i = 1; i < pts.length; i++) {
        const f = i / pts.length
        const age = 1 - (now - pts[i].t) / LIFE_MS
        const a = f * f * age * glow
        if (a <= 0.004) continue
        const spd = Math.min(1, Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) / 24)
        ctx.strokeStyle = `rgba(228,234,235,${a.toFixed(3)})`
        ctx.lineWidth = 1.5 + f * (8 + spd * 18)
        ctx.beginPath()
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
        ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }

      if (debug) {
        ctx.fillStyle = '#ff3b30'
        ctx.beginPath()
        ctx.arc(head.x, head.y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#9CF5D3'
        ctx.font = '12px monospace'
        ctx.fillText(`${Math.round(head.x)},${Math.round(head.y)} n=${pts.length}`, head.x + 12, head.y - 12)
      }
    }
    const kick = () => {
      last = performance.now()
      lastAct = last
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else kick()
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [on])

  if (!on) return null
  return (
    <>
      <div ref={aura} className="aura-fixed" aria-hidden="true" />
      <canvas ref={canvasRef} className="trail-fixed" aria-hidden="true" />
    </>
  )
}
