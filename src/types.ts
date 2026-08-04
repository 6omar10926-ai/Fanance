export type ExpenseCategory =
  | 'طعام وشراب'
  | 'مواصلات'
  | 'سكن'
  | 'فواتير'
  | 'تسوق'
  | 'صحة'
  | 'ترفيه'
  | 'تعليم'
  | 'أقساط'
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
  platform?: string // the platform/broker the investment is held on
  amountInvested: number // capital put in (رأس المال)
  currentValue: number // expected total value (المبلغ الإجمالي المتوقع)
  date: string // ISO start date
  endDate?: string // ISO date the investment matures / ends
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

// 'لي' = money others owe me (I lent it out)
// 'عليّ' = money I owe others (I borrowed it)
export type DebtDirection = 'لي' | 'عليّ'

// A single (possibly partial) payment logged against a debt. When it was
// counted as an expense too, expenseId links to the created expense so the
// two stay in sync (deleting the payment removes that expense).
export interface DebtPayment {
  id: string
  date: string // ISO date the payment happened
  amount: number
  note?: string
  expenseId?: string // linked expense doc id, when logged as a monthly expense
}

export interface Debt {
  id: string
  direction: DebtDirection
  person: string // the other party's name
  amount: number // original total of the debt
  date: string // ISO date the debt was created
  dueDate?: string // ISO expected settlement date (optional)
  installment?: number // optional monthly installment amount (for loans)
  payments: DebtPayment[] // partial payments / installments logged over time
  notes?: string
  settled?: boolean // legacy flag from older records; superseded by payments
}

export interface FinanceData {
  expenses: Expense[]
  investments: Investment[]
  incomes: IncomeEntry[]
  payments: Payment[]
  goals: IncomeGoal[]
  debts: Debt[]
}
