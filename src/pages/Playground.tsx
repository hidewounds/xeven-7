import { useEffect, useRef, useState } from 'react'
import { freshState, opening, reply } from '../playground/brain'
import type { BrainReply } from '../playground/brain'
import { navigate, xs } from '../app/store'

/* PLAYGROUND — the live employee. A scripted XEVEN runs a full demo shift
   in the browser: answers from published facts, recovers a cart, holds a
   demo slot, hands off what it can't verify. Typing beat unless reduced. */

interface Msg {
  who: 'bot' | 'user'
  text: string
}

export default function Playground() {
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ who: 'bot', text: opening().text }])
  const [chips, setChips] = useState<string[]>(() => opening().chips)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const state = useRef(freshState())
  const box = useRef<HTMLDivElement>(null!)
  const [reduced] = useState(() => xs.reduced)

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [msgs, typing, reduced])

  const say = (text: string) => {
    const clean = text.trim()
    if (!clean || typing) return
    const res: BrainReply = reply(clean, state.current)
    if (res.text.startsWith('OPEN:')) {
      navigate('demo')
      return
    }
    setMsgs((m) => [...m, { who: 'user', text: clean }])
    setDraft('')
    setChips([])
    if (reduced) {
      setMsgs((m) => [...m, { who: 'bot', text: res.text }])
      setChips(res.chips)
      return
    }
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { who: 'bot', text: res.text }])
      setChips(res.chips)
    }, 650 + Math.min(900, res.text.length * 4))
  }

  return (
    <div className="page">
      <p className="mono">PLAYGROUND — THE LIVE EMPLOYEE</p>
      <h1 className="page-title">Don’t read about it. Hire it for five minutes.</h1>
      <p className="page-lede">
        This is XEVEN on shift — scripted, in your browser, no account. Ask prices, book a slot,
        abandon a cart and watch it come back for you.
      </p>
      <div className="pg">
        <div className="pg-main">
          <div className="pg-status">
            <span className="ledger-dot mint" aria-hidden="true" />
            XEVEN ON SHIFT — DEMO BRAIN
          </div>
          <div className="pg-transcript" ref={box} aria-live="polite">
            {msgs.map((m, i) => (
              <p key={i} className={`msg ${m.who}`}>
                {m.text}
              </p>
            ))}
            {typing && <p className="msg typing">XEVEN IS TYPING…</p>}
          </div>
          {!!chips.length && (
            <div className="pg-chips">
              {chips.map((c) => (
                <button key={c} className="pill pill-ghost" data-cursor onClick={() => say(c)} style={{ minHeight: 40 }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <form
            className="pg-composer"
            onSubmit={(e) => {
              e.preventDefault()
              say(draft)
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask for prices, a slot, your cart…"
              aria-label="Talk to XEVEN"
              autoComplete="off"
            />
            <button className="pill" type="submit" data-cursor>
              Send →
            </button>
          </form>
        </div>
        <aside className="pg-side">
          <div className="pg-card">
            <h3>Try the shift plan</h3>
            <p>1. Ask prices. 2. Book “Tue”. 3. Say you left your cart. 4. Tell it to forget. 5. Ask something it can’t verify.</p>
          </div>
          <div className="pg-card">
            <h3>Ready for the real thing?</h3>
            <p>The briefing room takes thirty seconds and a human confirms.</p>
            <button className="pill" data-cursor onClick={() => navigate('demo')}>
              Book a demo →
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
