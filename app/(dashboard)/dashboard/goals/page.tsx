export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { GoalsView } from './goals-view'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: goals } = await supabase
    .from('goals')
    .select('id, title, emoji, target_amount, saved_amount, currency, deadline, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <GoalsView goals={goals ?? []} />
}
