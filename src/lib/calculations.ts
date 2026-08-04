import type { Debt, Expense, FinanceData, Investment, IncomeEntry, IncomeGoal } from '../types'

export function getMonthlyIncome(incomes: IncomeEntry[]): number {
  return incomes.filter((i) => i.frequency === 'شهري').reduce((s, i) => s + i.amount, 0)
}

export function getAnnualIncome(incomes: IncomeEntry[]): number {
  const monthly = getMonthlyIncome(incomes) * 12
  const yearly = incomes.filter((i) => i.frequency === 'سنوي').reduce((s, i) => s + i.amount, 0)
  const oneTime = incomes.filter((i) => i.frequency === 'مرة واحدة').reduce((s, i) => s + i.amount, 0)
  return monthly + yearly + oneTime
}

export function totalIncomeRecorded(incomes: IncomeEntry[]): number {
  return incomes.reduce((s, i) => s + i.amount, 0)
}

// Build a date clamping the day to the last valid day of the month
// (e.g. day 31 in February becomes the 28th/29th).
function buildDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Next date this income is expected to land, or null when there is no
// upcoming occurrence (a past one-time income).
export function nextIncomeDate(income: IncomeEntry, from: Date = new Date()): Date | null {
  const today = dateOnly(from)
  const base = new Date(income.date)

  if (income.frequency === 'شهري') {
    const day = income.payDay ?? base.getDate()
    let candidate = buildDate(today.getFullYear(), today.getMonth(), day)
    if (candidate < today) candidate = buildDate(today.getFullYear(), today.getMonth() + 1, day)
    return candidate
  }

  if (income.frequency === 'سنوي') {
    let candidate = buildDate(today.getFullYear(), base.getMonth(), base.getDate())
    if (candidate < today) candidate = buildDate(today.getFullYear() + 1, base.getMonth(), base.getDate())
    return candidate
  }

  // مرة واحدة: only counts down if it is still in the future
  const once = dateOnly(base)
  return once >= today ? once : null
}

// Whole days from `from` until `date` (0 = today, negative = past).
export function daysUntil(date: Date, from: Date = new Date()): number {
  return Math.round((dateOnly(date).getTime() - dateOnly(from).getTime()) / 86400000)
}

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export function expensesInMonth(expenses: Expense[], year: number, month: number): number {
  return expenses
    .filter((e) => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .reduce((s, e) => s + e.amount, 0)
}

export function expensesByCategory(expenses: Expense[]): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function investmentsByType(investments: Investment[]): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const i of investments) {
    map.set(i.type, (map.get(i.type) ?? 0) + i.currentValue)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function totalInvested(investments: Investment[]): number {
  return investments.reduce((s, i) => s + i.amountInvested, 0)
}

export function totalCurrentValue(investments: Investment[]): number {
  return investments.reduce((s, i) => s + i.currentValue, 0)
}

export function investmentReturnPct(investments: Investment[]): number {
  const invested = totalInvested(investments)
  if (invested === 0) return 0
  return ((totalCurrentValue(investments) - invested) / invested) * 100
}

export function savingsRate(income: number, expenses: number): number {
  if (income === 0) return 0
  return ((income - expenses) / income) * 100
}

export function expenseRatio(income: number, expenses: number): number {
  if (income === 0) return 0
  return (expenses / income) * 100
}

export function investmentRatio(income: number, invested: number): number {
  if (income === 0) return 0
  return (invested / income) * 100
}

export interface MonthlyPoint {
  key: string
  label: string
  income: number
  expenses: number
}

export function monthlySeries(expenses: Expense[], incomes: IncomeEntry[], months = 6): MonthlyPoint[] {
  const now = new Date()
  const points: MonthlyPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const key = `${year}-${month}`
    const label = d.toLocaleDateString('ar-SA-u-ca-gregory', { month: 'short' })
    const monthExpenses = expenses
      .filter((e) => {
        const ed = new Date(e.date)
        return ed.getFullYear() === year && ed.getMonth() === month
      })
      .reduce((s, e) => s + e.amount, 0)
    const monthIncome = incomes
      .filter((n) => {
        const nd = new Date(n.date)
        return nd.getFullYear() === year && nd.getMonth() === month
      })
      .reduce((s, n) => s + n.amount, 0)
    points.push({ key, label, income: monthIncome, expenses: monthExpenses })
  }
  return points
}

// Outstanding (unsettled) amount others owe me.
export function totalOwedToMe(debts: Debt[]): number {
  return debts.filter((d) => !d.settled && d.direction === 'لي').reduce((s, d) => s + d.amount, 0)
}

// Outstanding (unsettled) amount I owe others.
export function totalOwedByMe(debts: Debt[]): number {
  return debts.filter((d) => !d.settled && d.direction === 'عليّ').reduce((s, d) => s + d.amount, 0)
}

// Net debt position: positive = others owe me more than I owe.
export function netDebt(debts: Debt[]): number {
  return totalOwedToMe(debts) - totalOwedByMe(debts)
}

export function netWorth(data: FinanceData): number {
  const cash = totalIncomeRecorded(data.incomes) - totalExpenses(data.expenses)
  return cash + totalCurrentValue(data.investments) + netDebt(data.debts ?? [])
}

export interface GoalProgress {
  collected: number // total logged so far
  remaining: number // how much is left to reach the target (>= 0)
  percent: number // 0..100, capped at 100
  isComplete: boolean
  daysLeft: number | null // whole days until deadline, null when no deadline
  isOverdue: boolean // deadline passed while still incomplete
}

// Summarize how far along an income challenge is.
export function goalProgress(goal: IncomeGoal, from: Date = new Date()): GoalProgress {
  const collected = (goal.contributions ?? []).reduce((s, c) => s + c.amount, 0)
  const target = goal.targetAmount > 0 ? goal.targetAmount : 0
  const remaining = Math.max(0, target - collected)
  const percent = target === 0 ? 0 : Math.min(100, (collected / target) * 100)
  const isComplete = target > 0 && collected >= target
  const daysLeft = goal.deadline ? daysUntil(new Date(goal.deadline), from) : null
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isComplete
  return { collected, remaining, percent, isComplete, daysLeft, isOverdue }
}
