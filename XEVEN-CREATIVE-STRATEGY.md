# XEVEN Creative Strategy, Experience Architecture, and Implementation Blueprint

**Status:** Design review required before implementation  
**Prepared by:** Manus AI  
**Repository reviewed:** `hidewounds/xeven-7`  
**Product-context repository:** `hidewounds/xeven-ai`  
**Date:** 23 September 2026

## Executive direction

The current Xeven website already has a strong and unusual foundation: a dark night-shift visual system, route-based narrative pages, GSAP and Lenis motion, a custom cursor, a Three.js world layer, product-specific language, proof receipts, and a clear conversion route. The next iteration should not replace that identity with a generic SaaS landing page or add spectacle indiscriminately.

The recommended direction is **Signal / Depth**: a **DOM-first editorial product narrative** in which one evolving “signal” motif moves between a readable interface layer and a restrained depth layer. The signal represents Xeven’s product promise: it hears context, holds memory, answers from verified knowledge, and earns a next action. It should appear as a precise visual grammar rather than a literal robot, orb, or decorative particle field.

The direction combines the strongest research patterns: proposition clarity from Linear, Notion, and Vercel; a recurring visual anchor from HAUS, KODE Immersive, and Gucci; chapter-based storytelling from Burberry and Noomo; explicit controls from Resn; and the fallback, motion-safety, and performance discipline recommended by MDN, web.dev, and WCAG.

The site must remain understandable in a still frame, with JavaScript animation, WebGL, custom cursor, video, and sound disabled. Richness is progressive enhancement, not a prerequisite for comprehension or conversion.

## 1. Repository and product audit

### Existing web repository

`xeven-7` is a Vite + React 19 TypeScript application using GSAP with ScrollTrigger, Lenis, Three.js, `vite-plugin-glsl`, and a small internal hash-route state layer. The current app shell lazy-loads six routes:

| Route | Role | Current page title |
|---|---|---|
| `#/enter` | Landing / entry | The AI Employee for Business Websites |
| `#/worlds` | Industry and scenario exploration | One Employee, Every Kind of Shop |
| `#/about` | Mission and principles | Not Just a Widget |
| `#/features` | Product capability demonstrations | Don’t Read Features. Open Them. |
| `#/pricing` | Plans and commercial choice | One Employee, Four Wages |
| `#/demo` | Demo booking and conversion | Book a Demo |

The codebase is already componentized around `TopBar`, `RulerBar`, `Cursor`, `ShiftWorld`, `FieldMark`, `SiteFooter`, `Reveal`, `ProofStats`, and `CopilotDemo`. The global tokens establish a dark void background, bone text, cyan as the primary signal, restrained pink/ember warmth, condensed display typography, and mono labels. This is a good foundation for a controlled redesign.

The public asset inventory is intentionally small. The main image asset is `public/og.jpg`; visual weight is otherwise carried by CSS, canvas/WebGL, and generated UI scenes. This favors a direction that makes the existing procedural and typographic system feel intentional rather than requiring a new media-production pipeline.

### Product context

The product repository positions XEVEN as **the AI employee for business websites**, installed with one snippet. Its differentiated capabilities are:

- **Conversation:** reads situation, knowledge, memory, and behavior before responding.
- **Memory:** recalls names, sizes, budgets, and carts per customer.
- **Chrono Booking:** ranks availability, holds a slot for five minutes, and confirms in two taps.
- **Echo Voice:** supports widget microphone and phone handoff with transcription and natural voices.
- **Verified Knowledge:** answers from verified product and policy knowledge, or stays silent.
- **Telemetry sequence:** Hear → Hold → Answer → Earn.
- **Trustline:** one snippet, grounded answers, audited actions, cancel in one click.
- **Plans:** Launch, Growth, Scale, and Custom, with transparent setup fees and yearly savings.

These facts support a narrative of **context becoming action**. The redesign must not invent customer logos, testimonials, or additional performance claims.

