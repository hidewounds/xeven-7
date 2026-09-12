import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Fade, Rise } from './fx'
import './chat.css'

export type ChatMsg = { from: 'user' | 'xeven'; label?: string; text: string; chips?: string[] }

/* script A — the reference conversation, XEVEN edition */
const SCRIPT_HOME: ChatMsg[] = [
  { from: 'xeven', text: 'Welcome back — I\u2019m XEVEN. Ask me anything.' },
  { from: 'user', text: 'Do you have size 42?' },
  {
    from: 'xeven',
    label: 'REMEMBERS YOU',
    text: 'Yes \u2014 7\u201312 in stock. You left 42 in cart \u2014 hold it?',
  },
  { from: 'user', text: 'Book me tomorrow 3pm?' },
  {
    from: 'xeven',
    label: 'CHRONO',
    text: 'Tomorrow 3:00 PM is open. Pick a time \u2014 held, conflict-checked.',
    chips: ['Tomorrow 3:00 PM', 'Wed 10:30 AM', 'Thu 2:00 PM'],
  },
]

const HOME_CHIPS = ['Check size 42', 'What do you sell?', 'Book tomorrow 3pm?']

/* script B — Chrono booking flow, from the widget playbook */
const SCRIPT_BOOK: ChatMsg[] = [
  { from: 'user', text: 'Book a demo for Thursday?' },
  {
    from: 'xeven',
    label: 'CHRONO',
    text: 'Thursday has 2:00 PM and 4:30 PM open. Pick one \u2014 held for 5 minutes, like always.',
    chips: ['Thu 2:00 PM', 'Thu 4:30 PM', 'Fri \u2014 closed'],
  },
  { from: 'user', text: 'Thu 2:00 PM' },
  {
    from: 'xeven',
    label: 'CHRONO \u00b7 HELD',
    text: 'Thu 2:00 PM held. Confirmed in two taps \u2014 done.',
  },
]

function replyFor(q: string): ChatMsg {
  const s = q.toLowerCase()
  if (/(size|42|stock|cart)/.test(s))
    return {
      from: 'xeven',
      label: 'REMEMBERS YOU',
      text: '7\u201312 in stock in 42 \u2014 and your cart is still holding one. Want checkout?',
    }
  if (/(book|slot|tomorrow|today|monday|tuesday|wednesday|thursday|friday|\bpm\b|\bam\b|demo|appointment)/.test(s))
    return {
      from: 'xeven',
      label: 'CHRONO',
      text: 'Tomorrow 3:00 PM is open \u2014 held for 5 minutes, conflict-checked. Confirm in two taps.',
      chips: ['Tomorrow 3:00 PM', 'Wed 10:30 AM'],
    }
  if (/(price|cost|plan|much|trial)/.test(s))
    return {
      from: 'xeven',
      text: 'Launch $29, Growth $79, Scale $199 \u2014 yearly takes 20% off, 14 days free. See Pricing \u2192',
    }
  if (/remember/.test(s))
    return { from: 'xeven', label: 'MEMORY', text: 'Noted \u2014 I\u2019ll remember that. Say \u2018forget\u2019 anytime to erase.' }
  if (/(forget|erase)/.test(s))
    return { from: 'xeven', label: 'MEMORY', text: 'Erased. What should I hold instead?' }
  if (/(sell|offer|product|collection)/.test(s))
    return { from: 'xeven', text: 'Everything in the current collection \u2014 search it, or ask me for a pick.' }
  if (/(human|agent|person|help)/.test(s))
    return { from: 'xeven', text: 'Looping in a human now \u2014 they see this whole thread. One moment.' }
  if (/^(hi|hey|hello|yo)\b/.test(s))
    return { from: 'xeven', text: 'Hey \u2014 I\u2019m XEVEN, online now. Sizes, slots, orders \u2014 what do you need?' }
  return {
    from: 'xeven',
    text: 'Grounded answers only \u2014 I answer from verified store knowledge, never invented. A human can pick this up anytime.',
  }
}

export function ChatDemo({
  script,
  chips,
  interactive = false,
  compact = false,
  kicker,
  title,
}: {
  script: 'home' | 'book'
  chips?: string[]
  interactive?: boolean
  compact?: boolean
  kicker: string
  title: ReactNode
}) {
  const lines = script === 'home' ? SCRIPT_HOME : SCRIPT_BOOK
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const timers = useRef<number[]>([])
  const box = useRef<HTMLDivElement>(null!)
  const started = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMsgs(lines)
      return
    }
    const el = box.current
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting || started.current) return
          started.current = true
          let t = 400
          lines.forEach((m) => {
            if (m.from === 'xeven') {
              timers.current.push(window.setTimeout(() => setTyping(true), t))
              t += 750
              timers.current.push(
                window.setTimeout(() => {
                  setTyping(false)
                  setMsgs((prev) => [...prev, m])
                }, t),
              )
              t += 700
            } else {
              timers.current.push(window.setTimeout(() => setMsgs((prev) => [...prev, m]), t))
              t += 750
            }
          })
          io.disconnect()
        })
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.current.forEach((id) => window.clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const send = (text: string) => {
    const q = text.trim()
    if (!q) return
    setMsgs((prev) => [...prev, { from: 'user', text: q }])
    setInput('')
    setTyping(true)
    timers.current.push(
      window.setTimeout(() => {
        setTyping(false)
        setMsgs((prev) => [...prev, replyFor(q)])
      }, 850),
    )
  }

  return (
    <section className="chat-sec">
      <div className="wrap">
        <Fade>
          <p className="kicker">{kicker}</p>
        </Fade>
        <h2 className="giant">
          <Rise>{title}</Rise>
        </h2>
        <div className={compact ? 'chat compact' : 'chat'}>
          <div className="chat-head">
            <span className="avatar">X</span>
            <span className="who">
              <b>Xeven</b>
              <i>
                <u /> online
              </i>
            </span>
            <span className="live">
              <u /> LIVE
            </span>
          </div>
          <div className="chat-body" ref={box}>
            {msgs.map((m, i) =>
              m.from === 'user' ? (
                <div className="msg user" key={i}>
                  <div className="bubble">{m.text}</div>
                </div>
              ) : (
                <div className="msg xeven" key={i}>
                  {m.label && <span className="mlabel">{m.label}</span>}
                  <div className="bubble">{m.text}</div>
                  {m.chips && (
                    <div className="chips">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          disabled={/closed/i.test(c)}
                          onClick={() => send(c.replace(/ \u2014 closed/i, ''))}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div className="msg xeven">
                <div className="bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
          {interactive && chips && (
            <div className="chips foot">
              {chips.map((c) => (
                <button key={c} onClick={() => send(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {interactive && (
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                aria-label="Ask Xeven anything"
              />
              <button type="submit" aria-label="Send">
                ↗
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export { HOME_CHIPS }
