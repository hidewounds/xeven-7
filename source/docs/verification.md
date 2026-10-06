# Verification — dimensional spider, console portal and silent transitions

Date: 6 October 2026.

## Completed checks

- The original preferred `console.webp` is unchanged. SHA-256: `9929773c625ff3232a6782dac4899ebbfb2e80da6232494d63d3ebb40703bb87`.
- The actual Three.js spider geometry has finite vertices, eight zero-rest shoulder pivots, 110 meshes and 6,538 triangles. Its bounds are 4.601306 × 4.716168 × 0.887 units. Raycasts hit the X floor at z=0.404 and the adjacent shield face at z=0.488, confirming a real recessed cavity. The standalone GLB is 239,680 bytes with no external resources; reloading it preserves bounds and leg pivots. Idempotent disposal is also exercised.
- Transparent frontal, three-quarter and small-size projections were inspected as assets. They come from the same geometry. The website uses transparent canvases/SVGs, dark metallic surfaces and narrow cool highlights, with no pale mounting plaque. The asset inspection sheet is not a website or GPU screenshot.
- TypeScript passed with `tsc --noEmit --incremental false`. No dependency inputs changed. Publication is gated by the mandatory production Vinext/Vite build in the source packaging workflow.
- Ten active application checks cover sample memory/forgetting, unsupported stock sizes, support scope, sample appointments, duplicate/stale replies, reset behavior, two-question lead qualification, annual plan arithmetic, enquiry encoding, and the new console journey. Console assertions cover viewport-filling display bounds, zero rotation while inside, a stationary dock during expansion, exact screen-origin projection, reversible/finite poses and positive sizes at 1440×900, 1920×1080, 1024×768, 390×844, 360×640 and 844×390.
- Sixteen offline integration checks use jsdom DOM emulation and actual `file://` URLs. All six pages mount with valid local files/links and no runtime errors. They exercise the dimensional intro’s fallback, EVEN lettering, skip/replay/Escape and sole overlay container; console controls/reader; full motion despite legacy reduced preferences; a fresh intro on another homepage load; annual plan/billing links; module/retention explanations; selected demo scenarios; lead qualification and keyboard tabs; enquiry optional fields, copy fallback and exact text download; app-style navigation with plan/billing and browser Back; embedded fonts and absence of dynamic imports/model fetches.
- Navigation testing exposed file-origin history restrictions. The portable router now uses native fragment navigation and Back/Forward, while link destinations remain actual HTML files. Review also caught and removed an intro/spider-container CSS class collision.
- The viewer uses a classic IIFE with bundled runtime libraries and locally generated geometry. It makes no AI/model/font requests. Offline tests reject fetch/XHR and remote asset loads. There is no audio element, audio context or sound control; no visitor motion/quality setting remains.
- The export contains the original assets/references, editable source and lockfile, transparent logos, standalone spider GLB, dimensions, build scripts, notices and viewer hashes. It excludes Git metadata, installed dependencies, credentials, environment files and the original Site identity. The viewer already contains compiled runtime dependencies.

## Verification boundaries

The managed Sites workflow requires the control-browser capability for browser QA. It is unavailable in this session, so no preview server or alternate browser-control path was started. Actual WebGL rendering/lighting, CSS composition, animation smoothness, touch/mobile layout, assistive technology, clipboard/download prompts and Chrome/Safari/Firefox compatibility have not been independently exercised.

DOM emulation does not render layout or WebGL. Geometry and raycast checks establish model structure and mathematical poses, not visual frame rate or perceived quality. No website screenshot, Lighthouse score, accessibility conformance result, frame-rate claim or universal pixel-identical claim is made.

The owner explicitly requested full motion on every visit. There is no reduced-motion bypass in this revision. Skip and Escape can end the intro; page content and controls remain ordinary HTML. Hidden/offscreen graphics pause and resume to avoid unnecessary work.

The same components, content, fonts, artwork and choreography are compiled for hosted and offline viewing. Different viewports, GPUs, browser engines and font rasterization can produce differences. A matching SVG projection appears when WebGL2 cannot initialize; it is an intentional fallback, not identical GPU shading. Email depends on the visitor’s mail app/network. The chatbot remains a visibly labelled scripted demonstration.

## Publication and export

The existing owner-private Site is updated without changing its audience. Native deployment status verifies publication. The ZIP starts at `index.html` after extracting the whole archive; `source/` is included for editing and is optional for viewing. `BUILD-INFO.json` records the packaged source revision; `CHANGES.patch` describes this revision against its immediate baseline.
