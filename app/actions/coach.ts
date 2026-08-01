'use server'
import { createClient } from '@/lib/supabase/server'
import type { Coach } from '@/lib/insights'

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5'
const API_URL = 'https://api.anthropic.com/v1/messages'

export type CoachNote = {
  note: string | null
  source: 'cached' | 'fresh' | 'unavailable'
  reason?: string
}

const SYSTEM = `You are a personal finance coach inside a budgeting app used by a university student in India. Amounts are in rupees.

You are given a JSON summary of the user's own transaction data, already computed. Your job is to turn it into 2 to 3 short sentences of coaching.

Rules:
- Use only the numbers in the JSON. Never invent a figure, a merchant, or a trend.
- If confidence is "low", say plainly that there is not enough history yet and keep advice general. Do not describe two months of data as a trend.
- Be specific and concrete. "Your 12 canteen visits cost 840 a month" beats "consider reducing discretionary spending".
- One actionable suggestion, sized to the actual amounts. This person spends in tens and hundreds of rupees, not thousands. Do not suggest cutting subscriptions they do not have or investing money they do not have.
- Never moralise, never use guilt, never congratulate emptily.
- No preamble, no headings, no bullet points, no markdown. Plain sentences only.
- Do not use dashes of any kind for punctuation.`

export async function getCoachNote(coach: Coach): Promise<CoachNote> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { note: null, source: 'unavailable', reason: 'Not authenticated' }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Reuse today's note rather than paying for a fresh call on every page load.
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .eq('type', 'saving_tip')
    .eq('is_dismissed', false)
    .gte('generated_at', todayStart.toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached?.content) return { note: cached.content, source: 'cached' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { note: null, source: 'unavailable', reason: 'ANTHROPIC_API_KEY is not set' }
  }

  // Send only the computed summary, never raw transaction rows.
  const payload = {
    confidence: coach.confidence,
    monthLabel: coach.monthLabel,
    daysElapsed: coach.elapsedDays,
    daysLeft: coach.daysLeft,
    spentSoFar: Math.round(coach.spentSoFar),
    incomeSoFar: Math.round(coach.incomeSoFar),
    projectedSpend: Math.round(coach.projectedSpend),
    projectedNet: Math.round(coach.projectedNet),
    liquidBalance: Math.round(coach.liquid),
    dailyBurn: Math.round(coach.dailyBurn),
    runwayDays: coach.runwayDays,
    safeDailySpend: coach.safeDailySpend ? Math.round(coach.safeDailySpend) : null,
    leaks: coach.leaks.map(l => ({
      what: l.title,
      detail: l.detail,
      perMonth: Math.round(l.monthlyAmount),
      severity: l.severity,
    })),
    budgetsOverOrAtRisk: coach.budgets
      .filter(b => b.status !== 'on_track')
      .map(b => ({ category: b.name, limit: b.limit, spent: Math.round(b.spent), projected: Math.round(b.projected) })),
    goals: coach.goals.map(g => ({
      title: g.title,
      remaining: Math.round(g.remaining),
      monthsAtCurrentPace: g.monthsAtCurrentPace ? Math.round(g.monthsAtCurrentPace * 10) / 10 : null,
    })),
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: 'user', content: JSON.stringify(payload) }],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Coach note failed', res.status, body)
      return { note: null, source: 'unavailable', reason: `API returned ${res.status}` }
    }

    const data = await res.json()
    const note: string = (data.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join(' ')
      .trim()

    if (!note) return { note: null, source: 'unavailable', reason: 'Empty response' }

    await supabase.from('ai_insights').insert({
      user_id: user.id,
      type: 'saving_tip',
      content: note,
      data: payload,
    })

    return { note, source: 'fresh' }
  } catch (err) {
    console.error('Coach note error', err)
    return { note: null, source: 'unavailable', reason: 'Request failed' }
  }
}

export async function dismissCoachNotes(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('ai_insights')
    .update({ is_dismissed: true })
    .eq('user_id', user.id)
    .eq('type', 'saving_tip')
    .eq('is_dismissed', false)
}
