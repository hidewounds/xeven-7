# XEVEN console model — archived study

The current website restores the original photographic console. This model, generator, and renderer are retained as an editable design study only; they are not loaded at runtime.

`public/xeven/console.glb` is an original, procedural handheld interface concept, built for this website from the proportions and materials of the supplied four-panel visual reference. It is an illustrative product surface, not a claim that XEVEN sells physical hardware.

## Reproduce

```sh
node scripts/generate-console.mjs
```

Run from the repository root. The generator uses the installed Three.js dependency, its GLTF exporter/loader, and geometry utilities. It needs no Blender installation, downloaded models, textures, fonts, or other third-party assets. It exports the file, re-loads that file through `GLTFLoader`, checks finite vertex positions and all contract nodes, and prints the resulting bounds and geometry counts. A 4 MB size gate is built in.

## Renderer contract

The asset is centered around the body, with **front +Z, top +Y**, and no baked camera, environment, light, or animation. The top shoulder controls extend slightly beyond the nominal five-unit body. Do not scale individual children independently of the root.

| Property                                 | Value                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Root node                                | `XEVENConsole`                                                                    |
| Static, material-batched hardware group  | `Hardware`                                                                        |
| Approximate body                         | 3.4 wide × 5.0 high × 0.58 deep                                                   |
| Complete geometry bounds                 | X −1.695..1.695; Y −2.4965..2.5710; Z −0.30775..0.53965                           |
| Full thickness including analogue sticks | About 0.8474                                                                      |
| Screen mesh                              | `ScreenSurface`                                                                   |
| Screen centre                            | `[0, 1.175, 0.334]`                                                               |
| Screen bounds                            | X −1.34..1.34; Y 0.25..2.10; Z 0.334                                              |
| Screen dimensions                        | 2.68 × 1.85, aspect 1.44865                                                       |
| Screen corner radius                     | 0.11                                                                              |
| Screen UVs                               | Full 0..1 rectangle, origin at bottom-left, actual rounded geometry clips corners |

Replace `ScreenSurface.material` with a `MeshBasicMaterial` using the application's live `CanvasTexture`. Keep it unlit and `toneMapped: false` so the interface remains legible. The supplied placeholder is an untextured, near-black unlit surface. A new Three.js `CanvasTexture` uses the appropriate default `flipY: true` for these authored UVs; confirm text is upright when integrating. The glTF has no imported texture whose sampler state must be retained.

Treat a distant device screen as a visual illustration. Provide a semantic, stable HTML conversation view and labelled keyboard/touch equivalents outside the moving 3D canvas. The mesh itself does not provide accessible interaction semantics.

## Control nodes

Control groups retain local origins useful for depression/tilt. Save each initial transform before adding animation, and restore it when the interaction ends. Translate along local Z by approximately −0.025 for a face-button press. A joystick tilt should be modest and based around its existing group origin.

| Named group         | Position                | Intended hook                  |
| ------------------- | ----------------------- | ------------------------------ |
| `ControlDPad`       | `[-0.96, -0.53, 0.355]` | Workflow direction             |
| `ControlStickLeft`  | `[-0.94, -1.62, 0.337]` | Small tactile tilt             |
| `ControlStickRight` | `[0.94, -1.62, 0.337]`  | Small tactile tilt             |
| `ControlY`          | `[0.98, -0.235, 0.341]` | Labelled auxiliary action      |
| `ControlX`          | `[0.685, -0.53, 0.341]` | Labelled auxiliary action      |
| `ControlB`          | `[1.275, -0.53, 0.341]` | Back/close, if implemented     |
| `ControlA`          | `[0.98, -0.825, 0.341]` | Open selected demonstration    |
| `ControlSelect`     | `[-0.23, -0.94, 0.310]` | Optional labelled selector     |
| `ControlStart`      | `[0.23, -0.94, 0.310]`  | Optional labelled start action |

Do not assign interactive-looking controls actions that do not exist. Small physical controls are supplementary; visitors must not need to hit them while the camera is moving.

## Geometry and materials

The model contains separately shaped shell walls, a front clear panel with actual display/control cut-outs, a rear cover, a mid-body seam, rounded display gasket, chrome lip, graphite circuit board, metal traces, chips, components, rear ribs and label, clear screw towers, slotted machine screws, perforated speaker grille, bevelled D-pad, distinct face buttons, analogue stems/caps/knurl marks, shoulder keys, side vent apertures, side keys, and a recessed connector representation.

The visible light pipes use restrained cyan and bubblegum pink. Analogue rings additionally use physical iridescence; the colour is not a painted rainbow texture. PBR shell materials include transmission, volume/IOR and clearcoat. Real illumination and a neutral environment are essential to make these surfaces read properly.

Material names are stable enough for quality adjustment:

- `Polycarbonate_Clear` and `Polycarbonate_Edge`: clear shell; reduce transmission for a lower-cost graphics mode if necessary.
- `Brushed_Titanium`, `Polished_Chrome`, `Gunmetal`: distinct metal response.
- `Graphite_Board`, `Silver_Circuit_Trace`, `Pale_Copper`: interior structure.
- `Soft_Touch_Controls`, `Screen_Gasket`: darker and rougher tactile parts.
- `Iridescent_Analogue_Ring`, `Cyan_Light`, `Pink_Light`: restrained optical accents.
- `Warm_White_Ink`: tiny, original stroke lettering constructed as geometry.
- `Screen_Display_Replace_With_CanvasTexture`: the replaceable unlit display.

Use a neutral studio environment with broad reflection sources and a narrow rim, not only point lights in an otherwise empty black scene. Keep shell highlights below clipping. The full-screen UI is at the front of its gasket; avoid adding a second glass overlay that hides the content. The asset is complete on the sides/back, but the homepage camera should still privilege front readability.

## Size and checks

The generated artifact on 5 October 2026 is **1,056,492 bytes** (about 1.01 MiB), **19,622 triangles**, and **37 meshes**. Static detail is merged by material and control detail is merged within its named group. No external texture requests or decoder dependencies are required. These are asset statistics, not whole-page transfer/performance measurements.

Validation performed:

- Exported binary GLB parsed successfully using Three.js `GLTFLoader`.
- Required named screen/control nodes survived export.
- All loaded vertex positions are finite.
- Model and screen bounds were measured from the parsed asset.
- Final model is below the 4 MB mobile-model target.

Visual lighting, screen orientation, camera framing, runtime frame rate, and device fallback need verification in the application's real renderer. The standalone generator does not claim those browser checks have passed.

## Authorship

All model geometry, circuit routing, control lettering, and materials in the generator are original code created for this XEVEN project. The supplied user reference informed the art direction. No external model, logo, image, texture, or font is embedded in the GLB. Three.js remains covered by its existing upstream license in the project's dependency tree.
