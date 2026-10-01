# XEVEN 7 — Signal / Depth polish

## Direction

- **Design movement:** immersive digital architecture / editorial product film, taking cues from studio sites such as Alche Studio without copying layouts or assets.
- **Core principles:** proposition before spectacle; one recurring signal motif; architecture as explanation; proof over promise.
- **Color philosophy:** void blue-black gives depth, bone text gives editorial clarity, cyan marks verified signal and action, ember marks human handoff only.
- **Layout paradigm:** asymmetric 5/7 entry split, offset architectural frames, chapter rails, and full-width receipts rather than centered SaaS card grids.
- **Signature elements:** a floating “signal room” with layered planes; monospaced field annotations; a persistent active signal line that threads through Hear → Hold → Answer → Earn.
- **Interaction philosophy:** interaction clarifies state. Hover/focus exposes a layer, buttons magnetically respond, and scroll reveals authored chapters without hiding content.
- **Animation:** short line draws, restrained parallax, scan/trace loops, springy press states, and route/page swipes; all effects stand down under prefers-reduced-motion and remain readable in a still frame.
- **Typography:** retain the existing condensed display face for propositions, Space Grotesk for readable copy, and JetBrains Mono for telemetry and receipts.
- **Brand essence:** XEVEN is the AI employee that turns website signals into verified business action for teams who need the front door to keep working after hours. Personality: precise, alive, dependable.
- **Brand voice:** direct, operational, quietly cinematic. Example lines: “Give the signal somewhere to go.” / “Verified or silent. Action when it’s real.”
- **Wordmark:** existing XEVEN wordmark retained, paired with a small offset signal slash as the recurring mark.
- **Signature brand color:** signal cyan `#4df3ff`.

## Implementation

- Rebuild `src/pages/EnterStage.tsx` around an architectural entry sequence while preserving product facts and route actions.
- Extend `src/chrome.css` with the architectural room, wireframe panels, readouts, chapter rail, and responsive/reduced-motion states.
- Refine `src/index.css` tokens, buttons, surfaces, and selection/focus treatment for a more premium finish.
- Polish `TopBar` and footer chrome without changing routes or navigation semantics.
- Preserve existing Three.js `ShiftWorld`, cursor, Lenis, lazy pages, accessibility, and product data.
- Add `public/manus-routes.json` with the complete hash-route set required by the Webdev runtime.
- Validate with TypeScript/Vite build, route-manifest request, and local rendered capture where available.
