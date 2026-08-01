export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { ReportsView } from './reports-view'

const MONTHS_BACK = 6

/** Local-date YYYY-MM-DD. toISOString() shifts IST midnight back a day. */
function localYmd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function dayOf(ymd: string): number {
  return Number(ymd.slice(8, 10))
}

function dowOf(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1)

  const [{ data: allTxns }, { data: categories }, { data: profile }] = await Promise.all([
    supabase.from('transactions')
      .select('id, type, amount_in_base, date, category_id, merchant')
      .eq('user_id', user.id)
      .gte('date', localYmd(rangeStart))
      .order('date', { ascending: false }),
    supabase.from('categories').select('id, name, icon, color').order('name'),
    supabase.from('profiles').select('base_currency').eq('id', user.id).single(),
  ])

  const currency = profile?.base_currency ?? 'INR'
  const txns = allTxns ?? []
  const catOf = (id: string | null) => categories?.find(c => c.id === id)

  const months = Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1)
    const start = localYmd(d)
    const end = localYmd(new Date(d.getFullYear(), d.getMonth() + 1, 1))
    const isCurrent = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()

    const monthTxns = txns.filter(t => t.date >= start && t.date < end)
    const expenseTxns = monthTxns.filter(t => t.type === 'expense')
    const incomeTxns = monthTxns.filter(t => t.type === 'income')

    const income = incomeTxns.reduce((s, t) => s + Number(t.amount_in_base), 0)
    const expense = expenseTxns.reduce((s, t) => s + Number(t.amount_in_base), 0)

    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = d.getDay()
    const elapsedDays = isCurrent ? now.getDate() : daysInMonth

    // Category breakdown
    const catMap = new Map<string, number>()
    expenseTxns.forEach(t => {
      const key = t.category_id ?? '__none__'
      catMap.set(key, (catMap.get(key) ?? 0) + Number(t.amount_in_base))
    })
    const catBreakdown = Array.from(catMap.entries())
      .map(([catId, amount]) => {
        const cat = catOf(catId)
        return {
          catId,
          icon: cat?.icon ?? '\u{1F4E6}',
          name: cat?.name ?? 'Uncategorized',
          color: cat?.color ?? '#f43f5e',
          amount,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    // Top merchants
    const merchMap = new Map<string, number>()
    expenseTxns.forEach(t => {
      const key = t.merchant?.trim() || 'Other'
      merchMap.set(key, (merchMap.get(key) ?? 0) + Number(t.amount_in_base))
    })
    const topMerchants = Array.from(merchMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Day of week
    const dowMap = new Array(7).fill(0)
    expenseTxns.forEach(t => { dowMap[dowOf(t.date)] += Number(t.amount_in_base) })
    const byDayOfWeek = DOW_LABELS.map((label, idx) => ({ label, amount: dowMap[idx] }))

    // Daily series
    const dailySpend: number[] = new Array(daysInMonth + 1).fill(0)
    const dailyIncome: number[] = new Array(daysInMonth + 1).fill(0)
    const dailyTxns: {
      day: number; id: string; merchant: string; amount: number
      icon: string; color: string; categoryName: string; type: 'income' | 'expense'
    }[][] = Array.from({ length: daysInMonth + 1 }, () => [])

    monthTxns.forEach(t => {
      if (t.type !== 'expense' && t.type !== 'income') return
      const day = dayOf(t.date)
      const amount = Number(t.amount_in_base)
      if (t.type === 'expense') dailySpend[day] += amount
      else dailyIncome[day] += amount
      const cat = catOf(t.category_id)
      dailyTxns[day].push({
        day,
        id: t.id,
        merchant: t.merchant?.trim() || 'Untitled',
        amount,
        icon: cat?.icon ?? '\u{1F4E6}',
        color: cat?.color ?? (t.type === 'income' ? '#10b981' : '#f43f5e'),
        categoryName: cat?.name ?? 'Uncategorized',
        type: t.type as 'income' | 'expense',
      })
    })
    dailyTxns.forEach(list => list.sort((a, b) => b.amount - a.amount))

    const biggest = expenseTxns.reduce<typeof expenseTxns[number] | undefined>(
      (max, t) => Number(t.amount_in_base) > Number(max?.amount_in_base ?? 0) ? t : max,
      undefined,
    )

    return {
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      monthYear: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      shortYear: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      start, end, isCurrent,
      income, expense, net: income - expense,
      txnCount: monthTxns.length,
      expenseCount: expenseTxns.length,
      daysInMonth, firstDayOfMonth, elapsedDays,
      todayDay: isCurrent ? now.getDate() : null,
      catBreakdown, topMerchants, byDayOfWeek,
      dailySpend, dailyIncome, dailyTxns,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
      avgDailySpend: elapsedDays > 0 ? expense / elapsedDays : 0,
      avgTxnSize: expenseTxns.length > 0 ? expense / expenseTxns.length : 0,
      biggestExpense: biggest
        ? { merchant: biggest.merchant?.trim() || 'Transaction', amount: Number(biggest.amount_in_base) }
        : null,
    }
  })

  return <ReportsView months={months} currency={currency} />
}
