'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  if (!name)                         return { error: 'Bill name is required' }
  if (!amount || amount <= 0)        return { error: 'Enter a valid amount' }
  if (!due_day || due_day < 1 || due_day > 31) return { error: 'Due day must be 1–31' }

  const now  = new Date()
  let next   = new Date(now.getFullYear(), now.getMonth(), due_day)
  if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, due_day)
  const next_due_date = next.toISOString().split('T')[0]

  const { error } = await supabase.from('bills').insert({
    user_id: user.id, name, amount, currency,
    category_id, recurrence, due_day,
    next_due_date, notify_days_before: 3, is_active: true,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/bills')
  return {}
}
