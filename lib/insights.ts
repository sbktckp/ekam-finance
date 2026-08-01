/**
 * Deterministic finance coach.
 * Every number here comes from the user's own rows. No estimates, no averages
 * borrowed from elsewhere. When there is not enough history to say something
 * honestly, the engine says so instead of guessing.
 */

export type Txn = {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount_in_base: number | string
  date: string
  category_id: string | null
  merchant: string | null
}

export type AccountRow = { id: string; name: string; type: string; balance: number | string }
export type BudgetRow = { id: string; category_id: string | null; limit_amount: number | string; month: string }
export type GoalRow = {
  id: string; title: string; emoji: string
  target_amount: number | string; saved_amount: number | string
  deadline: string | null; monthly_contribution: number | string | null; status: string
}
export type CategoryRow = { id: string; name: string; icon: string; color: string }

export type Leak = {
  id: string
  kind: 'recurring' | 'small_drag' | 'round_trip' | 'concentration'
  title: string
  detail: string
  monthlyAmount: number
  annualAmount: number
  severity: 'high' | 'medium' | 'low'
}

export type BudgetPace = {
  id: string
  name: string
  icon: string
  color: string
  limit: number
  spent: number
  projected: number
  pctUsed: number
  status: 'over' | 'at_risk' | 'on_track'
}

export type GoalImpact = {
  id: string
  title: string
  emoji: string
  remaining: number
  monthsAtCurrentPace: number | null
  monthsIfLeakFixed: number | null
  deadline: string | null
  onTrack: boolean | null
}

export type Coach = {
  monthLabel: string
  elapsedDays: number
  daysInMonth: number
  daysLeft: number
  spentSoFar: number
  incomeSoFar: number
  projectedSpend: number
  projectedNet: number
  safeDailySpend: number | null
  dailyBurn: number
  liquid: number
  runwayDays: number | null
  runwayDate: string | null
  leaks: Leak[]
  budgets: BudgetPace[]
  goals: GoalImpact[]
  confidence: 'low' | 'medium' | 'high'
  confidenceNote: string
  headline: string
}

const n = (v: number | string | null | undefined) => Number(v ?? 0)

function localYmd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

