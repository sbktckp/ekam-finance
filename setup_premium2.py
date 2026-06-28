#!/usr/bin/env python3
"""
Premium redesign for Ekam Finance.
Run from ekam-finance root:
  python3 setup_premium2.py
Then:
  git add .
  git commit -m "feat: premium redesign"
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

/* Keyframes */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes shimmer {
  from { background-position: -300% center; }
  to   { background-position:  300% center; }
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 0.9; }
}

/* Utilities */
.animate-float      { animation: float 6s ease-in-out infinite; }
.animate-fade-up    { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.animate-fade-in    { animation: fadeIn 0.5s ease both; }
.animate-marquee    { animation: marquee 28s linear infinite; }
.animate-breathe    { animation: breathe 4s ease-in-out infinite; }

.delay-1 { animation-delay: 0.08s; }
.delay-2 { animation-delay: 0.16s; }
.delay-3 { animation-delay: 0.24s; }
.delay-4 { animation-delay: 0.32s; }
.delay-5 { animation-delay: 0.40s; }
.delay-6 { animation-delay: 0.48s; }

/* Gradient text */
.text-gradient {
  background: linear-gradient(120deg, #34d399 0%, #10b981 50%, #a7f3d0 100%);
  background-size: 250% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 6s linear infinite;
}

/* Grid background */
.grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 56px 56px;
}

/* Card styles */
.surface-dark {
  background: rgba(255,255,255,0.032);
  border: 1px solid rgba(255,255,255,0.075);
  transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.surface-dark:hover {
  background: rgba(255,255,255,0.055);
  border-color: rgba(16,185,129,0.25);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 24px rgba(16,185,129,0.06);
}

.surface-light {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  transition: transform 0.2s, box-shadow 0.2s;
}
.surface-light:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.09);
}
"""

