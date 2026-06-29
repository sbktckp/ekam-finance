'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type        = formData.get('type')        as string
  const amount      = Number(formData.get('amount'))
  const account_id  = formData.get('account_id')  as string
  const category_id = (formData.get('category_id') as string) || null
  const merchant    = (formData.get('merchant')    as string)?.trim() || null
  const note        = (formData.get('note')        as string)?.trim() || null
  const date        = formData.get('date')         as string
  const currency    = (formData.get('currency')    as string) || 'INR'

  if (!amount || amount <= 0) return { error: 'Enter a valid amount' }
  if (!account_id)            return { error: 'Select an account' }
  if (!date)                  return { error: 'Select a date' }
  if (!['income', 'expense', 'transfer'].includes(type)) return { error: 'Invalid type' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id,
    category_id,
    type,
    amount,
    amount_in_base: amount,
    currency,
    merchant,
    note,
    date,
  })

  if (error) return { error: error.message }

  // Sync account balance
  const { data: acc } = await supabase
    .from('accounts').select('balance')
    .eq('id', account_id).single()

  if (acc) {
    const delta = type === 'income' ? amount : -amount
    await supabase.from('accounts')
      .update({ balance: Number(acc.balance) + delta })
      .eq('id', account_id)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return {}
}
