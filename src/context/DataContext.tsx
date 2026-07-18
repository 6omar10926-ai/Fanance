import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Expense, FinanceData, Investment, IncomeEntry, Payment } from '../types'
import { seedData } from '../lib/seed'

const STORAGE_KEY = 'fanance-data-v1'

function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FinanceData
  } catch {
    // ignore corrupted storage
  }
  return seedData
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface DataContextValue extends FinanceData {
  addExpense: (e: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
  addInvestment: (i: Omit<Investment, 'id'>) => void
  removeInvestment: (id: string) => void
  addIncome: (i: Omit<IncomeEntry, 'id'>) => void
  removeIncome: (id: string) => void
  addPayment: (p: Omit<Payment, 'id'>) => void
  removePayment: (id: string) => void
  updatePaymentStatus: (id: string, status: Payment['status']) => void
  resetToSampleData: () => void
  clearAllData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(loadData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const value: DataContextValue = {
    ...data,
    addExpense: (e) => setData((d) => ({ ...d, expenses: [{ ...e, id: genId() }, ...d.expenses] })),
    removeExpense: (id) => setData((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) })),
    addInvestment: (i) => setData((d) => ({ ...d, investments: [{ ...i, id: genId() }, ...d.investments] })),
    removeInvestment: (id) => setData((d) => ({ ...d, investments: d.investments.filter((x) => x.id !== id) })),
    addIncome: (i) => setData((d) => ({ ...d, incomes: [{ ...i, id: genId() }, ...d.incomes] })),
    removeIncome: (id) => setData((d) => ({ ...d, incomes: d.incomes.filter((x) => x.id !== id) })),
    addPayment: (p) => setData((d) => ({ ...d, payments: [{ ...p, id: genId() }, ...d.payments] })),
    removePayment: (id) => setData((d) => ({ ...d, payments: d.payments.filter((x) => x.id !== id) })),
    updatePaymentStatus: (id, status) =>
      setData((d) => ({
        ...d,
        payments: d.payments.map((p) => (p.id === id ? { ...p, status } : p)),
      })),
    resetToSampleData: () => setData(seedData),
    clearAllData: () => setData({ expenses: [], investments: [], incomes: [], payments: [] }),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useFinanceData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useFinanceData must be used within DataProvider')
  return ctx
}
