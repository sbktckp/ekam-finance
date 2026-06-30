export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { TransactionsView } from './transactions-view'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now      = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [
    { data: transactions },
    { data: accounts },
    { data: categories },
    { data: budgets },
    { data: monthExpenses },
  ] = await Promise.all([
    // Stable order: date desc, then created_at desc, then id desc as final tiebreaker
    // — prevents same-date transactions from silently reshuffling after an edit
    supabase.from('transactions')
      .select('id, date, merchant, note, type, amount, amount_in_base, currency, category_id, account_id')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(100),
    supabase.from('accounts')
      .select('id, name, color, type, currency, balance')
      .eq('user_id', user.id)
      .order('created_at'),
    supabase.from('categories')
      .select('id, name, icon, color, type')
      .order('name'),
    // Category budgets for this month (for spend-warning in the Add Transaction modal)
    supabase.from('budgets')
      .select('category_id, limit_amount')
      .eq('user_id', user.id).not('category_id', 'is', null).eq('month', monthStr),
    supabase.from('transactions')
      .select('category_id, amount_in_base')
      .eq('user_id', user.id).eq('type', 'expense').gte('date', monthStr),
  ])

  const spentByCategory: Record<string, number> = {}
  monthExpenses?.forEach(t => {
    if (t.category_id) spentByCategory[t.category_id] = (spentByCategory[t.category_id] ?? 0) + Number(t.amount_in_base)
  })
  const budgetByCategory: Record<string, number> = {}
  budgets?.forEach(b => { if (b.category_id) budgetByCategory[b.category_id] = Number(b.limit_amount) })

  return (
    <TransactionsView
      transactions={transactions ?? []}
      accounts={accounts ?? []}
      categories={categories ?? []}
      budgetByCategory={budgetByCategory}
      spentByCategory={spentByCategory}
    />
  )
}
