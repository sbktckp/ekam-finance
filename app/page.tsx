'use client'

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
