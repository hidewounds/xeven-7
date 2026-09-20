import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { xs } from '../app/store'
import type { Route } from '../app/store'

/* SHIFTWORLD — the persistent field for the Living Shift. One canvas, one
 * ticker, every route. A concave diamond lattice (baked once per resize)
 * carries seven station beacons (one per route stop); data packets run the
 * rails between them, stirred faster by pointer velocity and dead at rest.
 * Each route retints the haze. Discipline inherited: DPR caps, 6s idle
 * sleep, hidden-tab pause, single-frame reduced stand-down, full dispose.
 */

const VOID = new THREE.Color(0x06090f)
const HALF = 14
const GAP = 0.5
const BOW = 2.2
const IDLE_MS = 6000
const PACKETS = 120

const ROUTES: Route[] = ['enter', 'worlds', 'playground', 'about', 'features', 'pricing', 'demo']

// per-route haze tint + packet accent
const TINTS: Record<Route, { fog: number; accent: number }> = {
  enter: { fog: 0x06090f, accent: 0x9cf5d3 },
  worlds: { fog: 0x0d0a08, accent: 0xff4d2e },
  playground: { fog: 0x06120e, accent: 0x9cf5d3 },
  about: { fog: 0x0a0d12, accent: 0xe8edee },
  features: { fog: 0x081114, accent: 0x9cf5d3 },
  pricing: { fog: 0x100d08, accent: 0xfff8e6 },
  demo: { fog: 0x06120e, accent: 0x9cf5d3 },
}

const STOPS: Record<Route, [number, number, number]> = {
  enter: [0, 1.4, 9.5],
  worlds: [-3.2, 0.8, 8.2],
  playground: [3.2, 0.8, 8.2],
  about: [0, 2.2, 10.5],
  features: [-2.2, 1.2, 9.0],
  pricing: [2.2, 1.2, 9.0],
  demo: [0, 0.6, 7.6],
}

function bowed(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z) / (HALF * 1.42)
  return -BOW * (1 - r * r)
}

