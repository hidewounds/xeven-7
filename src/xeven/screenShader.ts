import * as THREE from 'three'

// Custom CRT display shader: canvas texture in, physical glass out.
// scanlines + pixel grid + RGB separation + noise + flicker + curvature
// + vignette + glow response + wipe transitions between screen states.
export const SCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const SCREEN_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uGlow;
uniform float uWipe; // 1 → 0 during state transitions
uniform float uFlick;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // barrel curvature
  vec2 cc = vUv - 0.5;
  float r2 = dot(cc, cc);
  vec2 uv = vUv + cc * r2 * 0.28;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  // RGB separation grows during transitions
  float sep = 0.0016 + uWipe * 0.012;
  vec3 col;
  col.r = texture2D(uMap, uv + vec2(sep, 0.0)).r;
  col.g = texture2D(uMap, uv).g;
  col.b = texture2D(uMap, uv - vec2(sep, 0.0)).b;
  // scanlines + pixel grid
  col *= 0.82 + 0.18 * sin(uv.y * 900.0);
  vec2 grid = step(0.82, fract(uv * vec2(170.0, 200.0)));
  col *= 1.0 - (grid.x * grid.y) * 0.25;
  // noise + flicker
  col += (hash(uv * 913.0 + fract(uTime) * 7.0) - 0.5) * 0.055;
  col *= 1.0 - uFlick * 0.35;
  // glow response (interaction / state light)
  col += vec3(0.35, 0.55, 1.0) * uGlow * 0.22;
  // vignette
  col *= 1.0 - smoothstep(0.15, 0.72, r2 * 2.0) * 0.55;
  // wipe: bright scan edge sweeps new state in
  float wx = 1.0 - (1.0 - uWipe) * (1.0 - uWipe);
  if (uv.x > wx) col = vec3(0.01, 0.015, 0.03);
  float edge = smoothstep(0.035, 0.0, abs(uv.x - wx)) * step(0.001, uWipe);
  col += vec3(0.4, 0.75, 1.0) * edge * 0.9;
  gl_FragColor = vec4(col * 1.55, 1.0);
}
`

export function createScreenMaterial(map: THREE.Texture) {
  const uniforms = {
    uMap: { value: map },
    uTime: { value: 0 },
    uGlow: { value: 0 },
    uWipe: { value: 0 },
    uFlick: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_VERT,
    fragmentShader: SCREEN_FRAG,
    uniforms,
    toneMapped: false,
  })
  return { material, uniforms }
}
