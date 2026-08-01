'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Plus, TrendingUp, TrendingDown, Wallet, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

/**
 * three.js only loads on the client, and only once the hero is actually
 * mounted. It never blocks first paint or lands in the server bundle.
 */
const NetWorthScene = dynamic(
  () => import('./net-worth-scene').then(m => m.NetWorthScene),
  { ssr: false, loading: () => null },
)

export type HeroKpi = {
  key: string
  label: string
  value: number
  color: string
  icon: 'wallet' | 'up' | 'down' | 'spark'
  note?: string
}

const ICONS = {
  wallet: Wallet,
  up: TrendingUp,
  down: TrendingDown,
  spark: Sparkles,
}

interface Props {
  greeting: string
  name: string
  dateLabel: string
  netWorth: number
  currency: string
  kpis: HeroKpi[]
  positive: boolean
  /** 0..1, how lively the scene should be. Usually spend relative to income. */
  intensity: number
}

export function DashboardHero({
  greeting, name, dateLabel, netWorth, currency, kpis, positive, intensity,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const netRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-anim]', { opacity: 1, y: 0 })
        return
      }

      gsap.from('[data-anim="head"]', {
        opacity: 0, y: 14, duration: 0.6, ease: 'power3.out',
      })

      gsap.from('[data-anim="kpi"]', {
        opacity: 0, y: 18, duration: 0.55, ease: 'power3.out',
        stagger: 0.07, delay: 0.12,
      })

      // Count the headline figure up from zero.
      const el = netRef.current
      if (el) {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: netWorth,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = formatCurrency(obj.v, currency) },
        })
      }

      // Counters inside each KPI tile.
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el, i) => {
        const to = Number(el.dataset.count ?? '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: to,
          duration: 0.9,
          delay: 0.15 + i * 0.06,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = formatCurrency(obj.v, currency) },
        })
      })
    }, rootRef)

    return () => ctx.revert()
  }, [netWorth, currency])

  return (
    <div ref={rootRef} className="space-y-4">
      {/* Hero slab */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(140deg, rgba(16,185,129,0.10), rgba(139,92,246,0.10) 60%, rgba(15,23,42,0.04))',
          border: '1px solid rgba(148,163,184,0.16)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.85]">
          <NetWorthScene positive={positive} intensity={intensity} />
        </div>

        {/* Readability scrim over the canvas */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 42%, rgba(255,255,255,0) 78%)' }}
        />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div data-anim="head" className="min-w-0">
            <p className="text-sm text-gray-500">{dateLabel}</p>
            <h1
              className="font-black text-gray-900 mt-0.5"
              style={{ fontSize: '24px', letterSpacing: '-0.03em' }}
            >
              Good {greeting}, {name}
            </h1>

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-5">Net worth</p>
            <p
              ref={netRef}
              className="font-black text-gray-900 leading-none mt-1"
              style={{ fontSize: '40px', letterSpacing: '-0.04em' }}
            >
              {formatCurrency(netWorth, currency)}
            </p>
          </div>

          <Link
            href="/dashboard/transactions"
            data-anim="head"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0"
            style={{ background: '#10b981', color: '#04140e' }}
          >
            <Plus className="w-4 h-4" /> Add transaction
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => {
          const Icon = ICONS[k.icon]
          return (
            <div
              key={k.key}
              data-anim="kpi"
              className="surface-light rounded-2xl p-5 group transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 font-medium truncate">{k.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: k.color + '15', color: k.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p
                data-count={k.value}
                className="text-2xl font-black text-gray-900 truncate"
                style={{ letterSpacing: '-0.02em' }}
              >
                {formatCurrency(k.value, currency)}
              </p>
              {k.note && <p className="text-xs text-gray-400 mt-1 truncate">{k.note}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