/** Collapse merchant strings that are the same vendor with noise attached. */
export function normalizeMerchant(raw: string | null): string {
  return (raw ?? 'Other')
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .replace(/\b(pvt|ltd|limited|private|india|campus|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'other'
}

function prettyMerchant(raw: string | null): string {
  const s = (raw ?? 'Other').trim()
  return s.length > 28 ? `${s.slice(0, 27)}\u2026` : s
}

export function buildCoach(opts: {
  txns: Txn[]
  accounts: AccountRow[]
  budgets: BudgetRow[]
  goals: GoalRow[]
  categories: CategoryRow[]
  now: Date
}): Coach {
  const { txns, accounts, budgets, goals, categories, now } = opts

  const monthStart = localYmd(new Date(now.getFullYear(), now.getMonth(), 1))
  const monthEnd = localYmd(new Date(now.getFullYear(), now.getMonth() + 1, 1))
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const elapsedDays = now.getDate()
  const daysLeft = daysInMonth - elapsedDays

  const monthTxns = txns.filter(t => t.date >= monthStart && t.date < monthEnd)
  const monthExpenses = monthTxns.filter(t => t.type === 'expense')
  const spentSoFar = monthExpenses.reduce((s, t) => s + n(t.amount_in_base), 0)
  const incomeSoFar = monthTxns
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + n(t.amount_in_base), 0)

  const projectedSpend = elapsedDays > 0 ? (spentSoFar / elapsedDays) * daysInMonth : 0
  const projectedNet = incomeSoFar - projectedSpend

  // Liquid balance across spendable accounts
  const liquid = accounts
    .filter(a => ['checking', 'savings', 'cash'].includes(a.type))
    .reduce((s, a) => s + n(a.balance), 0)

  // Burn rate from the last 30 days, which spans month boundaries
  const since30 = localYmd(addDays(now, -30))
  const last30Spend = txns
    .filter(t => t.type === 'expense' && t.date >= since30)
    .reduce((s, t) => s + n(t.amount_in_base), 0)
  const dailyBurn = last30Spend / 30

  const runwayDays = dailyBurn > 0 && liquid > 0 ? Math.floor(liquid / dailyBurn) : null
  const runwayDate = runwayDays !== null
    ? addDays(now, runwayDays).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null

  const safeDailySpend = daysLeft > 0 && liquid > 0 ? liquid / daysLeft : null

  // Leaks
  const leaks: Leak[] = []
  const since60 = localYmd(addDays(now, -60))
  const recent = txns.filter(t => t.date >= since60)
  const recentExpenses = recent.filter(t => t.type === 'expense')

  // 1. Recurring merchants
  const byMerchant = new Map<string, { label: string; total: number; count: number }>()
  recentExpenses.forEach(t => {
    const key = normalizeMerchant(t.merchant)
    const cur = byMerchant.get(key) ?? { label: prettyMerchant(t.merchant), total: 0, count: 0 }
    cur.total += n(t.amount_in_base)
    cur.count += 1
    byMerchant.set(key, cur)
  })
  Array.from(byMerchant.entries())
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3)
    .forEach(([key, v]) => {
      const monthly = v.total / 2 // 60 day window
      leaks.push({
        id: `recurring-${key}`,
        kind: 'recurring',
        title: v.label,
        detail: `${v.count} visits in 60 days, averaging ${Math.round(v.total / v.count)} each time`,
        monthlyAmount: monthly,
        annualAmount: monthly * 12,
        severity: monthly > spentSoFar * 0.15 ? 'high' : monthly > spentSoFar * 0.07 ? 'medium' : 'low',
      })
    })

  // 2. Small transaction drag
  const smalls = monthExpenses.filter(t => n(t.amount_in_base) < 100)
  const smallTotal = smalls.reduce((s, t) => s + n(t.amount_in_base), 0)
  if (smalls.length >= 5) {
    const pct = spentSoFar > 0 ? (smallTotal / spentSoFar) * 100 : 0
    const monthly = elapsedDays > 0 ? (smallTotal / elapsedDays) * daysInMonth : smallTotal
    leaks.push({
      id: 'small-drag',
      kind: 'small_drag',
      title: 'Small spends add up',
      detail: `${smalls.length} payments under 100 this month, ${Math.round(pct)}% of everything you spent`,
      monthlyAmount: monthly,
      annualAmount: monthly * 12,
      severity: pct > 40 ? 'high' : pct > 20 ? 'medium' : 'low',
    })
  }

  // 3. Peer to peer round trips, which are settlements rather than real spend
  const roundTrips: { label: string; amount: number }[] = []
  const incomeRecent = recent.filter(t => t.type === 'income')
  recentExpenses.forEach(e => {
    const match = incomeRecent.find(i =>
      normalizeMerchant(i.merchant) === normalizeMerchant(e.merchant) &&
      Math.abs(n(i.amount_in_base) - n(e.amount_in_base)) < 1 &&
      Math.abs(new Date(i.date).getTime() - new Date(e.date).getTime()) <= 3 * 86400000,
    )
    if (match && !roundTrips.some(r => r.label === prettyMerchant(e.merchant) && r.amount === n(e.amount_in_base))) {
      roundTrips.push({ label: prettyMerchant(e.merchant), amount: n(e.amount_in_base) })
    }
  })
  if (roundTrips.length > 0) {
    const total = roundTrips.reduce((s, r) => s + r.amount, 0)
    leaks.push({
      id: 'round-trips',
      kind: 'round_trip',
      title: 'Settlements counted as spending',
      detail: `${roundTrips.length} paired in and out payments (${roundTrips.slice(0, 2).map(r => r.label).join(', ')}). These are people paying each other back, not real expenses.`,
      monthlyAmount: total,
      annualAmount: 0,
      severity: 'medium',
    })
  }

  // 4. Category concentration
  const catTotals = new Map<string, number>()
  monthExpenses.forEach(t => {
    const k = t.category_id ?? '__none__'
    catTotals.set(k, (catTotals.get(k) ?? 0) + n(t.amount_in_base))
  })
  const topCat = Array.from(catTotals.entries()).sort((a, b) => b[1] - a[1])[0]
  if (topCat && spentSoFar > 0) {
    const share = (topCat[1] / spentSoFar) * 100
    if (share >= 45) {
      const cat = categories.find(c => c.id === topCat[0])
      leaks.push({
        id: `concentration-${topCat[0]}`,
        kind: 'concentration',
        title: `${cat?.icon ?? ''} ${cat?.name ?? 'One category'} dominates`,
        detail: `${Math.round(share)}% of this month's spending sits in a single category. Trimming it moves the needle more than anything else.`,
        monthlyAmount: topCat[1],
        annualAmount: topCat[1] * 12,
        severity: share >= 65 ? 'high' : 'medium',
      })
    }
  }

  leaks.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 }
    return rank[a.severity] - rank[b.severity] || b.monthlyAmount - a.monthlyAmount
  })

  // Budget pacing
  const monthBudgets = budgets.filter(b => b.month.slice(0, 7) === monthStart.slice(0, 7))
  const expectedPct = (elapsedDays / daysInMonth) * 100
  const budgetPace: BudgetPace[] = monthBudgets.map(b => {
    const spent = monthExpenses
      .filter(t => t.category_id === b.category_id)
      .reduce((s, t) => s + n(t.amount_in_base), 0)
    const limit = n(b.limit_amount)
    const projected = elapsedDays > 0 ? (spent / elapsedDays) * daysInMonth : 0
    const pctUsed = limit > 0 ? (spent / limit) * 100 : 0
    const cat = categories.find(c => c.id === b.category_id)
    return {
      id: b.id,
      name: cat?.name ?? 'Uncategorized',
      icon: cat?.icon ?? '\u{1F4E6}',
      color: cat?.color ?? '#f43f5e',
      limit,
      spent,
      projected,
      pctUsed,
      status: pctUsed >= 100 ? 'over' : projected > limit || pctUsed > expectedPct + 15 ? 'at_risk' : 'on_track',
    }
  }).sort((a, b) => b.pctUsed - a.pctUsed)

  // Goal impact
  const topLeak = leaks.find(l => l.kind === 'recurring' || l.kind === 'small_drag')
  const monthlySurplus = incomeSoFar - projectedSpend
  const surplusIfFixed = monthlySurplus + (topLeak ? topLeak.monthlyAmount * 0.3 : 0)

  const goalImpact: GoalImpact[] = goals
    .filter(g => g.status === 'active')
    .map(g => {
      const remaining = Math.max(n(g.target_amount) - n(g.saved_amount), 0)
      const pace = n(g.monthly_contribution) > 0 ? n(g.monthly_contribution) : monthlySurplus
      const months = pace > 0 ? remaining / pace : null
      const monthsFixed = surplusIfFixed > 0 ? remaining / Math.max(surplusIfFixed, pace) : null
      let onTrack: boolean | null = null
      if (g.deadline && months !== null) {
        const monthsToDeadline =
          (new Date(g.deadline).getTime() - now.getTime()) / (30.44 * 86400000)
        onTrack = months <= monthsToDeadline
      }
      return {
        id: g.id,
        title: g.title,
        emoji: g.emoji,
        remaining,
        monthsAtCurrentPace: months !== null && isFinite(months) ? months : null,
        monthsIfLeakFixed: monthsFixed !== null && isFinite(monthsFixed) ? monthsFixed : null,
        deadline: g.deadline,
        onTrack,
      }
    })

  // Confidence
  const distinctMonths = new Set(txns.map(t => t.date.slice(0, 7))).size
  let confidence: Coach['confidence'] = 'low'
  let confidenceNote = ''
  if (distinctMonths >= 6 && txns.length >= 300) {
    confidence = 'high'
    confidenceNote = `Based on ${distinctMonths} months of your records.`
  } else if (distinctMonths >= 3 && txns.length >= 80) {
    confidence = 'medium'
    confidenceNote = `Based on ${distinctMonths} months. Patterns are forming but not settled.`
  } else {
    confidence = 'low'
    confidenceNote = `Only ${distinctMonths} month${distinctMonths === 1 ? '' : 's'} of records so far, so treat comparisons as early signals rather than trends.`
  }

  // Headline
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long' })
  let headline: string
  if (spentSoFar === 0 && incomeSoFar === 0) {
    headline = `Nothing logged in ${monthLabel} yet. Add a few transactions and the coaching starts.`
  } else if (runwayDays !== null && runwayDays < daysLeft) {
    headline = `At your current pace your money runs out around ${runwayDate}, ${daysLeft - runwayDays} days before ${monthLabel} ends.`
  } else if (projectedNet < 0) {
    headline = `You are on track to spend more than you took in this month by about ${Math.round(Math.abs(projectedNet))}.`
  } else if (safeDailySpend !== null) {
    headline = `You can spend about ${Math.round(safeDailySpend)} a day for the rest of ${monthLabel} and still finish above zero.`
  } else {
    headline = `${monthLabel} is on track.`
  }

  return {
    monthLabel, elapsedDays, daysInMonth, daysLeft,
    spentSoFar, incomeSoFar, projectedSpend, projectedNet,
    safeDailySpend, dailyBurn, liquid, runwayDays, runwayDate,
    leaks: leaks.slice(0, 4),
    budgets: budgetPace,
    goals: goalImpact,
    confidence, confidenceNote, headline,
  }
}
