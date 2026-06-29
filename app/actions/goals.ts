'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title        = (formData.get('title')         as string)?.trim()
  const emoji        = (formData.get('emoji')          as string)?.trim() || '🎯'
  const target_amount = Number(formData.get('target_amount'))
  const currency     = (formData.get('currency')       as string) || 'INR'
  const deadline     = (formData.get('deadline')       as string) || null

  if (!title)                           return { error: 'Goal title is required' }
  if (!target_amount || target_amount <= 0) return { error: 'Enter a valid target amount' }

  const { error } = await supabase.from('goals').insert({
    user_id: user.id,
    title, emoji, target_amount,
    saved_amount: 0, currency,
    deadline: deadline || null,
    status: 'active',
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function updateSaved(id: string, saved_amount: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('goals')
    .update({ saved_amount })
    .eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return {}
}
