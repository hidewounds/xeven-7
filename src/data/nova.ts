/* NOVA — single source of truth for every customer-facing fact on this
   site. All copy is sourced from the NOVA platform repo (D:\nova ai:
   README, business knowledge base) and the NOVA marketing site
   (D:\nova web: index, features, pricing + pricing-config.js, worlds).
   Pricing follows pricing-config.js (Launch/Growth/Scale/Custom, yearly
   −20%) where it conflicts with the older knowledge entry. Nothing here
   is invented: no clients, metrics, testimonials, or team members. */

export const PRODUCT = {
  name: 'NOVA',
  byline: 'XEVEN BUILDS NOVA',
  hero: 'THE AI EMPLOYEE FOR BUSINESS WEBSITES',
  sub: 'Chats 24/7, remembers shoppers, recovers carts, books with Chrono and talks with Echo. One snippet.',
  footer: 'The intelligence layer for your business.',
  trial: '14-day free trial, cancel anytime.',
}

export interface Instrument {
  t: string
  d: string
  s: string
}

/* The five playable instruments (features.html). */
export const INSTRUMENTS: Instrument[] = [
  {
    t: 'Conversation',
    d: 'Situation, knowledge, memory and behavior fuse before a word is written. Tools act, handoff catches the edge.',
    s: 'CHAT CORE · 24/7 · FACT-CHECKED',
  },
  {
    t: 'Memory',
    d: 'Names, sizes, budgets, carts — per customer, recalled mid-sentence. Teach with “remember”, erase with “forget”.',
    s: 'SHOPPERS, KEPT · ONE-CLICK ERASURE',
  },
  {
    t: 'Chrono Booking',
    d: 'Chrono ranks real availability inside your hours, holds five minutes, confirms in two taps.',
    s: 'RANKED SLOTS · 5-MIN HOLDS · ROUND-ROBIN',
  },
  {
    t: 'Echo Voice',
    d: 'Widget mic and phone handoff, transcription plus natural voices — 100+ languages auto-detected.',
    s: 'MIC + PHONE · HUMAN HANDOFF LAST RESORT',
  },
  {
    t: 'Verified Knowledge',
    d: 'Products and policies, searchable by keyword and meaning. NOVA answers only from what it can verify.',
    s: 'KEYWORD + MEANING · VERIFIED OR SILENT',
  },
]

export interface SetupStep {
  n: string
  t: string
  d: string
  meta: string
  points: string[]
}

/* Setup: live within one day (knowledge: “How NOVA works”). */
export const SETUP: SetupStep[] = [
  {
    n: '01',
    t: 'Snippet',
    d: 'Paste one snippet and the widget is on your site the same day.',
    meta: 'STEP 01 · INSTALL — DAY ONE',
    points: [
      'Tracker + widget scripts with your public key.',
      'No source-code changes to onboard.',
      'Page views record automatically.',
    ],
  },
  {
    n: '02',
    t: 'Train',
    d: 'We train it on your business — products, policies, FAQs, tone — with you on a call.',
    meta: 'STEP 02 · TRAIN — WITH YOU',
    points: [
      'Knowledge: products, policies, FAQs.',
      'Role, personality, and memory rules.',
      'Booking hours and voice behavior.',
    ],
  },
  {
    n: '03',
    t: 'Test-drive',
    d: 'Test-drive the live preview until it feels right, then go live.',
    meta: 'STEP 03 · LAUNCH — LIVE IN A DAY',
    points: [
      'Preview on your real content.',
      'Proactive nudges, once per visit max.',
      'Analytics from the first chat.',
    ],
  },
]

/* The nine agent roles (knowledge: “Agent Roles”). Blurbs stay inside the
   sourced descriptions — roles are data, not code. */
export const ROLES: Array<{ n: string; d: string }> = [
  { n: 'Customer Support', d: 'Patient, clear, escalates gracefully.' },
  { n: 'Sales', d: 'Warm, confident, needs first, at most two options.' },
  { n: 'Shopping Assistant', d: 'Discovery via remembered preferences.' },
  { n: 'Product Advisor', d: 'Honest comparisons with trade-offs.' },
  { n: 'Booking Assistant', d: 'Chrono-powered, confirms step by step.' },
  { n: 'Lead Qualification', d: 'Need, timeline, budget — contact when freely given.' },
  { n: 'General Assistant', d: 'Broadly helpful, platform-wide.' },
  { n: 'Custom', d: 'Your objective, tone and rules verbatim.' },
  { n: 'Voice Receptionist', d: 'Answers calls and mic notes, brand-aware.' },
]

export interface Plan {
  n: string
  p: string
  setup: string
  d: string
  f: string[]
  tag?: string
}

