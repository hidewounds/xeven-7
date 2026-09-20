import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { xs } from '../app/store'
import type { Route } from '../app/store'

/* SHIFTWORLD II — the merged field. VoidWorld's soul (instanced diamond
 * panels with in-shader hairlines, breathing shimmer, RGB channel tint,
 * fingertip air, liquid press, roaming cinema) fused with ShiftWorld's body
 * (station beacons, packet rails, per-route retint, waypoint camera).
 * New: three drifting blob glows living inside the panel shader, gently
 * repelled by the pointer. Discipline kept: DPR caps, 6s idle sleep,
 * hidden-tab pause, single-frame reduced stand-down, full dispose,
 * context-loss handling, zero CPU per frame for the field itself. */

const VOID = new THREE.Color(0x06090f)
const HALF = 14
const GAP = 0.5
const BOW = 2.2
const IDLE_MS = 6000
const PACKETS = 110

const ROUTES: Route[] = ['enter', 'worlds', 'about', 'features', 'pricing', 'demo']

const TINTS: Record<Route, { fog: number; accent: number }> = {
  enter: { fog: 0x06090f, accent: 0x4df3ff },
  worlds: { fog: 0x0d0a08, accent: 0xff6fae },
  about: { fog: 0x0a0d12, accent: 0xe8edee },
  features: { fog: 0x081114, accent: 0x4df3ff },
  pricing: { fog: 0x100d08, accent: 0xfff8e6 },
  demo: { fog: 0x06120e, accent: 0x4df3ff },
}

