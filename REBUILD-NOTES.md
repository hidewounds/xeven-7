# XEVEN — Particle edition

The original space background is restored: nebula, orbit lines, stars, floating mineral fragments, and the distant footer horizon. It persists through page swipes and remains visible behind the translucent console display. The spider is retained as the site logo; it is absent from the console, immersed chat, and demo screen.

## Motion sequence

1. 0–1.25 seconds: a compact, intact fibrous orb breathes and turns gently. The image box never exceeds 216 CSS pixels, with the alpha silhouette smaller still.
2. 1.25–2.8 seconds: its surface dissolves into image-sampled particles. There are no core sectors, quadrant fractures, tendons, or four-way stretches.
3. 1.5–4.05 seconds: particles move outward on curved paths and occupy all regions of the viewport. A dark grain veil creates full coverage.
4. 4.18–6.12 seconds: the particle field and veil clear together through a soft irregular aperture, revealing the actual Home content. Completion is at 6.25 seconds.

The intro is an art-directed hybrid: a retouched transparent image on a subtly curved surface, image-sampled point geometry, and a grain-based reveal. It is not a physical simulation. Desktop uses 21,000 points; narrow screens use 10,500. A textured image and 420 SVG particles provide a non-WebGL fallback. The inline data-URL texture works from local files. Context loss, sampling failure, or shader/render errors leave the fallback active.

One clock owns the image, particles, reveal, text, and completion. Hidden tabs pause it. Skip and Escape work. The persistent document session plays the entrance only on fresh Home loads/reloads or after 25 minutes of inactivity; page navigation does not replay it. Home content stays hidden until the reveal begins.

The background remains the restored nebula, orbit lines, stars, and minerals. The architectural scene component and doorway illustrations have been removed. `components/connection-field.tsx` replaces them with an airy animated point sculpture in Home and About; its rendering pauses outside the viewport and in hidden tabs. A vector fallback remains available.

The transparent console, registered screen mask, scroll zoom, return, dock, and footer expansion are preserved. Its display remains translucent. The three inside-screen chapters now use larger editorial type, lighter glass, open workflow rows, and bounded scroll offsets instead of dense card arrangements. Sections remain normal document flow, including at mobile widths. The six existing page roles, prices, demo flows and enquiry tools remain intact.

## Flat spider identity

The current mark is a custom symmetrical 2D silhouette: eight tapering angular legs around a long central body with a transparent X cut-out. It takes the requested superhero-emblem direction while using original XEVEN geometry. There is no background plate. `logo-spider.svg` is black; `logo-spider-light.svg` is the light version used on the dark site. `logo-lockup.svg`, favicon, and social card are updated. Historical 3D spider studies are not runtime scenes or the current mark.

## Socials and newsletter

The footer presents Instagram, X, LinkedIn, GitHub, Email, and the newsletter request. No page-navigation links are added. Official social profile URLs were not supplied; `lib/social-links.ts` stores null values and displays a truthful Soon state. Replace each null with the owner-confirmed profile URL to activate the matching link. Do not point visitors to guessed accounts or generic platform homepages. Email and the newsletter open an email request; there is no subscription backend.

## Reference direction

Reviewed https://alche.studio/ and https://alchemy.studio/ on 7 October 2026. The adaptation uses chapter pacing, broad visual space, concise editorial type, and continuity between visual states. No reference site's artwork or source implementation is copied. Browser/GPU visual testing of this Site was not available in the supported environment.

## Open the download

Extract the ZIP and open `index.html`. Keep all six HTML files beside `assets/`. All viewing dependencies are local; no server, installation, network access, or account is needed. The renderer, texture, geometry and both fonts are bundled. Browser/GPU/font differences can affect pixels and performance. Sending email and opening social profiles still need connectivity.

## Rebuild

From `source/`, with Node.js 22.13+ and the package-manager version in package.json:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
node scripts/check-experience.mjs
node scripts/check-particles.mjs
node scripts/export-offline.mjs /absolute/path/to/output
node scripts/check-offline.mjs /absolute/path/to/output
pnpm build
```

The exporter normalizes Windows paths, copies the restored background and new orb assets, retains transparent logo masters and dependency notices, and creates SHA-256 hashes. Editable source excludes credentials, installed dependencies, account access, and the original Site identity. The viewer already bundles its runtime libraries.

Pricing, capacity, trial, scripted demo behavior, and enquiry export data are unchanged. Earlier briefs are historical; this file and README.md describe the current implementation.
