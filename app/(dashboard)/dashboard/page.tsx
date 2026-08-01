import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getGreeting } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DashboardHero, type HeroKpi } from './dashboard-hero'

/** Local-date YYYY-MM-DD. toISOString() shifts IST midnight back a day. */
function localYmd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
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
      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors group"
    >
      View all
      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const monthStr = (() => {
    const d = new Date()
    return localYmd(new Date(d.getFullYear(), d.getMonth(), 1))
  })()

  /*
   * All four reads fire together and each one selects only the columns the
   * page renders. Transfers are excluded from the feed and the KPIs: they move
   * money between your own accounts, so they are neither income nor expense.
   */
  const [{ data: profile }, { data: accounts }, { data: goals }, { data: txns }] = await Promise.all([
    supabase.from('profiles').select('full_name, base_currency').eq('id', user!.id).single(),
    supabase.from('accounts').select('id, name, type, balance, currency, color').eq('user_id', user!.id),
    supabase.from('goals')
      .select('id, title, emoji, target_amount, saved_amount, currency')
      .eq('user_id', user!.id).eq('status', 'active').limit(3),
    supabase.from('transactions')
      .select('id, type, amount_in_base, date, merchant, note')
      .eq('user_id', user!.id)
      .neq('type', 'transfer')
      .gte('date', monthStr)
      .order('date', { ascending: false })
      .limit(60),
  ])

  const cur      = profile?.base_currency ?? 'INR'
  const name     = profile?.full_name?.split(' ')[0] ?? 'there'
  const balance  = accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const income   = txns?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const expenses = txns?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount_in_base), 0) ?? 0
  const net      = income - expenses

  const kpis: HeroKpi[] = [
    { key: 'in',  label: 'Income',         value: income,   color: '#3b82f6', icon: 'up' },
    { key: 'out', label: 'Expenses',       value: expenses, color: '#f43f5e', icon: 'down' },
    { key: 'net', label: 'Net this month', value: net,      color: '#8b5cf6', icon: 'spark',
      note: net >= 0 ? 'Positive cash flow' : 'Spending more than earning' },
    { key: 'avg', label: 'Avg per day',    value: expenses / Math.max(new Date().getDate(), 1), color: '#10b981', icon: 'wallet',
      note: `over ${new Date().getDate()} days` },
  ]

  return (
    <div className="space-y-6">
      <DashboardHero
        greeting={getGreeting()}
        name={name}
        dateLabel={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        netWorth={balance}
        currency={cur}
        kpis={kpis}
        positive={net >= 0}
        intensity={income > 0 ? Math.min(expenses / income, 1) : 0.45}
      />

      {/* Accounts + Goals */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Accounts" action={accounts?.length ? <ViewAll href="/dashboard/accounts" /> : undefined}>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-1 -mx-2">
              {accounts.map(acc => (
                <Link
                  key={acc.id}
                  href="/dashboard/accounts"
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{acc.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">
                    {formatCurrency(Number(acc.balance), acc.currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <Empty msg="No accounts yet" href="/dashboard/accounts" cta="Add account" />
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
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
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
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: t.type === 'income' ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.09)',
                      color:      t.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.merchant ?? t.note ?? 'Transaction'}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold flex-shrink-0 ml-2"
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
