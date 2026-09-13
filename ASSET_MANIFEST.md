# XEVEN — Asset Manifest (50-image hard limit)

Budget: ≤50 raster images for ENTIRE site, all routes combined.
Counts: jpg / png / webp / avif, textures, posters, thumbnails, og-image, favicon pngs.
Does NOT count: fonts, .glsl, videos, SVG / lucide icons, procedural canvas / Three.js, CSS/SVG data-URI grain.

## Current usage: 1 / 50 local raster images

| # | Path | KB | Where used | Notes |
|---|------|----|------------|-------|
| 1 | `public/og.jpg` | ~58 | OG + Twitter card image only | 1200×630 hero capture (lattice-only background). Never imported by `src/`, served as static social card. |

Favicon is an inline SVG data-URI in `index.html` (not a raster file, not counted).
Film grain / fallback noise are inline SVG `feTurbulence` data-URIs in `chrome.css` (not counted).

## Remote video slots (not images, not counted toward 50)

Reused across Gate / Enter / Worlds. `preload="none"`, play only on IntersectionObserver, poster-only under reduced motion.

| Slot | URL | Used in |
|------|-----|---------|
| ink | https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4 | Enter REEL, Worlds Ink Study / Undertow |
| aerial | https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4 | Enter CAPS Interactive Systems, REEL Night passage, Worlds Night Passage |
| chrome | https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4 | Enter CAPS Cinematic Motion, REEL Chrome drift, Worlds Chrome Drift |
| head | https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4 | Enter CAPS Living 3D Worlds, REEL Signal head, Worlds Signal Head |
| metal | https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4 | Enter CAPS Spatial Audio, REEL Melt 04, Worlds Melt 04 |

These are placeholder motion files — replace `src` in `src/components/VideoCard.tsx` `PH` with licensed footage per slot. Keep reusing the same 5 URLs; do not add new stills.

## Rules for future additions

1. Reuse the 8–12 core visuals with CSS crops / filters / duotone before adding any file.
2. Max 1600px wide, WebP/AVIF only, `loading="lazy"` except Gate hero.
3. Update this table on every addition. FAIL the change if total exceeds 50.
4. Prefer shaders / video loops / CSS over new stills.
5. No mockup photos shipped (per REFERENCES.md standing rules).
6. `verify/` captures and `reference-mockup/jera-ref.jpg` are dev-only evidence — never imported by `src/`, never emitted to `dist/`, not counted.
