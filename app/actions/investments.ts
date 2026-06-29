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

  if (!name)                    return { error: 'Investment name is required' }
  if (!quantity || quantity <= 0) return { error: 'Enter a valid quantity' }
  if (avg_buy_price < 0)        return { error: 'Enter a valid buy price' }

  const { error } = await supabase.from('investments').insert({
    user_id: user.id, name, type, ticker, quantity, avg_buy_price, currency,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/investments')
  return {}
}
