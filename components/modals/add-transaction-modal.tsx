'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { addTransaction } from '@/app/actions/transactions'
import { cn, formatCurrency } from '@/lib/utils'
import { AddAccountModal } from './add-account-modal'

type Account  = { id: string; name: string; color: string; type: string; currency: string; balance?: number }
type Category = { id: string; name: string; icon: string; color: string; type: string }

interface Props {
  open:       boolean
  onClose:    () => void
  accounts:   Account[]
  categories: Category[]
}

export function AddTransactionModal({ open, onClose, accounts, categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [txnType, setTxnType]       = useState<'expense' | 'income'>('expense')
  const [selectedCat, setSelectedCat] = useState('')
  const [accountId, setAccountId]   = useState(accounts[0]?.id ?? '')
  const [addAccOpen, setAddAccOpen] = useState(false)

  const selectedAccount = accounts.find(a => a.id === accountId)
  const currency = selectedAccount?.currency ?? 'INR'
  const balance  = selectedAccount?.balance ?? null

  const filteredCats = categories.filter(
    c => c.type === txnType || c.type === 'both' || !c.type
  )

  function handleSubmit(formData: FormData) {
    formData.set('type',        txnType)
    formData.set('category_id', selectedCat)
    formData.set('account_id',  accountId)
    formData.set('currency',    currency)
    setError(null)
    startTransition(async () => {
      const res = await addTransaction(formData)
      if (res.error) { setError(res.error); return }
      setSelectedCat('')
      onClose()
      router.refresh()
    })
  }

  if (!open) return null
  const isExpense = txnType === 'expense'

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Income / Expense toggle */}
          <div className="px-6 pt-5 pb-0 flex items-center justify-between gap-3">
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl flex-1">
              {(['expense', 'income'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => { setTxnType(t); setSelectedCat('') }}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150',
                    txnType === t
                      ? t === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}>
                  {t === 'expense' ? '− Expense' : '+ Income'}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <form action={handleSubmit} className="px-6 pb-6 pt-4 space-y-4 overflow-y-auto max-h-[75vh] sm:max-h-none">

            {/* Amount */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-gray-300">
                  {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency}
                </span>
                <input
                  name="amount" type="number" step="any" min="0.01" required
                  placeholder="0"
                  className="flex-1 text-4xl font-black text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ letterSpacing: '-0.04em' }}
                />
              </div>
              <div className="h-px bg-gray-100 mt-2" />
            </div>

            {accounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500 mb-3">You need an account first</p>
                <button type="button" onClick={() => setAddAccOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Account
                </button>
              </div>
            ) : (
              <>
                {/* Account selector — shows balance */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account</label>
                    {isExpense && balance !== null && (
                      <span className="text-[11px] text-gray-400">
                        Balance: <span className="font-bold text-gray-600">{formatCurrency(balance, currency)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
                    {accounts.map(a => (
                      <button key={a.id} type="button" onClick={() => setAccountId(a.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0',
                          accountId === a.id
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}>
                        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: a.color }} />
                        {a.name}
                        {a.balance !== undefined && (
                          <span className={accountId === a.id ? 'opacity-60' : 'text-gray-400'}>
                            {formatCurrency(Number(a.balance), a.currency ?? 'INR')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category — optional */}
                {filteredCats.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                      <span className="text-[10px] text-gray-300 font-medium">optional</span>
                      {selectedCat && (
                        <button type="button" onClick={() => setSelectedCat('')}
                          className="text-[10px] text-gray-400 hover:text-gray-600 underline ml-auto">clear</button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {filteredCats.slice(0, 8).map(cat => (
                        <button key={cat.id} type="button"
                          onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}
                          className={cn(
                            'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all duration-150',
                            selectedCat === cat.id
                              ? isExpense ? 'border-red-300 bg-red-50' : 'border-emerald-400 bg-emerald-50'
                              : 'border-gray-100 hover:border-gray-200 bg-gray-50/60'
                          )}>
                          <span className="text-lg leading-none">{cat.icon}</span>
                          <span className="text-[10px] font-semibold text-gray-600 leading-tight">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Merchant / Source */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {isExpense ? 'Merchant / Note' : 'Source'}
                  </label>
                  <input name="merchant" type="text"
                    placeholder={isExpense ? 'e.g. Swiggy, Rent...' : 'e.g. Salary, Freelance...'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all" />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                  <input name="date" type="date" required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all" />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isPending}
                  className={cn(
                    'w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
                    isExpense ? 'bg-red-500 text-white hover:shadow-red-500/25' : 'text-black hover:shadow-emerald-500/25'
                  )}
                  style={isExpense ? {} : { background: '#10b981' }}>
                  {isPending ? 'Saving...' : `Add ${isExpense ? 'Expense' : 'Income'}`}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <AddAccountModal open={addAccOpen} onClose={() => setAddAccOpen(false)} />
    </>
  )
}
