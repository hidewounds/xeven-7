/* SaaS content ported from the NOVA site, rebranded XEVEN. */

export const VALUE_PROPS = [
  {
    n: '01',
    t: 'Never miss a shopper',
    d: 'Grounded answers from your knowledge, 24/7. Verified or silent — with a human handoff when it matters.',
  },
  {
    n: '02',
    t: 'Turns carts into sales',
    d: 'Remembers sizes, budgets and carts — then brings the shopper back and closes.',
  },
  {
    n: '03',
    t: 'Operates, not just chats',
    d: 'Books with Chrono and talks with Echo. Ranked slots, 100 languages, real operations.',
  },
]

export const INSTRUMENTS = [
  {
    n: '01',
    id: 'f-chat',
    t: 'Conversation',
    s: 'Understands, then answers',
    d: 'Situation, knowledge, memory and behavior fuse before a word is written. Grounded chat, 24/7.',
    stat: '12,408 chats / week',
  },
  {
    n: '02',
    id: 'f-memory',
    t: 'Memory',
    s: 'Shoppers, kept',
    d: 'Names, sizes, budgets, carts — per customer, recalled mid-sentence. Teach with “remember”, erase with “forget”.',
    stat: '38k facts held',
  },
  {
    n: '03',
    id: 'f-book',
    t: 'Booking',
    s: 'Slots that hold',
    d: 'Chrono ranks real availability inside your hours, holds five minutes, confirms in two taps.',
    stat: '96 demos held',
  },
  {
    n: '04',
    id: 'f-voice',
    t: 'Voice',
    s: 'It talks back',
    d: 'Widget mic and phone handoff, transcription plus natural Echo voices.',
    stat: 'Echo mic + phone',
  },
  {
    n: '05',
    id: 'f-brain',
    t: 'Knowledge',
    s: 'Verified or silent',
    d: 'Products and policies, searchable by keyword and meaning. Answers only from what it can verify.',
    stat: '0 invented prices',
  },
]

export const TELEMETRY = [
  { n: '01', t: 'Hear', d: 'Every message read for intent, situation and history — not just keywords.' },
  { n: '02', t: 'Hold', d: 'Sizes, budgets, carts. Stored per customer, recalled mid-sentence.' },
  { n: '03', t: 'Answer', d: 'Grounded in your knowledge. Verified or silent — never invented.' },
  { n: '04', t: 'Earn', d: 'Slots held. Carts recovered. Browsers become buyers.' },
]

export type Plan = {
  id: string
  label: string
  m: number | null
  setup: number
  blurb: string
  feats: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'launch',
    label: 'Launch',
    m: 29,
    setup: 99,
    blurb: 'One site, live in a day.',
    feats: ['Conversation core', 'Memory vault', 'Knowledge index', '1k chats / mo', '50 knowledge items'],
  },
  {
    id: 'growth',
    label: 'Growth',
    m: 79,
    setup: 199,
    blurb: 'Revenue + bookings engine.',
    feats: ['Everything in Launch', 'Chrono booking console', 'Cart recovery', '10k chats / mo', '200 knowledge items', 'Echo English'],
  },
  {
    id: 'scale',
    label: 'Scale',
    m: 199,
    setup: 499,
    blurb: 'Support at serious volume.',
    feats: ['Everything in Growth', 'Voice + Multi-language included', '50k chats / mo', '500 knowledge items', '10 custom rules'],
  },
  {
    id: 'custom',
    label: 'Custom',
    m: null,
    setup: 999,
    blurb: 'Something bespoke. From $499/mo.',
    feats: ['Unlimited chats + knowledge', 'Custom RLHF tuning', 'Dedicated infra', 'SLA + onboarding'],
  },
]

export const ADDONS = [
  { label: 'Multi-Agent Unlock', prices: ['+$20/mo', 'Included', 'Included', 'Included'] },
  { label: 'Voice Channel', prices: ['+$29/mo', '+$19/mo', 'Included', 'Included'] },
  { label: 'Multi-Language', prices: ['+$15/mo', '+$12/mo', 'Included', 'Included'] },
  { label: 'Custom Behaviour Pack', prices: ['+$15/mo', '+$12/mo', 'Contact us', 'Included'] },
]

export const TRUSTLINE = [
  'One snippet to install',
  'Grounded answers only',
  'Audited actions',
  'Cancel in one click',
]

export const STATS = [
  { v: '24/7', d: 'always on — nights, launches, holidays' },
  { v: '5-min', d: 'conflict-checked slot holds' },
  { v: '60-day', d: 'booking window, best times first' },
]

export const yearlyTotal = (m: number) => Math.round(m * 0.8 * 12)