const STOPS: Record<Route, [number, number, number]> = {
  enter: [0, 1.4, 9.5],
  worlds: [-3.2, 0.8, 8.2],
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
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduced = xs.reduced
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, alpha: false, powerPreference: 'low-power' })
    } catch {
      canvas.style.display = 'none'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.65))
    renderer.setClearColor(VOID, 1)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(VOID.getHex(), 0.03)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120)
    camera.position.set(...STOPS[xs.route])

    scene.add(new THREE.AmbientLight(0x8899aa, 0.5))
    const key = new THREE.DirectionalLight(0x4df3ff, 0.9)
    key.position.set(4, 7, 5)
    scene.add(key)

    // ---- baked lattice rails (one static draw) ----
    const lattice = new THREE.Group()
    {
      const pts: number[] = []
      const n = Math.floor((HALF * 2) / GAP)
      for (let i = 0; i <= n; i++) {
        const c = -HALF + i * GAP
        pts.push(c, bowed(c, -HALF), -HALF, c, bowed(c, HALF), HALF)
        pts.push(-HALF, bowed(-HALF, c), c, HALF, bowed(HALF, c), c)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      const lines = new THREE.LineSegments(
        g,
        new THREE.LineBasicMaterial({ color: 0x2a3a40, transparent: true, opacity: 0.55 }),
      )
      lines.position.y = -1.6
      lines.frustumCulled = false
      lattice.add(lines)
    }
    scene.add(lattice)

    // ---- instanced diamond panels: all life in-shader ----
    const QUAD = 1.6
    const CELLS = Math.floor((2 * HALF) / QUAD)
    const NQ = CELLS * CELLS
    const quadGeo = new THREE.PlaneGeometry(1, 1)
    {
      const aSeed = new Float32Array(NQ)
      const aQI = new Float32Array(NQ)
      const aQJ = new Float32Array(NQ)
      for (let bj = 0; bj < CELLS; bj++) {
        for (let bi = 0; bi < CELLS; bi++) {
          const i = bj * CELLS + bi
          aSeed[i] = Math.random()
          aQI[i] = bi
          aQJ[i] = bj
        }
      }
      quadGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1))
      quadGeo.setAttribute('aQI', new THREE.InstancedBufferAttribute(aQI, 1))
      quadGeo.setAttribute('aQJ', new THREE.InstancedBufferAttribute(aQJ, 1))
    }
    const quadUniforms = {
      uTime: { value: 0 },
      uTrail: { value: Array.from({ length: 5 }, () => new THREE.Vector3(9999, 9999, 0)) },
      uWakeVel: { value: new THREE.Vector2(0, 0) },
      uVel: { value: 0 },
      uShowcase: { value: 1 },
      uVoid: { value: new THREE.Vector3(0.0235, 0.0353, 0.0588) },
      uThemeAmt: { value: 0.22 },
      uDrift: { value: reduced ? 0 : 1 },
      uBlobs: {
        value: [
          new THREE.Vector4(-6, 1, 5.5, 0),
          new THREE.Vector4(6, -1, 6.5, 1),
          new THREE.Vector4(0, 3, 5.0, 2),
        ],
      },
    }
    const quadMat = new THREE.ShaderMaterial({
      uniforms: quadUniforms,
      vertexShader: `
        attribute float aSeed;
        attribute float aQI;
        attribute float aQJ;
        varying vec2 vUv;
        varying vec3 vWorld;
        varying float vSeed;
        varying float vQI;
        varying float vQJ;
        void main() {
          vUv = uv;
          vSeed = aSeed;
          vQI = aQI;
          vQJ = aQJ;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uTrail[5];
        uniform vec2 uWakeVel;
        uniform float uVel;
        uniform float uShowcase;
        uniform vec3 uVoid;
        uniform float uThemeAmt;
        uniform float uDrift;
        uniform vec4 uBlobs[3];
        varying vec2 vUv;
        varying vec3 vWorld;
        varying float vSeed;
        varying float vQI;
        varying float vQJ;
        float hash(float n) { return fract(sin(n) * 43758.5453); }
        void main() {
          vec3 col = vec3(0.008, 0.009, 0.012);
          // hairline borders: definition only, never glow
          vec2 e = fwidth(vUv);
          vec2 b = min(vUv, 1.0 - vUv);
          float bl = max(
            1.0 - smoothstep(0.0, e.x * 1.5 + 1e-4, b.x),
            1.0 - smoothstep(0.0, e.y * 1.5 + 1e-4, b.y));
          col += vec3(1.0) * bl * 0.16;
          // breathing shimmer, scroll-kindled
          float wave = 0.03 + 0.04 * (0.5 + 0.5 * sin(uTime * 1.5 - (vWorld.x * 0.14 + vWorld.y * 0.05) + vSeed * 6.28));
          float glow = wave * (1.0 + uVel * 0.3);
          col += vec3(1.0) * glow * uShowcase;
          // fingertip air + liquid press: trail taps warp the glass
          float wspd = min(1.0, length(uWakeVel) * 0.35);
          vec2 flow = vec2(0.0);
          for (int i = 0; i < 5; i++) {
            vec2 ldp = vWorld.xy - uTrail[i].xy;
            float ld = length(ldp);
            float lfall = exp(-ld * ld / 2.6) * uTrail[i].z;
            vec2 ldir = ldp / max(ld, 1e-3);
            vec2 swirl = vec2(-ldir.y, ldir.x);
            float ripple = sin(ld * 6.0 - uTime * 7.0) * 0.5 + 0.5;
            flow += (swirl * 0.35 + ldir * (ripple - 0.5) * 0.3) * lfall;
          }
          flow *= wspd;
          float air = 0.0;
          vec2 wpos = vWorld.xy + flow * 0.5;
          for (int i = 0; i < 5; i++) {
            vec2 adp = wpos - uTrail[i].xy;
            air += exp(-dot(adp, adp) / 1.3) * uTrail[i].z;
          }
          float breathe = 0.85 + 0.15 * sin(uTime * 6.0 + vWorld.x * 8.0 + vWorld.y * 6.0);
          col += vec3(1.0) * air * wspd * 0.16 * breathe * uShowcase;
          // RGB channel-dominant tint, slow drift
          float tt = uTime * uDrift;
          vec2 gpos = vWorld.xy * 0.35 + flow;
          vec3 theme = vec3(
            0.5 + 0.5 * sin(gpos.x * 2.1 + tt * 0.15),
            0.5 + 0.5 * sin(gpos.y * 2.3 + tt * 0.12 + 2.1),
            0.5 + 0.5 * sin((gpos.x + gpos.y) * 1.6 + tt * 0.1 + 4.2));
          theme = mix(vec3(0.35), theme, 0.55);
          col += theme * uThemeAmt * (0.6 + air * 1.6) * uShowcase;
          // blob glows: three soft bodies breathing inside the field
          vec3 mintC = vec3(0.30, 0.95, 1.0);
          vec3 emberC = vec3(1.0, 0.44, 0.68);
          vec3 moonC = vec3(1.0, 0.97, 0.90);
          for (int i = 0; i < 3; i++) {
            vec4 bb = uBlobs[i];
            float bd = length(vWorld.xy - bb.xy);
            float fall = smoothstep(bb.z, 0.0, bd);
            fall *= fall;
            vec3 bc = bb.w < 0.5 ? mintC : (bb.w < 1.5 ? emberC : moonC);
            float pulse = 0.75 + 0.25 * sin(uTime * 0.7 + float(i) * 2.1);
            col += bc * fall * 0.10 * pulse * uShowcase;
          }
          // roaming cinema: sparse panels on a 7s clock
          float slot = floor(uTime / 7.0);
          float lp = fract(uTime / 7.0);
          float gate = mod(vQI * 7.0 + vQJ * 13.0 + slot * 5.0, 89.0);
          if (gate < 3.0) {
            float h = hash(vQI * 12.9898 + vQJ * 78.233 + slot * 0.7);
            float p = fract(lp + h);
            float a = smoothstep(0.0, 0.3, p) * (1.0 - smoothstep(0.62, 1.0, p));
            float kind = mod(vQI + vQJ * 2.0 + slot, 5.0);
            float cine = 0.0;
            if (kind < 0.5) {
              float sy = abs(vUv.y - fract(uTime * 0.3 + h));
              cine = (1.0 - smoothstep(0.0, 0.06, sy)) * 0.32
                   + (1.0 - smoothstep(0.0, 0.03, abs(vUv.y - fract(uTime * 0.3 + h) + 0.07))) * 0.09;
            } else if (kind < 2.5) {
              float f2 = fract(uTime * 0.22 + h);
              float d1 = abs(vUv.y - (1.0 - f2));
              cine = (1.0 - smoothstep(0.0, 0.1, d1)) * (1.0 - f2) * 0.5;
            } else {
              float sw = fract(uTime * 0.08 + h);
              cine = (1.0 - smoothstep(0.0, 0.15, abs(vUv.x + vUv.y - sw * 2.0))) * 0.36;
            }
            col += vec3(1.0) * cine * a * uShowcase;
          }
          // manual haze fade (matches scene fog)
          float depth = length(vWorld - cameraPosition);
          float f = exp(-pow(depth * 0.03, 2.0));
          col = mix(uVoid, col, f);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
    const quads = new THREE.InstancedMesh(quadGeo, quadMat, NQ)
    quads.frustumCulled = false
    scene.add(quads)
    {
      const dummy = new THREE.Object3D()
      const c = Math.SQRT1_2
      for (let bj = 0; bj < CELLS; bj++) {
        for (let bi = 0; bi < CELLS; bi++) {
          const i = bj * CELLS + bi
          const uc = -HALF + (bi + 0.5) * QUAD
          const vc = -HALF + (bj + 0.5) * QUAD
          const wx = uc * c - vc * c
          const wy = uc * c + vc * c
          dummy.position.set(wx, wy - 1.6, bowed(wx, 0) - 0.02)
          dummy.scale.set(QUAD - 0.06, QUAD - 0.06, 1)
          dummy.rotation.set(0, 0, Math.PI / 4)
          dummy.updateMatrix()
          quads.setMatrixAt(i, dummy.matrix)
        }
      }
      quads.instanceMatrix.needsUpdate = true
    }

    // ---- starfield ----
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

    // ---- station beacons ----
    const stations: THREE.Vector3[] = ROUTES.map((_, i) => {
      const a = (i / (ROUTES.length - 1) - 0.5) * Math.PI * 0.9
      return new THREE.Vector3(Math.sin(a) * 11, 0.4 + Math.cos(a * 2) * 0.5, -6 - Math.cos(a) * 3)
    })
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x4df3ff, transparent: true, opacity: 0.9 })
    const beacons = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 12, 12), beaconMat, stations.length)
    {
      const d = new THREE.Object3D()
      stations.forEach((s, i) => {
        d.position.copy(s)
        d.updateMatrix()
        beacons.setMatrixAt(i, d.matrix)
      })
    }
    scene.add(beacons)

    // ---- packet rails ----
    const packMat = new THREE.MeshBasicMaterial({ color: 0x4df3ff, transparent: true, opacity: 0.85 })
    const packs = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.07), packMat, PACKETS)
    packs.frustumCulled = false
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
    const mint = new THREE.Color(0x4df3ff)
    const ember = new THREE.Color(0xff6fae)

    // ---- two drifting solids for parallax depth ----
    const solids: THREE.Mesh[] = []
    {
      const boneMat = new THREE.MeshStandardMaterial({ color: 0xe8edee, wireframe: true, transparent: true, opacity: 0.2 })
      const mintMat = new THREE.MeshStandardMaterial({ color: 0x4df3ff, wireframe: true, transparent: true, opacity: 0.26 })
      const s1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), boneMat)
      s1.position.set(-6.2, 2.0, -8)
      const s2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), mintMat)
      s2.position.set(5.6, -1.6, -11)
      solids.push(s1, s2)
      solids.forEach((s) => scene.add(s))
    }

    // ---- fingertip air: eased pointer, decaying trail, press stamps ----
    let btx = window.innerWidth / 2
    let bty = window.innerHeight / 2
    let bInside = false
    const trail = Array.from({ length: 5 }, () => ({ x: 9999, y: 9999, s: 0 }))
    let lastSample = 0
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.5)
    const hit = new THREE.Vector3()
    const wVel = { x: 0, y: 0 }
    const wPrev = { x: 9999, y: 9999 }
    const stamp = (x: number, y: number, s: number) => {
      trail.pop()
      trail.unshift({ x, y, s })
      lastSample = performance.now()
    }

    // blobs drift on lissajous paths, repelled by the trail head
    const blobState = [
      { cx: -6, cy: 1, rx: 3.2, ry: 1.6, sp: 0.11, ph: 0.0 },
      { cx: 6, cy: -1, rx: 3.6, ry: 1.9, sp: 0.09, ph: 2.1 },
      { cx: 0, cy: 3, rx: 4.4, ry: 1.2, sp: 0.07, ph: 4.2 },
    ]

    const fogTarget = new THREE.Color(TINTS[xs.route].fog)
    const accentTarget = new THREE.Color(TINTS[xs.route].accent)
    const camTarget = new THREE.Vector3(...STOPS[xs.route])
    const pm = { x: 0, y: 0 }
    let stir = 0

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    let lastInput = performance.now()
    let raf = 0
    let alive = true
    let clockT = 0
    const wake = () => {
      lastInput = performance.now()
    }

    const onMove = (e: PointerEvent) => {
      pm.x = e.clientX / window.innerWidth - 0.5
      pm.y = e.clientY / window.innerHeight - 0.5
      btx = e.clientX
      bty = e.clientY
      bInside = true
      stir = Math.min(1, stir + Math.abs(e.movementX + e.movementY) * 0.002)
      wake()
    }
    const onDown = (e: PointerEvent) => {
      // liquid press: a full-strength stamp + packet stir burst
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) stamp(hit.x, hit.y, 1.6)
      stir = 1
      wake()
    }
    const onGone = () => {
      bInside = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerleave', onGone, { passive: true })
    window.addEventListener('blur', onGone)
    window.addEventListener('wheel', wake, { passive: true })
    const onVis = () => {
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onVis)
    const onLost = (e: Event) => {
      e.preventDefault()
      canvas.style.visibility = 'hidden'
    }
    const onRestored = () => {
      canvas.style.visibility = ''
      if (reduced) renderer.render(scene, camera)
    }
    canvas.addEventListener('webglcontextlost', onLost, false)
    canvas.addEventListener('webglcontextrestored', onRestored, false)

    const frame = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!document.hidden && now - lastInput < IDLE_MS) {
        clockT += dt
        const tint = TINTS[xs.route]
        fogTarget.set(tint.fog)
        accentTarget.set(tint.accent)
        camTarget.set(...STOPS[xs.route])
        const fog = scene.fog as THREE.FogExp2
        fog.color.lerp(fogTarget, 1 - Math.pow(0.002, dt))
        renderer.setClearColor(fog.color, 1)
        beaconMat.color.lerp(accentTarget, 1 - Math.pow(0.002, dt))
        camera.position.x += (camTarget.x + pm.x * 1.3 - camera.position.x) * 0.06
        camera.position.y += (camTarget.y - pm.y * 0.9 - camera.position.y) * 0.06
        camera.position.z += (camTarget.z - camera.position.z) * 0.06
        camera.lookAt(camera.position.x * 0.4, 0.4, -4)

        // fingertip air: unproject once, lay samples, drain
        ndc.set((btx / window.innerWidth) * 2 - 1, -(bty / window.innerHeight) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        if (raycaster.ray.intersectPlane(plane, hit)) {
          const wvx = bInside ? (hit.x - wPrev.x) * 60 : 0
          const wvy = bInside ? (hit.y - wPrev.y) * 60 : 0
          wVel.x += (wvx - wVel.x) * 0.2
          wVel.y += (wvy - wVel.y) * 0.2
          wPrev.x = hit.x
          wPrev.y = hit.y
          if (bInside && performance.now() - lastSample > 40) {
            stamp(hit.x, hit.y, 1)
          }
          const arr = quadUniforms.uTrail.value as THREE.Vector3[]
          for (let i = 0; i < trail.length; i++) {
            trail[i].s *= 0.96
            arr[i].set(trail[i].x, trail[i].y, trail[i].s)
          }
          quadUniforms.uWakeVel.value.set(wVel.x, wVel.y)
        }

        // packets ride the rails, stirred by velocity
        stir = Math.max(0, stir - dt * 1.4)
        const boost = 1 + stir * 2.2 + Math.min(1, xs.vel * 1.5) * 0.6
        xs.vel *= 0.9
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
          dummy.position.y += Math.sin(p.t * Math.PI) * 1.1 + Math.sin(clockT * 2 + i) * 0.05
          dummy.rotation.y = clockT * 2 + i
          dummy.updateMatrix()
          packs.setMatrixAt(i, dummy.matrix)
          packs.setColorAt(i, tmpColor.copy(p.ember ? ember : mint))
        }
        packs.instanceMatrix.needsUpdate = true
        if (packs.instanceColor) packs.instanceColor.needsUpdate = true

        // blobs: slow lissajous drift, repelled by the trail head
        const bu = quadUniforms.uBlobs.value as THREE.Vector4[]
        const head = (quadUniforms.uTrail.value as THREE.Vector3[])[0]
        blobState.forEach((bs, i) => {
          let bx = bs.cx + Math.sin(clockT * bs.sp + bs.ph) * bs.rx
          let by = bs.cy + Math.cos(clockT * bs.sp * 0.8 + bs.ph) * bs.ry
          if (head.z > 0.05) {
            const dx = bx - head.x
            const dy = by - head.y
            const d = Math.hypot(dx, dy) || 1
            const push = Math.max(0, (7 - d) / 7) * 1.6
            bx += (dx / d) * push
            by += (dy / d) * push
          }
          bu[i].set(bx, by, bu[i].z, bu[i].w)
        })

        const s = 1 + Math.sin(clockT * 1.6) * 0.18
        beacons.scale.setScalar(s)
        stars.rotation.y = clockT * 0.004
        solids[0].rotation.x += dt * 0.18
        solids[0].rotation.y += dt * 0.22
        solids[1].rotation.x -= dt * 0.15
        solids[1].rotation.y += dt * 0.19

        quadUniforms.uTime.value = clockT
        quadUniforms.uVel.value = Math.min(1, xs.vel * 1.5) * 0.3
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }

    if (reduced) {
      camera.lookAt(0, 0.4, -4)
      renderer.render(scene, camera)
    } else {
      raf = requestAnimationFrame(frame)
    }

    ;(window as unknown as { __shiftworld?: object }).__shiftworld = {
      setLines: (v: boolean) => { lattice.visible = v },
      setQuads: (v: boolean) => { quads.visible = v },
      setPackets: (v: boolean) => { packs.visible = v },
      setStars: (v: boolean) => { stars.visible = v },
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerleave', onGone)
      window.removeEventListener('blur', onGone)
      window.removeEventListener('wheel', wake)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', onLost, false)
      canvas.removeEventListener('webglcontextrestored', onRestored, false)
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} className="world-fixed" aria-hidden="true" />
}
