import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Sparkles, Plus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

function KpiCard({
  label, value, icon, color, note,
}: {
  label: string; value: string; icon: React.ReactNode; color: string; note?: string;
}) {
  return (
    <div className="surface-light rounded-2xl p-5 group cursor-default">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: color + '15', color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>{value}</p>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ msg, href, cta }: { msg: string; href?: string; cta?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-gray-400 mb-3">{msg}</p>
      {href && cta && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {cta}
        </Link>
      )}
    </div>
  )
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
    >
      View all <ArrowUpRight className="w-3 h-3" />
    </Link>
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

  // Transfers are excluded — they move money between your own accounts and
  // aren't income or expense, so they don't belong in this feed or the KPIs.
  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .neq('type', 'transfer')
    .gte('date', monthStr)
    .order('date', { ascending: false })

  const cur      = profile?.base_currency ?? 'INR'
  const name     = profile?.full_name?.split(' ')[0] ?? 'there'
  const balance  = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const income   = txns?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const expenses = txns?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const net      = income - expenses

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between pb-1">
        <div>
          <h1
            className="font-black text-gray-900"
            style={{ fontSize: '22px', letterSpacing: '-0.02em' }}
          >
            Good {getGreeting()}, {name} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 hover:-translate-y-px hover:shadow-md hover:shadow-emerald-500/20 hover:bg-emerald-400"
          style={{ background: '#10b981', color: '#000' }}
        >
          <Plus className="w-4 h-4" /> Add
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Net worth"    value={formatCurrency(balance, cur)}  icon={<Wallet className="w-4 h-4" />}      color="#10b981" />
        <KpiCard label="Income"       value={formatCurrency(income, cur)}   icon={<TrendingUp className="w-4 h-4" />}  color="#3b82f6" />
        <KpiCard label="Expenses"     value={formatCurrency(expenses, cur)} icon={<TrendingDown className="w-4 h-4" />} color="#f43f5e" />
        <KpiCard
          label="Net this month"
          value={formatCurrency(net, cur)}
          icon={<Sparkles className="w-4 h-4" />}
          color="#8b5cf6"
          note={net >= 0 ? 'Positive cash flow' : 'Spending more than earning'}
        />
      </div>

      {/* Accounts + Goals */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Accounts" action={accounts?.length ? <ViewAll href="/dashboard/settings" /> : undefined}>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{acc.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(acc.balance), acc.currency)}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty msg="No accounts yet" href="/dashboard/settings" cta="Add account" />
          )}
        </Section>

        <Section title="Goals" action={goals?.length ? <ViewAll href="/dashboard/goals" /> : undefined}>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(g => {
                const pct = g.target_amount > 0
                  ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">{g.emoji} {g.title}</span>
                      <span className="text-xs font-bold text-emerald-600">{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400">{formatCurrency(Number(g.saved_amount), g.currency)}</span>
                      <span className="text-[11px] text-gray-400">{formatCurrency(Number(g.target_amount), g.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty msg="No active goals" href="/dashboard/goals" cta="Create goal" />
          )}
        </Section>
      </div>

      {/* Transactions */}
      <Section title="Recent transactions" action={txns?.length ? <ViewAll href="/dashboard/transactions" /> : undefined}>
        {txns && txns.length > 0 ? (
          <div className="-mx-1">
            {txns.slice(0, 6).map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-100 cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: t.type === 'income' ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.09)',
                      color:      t.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.merchant ?? t.note ?? 'Transaction'}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: t.type === 'income' ? '#10b981' : '#f43f5e' }}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount_in_base), cur)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty msg="No transactions this month" href="/dashboard/transactions" cta="Add transaction" />
        )}
      </Section>

    </div>
  )
}
