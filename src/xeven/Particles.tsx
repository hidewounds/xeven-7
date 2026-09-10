import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type PUniforms = {
  uTime: { value: number }
  uFlow: { value: number } // 0 orbit → 1 stream
  uW: { value: THREE.Vector3 } // target weights: console / memory / screen
  uRing: { value: number } // 0 scattered → 1 architecture ring structure
  uBoost: { value: number } // scroll-velocity energy
  uCalm: { value: number } // 0 boot-quiet → 1 full presence
  uCursor: { value: THREE.Vector3 }
  uPixelRatio: { value: number }
}

const VERT = /* glsl */ `
attribute vec4 aSeed;   // orbitR, orbitSpeed, phase, size
attribute vec3 aTarget; // stream destination slot
uniform float uTime;
uniform float uFlow;
uniform vec3 uW;
uniform float uRing;
uniform float uBoost;
uniform float uCalm;
uniform float uPixelRatio;
uniform vec3 uCursor;
varying float vAlpha;
varying vec3 vColor;
void main() {
  float orbitR = aSeed.x;
  float spd = aSeed.y * (1.0 + uBoost * 2.5);
  float ph = aSeed.z;
  // idle orbit around console
  vec3 orbitPos = vec3(
    cos(uTime * spd + ph) * orbitR,
    sin(uTime * spd * 0.7 + ph * 1.7) * orbitR * 0.6,
    sin(uTime * spd + ph) * orbitR * 0.8 - 1.0
  );
  // stream: travel from far field into weighted target (targets sit ON surfaces,
  // so particles dive into the machine instead of hovering in front of it)
  vec3 tgt = vec3(0.0, 0.4, 0.9) * uW.x + vec3(-0.4, -2.0, 0.6) * uW.y + vec3(0.0, 1.3, 0.7) * uW.z;
  float cyc = fract(uTime * (0.12 + spd * 0.25) + ph * 0.159);
  vec3 startPos = vec3(sin(ph * 12.9) * 9.0, cos(ph * 7.7) * 5.0, -6.0 - spd * 4.0);
  vec3 flowPos = mix(startPos, tgt, cyc * cyc);
  vec3 pos = mix(orbitPos, flowPos, uFlow);
  // architecture ring structure: deliberate formation, not decoration
  float ang = ph * 6.2831 + uTime * 0.05;
  float rr = 4.3 + fract(ph * 5.13) * 1.4;
  vec3 ringPos = vec3(cos(ang) * rr, sin(ang * 0.7) * 2.6, sin(ang) * rr * 0.55);
  pos = mix(pos, ringPos, uRing);
  // cursor displacement
  vec3 cd = pos - uCursor;
  float cl = length(cd);
  pos += normalize(cd + 0.0001) * smoothstep(2.2, 0.0, cl) * 0.7;
  vAlpha = (1.0 - uFlow * 0.25) * (0.12 + 0.5 * fract(ph * 3.3)) * uCalm;
  vColor = mix(vec3(0.45, 0.62, 1.0), vec3(0.55, 0.95, 1.0), fract(ph * 7.7));
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSeed.w * uPixelRatio * (34.0 / -mv.z);
}
`

const FRAG = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.08, d) * vAlpha;
  gl_FragColor = vec4(vColor, a);
}
`

export default function Particles({
  count,
  uniforms,
}: {
  count: number
  uniforms: PUniforms
}) {
  const ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3) // dummy, real pos in shader
    const seed = new Float32Array(count * 4)
    const tgt = new Float32Array(count * 3)
    let s = 12345
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < count; i++) {
      seed[i * 4] = 2.5 + rnd() * 6.5
      seed[i * 4 + 1] = 0.15 + rnd() * 0.5
      seed[i * 4 + 2] = rnd() * 6.28
      seed[i * 4 + 3] = 0.8 + rnd() * 1.6
      tgt[i * 3] = (rnd() - 0.5) * 2
      tgt[i * 3 + 1] = (rnd() - 0.5) * 4
      tgt[i * 3 + 2] = 1 + rnd() * 1.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    g.setAttribute('aTarget', new THREE.BufferAttribute(tgt, 3))
    return g
  }, [count])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  useFrame(() => {
    uniforms.uTime.value += 0.016
  })

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}
