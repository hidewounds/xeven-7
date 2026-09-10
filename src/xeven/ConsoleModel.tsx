import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { ScreenDriver } from './screen'
import { createScreenMaterial } from './screenShader'
import { spring } from './director'

export type Ctl = {
  open: { current: number }
  explode: { current: number }
  mem: { current: number }
  pressA: { current: number }
  pressB: { current: number }
  core: { current: number }
}

export const freshCtl = (): Ctl => ({
  open: { current: 0 },
  explode: { current: 0 },
  mem: { current: 0 },
  pressA: { current: 0 },
  pressB: { current: 0 },
  core: { current: 0 },
})

function Traces() {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    let s = 11
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < 30; i++) {
      const x = -1.25 + rnd() * 2.5
      const y = -2.4 + rnd() * 4.8
      const mx = x + (rnd() - 0.5) * 0.9
      pts.push(
        new THREE.Vector3(x, y, 0.05),
        new THREE.Vector3(mx, y, 0.05),
        new THREE.Vector3(mx, y, 0.05),
        new THREE.Vector3(mx, y + (rnd() - 0.3) * 1.4, 0.05),
      )
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#1f7a5c" transparent opacity={0.6} />
    </lineSegments>
  )
}

function Wire({ pts, color }: { pts: [number, number, number][]; color: string }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, 20, 0.022, 6, false)
  }, [pts])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  )
}

