'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  LayoutDashboard, ArrowLeftRight, Calculator,
  TrendingUp, Target, CalendarClock, BarChart3, Shield,
  ArrowUpRight,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

// ScrollTrigger must be registered before ANY component's effect creates a
// ScrollTrigger instance. Registering here at module scope (client-only)
// guarantees that, regardless of effect ordering between components.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function reducedMotion() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrambleTo(el: HTMLElement, final: string, duration = 850) {
  const digits = '0123456789'
  const start = performance.now()
  function frame(now: number) {
    const p = (now - start) / duration
    if (p >= 1) { el.textContent = final; return }
    el.textContent = final.split('').map(ch => (/\d/.test(ch) ? digits[Math.floor(Math.random() * 10)] : ch)).join('')
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCounter(target: number, active: boolean, ms = 1600) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, ms])
  return v
}

function useMagnetic<T extends HTMLElement>(strength = 0.32) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - r.left - r.width / 2) * strength)
      yTo((e.clientY - r.top - r.height / 2) * (strength + 0.15))
    }
    const onLeave = () => { xTo(0); yTo(0) }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])
  return ref
}

// ─── Small building blocks ──────────────────────────────────────────────────
function Word({ children }: { children: string }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
      <span className="hw" style={{ display: 'inline-block' }}>{children}</span>
    </span>
  )
}

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="sub-w" style={{ display: 'inline-block' }}>{w}&nbsp;</span>
      ))}
    </>
  )
}

function Reveal({ children, className, style, delay = 0, y = 28 }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { gsap.set(el, { opacity: 1, y: 0 }); return }
    gsap.set(el, { opacity: 0, y })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, delay, ease: 'power3.out' }),
    })
    return () => st.kill()
  }, [delay, y])
  return <div ref={ref} className={className} style={style}>{children}</div>
}

function TiltCard({ children, className, style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      ry((px - 0.5) * 12)
      rx(-(py - 0.5) * 12)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      el.style.setProperty('--sheen', '0.10')
    }
    const onLeave = () => { rx(0); ry(0); el.style.setProperty('--sheen', '0') }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return <div ref={ref} className={cn('tilt-card', className)} style={style}>{children}</div>
}

function AmbientRupees() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducedMotion() || !ref.current) return
    const els = ref.current.querySelectorAll<HTMLElement>('.particle')
    els.forEach((el, i) => {
      gsap.set(el, { y: 40, opacity: 0, x: gsap.utils.random(-20, 20) })
      gsap.to(el, {
        y: -520,
        opacity: 'random(0.05,0.16)',
        x: 'random(-30,30)',
        duration: gsap.utils.random(10, 17),
        repeat: -1,
        delay: i * 1.15,
        ease: 'none',
      })
    })
  }, [])
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="particle absolute font-bold select-none"
          style={{ left: `${6 + i * 10.5}%`, bottom: 0, fontSize: `${12 + (i % 3) * 6}px`, color: '#34d399' }}>₹</span>
      ))}
    </div>
  )
}

function BootOverlay({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducedMotion()) { onDone(); return }
    document.body.style.overflow = 'hidden'
    const ctx = gsap.context(() => {
      gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          onDone()
        },
      })
        .to('.boot-ln', { opacity: 1, duration: 0.05, stagger: 0.26 })
        .to('.boot-cursor', { opacity: 0, duration: 0.01 }, '+=0.25')
        .to(ref.current, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.15')
    }, ref)
    return () => ctx.revert()
  }, [onDone])

  return (
    <div ref={ref} className="fixed inset-0 z-[100] flex flex-col items-start justify-center px-8 sm:px-16" style={{ background: '#040404' }}>
      <div className="font-mono text-[11px] sm:text-xs tracking-widest uppercase space-y-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <p className="boot-ln opacity-0">&gt; EKAM FINANCE <span style={{ color: '#34d399' }}>v2.0</span></p>
        <p className="boot-ln opacity-0">&gt; INITIALIZING LEDGER... <span style={{ color: '#34d399' }}>OK</span></p>
        <p className="boot-ln opacity-0">&gt; SYNCING ₹ RATES... <span style={{ color: '#34d399' }}>OK</span></p>
        <p className="boot-ln opacity-0">&gt; ENCRYPTING VAULT... <span style={{ color: '#34d399' }}>OK</span></p>
        <p className="boot-ln opacity-0">&gt; READY<span className="boot-cursor inline-block w-2 h-3.5 ml-1 align-middle" style={{ background: '#34d399' }} /></p>
      </div>
    </div>
  )
}

