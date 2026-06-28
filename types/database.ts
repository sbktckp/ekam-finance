export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'other'
export type CategoryType = 'income' | 'expense' | 'both'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type InvestmentType = 'stock' | 'mutual_fund' | 'crypto' | 'etf' | 'bond' | 'real_estate' | 'other'
export type GoalStatus = 'active' | 'completed' | 'paused'
export type RecurrenceType = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type AlertType = 'budget_warning' | 'goal_milestone' | 'bill_due' | 'unusual_spend' | 'net_worth_milestone'
export type InsightType = 'spending_pattern' | 'saving_tip' | 'anomaly' | 'tax_estimate'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  base_currency: string
  tax_year_start: number
  timezone: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  color: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  type: CategoryType
  is_system: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  amount: number
  currency: string
  amount_in_base: number
  exchange_rate: number
  type: TransactionType
  category_id: string | null
  ai_category_id: string | null
  ai_confidence: number | null
  merchant: string | null
  note: string | null
  tags: string[]
  is_recurring: boolean
  recurring_id: string | null
  date: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  limit_amount: number
  month: string
  rollover: boolean
  alert_at_percent: number
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  user_id: string
  name: string
  ticker: string | null
  type: InvestmentType
  quantity: number
  avg_buy_price: number
  currency: string
  current_price: number | null
  current_price_at: string | null
  buy_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  emoji: string
  target_amount: number
  saved_amount: number
  currency: string
  deadline: string | null
  monthly_contribution: number | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  category_id: string | null
  recurrence: RecurrenceType
  due_day: number
  next_due_date: string | null
  notify_days_before: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  type: AlertType
  title: string
  message: string
  data: Json
  is_read: boolean
  created_at: string
}

export interface AiInsight {
  id: string
  user_id: string
  type: InsightType
  content: string
  data: Json
  is_dismissed: boolean
  generated_at: string
}
