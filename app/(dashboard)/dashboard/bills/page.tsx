import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getDaySuffix } from '@/lib/utils'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bills } = await supabase
    .from('bills')
    .select('*, categories(name, icon)')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('due_day', { ascending: true })

  const totalMonthly = bills?.reduce((s, b) => {
    if (b.recurrence === 'monthly') return s + Number(b.amount)
    if (b.recurrence === 'yearly') return s + Number(b.amount) / 12
    if (b.recurrence === 'quarterly') return s + Number(b.amount) / 3
    if (b.recurrence === 'weekly') return s + Number(b.amount) * 4.33
    return s
  }, 0) ?? 0

  const today = new Date().getDate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
          <p className="text-sm text-gray-500 mt-1">Subscriptions &amp; recurring payments</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add bill
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly commitment</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(totalMonthly, 'INR')}</p>
        </div>
        <p className="text-sm text-gray-400">{bills?.length ?? 0} active bills</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bills && bills.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {bills.map((bill) => {
              const isDueSoon = bill.due_day >= today && bill.due_day <= today + 5
              const isOverdue = bill.due_day < today
              const category = bill.categories as { name: string; icon: string } | null
              return (
                <div key={bill.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon ?? '📄'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {bill.recurrence} · Due {bill.due_day}{getDaySuffix(bill.due_day)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDueSoon && !isOverdue && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Due soon</span>
                    )}
                    {isOverdue && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Overdue</span>
                    )}
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(bill.amount), bill.currency)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No bills tracked</p>
            <p className="text-gray-400 text-xs mt-1">Add your subscriptions and recurring payments</p>
          </div>
        )}
      </div>
    </div>
  )
}
