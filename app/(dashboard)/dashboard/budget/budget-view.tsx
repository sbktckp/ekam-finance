'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil, Trash2, AlertTriangle, Check } from 'lucide-react'
import { addBudget, updateBudget, deleteBudget } from '@/app/actions/budgets'
import { formatCurrency } from '@/lib/utils'

type Budget   = { id: string; limit_amount: number; category_id: string | null; categories: { name: string; icon: string } | null }
type Category = { id: string; name: string; icon: string; type: string }

interface Props {
  budgets:         Budget[]
  categories:      Category[]
  spentByCategory: Record<string, number>
  totalExpenses:   number
  totalLimit:      number
  monthLabel:      string
}

// ─── Set Budget modal (category required) ─────────────────────────────────────
function SetBudgetModal({ open, onClose, categories, budgets, onSuccess }: {
  open: boolean; onClose: () => void; categories: Category[]
  budgets: Budget[]; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const alreadySet = new Set(budgets.map(b => b.category_id).filter(Boolean))

  function handleSubmit(fd: FormData) {
    if (!fd.get('category_id')) { setError('Please select a category'); return }
    setError(null)
    startTransition(async () => {
      const res = await addBudget(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  const expenseCats = categories.filter(c => c.type === 'expense' || c.type === 'both')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Set Category Budget</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Category <span className="text-red-400">*</span>
            </label>
            <select name="category_id" required defaultValue=""
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 bg-white">
              <option value="" disabled>Select a category...</option>
              {expenseCats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}{alreadySet.has(c.id) ? ' (update)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Monthly Limit (₹)</label>
            <input name="limit_amount" type="number" step="1" min="1" required placeholder="e.g. 10000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          <p className="text-[11px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
            💡 The monthly total updates automatically as you add category budgets.
          </p>
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

// ─── Edit limit modal ─────────────────────────────────────────────────────────
function EditModal({ budget, open, onClose, onSuccess }: {
  budget: Budget; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const val = Number(fd.get('limit_amount'))
    if (!val || val <= 0) { setError('Enter a valid amount'); return }
    setError(null)
    startTransition(async () => {
      const res = await updateBudget(budget.id, val)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Edit Budget</h2>
            <p className="text-xs text-gray-400 mt-0.5">{budget.categories?.icon} {budget.categories?.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">New Monthly Limit (₹)</label>
            <input name="limit_amount" type="number" step="1" min="1" required
              defaultValue={Number(budget.limit_amount)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirmation ───────────────────────────────────────────────────────
function DeleteModal({ budget, open, onClose, onSuccess }: {
  budget: Budget; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteBudget(budget.id)
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Remove budget?</p>
            <p className="text-xs text-gray-400 mt-1">
              The {budget.categories?.name} budget will be removed and the monthly total will update automatically.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">
            {isPending ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────
export function BudgetView({ budgets, categories, spentByCategory, totalExpenses, totalLimit, monthLabel }: Props) {
  const router = useRouter()
  const [setOpen, setSetOpen]       = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [delBudget,  setDelBudget]  = useState<Budget | null>(null)

  const refresh = () => router.refresh()

  // Total progress
  const totalPct  = totalLimit > 0 ? Math.min((totalExpenses / totalLimit) * 100, 100) : 0
  const totalOver = totalExpenses > totalLimit && totalLimit > 0

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Budget</h1>
            <p className="text-sm text-gray-400 mt-0.5">{monthLabel}</p>
          </div>
          <button onClick={() => setSetOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Set budget
          </button>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-3">
            {/* Auto-computed Monthly Total summary */}
            {totalLimit > 0 && (
              <div className="rounded-2xl p-5 mb-1"
                style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #d1fae5' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <span className="text-sm font-bold text-gray-800">Monthly Total</span>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">auto</span>
                  </div>
                  <span className={`text-xs font-bold ${totalOver ? 'text-red-500' : 'text-gray-600'}`}>
                    {formatCurrency(totalExpenses, 'INR')} / {formatCurrency(totalLimit, 'INR')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${totalPct}%`, background: totalOver ? '#f43f5e' : totalPct > 80 ? '#f59e0b' : '#10b981' }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-emerald-700">{Math.round(totalPct)}% of total budget used</span>
                  <span className={`text-[11px] font-semibold ${totalOver ? 'text-red-500' : 'text-emerald-700'}`}>
                    {totalOver
                      ? `₹${(totalExpenses - totalLimit).toLocaleString('en-IN')} over`
                      : `₹${(totalLimit - totalExpenses).toLocaleString('en-IN')} left`}
                  </span>
                </div>
              </div>
            )}

            {/* Individual category budgets */}
            {budgets.map(b => {
              const spent = spentByCategory[b.category_id ?? ''] ?? 0
              const limit = Number(b.limit_amount)
              const pct   = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
              const over  = spent > limit
              return (
                <div key={b.id} className="surface-light rounded-2xl p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{b.categories?.icon ?? '📦'}</span>
                      <span className="text-sm font-bold text-gray-900">{b.categories?.name ?? 'Category'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${over ? 'text-red-500' : 'text-gray-500'}`}>
                        {formatCurrency(spent, 'INR')} / {formatCurrency(limit, 'INR')}
                      </span>
                      {/* Hover actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditBudget(b)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                          title="Edit limit">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => setDelBudget(b)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: over ? '#f43f5e' : pct > 80 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-gray-400">{Math.round(pct)}% used</span>
                    <span className={`text-[11px] font-semibold ${over ? 'text-red-500' : 'text-emerald-600'}`}>
                      {over
                        ? `₹${(spent - limit).toLocaleString('en-IN')} over`
                        : `₹${(limit - spent).toLocaleString('en-IN')} left`}
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
            <p className="text-xs text-gray-400 mt-1 mb-4">Add category budgets — the monthly total calculates automatically</p>
            <button onClick={() => setSetOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Set Budget
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <SetBudgetModal open={setOpen} onClose={() => setSetOpen(false)} categories={categories} budgets={budgets} onSuccess={refresh} />
      {editBudget && <EditModal budget={editBudget} open={!!editBudget} onClose={() => setEditBudget(null)} onSuccess={refresh} />}
      {delBudget  && <DeleteModal budget={delBudget} open={!!delBudget} onClose={() => setDelBudget(null)} onSuccess={refresh} />}
    </>
  )
}
