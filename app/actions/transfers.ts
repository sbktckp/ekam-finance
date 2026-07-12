'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATHS = ['/dashboard', '/dashboard/transactions', '/dashboard/accounts']

export async function addTransfer(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fromAccountId = formData.get('from_account_id') as string
  const toAccountId   = formData.get('to_account_id')   as string
  const amount        = Number(formData.get('amount'))
  const note          = (formData.get('note') as string)?.trim() || null
  const date           = formData.get('date') as string

  if (!fromAccountId || !toAccountId)   return { error: 'Select both accounts' }
  if (fromAccountId === toAccountId)    return { error: 'Choose two different accounts' }
  if (!amount || amount <= 0)           return { error: 'Enter a valid amount' }
  if (note && note.length > 100)        return { error: 'Note must be 100 characters or less' }
  if (!date)                            return { error: 'Select a date' }

  const [{ data: fromAcc }, { data: toAcc }] = await Promise.all([
    supabase.from('accounts').select('id, name, balance, currency').eq('id', fromAccountId).eq('user_id', user.id).single(),
    supabase.from('accounts').select('id, name, balance, currency').eq('id', toAccountId).eq('user_id', user.id).single(),
  ])
  if (!fromAcc) return { error: 'Source account not found' }
  if (!toAcc)   return { error: 'Destination account not found' }

  const available = Number(fromAcc.balance)
  if (amount > available) {
    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: fromAcc.currency, minimumFractionDigits: 0 }).format(available)
    return { error: `Insufficient balance in ${fromAcc.name}. Available: ${fmt}` }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id: fromAccountId,
    to_account_id: toAccountId,
    type: 'transfer',
    amount, amount_in_base: amount,
    currency: fromAcc.currency,
    merchant: `Transfer to ${toAcc.name}`,
    note, date,
  })
  if (error) return { error: error.message }

  await Promise.all([
    supabase.from('accounts').update({ balance: Math.max(0, available - amount) }).eq('id', fromAccountId),
    supabase.from('accounts').update({ balance: Number(toAcc.balance) + amount }).eq('id', toAccountId),
  ])

  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function deleteTransfer(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: txn } = await supabase.from('transactions')
    .select('amount_in_base, account_id, to_account_id, type')
    .eq('id', id).eq('user_id', user.id).single()

  if (!txn)                     return { error: 'Not found' }
  if (txn.type !== 'transfer')  return { error: 'Not a transfer' }

  const amount = Number(txn.amount_in_base)

  if (txn.account_id) {
    const { data: fromAcc } = await supabase.from('accounts').select('balance').eq('id', txn.account_id).single()
    if (fromAcc) await supabase.from('accounts').update({ balance: Number(fromAcc.balance) + amount }).eq('id', txn.account_id)
  }
  if (txn.to_account_id) {
    const { data: toAcc } = await supabase.from('accounts').select('balance').eq('id', txn.to_account_id).single()
    if (toAcc) await supabase.from('accounts').update({ balance: Math.max(0, Number(toAcc.balance) - amount) }).eq('id', txn.to_account_id)
  }

  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  PATHS.forEach(p => revalidatePath(p))
  return {}
}
