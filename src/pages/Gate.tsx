import { useEffect, useRef, useState } from 'react'

/* Gate — the SHIFT START intro. A ledger counts 000→100 while the shift
   words cycle (SIGNAL / WORLD / LIVE); click anywhere to step in, auto
   entry at ~1.9s. Hook classes (.intro/.intro-stage/.intro-count) kept for
   the capture rig. Static under reduced motion. */

const WORDS = ['SIGNAL', 'WORLD', 'LIVE']

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const done = useRef(false)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [n, setN] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 0))
  const [wi, setWi] = useState(0)

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => {
        if (!done.current) {
          done.current = true
          onEnter()
        }
      }, 400)
      return () => window.clearTimeout(t)
    }
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1900)
      setN(Math.floor(p * 100))
      setWi(Math.min(WORDS.length - 1, Math.floor(p * WORDS.length)))
      if (p >= 1) {
        if (!done.current) {
          done.current = true
          onEnter()
        }
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [onEnter, reduced])

  const enter = () => {
    if (done.current) return
    done.current = true
    onEnter()
  }

  return (
    <div className="intro" onClick={enter} role="button" aria-label="Enter the site" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') enter()
      }}
    >
      <div className="intro-stage">
        <p className="intro-count">{String(n).padStart(3, '0')} — {WORDS[wi]}</p>
        <p className="intro-word">The shop never sleeps.</p>
      </div>
    </div>
  )
}
