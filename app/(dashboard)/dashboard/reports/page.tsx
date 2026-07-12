export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { ReportsView } from './reports-view'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const months: { label: string; start: string; end: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      start: d.toISOString().split('T')[0],
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0],
    })
  }
  const startOfYear = `${now.getFullYear()}-01-01`

  const [{ data: allTxns }, { data: categories }] = await Promise.all([
    supabase.from('transactions')
      .select('type, amount_in_base, date, category_id, merchant')
      .eq('user_id', user.id).gte('date', startOfYear).order('date', { ascending: false }),
    supabase.from('categories').select('id, name, icon').order('name'),
  ])

  const monthly = months.map(m => {
    const txns    = allTxns?.filter(t => t.date >= m.start && t.date < m.end) ?? []
    const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0)
    return { ...m, income, expense, net: income - expense, count: txns.length }
  })

  const thisMonth = monthly[monthly.length - 1]
  const lastMonth = monthly[monthly.length - 2] ?? { income: 0, expense: 0, net: 0 }

  const pctDelta = (cur: number, prev: number) => prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100

  const currentTxns = allTxns?.filter(t => t.date >= thisMonth.start && t.date < thisMonth.end) ?? []
  const expenseTxns = currentTxns.filter(t => t.type === 'expense')

  // Category breakdown
  const catMap = new Map<string, number>()
  expenseTxns.forEach(t => {
    const key = t.category_id ?? '__none__'
    catMap.set(key, (catMap.get(key) ?? 0) + Number(t.amount_in_base))
  })
  const catBreakdown = Array.from(catMap.entries())
    .map(([catId, amount]) => {
      const cat = categories?.find(c => c.id === catId)
      return { catId, icon: cat?.icon ?? '📦', name: cat?.name ?? 'Uncategorized', amount }
    })
    .sort((a, b) => b.amount - a.amount)

  // Top merchants
  const merchMap = new Map<string, number>()
  expenseTxns.forEach(t => {
    const key = t.merchant?.trim() || 'Other'
    merchMap.set(key, (merchMap.get(key) ?? 0) + Number(t.amount_in_base))
  })
  const topMerchants = Array.from(merchMap.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5)

  // Day of week
  const dowLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dowMap = new Array(7).fill(0)
  expenseTxns.forEach(t => { dowMap[new Date(t.date).getDay()] += Number(t.amount_in_base) })
  const byDayOfWeek = dowLabels.map((label, i) => ({ label, amount: dowMap[i] }))

  // ── Daily spend for current month (calendar heatmap) ──────────────────────
  const daysInMonth     = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay() // 0=Sun
  const dailySpend      = new Array(daysInMonth + 1).fill(0) // index = day number
  expenseTxns.forEach(t => {
    const d = new Date(t.date).getDate()
    dailySpend[d] += Number(t.amount_in_base)
  })
  const monthYear = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const biggest = expenseTxns.reduce((max, t) => Number(t.amount_in_base) > Number(max?.amount_in_base ?? 0) ? t : max, expenseTxns[0])

  const savingsRate    = thisMonth.income > 0 ? ((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100 : 0
  const avgDailySpend  = thisMonth.expense / daysInMonth
  const avgTxnSize     = expenseTxns.length > 0 ? thisMonth.expense / expenseTxns.length : 0

  return (
    <ReportsView
      monthly={monthly}
      thisMonth={thisMonth}
      incomeDelta={pctDelta(thisMonth.income, lastMonth.income)}
      expenseDelta={pctDelta(thisMonth.expense, lastMonth.expense)}
      netDelta={pctDelta(thisMonth.net, lastMonth.net)}
      catBreakdown={catBreakdown}
      totalExpenses={thisMonth.expense}
      topMerchants={topMerchants}
      byDayOfWeek={byDayOfWeek}
      dailySpend={dailySpend}
      daysInMonth={daysInMonth}
      firstDayOfMonth={firstDayOfMonth}
      monthYear={monthYear}
      savingsRate={savingsRate}
      avgDailySpend={avgDailySpend}
      avgTxnSize={avgTxnSize}
      biggestExpense={biggest ? { merchant: biggest.merchant ?? 'Transaction', amount: Number(biggest.amount_in_base) } : null}
      txnCount={currentTxns.length}
    />
  )
}
