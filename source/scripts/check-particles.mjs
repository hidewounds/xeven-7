import assert from "node:assert/strict";
import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import ts from "typescript";
import * as THREE from "three";
const scratch = new URL("../outputs/particle-model-check.mjs", import.meta.url);
await mkdir(new URL("../outputs/", import.meta.url), { recursive: true });
try {
  await writeFile(
    scratch,
    ts.transpileModule(
      await readFile(new URL("../lib/orb-model.ts", import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  );
  const { createOrb, sampleOrbParticles, orbPhase, orbSize } = await import(
    scratch.href + "?t=" + Date.now()
  );
  const width = 32,
    height = 32,
    data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const n = (y * width + x) * 4;
      data.set(
        [
          80 + x * 3,
          30 + y * 2,
          75,
          Math.hypot(x - 15.5, y - 15.5) < 12 ? 255 : 0,
        ],
        n,
      );
    }
  const samples = sampleOrbParticles({ width, height, data }, 21000),
    regions = new Set();
  for (const values of Object.values(samples))
    assert([...values].every(Number.isFinite));
  for (let i = 0; i < samples.positions.length; i += 3) {
    assert(Math.hypot(samples.positions[i], samples.positions[i + 1]) < 0.8);
    regions.add(
      `${Math.floor((samples.targets[i] + 1) * 1.5)},${Math.floor((samples.targets[i + 1] + 1) * 1.5)}`,
    );
  }
  assert.equal(regions.size, 9, "Particles reach every region of the screen.");
  assert.throws(
    () =>
      sampleOrbParticles(
        { width: 1, height: 1, data: new Uint8ClampedArray(4) },
        1,
      ),
    /visible pixels/,
  );
  console.log(
    "PASS Particle samples preserve the source silhouette and populate all nine viewport regions",
  );
  let previous = orbPhase(0);
  for (let t = 0; t <= 6.25; t += 0.025) {
    const next = orbPhase(t);
    for (const key of Object.keys(next)) {
      assert(next[key] >= previous[key] - 1e-12);
      assert(next[key] >= 0 && next[key] <= 1 + 1e-12);
    }
    previous = next;
  }
  assert.equal(orbPhase(4).reveal, 0);
  assert.equal(orbPhase(6.25).reveal, 1);
  for (const [w, h] of [
    [320, 568],
    [390, 844],
    [1440, 900],
    [2560, 1440],
  ]) {
    assert(orbSize(w, h) <= 216);
    assert(orbSize(w, h) < w * 0.5);
  }
  console.log(
    "PASS Compact orb and dissolve → coverage → reveal timing are bounded and continuous",
  );
  const texture = new THREE.Texture(),
    orb = createOrb(texture, samples);
  assert.equal(orb.group.children.length, 3);
  assert.equal(orb.group.children.filter((m) => m.isPoints).length, 1);
  let released = 0;
  for (const mesh of orb.group.children) {
    mesh.geometry.addEventListener("dispose", () => released++);
    mesh.material.addEventListener("dispose", () => released++);
    for (const a of Object.values(mesh.geometry.attributes))
      assert([...a.array].every(Number.isFinite));
  }
  for (const [w, h, dpr] of [
    [390, 844, 1.4],
    [1440, 900, 1.7],
  ]) {
    orb.update(3, w, h, dpr);
    assert.equal(orb.uniforms.uResolution.value.x, Math.round(w * dpr));
    assert.equal(orb.uniforms.uAspect.value, w / h);
  }
  orb.dispose();
  texture.dispose();
  assert.equal(released, 6);
  assert.equal(orb.group.children.length, 0);
  console.log(
    "PASS Particle geometry, viewport uniforms, and resource disposal",
  );
  console.log("3 particle checks passed. GPU shaders were not rendered.");
} finally {
  await rm(scratch, { force: true });
}
