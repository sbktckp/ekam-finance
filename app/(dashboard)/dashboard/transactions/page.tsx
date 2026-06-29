export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { TransactionsView } from './transactions-view'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: transactions },
    { data: accounts },
    { data: categories },
  ] = await Promise.all([
    // No JOIN — avoid Supabase TypeScript inference issue; category matched in view by category_id
    supabase.from('transactions')
      .select('id, date, merchant, note, type, amount, amount_in_base, currency, category_id, account_id')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100),
    supabase.from('accounts')
      .select('id, name, color, type, currency, balance')
      .eq('user_id', user.id)
      .order('created_at'),
    supabase.from('categories')
      .select('id, name, icon, color, type')
      .order('name'),
  ])

  return (
    <TransactionsView
      transactions={transactions ?? []}
      accounts={accounts ?? []}
      categories={categories ?? []}
    />
  )
}
