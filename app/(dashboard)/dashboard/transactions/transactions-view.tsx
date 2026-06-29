'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'
import { deleteTransaction, updateTransaction } from '@/app/actions/transactions'
import { AddTransactionModal } from '@/components/modals/add-transaction-modal'
import { AddAccountModal }     from '@/components/modals/add-account-modal'
import { formatCurrency, cn }  from '@/lib/utils'

type Account  = { id: string; name: string; color: string; type: string; currency: string; balance: number }
type Category = { id: string; name: string; icon: string; color: string; type: string }
type Txn      = {
  id: string; date: string; merchant: string | null; note: string | null
  type: string; amount: number; amount_in_base: number; currency: string
  category_id: string | null; account_id: string | null
}

// ─── Edit modal (income only) ────────────────────────────────────────────────
function EditModal({ txn, categories, open, onClose, onSuccess }: {
  txn: Txn; categories: Category[]; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [selCat, setSelCat] = useState(txn.category_id ?? '')

  function handleSubmit(fd: FormData) {
    fd.set('category_id', selCat)
    setError(null)
    startTransition(async () => {
      const res = await updateTransaction(txn.id, fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  const incomeCats = categories.filter(c => c.type === 'income' || c.type === 'both')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Edit Income</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
            <input name="amount" type="number" step="0.01" min="0.01" required
              defaultValue={txn.amount_in_base}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Source</label>
            <input name="merchant" type="text" defaultValue={txn.merchant ?? ''}
              placeholder="e.g. Salary, Freelance..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {incomeCats.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {incomeCats.slice(0, 8).map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => setSelCat(cat.id === selCat ? '' : cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all',
                      selCat === cat.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50/60'
                    )}>
                    <span className="text-lg leading-none">{cat.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-600 leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
            <input name="date" type="date" required defaultValue={txn.date}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirmation ──────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, isPending }: {
  open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean
}) {
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
            <p className="text-sm font-bold text-gray-900">Delete transaction?</p>
            <p className="text-xs text-gray-400 mt-1">This will also reverse the account balance. Cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────
interface Props {
  transactions: Txn[]
  accounts:     Account[]
  categories:   Category[]
}

export function TransactionsView({ transactions, accounts, categories }: Props) {
  const router = useRouter()
  const [txnOpen, setTxnOpen]   = useState(false)
  const [accOpen, setAccOpen]   = useState(false)
  const [editTxn,  setEditTxn]  = useState<Txn | null>(null)
  const [delTxn,   setDelTxn]   = useState<Txn | null>(null)
  const [isDeleting, startDel]  = useTransition()

  function handleDelete() {
    if (!delTxn) return
    startDel(async () => {
      await deleteTransaction(delTxn.id)
      setDelTxn(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Transactions</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAccOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
              <Plus className="w-4 h-4" /> Account
            </button>
            <button onClick={() => setTxnOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:shadow-emerald-500/20 text-black"
              style={{ background: '#10b981' }}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="surface-light rounded-2xl overflow-hidden">
          {transactions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Category</th>
                  <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-3.5 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => {
                  const cat = txn.category_id ? categories.find(c => c.id === txn.category_id) : null
                  return (
                    <tr key={txn.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                            style={{
                              background: txn.type === 'income' ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.09)',
                              color:      txn.type === 'income' ? '#10b981' : '#f43f5e',
                            }}>
                            {txn.type === 'income' ? '+' : '−'}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                            {txn.merchant ?? txn.note ?? 'Transaction'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {cat.icon} {cat.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black" style={{ color: txn.type === 'income' ? '#10b981' : '#f43f5e' }}>
                          {txn.type === 'income' ? '+' : '−'}
                          {formatCurrency(Number(txn.amount_in_base), txn.currency)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {txn.type === 'income' && (
                            <button
                              onClick={() => setEditTxn(txn)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDelTxn(txn)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Click Add to record your first one</p>
              <button onClick={() => setTxnOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editTxn && (
        <EditModal
          txn={editTxn}
          categories={categories}
          open={!!editTxn}
          onClose={() => setEditTxn(null)}
          onSuccess={() => router.refresh()}
        />
      )}
      <DeleteModal
        open={!!delTxn}
        onClose={() => setDelTxn(null)}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
      <AddTransactionModal
        open={txnOpen}
        onClose={() => setTxnOpen(false)}
        accounts={accounts}
        categories={categories}
      />
      <AddAccountModal
        open={accOpen}
        onClose={() => setAccOpen(false)}
      />
    </>
  )
}
