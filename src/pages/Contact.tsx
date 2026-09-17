import { useRef, useState } from 'react'
import gsap from 'gsap'

/* /contact — name / email / mission with real submission.
   POSTs to the studio inbox; success renders only after the server
   confirms. Values survive failure; retry reuses them. A direct
   mailto stays available throughout. */

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mission, setMission] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const card = useRef<HTMLDivElement>(null!)

  const problems = () => {
    if (!name.trim()) return 'Tell us your name.'
    if (!EMAIL_RE.test(email.trim())) return 'That email does not parse.'
    if (mission.trim().length < 12) return 'Give the mission a sentence or two.'
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
        body: JSON.stringify({ name: name.trim(), email: email.trim(), mission: mission.trim() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      gsap.fromTo(
        card.current,
        { scale: 0.98 },
        { scale: 1, duration: 0.35, ease: 'expo.out' },
      )
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
      <p className="mono">CONTACT — TRANSMIT</p>
      <h1 className="page-title">Start a world.</h1>
      <div ref={card} className="form-card">
        {status === 'sent' ? (
          <div className="form-done">
            <div className="form-check" aria-hidden="true">
              ✓
            </div>
            <h3>Signal received, {name.split(' ')[0]}.</h3>
            <p>Confirmed by the server. We reply within two working days.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label>
              NAME
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" required disabled={status === 'sending'} />
            </label>
            <label>
              EMAIL
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@analytical.engine" type="email" autoComplete="email" required disabled={status === 'sending'} />
            </label>
            <label>
              MISSION
              <textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Describe the world you need…" rows={4} required disabled={status === 'sending'} />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="pill" type="submit" data-cursor disabled={status === 'sending'}>
              {status === 'sending' ? 'Transmitting…' : status === 'error' ? 'Retry transmit →' : 'Transmit →'}
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
