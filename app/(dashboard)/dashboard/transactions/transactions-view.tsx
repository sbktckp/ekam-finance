'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { AddTransactionModal } from '@/components/modals/add-transaction-modal'
import { AddAccountModal } from '@/components/modals/add-account-modal'
import { Plus } from 'lucide-react'

type Account  = { id: string; name: string; color: string; type: string; currency: string; balance: number }
type Category = { id: string; name: string; icon: string; color: string; type: string }
type Txn      = {
  id: string; date: string; merchant: string | null; note: string | null
  type: string; amount_in_base: number; currency: string
  categories: { name: string; icon: string } | null
}

interface Props {
  transactions: Txn[]
  accounts:     Account[]
  categories:   Category[]
}

export function TransactionsView({ transactions, accounts, categories }: Props) {
  const [txnOpen, setTxnOpen] = useState(false)
  const [accOpen, setAccOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Transactions
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            {accounts.length === 0 && (
              <button
                onClick={() => setAccOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-300 transition-all"
              >
                <Plus className="w-4 h-4" /> Account
              </button>
            )}
            <button
              onClick={() => setTxnOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:shadow-emerald-500/20 text-black"
              style={{ background: '#10b981' }}
            >
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
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400 font-medium whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{
                            background: txn.type === 'income' ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.09)',
                            color:      txn.type === 'income' ? '#10b981' : '#f43f5e',
                          }}
                        >
                          {txn.type === 'income' ? '+' : '−'}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                          {txn.merchant ?? txn.note ?? 'Transaction'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {txn.categories ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {txn.categories.icon} {txn.categories.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="text-sm font-black"
                        style={{ color: txn.type === 'income' ? '#10b981' : '#f43f5e' }}
                      >
                        {txn.type === 'income' ? '+' : '−'}
                        {formatCurrency(Number(txn.amount_in_base), txn.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Click Add to record your first one</p>
              <button
                onClick={() => setTxnOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