/* Plans (pricing-config.js + knowledge feature lists). */
export const PLANS: Plan[] = [
  {
    n: 'Launch',
    p: '$29/mo',
    setup: '+ $99 setup',
    d: 'One site, one skill. The smallest way to put an employee on your website.',
    f: ['1 website', '1 active skill, switch anytime', '8 core roles', '25 knowledge entries', 'Email capture + basic analytics'],
  },
  {
    n: 'Growth',
    p: '$79/mo',
    setup: '+ $199 setup',
    d: 'Revenue and bookings. Multi-agent staff, memory, and real actions.',
    f: ['Multi-agent up to 5 skills', 'Bookings + live availability', 'Customer memory', 'Unlimited knowledge', 'Weekly digest + priority support'],
    tag: 'MOST POPULAR',
  },
  {
    n: 'Scale',
    p: '$199/mo',
    setup: '+ $499 setup',
    d: 'Support at scale. More sites, custom roles, and your own systems wired in.',
    f: ['Up to 5 websites', '5 stacked skills included', 'Custom roles', 'API + webhooks', 'Team seats + onboarding call'],
  },
  {
    n: 'Custom',
    p: 'from $499',
    setup: 'bespoke setup',
    d: 'Something bespoke. Talk to us and we scope it together.',
    f: ['Everything in Scale', '200+ specialist personas', 'Unlimited stacking', 'White-glove onboarding'],
  },
]

export const ADDONS: Array<{ n: string; d: string; p: string }> = [
  { n: 'Voice Channel', d: 'Phone calls + widget mic', p: 'from $19/mo' },
  { n: 'Multi-Language', d: 'Auto-detect chat in 100+ languages', p: 'from $12/mo' },
  { n: 'Custom Behaviour Pack', d: '+5 rules on any plan', p: 'from $12/mo' },
]

/* The three live demo worlds (nova-web/worlds). Captions are the worlds'
   own words. These are external interactive builds — cards link out. */
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

/* Services: the four things Xeven delivers around NOVA (all sourced). */
export const SERVICES: Array<{ t: string; d: string }> = [
  {
    t: 'NOVA Platform',
    d: 'Widget plus dashboard: nine roles, multi-agent stacking, knowledge you edit, analytics from day one. One snippet to install.',
  },
  {
    t: 'Chrono Booking',
    d: 'Live availability inside your hours — ranked slots, five-minute holds, round-robin hosts, group seating.',
  },
  {
    t: 'Echo Voice',
    d: 'Widget mic and phone answering with brand-aware transcription, 100+ languages, and human handoff as the last resort.',
  },
  {
    t: 'Knowledge & Memory',
    d: 'Products, policies and FAQs searchable by keyword and meaning; shoppers remembered, erasure one click away.',
  },
]

/* Vision: mission + principles, all sourced. No team list — no roster was
   published in either source. */
export const MISSION = {
  kicker: 'VISION — WHY WE EXIST',
  title: 'The static website is over.',
  lede:
    'Attention is a place. NOVA turns business websites into locations where an AI employee chats, remembers, books and talks — and where visitors become customers.',
}

export const PRINCIPLES: Array<{ n: string; t: string; d: string }> = [
  { n: '01', t: 'Verified or silent', d: 'Every reply passes a grounding guard. If it is not in your knowledge, NOVA says so and offers a human.' },
  { n: '02', t: 'Your address, your server', d: 'Follow-up emails send from your SMTP, signed as your team. Local-first hosting, one-click erasure.' },
  { n: '03', t: 'Live in a day', d: 'One snippet, a training call, a test-drive. Politeness is engineered: proactive at most once per visit.' },
]

/* Pricing FAQ: the six sourced answers (knowledge FAQ). */
export const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Will it make things up?',
    a: 'No — every reply passes a grounding guard against your knowledge. If the answer is not there, NOVA says it does not know and offers a human.',
  },
  {
    q: 'Do emails come from a robot address?',
    a: 'No — cart recovery and follow-ups send from your SMTP, signed as your team.',
  },
  {
    q: 'What about data privacy?',
    a: 'Local-first: NOVA can run on your own server, and every customer record supports one-click erasure.',
  },
  {
    q: 'How fast is setup?',
    a: 'One snippet, and our team helps the same day. Most businesses are live within a day.',
  },
  {
    q: 'Will the widget annoy visitors?',
    a: 'It waits politely — proactive engagement fires at most once per visit, on idle or exit intent.',
  },
  {
    q: 'Can it take bookings?',
    a: 'Yes — switch on the booking role or stack the booking assistant, and Chrono handles availability, holds and confirmation.',
  },
]

/* Demo booking (mirrors the nova-web briefing room). Slots are illustrative
   request labels — confirmation happens with the team, like Chrono holds. */
export const DEMO_FOCUS = ['Revenue + bookings', 'Support at scale', 'Something bespoke']

export const DEMO_SLOTS = ['Tue 3:00 PM', 'Wed 10:30 AM', 'Thu 2:00 PM']

export const SHOWROOM = 'Showroom open Mon–Fri 9:00–17:00.'
