'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { addInvestment } from '@/app/actions/investments'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES, INVESTMENT_TYPES } from '@/lib/constants'

type Investment = { id: string; name: string; type: string; ticker: string | null; quantity: number; avg_buy_price: number; currency: string; current_price: number | null }

function Modal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addInvestment(fd)
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
          <h2 className="text-sm font-bold text-gray-900">Add Investment</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
              <input name="name" type="text" required placeholder="e.g. Reliance, NIFTY 50"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ticker</label>
              <input name="ticker" type="text" placeholder="RELIANCE"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 uppercase" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
            <select name="type" defaultValue="stock"
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 bg-white">
              {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Qty</label>
              <input name="quantity" type="number" step="0.001" min="0.001" required placeholder="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Buy Price</label>
              <input name="avg_buy_price" type="number" step="0.01" min="0" required placeholder="0"
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
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Adding...' : 'Add Investment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function InvestmentsView({ investments }: { investments: Investment[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const totalInvested = investments.reduce((s, i) => s + Number(i.quantity) * Number(i.avg_buy_price), 0)
  const totalCurrent  = investments.reduce((s, i) => s + Number(i.quantity) * (i.current_price != null ? Number(i.current_price) : Number(i.avg_buy_price)), 0)
  const totalPnL      = totalCurrent - totalInvested
  const pnlPct        = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const TYPE_ICONS: Record<string, string> = {
    stock: '📈', mutual_fund: '🏦', crypto: '₿', etf: '📊', bond: '📃', real_estate: '🏠', other: '💼'
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Investments</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your portfolio</p>
          </div>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150"
            style={{ background: '#10b981' }}>
            <Plus className="w-4 h-4" /> Add investment
          </button>
        </div>

        {investments.length > 0 ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Invested', value: formatCurrency(totalInvested, 'INR'), color: 'text-gray-900' },
                { label: 'Current Value', value: formatCurrency(totalCurrent, 'INR'), color: 'text-gray-900' },
                { label: 'P&L', value: `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL, 'INR')} (${pnlPct.toFixed(1)}%)`, color: totalPnL >= 0 ? 'text-emerald-600' : 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="surface-light rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-sm font-black ${s.color}`} style={{ letterSpacing: '-0.02em' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="surface-light rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Asset</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Qty</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Invested</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => {
                    const invested = Number(inv.quantity) * Number(inv.avg_buy_price)
                    const current  = Number(inv.quantity) * (inv.current_price != null ? Number(inv.current_price) : Number(inv.avg_buy_price))
                    const pnl      = current - invested
                    return (
                      <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{TYPE_ICONS[inv.type] ?? '💼'}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{inv.name}</p>
                              <p className="text-[11px] text-gray-400">{inv.ticker ?? inv.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-sm text-gray-500">{Number(inv.quantity).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(invested, inv.currency)}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, inv.currency)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="surface-light rounded-2xl py-20 text-center">
            <p className="text-3xl mb-3">📈</p>
            <p className="text-sm font-semibold text-gray-500">No investments tracked</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Add stocks, mutual funds, crypto and more</p>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Investment
            </button>
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} onSuccess={() => router.refresh()} />
    </>
  )
}
