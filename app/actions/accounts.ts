'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATHS = ['/dashboard', '/dashboard/transactions', '/dashboard/accounts']

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
  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function updateAccount(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Account name is required' }

  const { error } = await supabase.from('accounts').update({
    name,
    type:  formData.get('type')  as string || 'savings',
    color: formData.get('color') as string || '#10b981',
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function deleteAccount(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { count } = await supabase.from('transactions')
    .select('id', { count: 'exact', head: true }).eq('account_id', id)
  if (count && count > 0) return { error: `This account has ${count} transaction(s). Delete or reassign them first.` }

  const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function setDefaultAccount(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await supabase.from('accounts').update({ is_default: false }).eq('user_id', user.id)
  const { error } = await supabase.from('accounts').update({ is_default: true }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  PATHS.forEach(p => revalidatePath(p))
  return {}
}
