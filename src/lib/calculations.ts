import type { Expense, FinanceData, Investment, IncomeEntry } from '../types'

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

export function netWorth(data: FinanceData): number {
  const cash = totalIncomeRecorded(data.incomes) - totalExpenses(data.expenses)
  return cash + totalCurrentValue(data.investments)
}