// ─── Content data ────────────────────────────────────────────────────────────
const TOOLS = [
  { icon: LayoutDashboard, label: 'Dashboard',    note: 'Net worth at a glance'             },
  { icon: ArrowLeftRight,  label: 'Transactions', note: 'Every rupee, logged'               },
  { icon: Calculator,      label: 'Budget',        note: 'Monthly limits by category'        },
  { icon: TrendingUp,      label: 'Investments',  note: 'Stocks, SIPs, crypto, more'        },
  { icon: Target,          label: 'Goals',         note: 'Save toward what matters'          },
  { icon: CalendarClock,   label: 'Bills',         note: 'No payment slips through'          },
  { icon: BarChart3,       label: 'Reports',       note: 'Calendar view, charts, AI digest'  },
  { icon: Shield,          label: 'Secure',        note: 'Your data stays yours'             },
]

const BARS = [18, 32, 26, 55, 40, 70, 52, 84, 60, 76, 48, 90]
const GROWTH_BARS = [22, 28, 26, 40, 36, 52, 46, 64, 58, 74, 68, 86, 80, 100]

const TICKER = [
  'Dashboard', 'Transactions', 'Budget', 'Investments',
  'Goals', 'Bills', 'Reports', 'AI Insights', 'INR native',
  'Dashboard', 'Transactions', 'Budget', 'Investments',
  'Goals', 'Bills', 'Reports', 'AI Insights', 'INR native',
]

