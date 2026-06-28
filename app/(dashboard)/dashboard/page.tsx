import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'

type StatCardProps = {
  label: string
  value: string
  icon: React.ReactNode
  accent: string
  sub?: string
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div
      className="card-light rounded-2xl p-5 group"
      style={{ borderRadius: '16px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: accent + '15' }}
        >
          <div style={{ color: accent }}>{icon}</div>
        </div>
      </div>
      <p className="text-[28px] font-black tracking-tight" style={{ color: '#0a0a0a', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{sub}</p>}
    </div>
  )
}

function EmptyState({ message, cta, href }: { message: string; cta?: string; href?: string }) {
  return (
    <div className="text-center py-10">
      <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{message}</p>
      {cta && href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981' }}
        >
          <Plus className="w-3.5 h-3.5" /> {cta}
        </Link>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: accounts }, { data: goals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('accounts').select('*').eq('user_id', user!.id),
    supabase.from('goals').select('*').eq('user_id', user!.id).eq('status', 'active').limit(3),
  ])

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStr = startOfMonth.toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const currency = profile?.base_currency ?? 'INR'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalBalance = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const income      = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const expenses    = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0a0a0a', letterSpacing: '-0.02em' }}>
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
          style={{ background: '#10b981', color: '#000' }}
          onMouseEnter={undefined}
        >
          <Plus className="w-4 h-4" /> Add transaction
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net worth"        value={formatCurrency(totalBalance, currency)} icon={<Wallet className="w-4 h-4" />}       accent="#10b981" />
        <StatCard label="Income this month"  value={formatCurrency(income, currency)}       icon={<TrendingUp className="w-4 h-4" />}    accent="#3b82f6" />
        <StatCard label="Expenses this month" value={formatCurrency(expenses, currency)}     icon={<TrendingDown className="w-4 h-4" />}  accent="#f43f5e" />
        <StatCard label="Net this month"    value={formatCurrency(income - expenses, currency)} icon={<Sparkles className="w-4 h-4" />} accent="#8b5cf6" sub={income - expenses >= 0 ? 'Positive cash flow' : 'Spending more than earning'} />
      </div>

      {/* Accounts + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Accounts */}
        <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Accounts</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981' }}>
              {accounts?.length ?? 0} total
            </span>
          </div>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111' }}>{acc.name}</p>
                      <p className="text-xs capitalize" style={{ color: '#9ca3af' }}>{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#0a0a0a' }}>
                    {formatCurrency(Number(acc.balance), acc.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No accounts yet" cta="Add account" href="/dashboard/settings" />
          )}
        </div>

        {/* Goals */}
        <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Active goals</h2>
            <Link href="/dashboard/goals" className="text-xs font-semibold" style={{ color: '#10b981' }}>View all →</Link>
          </div>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(goal => {
                const pct = goal.target_amount > 0
                  ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{goal.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: '#111' }}>{goal.title}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#10b981' }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: '#f3f4f6' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px]" style={{ color: '#9ca3af' }}>{formatCurrency(Number(goal.saved_amount), goal.currency)}</span>
                      <span className="text-[11px]" style={{ color: '#9ca3af' }}>{formatCurrency(Number(goal.target_amount), goal.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="No active goals" cta="Create goal" href="/dashboard/goals" />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-light rounded-2xl p-6" style={{ borderRadius: '16px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold" style={{ color: '#0a0a0a' }}>Recent transactions</h2>
          <Link href="/dashboard/transactions" className="text-xs font-semibold" style={{ color: '#10b981' }}>View all →</Link>
        </div>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-1">
            {transactions.slice(0, 6).map(txn => (
              <div
                key={txn.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 group"
                style={{ marginLeft: '-12px', marginRight: '-12px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      background: txn.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.10)',
                      color: txn.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {txn.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111' }}>
                      {txn.merchant ?? txn.note ?? 'Transaction'}
                    </p>
                    <p className="text-[11px]" style={{ color: '#9ca3af' }}>
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: txn.type === 'income' ? '#10b981' : '#f43f5e' }}
                >
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount_in_base), currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No transactions this month" cta="Add transaction" href="/dashboard/transactions" />
        )}
      </div>

    </div>
  )
}
