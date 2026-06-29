export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { BillsView } from './bills-view'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: bills }, { data: categories }] = await Promise.all([
    supabase.from('bills')
      .select('id, name, amount, currency, recurrence, due_day, next_due_date, is_active, categories(name, icon)')
      .eq('user_id', user.id).eq('is_active', true)
      .order('next_due_date', { ascending: true }),
    supabase.from('categories').select('id, name, icon, type').order('name'),
  ])

  return (
    <BillsView
      bills={(bills ?? []) as Parameters<typeof BillsView>[0]['bills']}
      categories={categories ?? []}
    />
  )
}
