import { useMemo, useState } from 'react'
import { Plus, Trash2, Wallet, Calendar, TrendingDown, Tag } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Expense, ExpenseCategory } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { totalExpenses, expensesInMonth, expensesByCategory } from '../lib/calculations'

const categories: ExpenseCategory[] = ['طعام وشراب', 'مواصلات', 'سكن', 'فواتير', 'تسوق', 'صحة', 'ترفيه', 'تعليم', 'أقساط', 'أخرى']

const categoryColors: Record<string, string> = {
  'طعام وشراب': 'bg-amber-500/15 text-amber-400',
  'مواصلات': 'bg-sky-500/15 text-sky-400',
  'سكن': 'bg-violet-500/15 text-violet-400',
  'فواتير': 'bg-rose-500/15 text-rose-400',
  'تسوق': 'bg-pink-500/15 text-pink-400',
  'صحة': 'bg-emerald-500/15 text-emerald-400',
  'ترفيه': 'bg-indigo-500/15 text-indigo-400',
  'تعليم': 'bg-teal-500/15 text-teal-400',
  'أقساط': 'bg-orange-500/15 text-orange-400',
  'أخرى': 'bg-slate-500/15 text-slate-400',
}

export default function Expenses() {
  const { expenses, addExpense, removeExpense } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('الكل')
  const now = new Date()

  const [form, setForm] = useState({
    date: todayISO(),
    category: categories[0] as ExpenseCategory,
    description: '',
    amount: '',
  })

  const total = totalExpenses(expenses)
  const thisMonth = expensesInMonth(expenses, now.getFullYear(), now.getMonth())
  const byCategory = expensesByCategory(expenses)
  const topCategory = byCategory[0]
  const avgPerEntry = expenses.length ? total / expenses.length : 0

  const filtered = useMemo(() => {
    const list = filter === 'الكل' ? expenses : expenses.filter((e) => e.category === filter)
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, filter])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || !form.description.trim()) return
    const payload: Omit<Expense, 'id'> = {
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      amount,
    }
    addExpense(payload)
    setForm({ date: todayISO(), category: categories[0], description: '', amount: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="المصروفات"
        subtitle="تتبع مصروفاتك اليومية حسب الفئة"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة مصروف
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="إجمالي المصروفات" value={formatCurrency(total)} icon={Wallet} accent="rose" />
        <StatCard label="مصروفات هذا الشهر" value={formatCurrency(thisMonth)} icon={Calendar} accent="amber" />
        <StatCard label="متوسط كل عملية" value={formatCurrency(avgPerEntry)} icon={TrendingDown} accent="sky" />
        <StatCard label="أعلى فئة إنفاق" value={topCategory ? topCategory.name : '-'} icon={Tag} accent="violet" sub={topCategory ? formatCurrency(topCategory.value) : undefined} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white">سجل المصروفات</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="الكل">كل الفئات</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد مصروفات مسجلة بعد</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg ${categoryColors[e.category] ?? categoryColors['أخرى']}`}>
                    {e.category}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{e.description}</p>
                    <p className="text-[11px] text-slate-500">{formatDate(e.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-bold text-rose-400 tabular-nums">-{formatCurrency(e.amount)}</p>
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة مصروف جديد">
        <form onSubmit={handleSubmit}>
          <FormField label="الوصف">
            <TextInput
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="مثال: عشاء مع الأصدقاء"
              required
            />
          </FormField>
          <FormField label="المبلغ (ر.س)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0"
              required
            />
          </FormField>
          <FormField label="الفئة">
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="التاريخ">
            <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </FormField>
          <PrimaryButton type="submit">إضافة المصروف</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
