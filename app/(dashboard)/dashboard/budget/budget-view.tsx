'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Plus, X, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { addBudget, updateBudget, deleteBudget } from '@/app/actions/budgets'
import { formatCurrency } from '@/lib/utils'
import { PageHero } from '@/components/shared/page-hero'

type Budget   = { id: string; limit_amount: number; category_id: string | null; categories: { name: string; icon: string } | null }
type Category = { id: string; name: string; icon: string; type: string }

/** Shared dark panel tokens, matching the rest of the dashboard. */
const PANEL = { bg: '#0d1017', border: 'rgba(148,163,184,0.13)', heading: '#f1f5f9', muted: 'rgba(148,163,184,0.75)', faint: 'rgba(148,163,184,0.6)' }

/** Green under 80%, amber approaching the cap, rose once past it. */
function barColor(pct: number, over: boolean): string {
  if (over) return '#f43f5e'
  if (pct > 80) return '#f59e0b'
  return '#10b981'
}

interface Props {
  budgets: Budget[]; categories: Category[]; spentByCategory: Record<string, number>
  totalExpenses: number; totalLimit: number; autoSum: number
  isManualTotal: boolean; manualTotalId: string | null; monthLabel: string
}

function SetBudgetModal({ open, onClose, categories, budgets, autoSum, onSuccess }: {
  open: boolean; onClose: () => void; categories: Category[]; budgets: Budget[]; autoSum: number; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'category' | 'total'>('category')
  const alreadySet = new Set(budgets.map(b => b.category_id).filter(Boolean))

  function handleSubmit(fd: FormData) {
    if (mode === 'category' && !fd.get('category_id')) { setError('Please select a category'); return }
    if (mode === 'total') fd.set('category_id', '')
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Set Budget</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button type="button" onClick={() => setMode('category')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'category' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>By Category</button>
            <button type="button" onClick={() => setMode('total')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'total' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Overall Total</button>
          </div>

          {mode === 'category' ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category <span className="text-red-400">*</span></label>
              <select name="category_id" required defaultValue=""
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 bg-white">
                <option value="" disabled>Select a category...</option>
                {expenseCats.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}{alreadySet.has(c.id) ? ' (update)' : ''}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              💡 This overrides the auto-sum (currently {formatCurrency(autoSum, 'INR')}) with your own monthly cap.
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{mode === 'total' ? 'Monthly Total Limit (₹)' : 'Monthly Limit (₹)'}</label>
            <input name="limit_amount" type="number" step="any" min="1" required placeholder="e.g. 10000"
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

function EditModal({ budget, open, onClose, onSuccess }: { budget: Budget; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const val = Number(new FormData(e.currentTarget).get('limit_amount'))
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Edit Budget</h2>
            <p className="text-xs text-gray-400 mt-0.5">{budget.categories?.icon ?? '📊'} {budget.categories?.name ?? 'Monthly Total'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">New Limit (₹)</label>
            <input name="limit_amount" type="number" step="any" min="1" required defaultValue={Number(budget.limit_amount)} autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ budget, isTotal, open, onClose, onSuccess }: { budget: Budget; isTotal?: boolean; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  function handleDelete() { startTransition(async () => { await deleteBudget(budget.id); onSuccess(); onClose() }) }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Remove budget?</p>
            <p className="text-xs text-gray-400 mt-1">
              {isTotal ? 'The manual total will be removed and the total will revert to auto-sum of category budgets.' : `The ${budget.categories?.name} budget will be removed.`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">{isPending ? 'Removing...' : 'Remove'}</button>
        </div>
      </div>
    </div>
  )
}

export function BudgetView({ budgets, categories, spentByCategory, totalExpenses, totalLimit, autoSum, isManualTotal, manualTotalId, monthLabel }: Props) {
  const router = useRouter()
  const [setOpen, setSetOpen]       = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [delBudget,  setDelBudget]  = useState<{ b: Budget; isTotal?: boolean } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const refresh = () => router.refresh()

  const totalPct  = totalLimit > 0 ? Math.min((totalExpenses / totalLimit) * 100, 100) : 0
  const totalOver = totalExpenses > totalLimit && totalLimit > 0
  const totalAsBudget: Budget = { id: manualTotalId ?? '', limit_amount: totalLimit, category_id: null, categories: null }
  const remaining = totalLimit - totalExpenses

  // How many category budgets are already blown, worth calling out up top.
  const overCount = budgets.filter(b => (spentByCategory[b.category_id ?? ''] ?? 0) > Number(b.limit_amount)).length

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !listRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-budget-card]', {
        opacity: 0, y: 16, duration: 0.45, ease: 'power3.out', stagger: 0.06, delay: 0.1,
      })
      // Bars fill from zero once, after the cards have landed.
      gsap.from('[data-bar]', {
        scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'power2.out', stagger: 0.05, delay: 0.25,
      })
    }, listRef)
    return () => ctx.revert()
  }, [budgets.length, totalLimit])

  const hasAny = budgets.length > 0 || totalLimit > 0

  return (
    <>
      <div className="space-y-6">
        <PageHero
          kicker={monthLabel}
          title={<>Monthly limits,<br />plainly tracked.</>}
          stat={hasAny ? totalExpenses : undefined}
          statLabel={hasAny ? 'Spent so far' : undefined}
          subtitle={!hasAny ? 'No budgets set for this month yet' : undefined}
          accent={totalOver ? '#f43f5e' : '#10b981'}
          shape="knot"
          intensity={totalLimit > 0 ? Math.min(totalExpenses / totalLimit, 1) : 0.4}
          actions={
            <button onClick={() => setSetOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#04140e' }}>
              <Plus className="w-4 h-4" /> Set budget
            </button>
          }
        >
          {totalLimit > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.22)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>Limit</span>
                <span className="text-xs font-black" style={{ color: '#e2e8f0' }}>{formatCurrency(totalLimit, 'INR')}</span>
              </span>
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: totalOver ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                  border: `1px solid ${totalOver ? 'rgba(244,63,94,0.28)' : 'rgba(16,185,129,0.3)'}`,
                }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  {totalOver ? 'Over' : 'Left'}
                </span>
                <span className="text-xs font-black" style={{ color: totalOver ? '#fb7185' : '#6ee7b7' }}>
                  {formatCurrency(Math.abs(remaining), 'INR')}
                </span>
              </span>
              {overCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>
                    {overCount} {overCount === 1 ? 'category' : 'categories'} over
                  </span>
                </span>
              )}
            </div>
          )}
        </PageHero>

        {hasAny ? (
          <div ref={listRef} className="space-y-3">
            {totalLimit > 0 && (
              <div
                data-budget-card
                className="relative overflow-hidden rounded-2xl p-5 group"
                style={{
                  background: totalOver
                    ? 'radial-gradient(120% 130% at 85% 8%, rgba(244,63,94,0.18) 0%, rgba(11,14,20,0) 62%), #0d1017'
                    : 'radial-gradient(120% 130% at 85% 8%, rgba(16,185,129,0.18) 0%, rgba(11,14,20,0) 62%), #0d1017',
                  border: `1px solid ${totalOver ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.28)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <span className="text-sm font-bold" style={{ color: PANEL.heading }}>Monthly Total</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      style={{ background: 'rgba(16,185,129,0.18)', color: '#34d399' }}>
                      {isManualTotal ? 'manual' : 'auto'}
                    </span>
                    {isManualTotal && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button onClick={() => setEditBudget(totalAsBudget)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-emerald-400/10" style={{ color: '#34d399' }}><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDelBudget({ b: totalAsBudget, isTotal: true })} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-400/10" style={{ color: '#fb7185' }}><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold" style={{ color: totalOver ? '#fb7185' : '#e2e8f0' }}>
                    {formatCurrency(totalExpenses, 'INR')} / {formatCurrency(totalLimit, 'INR')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.14)' }}>
                  <div data-bar className="h-2 rounded-full" style={{ width: `${totalPct}%`, background: barColor(totalPct, totalOver) }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px]" style={{ color: PANEL.muted }}>{Math.round(totalPct)}% of total budget used</span>
                  <span className="text-[11px] font-semibold" style={{ color: totalOver ? '#fb7185' : '#6ee7b7' }}>
                    {totalOver
                      ? `${formatCurrency(totalExpenses - totalLimit, 'INR')} over`
                      : `${formatCurrency(totalLimit - totalExpenses, 'INR')} left`}
                  </span>
                </div>
              </div>
            )}

            {budgets.map(b => {
              const spent = spentByCategory[b.category_id ?? ''] ?? 0
              const limit = Number(b.limit_amount)
              const pct   = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
              const over  = spent > limit
              return (
                <div
                  key={b.id}
                  data-budget-card
                  className="relative overflow-hidden rounded-2xl p-5 group transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ background: PANEL.bg, border: `1px solid ${over ? 'rgba(244,63,94,0.25)' : PANEL.border}` }}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{b.categories?.icon ?? '📦'}</span>
                      <span className="text-sm font-bold truncate" style={{ color: PANEL.heading }}>{b.categories?.name ?? 'Category'}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: over ? '#fb7185' : PANEL.muted }}>
                        {formatCurrency(spent, 'INR')} / {formatCurrency(limit, 'INR')}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button onClick={() => setEditBudget(b)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-emerald-400/10 hover:text-emerald-400" style={{ color: 'rgba(148,163,184,0.7)' }}><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDelBudget({ b })} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-400/10 hover:text-red-400" style={{ color: 'rgba(148,163,184,0.7)' }}><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.12)' }}>
                    <div data-bar className="h-2 rounded-full" style={{ width: `${pct}%`, background: barColor(pct, over) }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px]" style={{ color: PANEL.faint }}>{Math.round(pct)}% used</span>
                    <span className="text-[11px] font-semibold" style={{ color: over ? '#fb7185' : '#6ee7b7' }}>
                      {over
                        ? `${formatCurrency(spent - limit, 'INR')} over`
                        : `${formatCurrency(limit - spent, 'INR')} left`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl py-20 text-center" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
            <p className="text-3xl mb-3">💰</p>
            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>No budgets set for this month</p>
            <p className="text-xs mt-1 mb-4" style={{ color: PANEL.muted }}>Set a category budget or your own monthly total</p>
            <button onClick={() => setSetOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              <Plus className="w-3.5 h-3.5" /> Set Budget
            </button>
          </div>
        )}
      </div>

      <SetBudgetModal open={setOpen} onClose={() => setSetOpen(false)} categories={categories} budgets={budgets} autoSum={autoSum} onSuccess={refresh} />
      {editBudget && <EditModal budget={editBudget} open={!!editBudget} onClose={() => setEditBudget(null)} onSuccess={refresh} />}
      {delBudget && <DeleteModal budget={delBudget.b} isTotal={delBudget.isTotal} open={!!delBudget} onClose={() => setDelBudget(null)} onSuccess={refresh} />}
    </>
  )
}