# ─── app/page.tsx ─────────────────────────────────────────────────────────────
files['app/page.tsx'] = """'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, ArrowLeftRight, Calculator,
  TrendingUp, Target, CalendarClock, BarChart3, Shield,
  ArrowUpRight,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'

/* ─── Hooks ──────────────────────────────────────────────────────────────── */
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

/* ─── Static data ────────────────────────────────────────────────────────── */
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

/* ─── Mock card ──────────────────────────────────────────────────────────── */
function MockCard() {
  return (
    <div className="relative animate-float w-[300px]">
      <div
        className="absolute -inset-6 rounded-full animate-breathe"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)' }}
      />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #141414 0%, #0d0d0d 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <div
          className="px-4 py-2.5 flex items-center gap-1.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}
        >
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
              { l: 'Income',   v: '₹85k', c: '#60a5fa' },
              { l: 'Spent',    v: '₹42k', c: '#f87171' },
              { l: 'Saved',    v: '₹43k', c: '#a78bfa' },
            ].map(k => (
              <div
                key={k.l}
                className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{k.l}</p>
                <p className="text-xs font-bold" style={{ color: k.c }}>{k.v}</p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>This month</p>
            <div className="flex items-end gap-[3px] h-8">
              {BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[2px]"
                  style={{
                    height: `${h}%`,
                    background: i === BARS.length - 1
                      ? '#10b981'
                      : `rgba(16,185,129,${0.15 + (h / 100) * 0.42})`,
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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const scrolled = useScrolled()
  const statsEl  = useInView(0.4)
  const toolsEl  = useInView(0.1)

  const c1 = useCounter(8,   statsEl.inView)
  const c2 = useCounter(100, statsEl.inView)

  return (
    <div style={{ background: '#040404', color: '#fff', overflowX: 'hidden' }}>

      {/* NAV */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(4,4,4,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[58px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={26} />
            <span
              className="text-sm font-semibold tracking-wide transition-opacity duration-150 group-hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Ekam Finance
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-lg transition-all duration-150 hover:bg-white/6"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 hover:bg-emerald-400"
              style={{ background: '#10b981', color: '#000' }}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen grid-bg flex items-center px-6 pt-20 pb-16">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 animate-fade-up"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#6ee7b7' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Made in India
              </div>

              <h1
                className="font-black leading-none mb-6 animate-fade-up delay-1"
                style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', letterSpacing: '-0.03em' }}
              >
                One app for<br />
                <span className="text-gradient">every rupee.</span>
              </h1>

              <p
                className="text-lg mb-3 leading-relaxed animate-fade-up delay-2"
                style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '420px' }}
              >
                You know when your salary hits and by the 20th you have no idea where it went?
              </p>
              <p
                className="text-lg mb-10 font-medium animate-fade-up delay-3"
                style={{ color: 'rgba(255,255,255,0.70)', maxWidth: '420px' }}
              >
                That is what Ekam solves.
              </p>

              <div className="flex items-center gap-3 animate-fade-up delay-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 hover:bg-emerald-400"
                  style={{ background: '#10b981', color: '#000' }}
                >
                  Start free <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm px-6 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/6"
                  style={{ color: 'rgba(255,255,255,0.38)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  Sign in
                </Link>
              </div>

              <p
                className="text-xs mt-6 animate-fade-up delay-5"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                Free. No card required. No ads.
              </p>
            </div>

            {/* Right */}
            <div className="flex justify-center lg:justify-end animate-fade-up delay-4">
              <MockCard />
            </div>

          </div>
        </div>
      </section>

      {/* TICKER */}
      <div
        className="overflow-hidden py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)', borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="flex gap-9 animate-marquee whitespace-nowrap select-none">
          {TICKER.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.11em]"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: '#10b981' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* TOOLS */}
      <section
        className="py-28 px-6"
        style={{ background: '#060606' }}
        ref={toolsEl.ref}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#10b981' }}>
              What it does
            </p>
            <h2
              className="font-black text-white"
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Eight tools.<br />One tab.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.label}
                  className={`surface-dark rounded-2xl p-5 animate-fade-up`}
                  style={{ animationDelay: `${i * 0.055}s`, animationFillMode: 'backwards' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(16,185,129,0.09)', color: '#34d399' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{tool.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.36)' }}>
                    {tool.note}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* INDIA STRIP */}
      <section
        className="py-20 px-6"
        style={{ background: '#fff' }}
        ref={statsEl.ref}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">Built for India</p>
            <h2
              className="font-black text-gray-900 mb-5"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              INR first.<br />April tax year.<br />Kolkata timezone.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Not a US app retrofitted for India. Every default was chosen for how Indians actually manage money.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { n: c1,   s: '',   l: 'Finance modules'    },
              { n: c2,   s: '%',  l: 'Data ownership'     },
            ].map(s => (
              <div key={s.l} className="text-center p-6 rounded-2xl" style={{ background: '#f9fafb', border: '1px solid #f0f0f0' }}>
                <p className="text-5xl font-black text-gray-900 tabular-nums tracking-tight">
                  {s.n}{s.s}
                </p>
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

      {/* CTA */}
      <section
        className="py-32 px-6 grid-bg text-center"
        style={{ background: '#060606' }}
      >
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 scale-[2.5] rounded-full animate-breathe" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
              <Logo size={52} />
            </div>
          </div>
          <h2
            className="font-black text-white mb-4"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            Start knowing where your money goes.
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Takes two minutes to set up.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-bold px-9 py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30 hover:bg-emerald-400"
            style={{ background: '#10b981', color: '#000' }}
          >
            Create free account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-6 py-10"
        style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.055)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>Ekam Finance</span>
          </Link>

          <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Made by{' '}
            <a
              href="https://www.linkedin.com/in/sbktckp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-colors duration-150 hover:text-emerald-400 underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.18)' }}
            >
              Smit Bharat Patil
            </a>
            {' '}under the guidance of{' '}
            <a
              href="https://www.linkedin.com/in/pakshal-tated-706155318/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-colors duration-150 hover:text-emerald-400 underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.18)' }}
            >
              Pakshal Tatad
            </a>
          </p>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>2025 Ekam Finance</p>
        </div>
      </footer>

    </div>
  )
}
"""

# ─── components/shared/sidebar.tsx ───────────────────────────────────────────
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
  const path   = usePathname()
  const router = useRouter()

  const active = (href: string) =>
    href === '/dashboard' ? path === '/dashboard' : path.startsWith(href)

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const itemClass = (href: string) => ({
    base: 'flex items-center gap-3 px-3 py-[7px] rounded-[8px] text-[13px] transition-all duration-150 relative group w-full text-left',
    style: {
      color:      active(href) ? '#fff' : 'rgba(255,255,255,0.38)',
      background: active(href) ? 'rgba(16,185,129,0.09)' : 'transparent',
      fontWeight: active(href) ? '500' : '400',
      borderLeft: active(href) ? '2px solid #10b981' : '2px solid transparent',
    },
  })

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-50"
      style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.055)' }}
    >
      {/* Logo */}
      <div className="px-5 h-[58px] flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={26} />
          <span className="text-sm font-semibold text-white group-hover:opacity-70 transition-opacity">
            Ekam Finance
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={itemClass(href).base}
            style={itemClass(href).style}
          >
            {!active(href) && (
              <span className="absolute inset-0 rounded-[8px] bg-white/0 group-hover:bg-white/[0.04] transition-colors" />
            )}
            <Icon
              className="w-[15px] h-[15px] shrink-0 relative z-10"
              style={{ color: active(href) ? '#34d399' : 'rgba(255,255,255,0.32)' }}
            />
            <span className="relative z-10 group-hover:text-white transition-colors">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        <Link
          href="/dashboard/settings"
          className={itemClass('/dashboard/settings').base}
          style={itemClass('/dashboard/settings').style}
        >
          {!active('/dashboard/settings') && (
            <span className="absolute inset-0 rounded-[8px] bg-white/0 group-hover:bg-white/[0.04] transition-colors" />
          )}
          <Settings
            className="w-[15px] h-[15px] shrink-0 relative z-10"
            style={{ color: active('/dashboard/settings') ? '#34d399' : 'rgba(255,255,255,0.32)' }}
          />
          <span className="relative z-10 group-hover:text-white transition-colors">Settings</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-[7px] rounded-[8px] text-[13px] w-full relative group transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.32)', borderLeft: '2px solid transparent' }}
        >
          <span className="absolute inset-0 rounded-[8px] bg-white/0 group-hover:bg-white/[0.04] transition-colors" />
          <LogOut className="w-[15px] h-[15px] shrink-0 relative z-10" style={{ color: 'rgba(255,255,255,0.28)' }} />
          <span className="relative z-10 group-hover:text-white transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