### Current strengths to retain

Retain the product-specific language, memorable route names, verified-answer principle, proof-receipt tone, and interactive “moves” instead of a static feature grid. The current skip link, visible focus styling, reduced-motion detection, and route structure should be extended rather than removed. The custom cursor and WebGL layer should remain optional, pointer-aware, and performance-budgeted.

## 2. Research findings that affect the design

The strongest premium and experimental sites do not depend on a single visual trick. They use a repeatable grammar across hero, navigation, transitions, and conversion.

### The first viewport must work without spectacle

Linear, Notion, and Vercel make the opening viewport legible as a proposition: one clear value statement, one supporting explanation, one dominant action, and one product or proof cue. XEVEN should make the hierarchy explicit: what it is, what changes for the business, what happens next, and why the claim is trustworthy.

### One recurring anchor is stronger than many effects

HAUS’s morphing sphere, KODE Immersive’s repeated anchor device, and Gucci’s optical-mirror campaign use one idea as a navigation and storytelling system. XEVEN should choose one ownable transformation rule and reuse it with discipline rather than scatter unrelated effects across every section.

### Scroll should reveal a narrative, not hide a maze

Noomo, Burberry, and editorial product launches use chapters with authored transitions. The strongest implementation keeps native scroll behavior, meaningful headings, direct section access, and an ordinary document-flow reading path. Cinematic effects should sit over content rather than replace it.

### WebGL should explain or embody a concept

Awwwards-level WebGL examples show that Three.js, shaders, particles, and displacement can support a narrative, but they also show the need for adaptive quality, static fallbacks, compressed assets, and low-end mobile testing. XEVEN should use Three.js only where depth communicates context becoming action.

### Motion, cursor, and sound must remain optional

Cursor attraction, short reveals, and scroll-linked transitions can add character, but every state needs a keyboard and touch equivalent. `prefers-reduced-motion` should produce an intentional alternate art direction. Sound must never be required and should not autoplay with essential information.

### Conversion should be quiet but persistent

Keep one primary CTA—**Book a demo**—in the header, hero, major narrative endpoints, pricing, and footer. A secondary action such as **Open the moves** or **See how it works** supports lower-commitment exploration.

### Performance is part of the aesthetic

Target good Core Web Vitals: LCP at or below 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1 at the 75th percentile. The hero needs a prioritized fallback. Below-fold 3D and media must be lazy-loaded. Rendering complexity must adapt to device capability, reduced motion, coarse pointer, and memory pressure.

## 3. Creative directions

### Direction A — Signal / Depth

**Core concept:** XEVEN turns ambiguous customer signals into useful next actions. A thin cyan signal enters as context, gathers fragments, resolves into a verified answer, and exits as an action cue.

**Visual identity:** Keep the night-shift palette—void blue-black, bone, signal cyan, and limited warmth. Use a precise editorial grid with occasional depth planes. The signal is a small repeated device that gains meaning through sequence.

**Homepage structure:** Proposition hero, then four chapters: **Hear**, **Hold**, **Answer**, and **Earn**. Each chapter contains a product example, a proof receipt, and a CTA or next-step cue. Features become playable moves; pricing closes the story with a commercial choice.

**Interaction philosophy:** Interaction clarifies state. Focus or hover reveals the relevant product behavior. The signal responds gently to pointer position on desktop and becomes static or touch-driven on mobile. A chapter index provides direct access.

**Motion language:** Short, precise, interruptible opacity, transform, clip, and line-drawing transitions. Scroll-linked motion is limited to chapter progression. Reduced motion replaces depth travel with crossfades and state changes.

**Typography:** Retain the expressive condensed display face for short hero and route statements. Pair it with the readable UI face and mono labels for metadata and receipts.

**Color:** Cyan marks verified knowledge, active navigation, and primary action. Pink or ember marks urgency or human handoff. Keep warmth below roughly five percent of the visual field except in a handoff state.

