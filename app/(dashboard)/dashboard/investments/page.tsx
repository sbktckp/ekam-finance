export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { InvestmentsView } from './investments-view'

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: investments } = await supabase
    .from('investments')
    .select('id, name, type, ticker, quantity, avg_buy_price, currency, current_price')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <InvestmentsView investments={investments ?? []} />
}
