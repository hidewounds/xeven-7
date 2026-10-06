import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
const repo = fileURLToPath(new URL("../", import.meta.url));
const dir = path.resolve(
  process.argv[2] || path.join(repo, "outputs/spider-assets"),
);
fs.mkdirSync(dir, { recursive: true });
const require = createRequire(path.join(repo, "package.json"));
const THREE = await import(
  pathToFileURL(path.join(repo, "node_modules/three/build/three.module.js"))
    .href
);
const { createSpider } = await import(
  pathToFileURL(path.join(dir, ".spider-model-validation.mjs")).href
);
const model = createSpider();
const W = 720,
  H = 760,
  SCALE = 145;
const colorHex = (c) =>
  c
    .map((n) =>
      Math.round(Math.max(0, Math.min(255, n)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const key = new THREE.Vector3(-0.55, 0.75, 1.25).normalize();
const side = new THREE.Vector3(1, 0.18, 0.6).normalize();
const lower = new THREE.Vector3(-0.7, -0.8, 0.25).normalize();
const view = new THREE.Vector3(0, 0, 1);
const half1 = key.clone().add(view).normalize(),
  half2 = side.clone().add(view).normalize();
function shade(material, n) {
  const raw = material.color.getHex();
  const base = [(raw >> 16) & 255, (raw >> 8) & 255, raw & 255];
  const diffuse = Math.max(0, n.dot(key));
  const sideDiffuse = Math.max(0, n.dot(side));
  const spec =
    Math.pow(Math.max(0, n.dot(half1)), 28) * 0.45 +
    Math.pow(Math.max(0, n.dot(half2)), 20) * 0.22;
  const rim = Math.pow(1 - Math.max(0, n.z), 2) * 0.3;
  const pink = Math.pow(Math.max(0, n.dot(lower)), 20) * 0.024;
  return (
    "#" +
    colorHex(
      base.map(
        (b, i) =>
          b * (0.45 + 0.32 * diffuse + 0.12 * sideDiffuse) +
          [187, 208, 218][i] * spec +
          [130, 190, 214][i] * rim +
          [238, 127, 190][i] * pink,
      ),
    )
  );
}
function projection(v) {
  return [W / 2 + v.x * SCALE, H / 2 - v.y * SCALE];
}
function vectorSVG(ry, rx, rz, label) {
  model.group.rotation.set(rx, ry, rz);
  model.group.updateMatrixWorld(true);
  const faces = [];
  model.group.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const geo = mesh.geometry,
      position = geo.attributes.position,
      index = geo.index;
    const count = index?.count ?? position.count;
    const matrix = mesh.matrixWorld;
    for (let i = 0; i < count; i += 3) {
      const ids = [0, 1, 2].map((j) => (index ? index.getX(i + j) : i + j));
      const p = ids.map((id) =>
        new THREE.Vector3()
          .fromBufferAttribute(position, id)
          .applyMatrix4(matrix),
      );
      const n = p[1]
        .clone()
        .sub(p[0])
        .cross(p[2].clone().sub(p[0]))
        .normalize();
      if (n.z <= 0) continue;
      const group = geo.groups.find(
        (g) => i >= g.start && i < g.start + g.count,
      );
      const material = Array.isArray(mesh.material)
        ? mesh.material[group?.materialIndex ?? 0]
        : mesh.material;
      const coords = p.map(projection);
      const d =
        coords
          .map(
            (v, k) => `${k ? "L" : "M"}${v[0].toFixed(2)} ${v[1].toFixed(2)}`,
          )
          .join("") + "Z";
      faces.push({
        depth: (p[0].z + p[1].z + p[2].z) / 3,
        d,
        color: shade(material, n),
        part: mesh.name,
      });
    }
  });
  faces.sort((a, b) => a.depth - b.depth);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none"><title>${label}</title><desc>Transparent vector projection of the actual faceted XEVEN spider mesh. Eight articulated black-metal legs and a recessed X on its shield.</desc>${faces.map((f) => `<path d="${f.d}" fill="${f.color}" stroke="${f.color}" stroke-width=".23" stroke-linejoin="round"/>`).join("")}</svg>`;
}
const poster = vectorSVG(
  -0.23,
  0.065,
  -0.018,
  "XEVEN dimensional spider — three-quarter poster",
);
const logo = vectorSVG(0, 0, 0, "XEVEN dimensional spider — front logo");
fs.writeFileSync(path.join(dir, "spider-3d-poster.svg"), poster);
fs.writeFileSync(path.join(dir, "spider-logo.svg"), logo);

function hull(points) {
  const unique = [
    ...new Map(
      points.map((p) => [p.map((n) => n.toFixed(4)).join(","), p]),
    ).values(),
  ].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (a, b, c) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const lower = [],
    upper = [];
  for (const p of unique) {
    while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0)
      lower.pop();
    lower.push(p);
  }
  for (const p of unique.toReversed()) {
    while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
const pointsPath = (points) =>
  points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join("") + "Z";
model.group.rotation.set(0, 0, 0);
model.group.updateMatrixWorld(true);
const legPaths = [];
model.group.traverse((mesh) => {
  if (
    !mesh.isMesh ||
    !mesh.name.startsWith("leg-") ||
    mesh.name.includes("washer") ||
    mesh.name.includes("hex-cap")
  )
    return;
  const p = mesh.geometry.attributes.position;
  const points = Array.from({ length: p.count }, (_, i) =>
    projection(
      new THREE.Vector3()
        .fromBufferAttribute(p, i)
        .applyMatrix4(mesh.matrixWorld),
    ),
  );
  legPaths.push(
    `<path d="${pointsPath(hull(points))}" fill="url(#spider-icon-metal)" stroke="#9db9c7" stroke-opacity=".88" stroke-width="4.2"/>`,
  );
});
const bodyPaths = [];
for (const name of ["abdomen-hull", "head-hull"]) {
  const mesh = model.group.getObjectByName(name),
    p = mesh.geometry.attributes.position;
  const points = Array.from({ length: p.count }, (_, i) =>
    projection(
      new THREE.Vector3()
        .fromBufferAttribute(p, i)
        .applyMatrix4(mesh.matrixWorld),
    ),
  );
  bodyPaths.push(
    `<path d="${pointsPath(hull(points))}" fill="url(#spider-icon-shell)" stroke="#7899ab" stroke-width="4.0"/>`,
  );
}
const shield = model.group.getObjectByName("abdomen-shield-with-real-x-cavity")
  .geometry.parameters.shapes;
const frontPoints = shield
  .getPoints()
  .map((p) => projection(new THREE.Vector3(p.x, p.y, 0)));
const xPoints = shield.holes[0]
  .getPoints()
  .map((p) => projection(new THREE.Vector3(p.x, p.y, 0)));
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none"><title>XEVEN spider insignia</title><desc>Small-size native vector derived from the same 3D spider, with a cool machined rim and an engraved X. Transparent background.</desc><defs><linearGradient id="spider-icon-metal" x1=".1" y1="0" x2=".92" y2="1"><stop stop-color="#4e6979"/><stop offset=".35" stop-color="#1a2c37"/><stop offset="1" stop-color="#04080b"/></linearGradient><linearGradient id="spider-icon-shell" x1="0" y1="0" x2=".88" y2=".8"><stop stop-color="#496775"/><stop offset=".45" stop-color="#172a34"/><stop offset="1" stop-color="#03080b"/></linearGradient></defs>${legPaths.join("")}${bodyPaths.join("")}<path d="${pointsPath(frontPoints)}" fill="url(#spider-icon-shell)" stroke="#9bbac9" stroke-width="3.8"/><g id="spider-back-x"><path d="${pointsPath(xPoints)}" fill="#527a8d" stroke="#020609" stroke-width="7" stroke-linejoin="miter"/><path d="${pointsPath(xPoints)}" fill="#527a8d" stroke="#a4c8d8" stroke-width="2.2" stroke-linejoin="miter"/></g></svg>`;
fs.writeFileSync(path.join(dir, "spider-icon.svg"), icon);
const embed = (svg, x, y, w, h) =>
  `<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"/>`;
const preview = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1050" width="1600" height="1050"><rect width="1600" height="1050" fill="#05090d"/><path d="M62 134H1538 M800 170V870" stroke="#23343f"/><g font-family="Arial,Helvetica,sans-serif" fill="#a7bbc5"><text x="62" y="67" font-size="24" letter-spacing="5">XEVEN / DIMENSIONAL IDENTITY</text><text x="62" y="104" font-size="12" letter-spacing="1.5">4.60 × 4.72 × 0.89 UNITS · 110 MESHES · 6,538 TRIANGLES · NO TEXTURES</text><text x="62" y="942" font-size="12" letter-spacing="2">01 / THREE-QUARTER PROJECTION</text><text x="850" y="942" font-size="12" letter-spacing="2">02 / FRONT PROJECTION + SMALL MASTER</text><text x="62" y="982" font-size="13" fill="#657f8e">Actual pierced shield plate. Recessed X floor. Eight rigged shoulder pivots.</text><text x="850" y="982" font-size="13" fill="#657f8e">All exported logo and poster SVGs have transparent backgrounds.</text></g>${embed(poster, 66, 166, 670, 708)}${embed(logo, 872, 170, 570, 602)}${embed(icon, 942, 810, 45.47, 48)}${embed(icon, 1050, 818, 37.89, 40)}${embed(icon, 1150, 826, 30.32, 32)}<g font-family="Arial,Helvetica,sans-serif" font-size="10" letter-spacing="1.3" fill="#7e99a8"><text x="942" y="889">48 PX</text><text x="1050" y="889">40 PX</text><text x="1150" y="889">32 PX</text></g></svg>`;
fs.writeFileSync(path.join(dir, "spider-3d-preview.svg"), preview);
try {
  const sharp = require("sharp");
  await sharp(Buffer.from(preview))
    .png()
    .toFile(path.join(dir, "spider-3d-preview.png"));
  await sharp(Buffer.from(poster))
    .resize(1080, 1140)
    .png()
    .toFile(path.join(dir, "spider-3d-poster.png"));
  await sharp(Buffer.from(icon))
    .resize(64, 68)
    .png()
    .toFile(path.join(dir, "spider-icon-64.png"));
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
  console.log(
    "SVG exports complete. Optional PNG projections need sharp installed.",
  );
}
console.log(
  JSON.stringify(
    {
      posterBytes: Buffer.byteLength(poster),
      logoBytes: Buffer.byteLength(logo),
      iconBytes: Buffer.byteLength(icon),
    },
    null,
    2,
  ),
);
model.dispose();
