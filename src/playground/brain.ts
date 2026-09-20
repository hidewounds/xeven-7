import { DEMO_SLOTS, KB, KB_EMPTY, PLANS, yearlyTotal } from '../data/product'

/* Playground brain — a scripted XEVEN employee for the demo shift. No
   backend, no model: intent matching over the site's own published facts
   (plans, slots, knowledge base). Anything unverified gets the handoff
   line, exactly like the real employee. */

export interface BrainState {
  name: string | null
  slot: string | null
  booked: boolean
  recovered: boolean
}

export interface BrainReply {
  text: string
  chips: string[]
}

export const freshState = (): BrainState => ({ name: null, slot: null, booked: false, recovered: false })

const OPENERS: string[] = [
  'Night shift started. I’m XEVEN — I run this shop while the owner sleeps. Ask me anything a customer would: prices, booking, shipping, returns.',
]

function findKB(q: string): string | null {
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2)
  let best: { score: number; c: string } | null = null
  for (const k of KB) {
    const hay = `${k.t} ${k.c} ${k.k}`.toLowerCase()
    let score = 0
    for (const w of words) if (hay.includes(w)) score += w.length
    if (score > 0 && (!best || score > best.score)) best = { score, c: `${k.t}: ${k.c}` }
  }
  return best && best.score >= 4 ? best.c : null
}

const PLANS_LINE = PLANS.filter((p) => p.m !== null)
  .map((p) => `${p.n} $${p.m}/mo ($${yearlyTotal(p.m as number)}/yr)`)
  .join(' · ')

export function opening(): BrainReply {
  return {
    text: OPENERS[0],
    chips: ['What are the prices?', 'Book me a demo', 'I left my cart — help?'],
  }
}

export function reply(raw: string, s: BrainState): BrainReply {
  const q = raw.toLowerCase().trim()
  if (!q) return { text: 'I’m listening — try one of the suggestions below.', chips: ['What are the prices?'] }

  // name capture: "i'm ada" / "my name is ada" / "ada"
  const nameHit = q.match(/(?:my name is|i'm|i am|this is)\s+([a-z][a-z\-']{1,20})/)
  if (nameHit) {
    const name = nameHit[1][0].toUpperCase() + nameHit[1].slice(1)
    s.name = name
    return {
      text: `Noted, ${name} — I’ll remember that for the rest of this shift. What should we sort out?`,
      chips: ['Book me a demo', 'What are the prices?'],
    }
  }

  // booking flow
  if (/(book|demo|slot|appointment|schedule|call)/.test(q)) {
    if (s.booked && s.slot) {
      return { text: `You’re already held for ${s.slot}${s.name ? `, ${s.name}` : ''} — same as Chrono does. Anything else?`, chips: ['What are the prices?', 'I left my cart — help?'] }
    }
    const slotHit = DEMO_SLOTS.find((slot) => q.includes(slot.toLowerCase().split(' ')[0]) || q.includes(slot.toLowerCase()))
    if (slotHit || /(tue|wed|thu|first|any|yes|confirm|hold)/.test(q)) {
      const slot = slotHit ?? DEMO_SLOTS[0]
      s.slot = slot
      s.booked = true
      return {
        text: `Held: ${slot} — five minutes on the clock, no conflicts. I’ve put it under${s.name ? ` ${s.name}` : ' your name'}; the team confirms from here. Want the full briefing-room form too?`,
        chips: ['Take me to the form', 'What are the prices?'],
      }
    }
    return {
      text: `I can hold a slot right now — ${DEMO_SLOTS.join(', ')}. Which one?`,
      chips: [...DEMO_SLOTS],
    }
  }
  if (/take me to the form|briefing|form/.test(q)) {
    return { text: 'OPEN:/demo', chips: [] }
  }

  // cart recovery demo
  if (/(cart|checkout|left|abandon|recover)/.test(q)) {
    if (!s.recovered) {
      s.recovered = true
      return {
        text: 'Found it — oat-milk latte kit, still at checkout. I’ve held it and knocked 10% off for coming back. Say “forget my cart” any time and I erase it completely.',
        chips: ['Forget my cart', 'Book me a demo'],
      }
    }
    return { text: 'Your cart is still held. Say “forget my cart” and it’s gone — I keep nothing I’m not asked to.', chips: ['Forget my cart'] }
  }
  if (/(forget|erase|delete|remove).*cart/.test(q)) {
    s.recovered = false
    return { text: 'Erased — cart, memory of it, all gone. Verified or silent, and now silent.', chips: ['Book me a demo'] }
  }

  // memory demo
  const forgetHit = q.match(/forget\s+(.+)/)
  if (/(remember|my .* is|i like|i prefer)/.test(q) && !forgetHit) {
    return { text: 'Stored. I’ll recall that mid-sentence next time — per customer, never shared. “Forget …” erases anything.', chips: ['Book me a demo'] }
  }
  if (forgetHit) {
    return { text: `Erased “${forgetHit[1].trim()}”. I keep nothing I’m not asked to.`, chips: ['Book me a demo'] }
  }

  // prices
  if (/(price|pricing|plan|cost|much|trial|free)/.test(q)) {
    return {
      text: `${PLANS_LINE}. Custom is bespoke. Trial: 14 days, $0 today, cancel in one click.`,
      chips: ['Book me a demo', 'What is XEVEN?'],
    }
  }

  // identity / capability
  if (/(who are you|what is xeven|what do you do|human|real person|agent)/.test(q)) {
    return {
      text: 'I’m XEVEN — the AI employee for business websites. I chat 24/7, remember shoppers, recover carts, book with Chrono and talk with Echo. This playground runs the same playbook, scripted, right in your browser.',
      chips: ['Book me a demo', 'What are the prices?'],
    }
  }
  if (/(echo|voice|call|phone|speak|talk)/.test(q)) {
    return { text: 'Echo is my voice: widget mic plus phone handoff, transcription and natural voices, 100+ languages auto-detected. Here I’m text-only — the demo shift.', chips: ['Book me a demo'] }
  }
  if (/(thank|thanks|great|cool|nice|bye)/.test(q)) {
    return { text: `Anytime${s.name ? `, ${s.name}` : ''} — the shop never sleeps. I’m here when the next customer walks in.`, chips: ['Book me a demo'] }
  }

  // knowledge base grounding
  const kb = findKB(q)
  if (kb) {
    return { text: `${kb} — verified from the shop’s knowledge, or I stay silent.`, chips: ['Book me a demo', 'What are the prices?'] }
  }

  // handoff, like the real employee
  return {
    text: KB_EMPTY + ' — try prices, booking, or your cart and watch me work.',
    chips: ['What are the prices?', 'Book me a demo', 'I left my cart — help?'],
  }
}
