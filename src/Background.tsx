import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import type { BgState } from './scroll-state'

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec4 vClip;
varying float vDepth;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  vClip = projectionMatrix * mv;
  gl_Position = vClip;
}
`

const FRAG = /* glsl */ `
varying vec2 vUv;
varying vec4 vClip;
varying float vDepth;
uniform float uTime;
uniform float uDrift;
uniform float uPulseT;
uniform vec3 uCursor;

float gridLine(vec2 g) {
  vec2 d = min(g, 1.0 - g);
  return 1.0 - smoothstep(0.0, 0.035, min(d.x, d.y));
}

void main() {
  // warp-only cursor point: bends lines, adds zero light (cannot wash out)
  vec2 ndc = vClip.xy / vClip.w * 0.5 + 0.5;
  float cage = uTime - uCursor.z;
  float ca = exp(-cage * 3.0);
  vec2 cdd = ndc - uCursor.xy;
  cdd.x *= 1.5;
  float cl = length(cdd);
  float cb = exp(-cl * cl * 26.0) * ca;
  vec2 coff = (cdd / max(cl, 1e-3)) * cb;

  vec2 uv = vec2(vUv.x * 1.0, vUv.y * 3.0 + uDrift);
  uv += coff * 0.002;

  vec2 minor = vec2(fract(uv.x * 56.0), fract(uv.y * 14.0));
  vec2 major = vec2(fract(uv.x * 8.0), fract(uv.y * 3.0));

  // depth fog: far wall melts into black — this is what sells the room
  float fog = exp(-vDepth * 0.055);
  // soft light pooling mid-wall
  float poolY = (vUv.y - 0.55) * 2.2;
  float pool = 0.55 + 0.45 * exp(-poolY * poolY);

  vec3 col = vec3(0.006, 0.006, 0.008);
  col += vec3(0.50, 0.53, 0.60) * gridLine(minor) * 0.085 * fog * pool;
  col += vec3(0.60, 0.64, 0.72) * gridLine(major) * 0.16 * fog * pool;

  // halftone dot grain on the wall
  vec2 hg = fract(vUv * vec2(180.0, 90.0)) - 0.5;
  col += vec3(0.5) * smoothstep(0.25, 0.08, length(hg)) * 0.03 * fog;

  float age = max(uTime - uPulseT, 0.0);
  float sweepY = 1.0 - age * 0.8;
  float sweepD = (vUv.y - sweepY) * 7.0;
  float band = exp(-sweepD * sweepD) * exp(-age * 1.4);
  col += vec3(0.35, 0.38, 0.45) * band * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`

/* translucent triangular prism — the hero object (home only) */
function Prism({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!)
  const fade = useRef(1)
  const spin = useRef(0)
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1.15)
    s.lineTo(-1.1, -0.85)
    s.lineTo(1.1, -0.85)
    s.closePath()
    const hole = new THREE.Path()
    hole.moveTo(0, 0.42)
    hole.lineTo(-0.46, -0.38)
    hole.lineTo(0.46, -0.38)
    hole.closePath()
    s.holes.push(hole)
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
    })
    g.center()
    return g
  }, [])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.getElapsedTime()
    const target = bg.mode === 'home' ? 1 - bg.hero : 0
    fade.current += (target - fade.current) * 0.08
    group.current.visible = fade.current > 0.02
    if (!group.current.visible) return
    // velocity-reactive: fast scrolls throw extra spin that decays away
    spin.current += Math.min(Math.abs(bg.velocity) * 0.03, 0.25)
    spin.current *= 0.96
    group.current.rotation.y = t * 0.12 + spin.current
    group.current.rotation.x = Math.sin(t * 0.3) * 0.08
    group.current.position.y = 0.2 - bg.hero * 4 + Math.sin(t * 0.8) * 0.1
    group.current.scale.setScalar(Math.max(0.01, fade.current))
    mat.current.opacity = fade.current
  })

  return (
    <group ref={group} position={[0, 0.2, -1.6]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          ref={mat}
          color="#ffffff"
          roughness={0.08}
          metalness={0}
          transmission={1}
          thickness={0.9}
          ior={1.45}
          transparent
        />
        <Edges scale={1.01} color="#cfd6ff" />
      </mesh>
    </group>
  )
}

const BAND_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const BAND_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uFlow;
uniform float uSeed;
uniform float uStrength;
void main() {
  float d = fract(vUv.x * 2.0 + vUv.y * 0.7 + uFlow + uSeed);
  float band = smoothstep(0.25, 0.45, d) * (1.0 - smoothstep(0.55, 0.75, d));
  float edge = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
  float a = band * edge * uStrength;
  gl_FragColor = vec4(vec3(0.75, 0.78, 0.85) * a, a);
}
`

/* zebra ribbons drifting behind the prism (home only) */
function Bands({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const grp = useRef<THREE.Group>(null!)
  const fade = useRef(1)
  const mats = useMemo(
    () =>
      [0, 1, 2].map(
        (i) =>
          new THREE.ShaderMaterial({
            uniforms: {
              uFlow: { value: i * 0.31 },
              uSeed: { value: i * 0.37 },
              uStrength: { value: 0.5 },
            },
            vertexShader: BAND_VERT,
            fragmentShader: BAND_FRAG,
            transparent: true,
            depthWrite: false,
          }),
      ),
    [],
  )
  const flow = useRef(0)

  useFrame((_, dt) => {
    const target = bg.mode === 'home' ? 1 - bg.hero * 0.75 : 0
    fade.current += (target - fade.current) * 0.08
    grp.current.visible = fade.current > 0.02
    const speed = Math.min(Math.abs(bg.velocity) * 0.15, 0.4)
    flow.current += reduced ? 0 : dt * (0.03 + speed)
    for (const m of mats) {
      m.uniforms.uFlow.value = flow.current
      m.uniforms.uStrength.value = 0.5 * fade.current
    }
  })

  return (
    <group ref={grp}>
      {mats.map((m, i) => (
        <mesh
          key={i}
          material={m}
          position={[0, 0.4 - i * 0.9, -3.5 - i * 1.6]}
          rotation={[0, 0, -0.45]}
        >
          <planeGeometry args={[15, 3.6]} />
        </mesh>
      ))}
    </group>
  )
}

/* suspended dust between bands and wall */
function Dust({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16
      arr[i * 3 + 2] = -10 + Math.random() * 12
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.01
    ref.current.position.y = Math.sin(t * 0.1) * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#9aa3c0" transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

const BURST_COUNT = 220

/* particle burst fired on every route change — destruction-lite + scene memory */
function Burst({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const prevPulse = useRef(0)
  const { geo, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(BURST_COUNT * 3)
    const dir = new Float32Array(BURST_COUNT * 3)
    const rnd = new Float32Array(BURST_COUNT)
    for (let i = 0; i < BURST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = -1 - Math.random() * 6
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      dir[i * 3] = Math.sin(ph) * Math.cos(th)
      dir[i * 3 + 1] = Math.sin(ph) * Math.sin(th)
      dir[i * 3 + 2] = Math.cos(ph)
      rnd[i] = Math.random()
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1))
    const uniforms = { uTime: { value: 0 }, uBurstT: { value: -10 } }
    return { geo, uniforms }
  }, [])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.getElapsedTime()
    if (bg.pulse !== prevPulse.current) {
      prevPulse.current = bg.pulse
      uniforms.uBurstT.value = t
    }
    uniforms.uTime.value = t
  })

  return (
    <points frustumCulled={false}>
      <primitive object={geo} attach="geometry" />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute vec3 aDir;
          attribute float aRand;
          uniform float uTime;
          uniform float uBurstT;
          varying float vA;
          void main() {
            float age = max(uTime - uBurstT, 0.0);
            float env = exp(-age * 1.8);
            vec3 p = position + aDir * (1.0 - exp(-age * 2.5)) * 3.5;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.0 + aRand * 3.0) * (120.0 / -mv.z);
            vA = env;
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vA;
          void main() {
            vec2 q = gl_PointCoord - 0.5;
            float m = smoothstep(0.5, 0.1, length(q));
            vec3 col = mix(vec3(1.0), vec3(0.45, 0.7, 1.0), 0.6);
            gl_FragColor = vec4(col * m, m * vA * 0.9);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function Background({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 55, position: [0, 0, 1.0], near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 1, 2]} intensity={14} color="#3a7bff" />
      <pointLight position={[-4, -1, 2]} intensity={12} color="#ff4a2a" />
      <Tube bg={bg} reduced={reduced} />
      <Bands bg={bg} reduced={reduced} />
      <Dust reduced={reduced} />
      <Burst bg={bg} reduced={reduced} />
      <Prism bg={bg} reduced={reduced} />
    </Canvas>
  )
}

function Tube({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const drift = useRef(0)
  const rot = useRef(0)
  const kick = useRef(0)
  const cur = useRef(new THREE.Vector3(0.5, 0.5, -10))
  const prevPulse = useRef(0)

  useFrame(({ clock, camera }) => {
    const t = reduced ? 0 : clock.getElapsedTime()
    const targetDrift = bg.progress * 2 + (reduced ? 0 : t * 0.01)
    drift.current += (targetDrift - drift.current) * 0.08
    rot.current += (bg.progress * 0.6 + (reduced ? 0 : t * 0.015) - rot.current) * 0.06
    if (bg.pulse !== prevPulse.current) {
      // crash-zoom cut on every route change
      prevPulse.current = bg.pulse
      mat.current.uniforms.uPulseT.value = t
      kick.current = 1
    }
    kick.current *= 0.94
    mat.current.uniforms.uTime.value = t
    mat.current.uniforms.uDrift.value = drift.current
    ;(mat.current.uniforms.uCursor.value as THREE.Vector3).copy(cur.current)
    group.current.rotation.y = rot.current
    // camera-as-scroll: dive deeper into the tube as the page descends
    const persp = camera as THREE.PerspectiveCamera
    persp.fov = 55 + kick.current * 9
    persp.updateProjectionMatrix()
    camera.position.set(0, 0, 1.0 - bg.progress * 2.2 - kick.current * 1.2)
    camera.lookAt(0, 0.2 + bg.progress * 0.6, -4)
  })

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[7, 7, 30, 72, 1, true]} />
        <shaderMaterial
          ref={mat}
          uniforms={useMemo(
            () => ({
              uTime: { value: 0 },
              uDrift: { value: 0 },
              uPulseT: { value: -10 },
              uCursor: { value: new THREE.Vector3(0.5, 0.5, -10) },
            }),
            [],
          )}
          vertexShader={VERT}
          fragmentShader={FRAG}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <CursorStamp cur={cur} />
    </group>
  )
}

/* stamps the live cursor point into the shared warp ref — movement only */
function CursorStamp({
  cur,
}: {
  cur: { current: THREE.Vector3 }
}) {
  const px = useRef(0)
  const py = useRef(0)
  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const nx = (px.current + 1) / 2
    const ny = (py.current + 1) / 2
    if (!reduced && Math.hypot(nx - cur.current.x, ny - cur.current.y) > 0.002) {
      cur.current.set(nx, ny, t)
    }
  })
  useEffect(() => {
    const mv = (e: PointerEvent) => {
      px.current = (e.clientX / window.innerWidth) * 2 - 1
      py.current = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', mv, { passive: true })
    return () => window.removeEventListener('pointermove', mv)
  }, [])
  return null
}
