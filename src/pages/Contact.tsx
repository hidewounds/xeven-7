import { useRef, useState } from 'react'
import gsap from 'gsap'

/* /contact — name / email / mission with success animation.
   Local state by default; wire Supabase only if you add keys. */

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mission, setMission] = useState('')
  const card = useRef<HTMLDivElement>(null!)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !mission.trim()) return
    gsap.to(card.current, {
      scale: 0.96,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => setSent(true),
    })
  }

  return (
    <div className="page">
      <p className="mono">CONTACT — TRANSMIT</p>
      <h1 className="page-title">Start a world.</h1>
      <div ref={card} className="form-card">
        {sent ? (
          <div className="form-done">
            <div className="form-check" aria-hidden="true">
              ✓
            </div>
            <h3>Signal received, {name.split(' ')[0]}.</h3>
            <p>We reply within two working days. Watch the skies.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              NAME
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" required />
            </label>
            <label>
              EMAIL
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@analytical.engine" type="email" autoComplete="email" required />
            </label>
            <label>
              MISSION
              <textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Describe the world you need…" rows={4} required />
            </label>
            <button className="pill" type="submit" data-cursor>
              Transmit →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
