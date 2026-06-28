import Link from 'next/link'
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
