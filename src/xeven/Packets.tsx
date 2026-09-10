import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type PacketMode = 'off' | 'memory' | 'arch'

const MEM_PTS: [number, number, number][] = [
  [1.2, 2.45, 0.4],
  [0.5, 1.0, 0.55],
  [-0.2, -1.0, 0.55],
  [-0.55, -2.1, 0.7],
  [0.0, 1.35, 1.5],
]

/** signature animation: contextual packets port → trace → memory → screen */
export default function Packets({
  mode,
  weight,
  onMemoryHit,
}: {
  mode: PacketMode
  weight: { current: number }
  onMemoryHit: () => void
}) {
  const group = useRef<THREE.Group>(null!)
  const dots = useRef<THREE.Mesh[]>([])
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  const lastCyc = useRef<number[]>([0, 0, 0, 0])
  const memCurve = useMemo(
    () => new THREE.CatmullRomCurve3(MEM_PTS.map((p) => new THREE.Vector3(...p))),
    [],
  )
  const memLine = useMemo(() => new THREE.BufferGeometry().setFromPoints(memCurve.getPoints(60)), [memCurve])
  const archLine = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.2, 3.0, 0), new THREE.Vector3(2.2, -3.0, 0)])
    return g
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const w = weight.current
    group.current.visible = w > 0.02
    const speed = mode === 'arch' ? 0.1 : 0.16
    for (let i = 0; i < 4; i++) {
      const cyc = (t * speed + i * 0.25) % 1
      const m = dots.current[i]
      if (!m) continue
      if (mode === 'arch') {
        m.position.set(2.2, 3.6 - cyc * 7.2, Math.sin((cyc * 6.28 + i) * 1.0) * 0.3)
      } else {
        const e = cyc < 0.8 ? cyc / 0.8 : 1
        m.position.copy(memCurve.getPoint(e * e * (3 - 2 * e)))
      }
      const s = 0.055 + Math.sin(cyc * Math.PI) * 0.045
      m.scale.setScalar(Math.max(0.01, s * 2))
      mats.current[i].opacity = w * Math.sin(Math.min(1, cyc * 3) * Math.PI * 0.5 + 0.2)
      if (mode === 'memory' && lastCyc.current[i] < 0.86 && cyc >= 0.86 && w > 0.5) onMemoryHit()
      lastCyc.current[i] = cyc
    }
  })

  return (
    <group ref={group} visible={false}>
      {mode !== 'off' && mode === 'memory' && (
        <lineSegments geometry={memLine}>
          <lineBasicMaterial color="#2a6a55" transparent opacity={0.5} />
        </lineSegments>
      )}
      {mode === 'arch' && (
        <lineSegments geometry={archLine}>
          <lineBasicMaterial color="#3a5a9a" transparent opacity={0.35} />
        </lineSegments>
      )}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) dots.current[i] = m
          }}
        >
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) mats.current[i] = m
            }}
            color={i % 2 === 0 ? '#8fe8ff' : '#ffcf7a'}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
