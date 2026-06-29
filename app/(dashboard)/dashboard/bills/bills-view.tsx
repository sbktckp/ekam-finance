'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, AlertCircle, CreditCard, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { addBill, payBill, updateBill, deleteBill } from '@/app/actions/bills'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/constants'

type Bill     = { id: string; name: string; amount: number; currency: string; recurrence: string; due_day: number; next_due_date: string | null; is_active: boolean; categories: { name: string; icon: string } | null }
type Category = { id: string; name: string; icon: string; type: string }
type Account  = { id: string; name: string; color: string; balance: number; currency: string }

const RECURRENCE = [
  { value: 'weekly',    label: 'Weekly' },
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly',    label: 'Yearly' },
]

// ─── Add Bill modal ───────────────────────────────────────────────────────────
function AddModal({ open, onClose, categories, onSuccess }: {
  open: boolean; onClose: () => void; categories: Category[]; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addBill(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Add Recurring Bill</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Bill Name</label>
            <input name="name" type="text" required placeholder="e.g. Netflix, Rent, EMI"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Amount</label>
              <input name="amount" type="number" step="1" min="1" required placeholder="0"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Currency</label>
              <select name="currency" defaultValue="INR"
                className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Recurrence</label>
              <select name="recurrence" defaultValue="monthly"
                className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }}>
                {RECURRENCE.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Due Day</label>
              <input name="due_day" type="number" min="1" max="31" required placeholder="1–31"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Category (optional)</label>
            <select name="category_id"
              className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }}>
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Adding...' : 'Add Bill'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Pay Bill modal ────────────────────────────────────────────────────────────
function PayModal({ bill, accounts, open, onClose, onSuccess }: {
  bill: Bill; accounts: Account[]; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selAcc, setSelAcc] = useState(accounts[0]?.id ?? '')

  function handleSubmit() {
    const fd = new FormData()
    fd.set('bill_id', bill.id)
    fd.set('account_id', selAcc)
    setError(null)
    startTransition(async () => {
      const res = await payBill(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  const selAccData = accounts.find(a => a.id === selAcc)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Pay {bill.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {formatCurrency(Number(bill.amount), bill.currency)} · {bill.categories?.icon} {bill.categories?.name ?? 'No category'}
            </p>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Pay from account</p>
          {accounts.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No accounts found. Add one first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {accounts.map(a => (
                <button key={a.id} type="button" onClick={() => setSelAcc(a.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    border: selAcc === a.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                    background: selAcc === a.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                    color: selAcc === a.id ? '#34d399' : 'rgba(255,255,255,0.65)',
                  }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                  {a.name}
                  <span style={{ color: 'rgba(255,255,255,0.38)' }}>{formatCurrency(Number(a.balance), a.currency)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selAccData && (
          <div className="rounded-xl px-4 py-3 mb-4 text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: 'rgba(255,255,255,0.48)' }}>Balance after: </span>
            <span className="font-bold" style={{ color: Number(selAccData.balance) >= Number(bill.amount) ? '#34d399' : '#f43f5e' }}>
              {formatCurrency(Number(selAccData.balance) - Number(bill.amount), selAccData.currency)}
            </span>
          </div>
        )}
        {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg mb-3 border border-red-500/20">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', background: 'transparent' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isPending || !selAcc}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Paying...' : `Pay ${formatCurrency(Number(bill.amount), bill.currency)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Bill modal ───────────────────────────────────────────────────────────
function EditModal({ bill, open, onClose, onSuccess }: {
  bill: Bill; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await updateBill(bill.id, fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Edit Bill</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Name</label>
            <input name="name" type="text" required defaultValue={bill.name} autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Amount</label>
              <input name="amount" type="number" step="1" min="1" required defaultValue={Number(bill.amount)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Due Day</label>
              <input name="due_day" type="number" min="1" max="31" required defaultValue={bill.due_day}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>Recurrence</label>
            <select name="recurrence" defaultValue={bill.recurrence}
              className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)' }}>
              {RECURRENCE.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>Cancel</button>
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
function DeleteModal({ bill, open, onClose, onSuccess }: {
  bill: Bill; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handle() {
    startTransition(async () => {
      await deleteBill(bill.id)
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Delete {bill.name}?</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>Cancel</button>
          <button onClick={handle} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────
export function BillsView({ bills, categories, accounts }: { bills: Bill[]; categories: Category[]; accounts: Account[] }) {
  const router = useRouter()
  const [addOpen,  setAddOpen]  = useState(false)
  const [payBill_,  setPayBill]  = useState<Bill | null>(null)
  const [editBill_, setEditBill] = useState<Bill | null>(null)
  const [delBill_,  setDelBill]  = useState<Bill | null>(null)
  const refresh = () => router.refresh()
  const today   = new Date()

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Bills</h1>
            <p className="text-sm text-gray-400 mt-0.5">Recurring payments</p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Add bill
          </button>
        </div>

        {bills.length > 0 ? (
          <div className="surface-light rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bill</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Recurrence</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Next Due</th>
                  <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-3.5 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => {
                  const dueDate   = b.next_due_date ? new Date(b.next_due_date) : null
                  const daysLeft  = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) : null
                  const isOverdue = daysLeft !== null && daysLeft < 0
                  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{b.categories?.icon ?? '📄'}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                            <p className="text-[11px] text-gray-400">{b.categories?.name ?? 'No category'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-gray-500 capitalize">{b.recurrence}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {(isOverdue || isDueSoon) && <AlertCircle className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`} />}
                          <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-gray-500'}`}>
                            {daysLeft === null ? '—' : isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gray-900">{formatCurrency(Number(b.amount), b.currency)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setPayBill(b)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}
                            title="Pay now">
                            <CreditCard className="w-3 h-3" /> Pay
                          </button>
                          <button onClick={() => setEditBill(b)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-50 transition-colors">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDelBill(b)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="surface-light rounded-2xl py-20 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm font-semibold text-gray-500">No recurring bills</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Track subscriptions, EMIs, and other recurring payments</p>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Bill
            </button>
          </div>
        )}
      </div>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories} onSuccess={refresh} />
      {payBill_  && <PayModal    bill={payBill_}  accounts={accounts} open={!!payBill_}  onClose={() => setPayBill(null)}  onSuccess={refresh} />}
      {editBill_ && <EditModal   bill={editBill_}                     open={!!editBill_} onClose={() => setEditBill(null)} onSuccess={refresh} />}
      {delBill_  && <DeleteModal bill={delBill_}                      open={!!delBill_}  onClose={() => setDelBill(null)}  onSuccess={refresh} />}
    </>
  )
}
