import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user!.id)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .limit(3)

  const currency = profile?.base_currency ?? 'INR'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalBalance = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const monthlyIncome =
    transactions?.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const monthlyExpenses =
    transactions?.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Good {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net worth" value={formatCurrency(totalBalance, currency)} icon={<Wallet className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Income this month" value={formatCurrency(monthlyIncome, currency)} icon={<TrendingUp className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Expenses this month" value={formatCurrency(monthlyExpenses, currency)} icon={<TrendingDown className="w-5 h-5" />} color="bg-red-50 text-red-600" />
        <StatCard label="Net this month" value={formatCurrency(monthlyIncome - monthlyExpenses, currency)} icon={<Target className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Accounts</h2>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: account.color + '20' }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(account.balance), account.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No accounts yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Active goals</h2>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.target_amount > 0
                  ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{goal.emoji} {goal.title}</span>
                      <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatCurrency(Number(goal.saved_amount), goal.currency)}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(Number(goal.target_amount), goal.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No active goals</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent transactions</h2>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.merchant ?? txn.note ?? 'Transaction'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount_in_base), currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No transactions this month</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
