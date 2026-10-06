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
const ts = require("typescript");
const source = fs.readFileSync(path.join(repo, "lib/spider-model.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  reportDiagnostics: true,
});
if (compiled.diagnostics?.length)
  throw Error(
    ts.formatDiagnosticsWithColorAndContext(compiled.diagnostics, {
      getCurrentDirectory: () => dir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => "\n",
    }),
  );
const threeURL = pathToFileURL(
  path.join(repo, "node_modules/three/build/three.module.js"),
).href;
fs.writeFileSync(
  path.join(dir, ".spider-model-validation.mjs"),
  compiled.outputText.replace('from "three"', `from '${threeURL}'`),
);
const THREE = await import(threeURL);
const { createSpider, SPIDER_DIMENSIONS } = await import(
  pathToFileURL(path.join(dir, ".spider-model-validation.mjs")).href +
    "?" +
    Date.now()
);
const model = createSpider();
const box = new THREE.Box3().setFromObject(model.group);
const size = box.getSize(new THREE.Vector3());
let meshes = 0,
  triangles = 0,
  vertices = 0;
const meshNames = [];
model.group.traverse((obj) => {
  if (obj.isMesh) {
    meshes++;
    const geometry = obj.geometry;
    triangles +=
      (geometry.index
        ? geometry.index.count
        : geometry.attributes.position.count) / 3;
    vertices += geometry.attributes.position.count;
    meshNames.push(obj.name);
    for (const value of geometry.attributes.position.array)
      if (!Number.isFinite(value)) throw Error("Non-finite vertex " + obj.name);
  }
});
if (meshes >= 150 || triangles >= 40000) throw Error("Budget exceeded");
if (
  model.legs.length !== 8 ||
  model.legs.some((leg) => leg.rotation.x || leg.rotation.y || leg.rotation.z)
)
  throw Error("Leg rig contract failed");
const raycaster = new THREE.Raycaster();
const ray = (x, y) => {
  raycaster.set(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
  return raycaster
    .intersectObject(model.group, true)
    .filter(
      (hit) =>
        hit.object.name.includes("shield") ||
        hit.object.name.includes("engraving") ||
        hit.object.name.includes("hull"),
    )
    .map((hit) => ({ name: hit.object.name, z: hit.point.z }))
    .slice(0, 5);
};
const cavity = ray(0, 0.805),
  plate = ray(0.17, 0.8);
if (
  cavity[0]?.name !== "engraving-recessed-floor" ||
  Math.abs(cavity[0].z - 0.404) > 0.00001
)
  throw Error("Engraving is not a real open cavity: " + JSON.stringify(cavity));
if (plate[0]?.name !== "abdomen-shield-with-real-x-cavity" || plate[0].z < 0.48)
  throw Error("Armor front plane wrong: " + JSON.stringify(plate));
class FileReader {
  result = null;
  onloadend = null;
  onload = null;
  onerror = null;
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = result;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      })
      .catch((error) => this.onerror?.(error));
  }
  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(result).toString("base64")}`;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      })
      .catch((error) => this.onerror?.(error));
  }
}
globalThis.FileReader = FileReader;
const { GLTFExporter } = await import(
  pathToFileURL(
    path.join(
      repo,
      "node_modules/three/examples/jsm/exporters/GLTFExporter.js",
    ),
  ).href
);
const binary = await new GLTFExporter().parseAsync(model.group, {
  binary: true,
  onlyVisible: true,
  trs: true,
});
const glb = Buffer.from(binary);
fs.writeFileSync(path.join(dir, "xeven-spider.glb"), glb);
const jsonLength = glb.readUInt32LE(12);
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
if (gltf.buffers.some((b) => b.uri) || gltf.images?.length)
  throw Error("GLB has external assets");
const { GLTFLoader } = await import(
  pathToFileURL(
    path.join(repo, "node_modules/three/examples/jsm/loaders/GLTFLoader.js"),
  ).href
);
const loaded = await new GLTFLoader().parseAsync(binary, "");
const loadedSize = new THREE.Box3()
  .setFromObject(loaded.scene)
  .getSize(new THREE.Vector3());
if (
  loadedSize.distanceTo(size) > 0.00001 ||
  model.legs.some((leg) => !loaded.scene.getObjectByName(leg.name))
)
  throw Error("GLB round trip changed dimensions or leg pivots");
loaded.scene.traverse((obj) => {
  if (obj.isMesh) {
    obj.geometry.dispose();
    const materials = Array.isArray(obj.material)
      ? obj.material
      : [obj.material];
    materials.forEach((material) => material.dispose());
  }
});
const report = {
  envelope: {
    width: size.x,
    height: size.y,
    depth: size.z,
    min: box.min.toArray(),
    max: box.max.toArray(),
  },
  meshes,
  triangles,
  vertices,
  legPivots: model.legs.map((leg) => ({
    name: leg.name,
    pivot: leg.position.toArray(),
  })),
  materials: model.materials.map((m) => m.name),
  xCavityRay: cavity,
  solidPlateRay: plate,
  glbBytes: glb.length,
  glbNodes: gltf.nodes.length,
  glbExternalResources: 0,
  dimensions: SPIDER_DIMENSIONS,
};
fs.writeFileSync(
  path.join(dir, "validation.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      envelope: report.envelope,
      meshes,
      triangles,
      glbBytes: glb.length,
      xCavityRay: cavity[0],
      solidPlateRay: plate[0],
    },
    null,
    2,
  ),
);
model.dispose();
model.dispose();
