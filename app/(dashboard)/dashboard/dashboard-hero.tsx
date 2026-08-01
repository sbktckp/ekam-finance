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
const AmbientScene = dynamic(
  () => import('@/components/shared/ambient-scene').then(m => m.AmbientScene),
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

  const accent = positive ? '16,185,129' : '244,63,94'

  return (
    <div ref={rootRef} className="space-y-4">
      {/* Hero slab */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: `radial-gradient(120% 140% at 82% 20%, rgba(${accent},0.16) 0%, rgba(139,92,246,0.10) 38%, rgba(9,11,16,0) 70%), #0b0e14`,
          border: '1px solid rgba(148,163,184,0.14)',
        }}
      >
        <div className="absolute inset-0">
          <AmbientScene accent={positive ? '#10b981' : '#f43f5e'} shape="knot" intensity={intensity} />
        </div>

        {/*
          Readability scrim. Dark, matching the app shell: opaque behind the
          copy on the left and clearing to nothing on the right so the canvas
          stays visible. Pointer events pass through to the scene.
        */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(100deg, #0b0e14 0%, rgba(11,14,20,0.92) 34%, rgba(11,14,20,0.45) 58%, rgba(11,14,20,0) 80%)' }}
        />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div data-anim="head" className="min-w-0">
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.85)' }}>{dateLabel}</p>
            <h1
              className="font-black mt-0.5"
              style={{ fontSize: '24px', letterSpacing: '-0.03em', color: '#f8fafc' }}
            >
              Good {greeting}, {name}
            </h1>

            <p
              className="text-[11px] font-bold uppercase tracking-widest mt-5"
              style={{ color: 'rgba(148,163,184,0.7)' }}
            >
              Net worth
            </p>
            <p
              ref={netRef}
              className="font-black leading-none mt-1"
              style={{ fontSize: '40px', letterSpacing: '-0.04em', color: '#ffffff' }}
            >
              {formatCurrency(netWorth, currency)}
            </p>
          </div>

          <Link
            href="/dashboard/transactions"
            data-anim="head"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#04140e' }}
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
              className="relative overflow-hidden rounded-2xl p-5 group transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: `radial-gradient(120% 120% at 88% 6%, ${k.color}14 0%, rgba(11,14,20,0) 60%), #0d1017`,
                border: '1px solid rgba(148,163,184,0.13)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium truncate" style={{ color: 'rgba(148,163,184,0.8)' }}>{k.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: k.color + '1f', color: k.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p
                data-count={k.value}
                className="text-2xl font-black truncate"
                style={{ letterSpacing: '-0.03em', color: '#ffffff' }}
              >
                {formatCurrency(k.value, currency)}
              </p>
              {k.note && <p className="text-xs mt-1 truncate" style={{ color: 'rgba(148,163,184,0.65)' }}>{k.note}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
