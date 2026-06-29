export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now   = new Date()
  const months: { label: string; start: string; end: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString().split('T')[0]
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0]
    months.push({ label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), start, end })
  }

  const startOfYear = `${now.getFullYear()}-01-01`

  const [{ data: allTxns }, { data: categories }] = await Promise.all([
    supabase.from('transactions')
      .select('type, amount_in_base, date, category_id')
      .eq('user_id', user.id)
      .gte('date', startOfYear)
      .order('date', { ascending: false }),
    supabase.from('categories').select('id, name, icon').order('name'),
  ])

  // Build monthly summary
  const monthly = months.map(m => {
    const txns    = allTxns?.filter(t => t.date >= m.start && t.date < m.end) ?? []
    const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0)
    return { ...m, income, expense, net: income - expense }
  })

  // Current month category breakdown
  const currentMonthStart = months[months.length - 1].start
  const currentMonthEnd   = months[months.length - 1].end
  const currentTxns       = allTxns?.filter(t => t.date >= currentMonthStart && t.date < currentMonthEnd && t.type === 'expense') ?? []
  const catMap            = new Map<string, number>()
  let totalExpenses       = 0
  currentTxns.forEach(t => {
    totalExpenses += Number(t.amount_in_base)
    const key = t.category_id ?? '__none__'
    catMap.set(key, (catMap.get(key) ?? 0) + Number(t.amount_in_base))
  })

  const catBreakdown = Array.from(catMap.entries())
    .map(([catId, amount]) => {
      const cat = categories?.find(c => c.id === catId)
      return { catId, icon: cat?.icon ?? '📦', name: cat?.name ?? 'Uncategorized', amount }
    })
    .sort((a, b) => b.amount - a.amount)

  const maxIncome  = Math.max(...monthly.map(m => m.income), 1)
  const maxExpense = Math.max(...monthly.map(m => m.expense), 1)
  const maxBar     = Math.max(maxIncome, maxExpense)

  const thisMonth = monthly[monthly.length - 1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your financial summary</p>
      </div>

      {/* This month KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income',   value: formatCurrency(thisMonth.income,  'INR'), color: 'text-emerald-600' },
          { label: 'Expenses', value: formatCurrency(thisMonth.expense, 'INR'), color: 'text-red-500' },
          { label: 'Net',      value: formatCurrency(thisMonth.net,     'INR'), color: thisMonth.net >= 0 ? 'text-emerald-600' : 'text-red-500' },
        ].map(k => (
          <div key={k.label} className="surface-light rounded-2xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className={`text-sm font-black ${k.color}`} style={{ letterSpacing: '-0.02em' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* 6-month bar chart */}
      <div className="surface-light rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-5">6-Month Overview</h2>
        <div className="flex items-end gap-2 h-36">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '112px' }}>
                <div className="flex-1 rounded-t-md transition-all duration-700"
                  style={{ height: `${(m.income / maxBar) * 100}%`, background: '#10b981', minHeight: m.income > 0 ? '4px' : '0' }} />
                <div className="flex-1 rounded-t-md transition-all duration-700"
                  style={{ height: `${(m.expense / maxBar) * 100}%`, background: '#f43f5e', minHeight: m.expense > 0 ? '4px' : '0' }} />
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-[11px] text-gray-500">Income</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-[11px] text-gray-500">Expenses</span></div>
        </div>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div className="surface-light rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-5">
            Spending by Category — {thisMonth.label}
          </h2>
          <div className="space-y-3">
            {catBreakdown.map(c => {
              const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0
              return (
                <div key={c.catId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{c.icon} {c.name}</span>
                    <span className="text-xs font-bold text-gray-500">
                      {formatCurrency(c.amount, 'INR')} · {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#f43f5e' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly table */}
      <div className="surface-light rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Income</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expenses</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Net</th>
            </tr>
          </thead>
          <tbody>
            {[...monthly].reverse().map(m => (
              <tr key={m.label} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-700">{m.label}</td>
                <td className="px-6 py-3.5 text-right text-sm font-semibold text-emerald-600">{m.income > 0 ? formatCurrency(m.income, 'INR') : '—'}</td>
                <td className="px-6 py-3.5 text-right text-sm font-semibold text-red-500">{m.expense > 0 ? formatCurrency(m.expense, 'INR') : '—'}</td>
                <td className={`px-6 py-3.5 text-right text-sm font-black ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {m.income > 0 || m.expense > 0 ? formatCurrency(m.net, 'INR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
