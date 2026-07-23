'use client'

/* ──────────────────────────────────────────────────────────────────────────
   Ekam Finance — landing page
   A single scroll journey. A fixed WebGL particle cloud morphs through:
   chaos → ₹ → growth arrow → wallet → Ekam logo, while copy sections
   scroll over it. Emerald core + gold accents on black.
   Fallback: static layout for reduced-motion / no-WebGL / tiny screens.
   ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowUpRight, LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Shield,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'

gsap.registerPlugin(ScrollTrigger)

const TOOLS = [
  { icon: LayoutDashboard, label: 'Dashboard',    note: 'Net worth at a glance'            },
  { icon: ArrowLeftRight,  label: 'Transactions', note: 'Every rupee, logged'              },
  { icon: Calculator,      label: 'Budget',       note: 'Monthly limits by category'       },
  { icon: TrendingUp,      label: 'Investments',  note: 'Stocks, SIPs, crypto, more'       },
  { icon: Target,          label: 'Goals',        note: 'Save toward what matters'         },
  { icon: CalendarClock,   label: 'Bills',        note: 'No payment slips through'         },
  { icon: BarChart3,       label: 'Reports',      note: 'Calendar view, charts, AI digest' },
  { icon: Shield,          label: 'Secure',       note: 'Your data stays yours'            },
]

/* ────────────────────────── shape target generation ───────────────────────
   Each morph target is a Float32Array of xyz positions in a roughly
   [-1,1] world box. Glyph-based targets are rasterized from an offscreen
   canvas and sampled where ink exists; z gets small noise for depth.     */

function jitter(mag: number) { return (Math.random() - 0.5) * 2 * mag }

function chaosTarget(count: number): Float32Array {
  // loose swarm: gaussian-ish ball with strays
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.42) * 1.35
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    arr[i * 3]     = r * Math.sin(ph) * Math.cos(th)
    arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.8
    arr[i * 3 + 2] = r * Math.cos(ph) * 0.55
  }
  return arr
}

function sampleCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, count: number, depth = 0.16): Float32Array {
  const S = 320
  const cv = document.createElement('canvas')
  cv.width = S; cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, S, S)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, S, S)
  const img = ctx.getImageData(0, 0, S, S).data
  const pts: number[] = []
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    if (img[(y * S + x) * 4 + 3] > 100) pts.push(x, y)
  }
  const arr = new Float32Array(count * 3)
  const n = pts.length / 2
  for (let i = 0; i < count; i++) {
    const k = (Math.random() * n) | 0
    const px = pts[k * 2], py = pts[k * 2 + 1]
    arr[i * 3]     = ((px / S) * 2 - 1) * 1.15 + jitter(0.012)
    arr[i * 3 + 1] = (1 - (py / S) * 2) * 1.15 + jitter(0.012)
    arr[i * 3 + 2] = jitter(depth)
  }
  return arr
}

