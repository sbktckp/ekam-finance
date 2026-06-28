#!/usr/bin/env python3
"""
Premium UI revamp for Ekam Finance.
Run from ekam-finance root:
  python3 setup_premium.py
Then:
  git add .
  git commit -m "feat: premium UI revamp"
  git push
"""
import os

def write(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {path}')

files = {}

# ─── app/globals.css ─────────────────────────────────────────────────────────
files['app/globals.css'] = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { border-color: hsl(var(--border)); }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
}

/* ═══════════════════════════════════════════════════════
   KEYFRAME ANIMATIONS
═══════════════════════════════════════════════════════ */

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-10px) rotate(0.5deg); }
  66%       { transform: translateY(-6px) rotate(-0.5deg); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%       { opacity: 0.65; transform: scale(1.05); }
}

@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(16,185,129,0.2); }
  50%       { border-color: rgba(16,185,129,0.5); }
}

/* ═══════════════════════════════════════════════════════
   ANIMATION UTILITY CLASSES
═══════════════════════════════════════════════════════ */

.animate-float        { animation: float 7s ease-in-out infinite; }
.animate-fade-in-up   { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }
.animate-fade-in      { animation: fadeIn 0.5s ease both; }
.animate-scale-in     { animation: scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.animate-glow-pulse   { animation: glowPulse 4s ease-in-out infinite; }
.animate-marquee      { animation: marquee 32s linear infinite; }
.animate-border-glow  { animation: borderGlow 3s ease-in-out infinite; }

/* ═══════════════════════════════════════════════════════
   ANIMATION DELAYS
═══════════════════════════════════════════════════════ */

.delay-0   { animation-delay: 0s; }
.delay-100 { animation-delay: 0.10s; }
.delay-150 { animation-delay: 0.15s; }
.delay-200 { animation-delay: 0.20s; }
.delay-300 { animation-delay: 0.30s; }
.delay-400 { animation-delay: 0.40s; }
.delay-500 { animation-delay: 0.50s; }
.delay-600 { animation-delay: 0.60s; }
.delay-700 { animation-delay: 0.70s; }
.delay-800 { animation-delay: 0.80s; }

/* ═══════════════════════════════════════════════════════
   GRADIENT TEXT
═══════════════════════════════════════════════════════ */

.gradient-text {
  background: linear-gradient(135deg, #34d399 0%, #10b981 40%, #6ee7b7 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 5s linear infinite;
}

.gradient-text-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════════════════════
   BACKGROUND PATTERNS
═══════════════════════════════════════════════════════ */

.bg-grid-dark {
  background-image:
    linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
  background-size: 52px 52px;
}

.bg-dot-dark {
  background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ═══════════════════════════════════════════════════════
   GLOW UTILITIES
═══════════════════════════════════════════════════════ */

.glow-emerald-lg { box-shadow: 0 0 60px rgba(16,185,129,0.22), 0 0 120px rgba(16,185,129,0.10); }
.glow-emerald    { box-shadow: 0 0 30px rgba(16,185,129,0.18); }
.glow-emerald-sm { box-shadow: 0 0 16px rgba(16,185,129,0.14); }

/* ═══════════════════════════════════════════════════════
   CARD PREMIUM EFFECTS
═══════════════════════════════════════════════════════ */

.card-premium {
  background: rgba(255,255,255,0.030);
  border: 1px solid rgba(255,255,255,0.080);
  backdrop-filter: blur(12px);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.card-premium:hover {
  background: rgba(255,255,255,0.055);
  border-color: rgba(16,185,129,0.28);
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 30px rgba(16,185,129,0.08);
}

.card-light {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-light:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
}
"""

# ─── app/page.tsx — PREMIUM LANDING PAGE ─────────────────────────────────────
files['app/page.tsx'] = """'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Shield,
  ChevronRight, ArrowUpRight, Sparkles, Zap,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
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

function useAnimatedCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const e = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(e * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return val
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: LayoutDashboard, label: 'Dashboard',    desc: 'Net worth, accounts, and goals at a glance',   color: 'bg-sky-500/12 text-sky-400',     glow: 'rgba(14,165,233,0.15)'  },
  { icon: ArrowLeftRight,  label: 'Transactions', desc: 'Log, filter and categorize every rupee',        color: 'bg-violet-500/12 text-violet-400', glow: 'rgba(139,92,246,0.15)' },
  { icon: Calculator,      label: 'Budget',       desc: 'Monthly spending limits by category',            color: 'bg-amber-500/12 text-amber-400',  glow: 'rgba(245,158,11,0.15)'  },
  { icon: TrendingUp,      label: 'Investments',  desc: 'Track stocks, mutual funds, crypto & more',     color: 'bg-emerald-500/12 text-emerald-400', glow: 'rgba(16,185,129,0.15)'},
  { icon: Target,          label: 'Goals',        desc: 'Save toward anything with progress tracking',   color: 'bg-rose-500/12 text-rose-400',    glow: 'rgba(244,63,94,0.15)'   },
  { icon: CalendarClock,   label: 'Bills',        desc: 'Never miss a subscription or payment',          color: 'bg-orange-500/12 text-orange-400', glow: 'rgba(249,115,22,0.15)' },
  { icon: BarChart3,       label: 'Reports',      desc: 'Calendar heatmap, charts, and AI summaries',   color: 'bg-indigo-500/12 text-indigo-400', glow: 'rgba(99,102,241,0.15)' },
  { icon: Shield,          label: 'Secure',       desc: 'Row-level security — your data stays yours',   color: 'bg-teal-500/12 text-teal-400',    glow: 'rgba(20,184,166,0.15)'  },
]

const MARQUEE = [
  'Dashboard','Transactions','Budget','Investments',
  'Goals','Bills','Reports','AI Insights','Secure','Multi-currency',
  'Dashboard','Transactions','Budget','Investments',
  'Goals','Bills','Reports','AI Insights','Secure','Multi-currency',
]

const MOCK_BARS = [22,38,31,58,45,72,54,88,62,79,55,94]

// ─── Sub-components ───────────────────────────────────────────────────────────
function MockDashboard() {
  return (
    <div className="relative w-[310px] mx-auto animate-float">
      <div className="absolute -inset-4 bg-emerald-500/15 rounded-3xl blur-3xl animate-glow-pulse" />
      <div className="absolute -inset-8 bg-emerald-500/6 rounded-full blur-3xl animate-glow-pulse delay-300" />
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{
          background: 'linear-gradient(160deg, #111 0%, #0a0a0a 100%)',
          borderColor: 'rgba(255,255,255,0.10)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
          <div className="flex-1 mx-2">
            <div className="h-3.5 rounded-md max-w-24 mx-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-zinc-500 mb-0.5">Good evening, Smit 👋</p>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Here&apos;s your financial overview</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-[8px] text-emerald-400 font-bold">S</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            {[
              { l: 'Net Worth',   v: '₹2,40,000', c: '#34d399' },
              { l: 'Income',      v: '₹85,000',   c: '#60a5fa' },
              { l: 'Expenses',    v: '₹42,000',   c: '#f87171' },
              { l: 'Net Saved',   v: '+₹43,000',  c: '#c084fc' },
            ].map(k => (
              <div key={k.l} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[8px] mb-1" style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.l}</p>
                <p className="text-xs font-bold" style={{ color: k.c }}>{k.v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[8px] mb-2" style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly overview</p>
            <div className="flex items-end gap-[3px] h-9">
              {MOCK_BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[2px] transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === MOCK_BARS.length - 1
                      ? '#10b981'
                      : `rgba(16,185,129,${0.18 + (h / 100) * 0.38})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = feature.icon
  return (
    <div
      className="card-premium rounded-2xl p-5 group cursor-default animate-fade-in-up"
      style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'backwards' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ background: feature.color.includes('bg-') ? undefined : feature.glow }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{feature.label}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{feature.desc}</p>
    </div>
  )
}

function StatBlock({ value, suffix = '', prefix = '', label, active }: { value: number; suffix?: string; prefix?: string; label: string; active: boolean }) {
  const count = useAnimatedCounter(value, active)
  return (
    <div className="text-center animate-fade-in-up">
      <p className="text-6xl font-black text-gray-900 tracking-tight tabular-nums mb-2">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const stats = useInView(0.4)
  const features = useInView(0.1)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#030303', color: '#fff' }}>

      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(3,3,3,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="font-semibold text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.88)' }}>
              Ekam Finance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-lg transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: '#10b981', color: '#000' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#34d399'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#10b981'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              Get started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-dark" />
        {/* Gradient base */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
        {/* Orbs */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-glow-pulse" style={{ background: 'rgba(16,185,129,0.07)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-glow-pulse delay-400" style={{ background: 'rgba(16,185,129,0.05)' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in-up"
            style={{
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.30)',
              color: '#34d399',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personal finance, reimagined
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight leading-none mb-6 animate-fade-in-up delay-100"
            style={{ fontSize: 'clamp(52px, 8vw, 92px)', letterSpacing: '-0.03em' }}
          >
            One place for<br />
            <span className="gradient-text">all your finances.</span>
          </h1>

          {/* Sub */}
          <p
            className="text-lg max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200"
            style={{ color: 'rgba(255,255,255,0.42)' }}
          >
            Track spending, grow wealth, and hit savings goals —
            all in one clean, fast app built for India.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-24 animate-fade-in-up delay-300">
            <Link
              href="/signup"
              className="flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200"
              style={{ background: '#10b981', color: '#000' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#34d399'; el.style.transform = 'translateY(-2px) scale(1.02)'; el.style.boxShadow = '0 16px 40px rgba(16,185,129,0.35)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#10b981'; el.style.transform = ''; el.style.boxShadow = '' }}
            >
              Start for free <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm px-8 py-3.5 rounded-xl transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.10)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.22)'; el.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.45)'; el.style.borderColor = 'rgba(255,255,255,0.10)'; el.style.background = 'transparent' }}
            >
              Already have an account →
            </Link>
          </div>

          {/* Mock */}
          <div className="animate-fade-in-up delay-400">
            <MockDashboard />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="relative py-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-10 animate-marquee whitespace-nowrap select-none">
          {MARQUEE.map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: '#10b981' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section className="py-32 px-6" style={{ background: '#050505' }} ref={features.ref}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#34d399' }}
            >
              <Zap className="w-3 h-3" /> Features
            </div>
            <h2
              className="font-black text-white tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.02em' }}
            >
              Everything in one place.
            </h2>
            <p className="text-base max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Eight powerful modules. One clean interface. Zero subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => <FeatureCard key={f.label} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-28 px-6 bg-white" ref={stats.ref}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">By the numbers</p>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">Built for real people.</h2>
          </div>
          <div className="grid grid-cols-3 gap-12">
            <StatBlock value={8}   suffix="+"  label="Finance modules"       active={stats.inView} />
            <StatBlock value={0}   prefix="₹"  label="Cost. Forever."        active={stats.inView} />
            <StatBlock value={100} suffix="%" label="Data ownership. Yours." active={stats.inView} />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-6" style={{ background: '#050505' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150" />
            <div className="relative">
              <Logo size={60} />
            </div>
          </div>
          <h2
            className="font-black text-white tracking-tight mb-5"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.02em' }}
          >
            Start your financial<br />journey today.
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Free forever. No credit card. No ads. Just clarity.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-xl text-base transition-all duration-200"
            style={{ background: '#10b981', color: '#000' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#34d399'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 24px 48px rgba(16,185,129,0.35)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#10b981'; el.style.transform = ''; el.style.boxShadow = '' }}
          >
            Create free account <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-12 px-6"
        style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={22} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>Ekam Finance</span>
            </div>

            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Made by{' '}
              {/* ↓ Update this LinkedIn URL to your actual profile */}
              <a
                href="https://www.linkedin.com/in/smit-bharat-patil"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.20)', textUnderlineOffset: '3px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#34d399'; (e.currentTarget as HTMLElement).style.textDecorationColor = '#34d399' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.70)'; (e.currentTarget as HTMLElement).style.textDecorationColor = 'rgba(255,255,255,0.20)' }}
              >
                Smit Bharat Patil
              </a>
              {' '}under the guidance of{' '}
              {/* ↓ Update this LinkedIn URL to Pakshal's actual profile */}
              <a
                href="https://www.linkedin.com/in/pakshal-tatad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.20)', textUnderlineOffset: '3px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#34d399'; (e.currentTarget as HTMLElement).style.textDecorationColor = '#34d399' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.70)'; (e.currentTarget as HTMLElement).style.textDecorationColor = 'rgba(255,255,255,0.20)' }}
              >
                Pakshal Tatad
              </a>
            </p>

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>© 2025 Ekam Finance</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
"""

# ─── components/shared/sidebar.tsx — PREMIUM ─────────────────────────────────
files['components/shared/sidebar.tsx'] = """'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight  },
  { label: 'Budget',       href: '/dashboard/budget',       icon: Calculator      },
  { label: 'Investments',  href: '/dashboard/investments',  icon: TrendingUp      },
  { label: 'Goals',        href: '/dashboard/goals',        icon: Target          },
  { label: 'Bills',        href: '/dashboard/bills',        icon: CalendarClock   },
  { label: 'Reports',      href: '/dashboard/reports',      icon: BarChart3       },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const s = createClient()
    await s.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-50 select-none"
      style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.055)' }}
    >
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight tracking-wide">Ekam Finance</p>
            <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.28)' }}>Personal finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-0.5">
        {NAV.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-[7px] rounded-[9px] text-[13px] transition-all duration-150 relative group"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.40)',
                background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                fontWeight: active ? '500' : '400',
                borderLeft: active ? '2px solid #10b981' : '2px solid transparent',
              }}
            >
              {/* Hover bg */}
              {!active && (
                <span
                  className="absolute inset-0 rounded-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'rgba(255,255,255,0.045)' }}
                />
              )}
              <Icon
                className="w-[15px] h-[15px] shrink-0 relative z-10 transition-colors duration-150"
                style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.35)' }}
              />
              <span className="relative z-10 group-hover:text-white transition-colors duration-150">
                {item.label}
              </span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full relative z-10" style={{ background: '#10b981' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        {[
          { label: 'Settings', href: '/dashboard/settings', icon: Settings, onClick: undefined },
        ].map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-[7px] rounded-[9px] text-[13px] transition-all duration-150 relative group"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                background: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                borderLeft: active ? '2px solid #10b981' : '2px solid transparent',
              }}
            >
              {!active && <span className="absolute inset-0 rounded-[9px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.045)' }} />}
              <Icon className="w-[15px] h-[15px] shrink-0 relative z-10" style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.35)' }} />
              <span className="relative z-10 group-hover:text-white transition-colors">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-[7px] rounded-[9px] text-[13px] transition-all duration-150 relative group"
          style={{ color: 'rgba(255,255,255,0.35)', borderLeft: '2px solid transparent' }}
        >
          <span className="absolute inset-0 rounded-[9px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.045)' }} />
          <LogOut className="w-[15px] h-[15px] shrink-0 relative z-10" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <span className="relative z-10 group-hover:text-white transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
"""

# ─── app/(dashboard)/layout.tsx — PREMIUM ────────────────────────────────────
files['app/(dashboard)/layout.tsx'] = """import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen" style={{ background: '#f7f8f9' }}>
      <Sidebar />
      <main className="flex-1 ml-60 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
"""

# ─── app/(dashboard)/dashboard/page.tsx — PREMIUM ────────────────────────────
files['app/(dashboard)/dashboard/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'

type StatCardProps = {
  label: string
  value: string
  icon: React.ReactNode
  accent: string
  sub?: string
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div
      className="card-light rounded-2xl p-5 group"
      style={{ borderRadius: '16px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: accent + '15' }}
        >
          <div style={{ color: accent }}>{icon}</div>
        </div>
      </div>
      <p className="text-[28px] font-black tracking-tight" style={{ color: '#0a0a0a', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{sub}</p>}
    </div>
  )
}

function EmptyState({ message, cta, href }: { message: string; cta?: string; href?: string }) {
  return (
    <div className="text-center py-10">
      <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{message}</p>
      {cta && href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981' }}
        >
          <Plus className="w-3.5 h-3.5" /> {cta}
        </Link>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: accounts }, { data: goals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('accounts').select('*').eq('user_id', user!.id),
    supabase.from('goals').select('*').eq('user_id', user!.id).eq('status', 'active').limit(3),
  ])

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const currency = profile?.base_currency ?? 'INR'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalBalance = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const income      = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const expenses    = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0a0a0a', letterSpacing: '-0.02em' }}>
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
          style={{ background: '#10b981', color: '#000' }}
          onMouseEnter={undefined}
        >
          <Plus className="w-4 h-4" /> Add transaction
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net worth"        value={formatCurrency(totalBalance, currency)} icon={<Wallet className="w-4 h-4" />}       accent="#10b981" />
        <StatCard label="Income this month"  value={formatCurrency(income, currency)}       icon={<TrendingUp className="w-4 h-4" />}    accent="#3b82f6" />
        <StatCard label="Expenses this month" value={formatCurrency(expenses, currency)}     icon={<TrendingDown className="w-4 h-4" />}  accent="#f43f5e" />
        <StatCard label="Net this month"    value={formatCurrency(income - expenses, currency)} icon={<Sparkles className="w-4 h-4" />} accent="#8b5cf6" sub={income - expenses >= 0 ? 'Positive cash flow' : 'Spending more than earning'} />
      </div>

      {/* Accounts + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Accounts */}
        <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Accounts</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981' }}>
              {accounts?.length ?? 0} total
            </span>
          </div>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111' }}>{acc.name}</p>
                      <p className="text-xs capitalize" style={{ color: '#9ca3af' }}>{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#0a0a0a' }}>
                    {formatCurrency(Number(acc.balance), acc.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No accounts yet" cta="Add account" href="/dashboard/settings" />
          )}
        </div>

        {/* Goals */}
        <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Active goals</h2>
            <Link href="/dashboard/goals" className="text-xs font-semibold" style={{ color: '#10b981' }}>View all →</Link>
          </div>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(goal => {
                const pct = goal.target_amount > 0
                  ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{goal.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: '#111' }}>{goal.title}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#10b981' }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: '#f3f4f6' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px]" style={{ color: '#9ca3af' }}>{formatCurrency(Number(goal.saved_amount), goal.currency)}</span>
                      <span className="text-[11px]" style={{ color: '#9ca3af' }}>{formatCurrency(Number(goal.target_amount), goal.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="No active goals" cta="Create goal" href="/dashboard/goals" />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Recent transactions</h2>
          <Link href="/dashboard/transactions" className="text-xs font-semibold" style={{ color: '#10b981' }}>View all →</Link>
        </div>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-1">
            {transactions.slice(0, 6).map(txn => (
              <div
                key={txn.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 group"
                style={{ marginLeft: '-12px', marginRight: '-12px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      background: txn.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.10)',
                      color: txn.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {txn.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111' }}>
                      {txn.merchant ?? txn.note ?? 'Transaction'}
                    </p>
                    <p className="text-[11px]" style={{ color: '#9ca3af' }}>
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: txn.type === 'income' ? '#10b981' : '#f43f5e' }}
                >
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount_in_base), currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No transactions this month" cta="Add transaction" href="/dashboard/transactions" />
        )}
      </div>

    </div>
  )
}
"""

print('Writing files...')
for path, content in files.items():
    write(path, content)

print()
print('Done! Now run:')
print('  git add .')
print('  git commit -m "feat: premium UI revamp"')
print('  git push')
print()
print('Note: Update the two LinkedIn URLs in app/page.tsx footer')
print('  → Search for "linkedin.com/in/smit-bharat-patil" and update')
print('  → Search for "linkedin.com/in/pakshal-tatad" and update')