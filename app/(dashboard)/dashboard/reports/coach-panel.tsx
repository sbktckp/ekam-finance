'use client'
import { useEffect, useState } from 'react'
import { Flame, Target, AlertTriangle, Wallet, Sparkles, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Coach } from '@/lib/insights'
import { getCoachNote } from '@/app/actions/coach'

const SEV_COLOR = { high: '#f43f5e', medium: '#f59e0b', low: '#94a3b8' } as const

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-base font-black truncate text-gray-900" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 truncate mt-0.5">{sub}</p>}
    </div>
  )
}

function CoachNote({ coach }: { coach: Coach }) {
  const [note, setNote] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'done' | 'off'>('loading')

  useEffect(() => {
    let alive = true
    getCoachNote(coach)
      .then(res => {
        if (!alive) return
        if (res.note) { setNote(res.note); setState('done') }
        else setState('off')
      })
      .catch(() => { if (alive) setState('off') })
    return () => { alive = false }
    // Regenerate only when the underlying month position changes.
  }, [coach.monthLabel, coach.elapsedDays])

  if (state === 'off') return null

  return (
    <div className="rounded-xl p-3.5 mt-4" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(52,211,153,0.28)' }}>
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#34d399' }} />
        {state === 'loading' ? (
          <div className="flex-1 space-y-1.5 py-0.5">
            <div className="h-2 rounded bg-gray-200 animate-pulse w-full" />
            <div className="h-2 rounded bg-gray-200 animate-pulse w-4/5" />
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-gray-700">{note}</p>
        )}
      </div>
    </div>
  )
}

