'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addInvestment(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name          = (formData.get('name')          as string)?.trim()
  const type          = (formData.get('type')           as string) || 'stock'
  const ticker        = (formData.get('ticker')         as string)?.trim() || null
  const quantity      = Number(formData.get('quantity'))
  const avg_buy_price = Number(formData.get('avg_buy_price'))
  const currency      = (formData.get('currency')       as string) || 'INR'
  const account_id    = (formData.get('account_id')    as string) || null

  if (!name)                      return { error: 'Investment name is required' }
  if (!quantity || quantity <= 0)  return { error: 'Enter a valid quantity' }
  if (avg_buy_price < 0)           return { error: 'Enter a valid buy price' }

  if (account_id) {
    const totalCost = quantity * avg_buy_price
    const { data: acc } = await supabase.from('accounts').select('balance, name').eq('id', account_id).single()
    if (!acc) return { error: 'Account not found' }
    if (Number(acc.balance) < totalCost) return { error: `Insufficient balance in ${acc.name}` }
    await supabase.from('accounts').update({ balance: Number(acc.balance) - totalCost }).eq('id', account_id)
  }

  const { error } = await supabase.from('investments').insert({
    user_id: user.id, name, type, ticker, quantity, avg_buy_price, currency,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/investments')
  return {}
}

export async function updateInvestment(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name          = (formData.get('name')          as string)?.trim()
  const type          = (formData.get('type')           as string) || 'stock'
  const ticker        = (formData.get('ticker')         as string)?.trim() || null
  const quantity      = Number(formData.get('quantity'))
  const avg_buy_price = Number(formData.get('avg_buy_price'))

  if (!name)                      return { error: 'Name is required' }
  if (!quantity || quantity <= 0)  return { error: 'Enter a valid quantity' }
  if (avg_buy_price < 0)           return { error: 'Enter a valid price' }

  const { error } = await supabase.from('investments')
    .update({ name, type, ticker, quantity, avg_buy_price })
    .eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/investments')
  return {}
}

export async function deleteInvestment(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('investments')
    .delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/investments')
  return {}
}
