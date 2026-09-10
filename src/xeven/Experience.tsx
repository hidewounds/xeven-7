import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import ConsoleModel, { type Ctl } from './ConsoleModel'
import Particles, { type PUniforms } from './Particles'
import Packets, { type PacketMode } from './Packets'
import type { ScreenDriver, ScreenMode } from './screen'
import { PHASES } from './content'
import {
  CAM_LOOK,
  CAM_POS,
  DUTCH,
  clamp01,
  consoleState,
  lerp,
  lightState,
  particleState,
  pathS,
  pathV,
  seg,
  spring,
  type PerfTier,
} from './director'

export type Shared = {
  progress: { current: number }
  velocity: { current: number }
  mouse: { current: { x: number; y: number } }
  screen: ScreenDriver
  ctl: Ctl
  reduced: boolean
}

function modeFor(p: number): ScreenMode {
  if (p < PHASES.understand) return 'boot'
  if (p < PHASES.memory) return 'terminal'
  if (p < PHASES.personal) return 'memory'
  if (p < PHASES.business) return 'web'
  if (p < PHASES.patterns) return 'terminal'
  if (p < PHASES.arch) return 'pattern'
  if (p < 0.985) return 'layers'
  return 'final'
}

function Rig({ s, mobile, tier, onSlow }: { s: Shared; mobile: boolean; tier: PerfTier; onSlow: () => void }) {
  const group = useRef<THREE.Group>(null!)
  const look = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -1), [])
  const damp = useRef({ x: 0, y: 0 })
  const springSt = useRef({ open: 0, vo: 0, ex: 0, ve: 0 })
  const fpsAcc = useRef({ sum: 0, n: 0 })
  const { camera, gl } = useThree()
  const pUniforms = useMemo<PUniforms>(
    () => ({
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uW: { value: new THREE.Vector3(1, 0, 0) },
      uRing: { value: 0 },
      uBoost: { value: 0 },
      uCalm: { value: 0.25 },
      uCursor: { value: new THREE.Vector3(0, 0, 0) },
      uPixelRatio: { value: gl.getPixelRatio() },
    }),
    [gl],
  )
  const rim = useRef<THREE.DirectionalLight>(null!)
  const key = useRef<THREE.DirectionalLight>(null!)
  const screenLight = useRef<THREE.PointLight>(null!)
  const pktWeight = useRef(0)
  const pmodeRef = useRef<PacketMode>('off')
  const [pmode, setPmode] = useState<PacketMode>('off')
  const pCount = tier === 'high' ? 1400 : tier === 'medium' ? 800 : 350

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(0.05, rawDt)
    const t = clock.getElapsedTime()
    const p = clamp01(s.progress.current)
    const vel = s.velocity.current
    const mx = s.mouse.current.x
    const my = s.mouse.current.y
    const R = s.reduced ? 0 : 1
    damp.current.x += (mx - damp.current.x) * (s.reduced ? 1 : 0.06)
    damp.current.y += (my - damp.current.y) * (s.reduced ? 1 : 0.06)
    const dx = damp.current.x
    const dy = damp.current.y

    // FPS monitor → auto-degrade
    if (tier === 'high') {
      fpsAcc.current.sum += rawDt
      fpsAcc.current.n++
      if (fpsAcc.current.n >= 150) {
        if (fpsAcc.current.sum / fpsAcc.current.n > 0.024) onSlow()
        fpsAcc.current.sum = 0
        fpsAcc.current.n = 0
      }
    }

    const m = modeFor(p)
    if (m !== 'demo') s.screen.setMode(m)
    const cs = consoleState(p)

    // spring-driven shell: overshoot + settle, never linear
    const so = spring(springSt.current.open, springSt.current.vo, cs.open, 42, 9, dt)
    springSt.current.open = so.x
    springSt.current.vo = so.v
    const se = spring(springSt.current.ex, springSt.current.ve, cs.explode, 30, 8, dt)
    springSt.current.ex = se.x
    springSt.current.ve = se.v
    s.ctl.open.current = so.x
    s.ctl.explode.current = se.x
    s.ctl.mem.current += (cs.mem - s.ctl.mem.current) * 0.08
    s.ctl.core.current += (cs.core - s.ctl.core.current) * 0.07

    // alive motion: breathing + drift, never a plain turntable
    const breathe = s.reduced ? 0 : Math.sin(t * 0.7) * 0.02
    const yaw =
      cs.yawBase + dx * 0.28 * R + (s.reduced ? 0 : Math.sin(t * 0.23) * 0.05)
    group.current.rotation.set(-0.06 + dy * -0.16 * R + breathe, yaw, 0.05 + dx * 0.05 * R)
    group.current.scale.setScalar(Math.max(0.4, cs.scale))
    group.current.position.y = (s.reduced ? 0 : Math.sin(t * 0.8) * 0.07) + (p > 0.28 && p < 0.42 ? -0.5 : 0)
    group.current.position.x = cs.posX * (mobile ? 0.3 : 1)

    // camera journey with dutch tilt in architecture
    const cp = pathV(p, CAM_POS)
    const cl = pathV(p, CAM_LOOK)
    const mScale = mobile ? 0.45 : 1
    camera.position.lerp(tmp.set(cp[0] * mScale + dx * 0.7 * R, cp[1] + dy * -0.45 * R, cp[2]), s.reduced ? 1 : 0.06)
    look.lerp(tmp.set(cl[0], cl[1], cl[2]), 0.09)
    camera.lookAt(look)
    camera.rotation.z += pathS(p, DUTCH) * R

    // lighting choreography + cursor-traveling reflections
    const lights = lightState(p)
    rim.current.position.set(-5 + dx * 4 * R, 3 + dy * 2 * R, 4)
    rim.current.intensity = lights[1] + s.screen.glow * 1.2
    key.current.intensity = lights[0]

    // particles: phase weights + scroll-velocity energy
    const [flow, ring, boost] = particleState(p, vel)
    pUniforms.uFlow.value = flow * R
    pUniforms.uRing.value = ring * R
    pUniforms.uBoost.value = boost * R
    pUniforms.uCalm.value = lerp(0.22, 1.0, seg(p, 0.05, 0.16)) * (0.35 + 0.65 * R)
    const w = pUniforms.uW.value
    w.set(seg(p, 0.1, 0.18), seg(p, 0.28, 0.36) + seg(p, 0.83, 0.89) * 0.6, seg(p, 0.42, 0.5) + seg(p, 0.55, 0.65) * 0.7).normalize()
    ndc.set(mx, my)
    ray.setFromCamera(ndc, camera)
    const hit = ray.ray.intersectPlane(plane, tmp)
    if (hit) pUniforms.uCursor.value.copy(hit)

    // packet system: memory run, then architecture connections
    const memW = seg(p, 0.3, 0.35) * (1 - seg(p, 0.48, 0.54))
    const archW = seg(p, 0.83, 0.87) * (1 - seg(p, 0.93, 0.97))
    const nm: PacketMode = memW > archW ? (memW > 0.02 ? 'memory' : 'off') : archW > 0.02 ? 'arch' : 'off'
    if (nm !== pmodeRef.current) {
      pmodeRef.current = nm
      setPmode(nm)
    }
    pktWeight.current += (Math.max(memW, archW) - pktWeight.current) * 0.1

    // screen is a light source: shell and surroundings breathe with it
    screenLight.current.intensity = 4 + s.screen.glow * 12 + seg(p, 0.4, 0.5) * 6

    s.screen.tick(dt)
  })

  return (
    <>
      <directionalLight ref={key} position={[4, 6, 6]} intensity={0.3} color="#dfe8ff" />
      <directionalLight ref={rim} position={[-5, 3, 4]} intensity={0.5} color="#8fb4ff" />
      <pointLight ref={screenLight} position={[0, 0.5, 4]} intensity={4} color="#4d7dff" />
      <ambientLight intensity={0.12} />
      {/* local reflections — no network HDR */}
      <Environment resolution={64}>
        <Lightformer intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} color="#cdd8ff" />
        <Lightformer intensity={1.1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#7fa0ff" />
        <Lightformer intensity={0.7} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[5, 1.5, 1]} color="#4d5a80" />
      </Environment>
      {/* invisible stage: faint grid + grounding shadow */}
      <Grid position={[0, -3.6, 0]} args={[40, 40]} cellSize={1} cellThickness={0.5} cellColor="#0a0e20" sectionSize={5} sectionThickness={1} sectionColor="#141a36" fadeDistance={22} fadeStrength={3} infiniteGrid />
      <ContactShadows position={[0, -3.55, 0]} opacity={0.55} scale={14} blur={2.6} far={6} color="#000000" />
      <group ref={group}>
        <ConsoleModel
          screen={s.screen}
          ctl={s.ctl}
          onA={() => {
            s.ctl.pressA.current = 1
            s.screen.ask('Recommend something.')
          }}
          onB={() => {
            s.ctl.pressB.current = 1
            s.screen.ask("What's my size?")
          }}
        />
      </group>
      <Particles count={pCount} uniforms={pUniforms} />
      <Packets
        mode={pmode}
        weight={pktWeight}
        onMemoryHit={() => {
          s.ctl.mem.current = Math.min(1.6, s.ctl.mem.current + 0.45)
          s.screen.pulse()
        }}
      />
    </>
  )
}

export default function Experience({
  s,
  tier,
  onSlow,
}: {
  s: Shared
  tier: PerfTier
  onSlow: () => void
}) {
  const mobile = useMemo(() => window.innerWidth < 760, [])
  const dpr: [number, number] = tier === 'high' ? [1, 1.75] : tier === 'medium' ? [1, 1.25] : [1, 1]
  return (
    <Canvas
      gl={{ antialias: tier !== 'low', alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.8, 19], fov: 40, near: 0.1, far: 200 }}
      dpr={dpr}
    >
      <color attach="background" args={['#020306']} />
      <fog attach="fog" args={['#020306', 18, 46]} />
      <Suspense fallback={null}>
        <Rig s={s} mobile={mobile} tier={tier} onSlow={onSlow} />
      </Suspense>
      {tier !== 'low' && (
        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.22} luminanceSmoothing={0.25} />
          <Noise opacity={0.05} />
          <Vignette darkness={0.5} offset={0.2} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
