/**
 * Original, reproducible XEVEN handheld model. No external art or textures.
 * Run from the repository root: node scripts/generate-console.mjs
 * Requires the project's existing `three` dependency. See docs/console-model.md.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// GLTFExporter uses the browser FileReader API even for texture-free GLB output.
globalThis.FileReader ??= class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.({ target: this });
    }).catch((error) => this.onerror?.(error));
  }
};

const scene = new THREE.Scene();
const root = new THREE.Group();
root.name = 'XEVENConsole';
root.userData = {
  description: 'XEVEN original transparent handheld interface concept',
  frontAxis: '+Z',
  upAxis: '+Y',
  screen: { width: 2.68, height: 1.85, center: [0, 1.175, 0.334] },
  authorship: 'Procedural model authored for this XEVEN website; no external assets',
};
scene.add(root);
const hardware = new THREE.Group();
hardware.name = 'Hardware';
root.add(hardware);

const materials = {
  shell: new THREE.MeshPhysicalMaterial({
    name: 'Polycarbonate_Clear', color: '#d9e8ec', metalness: 0.02,
    roughness: 0.12, transmission: 0.66, thickness: 0.11, ior: 1.48,
    clearcoat: 1, clearcoatRoughness: 0.10, attenuationColor: '#b7e3e8',
    attenuationDistance: 8, transparent: true, opacity: 0.82,
  }),
  glassEdge: new THREE.MeshPhysicalMaterial({
    name: 'Polycarbonate_Edge', color: '#c9dce3', metalness: 0.12,
    roughness: 0.15, transmission: 0.32, thickness: 0.1, ior: 1.49,
    clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.94,
  }),
  titanium: new THREE.MeshStandardMaterial({
    name: 'Brushed_Titanium', color: '#8f9ba8', metalness: 0.92, roughness: 0.29,
  }),
  brightMetal: new THREE.MeshStandardMaterial({
    name: 'Polished_Chrome', color: '#d8e5ed', metalness: 1, roughness: 0.16,
  }),
  darkMetal: new THREE.MeshStandardMaterial({
    name: 'Gunmetal', color: '#252e38', metalness: 0.86, roughness: 0.33,
  }),
  pcb: new THREE.MeshStandardMaterial({
    name: 'Graphite_Board', color: '#263038', metalness: 0.32, roughness: 0.55,
  }),
  trace: new THREE.MeshStandardMaterial({
    name: 'Silver_Circuit_Trace', color: '#9ba7a5', metalness: 0.94, roughness: 0.34,
  }),
  copper: new THREE.MeshStandardMaterial({
    name: 'Pale_Copper', color: '#b6a48f', metalness: 0.94, roughness: 0.35,
  }),
  rubber: new THREE.MeshStandardMaterial({
    name: 'Soft_Touch_Controls', color: '#10151b', metalness: 0.15, roughness: 0.6,
  }),
  bezel: new THREE.MeshPhysicalMaterial({
    name: 'Screen_Gasket', color: '#05090e', metalness: 0.42, roughness: 0.2,
    clearcoat: 0.7, clearcoatRoughness: 0.16,
  }),
  white: new THREE.MeshStandardMaterial({
    name: 'Warm_White_Ink', color: '#e0e9ed', metalness: 0.1, roughness: 0.48,
  }),
  cyan: new THREE.MeshStandardMaterial({
    name: 'Cyan_Light', color: '#72e8ff', emissive: '#42cde5',
    emissiveIntensity: 1.15, metalness: 0.4, roughness: 0.24,
  }),
  pink: new THREE.MeshStandardMaterial({
    name: 'Pink_Light', color: '#f69ccb', emissive: '#c3669f',
    emissiveIntensity: 0.75, metalness: 0.5, roughness: 0.23,
  }),
  prism: new THREE.MeshPhysicalMaterial({
    name: 'Iridescent_Analogue_Ring', color: '#c9d6df', metalness: 0.82,
    roughness: 0.15, iridescence: 1, iridescenceIOR: 1.7,
    iridescenceThicknessRange: [90, 420], clearcoat: 1,
  }),
  screen: new THREE.MeshBasicMaterial({
    name: 'Screen_Display_Replace_With_CanvasTexture', color: '#07111a',
    toneMapped: false,
  }),
};

function roundedShape(width, height, radius, x = 0, y = 0) {
  const shape = new THREE.Shape();
  const left = x - width / 2;
  const right = x + width / 2;
  const bottom = y - height / 2;
  const top = y + height / 2;
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  return shape;
}

function roundHole(shape, width, height, radius, x = 0, y = 0) {
  shape.holes.push(new THREE.Path(roundedShape(width, height, radius, x, y).getPoints(4).reverse()));
}

function circleHole(shape, x, y, radius) {
  const path = new THREE.Path();
  path.absarc(x, y, radius, 0, Math.PI * 2, true);
  shape.holes.push(path);
}

function extrude(shape, depth, bevel = 0.025) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 1, curveSegments: 5, steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

function mesh(geometry, material, x = 0, y = 0, z = 0, parent = hardware, name = '') {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  if (name) object.name = name;
  parent.add(object);
  return object;
}

function plate(width, height, depth, radius, material, x = 0, y = 0, z = 0, parent = hardware) {
  // Tiny SMT components, vents, and engraved marks do not need bevel topology.
  if (width < 0.50 && height < 0.50) {
    return mesh(new THREE.BoxGeometry(width, height, depth), material, x, y, z, parent);
  }
  return mesh(extrude(roundedShape(width, height, radius), depth, 0.01), material, x, y, z, parent);
}

function cylinder(radius, depth, material, x, y, z, parent = hardware, segments = 20) {
  const item = mesh(new THREE.CylinderGeometry(radius, radius, depth, segments, 1), material, x, y, z, parent);
  item.rotation.x = Math.PI / 2;
  return item;
}

function torus(radius, tube, material, x, y, z, parent = hardware, arc = Math.PI * 2, rotation = 0) {
  const item = mesh(new THREE.TorusGeometry(radius, tube, 6, 32, arc), material, x, y, z, parent);
  item.rotation.z = rotation;
  return item;
}

function stroke(a, b, radius, material, parent = hardware) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const geometry = radius <= 0.006
    ? new THREE.BoxGeometry(radius * 2, direction.length(), radius * 2)
    : new THREE.CylinderGeometry(radius, radius, direction.length(), 5, 1);
  const item = mesh(geometry, material, 0, 0, 0, parent);
  item.position.copy(start).add(end).multiplyScalar(0.5);
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return item;
}

function linePath(points, radius, material, parent = hardware) {
  for (let i = 1; i < points.length; i += 1) stroke(points[i - 1], points[i], radius, material, parent);
}

const glyphs = {
  X: [[0, 0, 1, 1], [0, 1, 1, 0]],
  E: [[0, 0, 0, 1], [0, 1, 1, 1], [0, 0.5, 0.8, 0.5], [0, 0, 1, 0]],
  V: [[0, 1, 0.5, 0], [0.5, 0, 1, 1]],
  N: [[0, 0, 0, 1], [0, 1, 1, 0], [1, 0, 1, 1]],
  A: [[0, 0, 0.5, 1], [0.5, 1, 1, 0], [0.22, 0.4, 0.78, 0.4]],
  B: [[0, 0, 0, 1], [0, 1, 0.72, 1], [0.72, 1, 1, 0.75], [1, 0.75, 0.65, 0.5], [0, 0.5, 0.65, 0.5], [0.65, 0.5, 1, 0.25], [1, 0.25, 0.72, 0], [0.72, 0, 0, 0]],
  Y: [[0, 1, 0.5, 0.5], [1, 1, 0.5, 0.5], [0.5, 0.5, 0.5, 0]],
};

function lettering(text, height, x, y, z, material = materials.white, parent = hardware, facing = 1) {
  const width = height * 0.72;
  const advance = height * 1.09;
  const total = (text.length - 1) * advance + width;
  [...text].forEach((char, index) => {
    for (const [ax, ay, bx, by] of glyphs[char] ?? []) {
      stroke(
        [x + (-total / 2 + index * advance + ax * width) * facing, y + (ay - 0.5) * height, z],
        [x + (-total / 2 + index * advance + bx * width) * facing, y + (by - 0.5) * height, z],
        height * 0.035, material, parent,
      );
    }
  });
}

// A shell with actual walls, seam and front window, not a single transparent box.
const walls = roundedShape(3.30, 4.90, 0.31);
roundHole(walls, 3.11, 4.70, 0.27);
mesh(extrude(walls, 0.40, 0.045), materials.glassEdge, 0, 0, -0.005);

const front = roundedShape(3.30, 4.90, 0.31);
roundHole(front, 2.90, 2.14, 0.18, 0, 1.175);
circleHole(front, -0.94, -1.62, 0.375);
circleHole(front, 0.94, -1.62, 0.375);
circleHole(front, -0.96, -0.53, 0.425);
circleHole(front, 0.98, -0.53, 0.49);
mesh(extrude(front, 0.045, 0.022), materials.shell, 0, 0, 0.263);

plate(3.26, 4.86, 0.045, 0.30, materials.shell, 0, 0, -0.252);
const seam = roundedShape(3.30, 4.90, 0.31);
roundHole(seam, 3.22, 4.82, 0.28);
mesh(extrude(seam, 0.015, 0.008), materials.titanium, 0, 0, -0.03);

// A pale graphite circuit board and components remain visible through the body.
const board = roundedShape(2.99, 4.57, 0.2);
circleHole(board, -0.94, -1.62, 0.27);
circleHole(board, 0.94, -1.62, 0.27);
mesh(extrude(board, 0.055, 0.005), materials.pcb, 0, 0, -0.06);
plate(2.38, 1.55, 0.035, 0.09, materials.darkMetal, 0, 1.16, 0.05);
plate(1.17, 0.61, 0.07, 0.07, materials.darkMetal, 0, -1.26, 0.015);
plate(0.43, 0.34, 0.055, 0.025, materials.bezel, 0, -1.20, 0.08);
plate(0.84, 1.44, 0.055, 0.065, materials.darkMetal, 0, -0.84, -0.16);

// Deterministic routed traces: clean right angles and 45-degree bends.
for (const side of [-1, 1]) {
  for (let i = 0; i < 8; i += 1) {
    const x = side * (0.29 + i * 0.075);
    linePath([
      [x, -1.00, 0.007], [x, -0.73 + i * 0.025, 0.007],
      [side * (0.68 + i * 0.066), -0.34 + i * 0.025, 0.007],
      [side * (1.28 + i * 0.014), -0.34 + i * 0.025, 0.007],
      [side * (1.28 + i * 0.014), 0.56 + i * 0.17, 0.007],
    ], 0.006, i % 3 === 0 ? materials.copper : materials.trace);
    linePath([
      [side * 0.18, -1.48 - i * 0.039, 0.007],
      [side * (0.39 + i * 0.04), -1.48 - i * 0.039, 0.007],
      [side * (0.63 + i * 0.04), -1.94 - i * 0.027, 0.007],
      [side * 1.32, -1.94 - i * 0.027, 0.007],
    ], 0.006, materials.trace);
  }
  for (let i = 0; i < 6; i += 1) {
    plate(0.085, 0.17, 0.04, 0.014, i % 2 ? materials.copper : materials.titanium,
      side * (0.62 + i * 0.135), -2.26, 0.018);
  }
  // Rear-facing structural ribs and board details.
  plate(0.06, 3.45, 0.07, 0.02, materials.glassEdge, side * 1.20, 0.08, -0.20);
  for (let i = 0; i < 3; i += 1) {
    plate(0.42, 0.16, 0.018, 0.025, materials.darkMetal, side * 0.73, 0.43 + i * 0.48, -0.17);
  }
}

// Screen cassette: metal bezel, dark gasket, then independently replaceable UI.
const bezel = roundedShape(2.91, 2.16, 0.17);
roundHole(bezel, 2.68, 1.85, 0.11);
mesh(extrude(bezel, 0.09, 0.018), materials.bezel, 0, 1.175, 0.270);
const lip = roundedShape(2.955, 2.20, 0.19);
roundHole(lip, 2.90, 2.14, 0.17);
mesh(extrude(lip, 0.020, 0.008), materials.brightMetal, 0, 1.175, 0.286);
const screenGeometry = new THREE.ShapeGeometry(roundedShape(2.68, 1.85, 0.11), 10);
const position = screenGeometry.getAttribute('position');
const uv = screenGeometry.getAttribute('uv');
for (let i = 0; i < position.count; i += 1) {
  uv.setXY(i, position.getX(i) / 2.68 + 0.5, position.getY(i) / 1.85 + 0.5);
}
const screen = mesh(screenGeometry, materials.screen, 0, 1.175, 0.334, root, 'ScreenSurface');
screen.userData = { width: 2.68, height: 1.85, cornerRadius: 0.11, uvOrigin: 'bottom-left', replaceMaterial: true };

// Speaker with a genuinely perforated front plate, and dark cavity underneath.
const speaker = roundedShape(0.69, 0.38, 0.045);
for (let row = 0; row < 3; row += 1) {
  for (let col = 0; col < 7; col += 1) roundHole(speaker, 0.047, 0.060, 0.013, (col - 3) * 0.082, (row - 1) * 0.094);
}
plate(0.73, 0.43, 0.03, 0.045, materials.bezel, 0, -0.32, 0.205);
mesh(extrude(speaker, 0.025, 0.002), materials.titanium, 0, -0.32, 0.281);

// D-pad: physically separate pivot and crossed, bevelled rubber rocker.
cylinder(0.435, 0.065, materials.glassEdge, -0.96, -0.53, 0.265);
cylinder(0.382, 0.065, materials.darkMetal, -0.96, -0.53, 0.31);
const dpad = new THREE.Group();
dpad.name = 'ControlDPad';
dpad.position.set(-0.96, -0.53, 0.355);
root.add(dpad);
const cross = new THREE.Shape();
const w = 0.128;
const e = 0.338;
cross.moveTo(-w, e); cross.lineTo(w, e); cross.lineTo(w, w);
cross.lineTo(e, w); cross.lineTo(e, -w); cross.lineTo(w, -w);
cross.lineTo(w, -e); cross.lineTo(-w, -e); cross.lineTo(-w, -w);
cross.lineTo(-e, -w); cross.lineTo(-e, w); cross.lineTo(-w, w); cross.closePath();
mesh(extrude(cross, 0.085, 0.025), materials.rubber, 0, 0, 0, dpad);
plate(0.16, 0.16, 0.008, 0.025, materials.darkMetal, 0, 0, 0.057, dpad);
for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
  const x = Math.sin(angle) * 0.235;
  const y = Math.cos(angle) * 0.235;
  const mark = plate(0.10, 0.016, 0.002, 0.003, materials.titanium, x, y, 0.060, dpad);
  mark.rotation.z = -angle;
}

// Face controls sit in a glass island. All names are stable interaction hooks.
cylinder(0.491, 0.05, materials.glassEdge, 0.98, -0.53, 0.256);
for (const { name, x, y, ink } of [
  { name: 'Y', x: 0.98, y: -0.235, ink: materials.white },
  { name: 'X', x: 0.685, y: -0.53, ink: materials.cyan },
  { name: 'B', x: 1.275, y: -0.53, ink: materials.pink },
  { name: 'A', x: 0.98, y: -0.825, ink: materials.white },
]) {
  cylinder(0.192, 0.044, materials.titanium, x, y, 0.287);
  const button = new THREE.Group();
  button.name = `Control${name}`;
  button.position.set(x, y, 0.341);
  button.userData = { pressAxis: 'z', pressDistance: -0.025 };
  root.add(button);
  cylinder(0.155, 0.065, materials.rubber, 0, 0, 0, button);
  torus(0.145, 0.009, materials.darkMetal, 0, 0, 0.033, button);
  lettering(name, 0.127, 0, 0, 0.038, ink, button);
}

// Analogue assemblies: socket, prism ring, subtle split light pipe, stem and cap.
for (const [name, x] of [['Left', -0.94], ['Right', 0.94]]) {
  cylinder(0.375, 0.057, materials.glassEdge, x, -1.62, 0.273);
  cylinder(0.322, 0.06, materials.darkMetal, x, -1.62, 0.302);
  torus(0.305, 0.029, materials.prism, x, -1.62, 0.345);
  torus(0.345, 0.010, materials.cyan, x, -1.62, 0.32, hardware, Math.PI * 0.77, Math.PI * 0.14);
  torus(0.345, 0.010, materials.pink, x, -1.62, 0.32, hardware, Math.PI * 0.70, Math.PI * 1.12);
  const stick = new THREE.Group();
  stick.name = `ControlStick${name}`;
  stick.position.set(x, -1.62, 0.337);
  root.add(stick);
  cylinder(0.087, 0.15, materials.darkMetal, 0, 0, 0.07, stick);
  cylinder(0.238, 0.069, materials.rubber, 0, 0, 0.155, stick);
  torus(0.21, 0.025, materials.rubber, 0, 0, 0.181, stick);
  cylinder(0.18, 0.009, materials.darkMetal, 0, 0, 0.189, stick);
  for (let i = 0; i < 16; i += 1) {
    const angle = i / 16 * Math.PI * 2;
    stroke([Math.sin(angle) * 0.205, Math.cos(angle) * 0.205, 0.188],
      [Math.sin(angle) * 0.228, Math.cos(angle) * 0.228, 0.177],
      0.004, materials.titanium, stick);
  }
}

// Small select/start keys between controls, and understated engraved branding.
for (const [name, x] of [['Select', -0.23], ['Start', 0.23]]) {
  plate(0.21, 0.15, 0.025, 0.04, materials.titanium, x, -0.94, 0.277);
  const control = new THREE.Group();
  control.name = `Control${name}`;
  control.position.set(x, -0.94, 0.310);
  root.add(control);
  plate(0.15, 0.08, 0.033, 0.021, materials.rubber, 0, 0, 0, control);
}
plate(0.95, 0.28, 0.029, 0.048, materials.darkMetal, 0, -2.14, 0.285);
lettering('XEVEN', 0.10, 0, -2.14, 0.307);
lettering('XEVEN', 0.066, -0.88, 2.354, 0.304, materials.darkMetal);
cylinder(0.022, 0.008, materials.cyan, 1.20, 2.354, 0.303, hardware, 12);

// Eight clear mounting towers with metal machine screws and real cross slots.
for (const [x, y] of [[-1.44, 2.20], [1.44, 2.20], [-1.46, 0.12], [1.46, 0.12], [-1.45, -1.09], [1.45, -1.09], [-1.40, -2.18], [1.40, -2.18]]) {
  cylinder(0.076, 0.40, materials.glassEdge, x, y, 0.001, hardware, 16);
  cylinder(0.048, 0.039, materials.brightMetal, x, y, 0.294, hardware, 16);
  stroke([x - 0.029, y, 0.316], [x + 0.029, y, 0.316], 0.005, materials.bezel);
  stroke([x, y - 0.029, 0.316], [x, y + 0.029, 0.316], 0.005, materials.bezel);
  cylinder(0.04, 0.015, materials.darkMetal, x, y, -0.282, hardware, 12);
}

// Shoulder controls, side vents and connector geometry complete reverse views.
for (const side of [-1, 1]) {
  plate(0.84, 0.12, 0.25, 0.045, materials.darkMetal, side * 0.95, 2.465, -0.025);
  plate(0.59, 0.07, 0.20, 0.022, materials.titanium, side * 0.95, 2.526, -0.025);
  for (let i = 0; i < 7; i += 1) {
    const vent = plate(0.035, 0.20, 0.011, 0.007, materials.bezel, side * 1.656, 0.37 + i * 0.20, -0.031);
    vent.rotation.y = Math.PI / 2;
  }
  const sideKey = plate(0.095, 0.42, 0.015, 0.022, materials.titanium, side * 1.667, -0.35, -0.045);
  sideKey.rotation.y = Math.PI / 2;
}
const portOuter = plate(0.42, 0.16, 0.02, 0.045, materials.titanium, 0, -2.46, -0.02);
portOuter.rotation.x = Math.PI / 2;
const portInner = plate(0.32, 0.082, 0.015, 0.029, materials.bezel, 0, -2.475, -0.02);
portInner.rotation.x = Math.PI / 2;
const usbTongue = plate(0.24, 0.015, 0.025, 0.004, materials.darkMetal, 0, -2.484, -0.02);
usbTongue.rotation.x = Math.PI / 2;
const backBadge = plate(0.91, 0.40, 0.013, 0.040, materials.darkMetal, 0, 0.16, -0.290);
lettering('XEVEN', 0.107, 0, 0.16, -0.304, materials.white, hardware, -1);
// Mirrored construction keeps the rear wordmark readable from the back.
backBadge.name = 'BackBadge';

// Merge static pieces by material, and per-control pieces separately. This keeps
// rendering lean while retaining screen/control names for application hooks.
function batch(group) {
  group.updateMatrixWorld(true);
  const inverse = group.matrixWorld.clone().invert();
  const batches = new Map();
  for (const object of [...group.children]) {
    if (!object.isMesh) continue;
    const geometry = object.geometry.clone().applyMatrix4(inverse.clone().multiply(object.matrixWorld));
    const normalized = geometry.index ? geometry.toNonIndexed() : geometry;
    const key = object.material.uuid;
    if (!batches.has(key)) batches.set(key, { material: object.material, geometries: [] });
    batches.get(key).geometries.push(normalized);
    group.remove(object);
  }
  for (const { material, geometries } of batches.values()) {
    const geometry = mergeGeometries(geometries, false);
    if (!geometry) throw new Error(`Cannot merge ${material.name}`);
    const indexed = mergeVertices(geometry, 0.00001);
    const merged = new THREE.Mesh(indexed, material);
    geometry.dispose();
    merged.name = `${group.name}_${material.name}`;
    group.add(merged);
    for (const input of geometries) input.dispose();
  }
}
batch(hardware);
for (const child of root.children) if (child.isGroup && child !== hardware) batch(child);

const exporter = new GLTFExporter();
const binary = await exporter.parseAsync(scene, { binary: true, onlyVisible: true, trs: false });
const output = resolve(process.cwd(), 'public/xeven/console.glb');
await mkdir(resolve(process.cwd(), 'public/xeven'), { recursive: true });
await writeFile(output, Buffer.from(binary));

// Re-load the exported artifact, not just the in-memory scene.
const parsed = await new GLTFLoader().parseAsync(binary, '');
let triangles = 0;
let meshCount = 0;
parsed.scene.traverse((object) => {
  if (!object.isMesh) return;
  meshCount += 1;
  triangles += object.geometry.index ? object.geometry.index.count / 3 : object.geometry.attributes.position.count / 3;
  for (const number of object.geometry.attributes.position.array) {
    if (!Number.isFinite(number)) throw new Error(`Invalid vertex in ${object.name}`);
  }
});
for (const name of ['ScreenSurface', 'ControlDPad', 'ControlStickLeft', 'ControlStickRight', 'ControlA', 'ControlB', 'ControlX', 'ControlY']) {
  if (!parsed.scene.getObjectByName(name)) throw new Error(`Missing contract node: ${name}`);
}
const bounds = new THREE.Box3().setFromObject(parsed.scene);
const loadedScreen = parsed.scene.getObjectByName('ScreenSurface');
const screenBounds = new THREE.Box3().setFromObject(loadedScreen);
if (binary.byteLength > 4_000_000) throw new Error('Model exceeds the mobile model budget');
console.log(JSON.stringify({
  output, bytes: binary.byteLength, meshes: meshCount, triangles,
  bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  screen: { min: screenBounds.min.toArray(), max: screenBounds.max.toArray() },
  validation: 'Exported GLB parsed successfully with GLTFLoader; required nodes and finite vertices verified',
}, null, 2));
