'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Plus, X, PiggyBank, Trash2, AlertTriangle } from 'lucide-react'
import { addGoal, addGoalContribution, deleteGoal } from '@/app/actions/goals'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/constants'
import { PageHero } from '@/components/shared/page-hero'

type Goal    = { id: string; title: string; emoji: string; target_amount: number; saved_amount: number; currency: string; deadline: string | null; status: string }
type Account = { id: string; name: string; color: string; balance: number; currency: string }

/** Shared dark panel tokens, matching the rest of the dashboard. */
const PANEL = { bg: '#0d1017', border: 'rgba(148,163,184,0.13)', heading: '#f1f5f9', muted: 'rgba(148,163,184,0.75)', faint: 'rgba(148,163,184,0.6)' }

function CreateModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addGoal(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Create Goal</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-1 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Emoji</label>
              <input name="emoji" type="text" defaultValue="🎯" maxLength={2}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
            </div>
            <div className="col-span-4 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Goal Title</label>
              <input name="title" type="text" required placeholder="e.g. Buy a laptop"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Target Amount</label>
              <input name="target_amount" type="number" step="any" min="1" required placeholder="50000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Currency</label>
              <select name="currency" defaultValue="INR"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 bg-white">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Target Date (optional)</label>
            <input name="deadline" type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ContributeModal({ goal, accounts, open, onClose, onSuccess }: {
  goal: Goal; accounts: Account[]; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selAcc, setSelAcc] = useState(accounts[0]?.id ?? '')
  const remaining = Number(goal.target_amount) - Number(goal.saved_amount)

  function handleSubmit(fd: FormData) {
    fd.set('goal_id', goal.id)
    fd.set('account_id', selAcc)
    setError(null)
    startTransition(async () => {
      const res = await addGoalContribution(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }
  if (!open) return null
  const selectedAccBalance = accounts.find(a => a.id === selAcc)?.balance ?? 0
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Add Money to Goal</h2>
            <p className="text-xs text-gray-400 mt-0.5">{goal.emoji} {goal.title} · {formatCurrency(remaining, goal.currency)} remaining</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Add an account first</p>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">From Account</label>
                <div className="flex gap-2 flex-wrap">
                  {accounts.map(a => (
                    <button key={a.id} type="button" onClick={() => setSelAcc(a.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${selAcc === a.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: a.color }} />
                      {a.name}<span className="opacity-60">{formatCurrency(Number(a.balance), a.currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                <input name="amount" type="number" step="any" min="1" required
                  placeholder={`Max ${formatCurrency(Math.min(selectedAccBalance, remaining), goal.currency)}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
                {isPending ? 'Adding...' : 'Add to Goal'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ goal, open, onClose, onSuccess }: { goal: Goal; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  function handle() { startTransition(async () => { await deleteGoal(goal.id); onSuccess(); onClose() }) }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Delete &quot;{goal.title}&quot;?</p>
            <p className="text-xs text-gray-400 mt-1">Saved amount is not refunded to any account. This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handle} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">{isPending ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

function GoalCard({ g, onAdd, onDelete }: { g: Goal; onAdd: () => void; onDelete: () => void }) {
  const pct = Number(g.target_amount) > 0 ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100) : 0
  const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null
  const done = g.status === 'completed' || pct >= 100
  const overdue = daysLeft !== null && daysLeft < 0 && !done
  const accent = done ? '#34d399' : overdue ? '#fb7185' : '#10b981'

  return (
    <div
      data-goal-card
      className="relative overflow-hidden rounded-2xl p-5 group transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: `radial-gradient(120% 120% at 88% 8%, ${accent}1a 0%, rgba(11,14,20,0) 62%), ${PANEL.bg}`,
        border: `1px solid ${done ? 'rgba(52,211,153,0.28)' : overdue ? 'rgba(244,63,94,0.25)' : PANEL.border}`,
      }}
    >
      {/* Landing-page triangle motif */}
      <svg aria-hidden width="70" height="70" viewBox="0 0 24 24"
        className="absolute -top-2 -right-2 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
        style={{ opacity: 0.07 }}>
        <path d="M12 3 L21 20 L3 20 Z" fill="none" stroke={accent} strokeWidth="1.2" />
      </svg>

      <div className="relative flex items-start justify-between mb-4 gap-2">
        <div className="min-w-0">
          <span className="text-2xl">{g.emoji}</span>
          <p className="text-sm font-bold mt-1 truncate" style={{ color: PANEL.heading }}>{g.title}</p>
          {daysLeft !== null && !done && (
            <p className="text-[11px] mt-0.5" style={{ color: overdue ? '#fb7185' : PANEL.faint }}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
            </p>
          )}
          {done && (
            <p className="text-[11px] mt-0.5 font-semibold" style={{ color: '#34d399' }}>Reached</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-black" style={{ color: done ? '#34d399' : '#e2e8f0' }}>{Math.round(pct)}%</span>
          {!done && (
            <button onClick={onAdd}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              <PiggyBank className="w-3 h-3" /> Add
            </button>
          )}
          <button onClick={onDelete}
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all hover:bg-red-400/10 hover:text-red-400"
            style={{ color: 'rgba(148,163,184,0.7)' }}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="relative w-full h-2 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(148,163,184,0.12)' }}>
        <div data-goal-bar className="h-2 rounded-full"
          style={{ width: `${pct}%`, background: done ? '#10b981' : 'linear-gradient(90deg,#10b981,#34d399)' }} />
      </div>
      <div className="relative flex justify-between text-[11px]" style={{ color: PANEL.faint }}>
        <span>{formatCurrency(Number(g.saved_amount), g.currency)} saved</span>
        <span>{formatCurrency(Number(g.target_amount), g.currency)} goal</span>
      </div>
    </div>
  )
}

export function GoalsView({ goals, accounts }: { goals: Goal[]; accounts: Account[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null)
  const [delGoal, setDelGoal] = useState<Goal | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const refresh = () => router.refresh()

  const active    = goals.filter(g => g.status !== 'completed' && Number(g.saved_amount) < Number(g.target_amount))
  const completed = goals.filter(g => g.status === 'completed' || Number(g.saved_amount) >= Number(g.target_amount))

  const totalSaved  = goals.reduce((s, g) => s + Number(g.saved_amount), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)
  const overallPct  = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !listRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-goal-card]', { opacity: 0, y: 16, duration: 0.45, ease: 'power3.out', stagger: 0.06, delay: 0.1 })
      gsap.from('[data-goal-bar]', { scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'power2.out', stagger: 0.05, delay: 0.25 })
    }, listRef)
    return () => ctx.revert()
  }, [goals.length])

  return (
    <>
      <div className="space-y-6">
        <PageHero
          kicker="Goals"
          title={<>Save toward<br />what matters.</>}
          stat={goals.length > 0 ? totalSaved : undefined}
          statLabel={goals.length > 0 ? 'Saved so far' : undefined}
          subtitle={goals.length === 0 ? 'No goals yet' : undefined}
          shape="orbit"
          intensity={overallPct / 100}
          actions={
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#04140e' }}>
              <Plus className="w-4 h-4" /> Create goal
            </button>
          }
        >
          {goals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.22)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>Target</span>
                <span className="text-xs font-black" style={{ color: '#e2e8f0' }}>{formatCurrency(totalTarget, 'INR')}</span>
              </span>
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>Progress</span>
                <span className="text-xs font-black" style={{ color: '#6ee7b7' }}>{Math.round(overallPct)}%</span>
              </span>
              {active.length > 0 && (
                <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>To go</span>
                  <span className="text-xs font-black" style={{ color: '#c4b5fd' }}>{formatCurrency(totalTarget - totalSaved, 'INR')}</span>
                </span>
              )}
            </div>
          )}
        </PageHero>

        {goals.length > 0 ? (
          <div ref={listRef} className="space-y-6">
            {active.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Active — {active.length}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {active.map(g => <GoalCard key={g.id} g={g} onAdd={() => setContributeGoal(g)} onDelete={() => setDelGoal(g)} />)}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.7)' }}>Completed — {completed.length}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {completed.map(g => <GoalCard key={g.id} g={g} onAdd={() => setContributeGoal(g)} onDelete={() => setDelGoal(g)} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl py-20 text-center" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>No active goals</p>
            <p className="text-xs mt-1 mb-4" style={{ color: PANEL.muted }}>Create a goal to start tracking your savings</p>
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              <Plus className="w-3.5 h-3.5" /> Create Goal
            </button>
          </div>
        )}
      </div>
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      {contributeGoal && <ContributeModal goal={contributeGoal} accounts={accounts} open={!!contributeGoal} onClose={() => setContributeGoal(null)} onSuccess={refresh} />}
      {delGoal && <DeleteModal goal={delGoal} open={!!delGoal} onClose={() => setDelGoal(null)} onSuccess={refresh} />}
    </>
  )
}