**2D/3D:** CSS/SVG is the baseline. Optional Three.js or shader depth represents layered context. WebGL is not required for every section.

**Mobile:** The signal becomes a vertical chapter rail. The hero visual simplifies to SVG or a static poster on low-power and coarse-pointer devices. The narrative order and CTA priority stay unchanged.

**Complexity and performance:** Medium to high, but manageable because the fallback can use the same semantic structure. The main risk is generic “AI network” styling; avoid random particles and abstract jargon.

**UX and CRO:** Strong comprehension and a natural bridge from product behavior to business action. The demo CTA can repeat after Answer and Earn. The risk is becoming too technical if copy loses warmth.

**Memorability:** The same signal transformation appears in the hero, navigation, move demos, pricing state, and demo confirmation.

### Direction B — The Night Desk

**Core concept:** The website becomes a live overnight operations desk. XEVEN works through late-night questions, remembered preferences, a booked slot, a recovered cart, and a handoff when verification ends.

**Visual identity:** Tactile evidence: timestamped log cards, dark glass panels, status lights, transcript receipts, and restrained ambient motion. The mood is human and observational rather than abstract.

**Homepage structure:** A deterministic shift log introduces the promise, followed by four time-stamped vignettes. Each vignette pairs a short transcript with its capability. The footer closes on the idea that the business keeps moving while people sleep.

**Interaction philosophy:** Visitors browse evidence. Cards expand, filter by situation, and open short transcripts. Cursor labels are optional; cards remain conventional links or buttons.

**Motion language:** Log entries slide into place, status indicators pulse only when active, and a time marker advances with scroll. Reduced motion becomes a static receipt sequence.

**Typography and color:** Condensed type for timestamps and headings, readable sans for transcripts, mono for metadata. Void, moon, bone, and cyan dominate; ember marks human handoff. Pink can disappear.

**2D/3D:** Mostly DOM, CSS, and SVG. Optional depth is decorative. This is the safest performance route.

**Mobile:** A vertical log with accessible expandable entries. This direction is inherently strong on mobile because its content is already card- and transcript-based.

**Complexity, UX, and CRO:** Medium complexity, low performance risk, very high trust. The risk is feeling like a generic admin dashboard and converting more slowly for visitors who only want a fast overview.

**Memorability:** The site feels like a shift already in progress. Timestamps and remembered details make the “employee” framing tangible.

### Direction C — The Living Manual

**Core concept:** XEVEN is introduced through a field manual. Each route is a plate explaining verified knowledge, memory, booking, voice, or action.

**Visual identity:** A strong departure: warm paper or off-white spreads alternate with deep ink fields. Large typographic plates, marginal notes, grid lines, and carefully cropped product imagery create a publication-like system.

**Homepage structure:** An oversized manual title and index introduce five instrument plates. Each plate has a thesis, an interactive demonstration, a marginal note, and a plain-language takeaway. Plans and demo close the publication.

**Interaction philosophy:** Discovery through annotation. Hover, focus, or tap reveals notes and alternate states. Navigation behaves like an index, but the metaphor is never required to reach content.

**Motion language:** Folds, line reveals, and ink-like wipes implemented with restrained opacity, clip, and transform. Reduced motion becomes static spreads.

**Typography and color:** A display serif or editorial grotesk would create a deliberate break from the current condensed voice. Warm paper, ink, signal cyan, and ember require careful contrast testing.

**2D/3D:** No WebGL is necessary. SVG diagrams, CSS layers, and art-directed product imagery are sufficient.

**Mobile:** The manual becomes a vertical publication with a sticky chapter list. Marginal notes move below their related content; no horizontal spread viewing is required.

**Complexity, UX, and CRO:** Medium implementation complexity and good performance, but a larger visual-system conversion and asset effort. It can build trust but may soften the live operational product feeling and make the CTA less immediate.

**Memorability:** It would create the clearest break from generic dark AI sites.

## 4. Creative director review and selected direction

