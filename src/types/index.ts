// ============================================================
// CashFlow — TypeScript Types
// ============================================================

export type TransactionType = 'income' | 'expense'

export type IncomeCategory =
  | 'Gaji'
  | 'Freelance'
  | 'Investasi'
  | 'Bisnis'
  | 'Hadiah'
  | 'Tabungan'
  | 'Lainnya'

export type ExpenseCategory =
  | 'Makanan'
  | 'Transport'
  | 'Belanja'
  | 'Tagihan'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Lainnya'

export type Category = IncomeCategory | ExpenseCategory

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'investment' | 'savings' | 'other'

export type FundType = 'bank' | 'ewallet' | 'cash'

export type Period = 'all' | 'day' | 'week' | 'month' | 'year'

// ============================================================
// Database row types (sesuai schema Supabase)
// ============================================================

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category: Category
  fund_type: FundType
  date: string // ISO date string: "2025-04-19"
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  tracked_categories: IncomeCategory[]
  created_at: string
}

export interface Settings {
  user_id: string
  spend_limit: number
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}

// ============================================================
// App-level computed types
// ============================================================

export interface GoalWithProgress extends Goal {
  saved_amount: number
  percentage: number
}

export interface CategorySummary {
  category: Category
  total: number
  percentage: number
}

export interface PeriodSummary {
  income: number
  expense: number
  balance: number
}

// ============================================================
// Form input types
// ============================================================

export interface TransactionInput {
  type: TransactionType
  amount: number
  description: string
  category: Category
  fund_type: FundType
  date: string
}

export interface GoalInput {
  name: string
  target_amount: number
  tracked_categories: IncomeCategory[]
}
