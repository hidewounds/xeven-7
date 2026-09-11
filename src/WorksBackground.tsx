import { useMemo, useRef } from 'react'
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

float gridLine(vec2 g) {
  vec2 d = min(g, 1.0 - g);
  return 1.0 - smoothstep(0.0, 0.035, min(d.x, d.y));
}

void main() {
  // black graph wrapping the tube wall, sliding down with scroll
  vec2 uv = vec2(vUv.x * 1.0, vUv.y * 3.0 + uDrift);

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

  // halftone dot grain on the wall surface
  vec2 hg = fract(vUv * vec2(180.0, 90.0)) - 0.5;
  col += vec3(0.5) * smoothstep(0.25, 0.08, length(hg)) * 0.03 * fog;

  // soft glow band sweeping down the wall on every snap
  float age = max(uTime - uPulseT, 0.0);
  float sweepY = 1.0 - age * 0.8;
  float sweepD = (vUv.y - sweepY) * 7.0;
  float band = exp(-sweepD * sweepD) * exp(-age * 1.4);
  col += vec3(0.35, 0.38, 0.45) * band * 0.5;

  // vignette + grain in screen space (locked to frame, not the wall)
  vec2 ndc = vClip.xy / vClip.w * 0.5 + 0.5;
  float d = distance(ndc, vec2(0.5, 0.46));
  col *= mix(0.3, 1.0, smoothstep(0.85, 0.2, d));
  col += (fract(sin(dot(ndc * 913.0 + fract(uTime) * 7.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.05;

  gl_FragColor = vec4(col, 1.0);
}
`

function Tube({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: 0 },
      uPulseT: { value: -10 },
    }),
    [],
  )
  const drift = useRef(0)
  const rot = useRef(0)
  const prevPulse = useRef(0)

  useFrame(({ clock, camera }) => {
    const t = reduced ? 0 : clock.getElapsedTime()
    const targetDrift = bg.progress * 2 + (reduced ? 0 : t * 0.01)
    drift.current += (targetDrift - drift.current) * 0.08
    rot.current += (bg.progress * 0.6 + (reduced ? 0 : t * 0.015) - rot.current) * 0.06
    if (bg.pulse !== prevPulse.current) {
      prevPulse.current = bg.pulse
      uniforms.uPulseT.value = t
    }
    uniforms.uTime.value = t
    uniforms.uDrift.value = drift.current
    group.current.rotation.y = rot.current
    camera.position.set(0, 0, 1.0)
    camera.lookAt(0, 0.2, -4)
  })

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[7, 7, 30, 72, 1, true]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function WorksBackground({ bg, reduced }: { bg: BgState; reduced: boolean }) {
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
      <Prism bg={bg} reduced={reduced} />
    </Canvas>
  )
}

/* translucent triangular prism — the hero object */
function Prism({ bg, reduced }: { bg: BgState; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!)
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
    const h = bg.hero
    group.current.rotation.y = t * 0.12
    group.current.rotation.x = Math.sin(t * 0.3) * 0.08
    group.current.position.y = 0.2 - h * 4 + Math.sin(t * 0.8) * 0.1
    const sc = Math.max(0.01, 1 - h * 0.45)
    group.current.scale.setScalar(sc)
    mat.current.opacity = 1 - h
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

/* zebra ribbons drifting behind the prism */
function Bands({ bg, reduced }: { bg: BgState; reduced: boolean }) {
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
    const speed = Math.min(Math.abs(bg.velocity) * 0.15, 0.4)
    flow.current += (reduced ? 0 : dt * (0.03 + speed))
    const strength = (1 - bg.hero * 0.75) * 0.5
    for (const m of mats) {
      m.uniforms.uFlow.value = flow.current
      m.uniforms.uStrength.value = strength
    }
  })

  return (
    <>
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
    </>
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
