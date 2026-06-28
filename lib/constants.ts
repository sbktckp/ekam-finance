export const APP_NAME = 'Ekam Finance'
export const APP_DESCRIPTION = 'One place for all your finances'

export const CURRENCIES = [
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
] as const

export const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings' },
  { value: 'checking', label: 'Checking' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
] as const

export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'etf', label: 'ETF' },
  { value: 'bond', label: 'Bond' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
] as const

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  stock: 'Stock',
  mutual_fund: 'Mutual Fund',
  crypto: 'Crypto',
  etf: 'ETF',
  bond: 'Bond',
  real_estate: 'Real Estate',
  other: 'Other',
}
