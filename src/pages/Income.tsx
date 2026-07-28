import { useState } from 'react'
import { Plus, Trash2, Banknote, CalendarDays, CalendarRange, Sparkles, Timer } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { IncomeEntry, IncomeFrequency } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO, countdownLabel } from '../lib/format'
import { getMonthlyIncome, getAnnualIncome, nextIncomeDate, daysUntil } from '../lib/calculations'

const frequencies: IncomeFrequency[] = ['شهري', 'سنوي', 'مرة واحدة']

const freqBadge: Record<IncomeFrequency, string> = {
  'شهري': 'bg-emerald-500/15 text-emerald-400',
  'سنوي': 'bg-sky-500/15 text-sky-400',
  'مرة واحدة': 'bg-violet-500/15 text-violet-400',
}

export default function Income() {
  const { incomes, addIncome, removeIncome } = useFinanceData()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    source: '',
    frequency: frequencies[0] as IncomeFrequency,
    amount: '',
    date: todayISO(),
    payDay: String(new Date().getDate()),
  })

  const monthly = getMonthlyIncome(incomes)
  const annual = getAnnualIncome(incomes)
  const oneTimeTotal = incomes.filter((i) => i.frequency === 'مرة واحدة').reduce((s, i) => s + i.amount, 0)
  const sourcesCount = new Set(incomes.map((i) => i.source)).size

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || !form.source.trim()) return
    const payload: Omit<IncomeEntry, 'id'> = {
      source: form.source.trim(),
      frequency: form.frequency,
      amount,
      date: form.date,
    }
    if (form.frequency === 'شهري') {
      const day = Math.min(31, Math.max(1, Number(form.payDay) || 1))
      payload.payDay = day
    }
    addIncome(payload)
    setForm({ source: '', frequency: frequencies[0], amount: '', date: todayISO(), payDay: String(new Date().getDate()) })
    setOpen(false)
  }

  const sorted = [...incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <PageHeader
        title="الدخل"
        subtitle="سجّل مصادر دخلك الشهرية والسنوية"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة دخل
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="الدخل الشهري الثابت" value={formatCurrency(monthly)} icon={CalendarDays} accent="emerald" />
        <StatCard label="الدخل السنوي المتوقع" value={formatCurrency(annual)} icon={CalendarRange} accent="sky" />
        <StatCard label="دخل غير متكرر" value={formatCurrency(oneTimeTotal)} icon={Sparkles} accent="violet" />
        <StatCard label="عدد مصادر الدخل" value={String(sourcesCount)} icon={Banknote} accent="amber" />
      </div>

      <Card>
        <h3 className="text-sm font-bold text-white mb-4">سجل الدخل</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد مصادر دخل مسجلة بعد</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((i) => {
              const next = nextIncomeDate(i)
              const days = next ? daysUntil(next) : null
              return (
              <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg ${freqBadge[i.frequency]}`}>{i.frequency}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{i.source}</p>
                    <p className="text-[11px] text-slate-500">
                      {i.frequency === 'شهري' && i.payDay
                        ? `يوم ${i.payDay} من كل شهر`
                        : formatDate(i.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {days !== null && next && (
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${
                        days === 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-slate-300'
                      }`}
                      title={formatDate(next.toISOString())}
                    >
                      <Timer className="w-3 h-3" /> {countdownLabel(days)}
                    </span>
                  )}
                  <p className="text-sm font-bold text-emerald-400 tabular-nums">+{formatCurrency(i.amount)}</p>
                  <button
                    onClick={() => removeIncome(i.id)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة مصدر دخل">
        <form onSubmit={handleSubmit}>
          <FormField label="مصدر الدخل">
            <TextInput
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              placeholder="مثال: الراتب الأساسي"
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
          <FormField label="التكرار">
            <Select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as IncomeFrequency }))}>
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </FormField>
          {form.frequency === 'شهري' ? (
            <FormField label="يوم النزول من الشهر">
              <Select value={form.payDay} onChange={(e) => setForm((f) => ({ ...f, payDay: e.target.value }))}>
                {Array.from({ length: 31 }, (_, k) => k + 1).map((d) => (
                  <option key={d} value={d}>
                    يوم {d}
                  </option>
                ))}
              </Select>
            </FormField>
          ) : (
            <FormField label={form.frequency === 'سنوي' ? 'تاريخ النزول السنوي' : 'التاريخ'}>
              <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            </FormField>
          )}
          <PrimaryButton type="submit">إضافة الدخل</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
