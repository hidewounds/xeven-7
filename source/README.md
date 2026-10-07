# XEVEN — Particle edition

Six pages for XEVEN, a commercial AI platform. A small reference-based fibrous orb dissolves into particles and opens into the restored space background: nebula, fine orbit lines, stars, and floating mineral fragments. The spider is retained in the brand logo and removed from every console display.

## Experience

- The 6.25-second entrance starts with a compact graphite/plum orb. Its intact curved surface dissolves into 21,000 particles on desktop (10,500 on narrow screens). They spread across the viewport, form a grain-like veil, and clear continuously from the center into Home. There is no four-part breakup or stretch.
- The entrance plays on a fresh Home document or reload, and after 25 minutes of inactivity. Ordinary page navigation, including returning Home after a reload, does not replay it. Skip and Escape work. No local-storage preference changes the timing.
- The recolored transparent console uses graphite, silver, icy cyan, and white. Its actual screen opening is masked, so the restored background remains visible through its translucent HTML display.
- Scroll into the display, explore three concise chapters, then pull back. The console docks beside the footer, shows XEVEN, and expands a footer surface from its registered screen bounds.
- The footer contains Instagram, X, LinkedIn, GitHub, Email, and a newsletter email request. The three social profiles are clearly marked Soon until owner-confirmed URLs are entered in `lib/social-links.ts`. No social handles are invented and no automatic subscription is claimed.
- Page contents swipe horizontally over the same environment, with no loading overlay, label, or progress bar. The fixed header gains a translucent surface as you scroll.
- Angular 2D spider artwork with a transparent X cut-out replaces the metallic mark. Home and About use an open moving signal sculpture instead of doorway geometry. The console chapters use larger type, quieter glass, and a flowing list of workflows.
- All motion is enabled, and the website is silent. Rendering pauses in hidden tabs. CSS/vector animation remains available when WebGL2 is unavailable.
- Copy is shorter; secondary pages retain product details, monthly/annual plan guides, four scripted demo scenarios, and enquiry review/copy/download/email tools.

## Pages

| Route       | Purpose                                           | Offline file    |
| ----------- | ------------------------------------------------- | --------------- |
| `/`         | Introduction and continuous console journey       | `index.html`    |
| `/platform` | Knowledge, Memory, Chrono, Echo, controls and FAQ | `platform.html` |
| `/about`    | The product idea and principles                   | `about.html`    |
| `/plans`    | Commercial pricing guides and plan selection      | `plans.html`    |
| `/demo`     | Four local, labelled scripted conversations       | `demo.html`     |
| `/contact`  | Prepare and export an enquiry                     | `contact.html`  |

XEVEN is software; the console is a visual concept. Demo conversations use fictional data and do not create appointments or customer records. Email requests open the visitor's email app. Nothing is silently sent.

## Portable website

Extract the complete ZIP and open **index.html**. No server, installation, account, network connection, API key, or build step is needed to view it. All fonts, runtime libraries, geometry, images, styles, and animations are included. Keep the six HTML pages beside `assets/`.

Ordinary navigation uses file-safe hash history and smooth swipes; browser Back/Forward and direct HTML entry work. Plan, billing, and scenario queries remain intact. `source/` contains the editable project; `brand/` contains transparent logo masters; `licenses/` contains dependency notices.

Browser/GPU support, font rendering, viewport sizes, and performance vary across computers. The same source and assets do not guarantee identical pixels everywhere. Email needs a configured mail app and connectivity to send. Local clipboard restrictions have manual-copy and download fallbacks.

## Development

Use Node.js 22.13+ and the package manager in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
pnpm check:experience
node scripts/check-particles.mjs
pnpm dev
pnpm build
pnpm offline:export
pnpm offline:check
```

The exporter defaults to `outputs/xeven-offline/`. Pass an absolute destination to `node scripts/export-offline.mjs` to choose another folder. Credentials, account access, installed dependencies, Git data, and the original hosting identity are excluded from the portable source.

## Main files

- `lib/orb-model.ts`: intact curved surface, image-sampled particles, dispersion and continuous aperture.
- `components/orb-intro.tsx`: shared animation clock, renderer, textured fallback, skip and completion.
- `lib/intro-session.ts`: fresh-document and inactivity timing.
- `components/connection-field.tsx`: open signal sculpture used in Home and About.
- `lib/social-links.ts`: official profile configuration with honest pending states.
- `components/space-scene.tsx`: restored nebula, orbit lines, stars, fragments, and pointer parallax.
- `assets/orb-surface.webp`: inline texture that also works in a local file document.
- `lib/console-journey.ts`: reversible poses, display coverage and dock geometry.
- `components/spatial-world.tsx`: measured scroll choreography.
- `components/experience-shell.tsx`: intro lifetime, persistent environment, header and footer.
- `components/page-transition.tsx`: app-style swipes without a loading interface.
- `offline/`: file-safe routing using the same components.

The retained 3D spider geometry and projection scripts are historical studies only. Current logo masters are flat SVGs in `public/xeven/`. Earlier reference/design files in `docs/` are historical; this README and `docs/rebuild-notes.md` describe the current edition. Verification limits are recorded in `docs/verification.md`.
