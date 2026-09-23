import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { xs } from '../app/store'
import type { Route } from '../app/store'

/* SHIFTWORLD VI — a deep diamond corridor that travels WITH the scroll.
 * Page scroll pans the camera vertically through the lattice (no zoom,
 * no dolly) on every route, so the background moves with the content.
 * Reversible and smoothed. Route titles stay in the readable page content;
 * the field remains purely atmospheric. A slow pointer steer breathes underneath. */

const VOID = new THREE.Color(0x06090f)
const HALF = 14
const GAP = 0.5
const BOW = 2.2
/** world units the camera pans across a full page scroll */
const PAN = 4

const TINTS: Record<Route, { fog: number }> = {
  enter: { fog: 0x06090f },
  worlds: { fog: 0x0d0a08 },
  about: { fog: 0x0a0d12 },
  features: { fog: 0x081114 },
  pricing: { fog: 0x100d08 },
  demo: { fog: 0x06120e },
}

const CAM: [number, number, number] = [0, 1.4, 9.5]

/** page scroll progress 0..1 — drives the camera pan on every route */
function scrollP(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
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
    const reduced = xs.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
    camera.position.set(...CAM)

    scene.add(new THREE.AmbientLight(0x8899aa, 0.5))
    const key = new THREE.DirectionalLight(0x4df3ff, 0.9)
    key.position.set(4, 7, 5)
    scene.add(key)

    // ---- diamond corridor: edge-to-edge tiles, receding depth layers ----
    const QUAD = GAP * 3.2
    const CELLS = Math.floor((2 * HALF) / QUAD)
    const LAYERS = 4
    const LAYER_GAP = 8
    const NQ = CELLS * CELLS * LAYERS
    const quadGeo = new THREE.PlaneGeometry(1, 1)
    {
      const aSeed = new Float32Array(NQ)
      const aQI = new Float32Array(NQ)
      const aQJ = new Float32Array(NQ)
      for (let l = 0; l < LAYERS; l++) {
        for (let bj = 0; bj < CELLS; bj++) {
          for (let bi = 0; bi < CELLS; bi++) {
            const i = (l * CELLS + bj) * CELLS + bi
            aSeed[i] = Math.random()
            aQI[i] = bi
            aQJ[i] = bj
          }
        }
      }
      quadGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1))
      quadGeo.setAttribute('aQI', new THREE.InstancedBufferAttribute(aQI, 1))
      quadGeo.setAttribute('aQJ', new THREE.InstancedBufferAttribute(aQJ, 1))
    }
    const quadUniforms = {
      uTime: { value: 0 },
      uShowcase: { value: 1 },
      uVoid: { value: new THREE.Vector3(0.0235, 0.0353, 0.0588) },
      uThemeAmt: { value: 0.22 },
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
        uniform float uShowcase;
        uniform vec3 uVoid;
        uniform float uThemeAmt;
        varying vec2 vUv;
        varying vec3 vWorld;
        varying float vSeed;
        varying float vQI;
        varying float vQJ;
        float hash(float n) { return fract(sin(n) * 43758.5453); }
        void main() {
          vec3 col = vec3(0.008, 0.009, 0.012);
          vec2 e = fwidth(vUv);
          vec2 b = min(vUv, 1.0 - vUv);
          float bl = max(
            1.0 - smoothstep(0.0, e.x * 1.5 + 1e-4, b.x),
            1.0 - smoothstep(0.0, e.y * 1.5 + 1e-4, b.y));
          col += vec3(1.0) * bl * 0.16;
          float wave = 0.03 + 0.04 * (0.5 + 0.5 * sin(uTime * 1.5 - (vWorld.x * 0.14 + vWorld.y * 0.05) + vSeed * 6.28));
          float glow = wave;
          col += vec3(1.0) * glow * uShowcase;
          float tt = 0.0;
          vec2 gpos = vWorld.xy * 0.35;
          vec3 signal = vec3(0.30, 0.95, 1.0);
          vec3 warmth = vec3(1.0, 0.18, 0.10);
          float drift = 0.5 + 0.5 * sin(gpos.x * 1.7 + gpos.y * 1.1 + uTime * 0.08);
          vec3 theme = mix(signal, warmth, smoothstep(0.72, 0.98, drift));
          col += theme * uThemeAmt * 0.55 * uShowcase;
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
      for (let l = 0; l < LAYERS; l++) {
        for (let bj = 0; bj < CELLS; bj++) {
          for (let bi = 0; bi < CELLS; bi++) {
            const i = (l * CELLS + bj) * CELLS + bi
            const uc = -HALF + (bi + 0.5) * QUAD
            const vc = -HALF + (bj + 0.5) * QUAD
            const wx = uc * c - vc * c
            const wy = uc * c + vc * c
            dummy.position.set(wx, wy - 1.6, bowed(wx, 0) - 0.02 - l * LAYER_GAP)
            dummy.scale.set(QUAD, QUAD, 1)
            dummy.rotation.set(0, 0, Math.PI / 4)
            dummy.updateMatrix()
            quads.setMatrixAt(i, dummy.matrix)
          }
        }
      }
      quads.instanceMatrix.needsUpdate = true
    }

    const renderStill = () => {
      const fog = scene.fog as THREE.FogExp2
      fog.color.set(TINTS[xs.route].fog)
      renderer.setClearColor(fog.color, 1)
      const p = scrollP()
      camera.position.set(CAM[0], CAM[1] - p * PAN, CAM[2])
      camera.lookAt(0, 0.4 - p * PAN, -4)
      renderer.render(scene, camera)
    }

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      dirty = true
    }
    // cursor steering: pointer (and touch-drag) aim the camera
    const pm = { x: 0, y: 0 }
    const steer = (clientX: number, clientY: number) => {
      pm.x = clientX / window.innerWidth - 0.5
      pm.y = clientY / window.innerHeight - 0.5
    }
    const onPointerMove = (e: PointerEvent) => steer(e.clientX, e.clientY)
    const onTouchSteer = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) steer(t.clientX, t.clientY)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchSteer, { passive: true })
    // scroll pans the background with the content — repaint on scroll.
    const onScroll = () => {
      dirty = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    let raf = 0
    let alive = true
    let last = performance.now()
    let clockT = Math.random() * 10
    let pan = 0
    let dirty = false
    resize()
    window.addEventListener('resize', resize)
    const onHash = () => {
      dirty = true
      renderStill()
    }
    window.addEventListener('hashchange', onHash)
    const onLost = (e: Event) => {
      e.preventDefault()
      canvas.style.visibility = 'hidden'
    }
    const onRestored = () => {
      canvas.style.visibility = ''
      renderStill()
    }
    canvas.addEventListener('webglcontextlost', onLost, false)
    canvas.addEventListener('webglcontextrestored', onRestored, false)

    renderStill()

    // scroll pans the camera through the lattice — background travels
    // with the content. Smoothed and reversible; never zooms.
    const frame = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const live = xs.route === 'enter' && !reduced && !document.hidden
      if (live) {
        clockT += dt
      }
      if ((live || dirty) && !document.hidden) {
        const p = scrollP()
        pan += (p - pan) * 0.08
        if (live) {
          // cursor aims gently, micro-sway breathes underneath
          const tx = CAM[0] + pm.x * 1.6 + Math.sin(clockT * 0.21) * 0.07
          const ty = CAM[1] - pm.y * 1.0 + Math.sin(clockT * 0.16 + 1) * 0.05 - pan * PAN
          const tz = CAM[2] + Math.cos(clockT * 0.13) * 0.07
          camera.position.x += (tx - camera.position.x) * 0.02
          camera.position.y += (ty - camera.position.y) * 0.02
          camera.position.z += (tz - camera.position.z) * 0.02
          camera.lookAt(camera.position.x * 0.4, 0.4 - pan * PAN, -4)
          quadUniforms.uTime.value = clockT
        } else {
          camera.position.set(CAM[0], CAM[1] - pan * PAN, CAM[2])
          camera.lookAt(0, 0.4 - pan * PAN, -4)
        }
        renderer.render(scene, camera)
        dirty = false
      }
      raf = requestAnimationFrame(frame)
    }
    if (!reduced) {
      raf = requestAnimationFrame(frame)
    }

    ;(window as unknown as { __shiftworld?: object }).__shiftworld = {
      get route() {
        return xs.route
      },
      quads,
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchSteer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      window.removeEventListener('hashchange', onHash)
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