export default function ShiftWorld() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
    const coarse = window.matchMedia('(pointer: coarse)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.65))
    renderer.setClearColor(VOID, 1)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(VOID.getHex(), 0.028)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120)
    camera.position.set(...STOPS[xs.route])

    scene.add(new THREE.AmbientLight(0x8899aa, 0.5))
    const key = new THREE.DirectionalLight(0x9cf5d3, 0.9)
    key.position.set(4, 7, 5)
    scene.add(key)

    // baked lattice: one static draw
    const lattice = new THREE.Group()
    const buildLattice = () => {
      lattice.clear()
      const pts: number[] = []
      const n = Math.floor((HALF * 2) / GAP)
      for (let i = 0; i <= n; i++) {
        const c = -HALF + i * GAP
        pts.push(c, bowed(c, -HALF), -HALF, c, bowed(c, HALF), HALF)
        pts.push(-HALF, bowed(-HALF, c), c, HALF, bowed(HALF, c), c)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      const m = new THREE.LineBasicMaterial({ color: 0x2a3a40, transparent: true, opacity: 0.55 })
      const lines = new THREE.LineSegments(g, m)
      lines.position.y = -1.6
      lattice.add(lines)
    }
    buildLattice()
    scene.add(lattice)

    // starfield
    const starGeo = new THREE.BufferGeometry()
    {
      const n = coarse ? 500 : 1100
      const pos = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 90
        pos[i * 3 + 1] = Math.random() * 30 - 6
        pos[i * 3 + 2] = -Math.random() * 60 - 4
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    }
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xcfd8da, size: 0.055, transparent: true, opacity: 0.8, sizeAttenuation: true }),
    )
    scene.add(stars)

    // seven station beacons on an arc
    const stations: THREE.Vector3[] = ROUTES.map((_, i) => {
      const a = (i / (ROUTES.length - 1) - 0.5) * Math.PI * 0.9
      return new THREE.Vector3(Math.sin(a) * 11, 0.4 + Math.cos(a * 2) * 0.5, -6 - Math.cos(a) * 3)
    })
    const beaconGeo = new THREE.SphereGeometry(0.14, 12, 12)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x9cf5d3, transparent: true, opacity: 0.9 })
    const beacons = new THREE.InstancedMesh(beaconGeo, beaconMat, stations.length)
    {
      const d = new THREE.Object3D()
      stations.forEach((s, i) => {
        d.position.copy(s)
        d.updateMatrix()
        beacons.setMatrixAt(i, d.matrix)
      })
    }
    scene.add(beacons)

    // packets: instanced diamonds running station-to-station
    const packGeo = new THREE.OctahedronGeometry(0.07)
    const packMat = new THREE.MeshBasicMaterial({ color: 0x9cf5d3, transparent: true, opacity: 0.85 })
    const packs = new THREE.InstancedMesh(packGeo, packMat, PACKETS)
    scene.add(packs)
    const packState = Array.from({ length: PACKETS }, () => ({
      a: Math.floor(Math.random() * stations.length),
      b: Math.floor(Math.random() * stations.length),
      t: Math.random(),
      speed: 0.12 + Math.random() * 0.22,
      ember: Math.random() < 0.25,
    }))
    const dummy = new THREE.Object3D()
    const tmpColor = new THREE.Color()
    const mint = new THREE.Color(0x9cf5d3)
    const ember = new THREE.Color(0xff4d2e)

    // pointer stir: velocity only, dead at rest
    let px = 0
    let stir = 0
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      stir = Math.min(1, stir + Math.abs(nx - px) * 3)
      px = nx
    }
    window.addEventListener('pointermove', onMove)

    const fogTarget = new THREE.Color(TINTS[xs.route].fog)
    const accentTarget = new THREE.Color(TINTS[xs.route].accent)
    const camTarget = new THREE.Vector3(...STOPS[xs.route])

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    let lastInput = performance.now()
    let raf = 0
    let alive = true
    const wake = () => {
      lastInput = performance.now()
    }
    window.addEventListener('pointerdown', wake)
    window.addEventListener('wheel', wake, { passive: true })
    const onVis = () => {
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onVis)

    const clockT = { t: 0 }

    const frame = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!document.hidden && now - lastInput < IDLE_MS) {
        clockT.t += dt
        // route retint + waypoint glide (interruptible lerp)
        const tint = TINTS[xs.route]
        fogTarget.set(tint.fog)
        accentTarget.set(tint.accent)
        camTarget.set(...STOPS[xs.route])
        ;(scene.fog as THREE.FogExp2).color.lerp(fogTarget, 1 - Math.pow(0.002, dt))
        renderer.setClearColor((scene.fog as THREE.FogExp2).color, 1)
        beaconMat.color.lerp(accentTarget, 1 - Math.pow(0.002, dt))
        camera.position.lerp(camTarget, 1 - Math.pow(0.01, dt))
        camera.lookAt(0, 0.4, -4)

        // packets
        stir = Math.max(0, stir - dt * 1.4)
        const boost = 1 + stir * 2.2
        for (let i = 0; i < PACKETS; i++) {
          const p = packState[i]
          p.t += dt * p.speed * boost
          if (p.t >= 1) {
            p.t = 0
            p.a = p.b
            p.b = Math.floor(Math.random() * stations.length)
          }
          const A = stations[p.a]
          const B = stations[p.b]
          dummy.position.lerpVectors(A, B, p.t)
          dummy.position.y += Math.sin(p.t * Math.PI) * 1.1 + Math.sin(clockT.t * 2 + i) * 0.05
          dummy.rotation.y = clockT.t * 2 + i
          dummy.updateMatrix()
          packs.setMatrixAt(i, dummy.matrix)
          packs.setColorAt(i, tmpColor.copy(p.ember ? ember : mint))
        }
        packs.instanceMatrix.needsUpdate = true
        if (packs.instanceColor) packs.instanceColor.needsUpdate = true

        // beacon breathing
        const s = 1 + Math.sin(clockT.t * 1.6) * 0.18
        beacons.scale.setScalar(s)
        stars.rotation.y = clockT.t * 0.004

        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }

    if (xs.reduced) {
      // single static frame, then stand down
      camera.lookAt(0, 0.4, -4)
      renderer.render(scene, camera)
    } else {
      raf = requestAnimationFrame(frame)
    }

    ;(window as unknown as { __shiftworld?: object }).__shiftworld = { scene, camera, stations }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('wheel', wake)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} className="world-fixed" aria-hidden="true" />
}
