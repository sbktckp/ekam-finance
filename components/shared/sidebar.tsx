'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Calculator, TrendingUp,
  Target, CalendarClock, BarChart3, Settings, LogOut, Wallet,
  Menu, X,
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
  const [open, setOpen] = useState(false)

  // Close the drawer on route change (mobile nav taps)
  useEffect(() => { setOpen(false) }, [path])

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
    <>
      {/* Mobile topbar */}
      <div
        className="md:hidden fixed inset-x-0 top-0 z-40 h-[52px] flex items-center justify-between px-4"
        style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.055)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-sm font-semibold text-white">Ekam Finance</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-lg"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 md:w-60 flex flex-col z-50 transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.055)' }}
      >
        <div
          className="px-5 h-[58px] flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={26} />
            <span className="text-sm font-semibold text-white group-hover:opacity-70 transition-opacity">
              Ekam Finance
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1 -mr-1 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <X className="w-4.5 h-4.5" />
          </button>
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
    </>
  )
}