function MockCard({ amountRef }: { amountRef: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <div className="relative animate-float w-[300px]">
      <div className="absolute -inset-6 rounded-full animate-breathe" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)' }} />
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #141414 0%, #0d0d0d 100%)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)' }}>
        <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Good evening, Smit</p>
            <p ref={amountRef} className="text-[22px] font-black text-white tracking-tight tabular-nums">₹2,40,000</p>
            <p className="text-[10px]" style={{ color: '#34d399' }}>Net worth</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: 'Income', v: '₹85k', c: '#60a5fa' },
              { l: 'Spent',  v: '₹42k', c: '#f87171' },
              { l: 'Saved',  v: '₹43k', c: '#a78bfa' },
            ].map(k => (
              <div key={k.l} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{k.l}</p>
                <p className="text-xs font-bold" style={{ color: k.c }}>{k.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>This month</p>
            <div className="flex items-end gap-[3px] h-8">
              {BARS.map((h, i) => (
                <div key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, background: i === BARS.length - 1 ? '#10b981' : `rgba(16,185,129,${0.15 + (h / 100) * 0.42})` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const scrolled = useScrolled()
  const statsEl  = useInView(0.4)
  const toolsEl  = useInView(0.1)
  const c1 = useCounter(8,   statsEl.inView)
  const c2 = useCounter(100, statsEl.inView)

  const [booted, setBooted] = useState(false)
  const heroRef    = useRef<HTMLDivElement>(null)
  const mockWrapRef = useRef<HTMLDivElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)
  const amountRef  = useRef<HTMLParagraphElement>(null)
  const heroCtaRef  = useMagnetic<HTMLAnchorElement>(0.28)
  const finalCtaRef = useMagnetic<HTMLAnchorElement>(0.28)

  // Boot fallback: if reduced motion, skip overlay immediately
  useEffect(() => {
    if (reducedMotion()) setBooted(true)
  }, [])

  useEffect(() => {
    if (!booted) return
    const reduced = reducedMotion()

    const ctx = gsap.context(() => {
      // ── Hero entrance ──────────────────────────────────────────────────
      if (!reduced) {
        gsap.set('.hw', { opacity: 0, yPercent: 120, rotateX: -70 })
        gsap.set('.sub-w', { opacity: 0, y: 14 })
        gsap.set('.hero-badge', { opacity: 0, y: -10 })
        gsap.set('.hero-cta', { opacity: 0, y: 16 })
        if (mockWrapRef.current) gsap.set(mockWrapRef.current, { opacity: 0, scale: 0.86, y: 40 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.5 })
          .to('.hw', { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.85, stagger: 0.045, ease: 'back.out(1.6)' }, '-=0.25')
          .to('.sub-w', { opacity: 1, y: 0, duration: 0.45, stagger: 0.012 }, '-=0.5')
          .to('.hero-cta', { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
        if (mockWrapRef.current) {
          tl.to(mockWrapRef.current, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'elastic.out(1,0.75)' }, '-=0.55')
        }
        tl.add(() => { if (amountRef.current) scrambleTo(amountRef.current, '₹2,40,000', 900) }, '-=0.5')
      } else {
        gsap.set('.hw, .sub-w, .hero-badge, .hero-cta', { opacity: 1, y: 0, rotateX: 0, yPercent: 0 })
        if (mockWrapRef.current) gsap.set(mockWrapRef.current, { opacity: 1, scale: 1, y: 0 })
      }

      // ── Marquee glitch pulse ───────────────────────────────────────────
      if (!reduced) {
        gsap.timeline({ repeat: -1, repeatDelay: 5 })
          .to('.ticker-track', { filter: 'hue-rotate(50deg) saturate(2)', x: '+=6', duration: 0.08 })
          .to('.ticker-track', { filter: 'hue-rotate(0deg) saturate(1)', x: '-=6', duration: 0.25 })
      }

      // ── Tools grid batch reveal ─────────────────────────────────────────
      gsap.set('.tool-card', reduced ? { opacity: 1 } : { opacity: 0, y: 46, rotateX: -18, transformOrigin: '50% 100%' })
      if (!reduced) {
        ScrollTrigger.batch('.tool-card', {
          start: 'top 88%',
          once: true,
          onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.4)' }),
        })
      }

      // ── Growth bars scrub ────────────────────────────────────────────────
      if (!reduced) {
        gsap.set('.growth-bar', { scaleY: 0 })
        gsap.to('.growth-bar', {
          scaleY: 1,
          duration: 1,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: '.growth-chart', start: 'top 85%', end: 'top 45%', scrub: 0.6 },
        })
      } else {
        gsap.set('.growth-bar', { scaleY: 1 })
      }
    })

    // ── Hero pointer tilt (desktop only) ────────────────────────────────
    let removeTilt: (() => void) | undefined
    if (!reduced && heroRef.current && mockWrapRef.current) {
      const el = heroRef.current
      const card = mockWrapRef.current
      const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3.out' })
      const glow = glowRef.current
      const gx = glow ? gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' }) : null
      const gy = glow ? gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' }) : null
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry(px * 16)
        rx(-py * 12)
        if (gx) gx(px * -50)
        if (gy) gy(py * -36)
      }
      el.addEventListener('pointermove', onMove)
      removeTilt = () => el.removeEventListener('pointermove', onMove)
    }

    // ── Lenis smooth scroll ──────────────────────────────────────────────
    let lenis: Lenis | undefined
    let tickerFn: ((time: number) => void) | undefined
    if (!reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true })
      lenis.on('scroll', ScrollTrigger.update)
      tickerFn = (time: number) => lenis?.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)
    }

    return () => {
      ctx.revert()
      removeTilt?.()
      if (tickerFn) gsap.ticker.remove(tickerFn)
      lenis?.destroy()
    }
  }, [booted])

  return (
    <div style={{ background: '#040404', color: '#fff', overflowX: 'hidden' }}>
      {!booted && <BootOverlay onDone={() => setBooted(true)} />}

      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? 'rgba(4,4,4,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent' }}>
        <div className="max-w-6xl mx-auto px-6 h-[58px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={26} />
            <span className="text-sm font-semibold tracking-wide transition-opacity duration-150 group-hover:opacity-70" style={{ color: 'rgba(255,255,255,0.85)' }}>Ekam Finance</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/login" className="text-sm px-4 py-1.5 rounded-lg transition-all duration-150 hover:bg-white/6" style={{ color: 'rgba(255,255,255,0.40)' }}>Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 hover:bg-emerald-400" style={{ background: '#10b981', color: '#000' }}>Get started</Link>
          </nav>
        </div>
      </header>

      <section ref={heroRef} className="relative min-h-screen grid-bg flex items-center px-6 pt-20 pb-16" style={{ perspective: '1300px' }}>
        <div ref={glowRef} className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />
        <AmbientRupees />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#6ee7b7' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Made in India
              </div>
              <h1 className="font-black leading-none mb-6" style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', letterSpacing: '-0.03em' }}>
                <Word>One</Word> <Word>app</Word> <Word>for</Word><br />
                <span className="text-gradient"><Word>every</Word> <Word>rupee.</Word></span>
              </h1>
              <p className="text-lg mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '420px' }}>
                <Words text="You know when your salary hits and by the 20th you have no idea where it went?" />
              </p>
              <p className="text-lg mb-10 font-medium" style={{ color: 'rgba(255,255,255,0.70)', maxWidth: '420px' }}>
                <Words text="That is what Ekam solves." />
              </p>
              <div className="hero-cta flex items-center gap-3">
                <Link ref={heroCtaRef} href="/signup" className="flex items-center gap-1.5 text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 hover:bg-emerald-400" style={{ background: '#10b981', color: '#000' }}>
                  Start free <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="text-sm px-6 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/6" style={{ color: 'rgba(255,255,255,0.38)', border: '1px solid rgba(255,255,255,0.09)' }}>Sign in</Link>
              </div>
              <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.22)' }}>Free. No card required. No ads.</p>
            </div>
            <div ref={mockWrapRef} className="flex justify-center lg:justify-end" style={{ transformStyle: 'preserve-3d' }}>
              <MockCard amountRef={amountRef} />
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-wrap overflow-hidden py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.055)', borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="ticker-track flex gap-9 animate-marquee whitespace-nowrap select-none">
          {TICKER.map((t, i) => (
            <span key={i} className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.11em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: '#10b981' }} />{t}
            </span>
          ))}
        </div>
      </div>

      <section className="py-28 px-6" style={{ background: '#060606' }} ref={toolsEl.ref}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#10b981' }}>What it does</p>
            <h2 className="font-black text-white" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Eight tools.<br />One tab.</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ perspective: '1000px' }}>
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <TiltCard key={tool.label} className="tool-card surface-dark rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.09)', color: '#34d399' }}><Icon className="w-4 h-4" /></div>
                  <p className="text-sm font-semibold text-white mb-1">{tool.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.36)' }}>{tool.note}</p>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: '#fff' }} ref={statsEl.ref}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">Built for India</p>
            <h2 className="font-black text-gray-900 mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              INR first.<br />April tax year.<br />Kolkata timezone.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">Not a US app retrofitted for India. Every default was chosen for how Indians actually manage money.</p>
            <div className="growth-chart mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(0,0,0,0.3)' }}>Illustrative growth</p>
              <div className="flex items-end gap-[3px] h-16">
                {GROWTH_BARS.map((h, i) => (
                  <div key={i} className="growth-bar flex-1 rounded-t-[2px]" style={{ height: `${h}%`, transformOrigin: 'bottom', background: i === GROWTH_BARS.length - 1 ? '#10b981' : `rgba(16,185,129,${0.22 + (h / 100) * 0.55})` }} />
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 gap-5">
              {[
                { n: c1, s: '', l: 'Finance modules' },
                { n: c2, s: '%', l: 'Data ownership' },
              ].map(s => (
                <div key={s.l} className="text-center p-6 rounded-2xl" style={{ background: '#f9fafb', border: '1px solid #f0f0f0' }}>
                  <p className="text-5xl font-black text-gray-900 tabular-nums tracking-tight">{s.n}{s.s}</p>
                  <p className="text-sm text-gray-400 mt-2 font-medium">{s.l}</p>
                </div>
              ))}
              <div className="col-span-2 text-center p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-2xl font-black text-emerald-700">Free forever</p>
                <p className="text-sm text-emerald-600 mt-1">No credit card, no subscriptions</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-32 px-6 grid-bg text-center" style={{ background: '#060606' }}>
        <Reveal className="max-w-xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 scale-[2.5] rounded-full animate-breathe" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
              <Logo size={52} />
            </div>
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>Start knowing where your money goes.</h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.32)' }}>Takes two minutes to set up.</p>
          <Link ref={finalCtaRef} href="/signup" className="inline-flex items-center gap-2 font-bold px-9 py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30 hover:bg-emerald-400" style={{ background: '#10b981', color: '#000' }}>
            Create free account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

      <footer className="px-6 py-10" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>Ekam Finance</span>
          </Link>
          <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Made by{' '}
            <a href="https://www.linkedin.com/in/sbktckp/" target="_blank" rel="noopener noreferrer"
              className="font-semibold transition-colors duration-150 hover:text-emerald-400 underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.18)' }}>
              Smit Bharat Patil
            </a>
            {' '}under the guidance of{' '}
            <a href="https://www.linkedin.com/in/pakshal-tated-706155318/" target="_blank" rel="noopener noreferrer"
              className="font-semibold transition-colors duration-150 hover:text-emerald-400 underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.18)' }}>
              Pakshal Tated
            </a>
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>© 2026 Ekam Finance</p>
        </div>
      </footer>

    </div>
  )
}
