'use client'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Month = { label: string; start: string; end: string; income: number; expense: number; net: number; count: number }
type Cat   = { catId: string; icon: string; name: string; amount: number }
type Merch = { name: string; amount: number }
type Dow   = { label: string; amount: number }

interface Props {
  monthly: Month[]; thisMonth: Month
  incomeDelta: number; expenseDelta: number; netDelta: number
  catBreakdown: Cat[]; totalExpenses: number
  topMerchants: Merch[]; byDayOfWeek: Dow[]
  savingsRate: number; avgDailySpend: number; avgTxnSize: number
  biggestExpense: { merchant: string; amount: number } | null
  txnCount: number
}

function useCountUp(target: number, active: boolean, ms = 1200) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) { setV(target); return }
    let raf: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return v
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function DeltaBadge({ pct, invert = false }: { pct: number; invert?: boolean }) {
  const good = invert ? pct < 0 : pct > 0
  const flat = Math.abs(pct) < 0.5
  const Icon = flat ? Minus : pct > 0 ? TrendingUp : TrendingDown
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
      style={{ background: flat ? 'rgba(255,255,255,0.08)' : good ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)', color: flat ? 'rgba(255,255,255,0.5)' : good ? '#34d399' : '#f87171' }}>
      <Icon className="w-2.5 h-2.5" />{Math.abs(pct).toFixed(0)}%
    </span>
  )
}

function KPICard({ label, value, color, delta, invert, idx }: { label: string; value: number; color: string; delta: number; invert?: boolean; idx: number }) {
  const { ref, inView } = useInView()
  const animated = useCountUp(value, inView)
  return (
    <div ref={ref} className="surface-light rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'backwards' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <DeltaBadge pct={delta} invert={invert} />
      </div>
      <p className="text-xl font-black" style={{ color, letterSpacing: '-0.02em' }}>{formatCurrency(animated, 'INR')}</p>
      <p className="text-[10px] text-gray-400 mt-1">vs last month</p>
    </div>
  )
}

