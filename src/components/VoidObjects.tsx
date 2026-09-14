import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* VOID OBJECTS — the cinematic WebGL layer above the STRATA field.
 * Floating wireframe solids (lit: ambient + mint key + orbiting ember rim),
 * an additive particle starfield, and exponential haze for depth. The camera
 * dollies with page scroll, drifts with the pointer, and the solids agitate
 * with scroll velocity then settle — assemble/disassemble by motion, never
 * by cuts. Discipline: DPR capped, 6s idle sleep, hidden-tab aware, full
 * stand-down under reduced motion, halved particles on coarse pointers.
 * Loaded lazily (own chunk) so first paint never waits for three.js.
 */

interface Floater extends THREE.Mesh {
  userData: {
    rx: number
    ry: number
    fs: number
    fo: number
    fa: number
    by: number
  }
}

export default function VoidObjects() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const coarse =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarse,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x06090f, 0.05)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      140,
    )
    camera.position.set(0, 0, 9)

    scene.add(new THREE.AmbientLight(0x8a97a3, 0.55))
    const key = new THREE.DirectionalLight(0x9cf5d3, 1.15)
    key.position.set(5, 8, 6)
    scene.add(key)
    const rim = new THREE.PointLight(0xff4d2e, 14, 46, 2)
    rim.position.set(-7, -3, -4)
    scene.add(rim)

    // starfield: one Points draw, additive, depth-silent
    const COUNT = coarse ? 500 : 1200
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 64
      pos[i * 3 + 1] = (Math.random() - 0.5) * 38
      pos[i * 3 + 2] = -4 - Math.random() * 42
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xe8edee,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // floating solids: shared materials, wireframe lit edges
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xe8edee,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
      roughness: 0.4,
      metalness: 0.1,
    })
    const mintMat = new THREE.MeshStandardMaterial({
      color: 0x9cf5d3,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      roughness: 0.4,
      metalness: 0.1,
    })
    const group = new THREE.Group()
    scene.add(group)
    const specs: Array<{
      geo: THREE.BufferGeometry
      mat: THREE.Material
      p: [number, number, number]
    }> = [
      { geo: new THREE.IcosahedronGeometry(1.5, 0), mat: boneMat, p: [-5.6, 1.7, -6] },
      { geo: new THREE.OctahedronGeometry(1.15, 0), mat: boneMat, p: [5.3, -1.5, -9] },
      { geo: new THREE.TorusKnotGeometry(0.95, 0.3, 110, 12), mat: mintMat, p: [3.5, 2.7, -13] },
      { geo: new THREE.TetrahedronGeometry(1.35, 0), mat: boneMat, p: [-3.9, -2.9, -17] },
    ]
    for (const s of specs) {
      const mesh = new THREE.Mesh(s.geo, s.mat) as Floater
      mesh.position.set(...s.p)
      mesh.userData = {
        rx: 0.12 + Math.random() * 0.22,
        ry: 0.15 + Math.random() * 0.25,
        fs: 0.25 + Math.random() * 0.4,
        fo: Math.random() * Math.PI * 2,
        fa: 0.35 + Math.random() * 0.4,
        by: s.p[1],
      }
      group.add(mesh)
    }

    let progress = 0
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        progress = self.progress
      },
    })

    const pm = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      pm.x = e.clientX / window.innerWidth - 0.5
      pm.y = e.clientY / window.innerHeight - 0.5
    }

    const clock = new THREE.Clock()
    let lastInput = performance.now()
    let ticking = true
    const wake = () => {
      lastInput = performance.now()
      if (!ticking && !document.hidden) {
        ticking = true
        gsap.ticker.add(loop)
      }
    }
    const poke = () => {
      lastInput = performance.now()
    }

    function loop() {
      const dt = Math.min(0.05, clock.getDelta())
      const t = clock.elapsedTime
      // idle sleep: freeze on the last frame, zero ticker burn
      if (performance.now() - lastInput > 6000) {
        ticking = false
        gsap.ticker.remove(loop)
        return
      }
      // velocity agitation: fast scrolls stir the solids, stillness settles
      const agitation = 1 + Math.min(1, xs.vel * 2) * 2.4
      group.rotation.y = progress * Math.PI * 0.9
      camera.position.z = 9 + progress * 7
      camera.position.x += (pm.x * 1.3 - camera.position.x) * 0.045
      camera.position.y += (-pm.y * 0.9 - camera.position.y) * 0.045
      camera.lookAt(0, 0, -8)
      rim.position.x = -7 + Math.sin(t * 0.3) * 3
      rim.position.z = -4 + Math.cos(t * 0.22) * 2
      stars.rotation.y = t * 0.008 + progress * 0.4
      for (const child of group.children) {
        const m = child as Floater
        m.rotation.x += m.userData.rx * dt * agitation
        m.rotation.y += m.userData.ry * dt * agitation
        m.position.y =
          m.userData.by + Math.sin(t * m.userData.fs + m.userData.fo) * m.userData.fa
      }
      renderer.render(scene, camera)
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
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

    gsap.ticker.add(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointermove', poke, { passive: true })
    window.addEventListener('wheel', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('pointerdown', wake, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', poke)
      window.removeEventListener('wheel', wake)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('resize', onResize)
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

  return <canvas ref={ref} className="void-fixed" aria-hidden="true" />
}
