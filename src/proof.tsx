import { useEffect, useRef, useState } from 'react'
import { Fade, Rise } from './fx'

/* Psychoactive-style proof wall: big numbers with context lines, counted up on entry. */
const PROOF = [
  { v: 12408, fmt: (n: number) => n.toLocaleString('en-US'), label: 'chats answered / week', ctx: 'Nights, launches, holidays — always on.' },
  { v: 38000, fmt: (n: number) => `${Math.round(n / 1000)}k`, label: 'facts held in memory', ctx: 'Sizes, budgets, carts — recalled mid-sentence.' },
  { v: 96, fmt: (n: number) => `${n}`, label: 'demos held by Chrono', ctx: 'Conflict-checked holds, confirmed in two taps.' },
  { v: 0, fmt: (n: number) => `${n}`, label: 'invented prices', ctx: 'Verified or silent. A human catches the edge.' },
]

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return n
}

function ProofCell({ v, fmt, label, ctx, start }: { v: number; fmt: (n: number) => string; label: string; ctx: string; start: boolean }) {
  const n = useCountUp(v, start)
  return (
    <div className="proof-cell">
      <b>{fmt(n)}</b>
      <span className="proof-label">{label}</span>
      <span className="proof-ctx">{ctx}</span>
    </div>
  )
}

export function ProofWall() {
  const ref = useRef<HTMLDivElement>(null!)
  const [start, setStart] = useState(false)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setStart(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="proof" ref={ref}>
      {PROOF.map((p) => (
        <ProofCell key={p.label} {...p} start={start} />
      ))}
    </div>
  )
}

/* Psychoactive-style audit widget: instant demo readout, deterministic per URL. */
const CATS = ['Chat', 'Memory', 'Booking', 'Voice', 'Knowledge']

function hashUrl(url: string) {
  let h = 2166136261
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function AuditWidget() {
  const [url, setUrl] = useState('')
  const [scores, setScores] = useState<number[] | null>(null)
  const overall = scores ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const shown = useCountUp(overall, scores !== null, 1100)

  const run = () => {
    const clean = url.trim() || 'yoursite.com'
    let h = hashUrl(clean)
    const next = CATS.map((_, i) => {
      h = (Math.imul(h ^ (i * 2654435761), 1597334677) >>> 0) % 100000
      return 38 + (h % 55)
    })
    setScores(next)
  }

  return (
    <section className="sec">
      <div className="wrap">
        <Fade>
          <p className="kicker">FREE XEVEN READINESS AUDIT</p>
        </Fade>
        <h2 className="giant">
          <Rise>
            What does your site <em>miss?</em>
          </Rise>
        </h2>
        <Fade shift={4}>
          <p className="lede">
            Drop any URL. Instant demo readout across the five instruments — connect XEVEN for
            the real one.
          </p>
        </Fade>
        <form
          className="audit-bar"
          onSubmit={(e) => {
            e.preventDefault()
            run()
          }}
        >
          <label className="sr" htmlFor="audit-url">
            Website URL
          </label>
          <input
            id="audit-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yoursite.com"
            inputMode="url"
          />
          <button className="btn btn-solid magnetic" type="submit">
            Run audit
          </button>
        </form>
        {scores && (
          <div className="audit-out" aria-live="polite">
            <p className="audit-score">
              <b>{shown}</b>
              <span>/100 readiness</span>
            </p>
            {CATS.map((c, i) => (
              <div className="audit-row" key={c}>
                <span>{c}</span>
                <div className="audit-track">
                  <i style={{ width: `${scores[i]}%` }} />
                </div>
                <b>{scores[i]}</b>
              </div>
            ))}
            <a className="btn btn-ghost magnetic" href="#/pricing">
              Fix it with XEVEN →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
