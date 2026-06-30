export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AccountsView } from './accounts-view'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, type, balance, currency, color, is_default, created_at')
    .eq('user_id', user.id)
    .order('created_at')

  const netWorth = (accounts ?? []).reduce((s, a) => s + Number(a.balance), 0)

  return <AccountsView accounts={accounts ?? []} netWorth={netWorth} />
}
