'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, ArrowLeftRight, Calculator,
  TrendingUp, Target, CalendarClock, BarChart3, Shield,
  ArrowUpRight,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'

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

const TICKER = [
  'Dashboard', 'Transactions', 'Budget', 'Investments',
  'Goals', 'Bills', 'Reports', 'AI Insights', 'INR native',
  'Dashboard', 'Transactions', 'Budget', 'Investments',
  'Goals', 'Bills', 'Reports', 'AI Insights', 'INR native',
]

function MockCard() {
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
            <p className="text-[22px] font-black text-white tracking-tight">₹2,40,000</p>
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

export default function LandingPage() {
  const scrolled = useScrolled()
  const statsEl  = useInView(0.4)
  const toolsEl  = useInView(0.1)
  const c1 = useCounter(8,   statsEl.inView)
  const c2 = useCounter(100, statsEl.inView)

  return (
    <div style={{ background: '#040404', color: '#fff', overflowX: 'hidden' }}>

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

      <section className="relative min-h-screen grid-bg flex items-center px-6 pt-20 pb-16">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 animate-fade-up" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#6ee7b7' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Made in India
              </div>
              <h1 className="font-black leading-none mb-6 animate-fade-up delay-1" style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', letterSpacing: '-0.03em' }}>
                One app for<br /><span className="text-gradient">every rupee.</span>
              </h1>
              <p className="text-lg mb-3 leading-relaxed animate-fade-up delay-2" style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '420px' }}>
                You know when your salary hits and by the 20th you have no idea where it went?
              </p>
              <p className="text-lg mb-10 font-medium animate-fade-up delay-3" style={{ color: 'rgba(255,255,255,0.70)', maxWidth: '420px' }}>
                That is what Ekam solves.
              </p>
              <div className="flex items-center gap-3 animate-fade-up delay-4">
                <Link href="/signup" className="flex items-center gap-1.5 text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 hover:bg-emerald-400" style={{ background: '#10b981', color: '#000' }}>
                  Start free <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="text-sm px-6 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/6" style={{ color: 'rgba(255,255,255,0.38)', border: '1px solid rgba(255,255,255,0.09)' }}>Sign in</Link>
              </div>
              <p className="text-xs mt-6 animate-fade-up delay-5" style={{ color: 'rgba(255,255,255,0.22)' }}>Free. No card required. No ads.</p>
            </div>
            <div className="flex justify-center lg:justify-end animate-fade-up delay-4"><MockCard /></div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.055)', borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="flex gap-9 animate-marquee whitespace-nowrap select-none">
          {TICKER.map((t, i) => (
            <span key={i} className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.11em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: '#10b981' }} />{t}
            </span>
          ))}
        </div>
      </div>

      <section className="py-28 px-6" style={{ background: '#060606' }} ref={toolsEl.ref}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#10b981' }}>What it does</p>
            <h2 className="font-black text-white" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Eight tools.<br />One tab.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon
              return (
                <div key={tool.label} className="surface-dark rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 0.055}s`, animationFillMode: 'backwards' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.09)', color: '#34d399' }}><Icon className="w-4 h-4" /></div>
                  <p className="text-sm font-semibold text-white mb-1">{tool.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.36)' }}>{tool.note}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: '#fff' }} ref={statsEl.ref}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">Built for India</p>
            <h2 className="font-black text-gray-900 mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              INR first.<br />April tax year.<br />Kolkata timezone.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">Not a US app retrofitted for India. Every default was chosen for how Indians actually manage money.</p>
          </div>
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
        </div>
      </section>

      <section className="py-32 px-6 grid-bg text-center" style={{ background: '#060606' }}>
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 scale-[2.5] rounded-full animate-breathe" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
              <Logo size={52} />
            </div>
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>Start knowing where your money goes.</h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.32)' }}>Takes two minutes to set up.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-9 py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30 hover:bg-emerald-400" style={{ background: '#10b981', color: '#000' }}>
            Create free account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
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
