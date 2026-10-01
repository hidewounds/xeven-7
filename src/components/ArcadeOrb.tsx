import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ArcadeOrb() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 20)
    camera.position.z = 4.3
    const group = new THREE.Group()
    scene.add(group)

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x7e68ff, emissive: 0x23114d, emissiveIntensity: 0.75, metalness: 0.35, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.18 })
    )
    group.add(orb)
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), new THREE.MeshBasicMaterial({ color: 0xa991ff, transparent: true, opacity: 0.08, side: THREE.BackSide }))
    group.add(halo)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd2c6ff, transparent: true, opacity: 0.52 })
    for (const config of [[1.45, 0.38, 0.2], [1.66, 0.2, -0.65], [1.92, 0.1, 1.05]] as const) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(config[0], config[1] * 0.012, 8, 96), ringMaterial.clone())
      ring.rotation.set(config[2], config[2] * 0.7, config[2] * 1.5)
      group.add(ring)
    }
    const particleGeometry = new THREE.BufferGeometry()
    const particles = new Float32Array(240 * 3)
    for (let i = 0; i < particles.length; i += 3) {
      const a = Math.random() * Math.PI * 2
      const r = 1.55 + Math.random() * 0.6
      particles[i] = Math.cos(a) * r
      particles[i + 1] = (Math.random() - 0.5) * 1.6
      particles[i + 2] = Math.sin(a) * r
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
    group.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xd9ff4f, size: 0.018, transparent: true, opacity: 0.8 })))
    scene.add(new THREE.AmbientLight(0x9aa8ff, 1.6))
    const key = new THREE.PointLight(0xe8ddff, 16, 12)
    key.position.set(-2, 2, 3)
    scene.add(key)
    const fill = new THREE.PointLight(0x6d43ff, 12, 10)
    fill.position.set(2, -1, 1)
    scene.add(fill)

    const resize = () => { const box = canvas.getBoundingClientRect(); renderer.setSize(Math.max(1, box.width), Math.max(1, box.height), false); camera.aspect = box.width / Math.max(1, box.height); camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    let raf = 0
    const tick = (time: number) => {
      const t = time * 0.001
      group.rotation.y = reduced ? 0.32 : t * 0.28
      group.rotation.x = Math.sin(t * 0.7) * 0.08
      orb.rotation.y = t * 0.48
      renderer.render(scene, camera)
      if (!reduced) raf = requestAnimationFrame(tick)
    }
    tick(0)
    return () => { cancelAnimationFrame(raf); observer.disconnect(); renderer.dispose(); particleGeometry.dispose(); orb.geometry.dispose(); (orb.material as THREE.Material).dispose() }
  }, [])

  return <canvas ref={ref} className="arcade-orb-canvas" aria-label="Rotating XEVEN signal orb" />
}