| Criterion | Signal / Depth | Night Desk | Living Manual |
|---|---:|---:|---:|
| Distinctiveness | High | Medium-high | High |
| Product comprehension | High | Very high | High |
| Trust and proof | High | Very high | High |
| Mobile simplicity | High after adaptation | Very high | High |
| Reuse of current repo | Very high | High | Medium |
| WebGL opportunity | Purposeful | Minimal | Minimal |
| Performance risk | Medium | Low | Low-medium |
| Conversion clarity | High | High | Medium-high |
| Brand continuity | Very high | High | Low-medium |

**Signal / Depth** is selected because it builds on the strongest existing work without flattening it into a standard SaaS redesign. It maps directly to Hear → Hold → Answer → Earn, gives the existing Three.js layer a genuine purpose, and supports a clear conversion path. It also has a strong fallback story: the same signal can render as WebGL, SVG, CSS, or a static image without changing page structure.

The final system should borrow the **proof discipline of Night Desk** and the **editorial clarity of Living Manual**. The result is not “dark 3D XEVEN.” It is a measured editorial product experience with a dark operational field, one signal motif, concrete receipts, and readable chapters.

## 5. Selected design system

### Visual language and grid

The visual language is **precision under pressure**. A quiet dark field supports an active signal. Large display type states the thesis. Mono labels provide instrument metadata. Product interfaces, transcripts, and receipts provide evidence.

Use a 12-column desktop grid with a maximum content width of approximately 1,280 pixels. The hero uses a 5/7 asymmetric split: copy and CTA on the left, signal field on the right. Narrative sections alternate between 4/8 and 6/6 compositions while preserving source order. Use 20–24px mobile gutters and 48–72px desktop gutters. Functional text remains within roughly 60–72 characters.

### Typography and spacing

Retain the current 4px base scale. Add compact, standard, expanded, and cinematic section-rhythm tokens. Use the display face for short statements, the UI face for explanations and controls, and mono for route, state, proof, and telemetry labels.

### Color system

| Token | Purpose | Current basis |
|---|---|---|
| Void | Page background | `#06090f` |
| Fog | Elevated surface | `#0e1a20` |
| Bone | Primary text | `#e8edee` |
| Muted | Secondary text | `#93a3a8` |
| Signal | CTA, verified, active index | `#4df3ff` |
| Warmth | Human handoff / urgency | `#ff4d2e` |
| Moon | Rare highlight | `#fff8e6` |

Pair cyan with labels or icons; never use color alone to communicate status.

### Media, iconography, controls, and cards

Use product UI, transcripts, and generated signal visuals as primary evidence. If new media is introduced, use consistent aspect ratios, controlled crops, explicit dimensions, and text-safe zones. Avoid stock AI imagery and generic robot visuals.

Use simple line icons with visible labels for navigation and actions. The primary control is a cyan **Book a demo** button. The secondary control is a transparent **Open the moves** or **See the plans** button. Define hover, focus-visible, pressed, loading, disabled, and success states.

Treat cards as evidence units rather than generic feature tiles. Each unit contains a state label, concise claim, product example, and next action. Avoid giving every card equal visual weight.

### Navigation and motion

Retain memorable labels while adding plain-language context:

- Shift — Start here
- Worlds — See the situations
- Manual — Why it works
- Moves — Product capabilities
- Wages — Plans and pricing
- Book a demo — Talk to the team

Keep the current route visible. The mobile menu must expose the full route scope, move focus into the panel, close on Escape, restore focus to the trigger, and preserve history behavior.

Use motion to communicate continuity, hierarchy, and state. Prefer transform and opacity. Keep ordinary UI transitions under 300ms. Use richer scroll sequences only at chapter boundaries. Support system reduced motion and a visible in-site motion control. In reduced motion, remove cursor trails, parallax, scroll-scrubbed depth, autoplay, and decorative particles while keeping the signal visible as a static or dissolving state.

