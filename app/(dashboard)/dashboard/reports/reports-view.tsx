'use client'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Month = { label: string; start: string; end: string; income: number; expense: number; net: number; count: number }
type Cat   = { catId: string; icon: string; name: string; amount: number }
type Merch = { name: string; amount: number }
type Dow   = { label: string; amount: number }
type DayTxn = { day: number; id: string; merchant: string; amount: number; icon: string; categoryName: string }

interface Props {
  monthly: Month[]; thisMonth: Month
  incomeDelta: number; expenseDelta: number; netDelta: number
  catBreakdown: Cat[]; totalExpenses: number
  topMerchants: Merch[]; byDayOfWeek: Dow[]
  dailySpend: number[]; dailyTxns: DayTxn[][]; daysInMonth: number; firstDayOfMonth: number; monthYear: string
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.15 })
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
    <div ref={ref} className="surface-light rounded-2xl p-3.5 sm:p-5 animate-fade-up min-w-0" style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'backwards' }}>
      <div className="flex items-center justify-between mb-2 gap-1">
        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate min-w-0">{label}</p>
        <DeltaBadge pct={delta} invert={invert} />
      </div>
      <p className="text-base sm:text-xl font-black truncate" style={{ color, letterSpacing: '-0.02em' }}>{formatCurrency(animated, 'INR')}</p>
      <p className="text-[10px] text-gray-400 mt-1">vs last month</p>
    </div>
  )
}

