export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { BudgetView } from './budget-view'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now       = new Date()
  const monthStr  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0]
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const [{ data: budgets }, { data: monthTxns }, { data: categories }] = await Promise.all([
    supabase.from('budgets').select('id, limit_amount, category_id, categories(name, icon)')
      .eq('user_id', user.id).gte('month', monthStr).lt('month', nextMonth),
    supabase.from('transactions').select('category_id, amount_in_base')
      .eq('user_id', user.id).eq('type', 'expense').gte('date', startOfMonth),
    supabase.from('categories').select('id, name, icon, type').order('name'),
  ])

  const spentByCategory: Record<string, number> = {}
  let totalExpenses = 0
  monthTxns?.forEach(t => {
    totalExpenses += Number(t.amount_in_base)
    if (t.category_id) {
      spentByCategory[t.category_id] = (spentByCategory[t.category_id] ?? 0) + Number(t.amount_in_base)
    }
  })

  return (
    <BudgetView
      budgets={(budgets ?? []) as Parameters<typeof BudgetView>[0]['budgets']}
      categories={categories ?? []}
      spentByCategory={spentByCategory}
      totalExpenses={totalExpenses}
      monthLabel={monthLabel}
    />
  )
}
