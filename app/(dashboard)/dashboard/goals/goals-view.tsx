'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { addGoal } from '@/app/actions/goals'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/constants'

type Goal = { id: string; title: string; emoji: string; target_amount: number; saved_amount: number; currency: string; deadline: string | null; status: string }

function Modal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
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
              <input name="target_amount" type="number" step="100" min="1" required placeholder="50000"
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

export function GoalsView({ goals }: { goals: Goal[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Goals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your savings targets</p>
          </div>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Create goal
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {goals.map(g => {
              const pct = g.target_amount > 0 ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100) : 0
              const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null
              return (
                <div key={g.id} className="surface-light rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-2xl">{g.emoji}</span>
                      <p className="text-sm font-bold text-gray-900 mt-1">{g.title}</p>
                      {daysLeft !== null && (
                        <p className={`text-[11px] mt-0.5 ${daysLeft < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-black text-emerald-600">{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 mb-2">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
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
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Goal
            </button>
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} onSuccess={() => router.refresh()} />
    </>
  )
}