### Accessibility

Retain skip links, semantic landmarks, real headings and links, visible focus, keyboard access, useful alt text, captions/transcripts for meaningful media, sufficient contrast, and no color-only communication. Sticky UI must not obscure focused elements. Touch targets should be approximately 44px where practical. The complete proposition, product story, pricing, and demo flow must work with WebGL, animation, sound, and the custom cursor disabled.

## 6. Experience architecture

The existing six-route sitemap should remain:

```text
/enter        Homepage / proposition / signal narrative
/worlds       Situations and business contexts
/about        Mission, principles, trust model
/features     Interactive product moves and verified knowledge demo
/pricing      Plans, add-ons, yearly billing, FAQ
/demo         Demo focus, slots, form, confirmation
```

### Enter / homepage

**Purpose:** Establish what XEVEN is, why it matters, and what to do next.  
**Content:** Existing hero statement, promise, one-snippet claim, CTA, exploration link, signal visual, proof cue.  
**Composition:** Asymmetric split with stable DOM copy and adjacent signal plane.  
**Interaction:** Signal gathers four fragments corresponding to Hear, Hold, Answer, and Earn.  
**Animation:** One short entrance sequence and restrained chapter transitions.  
**CTA:** Book a demo; secondary Open the moves.  
**Responsive behavior:** Copy above signal; SVG/static poster on low-power devices; CTA remains above the fold.

### Worlds

**Purpose:** Show applicability without inventing unsupported customer stories.  
**Content:** Existing trade or business scenarios tied to conversation, memory, booking, or handoff.  
**Composition:** Selectable index plus one large evidence scene.  
**Interaction:** Keyboard- and touch-accessible world selection with deterministic scene changes.  
**CTA:** See the moves or Book a demo.  
**Mobile:** Vertical list with textually obvious selected state.

### Manual / About

**Purpose:** Explain verified knowledge, memory, one-snippet installation, and human handoff.  
**Composition:** Editorial principle chapters with large numbers and supporting receipts.  
**Interaction:** Direct principle access; quieter signal as a margin mark.  
**CTA:** See pricing or Book a demo.

### Moves / Features

**Purpose:** Demonstrate behavior instead of listing features.  
**Content:** Conversation, Memory, Chrono Booking, Echo Voice, Verified Knowledge.  
**Interaction:** Each move has an open state, proof receipt, and reset path. The knowledge demo is the primary trust moment.  
**CTA:** Start a demo conversation or Book a demo.

### Wages / Pricing

**Purpose:** Make commercial choice transparent.  
**Content:** Launch, Growth, Scale, Custom; billing toggle; setup fees; included/excluded capabilities; add-ons; FAQ.  
**Interaction:** Billing toggle updates visible totals and setup treatment without layout shift.  
**CTA:** Choose a plan or Book a demo, with the next step explained.

### Book a demo

**Purpose:** Convert qualified interest into a low-friction conversation.  
**Content:** Focus options, available slots, five-minute hold explanation, short form.  
**Interaction:** Clear focus and slot selection, explicit success and error states.  
**CTA:** Confirm the selected slot.  
**Mobile:** Single-column, thumb-friendly, preserving entered values.

## 7. Advanced visuals: purpose → implementation → cost → fallback

### Signal field

**Purpose:** Visualize fragmented context resolving into an action.  
**Interaction:** Gentle pointer or scroll response on capable desktop devices.  
**Result:** Signal traces gather fragments, resolve into a stable mark, and point toward action.  
**Implementation:** CSS/SVG baseline; optional Three.js or shader layer, lazy-loaded after DOM content.  
**Cost:** Medium in WebGL mode; low in SVG mode. Cap DPR and pause offscreen.  
**Fallback:** Static SVG or poster with the same semantic label.

### Chapter continuity

