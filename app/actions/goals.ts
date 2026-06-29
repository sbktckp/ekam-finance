'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title         = (formData.get('title')         as string)?.trim()
  const emoji         = (formData.get('emoji')          as string)?.trim() || '🎯'
  const target_amount = Number(formData.get('target_amount'))
  const currency      = (formData.get('currency')       as string) || 'INR'
  const deadline      = (formData.get('deadline')       as string) || null

  if (!title)                               return { error: 'Goal title is required' }
  if (!target_amount || target_amount <= 0) return { error: 'Enter a valid target amount' }

  const { error } = await supabase.from('goals').insert({
    user_id: user.id, title, emoji, target_amount,
    saved_amount: 0, currency, deadline: deadline || null, status: 'active',
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function addGoalContribution(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const goal_id    = formData.get('goal_id')    as string
  const account_id = formData.get('account_id') as string
  const amount     = Number(formData.get('amount'))

  if (!goal_id)              return { error: 'Goal not found' }
  if (!account_id)           return { error: 'Select an account' }
  if (!amount || amount <= 0) return { error: 'Enter a valid amount' }

  const [{ data: acc }, { data: goal }] = await Promise.all([
    supabase.from('accounts').select('balance, name').eq('id', account_id).single(),
    supabase.from('goals').select('saved_amount, title').eq('id', goal_id).eq('user_id', user.id).single(),
  ])

  if (!acc)  return { error: 'Account not found' }
  if (!goal) return { error: 'Goal not found' }
  if (Number(acc.balance) < amount) return { error: `Insufficient balance in ${acc.name}` }

  // Deduct from account
  await supabase.from('accounts')
    .update({ balance: Number(acc.balance) - amount })
    .eq('id', account_id)

  // Add to goal
  await supabase.from('goals')
    .update({ saved_amount: Number(goal.saved_amount) + amount })
    .eq('id', goal_id).eq('user_id', user.id)

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return {}
}
