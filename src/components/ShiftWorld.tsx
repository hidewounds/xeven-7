import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { xs } from '../app/store'
import type { Route } from '../app/store'

/* SHIFTWORLD VII — one long slip. The canvas is document-tall and scrolls
 * WITH the page (absolute, not fixed): top of the document gets the top
 * of the field, bottom gets the bottom. The lattice is baked to span the
 * full measured height; the camera pulls back to frame it exactly, so
 * tiles never stretch. Scroll never moves the camera. Rendering is
 * on-demand (scroll/pointer wake, 1.5s sleep) so a multi-megapixel
 * buffer never burns GPU at idle. Subpages share the same long slip,
 * frozen. Titles live in the fixed FieldMark overlay, not here. */

const VOID = new THREE.Color(0x06090f)
const HALF = 14
const GAP = 0.5
const BOW = 2.2
const FOV = 55
const TAN_HALF = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
/** world units of field visible in a viewport-height window at the base framing */
const BASE_H = 10.4
const SLEEP_MS = 1500

const TINTS: Record<Route, { fog: number }> = {
  enter: { fog: 0x06090f },
  worlds: { fog: 0x0d0a08 },
  about: { fog: 0x0a0d12 },
  features: { fog: 0x081114 },
  pricing: { fog: 0x100d08 },
  demo: { fog: 0x06120e },
}

const CAMX = 0
const CAMY = 1.4

function bowed(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z) / (HALF * 1.42)
  return -BOW * (1 - r * r)
}

