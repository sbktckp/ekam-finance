'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, X, ChevronLeft, ChevronRight, Sparkles, Inbox } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type DayTxn = {
  day: number; id: string; merchant: string; amount: number
  icon: string; color: string; categoryName: string; type: 'income' | 'expense'
}
type Cat = {
  catId: string; icon: string; name: string; color: string; amount: number
  /** Same category last month. null when there is no previous month in range. */
  prevAmount: number | null
}
type Merch = { name: string; amount: number }
type Dow = { label: string; amount: number }

export type MonthBundle = {
  label: string; monthYear: string; shortYear: string
  start: string; end: string; isCurrent: boolean
  income: number; expense: number; net: number
  txnCount: number; expenseCount: number; incomeCount: number
  daysInMonth: number; firstDayOfMonth: number; elapsedDays: number; todayDay: number | null
  catBreakdown: Cat[]; topMerchants: Merch[]; byDayOfWeek: Dow[]
  droppedCats: Cat[]
  incomeBreakdown: Cat[]; topIncomeSources: Merch[]
  dailySpend: number[]; dailyIncome: number[]; dailyTxns: DayTxn[][]
  savingsRate: number; avgDailySpend: number; avgTxnSize: number; avgIncomeSize: number
  biggestExpense: { merchant: string; amount: number } | null
  hasPrev: boolean
}

interface Props { months: MonthBundle[]; currency: string }

function useCountUp(target: number, active: boolean, ms = 900) {
  const [v, setV] = useState(target)
  useEffect(() => {
    if (!active) { setV(target); return }
    let raf: number
    const from = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      setV(from + (target - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, ms])
  return v
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

/** null means "no comparable baseline" (previous month had zero). */
function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return null
  return ((cur - prev) / Math.abs(prev)) * 100
}

function DeltaBadge({ pct, invert = false }: { pct: number | null; invert?: boolean }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">
        new
      </span>
    )
  }
  const flat = Math.abs(pct) < 0.5
  const good = invert ? pct < 0 : pct > 0
  const Icon = flat ? Minus : pct > 0 ? TrendingUp : TrendingDown
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
      style={{
        background: flat ? 'rgba(148,163,184,0.18)' : good ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)',
        color: flat ? '#94a3b8' : good ? '#34d399' : '#f87171',
      }}
    >
      <Icon className="w-2.5 h-2.5" />{Math.abs(pct).toFixed(0)}%
    </span>
  )
}

