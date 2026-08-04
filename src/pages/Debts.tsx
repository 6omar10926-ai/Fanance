import { useMemo, useState } from 'react'
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Scale, CheckCircle2, RotateCcw } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Debt, DebtDirection } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { totalOwedToMe, totalOwedByMe, netDebt } from '../lib/calculations'

const directions: DebtDirection[] = ['لي', 'عليّ']

const directionStyle: Record<DebtDirection, { badge: string; icon: typeof ArrowDownLeft; label: string }> = {
  'لي': { badge: 'bg-emerald-500/15 text-emerald-400', icon: ArrowDownLeft, label: 'لي (مستحق لي)' },
  'عليّ': { badge: 'bg-rose-500/15 text-rose-400', icon: ArrowUpRight, label: 'عليّ (مستحق عليّ)' },
}

export default function Debts() {
  const { debts, addDebt, removeDebt, setDebtSettled } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'الكل' | DebtDirection>('الكل')

  const [form, setForm] = useState({
    direction: 'لي' as DebtDirection,
    person: '',
    amount: '',
    date: todayISO(),
    dueDate: '',
    notes: '',
  })

  const owedToMe = totalOwedToMe(debts)
  const owedByMe = totalOwedByMe(debts)
  const net = netDebt(debts)

  const filtered = useMemo(() => {
    const list = tab === 'الكل' ? debts : debts.filter((d) => d.direction === tab)
    return [...list].sort((a, b) => {
      // Unsettled first, then by most recent date.
      if (a.settled !== b.settled) return a.settled ? 1 : -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [debts, tab])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || !form.person.trim()) return
    const payload: Omit<Debt, 'id'> = {
      direction: form.direction,
      person: form.person.trim(),
      amount,
      date: form.date,
      settled: false,
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    }
    addDebt(payload)
    setForm({ direction: 'لي', person: '', amount: '', date: todayISO(), dueDate: '', notes: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="الديون"
        subtitle="تابع الفلوس اللي لك عند الناس واللي عليك لهم"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة دين
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="مستحق لي" value={formatCurrency(owedToMe)} icon={ArrowDownLeft} accent="emerald" sub="فلوس عند الناس" />
        <StatCard label="مستحق عليّ" value={formatCurrency(owedByMe)} icon={ArrowUpRight} accent="rose" sub="فلوس عليك للناس" />
        <StatCard
          label="الصافي"
          value={formatCurrency(net)}
          icon={Scale}
          accent={net >= 0 ? 'sky' : 'amber'}
          sub={net >= 0 ? 'في صالحك' : 'عليك'}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white">قائمة الديون</h3>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {(['الكل', ...directions] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  tab === t ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد ديون في هذا التصنيف</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((d) => {
              const style = directionStyle[d.direction]
              const Icon = style.icon
              return (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-3 rounded-xl bg-white/5 group flex-wrap gap-3 ${d.settled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium text-white truncate ${d.settled ? 'line-through' : ''}`}>
                        {d.person}
                        {d.notes && <span className="text-slate-500 font-normal"> · {d.notes}</span>}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {d.direction === 'لي' ? 'مستحق لي' : 'مستحق عليّ'} · {formatDate(d.date)}
                        {d.dueDate && ` · موعد التسديد ${formatDate(d.dueDate)}`}
                        {d.settled && ' · تم التسديد'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${d.direction === 'لي' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(d.amount)}
                    </p>
                    <button
                      onClick={() => setDebtSettled(d.id, !d.settled)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        d.settled
                          ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                          : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      aria-label={d.settled ? 'إلغاء التسديد' : 'تعليم كمسدّد'}
                      title={d.settled ? 'إلغاء التسديد' : 'تعليم كمسدّد'}
                    >
                      {d.settled ? <RotateCcw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeDebt(d.id)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة دين جديد">
        <form onSubmit={handleSubmit}>
          <FormField label="النوع">
            <Select
              value={form.direction}
              onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as DebtDirection }))}
            >
              {directions.map((d) => (
                <option key={d} value={d}>
                  {directionStyle[d].label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="اسم الشخص">
            <TextInput
              value={form.person}
              onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
              placeholder="مثال: خالد"
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
          <FormField label="التاريخ">
            <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </FormField>
          <FormField label="موعد التسديد (اختياري)">
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </FormField>
          <FormField label="ملاحظات (اختياري)">
            <TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="مثال: سلفة" />
          </FormField>
          <PrimaryButton type="submit">إضافة الدين</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
