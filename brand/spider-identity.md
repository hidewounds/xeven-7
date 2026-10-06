# XEVEN dimensional spider — v5

## Integrated deliverables

- `lib/spider-model.ts`: browser/Node-compatible procedural Three.js master. Native geometry only; no loaders, textures, network requests or WebGL context creation.
- `public/xeven/xeven-spider.glb`: reusable model, 239,680 bytes, one embedded buffer, no external resources.
- `public/xeven/spider-3d.svg`: transparent three-quarter projection of the actual mesh.
- `public/xeven/spider-front.svg`: transparent frontal projection used by the entrance fallback; also provided as `spider-engraved.svg`.
- `public/xeven/logo-spider.svg`: optically simplified small-size identity derived from projected mesh hulls and shield/X contours; also used for `spider-flat.svg` and `logo-spider-light.svg`.
- `docs/spider-design-preview.png`: dark asset inspection sheet; individual logo assets are transparent.
- `docs/spider-model-validation.json`: numeric geometry, real-cavity raycast and GLB evidence.
- `scripts/export-spider.mjs`, then `scripts/render-spider-vectors.mjs`: reproducible exports to `outputs/spider-assets/`. Export filenames there use descriptive poster/logo/icon names. Optional PNG export requires sharp.

## Exported contract

```ts
import { createSpider, SPIDER_DIMENSIONS } from "@/lib/spider-model";
const { group, legs, materials, dispose } = createSpider();
```

`group` is a `THREE.Group`. `legs` contains eight `THREE.Group` shoulder pivots, all starting with local rotation (0,0,0). The ordering is left upper/middle/lower/bottom, then right upper/middle/lower/bottom. Each root has `userData.side`, `userData.row`, and `userData.root`. Modest local X/Z rotations articulate the complete leg chain. The body and front plate remain stationary relative to the main group.

`materials` contains the seven owned materials. `dispose()` is idempotent and releases each unique geometry and material once, then removes the group from its parent. Parent renderers remain responsible for their own lights, environment texture, renderer and animation lifecycle.

## Dimensions

Model front is +Z; top is +Y; X is left/right. The default model transform is the identity.

| Part                      |    Width |   Height |           Depth |
| ------------------------- | -------: | -------: | --------------: |
| Overall bounds            | 4.601306 | 4.716168 |        0.887000 |
| Abdomen and head envelope | 1.100000 | 2.630000 |        0.887000 |
| Abdomen outline           | 1.100000 | 2.030000 |               — |
| Lower head outline        | 0.490000 | 0.840000 |               — |
| Engraved X                | 0.580000 | 0.550000 | 0.084000 recess |

Actual overall minimum: `(-2.300653, -2.360168, -0.398000)`.
Actual overall maximum: `(2.300653, 2.356000, 0.489000)`.

Engraved X visual center: `(0, 0.805, 0.488)`.
Silk attachment at the pointed abdomen tip: `(0, 1.95, -0.055)`.
These anchors are exported in `SPIDER_DIMENSIONS` for projection into the intro's DOM layer.

The front plate contains a real X-shaped hole. A separate dark floor sits at z=0.404; adjacent solid shield faces sit at z=0.488. Raycasts confirm both surfaces. This is an 0.084-unit recess, not a texture, floating glyph, or printed white X. The named group `spider-back-x` owns the floor and narrow metal lip; `engraving-chamfer-highlight` is available for a restrained reveal. The plate opening itself remains real geometry.

## Materials and lighting

The shell is near-black metal with flat normals on deliberately faceted blade sections. Leg joints are small machined barrels, washers, and hex caps. The shield is a raised black armor plate with a narrow gunmetal boundary and cool engraved lip. The lower head has no cartoon face or glowing eyes.

Use a transparent renderer on the existing dark page. The model has no background plane. A procedural environment with broad white/silver panels, a restrained cyan side light, and soft fill will show the black metal. The materials are intentionally dark and need environmental reflections; a scene with only weak ambient light will hide their volumes. Preserve the dark floor of the X and avoid a broad white plaque behind the model.

A useful quiet presentation angle is approximately `(x=.065, y=-.23, z=-.018)` radians; the exact geometry-derived three-quarter poster uses that angle. The front logo uses `(0,0,0)`. Typical intro settling can keep rotation Z within ±0.04 and leg articulation within roughly ±0.08 radians, then finish nearly frontal so the back-mounted X aligns with the emerging EVEN lettering.

## Matching 2D assets

The poster and logo projections use a transparent `viewBox="0 0 720 760"` with a 145px/unit orthographic scale. In the frontal logo/icon, the X center is `(360, 263.275)`, or **50% left / 34.64145% top**. Its geometric height is 79.75 SVG units, or **10.49342% of rendered asset height**. For exact live 3D placement, project the exported world anchor through the camera instead of assuming these static percentages.

The full SVGs are triangle projections from the model rather than a separately redrawn character. Their shading is a deterministic native-vector approximation for offline/static fallback, not a claim of pixel-identical GPU lighting. The small icon uses the same hulls and X but strengthens edges for small displays.

## Validation

- Strict TypeScript check passed with unused-symbol checks enabled.
- Browser-independent Node geometry creation and idempotent disposal passed.
- 110 meshes and 6,538 triangles, below the requested 150/40,000 budgets.
- All vertex positions finite; eight shoulder pivots have zero rest rotations.
- X floor and neighboring solid plate verified by raycasts.
- GLB export/reload preserves dimensions and all eight leg pivots; zero external resources.
- Transparent SVG corners checked; assets contain no background rectangle, raster image, filter, script, or remote dependency.
- Native-vector preview inspected with the image viewer at large and actual 48/40/32px sizes.
