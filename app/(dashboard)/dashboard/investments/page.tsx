import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  stock: '📈 Stock', mutual_fund: '📊 Mutual Fund', crypto: '₿ Crypto',
  etf: '🗂️ ETF', bond: '🏛️ Bond', real_estate: '🏠 Real Estate', other: '💼 Other',
}

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const totalInvested = investments?.reduce((s, i) => s + Number(i.avg_buy_price) * Number(i.quantity), 0) ?? 0
  const totalCurrent = investments?.reduce((s, i) => s + (Number(i.current_price ?? i.avg_buy_price)) * Number(i.quantity), 0) ?? 0
  const totalPnL = totalCurrent - totalInvested
  const totalPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
          <p className="text-sm text-gray-500 mt-1">Track your portfolio</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add investment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total invested</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalInvested, 'INR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current value</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalCurrent, 'INR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">P&amp;L</p>
          <p className={`text-xl font-semibold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL, 'INR')}
            <span className="text-sm ml-1">({totalPct.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {investments && investments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Asset</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg buy</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Current</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const current = Number(inv.current_price ?? inv.avg_buy_price)
                const pnl = (current - Number(inv.avg_buy_price)) * Number(inv.quantity)
                const pct = Number(inv.avg_buy_price) > 0 ? ((current - Number(inv.avg_buy_price)) / Number(inv.avg_buy_price)) * 100 : 0
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                      {inv.ticker && <p className="text-xs text-gray-500">{inv.ticker}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">{TYPE_LABELS[inv.type]}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{Number(inv.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(Number(inv.avg_buy_price), inv.currency)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{inv.current_price ? formatCurrency(current, inv.currency) : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, inv.currency)} ({pct.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No investments yet</p>
            <p className="text-gray-400 text-xs mt-1">Add stocks, mutual funds, or crypto to track your portfolio</p>
          </div>
        )}
      </div>
    </div>
  )
}
