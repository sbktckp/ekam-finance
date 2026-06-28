'use client'

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
