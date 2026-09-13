import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* Enter-stage hero: wireframe terrain + particle torus, rotation tied to
   page scroll. Fog, bloom, vignette. */

function Terrain({ scroll }: { scroll: { v: number } }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.position.y = -2.6 + scroll.v * 1.2
    ref.current.rotation.z += delta * 0.008
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -2.6, -4]}>
      <planeGeometry args={[70, 70, 56, 56]} />
      <meshBasicMaterial color="#0e3a3a" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function Torus({ scroll, vel }: { scroll: { v: number }; vel: { v: number } }) {
  const ref = useRef<THREE.Points>(null!)
  const geom = useMemo(() => {
    const N = 2200
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2
      const v = Math.random() * Math.PI * 2
      const R = 3
      const r = 1
      pos[i * 3] = (R + r * Math.cos(v)) * Math.cos(u)
      pos[i * 3 + 1] = r * Math.sin(v)
      pos[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useEffect(() => () => geom.dispose(), [geom])
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.08 + scroll.v * Math.PI * 2
    ref.current.rotation.x = 0.5 + Math.sin(t * 0.1) * 0.06 + vel.v * 0.4
    ref.current.position.y = 0.6 + Math.sin(t * 0.4) * 0.08
    void delta
  })
  return (
    <points ref={ref} geometry={geom} frustumCulled={false}>
      <pointsMaterial color="#9CF5D3" size={0.035} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

function Dust() {
  const ref = useRef<THREE.Points>(null!)
  const geom = useMemo(() => {
    const N = 500
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = Math.random() * 10 - 3
      pos[i * 3 + 2] = -Math.random() * 25
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useEffect(() => () => geom.dispose(), [geom])
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.01
  })
  return (
    <points ref={ref} geometry={geom} frustumCulled={false}>
      <pointsMaterial color="#5c7a7a" size={0.03} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

export default function StageScene({
  scroll,
  vel,
  reduced,
}: {
  scroll: { v: number }
  vel: { v: number }
  reduced: boolean
}) {
  // bloom + vignette only where the GPU is likely to keep 60fps
  const [fx] = useState(() => window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768)
  // mobile pixel cap 1.25, desktop 1.5 — matches the 2D canvases
  const [dpr] = useState<[number, number]>(() =>
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 ? [1, 1.25] : [1, 1.5],
  )
  // offscreen pause: a viewport-fixed overlay is only ever truly offscreen
  // when the tab hides — pausing on hero-exit would freeze the torus that
  // shows through every later section (a visible regression, not a saving)
  const [live, setLive] = useState(true)
  useEffect(() => {
    const onVis = () => setLive(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  return (
    <div className="gl-fixed" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 120, position: [0, 2.2, 9] }}
        frameloop={reduced || !live ? 'never' : 'always'}
      >
        <color attach="background" args={['#06090F']} />
        <fogExp2 attach="fog" args={['#06090F', 0.03]} />
        <Terrain scroll={scroll} />
        <Torus scroll={scroll} vel={vel} />
        <Dust />
        {fx && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
            <Vignette offset={0.24} darkness={0.75} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
