import { useRef, useState } from 'react'
import gsap from 'gsap'
import { T } from '../motion'
import { DEMO_FOCUS, DEMO_SLOTS, SHOWROOM } from '../data/product'

/* /contact — the briefing room. The demo booking flow: pick a focus,
   a focus, leave a name and work email, hold a slot the way Chrono does.
   POSTs to the studio inbox; success renders only after the server
   confirms. Values survive failure; retry reuses them. A direct mailto
   stays available throughout. */

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [focus, setFocus] = useState(DEMO_FOCUS[0])
  const [slot, setSlot] = useState(DEMO_SLOTS[0])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const card = useRef<HTMLDivElement>(null!)

  const problems = () => {
    if (!name.trim()) return 'Tell us your name.'
    if (!EMAIL_RE.test(email.trim())) return 'That email does not parse.'
    return ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = problems()
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setStatus('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/hello@xeven.world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          focus,
          slot: `${slot} — held, like Chrono does`,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      gsap.fromTo(card.current, { scale: 0.98 }, { scale: 1, duration: T.panel, ease: T.expo })
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('The signal did not land. Check your connection and retry — nothing was lost.')
    }
  }

  const retry = () => {
    setStatus('idle')
    setError('')
  }

  return (
    <div className="page">
      <p className="mono">CONTACT — BRIEFING ROOM</p>
      <h1 className="page-title">Book a demo.</h1>
      <p className="page-lede">Thirty seconds. Then we talk shop. {SHOWROOM}</p>
      <div ref={card} className="form-card">
        {status === 'sent' ? (
          <div className="form-done">
            <div className="form-check" aria-hidden="true">
              ✓
            </div>
            <h3>Demo requested, {name.split(' ')[0]}.</h3>
            <p>
              {focus} — {slot}. Confirmed by the server; we reply within two working days.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="pills" role="group" aria-label="Demo focus" style={{ marginBottom: 'var(--s24)' }}>
              {DEMO_FOCUS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={focus === d ? 'pill' : 'pill pill-ghost'}
                  aria-pressed={focus === d}
                  data-cursor
                  disabled={status === 'sending'}
                  onClick={() => setFocus(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <label>
              NAME
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" required disabled={status === 'sending'} />
            </label>
            <label>
              WORK EMAIL
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email" autoComplete="email" required disabled={status === 'sending'} />
            </label>
            <div className="pills" role="group" aria-label="Demo slot" style={{ marginBottom: 'var(--s24)' }}>
              {DEMO_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={slot === s ? 'pill' : 'pill pill-ghost'}
                  aria-pressed={slot === s}
                  data-cursor
                  disabled={status === 'sending'}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="pill" type="submit" data-cursor disabled={status === 'sending'}>
              {status === 'sending' ? 'Transmitting…' : status === 'error' ? 'Retry transmit →' : 'Confirm booking →'}
            </button>
            {status === 'error' && (
              <button className="pill pill-ghost" type="button" onClick={retry} data-cursor>
                Edit details
              </button>
            )}
            <p className="form-alt">
              Prefer mail? <a href="mailto:hello@xeven.world">hello@xeven.world</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
