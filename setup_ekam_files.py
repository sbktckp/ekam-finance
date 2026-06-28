#!/usr/bin/env python3
"""
Run this from the root of your ekam-finance repo:
  python3 setup_ekam_files.py
Then:
  git add .
  git commit -m "feat: add all app source files"
  git push
"""

import os

def write(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {path}')

files = {}

# ─── public/manifest.json ───────────────────────────────────────────────────
files['public/manifest.json'] = '''{
  "name": "Ekam Finance",
  "short_name": "Ekam",
  "description": "One place for all your finances",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#111827",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
'''

# ─── README.md ───────────────────────────────────────────────────────────────
files['README.md'] = '''# Ekam Finance

One place for all your finances. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Stack

- **Framework**: Next.js 15 (App Router, RSC by default)
- **Language**: TypeScript (strict)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel

## Setup

```bash
npm install
cp .env.example .env.local
# fill in Supabase credentials
npm run dev
```

## Modules

Dashboard · Transactions · Budget · Investments · Goals · Bills · Reports · Settings
'''

# ─── app/layout.tsx (FIX) ────────────────────────────────────────────────────
files['app/layout.tsx'] = """import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ekam Finance',
  description: 'One place for all your finances',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
"""

# ─── app/not-found.tsx (FIX) ─────────────────────────────────────────────────
files['app/not-found.tsx'] = """import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-gray-500 mt-4 mb-6">This page does not exist</p>
        <Link
          href="/dashboard"
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
"""

# ─── components/shared/sidebar.tsx ──────────────────────────────────────────
files['components/shared/sidebar.tsx'] = """'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  Target,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
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

# ─── app/(auth)/layout.tsx ───────────────────────────────────────────────────
files['app/(auth)/layout.tsx'] = """export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  )
}
"""

# ─── app/(auth)/login/page.tsx ───────────────────────────────────────────────
files['app/(auth)/login/page.tsx'] = """'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Ekam Finance</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
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
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-gray-900 hover:underline">
          Sign up
        </Link>
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

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Ekam Finance</h1>
        <p className="mt-1 text-sm text-gray-500">Create your account</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
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
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
"""

# ─── app/(dashboard)/layout.tsx ──────────────────────────────────────────────
files['app/(dashboard)/layout.tsx'] = """import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
"""

# ─── app/(dashboard)/dashboard/page.tsx ──────────────────────────────────────
files['app/(dashboard)/dashboard/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user!.id)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .limit(3)

  const currency = profile?.base_currency ?? 'INR'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalBalance = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const monthlyIncome =
    transactions?.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const monthlyExpenses =
    transactions?.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Good {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net worth" value={formatCurrency(totalBalance, currency)} icon={<Wallet className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Income this month" value={formatCurrency(monthlyIncome, currency)} icon={<TrendingUp className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Expenses this month" value={formatCurrency(monthlyExpenses, currency)} icon={<TrendingDown className="w-5 h-5" />} color="bg-red-50 text-red-600" />
        <StatCard label="Net this month" value={formatCurrency(monthlyIncome - monthlyExpenses, currency)} icon={<Target className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Accounts</h2>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: account.color + '20' }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(account.balance), account.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No accounts yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Active goals</h2>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.target_amount > 0
                  ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{goal.emoji} {goal.title}</span>
                      <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatCurrency(Number(goal.saved_amount), goal.currency)}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(Number(goal.target_amount), goal.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No active goals</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent transactions</h2>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.merchant ?? txn.note ?? 'Transaction'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount_in_base), currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No transactions this month</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
"""

