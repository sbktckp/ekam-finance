#!/usr/bin/env python3
"""
Run from ekam-finance root:
  python3 setup_v2.py
Then:
  git add .
  git commit -m "feat: logo, landing page, Google OAuth"
  git push
"""
import os

def write(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {path}')

files = {}

# ─── components/shared/logo.tsx ──────────────────────────────────────────────
files['components/shared/logo.tsx'] = """export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="#10b981" />
      {/* Left vertical stroke of E */}
      <rect x="9" y="9" width="3" height="18" rx="1" fill="white" />
      {/* Top bar */}
      <rect x="9" y="9" width="18" height="3" rx="1" fill="white" />
      {/* Middle bar (shorter) */}
      <rect x="9" y="16.5" width="13" height="3" rx="1" fill="white" />
      {/* Bottom bar */}
      <rect x="9" y="24" width="18" height="3" rx="1" fill="white" />
    </svg>
  )
}
"""

# ─── app/page.tsx — Landing page ─────────────────────────────────────────────
files['app/page.tsx'] = """import Link from 'next/link'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Shield,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'

const FEATURES = [
  { icon: LayoutDashboard, label: 'Dashboard', desc: 'Net worth, accounts, and goals at a glance', color: 'bg-blue-50 text-blue-600' },
  { icon: ArrowLeftRight, label: 'Transactions', desc: 'Log and categorize every income and expense', color: 'bg-purple-50 text-purple-600' },
  { icon: Calculator, label: 'Budget', desc: 'Set monthly limits by category', color: 'bg-amber-50 text-amber-600' },
  { icon: TrendingUp, label: 'Investments', desc: 'Track stocks, mutual funds, and crypto', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Target, label: 'Goals', desc: 'Save toward anything with progress tracking', color: 'bg-rose-50 text-rose-600' },
  { icon: CalendarClock, label: 'Bills', desc: 'Never miss a subscription or payment', color: 'bg-orange-50 text-orange-600' },
  { icon: BarChart3, label: 'Reports', desc: 'Monthly income vs expense breakdowns', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Shield, label: 'Secure', desc: 'Row-level security, your data is yours only', color: 'bg-teal-50 text-teal-600' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-semibold text-gray-900 text-sm">Ekam Finance</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              Get started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wide uppercase">
            ✦ Free · No credit card required
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            One place for all<br className="hidden sm:block" /> your finances
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Track spending, grow wealth, and hit savings goals — all in one clean, fast app. Built for India.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Get started free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Everything you need to manage money
            </h2>
            <p className="text-gray-500 text-sm">Eight powerful modules. One clean interface.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${f.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">8</p>
            <p className="text-sm text-gray-500 mt-1">Finance modules</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">₹0</p>
            <p className="text-sm text-gray-500 mt-1">Forever free</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">1</p>
            <p className="text-sm text-gray-500 mt-1">Place for everything</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start your financial journey today
          </h2>
          <p className="text-gray-500 mb-8">
            Free forever. No subscriptions. No ads. Just your finances, organized.
          </p>
          <Link
            href="/signup"
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            Create free account <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-sm text-gray-500">Ekam Finance</span>
          </div>
          <p className="text-xs text-gray-400">Made with ♥ in India</p>
        </div>
      </footer>

    </div>
  )
}
"""

# ─── app/auth/callback/route.ts ───────────────────────────────────────────────
files['app/auth/callback/route.ts'] = """import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
"""

# ─── app/(auth)/login/page.tsx ───────────────────────────────────────────────
files['app/(auth)/login/page.tsx'] = """'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-7 text-center">
        <div className="flex justify-center mb-3">
          <Logo size={40} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to Ekam Finance</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-gray-900 hover:underline">Sign up</Link>
      </p>
    </div>
  )
}
"""

# ─── app/(auth)/signup/page.tsx ──────────────────────────────────────────────
files['app/(auth)/signup/page.tsx'] = """'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-7 text-center">
        <div className="flex justify-center mb-3">
          <Logo size={40} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Start managing your finances today</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Min. 6 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
"""

# ─── components/shared/sidebar.tsx (updated with Logo) ───────────────────────
files['components/shared/sidebar.tsx'] = """'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { label: 'Budget', href: '/dashboard/budget', icon: Calculator },
  { label: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { label: 'Goals', href: '/dashboard/goals', icon: Target },
  { label: 'Bills', href: '/dashboard/bills', icon: CalendarClock },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 text-white flex flex-col z-50">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-semibold text-sm tracking-wide">Ekam Finance</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
"""

print('Creating files...')
for path, content in files.items():
    write(path, content)

print()
print('Done! Now run:')
print('  git add .')
print('  git commit -m "feat: logo, landing page, Google OAuth"')
print('  git push')
print()
print('─────────────────────────────────────────────')
print('AFTER PUSH — enable Google OAuth in Supabase:')
print('  1. Go to: https://supabase.com/dashboard/project/xwxfgfwohwxvrqibymbn/auth/providers')
print('  2. Enable Google provider')
print('  3. Copy the callback URL shown there')
print('  4. Create OAuth credentials at: https://console.cloud.google.com')
print('  5. Paste Client ID + Secret back into Supabase')
print('  6. In Supabase → Auth → URL Config, add site URL:')
print('     https://ekam-finance.vercel.app')
print('─────────────────────────────────────────────')