**Purpose:** Maintain orientation between telemetry chapters.  
**Interaction:** Scroll and direct navigation.  
**Result:** The signal changes state rather than disappearing between sections.  
**Implementation:** GSAP/ScrollTrigger or CSS scroll-driven animation, with Intersection Observer fallback.  
**Cost:** Low to medium; animate only transform, opacity, clip, and stroke.  
**Fallback:** Immediate state changes or short crossfades.

### Product demonstrations

**Purpose:** Show what each instrument actually does.  
**Interaction:** Click, tap, keyboard, and optional hover.  
**Result:** A readable UI state or transcript changes with a proof receipt.  
**Implementation:** React DOM components using existing product data.  
**Cost:** Low.  
**Fallback:** Static initial state and accessible disclosure.

### Custom cursor

**Purpose:** Add a subtle desktop signature.  
**Interaction:** Optional attraction or label over interactive signal elements.  
**Result:** A mode indicator, never a replacement for the native cursor.  
**Implementation:** Existing `Cursor` with coarse-pointer and reduced-motion guards.  
**Cost:** Low if transform-only and throttled.  
**Fallback:** Native cursor with identical focus and hover states.

## 8. Frontend architecture

Retain Vite, React 19, TypeScript, GSAP, ScrollTrigger, Lenis, and Three.js. Do not introduce a new framework or routing system during this redesign.

Suggested boundaries:

```text
src/
  app/                store.ts, routeMeta.ts
  components/        SignalField, ChapterIndex, EvidenceCard,
                     ProofReceipt, MotionToggle, ProductMove,
                     DemoForm, TopBar, Cursor, SiteFooter
  pages/              EnterStage, Worlds, About, Features, Pricing, Demo
  data/               product.ts, worlds.ts, chapters.ts
  lib/                capability.ts, media.ts, analytics.ts
```

Retain the current component names where they already express the correct responsibility. Keep route state in the existing app store. Keep interaction state local unless it must persist across routes. Continue using the product data source as the single source of truth.

Define three enhancement tiers:

1. **Baseline:** semantic DOM, CSS/SVG, no enhanced canvas.
2. **Enhanced:** lightweight signal motion and desktop pointer response.
3. **Immersive:** optional WebGL depth on capable devices with performance headroom.

If new large media is introduced, keep it out of the frontend bundle and use the repository’s asset workflow, responsive sources, and poster images.

## 9. Performance, SEO, accessibility, and CRO

### Performance gates

Protect the hero as the LCP element. Reserve space for every image, video, canvas, and pricing block. Defer noncritical 3D and below-fold media. Measure on a representative low-end mobile device.

| Metric | Launch target |
|---|---:|
| LCP | ≤ 2.5s at the 75th percentile |
| INP | < 200ms at the 75th percentile |
| CLS | < 0.1 at the 75th percentile |
| Enhanced scene | Stable on representative mid-range devices |
| Fallback | Automatic and visually coherent |
| Reduced motion | No essential information lost |

Use one prioritized hero fallback, lazy-load below-fold media, compress textures and geometry, cap DPR, pause scenes when offscreen or hidden, and remove effects that do not improve comprehension, trust, or conversion.

### SEO

Each route needs an accurate unique title and meta description. Keep important product language in the DOM. Use descriptive hash-route titles or migrate to path routes only if deployment requirements justify it. Add structured data only for visible content.

### Accessibility

Support keyboard-only navigation, visible focus, screen-reader landmarks, focus restoration for drawers, Escape-to-close overlays, text alternatives, captions/transcripts, 200% zoom, 320px reflow, and reduced motion. Test with WebGL and custom cursor disabled.

### Conversion

Use **Book a demo** as the single primary action. Use **Open the moves**, **See the plans**, or **Read the manual** as secondary actions. Explain the next step beside every primary CTA. Place trustline items near the first CTA and repeat contextual CTAs after product evidence, pricing, and the final mission section.

Instrument hero CTA clicks, chapter completion, product move opens, pricing toggle use, plan detail expansion, demo focus and slot selection, form completion, reduced-motion activation, fallback use, and WebGL context loss.

