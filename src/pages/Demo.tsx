import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { T } from '../motion'
import { hashQuery } from '../app/store'
import { DEMO_FOCUS, DEMO_NOTE, DEMO_SLOTS, INSTRUMENTS, PLANS } from '../data/product'
import ShineBorder from '../components/magicui/ShineBorder'
import Reveal from '../components/Reveal'

/* BRIEFING — book the walkthrough. Thirty seconds: pick a focus, leave a
   name and work email, hold a slot the way Chrono does. `?plan=<slug>`
   preselects. Success renders a ticket stub with a reference code. */

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const planSlug = (n: string) => n.toLowerCase()

export default function Demo() {
  const [plan] = useState(() => {
    const q = (hashQuery('plan') || '').toLowerCase()
    return PLANS.some((p) => planSlug(p.n) === q) ? q : null
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [focus, setFocus] = useState(DEMO_FOCUS[0])
  const [slot, setSlot] = useState(DEMO_SLOTS[0])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [honey, setHoney] = useState('')
  const [heldAt, setHeldAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [refCode, setRefCode] = useState('')
  const card = useRef<HTMLDivElement>(null!)

  /* Chrono-style 5-minute hold on the picked slot. Resets on slot change. */
  useEffect(() => {
    if (status === 'sent') return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [status])
  const heldLeft = Math.max(0, 300 - Math.floor((now - heldAt) / 1000))
  const heldLabel = `${Math.floor(heldLeft / 60)}:${String(heldLeft % 60).padStart(2, '0')}`

  const problems = () => {
    if (!name.trim()) return 'Tell us your name.'
    if (!EMAIL_RE.test(email.trim())) return 'That email does not parse.'
    return ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honey) return
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
          slot,
          ...(plan ? { plan } : {}),
          _honey: honey,
          _captcha: false,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      gsap.fromTo(card.current, { scale: 0.98 }, { scale: 1, duration: T.panel, ease: T.expo })
      setRefCode(`XVN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)
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
      <Reveal>
        <p className="mono">BRIEFING — THIRTY SECONDS, THEN WE TALK SHOP</p>
        <h1 className="page-title">Book a demo.</h1>
        <p className="page-lede">
          Thirty seconds. Then we talk shop. {DEMO_NOTE}
        </p>
      </Reveal>
      {plan ? (
        <p className="pill pill-ghost" style={{ alignSelf: 'flex-start' }} aria-live="polite">
          {plan[0].toUpperCase() + plan.slice(1)} plan selected
        </p>
      ) : (
        <p className="pill pill-ghost" style={{ alignSelf: 'flex-start' }}>
          All plans — we’ll fit yours on the call
        </p>
      )}
      <Reveal>
        <ol className="demo-steps" aria-label="What happens next">
          <li><b>01</b> Tell us your focus</li>
          <li><b>02</b> We confirm in hours</li>
          <li><b>03</b> XEVEN trains on your site</li>
        </ol>
      </Reveal>
      <p className="mono proof-strip" aria-label="Published shift numbers">
        {INSTRUMENTS.slice(0, 3).map((r) => r.s).join(' · ')}
      </p>
      <Reveal>
        <div ref={card} className="form-card form-card-shine">
          <ShineBorder duration={16} shineColor={['#4df3ff', '#ff6fae']} />
          {status === 'sent' ? (
            <div className="form-done">
              <div className="form-check" aria-hidden="true">
                ✓
              </div>
              <h3>Demo requested, {name.split(' ')[0]}.</h3>
              <p>
                {focus} — {slot}. We’ll reach out in hours to train XEVEN.
              </p>
              {refCode && <p className="mono">TICKET {refCode} — HELD LIKE CHRONO HOLDS.</p>}
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <input
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', opacity: 0, height: 0 }}
              />
              <p className="mono" style={{ margin: '0 0 var(--s12)' }}>What should we focus on?</p>
              <div className="pills" role="group" aria-label="Demo focus" style={{ marginBottom: 'var(--s24)' }}>
                {DEMO_FOCUS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={focus === d ? 'pill' : 'pill pill-ghost'}
                    aria-pressed={focus === d}
                    data-cursor="PICK"
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
              <div className="pills" role="group" aria-label="Demo slot" style={{ marginBottom: 'var(--s12)' }}>
                {DEMO_SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={slot === s ? 'pill' : 'pill pill-ghost'}
                    aria-pressed={slot === s}
                    data-cursor="HOLD"
                    disabled={status === 'sending'}
                    onClick={() => {
                      setSlot(s)
                      setHeldAt(Date.now())
                      setNow(Date.now())
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mono hold-timer" aria-live="polite">
                HELD {heldLabel} — LIKE CHRONO DOES
              </p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="pill" type="submit" data-cursor="SEND" disabled={status === 'sending'}>
                {status === 'sending' ? 'Transmitting…' : status === 'error' ? 'Retry transmit →' : 'Confirm booking →'}
              </button>
              {status === 'error' && (
                <button className="pill pill-ghost" type="button" onClick={retry} data-cursor="EDIT">
                  Edit details
                </button>
              )}
              <p className="form-alt">
                Prefer mail?{' '}
                <button
                  className="pill pill-ghost"
                  type="button"
                  data-cursor="MAIL"
                  onClick={() => {
                    window.location.href = 'mailto:hello@xeven.world'
                  }}
                  style={{ minHeight: 36 }}
                >
                  hello@xeven.world
                </button>
              </p>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  )
}