function rupeeTarget(count: number): Float32Array {
  return sampleCanvas((ctx, w, h) => {
    ctx.font = `900 ${h * 0.82}px Arial, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('₹', w / 2, h / 2 + h * 0.03)
  }, count)
}

function arrowTarget(count: number): Float32Array {
  return sampleCanvas((ctx, w, h) => {
    ctx.lineWidth = h * 0.075
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    // rising zig-zag
    ctx.beginPath()
    ctx.moveTo(w * 0.10, h * 0.82)
    ctx.lineTo(w * 0.34, h * 0.55)
    ctx.lineTo(w * 0.52, h * 0.68)
    ctx.lineTo(w * 0.86, h * 0.22)
    ctx.stroke()
    // arrow head
    ctx.beginPath()
    ctx.moveTo(w * 0.62, h * 0.20)
    ctx.lineTo(w * 0.88, h * 0.18)
    ctx.lineTo(w * 0.87, h * 0.44)
    ctx.closePath()
    ctx.fill()
    // baseline candles
    const bars = [0.30, 0.48, 0.40, 0.62]
    bars.forEach((bh, i) => {
      const bx = w * (0.14 + i * 0.2)
      ctx.fillRect(bx, h * (0.92 - bh * 0.28), w * 0.055, h * bh * 0.28)
    })
  }, count)
}

function walletTarget(count: number): Float32Array {
  return sampleCanvas((ctx, w, h) => {
    const r = w * 0.06
    // body
    roundRect(ctx, w * 0.12, h * 0.30, w * 0.76, h * 0.46, r); ctx.fill()
    // flap notch (cut a hole then add clasp)
    ctx.globalCompositeOperation = 'destination-out'
    roundRect(ctx, w * 0.60, h * 0.44, w * 0.34, h * 0.18, r * 0.7); ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    roundRect(ctx, w * 0.63, h * 0.47, w * 0.28, h * 0.12, r * 0.55); ctx.fill()
    // coin above
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.16, h * 0.075, 0, Math.PI * 2); ctx.fill()
  }, count)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function logoTarget(count: number): Promise<Float32Array> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      resolve(sampleCanvas((ctx, w, h) => {
        const s = Math.min(w, h) * 0.78
        ctx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s)
      }, count))
    }
    img.onerror = () => {
      // fallback: wordmark
      resolve(sampleCanvas((ctx, w, h) => {
        ctx.font = `900 ${h * 0.34}px Arial, sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('ekam', w / 2, h / 2)
      }, count))
    }
    img.src = '/logo.png'
  })
}

/* ───────────────────────────── shaders ──────────────────────────────── */

const VERT = /* glsl */`
  attribute vec3 t0; attribute vec3 t1; attribute vec3 t2; attribute vec3 t3; attribute vec3 t4;
  attribute float aSeed;
  uniform float uProgress;   // 0..4
  uniform float uTime;
  uniform vec2  uMouse;      // NDC
  uniform float uMouseOn;
  uniform float uPixelRatio;
  uniform vec2  uShift;      // world-space cloud offset per stage
  varying float vSeed;
  varying float vGlow;

  void main() {
    vSeed = aSeed;

    // per-particle stagger, then ease each segment
    float p   = clamp(uProgress - aSeed * 0.22, 0.0, 4.0);
    float seg = floor(min(p, 3.999));
    float f   = p - seg;
    f = f * f * (3.0 - 2.0 * f);
    float q = seg + f;

    // branch-free tent weights (sum to 1 for q in [0,4])
    float w0 = max(0.0, 1.0 - abs(q - 0.0));
    float w1 = max(0.0, 1.0 - abs(q - 1.0));
    float w2 = max(0.0, 1.0 - abs(q - 2.0));
    float w3 = max(0.0, 1.0 - abs(q - 3.0));
    float w4 = max(0.0, 1.0 - abs(q - 4.0));
    vec3 pos = t0 * w0 + t1 * w1 + t2 * w2 + t3 * w3 + t4 * w4;

    // chaos wobble — strongest at stage 0, fades as form resolves
    float chaosAmp = mix(0.15, 0.02, clamp(q, 0.0, 1.0));
    float t = uTime * 0.6 + aSeed * 6.2831;
    pos += vec3(
      sin(t + pos.y * 3.1),
      cos(t * 1.3 + pos.x * 2.7),
      sin(t * 0.8 + pos.z * 4.0)
    ) * chaosAmp * (0.4 + aSeed * 0.6);

    // gentle breathing
    pos *= 1.0 + sin(uTime * 0.5 + aSeed * 3.0) * 0.012;

    // park the cloud opposite the copy for the current stage
    pos.xy += uShift;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / max(clip.w, 0.0001);

    // cursor repel + glow
    float d = distance(ndc, uMouse);
    float infl = (1.0 - smoothstep(0.0, 0.4, d)) * uMouseOn;
    vGlow = infl;
    vec2 dir = ndc - uMouse;
    float len = max(length(dir), 0.001);
    mv.xy += (dir / len) * infl * 0.24;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed * 3.5) * uPixelRatio * (3.0 / max(-mv.z, 0.1)) * (1.0 + infl * 0.8);
  }
`

