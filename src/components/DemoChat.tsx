import { useEffect, useRef, useState } from 'react'
import { xs } from '../app/store'

/* DemoChat — a fake-live replay of XEVEN on shift. Scripted exchange types
   itself out on scroll into view and loops. The composer is disabled: watch
   only, never sendable. Reduced motion gets the full transcript, static. */

const SCRIPT: Array<{ who: 'bot' | 'user'; text: string }> = [
  { who: 'user', text: 'Do you have the oat-milk latte kit?' },
  { who: 'bot', text: 'Verified: in stock, $42 — free shipping over the threshold.' },
  { who: 'user', text: 'I left it in my cart last night.' },
  { who: 'bot', text: 'Found it — held, with 10% off for coming back.' },
  { who: 'user', text: 'Can I pick it up Tuesday?' },
  { who: 'bot', text: 'Held: Tue 3:00 PM, five minutes on the clock. Confirmed in two taps.' },
  { who: 'user', text: 'Thanks!' },
  { who: 'bot', text: 'Anytime — the shop never sleeps.' },
]

export default function DemoChat() {
  const [reduced] = useState(() => xs.reduced)
  const [count, setCount] = useState(() => (xs.reduced ? SCRIPT.length : 0))
  const [typing, setTyping] = useState(false)
  const box = useRef<HTMLDivElement>(null!)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    const later = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(() => {
        if (!cancelled) fn()
      }, ms))
    }
    const play = (i: number) => {
      if (i >= SCRIPT.length) {
        later(() => {
          setCount(0)
          play(0)
        }, 5000)
        return
      }
      setTyping(true)
      later(() => {
        setTyping(false)
        setCount(i + 1)
        play(i + 1)
      }, SCRIPT[i].who === 'bot' ? 1100 : 700)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          play(0)
        }
      },
      { threshold: 0.3 },
    )
    if (box.current) io.observe(box.current)
    return () => {
      cancelled = true
      io.disconnect()
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [reduced])

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'auto' })
  }, [count, typing])

  return (
    <div className="pg-main">
      <div className="pg-status">
        <span className="ledger-dot mint" aria-hidden="true" />
        XEVEN — LIVE REPLAY
      </div>
      <div className="pg-transcript" ref={box} aria-label="Recorded demo conversation">
        {SCRIPT.slice(0, count).map((m, i) => (
          <p key={i} className={`msg ${m.who}`}>
            {m.text}
          </p>
        ))}
        {typing && <p className="msg typing">XEVEN IS TYPING…</p>}
      </div>
      <form className="pg-composer" onSubmit={(e) => e.preventDefault()} aria-label="Watch-only demo">
        <input value="" readOnly placeholder="Watch only — book a demo to talk" aria-label="Disabled demo input" disabled />
        <button className="pill" type="submit" disabled>
          Send
        </button>
      </form>
    </div>
  )
}
