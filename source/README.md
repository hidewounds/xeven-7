# XEVEN — Conversations beyond the screen

XEVEN’s existing six-page website now uses a dimensional black-metal spider and a continuous console-screen journey. The original preferred transparent console artwork is retained.

## This revision

- The spider is actual procedural Three.js geometry: 4.601306 × 4.716168 × 0.887 units, eight articulated shoulder pivots, 110 meshes and 6,538 triangles. Its X is a real 0.084-unit recess in the shield. No textures or remote models are needed by the runtime.
- The transparent logo is derived from the same geometry. Dark metal, a narrow cool rim and engraved highlights make it visible on the existing dark website without a white plaque. Header, About, favicon, console screen and social identity share this design.
- A silent 5.2-second entrance plays on every fresh homepage mount/reload. The spider descends on silk, settles frontally, catches light across its X, and reveals only **EVEN** beside that X. Skip, Escape and footer Replay remain available.
- The original console begins on the right. Scrolling enlarges its measured display until it covers the viewport; the next three chapters occupy that screen. Near the footer the console returns, moves into its dock and displays the spider plus XEVEN. The device then stays parked while a panel expands from its exact screen bounds into the footer.
- Pages exchange through a short layered-window transition. The portable edition uses native file-safe hash navigation for ordinary clicks, preserves plan/scenario queries, and supports browser Back/Forward. Links retain actual HTML destinations for direct entry and new tabs.
- Motion is always enabled and the website contains no audio or sound controls. The owner’s latest direction supersedes earlier reduced-motion and session-once behavior. Graphics work pauses in hidden tabs/offscreen views and resumes when visible; there is no visitor quality switch.
- Existing product content, annual plan guides, trial guide, scripted demos and enquiry tools remain in place. Sales confirms final commercial terms.

## Pages

| Route       | Purpose                                                                             | Offline file    |
| ----------- | ----------------------------------------------------------------------------------- | --------------- |
| `/`         | Continuous introduction, screen takeover, three chapters, console return and footer | `index.html`    |
| `/platform` | Knowledge, Memory, Chrono, Echo; expandable details and FAQ                         | `platform.html` |
| `/about`    | Product narrative and animated dimensional identity                                 | `about.html`    |
| `/plans`    | Monthly/annual commercial guides and enquiry links                                  | `plans.html`    |
| `/demo`     | Four clearly labelled local scripted chatbot scenarios                              | `demo.html`     |
| `/contact`  | Review, copy, download or open an enquiry email draft                               | `contact.html`  |

The handheld is an interface concept, not physical hardware for sale. Demonstrations use fictional data and scripted responses; they do not contact a live AI service or make bookings. Enquiries are prepared locally and are never silently sent.

## Downloaded edition

Extract the whole ZIP, then open **index.html**. No installation, internet connection, account, API key or server is needed to explore it. Keep the HTML files beside `assets/`. Both fonts and runtime libraries are bundled; imagery is local. `START-HERE.txt` provides instructions. `source/` is the editable project; `brand/` includes transparent SVGs, the GLB model, dimension notes and an identity study; `licenses/` contains notices.

WebGL2-capable browsers render the articulated 3D spider. If graphics initialization fails, the same geometry’s transparent SVG projection remains visible and participates in the entrance. Viewport, GPU capability, browser lighting/font rendering and performance can differ across computers. Identical pixels on every device are not guaranteed. Opening/sending email uses the visitor’s mail app and connectivity. Clipboard restrictions have manual-copy and text-download fallbacks.

## Development

Use Node.js 22.13+ and the package manager declared in package.json. The viewing edition already contains compiled dependencies.

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
pnpm check:experience
pnpm dev
pnpm build
pnpm offline:export
pnpm offline:check
```

Export defaults to `outputs/xeven-offline/`; an absolute destination may be passed to `node scripts/export-offline.mjs`. Editable source excludes Git data, credentials, environment files, installed dependencies and the original hosted Site identity. A new host needs its own deployment identity.

## Design and motion files

- `lib/spider-model.ts`: single native geometry master, materials, dimensions, anchors and eight shoulder pivots.
- `components/spider-view.tsx`: transparent renderer, environment lighting, articulation, projected intro anchors and matching SVG fallback.
- `components/spider-intro.tsx`: entrance timing and accessible skip/focus behavior.
- `lib/console-journey.ts`: reversible measured console poses, viewport coverage, dock and expanding footer bounds.
- `components/spatial-world.tsx`: scroll measurements, cached layout and frame updates.
- `components/handheld.tsx`: retained artwork, registered HTML display and controls.
- `components/page-transition.tsx`, `components/transition-link.tsx`: shared page handoff.
- `offline/`: file-safe routing and shared-component entry.
- `scripts/export-spider.mjs`, `scripts/render-spider-vectors.mjs`: geometry validation/GLB export and matching vector projections. Run them in that order. PNG regeneration is optional and requires sharp; SVG generation does not.
- `scripts/check-offline.mjs`: file URL dependency and behavior checks using DOM emulation, not visual browser testing.

The earlier procedural console study and old choreography are retained as source history and are not rendered or fetched. See `docs/assets.md`, `docs/improvement-brief.md`, `docs/spider-identity.md` and `docs/verification.md` for provenance, current directions, model details and verification limits.
