'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Building2, Wallet, CreditCard, Banknote, TrendingUp, MoreHorizontal } from 'lucide-react'
import { addAccount } from '@/app/actions/accounts'
import { CURRENCIES, ACCOUNT_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  savings:    <Building2    className="w-3.5 h-3.5" />,
  checking:   <Wallet       className="w-3.5 h-3.5" />,
  credit:     <CreditCard   className="w-3.5 h-3.5" />,
  cash:       <Banknote     className="w-3.5 h-3.5" />,
  investment: <TrendingUp   className="w-3.5 h-3.5" />,
  other:      <MoreHorizontal className="w-3.5 h-3.5" />,
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#f43f5e', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899',
]

export function AddAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [color, setColor]           = useState(COLORS[0])
  const [type, setType]             = useState('savings')

  function handleSubmit(formData: FormData) {
    formData.set('color', color)
    formData.set('type', type)
    setError(null)
    startTransition(async () => {
      const res = await addAccount(formData)
      if (res.error) { setError(res.error); return }
      onClose()
      router.refresh()
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Add Account</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="px-6 pb-6 pt-5 space-y-5 overflow-y-auto max-h-[80vh] sm:max-h-none">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Name</label>
            <input
              name="name" type="text" required autoFocus
              placeholder="e.g. HDFC Savings"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Type grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map(t => (
                <button
                  key={t.value} type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150',
                    type === t.value
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50/60'
                  )}
                >
                  {TYPE_ICONS[t.value]}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Balance + Currency */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Opening Balance</label>
              <input
                name="balance" type="number" step="0.01" defaultValue="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Currency</label>
              <select
                name="currency" defaultValue="INR"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all bg-white"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>

          {/* Color swatches */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all duration-150 flex-shrink-0"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    opacity: color === c ? 1 : 0.65,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black transition-all duration-150 hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#10b981' }}
          >
            {isPending ? 'Adding...' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
