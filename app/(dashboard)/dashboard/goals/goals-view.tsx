'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, PiggyBank } from 'lucide-react'
import { addGoal, addGoalContribution } from '@/app/actions/goals'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/constants'

type Goal    = { id: string; title: string; emoji: string; target_amount: number; saved_amount: number; currency: string; deadline: string | null; status: string }
type Account = { id: string; name: string; color: string; balance: number; currency: string }

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
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
              {/* step="any" allows any number like 7000, 12500 etc */}
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
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
                      {a.name}
                      <span className="opacity-60">{formatCurrency(Number(a.balance), a.currency)}</span>
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

export function GoalsView({ goals, accounts }: { goals: Goal[]; accounts: Account[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Goals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your savings targets</p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Create goal
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {goals.map(g => {
              const pct = Number(g.target_amount) > 0
                ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100) : 0
              const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null
              const done = pct >= 100
              return (
                <div key={g.id} className="surface-light rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-2xl">{g.emoji}</span>
                      <p className="text-sm font-bold text-gray-900 mt-1">{g.title}</p>
                      {daysLeft !== null && (
                        <p className={`text-[11px] mt-0.5 ${daysLeft < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : done ? 'Completed!' : `${daysLeft}d left`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${done ? 'text-emerald-600' : 'text-gray-600'}`}>{Math.round(pct)}%</span>
                      {!done && (
                        <button onClick={() => setContributeGoal(g)}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors">
                          <PiggyBank className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 mb-2">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: done ? '#10b981' : 'linear-gradient(90deg,#10b981,#34d399)' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>{formatCurrency(Number(g.saved_amount), g.currency)} saved</span>
                    <span>{formatCurrency(Number(g.target_amount), g.currency)} goal</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="surface-light rounded-2xl py-20 text-center">
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-sm font-semibold text-gray-500">No active goals</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Create a goal to start tracking your savings</p>
            <button onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Goal
            </button>
          </div>
        )}
      </div>
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={() => router.refresh()} />
      {contributeGoal && (
        <ContributeModal goal={contributeGoal} accounts={accounts} open={!!contributeGoal}
          onClose={() => setContributeGoal(null)} onSuccess={() => router.refresh()} />
      )}
    </>
  )
}