function Card({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`surface-light rounded-2xl animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'backwards' }}
    >
      {children}
    </div>
  )
}

function SectionEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
      <Inbox className="w-5 h-5 text-gray-300" />
      <p className="text-xs text-gray-400">{text}</p>
    </div>
  )
}

/**
 * One category row with its share bar and, when a baseline exists, a
 * month-over-month delta badge plus the previous month's figure.
 */
function CatRow({ c, total, currency, showDelta, invert, i }: {
  c: Cat; total: number; currency: string; showDelta: boolean; invert: boolean; i: number
}) {
  const pct = total > 0 ? (c.amount / total) * 100 : 0
  const delta = c.prevAmount === null ? null : pctDelta(c.amount, c.prevAmount)
  return (
    <div>
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-xs font-semibold text-gray-700 truncate min-w-0">{c.icon} {c.name}</span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold text-gray-500">
            {formatCurrency(c.amount, currency)} · {Math.round(pct)}%
          </span>
          {showDelta && c.prevAmount !== null && <DeltaBadge pct={delta} invert={invert} />}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: c.color, transitionDelay: `${i * 80}ms` }} />
      </div>
      {showDelta && c.prevAmount !== null && c.prevAmount > 0 && (
        <p className="text-[10px] text-gray-400 mt-0.5">
          was {formatCurrency(c.prevAmount, currency)} last month
        </p>
      )}
    </div>
  )
}

/* Month switcher */
function MonthSwitcher({ months, idx, onPick }: { months: MonthBundle[]; idx: number; onPick: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPick(Math.max(0, idx - 1))}
        disabled={idx === 0}
        className="w-8 h-8 rounded-xl surface-light flex items-center justify-center disabled:opacity-30 flex-shrink-0"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      </button>

      <div className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto py-0.5">
        {months.map((m, i) => {
          const active = i === idx
          const hasData = m.txnCount > 0
          return (
            <button
              key={m.start}
              onClick={() => onPick(i)}
              className="flex-1 min-w-[52px] rounded-xl px-2 py-1.5 transition-all"
              style={{
                background: active ? 'rgba(16,185,129,0.16)' : 'rgba(148,163,184,0.10)',
                border: active ? '1px solid rgba(52,211,153,0.55)' : '1px solid transparent',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                opacity: hasData || active ? 1 : 0.45,
              }}
            >
              <span className={`block text-[11px] font-bold ${active ? 'text-emerald-500' : 'text-gray-500'}`}>
                {m.label}
              </span>
              <span className="block text-[9px] font-semibold text-gray-400">
                {hasData ? `${m.txnCount}` : 'none'}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPick(Math.min(months.length - 1, idx + 1))}
        disabled={idx === months.length - 1}
        className="w-8 h-8 rounded-xl surface-light flex items-center justify-center disabled:opacity-30 flex-shrink-0"
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

function KPICard({ label, value, color, delta, invert, idx, currency }: {
  label: string; value: number; color: string; delta: number | null
  invert?: boolean; idx: number; currency: string
}) {
  const { ref, inView } = useInView()
  const animated = useCountUp(value, inView)
  return (
    <div ref={ref} className="surface-light rounded-2xl p-3.5 sm:p-5 animate-fade-up min-w-0"
      style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: 'backwards' }}>
      <div className="flex items-center justify-between mb-2 gap-1">
        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate min-w-0">{label}</p>
        <DeltaBadge pct={delta} invert={invert} />
      </div>
      <p className="text-base sm:text-xl font-black truncate" style={{ color, letterSpacing: '-0.02em' }}>
        {formatCurrency(animated, currency)}
      </p>
      <p className="text-[10px] text-gray-400 mt-1">vs previous month</p>
    </div>
  )
}

/* Calendar heatmap */
function DailyCalendar({ m, currency }: { m: MonthBundle; currency: string }) {
  const { ref, inView } = useInView()
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => { setSelectedDay(null); setHoverDay(null) }, [m.start])

  const maxSpend = Math.max(...m.dailySpend.slice(1, m.daysInMonth + 1), 0.01)

  const cells: { day: number | null }[] = []
  for (let i = 0; i < m.firstDayOfMonth; i++) cells.push({ day: null })
  for (let d = 1; d <= m.daysInMonth; d++) cells.push({ day: d })
  while (cells.length % 7 !== 0) cells.push({ day: null })

  function cellColor(amount: number, isToday: boolean): string {
    if (amount <= 0) return isToday ? 'rgba(52,211,153,0.12)' : 'rgba(148,163,184,0.10)'
    const t = Math.pow(amount / maxSpend, 0.6)
    const r = Math.round(244 * t + 59 * (1 - t))
    const g = Math.round(63 * t + 130 * (1 - t))
    const b = Math.round(94 * t + 246 * (1 - t))
    return `rgba(${r},${g},${b},${0.20 + t * 0.70})`
  }

  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const selectedTxns = selectedDay ? (m.dailyTxns[selectedDay] ?? []) : []
  const selSpend = selectedDay ? (m.dailySpend[selectedDay] ?? 0) : 0
  const selIncome = selectedDay ? (m.dailyIncome[selectedDay] ?? 0) : 0

  if (m.txnCount === 0) {
    return (
      <Card delay={0.3} className="p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-1">Daily activity</h2>
        <SectionEmpty text={`Nothing recorded in ${m.monthYear}.`} />
      </Card>
    )
  }

  return (
    <Card delay={0.3} className="p-5 sm:p-6">
      <div ref={ref}>
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Daily activity</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Shade shows spend, green dot marks money in</p>
          </div>
          {hoverDay && !selectedDay && (m.dailySpend[hoverDay] > 0 || m.dailyIncome[hoverDay] > 0) && (
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-400">Day {hoverDay}</p>
              {m.dailySpend[hoverDay] > 0 && (
                <p className="text-xs font-bold text-red-500">{formatCurrency(m.dailySpend[hoverDay], currency)}</p>
              )}
              {m.dailyIncome[hoverDay] > 0 && (
                <p className="text-[11px] font-bold text-emerald-500">+{formatCurrency(m.dailyIncome[hoverDay], currency)}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-0.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (cell.day === null) return <div key={`e-${idx}`} className="aspect-square rounded-lg" />
            const day = cell.day
            const spend = m.dailySpend[day] ?? 0
            const income = m.dailyIncome[day] ?? 0
            const isToday = m.todayDay === day
            const isFuture = m.todayDay !== null && day > m.todayDay
            const isSelected = selectedDay === day
            const isHover = hoverDay === day
            const clickable = (m.dailyTxns[day] ?? []).length > 0

            return (
              <button
                key={day}
                type="button"
                disabled={!clickable}
                className="aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-500"
                style={{
                  background: inView ? cellColor(spend, isToday) : 'rgba(148,163,184,0.08)',
                  border: isSelected
                    ? '1.5px solid #f43f5e'
                    : isToday ? '1px solid rgba(52,211,153,0.55)'
                    : isHover ? '1px solid rgba(244,63,94,0.4)' : '1px solid transparent',
                  opacity: isFuture ? 0.3 : 1,
                  transitionDelay: inView ? `${idx * 6}ms` : '0ms',
                  transform: isSelected ? 'scale(1.12)' : isHover ? 'scale(1.08)' : 'scale(1)',
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onMouseEnter={() => setHoverDay(day)}
                onMouseLeave={() => setHoverDay(null)}
                onFocus={() => setHoverDay(day)}
                onBlur={() => setHoverDay(null)}
                onClick={() => setSelectedDay(prev => (prev === day ? null : day))}
                aria-label={`Day ${day}, spent ${Math.round(spend)}`}
              >
                <span className="text-[10px] font-bold" style={{ color: spend > 0 ? '#fff' : undefined }}>
                  <span className={spend > 0 ? '' : 'text-gray-400'}>{day}</span>
                </span>
                {spend > 0 && (
                  <span className="text-[8px] font-semibold leading-none mt-0.5 text-white/70">
                    {spend >= 1000 ? `${(spend / 1000).toFixed(1)}k` : Math.round(spend)}
                  </span>
                )}
                {income > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(148,163,184,0.14)' }} />
              <span className="text-[10px] text-gray-400">No spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
              <span className="text-[10px] text-gray-400">Money in</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[0.15, 0.35, 0.55, 0.75, 1].map((v, i) => (
              <div key={i} className="w-4 h-3 rounded-sm" style={{ background: cellColor(v * maxSpend, false) }} />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">High</span>
          </div>
        </div>

        {/* Day drawer */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: selectedDay ? '340px' : '0px',
            opacity: selectedDay ? 1 : 0,
            marginTop: selectedDay ? '16px' : '0px',
          }}
        >
          <div className="rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900">
                  {m.label} {selectedDay} · {selectedTxns.length} {selectedTxns.length === 1 ? 'entry' : 'entries'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {selSpend > 0 && <>Out {formatCurrency(selSpend, currency)}</>}
                  {selSpend > 0 && selIncome > 0 && ' · '}
                  {selIncome > 0 && <span className="text-emerald-500">In {formatCurrency(selIncome, currency)}</span>}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100 flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1 max-h-[236px] overflow-y-auto pr-1">
              {selectedTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${t.color}22` }}
                    >
                      {t.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{t.merchant}</p>
                      <p className="text-[10px] text-gray-400 truncate">{t.categoryName}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold flex-shrink-0 ml-2"
                    style={{ color: t.type === 'income' ? '#34d399' : '#f87171' }}
                  >
                    {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ReportsView({ months, currency }: Props) {
  const [idx, setIdx] = useState(months.length - 1)
  const m = months[idx]
  const prev = months[idx - 1]
  const chartEl = useInView()

  const maxBar = useMemo(() => Math.max(...months.map(x => Math.max(x.income, x.expense)), 1), [months])
  const maxDow = Math.max(...m.byDayOfWeek.map(d => d.amount), 1)
  const hasData = m.txnCount > 0
  const tooEarly = m.isCurrent && m.elapsedDays <= 3

  const incomeDelta = prev ? pctDelta(m.income, prev.income) : null
  const expenseDelta = prev ? pctDelta(m.expense, prev.expense) : null
  const netDelta = prev ? pctDelta(m.net, prev.net) : null

  /** Categories that moved the most in absolute terms, for the MoM summary line. */
  const biggestMover = useMemo(() => {
    if (!m.hasPrev) return null
    const scored = m.catBreakdown
      .filter(c => c.prevAmount !== null)
      .map(c => ({ c, diff: c.amount - (c.prevAmount ?? 0) }))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    return scored[0] && Math.abs(scored[0].diff) > 0 ? scored[0] : null
  }, [m])

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">{m.monthYear}{m.isCurrent ? ' · in progress' : ''}</p>
      </div>

      <div className="animate-fade-up delay-1">
        <MonthSwitcher months={months} idx={idx} onPick={setIdx} />
      </div>

      {tooEarly && hasData && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5 animate-fade-up delay-1"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)' }}>
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <p className="text-xs text-gray-600">
            Only {m.elapsedDays} {m.elapsedDays === 1 ? 'day' : 'days'} into {m.monthYear}. Rates and averages will settle as the month fills in.
          </p>
        </div>
      )}

      {!hasData ? (
        <Card delay={0.1} className="p-10 flex flex-col items-center text-center gap-3">
          <Inbox className="w-8 h-8 text-gray-300" />
          <div>
            <p className="text-sm font-bold text-gray-900">No activity in {m.monthYear}</p>
            <p className="text-xs text-gray-400 mt-1">Pick another month above, or add transactions for this one.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <KPICard idx={0} label="In" value={m.income} color="#10b981" delta={incomeDelta} currency={currency} />
            <KPICard idx={1} label="Out" value={m.expense} color="#f43f5e" delta={expenseDelta} invert currency={currency} />
            <KPICard idx={2} label="Net" value={m.net} color={m.net >= 0 ? '#10b981' : '#f43f5e'} delta={netDelta} currency={currency} />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 animate-fade-up delay-2">
            {[
              {
                l: 'Savings rate',
                v: m.income > 0 ? `${m.savingsRate.toFixed(0)}%` : 'n/a',
                c: m.income === 0 ? '#94a3b8' : m.savingsRate >= 20 ? '#34d399' : m.savingsRate >= 0 ? '#f59e0b' : '#f87171',
                sub: m.income > 0 ? 'of money in' : 'no income yet',
              },
              {
                l: 'Avg per day',
                v: formatCurrency(m.avgDailySpend, currency),
                c: undefined,
                sub: m.isCurrent ? `over ${m.elapsedDays} days so far` : `over ${m.daysInMonth} days`,
              },
              {
                l: 'Avg spend',
                v: formatCurrency(m.avgTxnSize, currency),
                c: undefined,
                sub: `${m.expenseCount} expense${m.expenseCount === 1 ? '' : 's'}`,
              },
              {
                l: 'Entries',
                v: String(m.txnCount),
                c: undefined,
                sub: 'income and expense',
              },
            ].map(s => (
              <div key={s.l} className="surface-light rounded-2xl p-3.5 sm:p-4 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">{s.l}</p>
                <p className="text-sm sm:text-base font-black truncate text-gray-900" style={s.c ? { color: s.c } : undefined}>{s.v}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{s.sub}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Trend chart, always visible: it is the month navigator too */}
      <Card delay={0.24} className="p-5 sm:p-6">
        <div ref={chartEl.ref}>
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">6 month trend</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Tap a month to load it</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-400">{m.shortYear}</p>
              <p className="text-xs font-bold" style={{ color: m.net >= 0 ? '#10b981' : '#f43f5e' }}>
                Net {formatCurrency(m.net, currency)}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {months.map((x, i) => {
              const active = i === idx
              return (
                <button
                  key={x.start}
                  onClick={() => setIdx(i)}
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer h-full justify-end"
                >
                  <div className="w-full flex gap-0.5 items-end" style={{ height: '128px' }}>
                    <div className="flex-1 rounded-t-md transition-all duration-700"
                      style={{
                        height: chartEl.inView ? `${(x.income / maxBar) * 100}%` : '0%',
                        transitionDelay: `${i * 60}ms`, background: '#10b981',
                        minHeight: x.income > 0 ? '4px' : '0', opacity: active ? 1 : 0.4,
                      }} />
                    <div className="flex-1 rounded-t-md transition-all duration-700"
                      style={{
                        height: chartEl.inView ? `${(x.expense / maxBar) * 100}%` : '0%',
                        transitionDelay: `${i * 60}ms`, background: '#f43f5e',
                        minHeight: x.expense > 0 ? '4px' : '0', opacity: active ? 1 : 0.4,
                      }} />
                  </div>
                  <span className={`text-[10px] font-bold transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {x.label}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-[11px] text-gray-500">In</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-[11px] text-gray-500">Out</span></div>
          </div>
        </div>
      </Card>

      <DailyCalendar m={m} currency={currency} />

      {hasData && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card delay={0.36} className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900">Where it went</h2>
                  {m.hasPrev && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Badges compare with {prev?.label ?? 'last month'}</p>
                  )}
                </div>
              </div>

              {m.catBreakdown.length === 0 ? (
                <SectionEmpty text="No expenses this month." />
              ) : (
                <div className="space-y-3">
                  {m.catBreakdown.slice(0, 6).map((c, i) => (
                    <CatRow key={c.catId} c={c} total={m.expense} currency={currency}
                      showDelta={m.hasPrev} invert i={i} />
                  ))}
                </div>
              )}

              {m.hasPrev && biggestMover && (
                <p className="text-[11px] text-gray-500 mt-4 pt-3 border-t border-gray-100">
                  Biggest shift: <span className="font-semibold text-gray-700">{biggestMover.c.name}</span>{' '}
                  {biggestMover.diff > 0 ? 'up' : 'down'}{' '}
                  <span className="font-bold" style={{ color: biggestMover.diff > 0 ? '#f87171' : '#34d399' }}>
                    {formatCurrency(Math.abs(biggestMover.diff), currency)}
                  </span>{' '}
                  vs {prev?.label}
                </p>
              )}

              {m.droppedCats.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Nothing spent this month
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.droppedCats.map(c => (
                      <span key={c.catId}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                        {c.icon} {c.name} · was {formatCurrency(c.prevAmount ?? 0, currency)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card delay={0.4} className="p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Top merchants</h2>
              {m.topMerchants.length === 0 ? (
                <SectionEmpty text="No merchants yet." />
              ) : (
                <div className="space-y-2.5">
                  {m.topMerchants.map((x, i) => (
                    <div key={x.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: 'rgba(244,63,94,0.14)', color: '#f87171' }}>{i + 1}</span>
                        <span className="text-xs font-semibold text-gray-700 truncate">{x.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 flex-shrink-0">{formatCurrency(x.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Income side, mirrors the expense pair above */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card delay={0.42} className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900">Where it came from</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {m.incomeCount > 0
                      ? `${m.incomeCount} deposit${m.incomeCount === 1 ? '' : 's'} · avg ${formatCurrency(m.avgIncomeSize, currency)}`
                      : 'Income by category'}
                  </p>
                </div>
                {m.income > 0 && (
                  <span className="text-xs font-black flex-shrink-0" style={{ color: '#10b981' }}>
                    {formatCurrency(m.income, currency)}
                  </span>
                )}
              </div>
              {m.incomeBreakdown.length === 0 ? (
                <SectionEmpty text="No money in this month." />
              ) : (
                <div className="space-y-3">
                  {m.incomeBreakdown.slice(0, 6).map((c, i) => (
                    <CatRow key={c.catId} c={c} total={m.income} currency={currency}
                      showDelta={m.hasPrev} invert={false} i={i} />
                  ))}
                </div>
              )}
            </Card>

            <Card delay={0.44} className="p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Top income sources</h2>
              {m.topIncomeSources.length === 0 ? (
                <SectionEmpty text="No sources yet." />
              ) : (
                <div className="space-y-2.5">
                  {m.topIncomeSources.map((x, i) => {
                    const share = m.income > 0 ? (x.amount / m.income) * 100 : 0
                    return (
                      <div key={x.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: 'rgba(16,185,129,0.14)', color: '#34d399' }}>{i + 1}</span>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-gray-700 truncate">{x.name}</span>
                            <span className="block text-[10px] text-gray-400">{Math.round(share)}% of money in</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                          {formatCurrency(x.amount, currency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card delay={0.48} className="p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">By day of week</h2>
              <div className="flex items-end gap-2 h-24">
                {m.byDayOfWeek.map(d => (
                  <div key={d.label} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5">
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div className="w-full rounded-t-md transition-all duration-700"
                        style={{
                          height: `${(d.amount / maxDow) * 100}%`,
                          minHeight: d.amount > 0 ? '4px' : '0',
                          background: 'linear-gradient(180deg,#a78bfa,#7c3aed)',
                        }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{d.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card delay={0.52} className="p-5 sm:p-6 flex flex-col justify-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Biggest single expense</p>
              {m.biggestExpense ? (
                <>
                  <p className="text-lg font-black text-gray-900 truncate">{m.biggestExpense.merchant}</p>
                  <p className="text-2xl font-black text-red-500 mt-1">{formatCurrency(m.biggestExpense.amount, currency)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {m.expense > 0 ? `${Math.round((m.biggestExpense.amount / m.expense) * 100)}% of the month` : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No expenses recorded</p>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Compare table */}
      <Card delay={0.56} className="overflow-hidden">
        <div className="px-3 sm:px-6 pt-5 pb-3">
          <h2 className="text-sm font-bold text-gray-900">Month by month</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 sm:px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
                <th className="text-right px-3 sm:px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">In</th>
                <th className="text-right px-3 sm:px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Out</th>
                <th className="text-right px-3 sm:px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Net</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map(x => {
                const active = x.start === m.start
                const empty = x.income === 0 && x.expense === 0
                return (
                  <tr
                    key={x.start}
                    onClick={() => setIdx(months.findIndex(y => y.start === x.start))}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={active ? { background: 'rgba(16,185,129,0.08)' } : undefined}
                  >
                    <td className="px-3 sm:px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">{x.shortYear}</td>
                    <td className="px-3 sm:px-6 py-3 text-right text-sm font-semibold text-emerald-600 whitespace-nowrap">
                      {x.income > 0 ? formatCurrency(x.income, currency) : '·'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-right text-sm font-semibold text-red-500 whitespace-nowrap">
                      {x.expense > 0 ? formatCurrency(x.expense, currency) : '·'}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 text-right text-sm font-black whitespace-nowrap ${x.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {empty ? '·' : formatCurrency(x.net, currency)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
