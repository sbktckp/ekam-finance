'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

// category_id empty => sets/updates the manual MONTHLY TOTAL override (category_id NULL row)
// Uses select-then-update/insert with maybeSingle (never throws on 0 or duplicate rows)
export async function addBudget(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const category_id  = (formData.get('category_id') as string) || null
  const limit_amount = Number(formData.get('limit_amount'))
  if (!limit_amount || limit_amount <= 0) return { error: 'Enter a valid amount' }

  const month = currentMonth()

  let query = supabase.from('budgets').select('id').eq('user_id', user.id).eq('month', month)
  query = category_id ? query.eq('category_id', category_id) : query.is('category_id', null)
  const { data: existing } = await query.maybeSingle()

  if (existing) {
    const { error } = await supabase.from('budgets').update({ limit_amount }).eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('budgets').insert({ user_id: user.id, category_id, limit_amount, month })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/budget')
  return {}
}

export async function updateBudget(id: string, limit_amount: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (!limit_amount || limit_amount <= 0) return { error: 'Enter a valid amount' }

  const { error } = await supabase.from('budgets').update({ limit_amount }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/budget')
  return {}
}

export async function deleteBudget(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/budget')
  return {}
}
