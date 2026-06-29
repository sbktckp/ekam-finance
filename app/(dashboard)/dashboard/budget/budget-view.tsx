'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { addBudget } from '@/app/actions/budgets'
import { formatCurrency } from '@/lib/utils'

type Budget   = { id: string; limit_amount: number; category_id: string | null; categories: { name: string; icon: string } | null }
type Category = { id: string; name: string; icon: string; type: string }

interface Props {
  budgets:         Budget[]
  categories:      Category[]
  spentByCategory: Record<string, number>
  totalExpenses:   number
  monthLabel:      string
}

function Modal({ open, onClose, categories, onSuccess }: {
  open: boolean; onClose: () => void; categories: Category[]; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addBudget(fd)
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
          <h2 className="text-sm font-bold text-gray-900">Set Budget</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
            <select name="category_id" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 bg-white">
              <option value="">All categories (total)</option>
              {categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Monthly Limit (₹)</label>
            {/* step="1" allows any integer like 4000, 5000, 10000 etc */}
            <input name="limit_amount" type="number" step="1" min="1" required placeholder="e.g. 10000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Saving...' : 'Set Budget'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function BudgetView({ budgets, categories, spentByCategory, totalExpenses, monthLabel }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Budget</h1>
            <p className="text-sm text-gray-400 mt-0.5">{monthLabel}</p>
          </div>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Set budget
          </button>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-3">
            {budgets.map(b => {
              const spent = b.category_id ? (spentByCategory[b.category_id] ?? 0) : totalExpenses
              const limit = Number(b.limit_amount)
              const pct   = Math.min((spent / limit) * 100, 100)
              const over  = spent > limit
              return (
                <div key={b.id} className="surface-light rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{b.categories?.icon ?? '📊'}</span>
                      <span className="text-sm font-bold text-gray-900">{b.categories?.name ?? 'All Categories'}</span>
                    </div>
                    <span className={`text-xs font-bold ${over ? 'text-red-500' : 'text-gray-500'}`}>
                      {formatCurrency(spent, 'INR')} / {formatCurrency(limit, 'INR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: over ? '#f43f5e' : pct > 80 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-gray-400">{Math.round(pct)}% used</span>
                    <span className={`text-[11px] font-semibold ${over ? 'text-red-500' : 'text-emerald-600'}`}>
                      {over ? `₹${(spent - limit).toLocaleString('en-IN')} over` : `₹${(limit - spent).toLocaleString('en-IN')} left`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="surface-light rounded-2xl py-20 text-center">
            <p className="text-3xl mb-3">💰</p>
            <p className="text-sm font-semibold text-gray-500">No budgets set for this month</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Set spending limits by category to stay on track</p>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Set Budget
            </button>
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} categories={categories} onSuccess={() => router.refresh()} />
    </>
  )
}
