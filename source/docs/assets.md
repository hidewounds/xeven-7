# XEVEN asset record

All runtime assets are local. Offline viewing embeds both WOFF fonts and bundles the same geometry, imagery and styles.

| Asset                                                                      | Origin and current use                                                                                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/xeven/console.webp`, `console-small.webp`                          | Original preferred transparent console artwork and optimized smaller derivative, retained byte-for-byte. Active homepage console and page stills.           |
| `public/xeven/spider.jpg`                                                  | Owner-supplied reference informing the new elongated shield and eight angular tapered legs.                                                                 |
| `lib/spider-model.ts`                                                      | New native procedural 3D master, created for XEVEN: black metal, eight shoulder pivots and a real X-shaped shield cavity.                                   |
| `public/xeven/xeven-spider.glb`                                            | Self-contained reusable export of the same master. Runtime uses bundled procedural geometry rather than fetching this file.                                 |
| `public/xeven/spider-3d.svg`                                               | Transparent three-quarter projection of actual 3D meshes; idle graphics fallback.                                                                           |
| `public/xeven/spider-front.svg`, `spider-engraved.svg`                     | Transparent frontal projection of the same model; entrance fallback and reusable full master.                                                               |
| `public/xeven/logo-spider.svg`, `logo-spider-light.svg`, `spider-flat.svg` | Matching small-size model-derived vectors with stronger narrow cool rims and a recessed-looking X. All backgrounds are transparent.                         |
| `public/xeven/spider-silhouette.svg`                                       | Supporting pure-black flattened silhouette without the X.                                                                                                   |
| `public/xeven/logo-lockup.svg`                                             | Matching emblem with vector XEVEN lettering. The entrance separately uses the back X plus only EVEN.                                                        |
| `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`             | Transparent small-size dimensional identity variants.                                                                                                       |
| `public/xeven/social-preview.svg`, `.png`                                  | Identity on a dark social preview composition; no white mounting plaque.                                                                                    |
| `public/xeven/fragment.webp`, `horizon.webp`, smaller variants             | Previously generated project imagery, retained in spatial background and interior pages.                                                                    |
| `public/fonts/space-regular.*`, `space-semibold.*`                         | Space Grotesk 400/600; original TTFs and locally converted WOFFs. Copyright 2020 The Space Grotesk Project Authors. Full SIL OFL in `public/fonts/OFL.txt`. |
| `docs/reference-four-panels.jpg`                                           | Owner-supplied four-panel visual reference.                                                                                                                 |
| `docs/baseline-2026-10-05.jpg`                                             | Historical screenshot, not this revision.                                                                                                                   |
| `docs/spider-design-preview.png`                                           | Geometry-derived vector projection study inspected on a dark background; not a website/GPU screenshot.                                                      |
| `public/xeven/console.glb`, `lib/spatial-scene.ts`, earlier generator      | Archived console design study retained in editable source; excluded from offline runtime assets and never loaded by the active website.                     |

The updated dimensional redesign supersedes the earlier exact-trace/flat-engraving implementation. `docs/spider-identity.md` documents its proportions, cavity and intro alignment; `docs/spider-model-validation.json` records geometry and GLB validation. Both logo projection SVGs and small icons contain no raster background or remote resource.

Offline `licenses/` collects notices from the compiled dependency packages, including Three.js and font licensing. These packages retain their original licenses. Editable source retains the original references and assets.
