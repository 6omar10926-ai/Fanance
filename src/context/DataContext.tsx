import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import type {
  Expense,
  Investment,
  IncomeEntry,
  Payment,
  FinanceData,
  IncomeGoal,
  GoalContribution,
  Debt,
} from '../types'
import { seedData } from '../lib/seed'

function useUserCollection<T extends { id: string }>(uid: string, name: string): T[] {
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    const ref = collection(db, 'users', uid, name)
    const unsubscribe = onSnapshot(ref, (snap) => {
      setItems(snap.docs.map((d) => ({ ...(d.data() as Omit<T, 'id'>), id: d.id })) as T[])
    })
    return unsubscribe
  }, [uid, name])

  return items
}

interface DataContextValue extends FinanceData {
  addExpense: (e: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
  addInvestment: (i: Omit<Investment, 'id'>) => void
  removeInvestment: (id: string) => void
  addIncome: (i: Omit<IncomeEntry, 'id'>) => void
  updateIncome: (id: string, i: Omit<IncomeEntry, 'id'>) => void
  removeIncome: (id: string) => void
  addPayment: (p: Omit<Payment, 'id'>) => void
  removePayment: (id: string) => void
  updatePaymentStatus: (id: string, status: Payment['status']) => void
  addGoal: (g: Omit<IncomeGoal, 'id'>) => void
  updateGoal: (id: string, g: Omit<IncomeGoal, 'id'>) => void
  removeGoal: (id: string) => void
  addContribution: (goalId: string, c: Omit<GoalContribution, 'id'>) => void
  removeContribution: (goalId: string, contributionId: string) => void
  addDebt: (d: Omit<Debt, 'id'>) => void
  removeDebt: (id: string) => void
  setDebtSettled: (id: string, settled: boolean) => void
  loadSampleData: () => Promise<void>
  clearAllData: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user!.uid

  const expenses = useUserCollection<Expense>(uid, 'expenses')
  const investments = useUserCollection<Investment>(uid, 'investments')
  const incomes = useUserCollection<IncomeEntry>(uid, 'incomes')
  const payments = useUserCollection<Payment>(uid, 'payments')
  const goals = useUserCollection<IncomeGoal>(uid, 'goals')
  const debts = useUserCollection<Debt>(uid, 'debts')

  async function loadSampleData() {
    const batch = writeBatch(db)
    for (const e of seedData.expenses) {
      const { id, ...rest } = e
      void id
      batch.set(doc(collection(db, 'users', uid, 'expenses')), rest)
    }
    for (const i of seedData.investments) {
      const { id, ...rest } = i
      void id
      batch.set(doc(collection(db, 'users', uid, 'investments')), rest)
    }
    for (const n of seedData.incomes) {
      const { id, ...rest } = n
      void id
      batch.set(doc(collection(db, 'users', uid, 'incomes')), rest)
    }
    for (const p of seedData.payments) {
      const { id, ...rest } = p
      void id
      batch.set(doc(collection(db, 'users', uid, 'payments')), rest)
    }
    for (const g of seedData.goals) {
      const { id, ...rest } = g
      void id
      batch.set(doc(collection(db, 'users', uid, 'goals')), rest)
    }
    for (const d of seedData.debts) {
      const { id, ...rest } = d
      void id
      batch.set(doc(collection(db, 'users', uid, 'debts')), rest)
    }
    await batch.commit()
  }

  async function clearAllData() {
    const batch = writeBatch(db)
    for (const name of ['expenses', 'investments', 'incomes', 'payments', 'goals', 'debts']) {
      const snap = await getDocs(collection(db, 'users', uid, name))
      snap.forEach((d) => batch.delete(d.ref))
    }
    await batch.commit()
  }

  function addContribution(goalId: string, c: Omit<GoalContribution, 'id'>) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const contribution: GoalContribution = { ...c, id: crypto.randomUUID() }
    const contributions = [...(goal.contributions ?? []), contribution]
    void updateDoc(doc(db, 'users', uid, 'goals', goalId), { contributions })
  }

  function removeContribution(goalId: string, contributionId: string) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const contributions = (goal.contributions ?? []).filter((c) => c.id !== contributionId)
    void updateDoc(doc(db, 'users', uid, 'goals', goalId), { contributions })
  }

  const value: DataContextValue = {
    expenses,
    investments,
    incomes,
    payments,
    goals,
    debts,
    addExpense: (e) => void addDoc(collection(db, 'users', uid, 'expenses'), e),
    removeExpense: (id) => void deleteDoc(doc(db, 'users', uid, 'expenses', id)),
    addInvestment: (i) => void addDoc(collection(db, 'users', uid, 'investments'), i),
    removeInvestment: (id) => void deleteDoc(doc(db, 'users', uid, 'investments', id)),
    addIncome: (i) => void addDoc(collection(db, 'users', uid, 'incomes'), i),
    updateIncome: (id, i) => void updateDoc(doc(db, 'users', uid, 'incomes', id), i),
    removeIncome: (id) => void deleteDoc(doc(db, 'users', uid, 'incomes', id)),
    addPayment: (p) => void addDoc(collection(db, 'users', uid, 'payments'), p),
    removePayment: (id) => void deleteDoc(doc(db, 'users', uid, 'payments', id)),
    updatePaymentStatus: (id, status) => void updateDoc(doc(db, 'users', uid, 'payments', id), { status }),
    addGoal: (g) => void addDoc(collection(db, 'users', uid, 'goals'), g),
    updateGoal: (id, g) => void updateDoc(doc(db, 'users', uid, 'goals', id), g),
    removeGoal: (id) => void deleteDoc(doc(db, 'users', uid, 'goals', id)),
    addContribution,
    removeContribution,
    addDebt: (d) => void addDoc(collection(db, 'users', uid, 'debts'), d),
    removeDebt: (id) => void deleteDoc(doc(db, 'users', uid, 'debts', id)),
    setDebtSettled: (id, settled) => void updateDoc(doc(db, 'users', uid, 'debts', id), { settled }),
    loadSampleData,
    clearAllData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useFinanceData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useFinanceData must be used within DataProvider')
  return ctx
}