# ─── app/(dashboard)/transactions/page.tsx ───────────────────────────────────
files['app/(dashboard)/transactions/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(name, icon, color)')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(50)

  type TxnRow = typeof transactions extends (infer T)[] | null ? T : never

  function getCategory(txn: TxnRow) {
    return txn && 'categories' in txn ? txn.categories as { name: string; icon: string } | null : null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Track your income and expenses</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add transaction
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const cat = getCategory(txn)
                return (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{txn.merchant ?? txn.note ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {cat ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {cat.icon} {cat.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount_in_base), txn.currency)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/budget/page.tsx ─────────────────────────────────────────
files['app/(dashboard)/budget/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name, icon, color)')
    .eq('user_id', user!.id)
    .eq('month', monthStr)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('category_id, amount_in_base')
    .eq('user_id', user!.id)
    .eq('type', 'expense')
    .gte('date', monthStr)

  const spendingByCategory: Record<string, number> = {}
  transactions?.forEach((t) => {
    if (t.category_id) {
      spendingByCategory[t.category_id] = (spendingByCategory[t.category_id] ?? 0) + Number(t.amount_in_base)
    }
  })

  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget</h1>
          <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Set budget
        </button>
      </div>

      <div className="grid gap-4">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => {
            const category = budget.categories as { name: string; icon: string } | null
            const spent = budget.category_id ? (spendingByCategory[budget.category_id] ?? 0) : 0
            const limit = Number(budget.limit_amount)
            const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const isOver = spent > limit
            return (
              <div key={budget.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category?.icon ?? '📦'}</span>
                    <span className="text-sm font-medium text-gray-900">{category?.name ?? 'Category'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(spent, 'INR')}
                    </span>
                    <span className="text-xs text-gray-500"> / {formatCurrency(limit, 'INR')}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% used</p>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No budgets set for this month</p>
            <p className="text-gray-400 text-xs mt-1">Set spending limits by category to stay on track</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/investments/page.tsx ────────────────────────────────────
files['app/(dashboard)/investments/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  stock: '📈 Stock', mutual_fund: '📊 Mutual Fund', crypto: '₿ Crypto',
  etf: '🗂️ ETF', bond: '🏛️ Bond', real_estate: '🏠 Real Estate', other: '💼 Other',
}

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const totalInvested = investments?.reduce((s, i) => s + Number(i.avg_buy_price) * Number(i.quantity), 0) ?? 0
  const totalCurrent = investments?.reduce((s, i) => s + (Number(i.current_price ?? i.avg_buy_price)) * Number(i.quantity), 0) ?? 0
  const totalPnL = totalCurrent - totalInvested
  const totalPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
          <p className="text-sm text-gray-500 mt-1">Track your portfolio</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add investment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total invested</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalInvested, 'INR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current value</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalCurrent, 'INR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">P&amp;L</p>
          <p className={`text-xl font-semibold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL, 'INR')}
            <span className="text-sm ml-1">({totalPct.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {investments && investments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Asset</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg buy</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Current</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const current = Number(inv.current_price ?? inv.avg_buy_price)
                const pnl = (current - Number(inv.avg_buy_price)) * Number(inv.quantity)
                const pct = Number(inv.avg_buy_price) > 0 ? ((current - Number(inv.avg_buy_price)) / Number(inv.avg_buy_price)) * 100 : 0
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                      {inv.ticker && <p className="text-xs text-gray-500">{inv.ticker}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">{TYPE_LABELS[inv.type]}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{Number(inv.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(Number(inv.avg_buy_price), inv.currency)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{inv.current_price ? formatCurrency(current, inv.currency) : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, inv.currency)} ({pct.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No investments yet</p>
            <p className="text-gray-400 text-xs mt-1">Add stocks, mutual funds, or crypto to track your portfolio</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/goals/page.tsx ──────────────────────────────────────────
files['app/(dashboard)/goals/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-gray-100 text-gray-600',
}

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-500 mt-1">Track your savings targets</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + New goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.target_amount > 0
              ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
              : 0
            const remaining = Math.max(Number(goal.target_amount) - Number(goal.saved_amount), 0)
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{goal.title}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-gray-500">
                          By {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[goal.status]}`}>
                    {goal.status}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{formatCurrency(Number(goal.saved_amount), goal.currency)} saved</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-gray-900">{formatCurrency(remaining, goal.currency)}</span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No goals yet</p>
            <p className="text-gray-400 text-xs mt-1">Set a savings goal to start tracking your progress</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/bills/page.tsx ──────────────────────────────────────────
files['app/(dashboard)/bills/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getDaySuffix } from '@/lib/utils'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bills } = await supabase
    .from('bills')
    .select('*, categories(name, icon)')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('due_day', { ascending: true })

  const totalMonthly = bills?.reduce((s, b) => {
    if (b.recurrence === 'monthly') return s + Number(b.amount)
    if (b.recurrence === 'yearly') return s + Number(b.amount) / 12
    if (b.recurrence === 'quarterly') return s + Number(b.amount) / 3
    if (b.recurrence === 'weekly') return s + Number(b.amount) * 4.33
    return s
  }, 0) ?? 0

  const today = new Date().getDate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
          <p className="text-sm text-gray-500 mt-1">Subscriptions &amp; recurring payments</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add bill
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly commitment</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(totalMonthly, 'INR')}</p>
        </div>
        <p className="text-sm text-gray-400">{bills?.length ?? 0} active bills</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bills && bills.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {bills.map((bill) => {
              const isDueSoon = bill.due_day >= today && bill.due_day <= today + 5
              const isOverdue = bill.due_day < today
              const category = bill.categories as { name: string; icon: string } | null
              return (
                <div key={bill.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon ?? '📄'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {bill.recurrence} · Due {bill.due_day}{getDaySuffix(bill.due_day)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDueSoon && !isOverdue && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Due soon</span>
                    )}
                    {isOverdue && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Overdue</span>
                    )}
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(bill.amount), bill.currency)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No bills tracked</p>
            <p className="text-gray-400 text-xs mt-1">Add your subscriptions and recurring payments</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/reports/page.tsx ────────────────────────────────────────
files['app/(dashboard)/reports/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount_in_base, date')
    .eq('user_id', user!.id)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])

  const monthlyData: Record<string, { income: number; expense: number }> = {}
  transactions?.forEach((t) => {
    const month = t.date.substring(0, 7)
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 }
    if (t.type === 'income') monthlyData[month].income += Number(t.amount_in_base)
    if (t.type === 'expense') monthlyData[month].expense += Number(t.amount_in_base)
  })

  const months = Object.keys(monthlyData).sort().reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Last 6 months overview</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {months.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Month</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Income</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Net</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const data = monthlyData[month]
                const net = data.income - data.expense
                const [yr, mo] = month.split('-')
                const label = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString('en-IN', {
                  month: 'long', year: 'numeric',
                })
                return (
                  <tr key={month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{label}</td>
                    <td className="px-6 py-4 text-right text-sm text-emerald-600 font-medium">+{formatCurrency(data.income, 'INR')}</td>
                    <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">-{formatCurrency(data.expense, 'INR')}</td>
                    <td className={`px-6 py-4 text-right text-sm font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net, 'INR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No data to report yet</p>
            <p className="text-gray-400 text-xs mt-1">Add transactions to see your monthly reports</p>
          </div>
        )}
      </div>
    </div>
  )
}
"""

# ─── app/(dashboard)/settings/page.tsx ───────────────────────────────────────
files['app/(dashboard)/settings/page.tsx'] = """import { createClient } from '@/lib/supabase/server'
import { CURRENCIES } from '@/lib/constants'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            defaultValue={profile?.full_name ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue={user?.email ?? ''}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base currency</label>
          <select
            defaultValue={profile?.base_currency ?? 'INR'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Save changes
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanent actions that cannot be undone.</p>
        <button className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
          Delete account
        </button>
      </div>
    </div>
  )
}
"""

print('Creating files...')
for path, content in files.items():
    write(path, content)

print()
print('All done! Now run:')
print('  git add .')
print('  git commit -m "feat: add all app source files"')
print('  git push')