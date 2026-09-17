/* XEVEN — single source of truth for every customer-facing fact on this
   site. Xeven is the SaaS, previously known as Nova. Every line below is
   shown on the NOVA marketing site (index, features, pricing + its
   pricing-config.js single source of truth, checkout, worlds). Nothing
   from outside that site is claimed here: no clients, metrics beyond the
   site's own counters, testimonials, or team members. */

export const PRODUCT = {
  name: 'XEVEN',
  byline: 'XEVEN — FORMERLY NOVA',
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
  p: string
  setup: string
  f: string[]
}

/* Plans (pricing-config.js + checkout plan options). Yearly saves 20% off
   monthly, per the pricing toggle and config. */
export const PLANS: Plan[] = [
  {
    n: 'Launch',
    p: '$29/mo',
    setup: '+ $99 setup',
    f: ['1k chats · 50 knowledge items', 'Start free — $0 today', 'Cancel in one click'],
  },
  {
    n: 'Growth',
    p: '$79/mo',
    setup: '+ $199 setup',
    f: ['10k conversations · 200 knowledge items', 'Chrono booking + Echo voice', 'Start free — $0 today'],
  },
  {
    n: 'Scale',
    p: '$199/mo',
    setup: '+ $499 setup',
    f: ['50k chats · 500 knowledge items', 'All add-ons included', 'Start free — $0 today'],
  },
  {
    n: 'Custom',
    p: 'from $499',
    setup: 'bespoke setup',
    f: ['Bespoke · unlimited', 'Talk to us', 'Start free — $0 today'],
  },
]

export const ADDONS: Array<{ n: string; d: string; p: string }> = [
  { n: 'Voice Channel', d: 'Phone calls + widget mic', p: 'from $19/mo' },
  { n: 'Multi-Language', d: 'Auto-detect chat; voice varies by provider', p: 'from $12/mo' },
  { n: 'Custom Behaviour Pack', d: '+5 rules on any plan', p: 'from $12/mo' },
]

/* The three live demo worlds. Captions are the worlds' own words. These
   are external interactive builds; cards link out. */
export interface World {
  slug: string
  title: string
  tag: string
  sub: string
  caption: string
  href: string
  poster: string
}

const WORLD_BASE = 'https://nova-web.vercel.app/worlds'

export const WORLDS: World[] = [
  {
    slug: 'reactor',
    title: 'Reactor',
    tag: 'GLSL',
    sub: 'particle core',
    caption:
      'GLSL core, 2000 particles. Move to stir, press and hold anywhere to charge the core — release to detonate. Scroll to travel.',
    href: `${WORLD_BASE}/w1-reactor.html`,
    poster: '/posters/reactor.svg',
  },
  {
    slug: 'helm',
    title: 'Helm',
    tag: 'Console',
    sub: 'mission control',
    caption:
      'A working mission console — switches, telemetry, and a countdown launch. Every control live.',
    href: `${WORLD_BASE}/w2-helm.html`,
    poster: '/posters/helm.svg',
  },
  {
    slug: 'melt',
    title: 'Melt',
    tag: 'Shader',
    sub: 'liquid metal',
    caption:
      'Liquid-metal shader. Cursor disturbs, drag smears, scroll morphs. Sound optional — everything works silent.',
    href: `${WORLD_BASE}/w3-melt.html`,
    poster: '/posters/melt.svg',
  },
]

export const SLUGS = new Set(WORLDS.map((w) => w.slug))

/* Vision (home footer + bolt stats). */
export const MISSION = {
  kicker: 'VISION — WHY WE EXIST',
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
