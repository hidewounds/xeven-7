# XEVEN — Reference Library (persistent)

Every site/repo below was supplied by the founder as reference material.
Rule: take only what serves XEVEN's cinematic WebGL product film. Never copy designs.
Related repos only — nothing unrelated gets pulled in.

## Websites (design / motion reference)

| # | Source | What to take for XEVEN | Status |
|---|---|---|---|
| 1 | **Spline** (spline.design) | 3D-as-tangible-product philosophy ("more than decoration"); layered materials; states/events motion thinking; "press and drag to interact" affordance | APPLIED: drag-to-turn + `DRAG TO INSPECT` hint |
| 2 | **Recent design** (interpreted as current 2026 immersive-3D trends; founder to confirm if a specific site was meant) | Oversized grotesk, mono system labels, dark cinematic scroll films | ALIGNED (already our direction) |
| 3 | **Skiper UI** (skiper-ui.com) | Micro-interaction craft: press-scale feedback, magnetic buttons, image cursor trail, dynamic island, drag/scroll components. Adapt patterns by hand — no Tailwind/shadcn install. | APPLIED: magnetic CTAs, press physics. BANKED: cursor trail, dynamic island |
| 4 | **Aceternity UI** (ui.aceternity.com) | Encrypted-text reveal, spotlight hover, magnetic button, tracing beam, lamp headers, glare/comet cards, text-generate effect. Adapt by hand, zero deps. | APPLIED: decrypt-reveal mono labels, spotlight pattern buttons, magnetic buttons |
| 5 | **Manus** (manus.im) | "Less structure, more intelligence" + prompt bar with suggestion chips driving the AI | APPLIED: demo rebuilt as prompt input + chips wired to device screen |
| 6 | **anime.js** (animejs.com) | Stagger utilities (grid/from-center), timeline positions, SVG draw/morph, draggable springs, easing editor discipline | APPLIED: center-out staggers on readout/layer rails. BANKED: SVG draw for traces |
| 7 | **GSAP** (gsap.com docs) | ScrollTrigger canonical patterns: `ignoreMobileResize`, `anticipatePin`, `fastScrollEnd`, `containerAnimation`, markers in dev | APPLIED: `ignoreMobileResize` (add), pins/scrubs already canonical |
| 8 | **Motion.dev** (motion.dev) | Spring semantics (stiffness/damping presets), `useSpring`/`useTrail` stagger-follow, layout animations, MotionScore perf audits | APPLIED: trail-follow staggers via GSAP. BANKED: MotionScore-style audit |
| 9 | **react-spring** (react-spring.dev) | Spring-first API, no-re-render imperative animation, `useTrail`/`useChain`, cross-platform spring configs | APPLIED: trail staggers. No dependency added (GSAP covers it) |
| 10 | **cursor.directory** | VERDICT: NOT APPLICABLE — this is the Cursor IDE plugin directory, not cursor-design reference. Our custom cursor system stands on its own. | RECORDED, no action |
| 11 | **anime.js** (animejs.com) | Stagger utilities (grid/from-center), timeline positions, SVG draw/morph, draggable springs, easing discipline | APPLIED: center-out staggers on readout/layer rails via GSAP (no new dep) |
| 12 | **GSAP docs** (gsap.com) | Canonical ScrollTrigger patterns: `ignoreMobileResize`, pins, scrubs, SplitText (free since 3.13, present in our gsap 3.15) | APPLIED: `ignoreMobileResize`, SplitText masked line reveals (hero + final) |
| 13 | **Motion.dev** (motion.dev) | Spring semantics, `useSpring`/`useTrail` stagger-follow, layout animations, MotionScore audits | APPLIED: trail-follow staggers via GSAP. BANKED: MotionScore-style audit |
| 14 | **react-spring** (react-spring.dev) | Spring-first API, no-re-render imperative animation, `useTrail`/`useChain`, cross-platform configs | APPLIED: trail staggers. No dependency added (GSAP covers it) |

## Repos (code reference — related only)

| Repo | Relevance | Status |
|---|---|---|
| `emilkowalski/skills` → **apple-design** | Direct: springs, interruptibility, velocity handoff, rubber-banding, reduced-motion, type tracking | INSTALLED as opencode skill `apple-design` |
| `oso95/scroll-world` | Direct: seamless scroll-scrubbed camera flights, seam frame-locking, scrub encode recipe | INSTALLED as opencode skill `scroll-world` |
| `shutterkif-oss/nomad-portfolio` | Direct: edge-light separation, drag-to-turn w/ decay, overlapping keyframe tracks, progress-driven vignette, lite path, verification harness | APPLIED: edge lights, drag-to-turn, tap/press split |
| `huggingface/skills` (huggingface-spaces) | Peripheral: HF Spaces demo scaffolding, not website-related | NOTED only — install via `hf skills add` if ever needed |
| `arbazkhan971/godmode` | NOT RELATED: competing agent framework, researched once | EXCLUDED deliberately |

## Installed opencode skills (global, `~/.config/opencode/skills/`)
- `apple-design` — gesture UI, springs, materials, type, reduced-motion
- `scroll-world` — scroll-scrubbed camera flights, seam method, encode/QA
- Built-in: `customize-opencode` (opencode config/agents/skills authoring)

## Standing rules from founder
- After every change: commit → push GitHub (`hidewounds/xeven-7`) → deploy Vercel (`xeven-7`).
- Prove with screenshots; distinguish VISUALLY VERIFIED from CODE VERIFIED.
- No mockup photos shipped; no Blender; no new deps without need.
- Tokens/keys live in env vars only; rotate when done.
