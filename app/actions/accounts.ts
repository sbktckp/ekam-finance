'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAccount(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Account name is required' }

  const { error } = await supabase.from('accounts').insert({
    user_id:  user.id,
    name,
    type:     formData.get('type')     as string || 'savings',
    balance:  Number(formData.get('balance') ?? 0),
    currency: formData.get('currency') as string || 'INR',
    color:    formData.get('color')    as string || '#10b981',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return {}
}
