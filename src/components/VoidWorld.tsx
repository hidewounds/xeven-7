import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* VOIDWORLD — the site background, rebuilt from scratch as ONE canvas, ONE
 * ticker, ONE journey (replaces the STRATA 2D canvas + the void-objects
 * layer, both retired).
 *
 * Research lineage: baked BufferGeometry LineSegments (one static draw per
 * line family), a single InstancedMesh + ShaderMaterial field with per-
 * instance attributes (zero CPU per frame — the SF-grid pattern), and a
 * normalized-progress waypoint camera (Grantmantek/zyliu grammar) lerped in
 * the loop so motion stays interruptible and scrub-reversible.
 *
 * The world: a 45° diamond lattice bowed on an INWARD (concave) cylinder —
 * centre recedes, flanks come close, you sit inside it. Black quad panels
 * with in-shader borders + breathing shimmer + 7s roaming cinema, survey
 * crosses, an additive starfield, four lit wireframe solids, exponential
 * haze. The pointer lights NOTHING, ever — its only touch is the liquid
 * press (ripple + gloss that settles back solid). A fixed glass finish
 * layer (DOM, zero blur) sits above for the crystal grade.
 *
 * 4D (time as the fourth dimension): uTime drives the cinema clock, haze
 * breathing, rim orbit and shimmer phase — the world evolves standing still.
 * Discipline: DPR caps, 6s idle sleep, hidden-tab pause, reduced-motion
 * renders a single static frame and stops, coarse pointers get half the
 * stars, everything disposed on unmount.
 */

const VOID = new THREE.Color(0x06090f)
// world scale, calibrated to the mock's on-screen densities: quad ≈ 140px,
// plus grid ≈ 280px at 1600×900
const HALF = 14 // field half-extent, world units
const GAP = 0.45
const BOW = 2.2 // concave hollow at centre, world units
const IDLE_MS = 6000

const SECTIONS = [
  '.st-hero',
]
// camera journey: a single hold over the hero [x, y, z] — the index is
// one act now, the world simply breathes beneath it
const WAYPOINTS: Array<[number, number, number]> = [
  [0, 0.4, 10],
]

interface Floater extends THREE.Mesh {
  userData: { rx: number; ry: number; fs: number; fo: number; fa: number; by: number }
}

