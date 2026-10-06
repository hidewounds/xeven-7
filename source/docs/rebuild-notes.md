# XEVEN — dimensional identity and console portal

## Changes in this revision

1. Built the spider in native 3D before deriving its logo: eight jointed legs, faceted black metal, a pointed shield and an actual recessed X. The transparent GLB and SVG masters share one geometry source. No white background or backing plate is used on the website.
2. Integrated the model into the silk-descent entrance, the homepage continuity scene and the About identity study. The entrance reveals EVEN from the back X, lasts 5.2 seconds and plays on every homepage mount/reload. Skip, Escape and Replay remain.
3. Preserved the original console artwork and registered its screen to measured image coordinates. The screen covers the viewport during the middle chapters. The console returns before the footer, slides into a fixed dock showing XEVEN and the spider, then expands a footer surface from its screen without moving the device.
4. Added layered desktop-window page transitions on hosted and offline routes. Offline ordinary navigation stays in one file using native fragment history; links still name physical HTML files for direct entry/new tabs. Plan, billing and scenario data are preserved.
5. Removed sound, motion on/off and quality controls. Full motion is fixed, superseding previous reduced-motion/session preference behavior. Hidden/offscreen graphics suspend work and resume when visible.
6. Retained the existing monthly/annual plan guides, module information, four scripted demos and enquiry review/copy/download/email-draft tools. No pricing, payment, live chat or sending service was added by this visual revision.
7. No package dependencies were added or changed.

## Open the downloaded website

Extract the complete ZIP and open `index.html`. Keep the six HTML pages beside `assets/`. All viewing libraries, fonts, imagery and animations are bundled. No server, installation, network access, API key or account is required for viewing. `brand/` contains reusable SVG masters, the standalone spider GLB and dimension notes; `source/` contains the editable project.

WebGL2 enables the real-time spider. Unsupported or failed graphics use a matching transparent vector projection. Browser/GPU/font rendering and viewport differences remain possible. Email uses a configured mail application, and sending needs connectivity. Clipboard permissions may be limited for local files; manual copy and text download remain available.

## Rebuild the editable source

Use Node.js 22.13+ and the exact package-manager version in `package.json`. From `source/`:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
node scripts/check-experience.mjs
node scripts/export-offline.mjs /absolute/path/to/new-output
node scripts/check-offline.mjs /absolute/path/to/new-output
pnpm build
```

To regenerate the spider model and vector projections:

```sh
node scripts/export-spider.mjs
node scripts/render-spider-vectors.mjs
```

These write to `outputs/spider-assets/`. The first validates the cavity and GLB round trip. The second projects the same meshes into front, three-quarter and small-size SVGs. Optional PNG projection exports use sharp if installed; it is not needed to view or build the website. Consult `docs/spider-identity.md` before changing the X anchor or dimensions.

The offline exporter copies the source, brand assets and dependency/font notices, then writes SHA-256 hashes for the viewer. It excludes installed dependencies, Git data, credentials, environment files and the original Site identity. Source dependencies are installed separately for editing; the viewer already bundles its runtime code.

## Maintain

- Product content, prices and scenarios: `lib/xeven-content.ts`.
- Scripted demo state: `lib/demo-machine.ts`.
- Enquiry exports: `lib/enquiry.ts` and `components/contact-page.tsx`.
- Spider geometry/anchors: `lib/spider-model.ts`; renderer/articulation: `components/spider-view.tsx`.
- Intro timing: `components/spider-intro.tsx` and intro styles in `app/globals.css`.
- Console journey: `lib/console-journey.ts` and `components/spatial-world.tsx`.
- Page handoffs: `components/page-transition.tsx`, with file-safe routing under `offline/`.

See `docs/verification.md` for automated evidence and the real-browser/GPU verification limit. The archived procedural console is not loaded by the current website.