export function CoachPanel({ coach, currency }: { coach: Coach; currency: string }) {
  const [openLeaks, setOpenLeaks] = useState(true)

  const pacePct = coach.daysInMonth > 0 ? (coach.elapsedDays / coach.daysInMonth) * 100 : 0
  const spendPct = coach.projectedSpend > 0 ? Math.min((coach.spentSoFar / coach.projectedSpend) * 100, 100) : 0
  const overspending = coach.projectedNet < 0
  const runwayShort = coach.runwayDays !== null && coach.runwayDays < coach.daysLeft

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div
        className="rounded-2xl p-5 animate-fade-up"
        style={{
          background: overspending || runwayShort ? 'rgba(244,63,94,0.10)' : 'rgba(16,185,129,0.10)',
          border: `1px solid ${overspending || runwayShort ? 'rgba(244,63,94,0.28)' : 'rgba(52,211,153,0.28)'}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: overspending || runwayShort ? 'rgba(244,63,94,0.18)' : 'rgba(16,185,129,0.18)' }}
          >
            {overspending || runwayShort
              ? <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
              : <Wallet className="w-4 h-4" style={{ color: '#34d399' }} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 leading-snug">{coach.headline}</p>
            <p className="text-[10px] text-gray-400 mt-1.5">{coach.confidenceNote}</p>
          </div>
        </div>

        <CoachNote coach={coach} />
      </div>

      {/* Pace and runway */}
      <div className="surface-light rounded-2xl p-5 animate-fade-up delay-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Pace</h2>
          <span className="text-[10px] font-bold text-gray-400">
            day {coach.elapsedDays} of {coach.daysInMonth}
          </span>
        </div>

        {/* Spend vs month progress */}
        <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden mb-1.5">
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${spendPct}%`, background: overspending ? '#f43f5e' : '#34d399' }}
          />
          <div
            className="absolute top-0 h-2 w-0.5 bg-gray-400"
            style={{ left: `${pacePct}%` }}
            title="Where the month is"
          />
        </div>
        <p className="text-[10px] text-gray-400 mb-4">
          Spent {formatCurrency(coach.spentSoFar, currency)} of a projected {formatCurrency(coach.projectedSpend, currency)}. The marker is where the month itself is.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="Daily burn"
            value={formatCurrency(coach.dailyBurn, currency)}
            sub="last 30 days"
          />
          <Stat
            label="Safe per day"
            value={coach.safeDailySpend !== null ? formatCurrency(coach.safeDailySpend, currency) : 'n/a'}
            sub={coach.daysLeft > 0 ? `for ${coach.daysLeft} more days` : 'month is over'}
            color={coach.safeDailySpend !== null && coach.safeDailySpend < coach.dailyBurn ? '#f87171' : '#34d399'}
          />
          <Stat
            label="Money left"
            value={formatCurrency(coach.liquid, currency)}
            sub="across spendable accounts"
          />
          <Stat
            label="Runway"
            value={coach.runwayDays !== null ? `${coach.runwayDays} days` : 'n/a'}
            sub={coach.runwayDate ? `until ${coach.runwayDate}` : 'no burn recorded'}
            color={runwayShort ? '#f87171' : undefined}
          />
        </div>
      </div>

      {/* Leaks */}
      {coach.leaks.length > 0 && (
        <div className="surface-light rounded-2xl p-5 animate-fade-up delay-2">
          <button
            onClick={() => setOpenLeaks(v => !v)}
            className="w-full flex items-center justify-between mb-1"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <h2 className="text-sm font-bold text-gray-900">Where money quietly goes</h2>
            </div>
            <ChevronDown
              className="w-4 h-4 text-gray-400 transition-transform"
              style={{ transform: openLeaks ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: openLeaks ? '900px' : '0px', opacity: openLeaks ? 1 : 0 }}
          >
            <div className="space-y-3 pt-3">
              {coach.leaks.map(l => (
                <div key={l.id} className="rounded-xl p-3.5 bg-gray-50">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: SEV_COLOR[l.severity] }}
                      />
                      <p className="text-xs font-bold text-gray-900 truncate">{l.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black" style={{ color: SEV_COLOR[l.severity] }}>
                        {formatCurrency(l.monthlyAmount, currency)}
                      </p>
                      <p className="text-[9px] text-gray-400">per month</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{l.detail}</p>
                  {l.annualAmount > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Unchanged for a year that is {formatCurrency(l.annualAmount, currency)}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget pacing */}
      {coach.budgets.length > 0 && (
        <div className="surface-light rounded-2xl p-5 animate-fade-up delay-3">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Budgets, by pace</h2>
          <div className="space-y-3">
            {coach.budgets.map(b => {
              const color = b.status === 'over' ? '#f43f5e' : b.status === 'at_risk' ? '#f59e0b' : '#34d399'
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs font-semibold text-gray-700 truncate">{b.icon} {b.name}</span>
                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color }}>
                      {formatCurrency(b.spent, currency)} of {formatCurrency(b.limit, currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(b.pctUsed, 100)}%`, background: color }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {b.status === 'over'
                      ? 'Already over the limit.'
                      : `On pace for ${formatCurrency(b.projected, currency)} by month end.`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Goal impact */}
      {coach.goals.length > 0 && (
        <div className="surface-light rounded-2xl p-5 animate-fade-up delay-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: '#a78bfa' }} />
            <h2 className="text-sm font-bold text-gray-900">What this means for your goals</h2>
          </div>
          <div className="space-y-3">
            {coach.goals.map(g => (
              <div key={g.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{g.emoji} {g.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatCurrency(g.remaining, currency)} still to go
                    {g.monthsAtCurrentPace !== null && g.monthsIfLeakFixed !== null && g.monthsIfLeakFixed < g.monthsAtCurrentPace - 0.3 && (
                      <> · trimming the leaks above saves about {Math.round((g.monthsAtCurrentPace - g.monthsIfLeakFixed) * 30)} days</>
                    )}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {g.monthsAtCurrentPace !== null ? (
                    <>
                      <p className="text-xs font-black text-gray-900">{g.monthsAtCurrentPace.toFixed(1)} mo</p>
                      <p className="text-[9px] text-gray-400">at this pace</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">no surplus yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
