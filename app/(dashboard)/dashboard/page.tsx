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

/** Shared dark panel tokens, matching Accounts and Transactions. */
const PANEL = {
  bg: '#0d1017',
  border: 'rgba(148,163,184,0.13)',
  heading: '#f1f5f9',
  muted: 'rgba(148,163,184,0.75)',
  faint: 'rgba(148,163,184,0.6)',
}

function Section({ title, kicker, action, children }: {
  title: string; kicker?: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl p-6" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="min-w-0">
          {kicker && (
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>
              {kicker}
            </p>
          )}
          <h2 className="text-sm font-bold" style={{ color: PANEL.heading }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ msg, href, cta }: { msg: string; href?: string; cta?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm mb-3" style={{ color: PANEL.muted }}>{msg}</p>
      {href && cta && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:-translate-y-0.5"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
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
      className="text-xs font-semibold flex items-center gap-0.5 transition-colors group flex-shrink-0"
      style={{ color: '#34d399' }}
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

  // Largest single expense this month. More useful than a daily average, which
  // is meaningless in the first days of a month.
  const biggest = (txns ?? [])
    .filter(t => t.type === 'expense')
    .reduce<{ amount: number; label: string } | null>((max, t) => {
      const v = Number(t.amount_in_base)
      return v > (max?.amount ?? 0) ? { amount: v, label: t.merchant ?? t.note ?? 'Transaction' } : max
    }, null)

  const kpis: HeroKpi[] = [
    { key: 'in',  label: 'Income',         value: income,   color: '#3b82f6', icon: 'up' },
    { key: 'out', label: 'Expenses',       value: expenses, color: '#f43f5e', icon: 'down' },
    { key: 'net', label: 'Net this month', value: net,      color: '#8b5cf6', icon: 'spark',
      note: net >= 0 ? 'Positive cash flow' : 'Spending more than earning' },
    { key: 'big', label: 'Biggest expense', value: biggest?.amount ?? 0, color: '#10b981', icon: 'wallet',
      note: biggest ? biggest.label : 'Nothing spent yet' },
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
        <Section kicker="Where it sits" title="Accounts" action={accounts?.length ? <ViewAll href="/dashboard/accounts" /> : undefined}>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-1 -mx-2">
              {accounts.map(acc => (
                <Link
                  key={acc.id}
                  href="/dashboard/accounts"
                  className="flex items-center justify-between px-2 py-2 rounded-xl transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: acc.color, boxShadow: `0 6px 18px -8px ${acc.color}` }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: PANEL.heading }}>{acc.name}</p>
                      <p className="text-xs capitalize" style={{ color: PANEL.faint }}>{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: '#ffffff' }}>
                    {formatCurrency(Number(acc.balance), acc.currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <Empty msg="No accounts yet" href="/dashboard/accounts" cta="Add account" />
          )}
        </Section>

        <Section kicker="What it's for" title="Goals" action={goals?.length ? <ViewAll href="/dashboard/goals" /> : undefined}>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(g => {
                const pct = g.target_amount > 0
                  ? Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100)
                  : 0
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: PANEL.heading }}>{g.emoji} {g.title}</span>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: '#34d399' }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.12)' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px]" style={{ color: PANEL.faint }}>{formatCurrency(Number(g.saved_amount), g.currency)}</span>
                      <span className="text-[11px]" style={{ color: PANEL.faint }}>{formatCurrency(Number(g.target_amount), g.currency)}</span>
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
      <Section kicker="This month" title="Recent transactions" action={txns?.length ? <ViewAll href="/dashboard/transactions" /> : undefined}>
        {txns && txns.length > 0 ? (
          <div className="-mx-1">
            {txns.slice(0, 6).map(t => {
              const isIncome = t.type === 'income'
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-100 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isIncome ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.12)',
                        color:      isIncome ? '#34d399' : '#fb7185',
                      }}
                    >
                      {isIncome ? '+' : '−'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: PANEL.heading }}>{t.merchant ?? t.note ?? 'Transaction'}</p>
                      <p className="text-[11px]" style={{ color: PANEL.faint }}>
                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold flex-shrink-0 ml-2"
                    style={{ color: isIncome ? '#34d399' : '#fb7185' }}
                  >
                    {isIncome ? '+' : '−'}{formatCurrency(Number(t.amount_in_base), cur)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty msg="No transactions this month" href="/dashboard/transactions" cta="Add transaction" />
        )}
      </Section>

    </div>
  )
}
