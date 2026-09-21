import { useEffect, useRef, useState } from 'react'
import { PROOF } from '../data/product'
import { xs } from '../app/store'

/* ProofStats — the only numbers the site claims. Count up once on view,
   tabular numerals, instant final under reduced motion. */

function Stat({ value, display, label }: { value: number; display: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const [n, setN] = useState(0)
  const [done, setDone] = useState(() => xs.reduced)

  useEffect(() => {
    const el = ref.current
    if (!el || xs.reduced) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const dur = 1400
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur)
          const e = 1 - Math.pow(2, -10 * p)
          setN(Math.round(value * (p === 1 ? 1 : e)))
          if (p < 1) requestAnimationFrame(tick)
          else setDone(true)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  const text = done ? display : value >= 1000 ? n.toLocaleString('en-US') : value >= 100 ? String(n) : String(n)
  return (
    <div className="stat" ref={ref}>
      <p className="stat-num">{text}</p>
      <p className="mono stat-label">{label}</p>
    </div>
  )
}

export default function ProofStats() {
  return (
    <div className="stat-grid" aria-label="Published shift numbers">
      {PROOF.map((s) => (
        <Stat key={s.label} value={s.value} display={s.display} label={s.label} />
      ))}
    </div>
  )
}
