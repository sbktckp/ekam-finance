import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount_in_base, date')
    .eq('user_id', user!.id)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])

  const monthlyData: Record<string, { income: number; expense: number }> = {}
  transactions?.forEach((t) => {
    const month = t.date.substring(0, 7)
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 }
    if (t.type === 'income') monthlyData[month].income += Number(t.amount_in_base)
    if (t.type === 'expense') monthlyData[month].expense += Number(t.amount_in_base)
  })

  const months = Object.keys(monthlyData).sort().reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Last 6 months overview</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {months.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Month</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Income</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Net</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const data = monthlyData[month]
                const net = data.income - data.expense
                const [yr, mo] = month.split('-')
                const label = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString('en-IN', {
                  month: 'long', year: 'numeric',
                })
                return (
                  <tr key={month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{label}</td>
                    <td className="px-6 py-4 text-right text-sm text-emerald-600 font-medium">+{formatCurrency(data.income, 'INR')}</td>
                    <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">-{formatCurrency(data.expense, 'INR')}</td>
                    <td className={`px-6 py-4 text-right text-sm font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net, 'INR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No data to report yet</p>
            <p className="text-gray-400 text-xs mt-1">Add transactions to see your monthly reports</p>
          </div>
        )}
      </div>
    </div>
  )
}