export default function ConsoleModel({
  screen,
  ctl,
  onA,
  onB,
}: {
  screen: ScreenDriver
  ctl: Ctl
  onA: () => void
  onB: () => void
}) {
  const front = useRef<THREE.Group>(null!)
  const shellBack = useRef<THREE.Group>(null!)
  const glass = useRef<THREE.Mesh>(null!)
  const pcb = useRef<THREE.Group>(null!)
  const memMeshL = useRef<THREE.Mesh>(null!)
  const memMeshR = useRef<THREE.Mesh>(null!)
  const memL = useRef<THREE.MeshStandardMaterial>(null!)
  const memR = useRef<THREE.MeshStandardMaterial>(null!)
  const core = useRef<THREE.Mesh>(null!)
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!)
  const btnA = useRef<THREE.Group>(null!)
  const btnB = useRef<THREE.Group>(null!)
  const ledMats = useRef<THREE.MeshStandardMaterial[]>([])
  const shader = useMemo(() => createScreenMaterial(screen.tex), [screen])
  const press = useRef({ a: 0, b: 0, va: 0, vb: 0 })
  // staggered mechanical state: each layer chases with its own spring
  const mech = useRef({ shell: 0, vs: 0, glass: 0, vg: 0, pcb: 0, vp: 0, lock: 0 })
  const wasExploded = useRef(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const dt = Math.min(0.05, clock.getDelta() || 0.016)
    const o = ctl.open.current
    const e = ctl.explode.current
    const closing = e < 0.06 && wasExploded.current
    // reassembly: snappier springs + lock flash, never a plain reverse
    const stiff = closing ? 95 : 34
    const damp = closing ? 11 : 8
    if (closing && e < 0.02) {
      wasExploded.current = false
      mech.current.lock = 1
      screen.pulse()
    }
    if (e > 0.4) wasExploded.current = true
    mech.current.lock = Math.max(0, mech.current.lock - dt * 2)
    // staggered chase: shell → glass → pcb settle
    const s1 = spring(mech.current.shell, mech.current.vs, o + e, stiff, damp, dt)
    const s2 = spring(mech.current.glass, mech.current.vg, o + e, stiff * 0.7, damp * 0.9, dt)
    const s3 = spring(mech.current.pcb, mech.current.vp, o + e, stiff * 1.5, damp * 1.2, dt)
    mech.current.shell = s1.x
    mech.current.vs = s1.v
    mech.current.glass = s2.x
    mech.current.vg = s2.v
    mech.current.pcb = s3.x
    mech.current.vp = s3.v
    const ms = mech.current.shell
    const mg2 = mech.current.glass
    const mp = mech.current.pcb
    front.current.position.set(e * 0.55, ms * 0.35 + e * 0.5, ms * 1.7 + e * 1.4)
    front.current.rotation.x = -ms * 0.12
    front.current.rotation.z = e * 0.06
    shellBack.current.position.set(-e * 0.4, -e * 0.9, -e * 1.1)
    shellBack.current.rotation.z = -e * 0.05
    glass.current.position.z = 0.585 + mg2 * 0.5 + e * 0.9
    pcb.current.position.z = -e * 0.7 + (1 - mp) * -0.3
    pcb.current.visible = mp > 0.02
    memMeshL.current.position.x = -0.55 - e * 1.0
    memMeshR.current.position.x = 0.55 + e * 0.55
    const glow = 0.25 + ctl.mem.current * 2.2 + Math.sin(t * 3) * 0.08 * ctl.mem.current
    memL.current.emissiveIntensity = glow
    memR.current.emissiveIntensity = glow * 0.9
    core.current.rotation.y = t * (0.6 + e * 2.2)
    core.current.rotation.x = t * 0.23
    core.current.scale.setScalar(0.6 + ctl.core.current * 0.9)
    core.current.position.y = 0.1 - e * 2.0
    coreMat.current.emissiveIntensity =
      1.1 + Math.sin(t * 2.2) * 0.25 + ctl.core.current + mech.current.lock * 2
    for (const k of ['a', 'b'] as const) {
      const target = k === 'a' ? ctl.pressA.current : ctl.pressB.current
      const vk = k === 'a' ? 'va' : 'vb'
      const r = spring(press.current[k], press.current[vk], target, 220, 14, dt)
      press.current[k] = r.x
      press.current[vk] = r.v
    }
    ctl.pressA.current *= 0.88
    ctl.pressB.current *= 0.88
    btnA.current.position.z = 0.62 - Math.max(0, press.current.a) * 0.1
    btnB.current.position.z = 0.62 - Math.max(0, press.current.b) * 0.1
    const beat = 0.6 + 0.4 * Math.sin(t * 2.4)
    const fl = Math.random() < 0.02 ? 0.5 : 0
    ledMats.current.forEach((m, i) => {
      m.emissiveIntensity = beat * (0.7 + i * 0.3) + screen.glow * 2 + fl + mech.current.lock * 2
    })
    shader.uniforms.uTime.value = t
    shader.uniforms.uGlow.value = screen.glow + mech.current.lock * 0.5
    shader.uniforms.uWipe.value = screen.wipe
    shader.uniforms.uFlick.value = Math.random() < 0.05 ? 0.3 : 0
  })

  return (
    <group>
      <group ref={shellBack}>
        <RoundedBox args={[3.4, 6.0, 0.55]} radius={0.2} smoothness={4} position={[0, 0, -0.28]}>
          <meshStandardMaterial color="#161a28" roughness={0.52} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0, 1.9, -0.02]}>
          <boxGeometry args={[3.42, 0.025, 0.5]} />
          <meshStandardMaterial color="#07090f" roughness={0.85} />
        </mesh>
        <mesh position={[0, -1.9, -0.02]}>
          <boxGeometry args={[3.42, 0.025, 0.5]} />
          <meshStandardMaterial color="#07090f" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.55, -0.3]}>
          <boxGeometry args={[1.7, 0.32, 0.2]} />
          <meshStandardMaterial color="#05070c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.55, -0.22]}>
          <boxGeometry args={[1.5, 0.12, 0.22]} />
          <meshStandardMaterial color="#232838" roughness={0.5} metalness={0.5} />
        </mesh>
        {[-1.1, -0.85, -0.6, 0.6, 0.85, 1.1].map((x, i) => (
          <mesh key={i} position={[x, 2.96, -0.28]}>
            <boxGeometry args={[0.14, 0.06, 0.4]} />
            <meshStandardMaterial color="#05070c" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0.7, -3.0, -0.28]}>
          <boxGeometry args={[0.5, 0.14, 0.3]} />
          <meshStandardMaterial color="#02040a" roughness={0.7} />
        </mesh>
        <mesh position={[0.7, -3.0, -0.2]}>
          <boxGeometry args={[0.56, 0.2, 0.06]} />
          <meshStandardMaterial color="#7a8195" roughness={0.3} metalness={1} />
        </mesh>
        <mesh position={[-1.74, 1.6, -0.1]}>
          <boxGeometry args={[0.1, 0.7, 0.3]} />
          <meshStandardMaterial color="#232838" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[-1.74, 0.7, -0.1]}>
          <boxGeometry args={[0.1, 0.34, 0.3]} />
          <meshStandardMaterial color="#2a3040" roughness={0.45} metalness={0.6} />
        </mesh>
      </group>

      <group ref={pcb} visible={false}>
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[2.9, 5.3, 0.07]} />
          <meshStandardMaterial color="#0b1812" roughness={0.65} metalness={0.25} />
        </mesh>
        <Traces />
        {[
          [-0.8, 1.6, 0.7, 0.5],
          [0.85, 0.9, 0.5, 0.6],
          [-0.7, -0.9, 0.6, 0.4],
          [0.7, -1.7, 0.8, 0.5],
          [0.1, 0.2, 0.45, 0.45],
        ].map(([x, y, sx, sy], i) => (
          <mesh key={i} position={[x, y, 0.2]}>
            <boxGeometry args={[sx, sy, 0.14]} />
            <meshStandardMaterial color="#101418" roughness={0.35} metalness={0.65} emissive="#0e2a3a" emissiveIntensity={0.4} />
          </mesh>
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={`mc${i}`} position={[-1.2 + (i % 7) * 0.4, 2.0 - Math.floor(i / 7) * 0.35, 0.18]}>
            <boxGeometry args={[0.16, 0.1, 0.1]} />
            <meshStandardMaterial color="#1c2028" roughness={0.4} metalness={0.7} />
          </mesh>
        ))}
        <mesh ref={memMeshL} position={[-0.55, -2.1, 0.28]}>
          <boxGeometry args={[0.95, 0.55, 0.24]} />
          <meshStandardMaterial ref={memL} color="#1a1206" roughness={0.5} emissive="#ffb84d" emissiveIntensity={0.25} />
        </mesh>
        <mesh ref={memMeshR} position={[0.55, -2.1, 0.28]}>
          <boxGeometry args={[0.95, 0.55, 0.24]} />
          <meshStandardMaterial ref={memR} color="#1a1206" roughness={0.5} emissive="#ffb84d" emissiveIntensity={0.25} />
        </mesh>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 2.45, 0.18]}>
            <boxGeometry args={[0.18, 0.3, 0.1]} />
            <meshStandardMaterial color="#8a6a2a" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        <Wire pts={[[-1.1, 2.2, 0.2], [-0.4, 1.4, 0.35], [-0.8, 0.4, 0.25]]} color="#7a2b2b" />
        <Wire pts={[[1.1, 2.2, 0.2], [0.5, 1.2, 0.35], [0.85, 0.2, 0.25]]} color="#2b4a7a" />
        <Wire pts={[[-0.2, -2.4, 0.2], [0.1, -1.4, 0.4], [-0.3, -0.5, 0.3]]} color="#6a6a2a" />
        <mesh ref={core} position={[0, 0.1, 0.35]}>
          <octahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial ref={coreMat} color="#06121a" roughness={0.25} metalness={0.4} emissive="#5fd8ff" emissiveIntensity={1.2} />
        </mesh>
      </group>

      <group ref={front}>
        <RoundedBox args={[3.4, 6.0, 0.42]} radius={0.2} smoothness={4} position={[0, 0, 0.28]}>
          <meshPhysicalMaterial color="#9fb4dd" transparent opacity={0.16} roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.1} depthWrite={false} />
        </RoundedBox>
        <mesh position={[0, 1.35, 0.5]}>
          <boxGeometry args={[2.9, 2.7, 0.12]} />
          <meshStandardMaterial color="#05060c" roughness={0.5} metalness={0.35} />
        </mesh>
        <mesh position={[0, 1.35, 0.57]}>
          <planeGeometry args={[2.62, 2.42]} />
          <primitive object={shader.material} attach="material" />
        </mesh>
        <mesh ref={glass} position={[0, 1.35, 0.585]}>
          <planeGeometry args={[2.62, 2.42]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.07} roughness={0.05} metalness={0} depthWrite={false} />
        </mesh>

        <group position={[-0.95, -1.35, 0.55]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 24]} />
            <meshStandardMaterial color="#101420" roughness={0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.78, 0.24, 0.12]} />
            <meshStandardMaterial color="#242b3f" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.24, 0.78, 0.12]} />
            <meshStandardMaterial color="#242b3f" roughness={0.7} metalness={0.2} />
          </mesh>
        </group>

        <group ref={btnA} position={[1.05, -1.1, 0.62]} onClick={(e) => { e.stopPropagation(); onA() }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.12, 24]} />
            <meshStandardMaterial color="#6e2730" roughness={0.55} emissive="#ff4d5e" emissiveIntensity={0.12} />
          </mesh>
        </group>
        <group ref={btnB} position={[0.62, -1.62, 0.62]} onClick={(e) => { e.stopPropagation(); onB() }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.12, 24]} />
            <meshStandardMaterial color="#27334d" roughness={0.55} emissive="#4d8aff" emissiveIntensity={0.12} />
          </mesh>
        </group>

        {[-0.25, 0.25].map((x, i) => (
          <mesh key={i} position={[x, -2.35, 0.52]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.34, 0.1, 0.06]} />
            <meshStandardMaterial color="#20263a" roughness={0.6} />
          </mesh>
        ))}

        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 2.82, 0.5]}>
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial
              ref={(m) => {
                if (m) ledMats.current[i] = m
              }}
              color="#061014"
              emissive={i === 1 ? '#ffb84d' : '#5fd8ff'}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}

        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[-0.9 + (i % 6) * 0.16, -2.35 - Math.floor(i / 6) * 0.16, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.05, 8]} />
            <meshStandardMaterial color="#020306" roughness={0.9} />
          </mesh>
        ))}

        {[
          [-1.45, 2.7],
          [1.45, 2.7],
          [-1.45, -2.7],
          [1.45, -2.7],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
            <meshStandardMaterial color="#8a91a5" roughness={0.28} metalness={1} />
          </mesh>
        ))}

        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * 1.1, 3.02, 0]}>
            <boxGeometry args={[1.1, 0.14, 0.5]} />
            <meshStandardMaterial color="#3a4152" roughness={0.35} metalness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
