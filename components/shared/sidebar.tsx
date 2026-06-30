'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Settings, LogOut, Wallet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight  },
  { label: 'Accounts',     href: '/dashboard/accounts',     icon: Wallet          },
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
      <div className="px-5 h-[58px] flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={26} />
          <span className="text-sm font-semibold text-white group-hover:opacity-70 transition-opacity">
            Ekam Finance
          </span>
        </Link>
      </div>

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
