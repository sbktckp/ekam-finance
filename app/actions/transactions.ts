'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATHS = ['/dashboard', '/dashboard/transactions']

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

  // Required field validation
  if (!amount || amount <= 0)    return { error: 'Enter a valid amount' }
  if (!account_id)               return { error: 'Select an account' }
  if (!category_id)              return { error: 'Please select a category' }
  if (!merchant && !note)        return { error: 'Please add a merchant name or note' }
  if (merchant && merchant.length > 100) return { error: 'Note must be 100 characters or less' }
  if (!date)                     return { error: 'Select a date' }
  if (!['income', 'expense', 'transfer'].includes(type)) return { error: 'Invalid type' }

  // Balance guard for expenses
  if (type === 'expense' || type === 'transfer') {
    const { data: acc } = await supabase.from('accounts')
      .select('balance, name').eq('id', account_id).single()
    if (acc) {
      const available = Number(acc.balance)
      if (amount > available) {
        const fmt = new Intl.NumberFormat('en-IN', {
          style: 'currency', currency, minimumFractionDigits: 0,
        }).format(available)
        return { error: `Insufficient balance in ${acc.name}. Available: ${fmt}` }
      }
    }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id, account_id, category_id, type,
    amount, amount_in_base: amount, currency, merchant, note, date,
  })
  if (error) return { error: error.message }

  // Sync account balance
  const { data: acc } = await supabase.from('accounts').select('balance').eq('id', account_id).single()
  if (acc) {
    const delta = type === 'income' ? amount : -amount
    await supabase.from('accounts').update({ balance: Math.max(0, Number(acc.balance) + delta) }).eq('id', account_id)
  }

  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function deleteTransaction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: txn } = await supabase.from('transactions')
    .select('amount_in_base, type, account_id')
    .eq('id', id).eq('user_id', user.id).single()

  if (!txn) return { error: 'Not found' }

  if (txn.account_id) {
    const { data: acc } = await supabase.from('accounts').select('balance').eq('id', txn.account_id).single()
    if (acc) {
      const reversal = txn.type === 'income' ? -Number(txn.amount_in_base) : Number(txn.amount_in_base)
      await supabase.from('accounts')
        .update({ balance: Math.max(0, Number(acc.balance) + reversal) })
        .eq('id', txn.account_id)
    }
  }

  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function updateTransaction(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const newAmount   = Number(formData.get('amount'))
  const merchant    = (formData.get('merchant')    as string)?.trim() || null
  const note        = (formData.get('note')        as string)?.trim() || null
  const date        = formData.get('date')         as string
  const category_id = (formData.get('category_id') as string) || null

  if (!newAmount || newAmount <= 0) return { error: 'Enter a valid amount' }
  if (merchant && merchant.length > 100) return { error: 'Note must be 100 characters or less' }

  const { data: old } = await supabase.from('transactions')
    .select('amount_in_base, account_id, type')
    .eq('id', id).eq('user_id', user.id).single()

  if (!old)                  return { error: 'Transaction not found' }
  if (old.type !== 'income') return { error: 'Only income transactions can be edited' }

  if (old.account_id) {
    const { data: acc } = await supabase.from('accounts').select('balance').eq('id', old.account_id).single()
    if (acc) {
      const delta = newAmount - Number(old.amount_in_base)
      await supabase.from('accounts')
        .update({ balance: Math.max(0, Number(acc.balance) + delta) })
        .eq('id', old.account_id)
    }
  }

  const { error } = await supabase.from('transactions').update({
    amount: newAmount, amount_in_base: newAmount, merchant, note, date, category_id,
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }

  PATHS.forEach(p => revalidatePath(p))
  return {}
}
