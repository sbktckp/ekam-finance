'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBudget(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const category_id = (formData.get('category_id') as string) || null
  const limit_amount = Number(formData.get('limit_amount'))
  if (!limit_amount || limit_amount <= 0) return { error: 'Enter a valid amount' }

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Upsert: if budget for this category+month exists, update it
  if (category_id) {
    const { data: existing } = await supabase.from('budgets').select('id')
      .eq('user_id', user.id).eq('category_id', category_id).eq('month', month).single()
    if (existing) {
      const { error } = await supabase.from('budgets').update({ limit_amount }).eq('id', existing.id)
      if (error) return { error: error.message }
      revalidatePath('/dashboard/budget')
      return {}
    }
  }

  const { error } = await supabase.from('budgets').insert({
    user_id: user.id, category_id, limit_amount, month,
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/budget')
  return {}
}
