export type ExpenseCategory =
  | 'طعام وشراب'
  | 'مواصلات'
  | 'سكن'
  | 'فواتير'
  | 'تسوق'
  | 'صحة'
  | 'ترفيه'
  | 'تعليم'
  | 'أخرى'

export interface Expense {
  id: string
  date: string // ISO date
  category: ExpenseCategory
  description: string
  amount: number
}

export type InvestmentType =
  | 'أسهم'
  | 'صناديق استثمار'
  | 'عقار'
  | 'ذهب ومعادن'
  | 'عملات رقمية'
  | 'ودائع بنكية'
  | 'أخرى'

export interface Investment {
  id: string
  name: string
  type: InvestmentType
  amountInvested: number
  currentValue: number
  date: string // ISO date acquired
  notes?: string
}

export type IncomeFrequency = 'شهري' | 'سنوي' | 'مرة واحدة'

export interface IncomeEntry {
  id: string
  date: string // ISO date received (or start date)
  source: string
  frequency: IncomeFrequency
  amount: number
  payDay?: number // day of month (1-31) the income lands, for شهري
}

// A single deposit logged against an income challenge — each time money
// actually lands from the challenge's source.
export interface GoalContribution {
  id: string
  date: string // ISO date the amount was received
  amount: number
  note?: string
}

// An income challenge: a target amount to collect from a source within an
// optional deadline, filled up over time by logging contributions.
export interface IncomeGoal {
  id: string
  title: string
  source?: string // e.g. عقار، عمل حر
  targetAmount: number
  startDate: string // ISO date the challenge started
  deadline?: string // ISO date to hit the target by (optional)
  contributions: GoalContribution[]
}

export type PaymentStatus = 'مدفوع' | 'مستحق' | 'متأخر'

export interface Payment {
  id: string
  name: string
  amount: number
  dueDate: string // ISO date
  status: PaymentStatus
  recurring: boolean
  category: string
}

export interface FinanceData {
  expenses: Expense[]
  investments: Investment[]
  incomes: IncomeEntry[]
  payments: Payment[]
  goals: IncomeGoal[]
}
