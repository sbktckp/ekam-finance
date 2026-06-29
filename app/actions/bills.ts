'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATHS = ['/dashboard/bills', '/dashboard', '/dashboard/transactions']

function nextDate(recurrence: string, due_day: number): string {
  const now = new Date()
  let next: Date
  switch (recurrence) {
    case 'weekly':    next = new Date(now.getTime() + 7 * 86400000); break
    case 'quarterly': next = new Date(now.getFullYear(), now.getMonth() + 3, due_day); break
    case 'yearly':    next = new Date(now.getFullYear() + 1, now.getMonth(), due_day); break
    default:          next = new Date(now.getFullYear(), now.getMonth() + 1, due_day)
  }
  return next.toISOString().split('T')[0]
}

export async function addBill(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name        = (formData.get('name')        as string)?.trim()
  const amount      = Number(formData.get('amount'))
  const due_day     = Number(formData.get('due_day'))
  const recurrence  = (formData.get('recurrence')  as string) || 'monthly'
  const currency    = (formData.get('currency')     as string) || 'INR'
  const category_id = (formData.get('category_id') as string) || null

  if (!name)                                     return { error: 'Bill name is required' }
  if (!amount || amount <= 0)                    return { error: 'Enter a valid amount' }
  if (!due_day || due_day < 1 || due_day > 31)   return { error: 'Due day must be 1–31' }

  const now  = new Date()
  let next   = new Date(now.getFullYear(), now.getMonth(), due_day)
  if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, due_day)

  const { error } = await supabase.from('bills').insert({
    user_id: user.id, name, amount, currency,
    category_id, recurrence, due_day,
    next_due_date: next.toISOString().split('T')[0],
    notify_days_before: 3, is_active: true,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/bills')
  return {}
}

export async function payBill(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const bill_id    = formData.get('bill_id')    as string
  const account_id = formData.get('account_id') as string
  if (!bill_id)    return { error: 'Bill not found' }
  if (!account_id) return { error: 'Select an account' }

  const { data: bill } = await supabase.from('bills')
    .select('name, amount, currency, category_id, recurrence, due_day')
    .eq('id', bill_id).eq('user_id', user.id).single()
  if (!bill) return { error: 'Bill not found' }

  const { data: acc } = await supabase.from('accounts')
    .select('balance, name').eq('id', account_id).single()
  if (!acc) return { error: 'Account not found' }

  const amount = Number(bill.amount)
  if (Number(acc.balance) < amount)
    return { error: `Insufficient balance in ${acc.name}. Available: ₹${Number(acc.balance).toLocaleString('en-IN')}` }

  // Create expense transaction (auto-categorised to bill's category)
  const { error: txErr } = await supabase.from('transactions').insert({
    user_id:       user.id,
    account_id,
    category_id:   bill.category_id,
    type:          'expense',
    amount,
    amount_in_base: amount,
    currency:       bill.currency,
    merchant:       bill.name,
    note:           'Bill payment',
    date:           new Date().toISOString().split('T')[0],
  })
  if (txErr) return { error: txErr.message }

  // Deduct from account
  await supabase.from('accounts')
    .update({ balance: Number(acc.balance) - amount })
    .eq('id', account_id)

  // Advance next_due_date
  await supabase.from('bills')
    .update({ next_due_date: nextDate(bill.recurrence, bill.due_day) })
    .eq('id', bill_id).eq('user_id', user.id)

  PATHS.forEach(p => revalidatePath(p))
  return {}
}

export async function updateBill(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name       = (formData.get('name')       as string)?.trim()
  const amount     = Number(formData.get('amount'))
  const due_day    = Number(formData.get('due_day'))
  const recurrence = (formData.get('recurrence') as string) || 'monthly'

  if (!name)                                   return { error: 'Bill name is required' }
  if (!amount || amount <= 0)                  return { error: 'Enter a valid amount' }
  if (!due_day || due_day < 1 || due_day > 31) return { error: 'Due day must be 1–31' }

  const now  = new Date()
  let next   = new Date(now.getFullYear(), now.getMonth(), due_day)
  if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, due_day)

  const { error } = await supabase.from('bills')
    .update({ name, amount, due_day, recurrence, next_due_date: next.toISOString().split('T')[0] })
    .eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/bills')
  return {}
}

export async function deleteBill(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('bills')
    .delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/bills')
  return {}
}
