import { Canvas } from '@react-three/fiber'
import { ContactShadows, Float, Stars } from '@react-three/drei'

/* R3FDemo — smoke-test scene for the MIT alt-stack
 * (@react-three/fiber + @react-three/drei + @react-three/postprocessing).
 * Everything here is procedural (no network fetches at runtime), DPR-capped,
 * and additive: nothing in the existing app imports this file yet.
 */
export default function R3FDemo() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.2, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <spotLight position={[4, 6, 4]} angle={0.4} intensity={1.2} />
      <Stars radius={40} depth={20} count={1500} factor={3} fade speed={0.6} />
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.1}>
        <mesh>
          <torusKnotGeometry args={[0.9, 0.28, 128, 32]} />
          <meshStandardMaterial color="#9cf5d3" roughness={0.25} metalness={0.75} />
        </mesh>
      </Float>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.55} scale={8} blur={2.2} far={3} />
    </Canvas>
  )
}
