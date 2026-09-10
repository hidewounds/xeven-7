export const PHASES = { boot: 0.1, understand: 0.22, memory: 0.38, personal: 0.53, business: 0.68, patterns: 0.8, arch: 0.92 } as const

export const PROFILE_ROWS: [string, string][] = [
  ['SIZE', '42'],
  ['BUDGET', '₹80K'],
  ['INTEREST', 'GAMING'],
  ['LAST VISIT', '02:41'],
]

export const BUSINESS = [
  { n: '01', t: 'NEVER MISS A SHOPPER', d: 'XEVEN answers from grounded business knowledge. 24/7, no hallucinations.' },
  { n: '02', t: 'TURNS CARTS INTO SALES', d: 'It remembers sizes, budgets, carts — then brings the shopper back.' },
  { n: '03', t: 'OPERATES, NOT JUST CHATS', d: 'BOOK · RECOVER · RECOMMEND · QUALIFY — machine operations.' },
] as const

export const PATTERNS = [
  { t: 'CUSTOMER SUPPORT', d: 'empathy · solutions' },
  { t: 'SALES', d: 'value · close' },
  { t: 'SHOPPING', d: 'options · comparison' },
  { t: 'PRODUCT ADVISOR', d: 'specs · transparency' },
  { t: 'LEAD QUALIFICATION', d: 'questions → present' },
  { t: 'GENERAL', d: 'broadly adaptive' },
] as const

export const DEMO_QS = [
  "What's my size?",
  'Show me what I viewed.',
  'Recommend something.',
  'Continue where I left off.',
] as const

export const LAYERS = ['SHELL', 'SCREEN', 'PCB', 'AI CORE', 'MEMORY', 'CONTEXT', 'DATA'] as const