export default function ShiftWorld() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const reduced = xs.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' })
    } catch {
      canvas.style.display = 'none'
      return
    }
    // tall buffer: DPR 1 keeps memory sane (a 1600x4000 canvas is ~26MB).
    renderer.setPixelRatio(1)
    renderer.setClearColor(VOID, 1)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(VOID.getHex(), 0.03)
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 400)
    camera.position.set(CAMX, CAMY, 11.5)

    scene.add(new THREE.AmbientLight(0x8899aa, 0.5))
    const key = new THREE.DirectionalLight(0x4df3ff, 0.9)
    key.position.set(4, 7, 5)
    scene.add(key)

    const QUAD = GAP * 3.2
    const CELLS = Math.floor((2 * HALF) / QUAD)
    const LAYERS = 4
    const LAYER_GAP = 8

    const quadUniforms = {
      uTime: { value: 0 },
      uShowcase: { value: 1 },
      uVoid: { value: new THREE.Vector3(0.0235, 0.0353, 0.0588) },
      uThemeAmt: { value: 0.22 },
      uDepthK: { value: 0.03 },
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
        uniform float uDepthK;
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
          vec3 theme = vec3(
            0.5 + 0.5 * sin(gpos.x * 2.1 + tt * 0.15),
            0.5 + 0.5 * sin(gpos.y * 2.3 + tt * 0.12 + 2.1),
            0.5 + 0.5 * sin((gpos.x + gpos.y) * 1.6 + tt * 0.1 + 4.2));
          theme = mix(vec3(0.35), theme, 0.55);
          col += theme * uThemeAmt * 0.6 * uShowcase;
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
          float f = exp(-pow(depth * uDepthK, 2.0));
          col = mix(uVoid, col, f);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })

    let quads: THREE.InstancedMesh | null = null
    let dist = 11.5

    // Bake the lattice to span the full document height. The 45-degree
    // diamond rotation compresses vertical span, so rows cover extra.
    const buildLattice = (worldH: number) => {
      if (quads) {
        scene.remove(quads)
        quads.geometry.dispose()
        quads = null
      }
      const c = Math.SQRT1_2
      const VSPAN = worldH / c + QUAD * 2
      const ROWS = Math.max(CELLS, Math.ceil(VSPAN / QUAD))
      const NQ = CELLS * ROWS * LAYERS
      const geo = new THREE.PlaneGeometry(1, 1)
      const aSeed = new Float32Array(NQ)
      const aQI = new Float32Array(NQ)
      const aQJ = new Float32Array(NQ)
      const mesh = new THREE.InstancedMesh(geo, quadMat, NQ)
      mesh.frustumCulled = false
      const dummy = new THREE.Object3D()
      const wyMin = -2 * HALF * c
      const wyMax = wyMin + ROWS * QUAD * c
      const wyMid = (wyMin + wyMax) / 2
      for (let l = 0; l < LAYERS; l++) {
        for (let bj = 0; bj < ROWS; bj++) {
          for (let bi = 0; bi < CELLS; bi++) {
            const i = (l * ROWS + bj) * CELLS + bi
            const uc = -HALF + (bi + 0.5) * QUAD
            const vc = -HALF + (bj + 0.5) * QUAD
            const wx = uc * c - vc * c
            const wy = uc * c + vc * c - wyMid - 1.6
            dummy.position.set(wx, wy, bowed(wx, 0) - 0.02 - l * LAYER_GAP)
            dummy.scale.set(QUAD, QUAD, 1)
            dummy.rotation.set(0, 0, Math.PI / 4)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            aSeed[i] = Math.random()
            aQI[i] = bi
            aQJ[i] = bj
          }
        }
      }
      mesh.instanceMatrix.needsUpdate = true
      geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1))
      geo.setAttribute('aQI', new THREE.InstancedBufferAttribute(aQI, 1))
      geo.setAttribute('aQJ', new THREE.InstancedBufferAttribute(aQJ, 1))
      scene.add(mesh)
      quads = mesh
    }

    let raf = 0
    let alive = true
    let last = performance.now()
    let lastActive = 0
    let clockT = Math.random() * 10
    let dirty = false
    const wake = () => {
      lastActive = performance.now()
      dirty = true
    }

    // Measure the document, size the canvas to it, frame it exactly.
    const layout = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const docH = Math.max(document.documentElement.scrollHeight, vh)
      const worldH = (docH * BASE_H) / vh
      dist = worldH / (2 * TAN_HALF) + 2
      renderer.setSize(vw, docH, false)
      canvas.style.height = `${docH}px`
      camera.aspect = vw / docH
      camera.updateProjectionMatrix()
      const fog = scene.fog as THREE.FogExp2
      fog.density = 0.345 / dist
      quadUniforms.uDepthK.value = 0.345 / dist
      buildLattice(worldH)
      camera.position.set(CAMX, CAMY, dist)
      camera.lookAt(0, 0.4, -4)
      wake()
    }

    const renderStill = () => {
      const fog = scene.fog as THREE.FogExp2
      fog.color.set(TINTS[xs.route].fog)
      renderer.setClearColor(fog.color, 1)
      camera.position.set(CAMX, CAMY, dist)
      camera.lookAt(0, 0.4, -4)
      renderer.render(scene, camera)
    }

    // cursor steering: pointer (and touch-drag) aim the camera
    const pm = { x: 0, y: 0 }
    const steer = (clientX: number, clientY: number) => {
      pm.x = clientX / window.innerWidth - 0.5
      pm.y = clientY / window.innerHeight - 0.5
    }
    const onPointerMove = (e: PointerEvent) => {
      steer(e.clientX, e.clientY)
      wake()
    }
    const onTouchSteer = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) steer(t.clientX, t.clientY)
      wake()
    }
    const onScroll = () => wake()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchSteer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    let rzT = 0
    const onResize = () => {
      window.clearTimeout(rzT)
      rzT = window.setTimeout(() => {
        layout()
        if (reduced) renderStill()
      }, 200)
    }
    window.addEventListener('resize', onResize)
    const onHash = () => {
      // route pages differ in length and the new chunk mounts after the
      // hash flips — measure now and again once content lands.
      layout()
      if (reduced) renderStill()
      window.clearTimeout(tLate1)
      window.clearTimeout(tLate2)
      window.setTimeout(() => {
        if (!alive) return
        layout()
        if (reduced) renderStill()
      }, 600)
    }
    window.addEventListener('hashchange', onHash)
    const onLost = (e: Event) => {
      e.preventDefault()
      canvas.style.visibility = 'hidden'
    }
    const onRestored = () => {
      canvas.style.visibility = ''
      layout()
      renderStill()
    }
    canvas.addEventListener('webglcontextlost', onLost, false)
    canvas.addEventListener('webglcontextrestored', onRestored, false)

    layout()
    if (reduced) renderStill()
    // the lazy route chunk mounts after us — re-measure once content lands.
    const tLate1 = window.setTimeout(() => {
      layout()
      if (reduced) renderStill()
    }, 800)
    const tLate2 = window.setTimeout(() => {
      layout()
      if (reduced) renderStill()
    }, 2500)

    // render-on-demand: paint on wake, sleep 1.5s after last activity.
    // scroll never moves the camera — the page pans over the long slip.
    const frame = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const live = xs.route === 'enter' && !reduced && !document.hidden
      if (!document.hidden && (dirty || (live && now - lastActive < SLEEP_MS))) {
        if (live) {
          clockT += dt
          // cursor aims gently, micro-sway breathes underneath
          const tx = CAMX + pm.x * 1.6 + Math.sin(clockT * 0.21) * 0.07
          const ty = CAMY - pm.y * 1.0 + Math.sin(clockT * 0.16 + 1) * 0.05
          const tz = dist + Math.cos(clockT * 0.13) * 0.07
          camera.position.x += (tx - camera.position.x) * 0.02
          camera.position.y += (ty - camera.position.y) * 0.02
          camera.position.z += (tz - camera.position.z) * 0.02
          camera.lookAt(camera.position.x * 0.4, 0.4, -4)
          quadUniforms.uTime.value = clockT
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
      get quads() {
        return quads
      },
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(rzT)
      window.clearTimeout(tLate1)
      window.clearTimeout(tLate2)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchSteer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
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

  return <canvas ref={ref} className="world-slip" aria-hidden="true" />
}
