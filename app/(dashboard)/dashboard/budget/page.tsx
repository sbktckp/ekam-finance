import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name, icon, color)')
    .eq('user_id', user!.id)
    .eq('month', monthStr)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('category_id, amount_in_base')
    .eq('user_id', user!.id)
    .eq('type', 'expense')
    .gte('date', monthStr)

  const spendingByCategory: Record<string, number> = {}
  transactions?.forEach((t) => {
    if (t.category_id) {
      spendingByCategory[t.category_id] = (spendingByCategory[t.category_id] ?? 0) + Number(t.amount_in_base)
    }
  })

  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget</h1>
          <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + Set budget
        </button>
      </div>

      <div className="grid gap-4">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => {
            const category = budget.categories as { name: string; icon: string } | null
            const spent = budget.category_id ? (spendingByCategory[budget.category_id] ?? 0) : 0
            const limit = Number(budget.limit_amount)
            const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const isOver = spent > limit
            return (
              <div key={budget.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category?.icon ?? '📦'}</span>
                    <span className="text-sm font-medium text-gray-900">{category?.name ?? 'Category'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(spent, 'INR')}
                    </span>
                    <span className="text-xs text-gray-500"> / {formatCurrency(limit, 'INR')}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% used</p>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No budgets set for this month</p>
            <p className="text-gray-400 text-xs mt-1">Set spending limits by category to stay on track</p>
          </div>
        )}
      </div>
    </div>
  )
}
