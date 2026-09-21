/* XEVEN — single source of truth for every customer-facing fact on this
   site. Every line below is shown on the product marketing site (index,
   features, pricing + its pricing-config.js single source of truth,
   checkout). Nothing from outside that site is claimed here: no clients,
   metrics beyond the site's own counters, testimonials, or team members. */

export const PRODUCT = {
  name: 'XEVEN',
  byline: 'XEVEN',
  hero: 'THE AI EMPLOYEE FOR BUSINESS WEBSITES',
  sub: 'Chats 24/7, remembers shoppers, recovers carts, books with Chrono and talks with Echo. One snippet.',
  trial: '14-day free trial, cancel anytime.',
}

export interface Instrument {
  t: string
  d: string
  s: string
}

/* The five instruments (features page + home loadout strands with the
   loadout's own counters). */
export const INSTRUMENTS: Instrument[] = [
  {
    t: 'Conversation',
    d: 'Situation, knowledge, memory and behavior fuse before a word is written. Tools act, handoff catches the edge.',
    s: '12,408 THIS WEEK',
  },
  {
    t: 'Memory',
    d: 'Names, sizes, budgets, carts — per customer, recalled mid-sentence. Teach with “remember”, erase with “forget”.',
    s: '38K FACTS HELD',
  },
  {
    t: 'Chrono Booking',
    d: 'Chrono ranks real availability inside your hours, holds five minutes, confirms in two taps.',
    s: '96 DEMOS HELD',
  },
  {
    t: 'Echo Voice',
    d: 'Widget mic and phone handoff, transcription plus natural voices — 100+ languages auto-detected.',
    s: 'ECHO MIC + PHONE',
  },
  {
    t: 'Verified Knowledge',
    d: 'Products and policies, searchable by keyword and meaning. XEVEN answers only from what it can verify.',
    s: '0 INVENTED PRICES',
  },
]

export interface TelemetryStep {
  n: string
  t: string
  d: string
  meta: string
}

/* Telemetry — what the platform operates (home telemetry section). */
export const TELEMETRY: TelemetryStep[] = [
  {
    n: '01',
    t: 'Hear',
    d: 'Every message read for intent, situation and history — not just keywords.',
    meta: 'TELEMETRY 01 · HEAR',
  },
  {
    n: '02',
    t: 'Hold',
    d: 'Sizes, budgets, carts. Stored per customer, recalled mid-sentence.',
    meta: 'TELEMETRY 02 · HOLD',
  },
  {
    n: '03',
    t: 'Answer',
    d: 'Grounded in your knowledge. Verified or silent — never invented.',
    meta: 'TELEMETRY 03 · ANSWER',
  },
  {
    n: '04',
    t: 'Earn',
    d: 'Slots held. Carts recovered. Browsers become buyers.',
    meta: 'TELEMETRY 04 · EARN',
  },
]

/* The six assistant skills shown on the site (checkout integration note).
   Names only — no descriptions are published. */
export const SKILLS = ['Support', 'Sales', 'Shopping', 'Advisor', 'Booking', 'Leads']

export interface Plan {
  n: string
  /** monthly price; null = bespoke */
  m: number | null
  /** one-time setup; null = bespoke (yearly billing makes setup free) */
  setup: number | null
  /** included, exactly as the pricing stage lists them */
  inc: string[]
  /** explicitly excluded on the pricing stage */
  exc: string[]
}

/* Plans (pricing-config.js single source of truth + the pricing stage's
   own include/exclude lists). Yearly = 20% off monthly, setup free. */
export const PLANS: Plan[] = [
  {
    n: 'Launch',
    m: 29,
    setup: 99,
    inc: ['1k conversations', '50 knowledge items', 'Widget + tracker', 'Memory + behavior'],
    exc: ['Chrono booking', 'Echo voice', 'Custom rules'],
  },
  {
    n: 'Growth',
    m: 79,
    setup: 199,
    inc: ['10k conversations', '200 knowledge items', 'Chrono booking', 'Echo English voice'],
    exc: ['Voice channel', 'Multi-language', 'Custom rules'],
  },
  {
    n: 'Scale',
    m: 199,
    setup: 499,
    inc: ['50k conversations', '500 knowledge items', 'Chrono + Echo + Voice', 'Multilanguage', '10 custom rules'],
    exc: [],
  },
  {
    n: 'Custom',
    m: null,
    setup: null,
    inc: ['Unlimited everything', 'All add-ons included', 'Bespoke setup', 'Full analysis'],
    exc: [],
  },
]

/** Yearly total: 20% off monthly, billed annually. */
export function yearlyTotal(m: number): number {
  return Math.round(m * 0.8 * 12)
}

/* Trial commission (home commission section). */
export const TRIAL = {
  kicker: 'NEW GAME+ — FINAL BOSS: MISSED REVENUE',
  title: 'Fourteen days. $0 today.',
  lede: 'Live in one day. Cancel in one click.',
}

/* Live knowledge index (features page demo). Entries exactly as shown;
   the empty state is the site's own guardrail line, rebranded. */
export interface KBEntry {
  t: string
  c: string
  k: string
}

export const KB: KBEntry[] = [
  { t: 'Returns', c: '30-day returns, unused, receipt in email.', k: 'returns refund exchange' },
  { t: 'Shipping', c: 'Free over the threshold at checkout; tracked 2–5 days.', k: 'shipping delivery tracked' },
  { t: 'Booking', c: 'Ranked slots inside business hours; 5-minute holds; two-tap confirm.', k: 'booking appointment slot demo' },
  { t: 'Trial', c: '14 days, $0 today, cancel in one click.', k: 'trial price plan cancel' },
  { t: 'Voice', c: 'Widget mic plus phone handoff; transcription and natural voices.', k: 'voice call phone echo' },
]