## 10. Implementation roadmap

### Phase 0 — Approval and content freeze

Confirm the selected direction, CTA wording, route labels, and allowed product claims. Verify every proof number. No application code changes before this review.

### Phase 1 — Foundation audit

Map routes, components, content, media, current visual regressions, and baseline accessibility/performance. Verify the branch is clean.

### Phase 2 — Tokens and navigation

Refine tokens, add signal/chapter states, implement the route index and mobile drawer, and verify keyboard focus, Escape handling, route titles, and history behavior.

### Phase 3 — Homepage structure

Recompose `EnterStage` around proposition, signal visual, proof cue, and chapter index. Build the DOM copy and static SVG/poster fallback first.

### Phase 4 — Signal field

Build CSS/SVG baseline. Add optional Three.js only after the fallback is stable. Add quality tiers, visibility pause, DPR cap, context-loss handling, and reduced-motion behavior.

### Phase 5 — Product story routes

Update Worlds, About, and Features around the chapter grammar. Convert repeated blocks into evidence units with product states, receipts, and accessible disclosure.

### Phase 6 — Pricing and demo conversion

Simplify the comparison, verify billing calculations, expose setup treatment, and make the demo form fully keyboard- and mobile-friendly.

### Phase 7 — Responsive composition

Implement mobile-specific signal composition, navigation, media crops, chapter pacing, and scene density. Verify 320px, 375px, 768px, 1280px, and ultra-wide layouts.

### Phase 8 — Performance

Measure LCP, INP, CLS, long tasks, memory, scene frame time, and asset sizes. Defer or remove effects that do not materially help.

### Phase 9 — Accessibility and SEO

Run keyboard, screen-reader, reduced-motion, high-contrast, zoom/reflow, and no-WebGL tests. Verify titles, descriptions, headings, crawlable content, and structured data.

### Phase 10 — QA and polish

Run build and lint. Capture desktop and mobile route screenshots. Review identity, navigation, motion density, mobile quality, CTA visibility, and fallback quality.

## 11. Final creative review

**Does it feel generic?** Not if the signal grammar is specific to Hear → Hold → Answer → Earn and reused across routes. It becomes generic if reduced to random nodes, particles, or “AI glow.”

**Is the identity recognizable?** Yes, if the night-shift palette, condensed display type, mono instrumentation, proof receipts, and signal motif work together in a static screenshot.

**Is navigation understandable?** Yes, if memorable labels have plain-language context, the current route is visible, sections are directly reachable, and the mobile drawer is conventional.

**Is it memorable?** The memorable element is the transformation of a signal into a verified action, not the presence of 3D alone.

**Is there too much animation?** The motion budget is intentionally limited. Remove any animation that does not explain state, continuity, hierarchy, or feedback.

**Is there enough surprise?** Yes, through the authored transition from fragmented context to resolved action. Surprise is concentrated in a few moments.

**Is the 3D justified?** Yes, only for the optional signal field. It must not carry essential copy, pricing, forms, or conversion.

**Can it perform well?** Yes, if DOM/SVG is built first, WebGL is lazy-loaded and adaptive, and low-end mobile is treated as a first-class target.

**Is the conversion path clear?** Yes: Book a demo is the single primary action, supported by exploration CTAs and repeated at meaningful narrative endpoints.

## Decision requested

Please review and approve or revise the selected **Signal / Depth** direction, the retained six-route sitemap, the primary CTA **Book a demo**, and the principle that WebGL is progressive enhancement rather than a requirement. After approval, implementation can begin in `xeven-7`.

## References