export function ReportsView({
  monthly, thisMonth, incomeDelta, expenseDelta, netDelta, catBreakdown, totalExpenses,
  topMerchants, byDayOfWeek, savingsRate, avgDailySpend, avgTxnSize, biggestExpense, txnCount,
}: Props) {
  const [hoverMonth, setHoverMonth] = useState<Month | null>(null)
  const chartEl = useInView()
  const maxBar  = Math.max(...monthly.map(m => Math.max(m.income, m.expense)), 1)
  const maxDow  = Math.max(...byDayOfWeek.map(d => d.amount), 1)
  const shown   = hoverMonth ?? thisMonth

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Deep dive into your money, this month</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard idx={0} label="Income"   value={thisMonth.income}  color="#10b981" delta={incomeDelta} />
        <KPICard idx={1} label="Expenses" value={thisMonth.expense} color="#f43f5e" delta={expenseDelta} invert />
        <KPICard idx={2} label="Net"      value={thisMonth.net}     color={thisMonth.net >= 0 ? '#10b981' : '#f43f5e'} delta={netDelta} />
      </div>

      {/* Secondary stat strip */}
      <div className="grid grid-cols-4 gap-3 animate-fade-up delay-2">
        {[
          { l: 'Savings Rate', v: `${savingsRate.toFixed(0)}%`, c: savingsRate >= 20 ? '#34d399' : savingsRate >= 0 ? '#f59e0b' : '#f87171' },
          { l: 'Avg Daily Spend', v: formatCurrency(avgDailySpend, 'INR'), c: 'rgba(255,255,255,0.85)' },
          { l: 'Avg Transaction', v: formatCurrency(avgTxnSize, 'INR'), c: 'rgba(255,255,255,0.85)' },
          { l: 'Transactions', v: String(txnCount), c: 'rgba(255,255,255,0.85)' },
        ].map(s => (
          <div key={s.l} className="surface-light rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.l}</p>
            <p className="text-base font-black" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* 6-month interactive bar chart */}
      <div className="surface-light rounded-2xl p-6 animate-fade-up delay-3" ref={chartEl.ref}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-900">6-Month Trend</h2>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">{shown.label === thisMonth.label ? 'This month' : shown.label}</p>
            <p className="text-xs font-bold" style={{ color: shown.net >= 0 ? '#10b981' : '#f43f5e' }}>
              Net {formatCurrency(shown.net, 'INR')}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {monthly.map((m, i) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
              onMouseEnter={() => setHoverMonth(m)} onMouseLeave={() => setHoverMonth(null)}>
              <div className="w-full flex gap-0.5 items-end" style={{ height: '128px' }}>
                <div className="flex-1 rounded-t-md transition-all duration-700 group-hover:opacity-100"
                  style={{
                    height: chartEl.inView ? `${(m.income / maxBar) * 100}%` : '0%', transitionDelay: `${i * 60}ms`,
                    background: '#10b981', minHeight: m.income > 0 ? '4px' : '0',
                    opacity: hoverMonth && hoverMonth.label !== m.label ? 0.35 : 1,
                  }} />
                <div className="flex-1 rounded-t-md transition-all duration-700 group-hover:opacity-100"
                  style={{
                    height: chartEl.inView ? `${(m.expense / maxBar) * 100}%` : '0%', transitionDelay: `${i * 60}ms`,
                    background: '#f43f5e', minHeight: m.expense > 0 ? '4px' : '0',
                    opacity: hoverMonth && hoverMonth.label !== m.label ? 0.35 : 1,
                  }} />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${hoverMonth?.label === m.label ? 'text-gray-900' : 'text-gray-400'}`}>{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-[11px] text-gray-500">Income</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-[11px] text-gray-500">Expenses</span></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Category breakdown */}
        {catBreakdown.length > 0 && (
          <div className="surface-light rounded-2xl p-6 animate-fade-up delay-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Spending by Category</h2>
            <div className="space-y-3">
              {catBreakdown.slice(0, 6).map((c, i) => {
                const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0
                return (
                  <div key={c.catId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{c.icon} {c.name}</span>
                      <span className="text-[11px] font-bold text-gray-500">{formatCurrency(c.amount, 'INR')} · {Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: '#f43f5e', transitionDelay: `${i * 80}ms` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top merchants */}
        {topMerchants.length > 0 && (
          <div className="surface-light rounded-2xl p-6 animate-fade-up delay-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Top Merchants</h2>
            <div className="space-y-2.5">
              {topMerchants.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black" style={{ background: 'rgba(244,63,94,0.14)', color: '#f87171' }}>{i + 1}</span>
                    <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{m.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{formatCurrency(m.amount, 'INR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day-of-week pattern + biggest expense */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="surface-light rounded-2xl p-6 animate-fade-up delay-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Spending by Day of Week</h2>
          <div className="flex items-end gap-2 h-24">
            {byDayOfWeek.map(d => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${(d.amount / maxDow) * 100}%`, minHeight: d.amount > 0 ? '4px' : '0', background: 'linear-gradient(180deg,#a78bfa,#7c3aed)' }} />
                <span className="text-[10px] text-gray-400 font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-light rounded-2xl p-6 flex flex-col justify-center animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Biggest Expense — {thisMonth.label}</p>
          {biggestExpense ? (
            <>
              <p className="text-lg font-black text-gray-900 truncate">{biggestExpense.merchant}</p>
              <p className="text-2xl font-black text-red-500 mt-1">{formatCurrency(biggestExpense.amount, 'INR')}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No expenses recorded yet</p>
          )}
        </div>
      </div>

      {/* Monthly table */}
      <div className="surface-light rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Income</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expenses</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Net</th>
            </tr>
          </thead>
          <tbody>
            {[...monthly].reverse().map(m => (
              <tr key={m.label} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-700">{m.label}</td>
                <td className="px-6 py-3.5 text-right text-sm font-semibold text-emerald-600">{m.income > 0 ? formatCurrency(m.income, 'INR') : '—'}</td>
                <td className="px-6 py-3.5 text-right text-sm font-semibold text-red-500">{m.expense > 0 ? formatCurrency(m.expense, 'INR') : '—'}</td>
                <td className={`px-6 py-3.5 text-right text-sm font-black ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {m.income > 0 || m.expense > 0 ? formatCurrency(m.net, 'INR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
