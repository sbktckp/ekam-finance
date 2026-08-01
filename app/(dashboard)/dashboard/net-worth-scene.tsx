'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ambient WebGL backdrop for the dashboard hero.
 *
 * Deliberately cheap: one Points cloud plus one wireframe core, no lights, no
 * shadows, no post-processing. It pauses whenever it is offscreen or the tab is
 * hidden, caps DPR at 1.5, and renders a single static frame for anyone who has
 * asked for reduced motion.
 *
 * @param positive  Tints the field emerald when cash flow is positive, rose when not.
 * @param intensity 0..1, drives rotation speed and particle spread.
 */
export function NetWorthScene({ positive = true, intensity = 0.5 }: { positive?: boolean; intensity?: number }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // Guard against browsers/devices without WebGL rather than throwing.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const k = Math.max(0, Math.min(1, intensity))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.z = 5.2

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    host.appendChild(canvas)

    const group = new THREE.Group()
    scene.add(group)

    // Particle field traced along a torus knot, with a little jitter so it
    // reads as a cloud rather than a wire.
    const COUNT = 560
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)

    const hot = new THREE.Color(positive ? '#34d399' : '#fb7185')
    const cool = new THREE.Color('#8b5cf6')
    const spread = 0.22 + k * 0.35

    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2
      const p = 2, q = 3
      const r = 1.6 + 0.5 * Math.cos(q * t)
      const x = r * Math.cos(p * t)
      const y = r * Math.sin(p * t)
      const z = 0.6 * Math.sin(q * t)

      positions[i * 3]     = x + (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * spread

      const mix = hot.clone().lerp(cool, (Math.sin(t * 1.5) + 1) / 2)
      colors[i * 3]     = mix.r
      colors[i * 3 + 1] = mix.g
      colors[i * 3 + 2] = mix.b
    }

    const cloudGeo = new THREE.BufferGeometry()
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const cloudMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const cloud = new THREE.Points(cloudGeo, cloudMat)
    group.add(cloud)

    // Faint wireframe core so the centre does not read as empty.
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1)
    const coreMat = new THREE.MeshBasicMaterial({
      color: hot,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    group.add(core)

    function resize() {
      const w = host!.clientWidth || 1
      const h = host!.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // Pointer parallax, normalised to the host box and eased toward the target.
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    function onPointerMove(e: PointerEvent) {
      const rect = host!.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    function onPointerLeave() { target.x = 0; target.y = 0 }
    if (!reduced) {
      host.addEventListener('pointermove', onPointerMove)
      host.addEventListener('pointerleave', onPointerLeave)
    }

    let raf = 0
    let running = false
    let visible = true
    let inView = true
    const clock = new THREE.Clock()

    function frame() {
      const dt = Math.min(clock.getDelta(), 0.05)
      pointer.x += (target.x - pointer.x) * 0.05
      pointer.y += (target.y - pointer.y) * 0.05

      group.rotation.y += dt * (0.10 + k * 0.22)
      group.rotation.x = pointer.y * 0.22
      group.rotation.z = pointer.x * 0.10
      core.rotation.y -= dt * 0.35
      core.rotation.x += dt * 0.12

      camera.position.x = pointer.x * 0.35
      camera.position.y = -pointer.y * 0.25
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (running || reduced || !visible || !inView) return
      running = true
      clock.getDelta()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    // A single frame is always drawn, so reduced-motion users still see the art.
    renderer.render(scene, camera)

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      inView ? start() : stop()
    }, { threshold: 0.05 })
    io.observe(host)

    function onVisibility() {
      visible = document.visibilityState === 'visible'
      visible ? start() : stop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    start()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      cloudGeo.dispose()
      cloudMat.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      renderer.dispose()
      if (canvas.parentNode === host) host.removeChild(canvas)
    }
  }, [positive, intensity])

  return <div ref={hostRef} aria-hidden className="absolute inset-0 pointer-events-auto" />
}

export default NetWorthScene