"""

# ─── app/(dashboard)/layout.tsx ──────────────────────────────────────────────
files['app/(dashboard)/layout.tsx'] = """import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen" style={{ background: '#f5f5f5' }}>
      <Sidebar />
      <main className="flex-1 ml-60 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
"""

# ─── app/(dashboard)/dashboard/page.tsx ──────────────────────────────────────
files['app/(dashboard)/dashboard/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Sparkles, Plus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

function KpiCard({
  label, value, icon, color, note,
}: {
  label: string; value: string; icon: React.ReactNode; color: string; note?: string;
}) {
  return (
    <div className="surface-light rounded-2xl p-5 group cursor-default">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: color + '15', color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>{value}</p>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ msg, href, cta }: { msg: string; href?: string; cta?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-gray-400 mb-3">{msg}</p>
      {href && cta && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {cta}
        </Link>
      )}
    </div>
  )
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
    >
      View all <ArrowUpRight className="w-3 h-3" />
    </Link>
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

  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const cur      = profile?.base_currency ?? 'INR'
  const name     = profile?.full_name?.split(' ')[0] ?? 'there'
  const balance  = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const income   = txns?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const expenses = txns?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const net      = income - expenses

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between pb-1">
        <div>
          <h1
            className="font-black text-gray-900"
            style={{ fontSize: '22px', letterSpacing: '-0.02em' }}
          >
            Good {getGreeting()}, {name} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:shadow-emerald-500/20 hover:bg-emerald-400"
          style={{ background: '#10b981', color: '#000' }}
        >
          <Plus className="w-4 h-4" /> Add
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Net worth"    value={formatCurrency(balance, cur)}  icon={<Wallet className="w-4 h-4" />}      color="#10b981" />
        <KpiCard label="Income"       value={formatCurrency(income, cur)}   icon={<TrendingUp className="w-4 h-4" />}  color="#3b82f6" />
        <KpiCard label="Expenses"     value={formatCurrency(expenses, cur)} icon={<TrendingDown className="w-4 h-4" />} color="#f43f5e" />
        <KpiCard
          label="Net this month"
          value={formatCurrency(net, cur)}
          icon={<Sparkles className="w-4 h-4" />}
          color="#8b5cf6"
          note={net >= 0 ? 'Positive cash flow' : 'Spending more than earning'}
        />
      </div>

      {/* Accounts + Goals */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Accounts" action={accounts?.length ? <ViewAll href="/dashboard/settings" /> : undefined}>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{acc.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(acc.balance), acc.currency)}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty msg="No accounts yet" href="/dashboard/settings" cta="Add account" />
          )}
        </Section>

        <Section title="Goals" action={goals?.length ? <ViewAll href="/dashboard/goals" /> : undefined}>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(g => {
                const pct = g.target_amount > 0
                  ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">{g.emoji} {g.title}</span>
                      <span className="text-xs font-bold text-emerald-600">{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400">{formatCurrency(Number(g.saved_amount), g.currency)}</span>
                      <span className="text-[11px] text-gray-400">{formatCurrency(Number(g.target_amount), g.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty msg="No active goals" href="/dashboard/goals" cta="Create goal" />
          )}
        </Section>
      </div>

      {/* Transactions */}
      <Section title="Recent transactions" action={txns?.length ? <ViewAll href="/dashboard/transactions" /> : undefined}>
        {txns && txns.length > 0 ? (
          <div className="-mx-1">
            {txns.slice(0, 6).map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-100 cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: t.type === 'income' ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.09)',
                      color:      t.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.merchant ?? t.note ?? 'Transaction'}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: t.type === 'income' ? '#10b981' : '#f43f5e' }}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount_in_base), cur)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty msg="No transactions this month" href="/dashboard/transactions" cta="Add transaction" />
        )}
      </Section>

    </div>
  )
}
"""

print('Writing files...')
for path, content in files.items():
    write(path, content)

print()
print('Done! Run:')
print('  git add .')
print('  git commit -m "feat: premium redesign"')
print('  git push')