const FRAG = /* glsl */`
  varying float vSeed;
  varying float vGlow;
  uniform float uTime;

  void main() {
    // rotating triangle sprite mask
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float rot = vSeed * 6.2831 + uTime * (0.15 + vSeed * 0.35);
    float cr = cos(rot), sr = sin(rot);
    p = mat2(cr, -sr, sr, cr) * p;
    float d = max(abs(p.x) * 0.866 + p.y * 0.5, -p.y * 0.9);
    float alpha = 1.0 - smoothstep(0.55, 0.78, d);
    if (alpha < 0.02) discard;

    // emerald core -> gold accent by seed, shimmer over time
    vec3 emerald = vec3(0.063, 0.725, 0.506);
    vec3 mint    = vec3(0.427, 0.906, 0.718);
    vec3 gold    = vec3(0.961, 0.620, 0.043);
    float band = fract(vSeed * 7.0 + uTime * 0.05);
    vec3 col = mix(emerald, mint, smoothstep(0.2, 0.8, vSeed));
    col = mix(col, gold, step(0.86, band) * 0.9);
    col += vGlow * 0.55;

    gl_FragColor = vec4(col, alpha * (0.55 + vSeed * 0.45));
  }
`


/* ─────────────────────────── particle canvas ────────────────────────── */

function ParticleField({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL — CSS fallback bg remains
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const COUNT = isMobile ? 3500 : 12000

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20)
    camera.position.z = 3.1

    const geo = new THREE.BufferGeometry()
    const seeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) seeds[i] = Math.random()
    geo.setAttribute('position', new THREE.BufferAttribute(chaosTarget(COUNT), 3)) // required by three
    geo.setAttribute('t0', new THREE.BufferAttribute(chaosTarget(COUNT), 3))
    geo.setAttribute('t1', new THREE.BufferAttribute(rupeeTarget(COUNT), 3))
    geo.setAttribute('t2', new THREE.BufferAttribute(arrowTarget(COUNT), 3))
    geo.setAttribute('t3', new THREE.BufferAttribute(walletTarget(COUNT), 3))
    geo.setAttribute('t4', new THREE.BufferAttribute(chaosTarget(COUNT), 3)) // placeholder until logo loads
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    logoTarget(COUNT).then(arr => {
      geo.setAttribute('t4', new THREE.BufferAttribute(arr, 3))
    })

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uProgress:   { value: 0 },
        uTime:       { value: 0 },
        uMouse:      { value: new THREE.Vector2(10, 10) },
        uMouseOn:    { value: isMobile ? 0 : 1 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uShift:      { value: new THREE.Vector2(0, 0) },
      },
    })

    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    scene.add(points)

    const mouse = new THREE.Vector2(10, 10)
    function onMove(e: PointerEvent) {
      mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    }
    if (!isMobile) window.addEventListener('pointermove', onMove, { passive: true })

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // cloud sits opposite each stage's copy: hero copy left, S1 right, S2 left, S3 right, S4 center
    const SHIFT_X = [0.85, -0.8, 0.8, -0.8, 0]
    const SHIFT_Y = [0, 0, 0, 0, 0.12]
    const narrow = window.matchMedia('(max-width: 1024px)').matches
    const shiftScale = narrow ? 0.35 : 1  // small screens: keep cloud near center behind copy

    let raf = 0
    const clock = new THREE.Clock()
    function tick() {
      mat.uniforms.uTime.value = clock.getElapsedTime()
      mat.uniforms.uProgress.value += (progressRef.current - mat.uniforms.uProgress.value) * 0.08
      mat.uniforms.uMouse.value.lerp(mouse, 0.12)

      // blend stage shifts with the same tent weights as the shader
      const q = Math.max(0, Math.min(4, mat.uniforms.uProgress.value))
      let sx = 0, sy = 0
      for (let n = 0; n <= 4; n++) {
        const w = Math.max(0, 1 - Math.abs(q - n))
        sx += SHIFT_X[n] * w; sy += SHIFT_Y[n] * w
      }
      mat.uniforms.uShift.value.set(sx * shiftScale, sy)

      points.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.12
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      if (!isMobile) window.removeEventListener('pointermove', onMove)
      geo.dispose(); mat.dispose(); renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [progressRef])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(16,185,129,0.05) 0%, transparent 65%), #030303' }}
    />
  )
}