// ── Day-wise calendar heatmap with click-to-expand drawer ─────────────────────
function DailyCalendar({ dailySpend, dailyTxns, daysInMonth, firstDayOfMonth, monthYear }: {
  dailySpend: number[]; dailyTxns: DayTxn[][]; daysInMonth: number; firstDayOfMonth: number; monthYear: string
}) {
  const { ref, inView } = useInView()
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const maxSpend = Math.max(...dailySpend.slice(1, daysInMonth + 1), 0.01)
  const today    = new Date().getDate()

  // Build 7-column grid cells: leading empty cells + day cells
  const cells: { day: number | null; amount: number }[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push({ day: null, amount: 0 })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, amount: dailySpend[d] ?? 0 })

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push({ day: null, amount: 0 })

  function cellColor(amount: number, isToday: boolean): string {
    if (amount <= 0) return isToday ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.03)'
    const intensity = Math.pow(amount / maxSpend, 0.6) // soften with power curve
    const r = Math.round(244 * intensity + 59 * (1 - intensity))
    const g = Math.round(63  * intensity + 130 * (1 - intensity))
    const b = Math.round(94  * intensity + 246 * (1 - intensity))
    return `rgba(${r},${g},${b},${0.18 + intensity * 0.72})`
  }

  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedTxns = selectedDay ? (dailyTxns[selectedDay] ?? []) : []
  const selectedTotal = selectedDay ? (dailySpend[selectedDay] ?? 0) : 0

  function toggleDay(day: number) {
    setSelectedDay(prev => (prev === day ? null : day))
  }

  return (
    <div className="surface-light rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }} ref={ref}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Daily Spending — {monthYear}</h2>
        {hoverDay && !selectedDay && dailySpend[hoverDay] > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Day {hoverDay} · click for details</p>
            <p className="text-xs font-bold text-red-500">{formatCurrency(dailySpend[hoverDay], 'INR')}</p>
          </div>
        )}
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return <div key={`empty-${idx}`} className="aspect-square rounded-lg" />
          }
          const isToday = cell.day === today
          const isFuture = cell.day > today
          const isSelected = selectedDay === cell.day
          const bg = inView ? cellColor(cell.amount, isToday) : 'rgba(255,255,255,0.03)'
          const isHover = hoverDay === cell.day
          const hasTxns = cell.amount > 0 && !isFuture

          return (
            <div
              key={cell.day}
              className="aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-500"
              style={{
                background: bg,
                border: isSelected ? '1.5px solid #f43f5e' : isToday ? '1px solid rgba(52,211,153,0.5)' : isHover ? '1px solid rgba(244,63,94,0.4)' : '1px solid transparent',
                opacity: isFuture ? 0.35 : 1,
                transitionDelay: inView ? `${idx * 8}ms` : '0ms',
                transform: isSelected ? 'scale(1.14)' : isHover ? 'scale(1.12)' : 'scale(1)',
                cursor: hasTxns ? 'pointer' : 'default',
              }}
              onMouseEnter={() => setHoverDay(cell.day)}
              onMouseLeave={() => setHoverDay(null)}
              onClick={() => hasTxns && toggleDay(cell.day!)}
            >
              <span className="text-[10px] font-bold" style={{ color: cell.amount > 0 ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.35)' }}>
                {cell.day}
              </span>
              {cell.amount > 0 && (
                <span className="text-[8px] font-semibold leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {cell.amount >= 1000 ? `${(cell.amount / 1000).toFixed(0)}k` : Math.round(cell.amount)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <span className="text-[10px] text-gray-400">No spend</span>
        </div>
        <div className="flex items-center gap-1">
          {[0.15, 0.35, 0.55, 0.75, 1.0].map((v, i) => (
            <div key={i} className="w-4 h-3 rounded-sm" style={{ background: cellColor(v * maxSpend, false) }} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">High</span>
        </div>
      </div>

      {/* Click-to-expand day drawer */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: selectedDay ? `${80 + selectedTxns.length * 56}px` : '0px', opacity: selectedDay ? 1 : 0, marginTop: selectedDay ? '16px' : '0px' }}
      >
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Day {selectedDay} — {selectedTxns.length} transaction{selectedTxns.length === 1 ? '' : 's'}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Total spent {formatCurrency(selectedTotal, 'INR')}</p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {selectedTxns.map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'rgba(244,63,94,0.12)' }}>{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{t.merchant}</p>
                    <p className="text-[10px] text-gray-400">{t.categoryName}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-500 flex-shrink-0 ml-2">{formatCurrency(t.amount, 'INR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReportsView({
  monthly, thisMonth, incomeDelta, expenseDelta, netDelta, catBreakdown, totalExpenses,
  topMerchants, byDayOfWeek, dailySpend, dailyTxns, daysInMonth, firstDayOfMonth, monthYear,
  savingsRate, avgDailySpend, avgTxnSize, biggestExpense, txnCount,
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <KPICard idx={0} label="Income"   value={thisMonth.income}  color="#10b981" delta={incomeDelta} />
        <KPICard idx={1} label="Expenses" value={thisMonth.expense} color="#f43f5e" delta={expenseDelta} invert />
        <KPICard idx={2} label="Net"      value={thisMonth.net}     color={thisMonth.net >= 0 ? '#10b981' : '#f43f5e'} delta={netDelta} />
      </div>

      {/* Secondary stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 animate-fade-up delay-2">
        {[
          { l: 'Savings Rate', v: `${savingsRate.toFixed(0)}%`, c: savingsRate >= 20 ? '#34d399' : savingsRate >= 0 ? '#f59e0b' : '#f87171' },
          { l: 'Avg Daily Spend', v: formatCurrency(avgDailySpend, 'INR'), c: 'rgba(255,255,255,0.85)' },
          { l: 'Avg Transaction', v: formatCurrency(avgTxnSize, 'INR'), c: 'rgba(255,255,255,0.85)' },
          { l: 'Transactions', v: String(txnCount), c: 'rgba(255,255,255,0.85)' },
        ].map(s => (
          <div key={s.l} className="surface-light rounded-2xl p-3.5 sm:p-4 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">{s.l}</p>
            <p className="text-sm sm:text-base font-black truncate" style={{ color: s.c }}>{s.v}</p>
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
                <div className="flex-1 rounded-t-md transition-all duration-700"
                  style={{ height: chartEl.inView ? `${(m.income / maxBar) * 100}%` : '0%', transitionDelay: `${i * 60}ms`, background: '#10b981', minHeight: m.income > 0 ? '4px' : '0', opacity: hoverMonth && hoverMonth.label !== m.label ? 0.35 : 1 }} />
                <div className="flex-1 rounded-t-md transition-all duration-700"
                  style={{ height: chartEl.inView ? `${(m.expense / maxBar) * 100}%` : '0%', transitionDelay: `${i * 60}ms`, background: '#f43f5e', minHeight: m.expense > 0 ? '4px' : '0', opacity: hoverMonth && hoverMonth.label !== m.label ? 0.35 : 1 }} />
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

      {/* ── Daily calendar heatmap ─────────────────────────────────────────── */}
      <DailyCalendar
        dailySpend={dailySpend}
        dailyTxns={dailyTxns}
        daysInMonth={daysInMonth}
        firstDayOfMonth={firstDayOfMonth}
        monthYear={monthYear}
      />

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
                    <span className="text-xs font-semibold text-gray-700 truncate max-w-[110px] sm:max-w-[140px]">{m.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{formatCurrency(m.amount, 'INR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day-of-week + biggest expense */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="surface-light rounded-2xl p-6 animate-fade-up delay-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Spending by Day of Week</h2>
          <div className="flex items-end gap-2 h-24">
            {byDayOfWeek.map(d => (
              <div key={d.label} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5">
                <div className="w-full flex items-end" style={{ height: '80px' }}>
                  <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${(d.amount / maxDow) * 100}%`, minHeight: d.amount > 0 ? '4px' : '0', background: 'linear-gradient(180deg,#a78bfa,#7c3aed)' }} />
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-light rounded-2xl p-6 flex flex-col justify-center animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Biggest Expense — {monthYear}</p>
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

      {/* Monthly summary table */}
      <div className="surface-light rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-3 sm:px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
              <th className="text-right px-3 sm:px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Income</th>
              <th className="text-right px-3 sm:px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expenses</th>
              <th className="text-right px-3 sm:px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Net</th>
            </tr>
          </thead>
          <tbody>
            {[...monthly].reverse().map(m => (
              <tr key={m.label} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                <td className="px-3 sm:px-6 py-3.5 text-sm font-semibold text-gray-700">{m.label}</td>
                <td className="px-3 sm:px-6 py-3.5 text-right text-sm font-semibold text-emerald-600">{m.income > 0 ? formatCurrency(m.income, 'INR') : '—'}</td>
                <td className="px-3 sm:px-6 py-3.5 text-right text-sm font-semibold text-red-500">{m.expense > 0 ? formatCurrency(m.expense, 'INR') : '—'}</td>
                <td className={`px-3 sm:px-6 py-3.5 text-right text-sm font-black ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
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
