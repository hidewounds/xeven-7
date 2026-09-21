import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { xs } from '../app/store'
import type { Route } from '../app/store'

/* SHIFTWORLD III — the diamond field, and only the field. Instanced diamond
 * panels with in-shader hairlines, breathing shimmer, RGB channel tint,
 * fingertip air, liquid press, roaming cinema. No rails, no packets, no
 * beacons, no stars, no solids, no blobs. Pointer steers parallax + stir on
 * desktop; touch-drag steers and tap presses on cursorless devices.
 * Per-route haze retint + waypoint camera kept. Discipline kept: DPR caps,
 * 6s idle sleep, hidden-tab pause, single-frame reduced stand-down, full
 * dispose, context-loss handling. */

const VOID = new THREE.Color(0x06090f)
const HALF = 14
const GAP = 0.5
const BOW = 2.2
const IDLE_MS = 6000

const TINTS: Record<Route, { fog: number }> = {
  enter: { fog: 0x06090f },
  worlds: { fog: 0x0d0a08 },
  about: { fog: 0x0a0d12 },
  features: { fog: 0x081114 },
  pricing: { fog: 0x100d08 },
  demo: { fog: 0x06120e },
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

    // ---- instanced diamond panels: all life in-shader ----
    const QUAD = GAP * 3.2
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
          // fingertip air: pointer/touch presence bends the medium
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
          // RGB channel-dominant tint, slow drift
          float tt = uTime * uDrift;
          vec2 gpos = vWorld.xy * 0.35 + flow;
          vec3 theme = vec3(
            0.5 + 0.5 * sin(gpos.x * 2.1 + tt * 0.15),
            0.5 + 0.5 * sin(gpos.y * 2.3 + tt * 0.12 + 2.1),
            0.5 + 0.5 * sin((gpos.x + gpos.y) * 1.6 + tt * 0.1 + 4.2));
          theme = mix(vec3(0.35), theme, 0.55);
          // press/flow warp the tint only — no light is ever added here
          col += theme * uThemeAmt * 0.6 * uShowcase;
          col += theme * uThemeAmt * (0.6 + air * 1.6) * uShowcase;
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

    // ---- presence feed: pointer AND touch drive the same uniforms ----
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
    const feed = (clientX: number, clientY: number) => {
      ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        btx = clientX
        bty = clientY
        bInside = true
        if (performance.now() - lastSample > 40) stamp(hit.x, hit.y, 1)
        wake()
      }
    }

    const fogTarget = new THREE.Color(TINTS[xs.route].fog)
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
      stir = Math.min(1, stir + Math.abs(e.movementX + e.movementY) * 0.002)
      feed(e.clientX, e.clientY)
    }
    const onDown = (e: PointerEvent) => {
      feed(e.clientX, e.clientY)
      const arr = quadUniforms.uTrail.value as THREE.Vector3[]
      if (arr[0]) arr[0].z = Math.max(arr[0].z, 1.6)
      stir = 1
      wake()
    }
    const onGone = () => {
      bInside = false
    }
    // touch spatial: drag steers + stirs, tap presses
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      pm.x = t.clientX / window.innerWidth - 0.5
      pm.y = t.clientY / window.innerHeight - 0.5
      stir = Math.min(1, stir + 0.08)
      feed(t.clientX, t.clientY)
    }
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      feed(t.clientX, t.clientY)
      stir = 1
      wake()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
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
        camTarget.set(...STOPS[xs.route])
        const fog = scene.fog as THREE.FogExp2
        fog.color.lerp(fogTarget, 1 - Math.pow(0.002, dt))
        renderer.setClearColor(fog.color, 1)
        camera.position.x += (camTarget.x + pm.x * 1.3 - camera.position.x) * 0.06
        camera.position.y += (camTarget.y - pm.y * 0.9 - camera.position.y) * 0.06
        camera.position.z += (camTarget.z - camera.position.z) * 0.06
        camera.lookAt(camera.position.x * 0.4, 0.4, -4)

        // presence: unproject once, lay samples, drain
        ndc.set((btx / window.innerWidth) * 2 - 1, -(bty / window.innerHeight) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        if (raycaster.ray.intersectPlane(plane, hit)) {
          const wvx = bInside ? (hit.x - wPrev.x) * 60 : 0
          const wvy = bInside ? (hit.y - wPrev.y) * 60 : 0
          wVel.x += (wvx - wVel.x) * 0.2
          wVel.y += (wvy - wVel.y) * 0.2
          wPrev.x = hit.x
          wPrev.y = hit.y
          const arr = quadUniforms.uTrail.value as THREE.Vector3[]
          for (let i = 0; i < trail.length; i++) {
            trail[i].s *= 0.96
            arr[i].set(trail[i].x, trail[i].y, trail[i].s)
          }
          quadUniforms.uWakeVel.value.set(wVel.x, wVel.y)
        }

        stir = Math.max(0, stir - dt * 1.4)
        quadUniforms.uTime.value = clockT
        quadUniforms.uVel.value = Math.min(1, xs.vel * 1.5) * 0.3 + stir * 0.25
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

    ;(window as unknown as { __shiftworld?: object }).__shiftworld = { quads }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchStart)
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