[1]: https://www.awwwards.com/30-experimental-webgl-websites.html "30 Experimental WebGL Websites"
[2]: https://www.awwwards.com/case-study-kode-immersive.html "KODE Immersive case study"
[3]: https://noomoagency.com/insights/the-power-of-digital-storytelling-website "The Power of Digital Storytelling"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices "WebGL best practices"
[5]: https://web.dev/articles/prefers-reduced-motion "prefers-reduced-motion guidance"
[6]: https://locomotive.ca/ "Locomotive digital agency"
[7]: https://www.awwwards.com/haus-creative-agency-case-study.html "HAUS creative agency case study"
[8]: https://resn.co.nz/ "Resn interactive studio"
[9]: https://tubikstudio.com/blog/web-design-case-studies-websites-for-business/ "Tubik web design case studies"
[10]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html "WCAG animation from interactions"
[11]: https://web.dev/articles/rendering-performance "Rendering performance"
[12]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines 2.2"
[13]: https://linear.app/ "Linear"
[14]: https://www.notion.com/ "Notion"
[15]: https://vercel.com/design/guidelines "Vercel design guidelines"
[16]: https://stripe.com/blog/connect-front-end-experience "Stripe front-end experience case study"
[17]: https://web.dev/articles/top-cwv "Core Web Vitals"
[18]: https://developer.apple.com/design/human-interface-guidelines/motion "Apple Human Interface Guidelines: Motion"
[19]: https://www.nngroup.com/articles/homepage-design-principles/ "Homepage design principles"
[20]: https://www.gucci.com/us/en/st/stories "Gucci Stories"
[21]: https://www.gucci.com/us/en/st/stories/article/exquisite-gucci-campaign "Exquisite Gucci campaign"
[22]: https://int.burberry.com/c/burberry-world/heritage/our-story/ "Burberry heritage story"
[23]: https://www.khronos.org/webgl/ "Khronos WebGL overview"
[24]: https://developer.chrome.com/blog/scroll-animation-performance-case-study "Scroll-driven animation performance"
[25]: https://web.dev/articles/inp "Interaction to Next Paint"
[26]: https://www.nngroup.com/articles/scrolling-and-attention/ "Scrolling and attention"
[27]: https://baymard.com/research-articles/ecommerce-navigation-best-practice "Ecommerce navigation best practices"
[28]: https://www.awwwards.com/case-study-immersive-gardens-new-website.html "Immersive Garden case study"
[29]: https://developers.google.com/search/docs/fundamentals/seo-starter-guide "Google SEO Starter Guide"
[30]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google structured data introduction"
[31]: https://web.dev/learn/performance/image-performance "Image performance"
[32]: https://web.dev/learn/performance/video-performance "Video performance"
[33]: https://www.w3.org/WAI/tutorials/menus/structure/ "WAI menu structure"
[34]: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html "WCAG focus visible"
[35]: https://www.w3.org/TR/WCAG21/ "Web Content Accessibility Guidelines 2.1"
[36]: https://developers.google.com/search/docs/appearance/core-web-vitals "Google Core Web Vitals"
[37]: https://baymard.com/learn/checkout-flow-ux-optimization "Baymard checkout flow UX"
[38]: https://www.apple.com/iphone/ "Apple iPhone product page"
[39]: https://www.awwwards.com/websites/3d/ "Awwwards 3D websites"
[40]: https://www.awwwards.com/websites/experimental/ "Awwwards experimental websites"
[41]: https://www.awwwards.com/websites/interaction-design/ "Awwwards interaction design websites"
[42]: https://www.awwwards.com/websites/ "Awwwards website collection"
[43]: https://web.dev/articles/vitals "Web Vitals"
[44]: https://www.w3.org/WAI/WCAG22/Techniques/css/C39 "WCAG prefers-reduced-motion technique"
[45]: https://web.dev/articles/accessible-responsive-design "Accessible responsive design"
[46]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "WCAG contrast minimum"
[47]: https://www.khronos.org/webgl/ "Khronos WebGL standard"
[48]: https://web.dev/learn/performance/video-performance "Video performance guidance"
[49]: https://developers.google.com/search/docs/appearance/core-web-vitals "Google Core Web Vitals guidance"
[50]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Structured data guidance"