export default function VoidWorld() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const coarse =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarse,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(VOID, 0.05)
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      160,
    )
    camera.position.set(0, 0.4, 10)

    scene.add(new THREE.AmbientLight(0x8a97a3, 0.55))
    const key = new THREE.DirectionalLight(0x9cf5d3, 1.15)
    key.position.set(5, 8, 6)
    scene.add(key)
    const rim = new THREE.PointLight(0xff4d2e, 14, 46, 2)
    rim.position.set(-7, -3, -4)
    scene.add(rim)

    // ---- static geometry (rebuilt per resize / route tier) ----
    let statics: THREE.Object3D[] = []
    // inward cylinder: the centre recedes, the flanks come close — you sit
    // INSIDE the cylinder looking at walls curving away (subpages run flat).
    const bowZ = (x: number, showcase: boolean) =>
      showcase ? -BOW * Math.max(0, 1 - (x / HALF) * (x / HALF)) : 0

    function buildStatic(showcase: boolean) {
      for (const o of statics) {
        scene.remove(o)
        const m = o as THREE.LineSegments
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      }
      statics = []
      const c = Math.cos(Math.PI / 4)
      const s = Math.sin(Math.PI / 4)
      // three line families: grid bone .16 / micro mint .12 / plus .9
      const fam: Array<{ pts: number[]; mat: THREE.LineBasicMaterial }> = [
        { pts: [], mat: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 }) },
        { pts: [], mat: new THREE.LineBasicMaterial({ color: 0x9cf5d3, transparent: true, opacity: 0.12 }) },
        { pts: [], mat: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }) },
      ]
      const pushSeg = (
        arr: number[],
        x0: number, y0: number, x1: number, y1: number,
      ) => {
        // bow-sampled so rails breathe with the sheet like print
        const len = Math.hypot(x1 - x0, y1 - y0)
        const k = Math.max(1, Math.ceil(len / 1.6))
        let px = x0
        let py = y0
        for (let i = 1; i <= k; i++) {
          const t = i / k
          const qx = x0 + (x1 - x0) * t
          const qy = y0 + (y1 - y0) * t
          arr.push(px, py, bowZ(px, showcase), qx, qy, bowZ(qx, showcase))
          px = qx
          py = qy
        }
      }
      for (let g = -HALF; g <= HALF + 0.001; g += GAP) {
        // u-rails run NE, stepped NW (offset must be perpendicular to the
        // rail direction or the whole family collapses onto one line)
        pushSeg(fam[0].pts, -g * s - HALF * c, g * c - HALF * s, -g * s + HALF * c, g * c + HALF * s)
        // v-rails run NW, stepped NE
        pushSeg(fam[0].pts, g * c + HALF * s, g * s - HALF * c, g * c - HALF * s, g * s + HALF * c)
        for (let k = 1; k < 5; k++) {
          const u = g + (GAP * k) / 5
          if (u > HALF) continue
          pushSeg(fam[1].pts, -u * s - HALF * c, u * c - HALF * s, -u * s + HALF * c, u * c + HALF * s)
          pushSeg(fam[1].pts, u * c + HALF * s, u * s - HALF * c, u * c - HALF * s, u * s + HALF * c)
        }
      }
      // survey crosses every 8 cells (≈280px grid, mock measure)
      const AX = 0.13
      for (let aj = -HALF; aj <= HALF + 0.001; aj += GAP * 8) {
        for (let ai = -HALF; ai <= HALF + 0.001; ai += GAP * 8) {
          const px = ai * c - aj * s
          const py = ai * s + aj * c
          const pz = bowZ(px, showcase)
          fam[2].pts.push(
            px - AX, py - AX, pz, px + AX, py + AX, pz,
            px - AX, py + AX, pz, px + AX, py - AX, pz,
          )
        }
      }
      for (const f of fam) {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(f.pts), 3))
        geo.computeBoundingSphere()
        const lines = new THREE.LineSegments(geo, f.mat)
        lines.frustumCulled = false
        scene.add(lines)
        statics.push(lines)
      }
    }

    // ---- instanced quad field (one draw, all life in-shader) ----
    const quadGeo = new THREE.PlaneGeometry(1, 1)
    const QUAD = 4 * GAP
    const CELLS = Math.floor((2 * HALF) / QUAD)
    const NQ = CELLS * CELLS
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
    const quadUniforms = {
      uTime: { value: 0 },
      uTrail: {
        value: Array.from({ length: 5 }, () => new THREE.Vector3(9999, 9999, 0)),
      },
      uWakeVel: { value: new THREE.Vector2(0, 0) },
      uVel: { value: 0 },
      uShowcase: { value: 1 },
      uVoid: { value: new THREE.Vector3(0.0235, 0.0353, 0.0588) },
      uThemeAmt: { value: 0.22 },
      uDrift: { value: reduced ? 0 : 1 },
    }
    const quadMat = new THREE.ShaderMaterial({
      uniforms: quadUniforms,
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aQI;
        attribute float aQJ;
        varying vec2 vUv;
        varying vec3 vWorld;
        varying float vSeed;
        varying float vQI;
        varying float vQJ;
        uniform vec3 uTrail[5];
        uniform vec2 uWakeVel;
        void main() {
          vUv = uv;
          vSeed = aSeed;
          vQI = aQI;
          vQJ = aQJ;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          // fingertip air: the head + its short trail bend the medium at
          // touch scale (σ≈0.8u), gated by damped speed — dead at rest.
          // No body, no glow, no trail geometry; only the bend reads.
          float wspd = min(1.0, length(uWakeVel) * 0.35);
          vec2 bend = vec2(0.0);
          for (int i = 0; i < 5; i++) {
            vec2 tdir = wp.xy - uTrail[i].xy;
            float td = length(tdir);
            float tfall = exp(-td * td / 1.3);
            bend -= (tdir / max(td, 1e-3)) * (tfall * uTrail[i].z * 0.25);
          }
          wp.xy += bend * wspd;
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
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
          // carved black panel
          vec3 col = vec3(0.008, 0.009, 0.012);
          // crisp hairline border (mock grammar: the mesh carves, it never
          // glows — definition only, resolution-independent)
          vec2 e = fwidth(vUv);
          vec2 b = min(vUv, 1.0 - vUv);
          float bl = max(
            1.0 - smoothstep(0.0, e.x * 1.5 + 1e-4, b.x),
            1.0 - smoothstep(0.0, e.y * 1.5 + 1e-4, b.y));
          col += vec3(1.0) * bl * 0.16;
          // breathing shimmer riding the bow axis (scroll-kindled only —
          // the pointer lights nothing, ever)
          float wave = 0.03 + 0.04 * (0.5 + 0.5 * sin(uTime * 1.5 - (vWorld.x * 0.14 + vWorld.y * 0.05) + vSeed * 6.28));
          float amp = 1.0 + uVel * 0.3;
          float glow = wave * amp;
          col += vec3(1.0) * glow * uShowcase;
          // translucent air: the head + trail read as a faint neutral
          // presence where the medium bends — alive with a slow shimmer,
          // visible, never prominent
          float wspd = min(1.0, length(uWakeVel) * 0.35);
          float air = 0.0;
          for (int i = 0; i < 5; i++) {
            vec2 adp = vWorld.xy - uTrail[i].xy;
            air += exp(-dot(adp, adp) / 1.3) * uTrail[i].z;
          }
          float breathe = 0.85 + 0.15 * sin(uTime * 6.0 + vWorld.x * 8.0 + vWorld.y * 6.0);
          col += vec3(1.0) * air * wspd * 0.16 * breathe * uShowcase;
          // rgb themes: each diamond takes a channel-dominant tint from
          // its grid position — slow phase drift (frozen under reduced
          // motion), stirred brighter under the pointer. Never white,
          // never loud: visible but not prominent.
          float tt = uTime * uDrift;
          vec3 theme = vec3(
            0.5 + 0.5 * sin(vQI * 0.45 + tt * 0.15),
            0.5 + 0.5 * sin(vQJ * 0.45 + tt * 0.12 + 2.1),
            0.5 + 0.5 * sin((vQI + vQJ) * 0.3 + tt * 0.1 + 4.2));
          theme = mix(vec3(0.35), theme, 0.55);
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
            } else if (kind < 1.5 || (kind > 2.5 && kind < 3.5)) {
              float st = step(0.5, fract((vUv.x + vUv.y) * 3.0 + uTime * 0.2 + h));
              cine = (0.06 + 0.08 * (0.5 + 0.5 * sin(uTime * 1.4 + h * 9.0))) * st;
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
          float f = exp(-pow(depth * 0.05, 2.0));
          col = mix(uVoid, col, f);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
    const quads = new THREE.InstancedMesh(quadGeo, quadMat, NQ)
    quads.frustumCulled = false // matrices re-laid on route rebuilds
    scene.add(quads)
    // ---- quad placement: diamonds aligned to the rails ----
    // A uv-block (4×4 cells) maps to a world diamond: rotate the plane 45°
    // so its EDGES run along the lattice rails (mock grammar), centroids
    // on the uv grid, z following the bow.
    const dummy = new THREE.Object3D()
    const layoutQuads = (showcase: boolean) => {
      for (let bj = 0; bj < CELLS; bj++) {
        for (let bi = 0; bi < CELLS; bi++) {
          const i = bj * CELLS + bi
          const uc = -HALF + (bi + 0.5) * QUAD
          const vc = -HALF + (bj + 0.5) * QUAD
          // uv → world on the 45° basis (du=(c,s), dv=(-s,c))
          const wx = uc * Math.SQRT1_2 - vc * Math.SQRT1_2
          const wy = uc * Math.SQRT1_2 + vc * Math.SQRT1_2
          dummy.position.set(wx, wy, bowZ(wx, showcase) - 0.02)
          dummy.scale.set(QUAD - 0.06, QUAD - 0.06, 1)
          dummy.rotation.set(0, 0, Math.PI / 4)
          dummy.updateMatrix()
          quads.setMatrixAt(i, dummy.matrix)
        }
      }
      quads.instanceMatrix.needsUpdate = true
    }

    // ---- starfield: one Points draw, additive, depth-silent ----
    const COUNT = coarse ? 500 : 1200
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 64
      pos[i * 3 + 1] = (Math.random() - 0.5) * 38
      pos[i * 3 + 2] = -4 - Math.random() * 42
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xe8edee,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    scene.add(stars)

    // ---- floating solids: lit wireframe edges ----
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xe8edee, wireframe: true, transparent: true, opacity: 0.24,
      roughness: 0.4, metalness: 0.1,
    })
    const mintMat = new THREE.MeshStandardMaterial({
      color: 0x9cf5d3, wireframe: true, transparent: true, opacity: 0.3,
      roughness: 0.4, metalness: 0.1,
    })
    const group = new THREE.Group()
    scene.add(group)
    const specs: Array<{ geo: THREE.BufferGeometry; mat: THREE.Material; p: [number, number, number] }> = [
      { geo: new THREE.IcosahedronGeometry(1.5, 0), mat: boneMat, p: [-5.6, 1.7, -6] },
      { geo: new THREE.OctahedronGeometry(1.15, 0), mat: boneMat, p: [5.3, -1.5, -9] },
      { geo: new THREE.TorusKnotGeometry(0.95, 0.3, 110, 12), mat: mintMat, p: [3.5, 2.7, -13] },
      { geo: new THREE.TetrahedronGeometry(1.35, 0), mat: boneMat, p: [-3.9, -2.9, -17] },
    ]
    for (const sp of specs) {
      const mesh = new THREE.Mesh(sp.geo, sp.mat) as Floater
      mesh.position.set(...sp.p)
      mesh.userData = {
        rx: 0.12 + Math.random() * 0.22,
        ry: 0.15 + Math.random() * 0.25,
        fs: 0.25 + Math.random() * 0.4,
        fo: Math.random() * Math.PI * 2,
        fa: 0.35 + Math.random() * 0.4,
        by: sp.p[1],
      }
      group.add(mesh)
    }

    // ---- fingertip air feed: eased pointer + a short decaying trail.
    // Samples drop every ~40ms while inside; strengths drain per frame,
    // so the trail evaporates behind motion and vanishes at rest.
    let btx = window.innerWidth / 2
    let bty = window.innerHeight / 2
    let bInside = false
    const wPos = { x: 9999, y: 9999 }
    const wVel = { x: 0, y: 0 }
    const wPrev = { x: 9999, y: 9999 }
    const trail = Array.from({ length: 5 }, () => ({ x: 9999, y: 9999, s: 0 }))
    let lastSample = 0

    // ---- waypoint journey ----
    let fracs: number[] = []
    const computeWaypoints = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      fracs = SECTIONS.map((sel) => {
        const el = document.querySelector(sel)
        if (!el || docH <= 0) return -1
        return Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / docH))
      })
    }
    const camTarget = new THREE.Vector3(0, 0.4, 10)
    const lookTarget = new THREE.Vector3(0, 0, -6)
    const ease01 = (t: number) => t * t * (3 - 2 * t)

    // ---- route tier ----
    const routeIsEnter = () =>
      (window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'enter') === 'enter'
    let showcase = routeIsEnter()
    buildStatic(showcase)
    layoutQuads(showcase)
    quadUniforms.uShowcase.value = showcase ? 1 : 0.5
    computeWaypoints()

    // ---- drive state ----
    let progress = 0
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress = self.progress
      },
    })
    const pm = { x: 0, y: 0 }
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.5)
    const hit = new THREE.Vector3()

    const clock = new THREE.Clock()
    let lastInput = performance.now()
    let ticking = false
    const wake = () => {
      lastInput = performance.now()
      if (!ticking && !reduced && !document.hidden) {
        ticking = true
        gsap.ticker.add(loop)
      }
    }

    function loop() {
      const dt = Math.min(0.05, clock.getDelta())
      const t = clock.elapsedTime
      if (performance.now() - lastInput > IDLE_MS) {
        xs.vel = 0
        ticking = false
        gsap.ticker.remove(loop)
        return
      }
      // journey: interpolate waypoints, then ease the camera toward them
      // (scrub-reversible target, lerped body — interruptible by physics)
      const onIndex = routeIsEnter() && fracs.some((f) => f >= 0)
      if (onIndex) {
        let i = 0
        while (i < fracs.length - 2 && progress >= fracs[i + 1] && fracs[i + 1] >= 0) i++
        const f0 = Math.max(0, fracs[i])
        const f1 = i + 1 < fracs.length && fracs[i + 1] >= 0 ? fracs[i + 1] : 1
        const lt = ease01(Math.min(1, Math.max(0, (progress - f0) / Math.max(1e-4, f1 - f0))))
        const A = WAYPOINTS[i]
        const B = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)]
        camTarget.set(
          A[0] + (B[0] - A[0]) * lt,
          A[1] + (B[1] - A[1]) * lt,
          A[2] + (B[2] - A[2]) * lt,
        )
      } else {
        camTarget.set(0, 0.4, 12)
      }
      const agitation = 1 + Math.min(1, xs.vel * 2) * 2.4
      camera.position.x += (camTarget.x + pm.x * 1.3 - camera.position.x) * 0.06
      camera.position.y += (camTarget.y - pm.y * 0.9 - camera.position.y) * 0.06
      camera.position.z += (camTarget.z - camera.position.z) * 0.06
      lookTarget.set(camera.position.x * 0.4, camera.position.y * 0.5, -6)
      camera.lookAt(lookTarget)

      group.rotation.y = progress * Math.PI * 0.35
      rim.position.x = -7 + Math.sin(t * 0.3) * 3
      rim.position.z = -4 + Math.cos(t * 0.22) * 2
      stars.rotation.y = t * 0.008 + progress * 0.4
      for (const child of group.children) {
        const mm = child as Floater
        mm.rotation.x += mm.userData.rx * dt * agitation
        mm.rotation.y += mm.userData.ry * dt * agitation
        mm.position.y =
          mm.userData.by + Math.sin(t * mm.userData.fs + mm.userData.fo) * mm.userData.fa
      }

      // scroll kindle only (the pointer bends, never lights)
      const vBoost = Math.min(1, xs.vel * 1.5) * 0.3
      xs.vel *= 0.9

      // fingertip air: unproject the eased pointer once per frame, derive
      // world velocity, lay trail samples, drain strengths — one uniform
      // write, no per-move work
      wPos.x += (btx - wPos.x) * 0.25
      wPos.y += (bty - wPos.y) * 0.25
      ndc.set((wPos.x / window.innerWidth) * 2 - 1, -(wPos.y / window.innerHeight) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        const wvx = bInside ? (hit.x - wPrev.x) / Math.max(1, dt * 1000) * 1000 : 0
        const wvy = bInside ? (hit.y - wPrev.y) / Math.max(1, dt * 1000) * 1000 : 0
        wVel.x += (wvx - wVel.x) * 0.2
        wVel.y += (wvy - wVel.y) * 0.2
        wPrev.x = hit.x
        wPrev.y = hit.y
        if (bInside && performance.now() - lastSample > 40) {
          lastSample = performance.now()
          trail.pop()
          trail.unshift({ x: hit.x, y: hit.y, s: 1 })
        }
        const arr = quadUniforms.uTrail.value as THREE.Vector3[]
        for (let i = 0; i < trail.length; i++) {
          trail[i].s *= 0.96
          arr[i].set(trail[i].x, trail[i].y, trail[i].s)
        }
        ;(quadUniforms.uWakeVel.value as THREE.Vector2).set(wVel.x, wVel.y)
      }
      // uniforms: the whole quad field runs on time + scroll + wake
      quadUniforms.uTime.value = t
      quadUniforms.uVel.value = vBoost

      renderer.render(scene, camera)
    }

    const onMove = (e: PointerEvent) => {
      pm.x = e.clientX / window.innerWidth - 0.5
      pm.y = e.clientY / window.innerHeight - 0.5
      btx = e.clientX
      bty = e.clientY
      bInside = true
      wake()
    }
    const onGone = () => {
      bInside = false
    }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      computeWaypoints()
      wake()
    }
    const onHash = () => {
      showcase = routeIsEnter()
      buildStatic(showcase)
      layoutQuads(showcase)
      quadUniforms.uShowcase.value = showcase ? 1 : 0.5
      computeWaypoints()
      wake()
    }
    const onVis = () => {
      if (document.hidden) {
        if (ticking) {
          ticking = false
          gsap.ticker.remove(loop)
        }
      } else {
        wake()
      }
    }

    if (reduced) {
      // one clean static frame, zero ticker burn
      renderer.render(scene, camera)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    computeWaypoints()
    setTimeout(computeWaypoints, 2000) // webfonts shift layout — re-measure

    // debug handle: layer isolation for evidence captures (kept, harmless)
    ;(window as unknown as { __voidworld?: object }).__voidworld = {
      setLines: (v: boolean) => statics.forEach((o) => { o.visible = v }),
      setQuads: (v: boolean) => { quads.visible = v },
      setSolids: (v: boolean) => { group.visible = v },
      setStars: (v: boolean) => { stars.visible = v },
    }

    ticking = true
    gsap.ticker.add(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointermove', wake, { passive: true })
    window.addEventListener('pointerdown', wake, { passive: true })
    window.addEventListener('wheel', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('pointerleave', onGone, { passive: true })
    window.addEventListener('blur', onGone)
    window.addEventListener('resize', onResize)
    window.addEventListener('hashchange', onHash)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('wheel', wake)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('pointerleave', onGone)
      window.removeEventListener('blur', onGone)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('visibilitychange', onVis)
      gsap.ticker.remove(loop)
      st.kill()
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose())
        else if (mat) mat.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} className="world-fixed" aria-hidden="true" />
}
