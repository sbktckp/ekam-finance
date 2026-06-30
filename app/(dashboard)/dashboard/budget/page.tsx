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
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const [{ data: catBudgets }, { data: totalRow }, { data: monthTxns }, { data: categories }] = await Promise.all([
    supabase.from('budgets').select('id, limit_amount, category_id, categories(name, icon)')
      .eq('user_id', user.id).not('category_id', 'is', null)
      .gte('month', monthStr).lt('month', nextMonth),
    supabase.from('budgets').select('id, limit_amount')
      .eq('user_id', user.id).is('category_id', null)
      .gte('month', monthStr).lt('month', nextMonth).maybeSingle(),
    supabase.from('transactions').select('category_id, amount_in_base')
      .eq('user_id', user.id).eq('type', 'expense').gte('date', monthStr),
    supabase.from('categories').select('id, name, icon, type').order('name'),
  ])

  const spentByCategory: Record<string, number> = {}
  let totalExpenses = 0
  monthTxns?.forEach(t => {
    totalExpenses += Number(t.amount_in_base)
    if (t.category_id) spentByCategory[t.category_id] = (spentByCategory[t.category_id] ?? 0) + Number(t.amount_in_base)
  })

  const autoSum    = (catBudgets ?? []).reduce((s, b) => s + Number(b.limit_amount), 0)
  const isManual   = !!totalRow
  const totalLimit = isManual ? Number(totalRow!.limit_amount) : autoSum

  return (
    <BudgetView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgets={(catBudgets ?? []) as unknown as Parameters<typeof BudgetView>[0]['budgets']}
      categories={categories ?? []}
      spentByCategory={spentByCategory}
      totalExpenses={totalExpenses}
      totalLimit={totalLimit}
      autoSum={autoSum}
      isManualTotal={isManual}
      manualTotalId={totalRow?.id ?? null}
      monthLabel={monthLabel}
    />
  )
}
