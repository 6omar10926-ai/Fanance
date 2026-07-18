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
  date: string // ISO date received
  source: string
  frequency: IncomeFrequency
  amount: number
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
}