export const KB_EMPTY = 'No verified answer — XEVEN hands off instead of inventing.'

export const TRUSTLINE = ['ONE SNIPPET TO INSTALL', 'GROUNDED ANSWERS ONLY', 'AUDITED ACTIONS', 'CANCEL IN ONE CLICK']

export const ADDONS: Array<{ n: string; d: string; p: string }> = [
  { n: 'Voice Channel', d: 'Phone calls + widget mic', p: 'from $19/mo' },
  { n: 'Multi-Language', d: 'Auto-detect chat; voice varies by provider', p: 'from $12/mo' },
  { n: 'Custom Behaviour Pack', d: '+5 rules on any plan', p: 'from $12/mo' },
]

/* Vision (home footer + bolt stats). */
export const MISSION = {
  kicker: 'ABOUT — WHY WE EXIST',
  title: 'Not just a widget.',
  lede:
    'AI employee that changes business — not just a widget. Chats 24/7, remembers every shopper, recovers carts, books with Chrono and talks with Echo.',
}

export const BOLT: Array<{ n: string; t: string; d: string }> = [
  { n: '24/7', t: 'Always on', d: 'Nights, launches, holidays.' },
  { n: '5-MIN', t: 'Slot holds', d: 'Conflict-checked slot holds.' },
  { n: '60-DAY', t: 'Booking window', d: 'Best times first.' },
]

export const PRINCIPLES: Array<{ n: string; t: string; d: string }> = [
  { n: '01', t: 'Verified or silent', d: 'Grounded in your knowledge. Verified or silent — never invented.' },
  { n: '02', t: 'Live in a day', d: 'Fourteen days, $0 today, live in one day. Cancel in one click.' },
  { n: '03', t: 'One snippet', d: 'One snippet to install. Grounded answers only. Audited actions.' },
]

/* Demo booking (the briefing-room flow). Slots are the rooms' own labels —
   confirmation happens with the team, like Chrono holds. */
export const DEMO_FOCUS = ['Revenue + bookings', 'Support at scale', 'Something bespoke']

export const DEMO_SLOTS = ['Tue 3:00 PM', 'Wed 10:30 AM', 'Thu 2:00 PM']

export const DEMO_NOTE = 'Pick a slot — held for 5 minutes, like Chrono does.'

/* Proof stats — the only numbers the site claims. Counted up on scroll. */
export interface ProofStat {
  value: number
  display: string
  label: string
}

export const PROOF: ProofStat[] = [
  { value: 12408, display: '12,408', label: 'CHATS THIS WEEK' },
  { value: 38, display: '38K', label: 'FACTS HELD' },
  { value: 96, display: '96', label: 'DEMOS HELD' },
]

/* Transcript receipts — redacted, specific, never generic praise. */
export interface Transcript {
  room: string
  time: string
  lines: Array<{ who: 'XEVEN' | 'SHOPPER'; text: string }>
}

export const TRANSCRIPTS: Transcript[] = [
  {
    room: 'CAFÉ — MORNING RUSH',
    time: '06:40',
    lines: [
      { who: 'XEVEN', text: 'Morning, Maya. Oat-milk-first, name on the cup?' },
      { who: 'SHOPPER', text: 'You remembered. Yes — and a bag of beans.' },
      { who: 'XEVEN', text: 'Held. The humans pour, I keep the line moving.' },
    ],
  },
  {
    room: 'STORE — NIGHT SHIFT',
    time: '03:00',
    lines: [
      { who: 'SHOPPER', text: 'Does the 42 run small? Need it by Friday.' },
      { who: 'XEVEN', text: 'True to size per verified stock. Tracked 2–5 days — Friday holds.' },
      { who: 'SHOPPER', text: 'Then I’ll take it.' },
    ],
  },
]

/* Audit ledger — receipts, not promises. */
export const AUDIT = [
  'CHECKED STOCK — VERIFIED, ANSWERED',
  'HELD TUE 3PM — 5:00, CONFLICT-CHECKED',
  'CONFIRMED IN 2 TAPS — NO HOLD MUSIC',
]

/* FAQ — quotable answers for humans and AI search alike. */
export interface Faq {
  q: string
  a: string
}

export const FAQ: Faq[] = [
  {
    q: 'What is XEVEN?',
    a: 'XEVEN is an AI employee for business websites. It chats 24/7, remembers every shopper, recovers carts, books with Chrono and talks with Echo — installed with one snippet.',
  },
  {
    q: 'Does XEVEN invent answers?',
    a: 'No. XEVEN answers only from your verified knowledge. Where it cannot verify, it stays silent and hands off instead of inventing — 0 invented prices.',
  },
  {
    q: 'How does Chrono booking work?',
    a: 'Chrono ranks real availability inside your business hours, holds a slot for 5 minutes conflict-checked, and confirms in two taps. Nights, launches, holidays.',
  },
  {
    q: 'How fast can we go live?',
    a: 'Live in one day. Fourteen days, $0 today, cancel in one click.',
  },
  {
    q: 'How much does it cost?',
    a: 'Launch $29/mo + $99 setup, Growth $79/mo + $199 setup, Scale $199/mo + $499 setup, Custom bespoke. Yearly billing is 20% off with free setup.',
  },
]