/* ──────────────────── stage progress rail (desktop) ─────────────────── */

const STAGE_LABELS = ['Start', 'Tools', 'India', 'Handled', 'Go']

function StageRail({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    let raf = 0
    function tick() {
      const p = progressRef.current
      dotRefs.current.forEach((el, i) => {
        if (!el) return
        const w = Math.max(0, 1 - Math.abs(p - i))
        el.style.opacity = String(0.25 + w * 0.75)
        el.style.transform = `scale(${1 + w * 0.6})`
        const label = el.nextElementSibling as HTMLElement | null
        if (label) label.style.opacity = String(w > 0.55 ? 0.85 : 0)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-5" style={{ zIndex: 9 }}>
      {STAGE_LABELS.map((l, i) => (
        <div key={l} className="flex items-center gap-2 flex-row-reverse">
          <div ref={el => { dotRefs.current[i] = el }} className="w-2 h-2 rounded-full transition-transform duration-300"
            style={{ background: '#34d399', opacity: 0.25 }} />
          <span className="text-[10px] uppercase tracking-widest font-semibold transition-opacity duration-300"
            style={{ color: 'rgba(255,255,255,0.6)', opacity: 0 }}>{l}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────── background drifting outline triangles ───────────── */

function DriftTriangles() {
  const tris = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      left: `${(i * 71) % 100}%`,
      top: `${(i * 37) % 100}%`,
      size: 10 + (i % 4) * 9,
      dur: 22 + (i % 5) * 8,
      delay: -(i * 3.7),
      gold: i % 5 === 0,
    }))
  ).current
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {tris.map((t, i) => (
        <svg key={i} width={t.size} height={t.size} viewBox="0 0 24 24" className="absolute animate-drift"
          style={{ left: t.left, top: t.top, animationDuration: `${t.dur}s`, animationDelay: `${t.delay}s`, opacity: 0.05 }}>
          <path d="M12 3 L21 20 L3 20 Z" fill="none" stroke={t.gold ? '#f59e0b' : '#10b981'} strokeWidth="1.4" />
        </svg>
      ))}
    </div>
  )
}

/* ───────────────────────────── copy stages ──────────────────────────── */

function Stage({ align = 'left', kicker, title, children, innerRef }: {
  align?: 'left' | 'right' | 'center'
  kicker?: string
  title: React.ReactNode
  children?: React.ReactNode
  innerRef?: React.Ref<HTMLDivElement>
}) {
  const alignCls = align === 'center'
    ? 'items-center text-center'
    : align === 'right' ? 'items-end text-right ml-auto' : 'items-start text-left'
  return (
    <section className="relative min-h-screen flex items-center px-6" style={{ zIndex: 2 }}>
      <div ref={innerRef} className={`stage-copy max-w-6xl mx-auto w-full flex flex-col ${alignCls}`} style={{ textShadow: '0 2px 24px rgba(0,0,0,0.85)' }}>
        <div className="max-w-md">
          {kicker && <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#10b981' }}>{kicker}</p>}
          <h2 className="font-black text-white mb-5" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}>{title}</h2>
          {children}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── page ───────────────────────────────── */

export default function LandingPage() {
  const progressRef = useRef(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState<boolean | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    const lenis = new Lenis({ lerp: 0.1 })
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
    const id = requestAnimationFrame(raf)
    lenis.on('scroll', ScrollTrigger.update)

    const st = ScrollTrigger.create({
      trigger: mainRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: self => { progressRef.current = self.progress * 4 },
    })

    const copies = gsap.utils.toArray<HTMLElement>('.stage-copy')
    const copyTriggers = copies.map(el =>
      gsap.fromTo(el, { opacity: 0, y: 42 }, {
        opacity: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'top 45%', scrub: true },
      })
    )

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
      st.kill()
      copyTriggers.forEach(t => { t.scrollTrigger?.kill(); t.kill() })
    }
  }, [reduced])

  if (reduced === null) {
    return <div className="min-h-screen" style={{ background: '#030303' }} />
  }

  return (
    <div ref={mainRef} className="relative" style={{ background: '#030303', color: '#fff' }}>
      {!reduced && <ParticleField progressRef={progressRef} />}
      {!reduced && <DriftTriangles />}
      {!reduced && <StageRail progressRef={progressRef} />}
      {reduced && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(16,185,129,0.12) 0%, transparent 65%), #030303' }} />
      )}

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 px-6 py-4" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-4 py-2.5"
          style={{ background: 'rgba(8,8,8,0.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <Logo size={22} />
            </span>
            <span className="text-sm font-bold tracking-tight">ekam</span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.45)' }}>Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#000' }}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Stage 0 — chaos */}
      <section className="relative min-h-screen flex items-center px-6" style={{ zIndex: 2 }}>
        <div className="stage-copy max-w-6xl mx-auto w-full">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#6ee7b7' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Made in India
            </div>
            <h1 className="font-black leading-none mb-6" style={{ fontSize: 'clamp(44px, 6.5vw, 80px)', letterSpacing: '-0.03em' }}>
              One app for<br />
              <span style={{ background: 'linear-gradient(100deg, #10b981 10%, #f59e0b 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every rupee.</span>
            </h1>
            <p className="text-lg mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '420px' }}>
              You know when your salary hits and by the 20th you have no idea where it went?
            </p>
            <p className="text-lg mb-10 font-medium" style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '420px' }}>
              That is what Ekam solves.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/signup" className="flex items-center gap-1.5 text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
                style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#000' }}>
                Start free <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="text-sm px-6 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Sign in
              </Link>
            </div>
            <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.22)' }}>Free. No card required. No ads.</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
          <div className="w-px h-8 animate-pulse" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </section>

      {/* Stage 1 — ₹ : every rupee tracked */}
      <Stage align="right" kicker="Every rupee, accounted" title={<>Eight tools.<br />One tab.</>}>
        <p className="text-base leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Everything your money touches, tracked in one place. No tab hopping, no spreadsheets.
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-2">
          {TOOLS.map(t => {
            const Icon = t.icon
            return (
              <div key={t.label} className="flex items-start gap-2.5 text-left">
                <span className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                  <Icon className="w-3 h-3" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{t.label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Stage>

      {/* Stage 2 — arrow : growth */}
      <Stage align="left" kicker="Built for India" title={<>INR first.<br />April tax year.<br />Kolkata timezone.</>}>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Not a US app retrofitted for India. Every default was chosen for how Indians actually manage money.
        </p>
        <div className="flex flex-wrap gap-2">
          {['SIPs and stocks', 'Crypto too', 'AI monthly digest'].map(chip => (
            <span key={chip} className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
              {chip}
            </span>
          ))}
        </div>
      </Stage>

      {/* Stage 3 — wallet : everything handled */}
      <Stage align="right" kicker="Yours, always" title={<>Budgets, bills,<br />goals. Handled.</>}>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Set monthly limits, never miss a payment, and save toward what matters. All in one place.
        </p>
        <div className="inline-flex flex-col gap-1 px-5 py-4 rounded-2xl text-left"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
          <p className="text-xl font-black" style={{ color: '#34d399' }}>Free forever</p>
          <p className="text-sm" style={{ color: 'rgba(110,231,183,0.7)' }}>No credit card, no subscriptions</p>
        </div>
      </Stage>

      {/* Stage 4 — logo : CTA */}
      <section className="relative min-h-screen flex items-center justify-center px-6 text-center" style={{ zIndex: 2 }}>
        <div className="stage-copy max-w-xl mx-auto">
          <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(34px, 5vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Start knowing where your money goes.
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>Takes two minutes to set up.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-9 py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#000' }}>
            Create free account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-10" style={{ zIndex: 2, background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.055)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center overflow-hidden">
              <Logo size={18} />
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>Ekam Finance</span>
          </Link>
          <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Made by{' '}
            <a href="https://www.linkedin.com/in/sbktckp/" target="_blank" rel="noopener noreferrer"
              className="font-semibold transition-colors duration-150 hover:text-emerald-400 underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.18)' }}>
              Smit Bharat Patil
            </a>
          </p>
          <div className="flex items-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
            <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
            <Link href="/signup" className="transition-colors hover:text-white">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
