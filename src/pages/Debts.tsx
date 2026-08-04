import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Repeat,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
} from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Debt, DebtDirection } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { totalOwedToMe, totalOwedByMe, netDebt, debtPaid, debtRemaining, debtIsSettled } from '../lib/calculations'

const directions: DebtDirection[] = ['لي', 'عليّ']

const directionStyle: Record<DebtDirection, { badge: string; icon: typeof ArrowDownLeft; label: string; text: string }> = {
  'لي': { badge: 'bg-emerald-500/15 text-emerald-400', icon: ArrowDownLeft, label: 'لي (مستحق لي)', text: 'text-emerald-400' },
  'عليّ': { badge: 'bg-rose-500/15 text-rose-400', icon: ArrowUpRight, label: 'عليّ (مستحق عليّ)', text: 'text-rose-400' },
}

export default function Debts() {
  const { debts, addDebt, removeDebt, addDebtPayment, removeDebtPayment } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'الكل' | DebtDirection>('الكل')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [payFor, setPayFor] = useState<Debt | null>(null)

  const [form, setForm] = useState({
    direction: 'لي' as DebtDirection,
    person: '',
    amount: '',
    date: todayISO(),
    dueDate: '',
    installment: '',
    notes: '',
  })

  const [payForm, setPayForm] = useState({ amount: '', date: todayISO(), note: '', asExpense: false })

  const owedToMe = totalOwedToMe(debts)
  const owedByMe = totalOwedByMe(debts)
  const net = netDebt(debts)

  const filtered = useMemo(() => {
    const list = tab === 'الكل' ? debts : debts.filter((d) => d.direction === tab)
    return [...list].sort((a, b) => {
      const aSettled = debtIsSettled(a)
      const bSettled = debtIsSettled(b)
      if (aSettled !== bSettled) return aSettled ? 1 : -1 // unsettled first
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [debts, tab])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || !form.person.trim()) return
    const installment = Number(form.installment)
    const payload: Omit<Debt, 'id'> = {
      direction: form.direction,
      person: form.person.trim(),
      amount,
      date: form.date,
      payments: [],
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      ...(installment > 0 ? { installment } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    }
    addDebt(payload)
    setForm({ direction: 'لي', person: '', amount: '', date: todayISO(), dueDate: '', installment: '', notes: '' })
    setOpen(false)
  }

  function openPay(debt: Debt) {
    const remaining = debtRemaining(debt)
    const suggested = debt.installment ? Math.min(debt.installment, remaining) : remaining
    setPayForm({
      amount: String(suggested),
      date: todayISO(),
      note: debt.installment ? 'قسط الشهر' : '',
      asExpense: debt.direction === 'عليّ', // paying off what you owe counts as spending
    })
    setPayFor(debt)
  }

  function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!payFor) return
    const amount = Number(payForm.amount)
    if (!amount || amount <= 0) return
    addDebtPayment(
      payFor.id,
      { date: payForm.date, amount, ...(payForm.note.trim() ? { note: payForm.note.trim() } : {}) },
      payForm.asExpense,
    )
    setPayFor(null)
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
              const paid = debtPaid(d)
              const remaining = debtRemaining(d)
              const settled = debtIsSettled(d)
              const percent = d.amount > 0 ? Math.min(100, (paid / d.amount) * 100) : 0
              const isOpen = expanded.has(d.id)
              const payments = [...(d.payments ?? [])].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              return (
                <div key={d.id} className={`rounded-xl bg-white/5 p-3 ${settled ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.badge}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                          {d.person}
                          {d.installment && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">
                              <Repeat className="w-3 h-3" /> قسط {formatCurrency(d.installment)}
                            </span>
                          )}
                          {settled && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                              مسدّد
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {d.direction === 'لي' ? 'مستحق لي' : 'مستحق عليّ'} · {formatDate(d.date)}
                          {d.dueDate && ` · موعد التسديد ${formatDate(d.dueDate)}`}
                          {d.notes && ` · ${d.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className={`text-sm font-bold tabular-nums ${settled ? 'text-slate-400' : style.text}`}>
                        {formatCurrency(remaining)}
                      </p>
                      {paid > 0 && (
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          مدفوع {formatCurrency(paid)} من {formatCurrency(d.amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {paid > 0 && !settled && (
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-2.5">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2.5">
                    {!settled && (
                      <button
                        onClick={() => openPay(d)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      >
                        <CircleDollarSign className="w-3.5 h-3.5" /> سداد
                      </button>
                    )}
                    {payments.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(d.id)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        الدفعات ({payments.length})
                      </button>
                    )}
                    <button
                      onClick={() => removeDebt(d.id)}
                      className="mr-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isOpen && payments.length > 0 && (
                    <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2.5">
                      {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <span className="text-slate-300">{formatDate(p.date)}</span>
                            {p.note && <span className="text-slate-500"> · {p.note}</span>}
                            {p.expenseId && <span className="text-orange-400/80"> · ضمن المصروفات</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-white tabular-nums">{formatCurrency(p.amount)}</span>
                            <button
                              onClick={() => removeDebtPayment(d.id, p.id)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              aria-label="حذف الدفعة"
                              title="حذف الدفعة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add debt */}
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
          <FormField label="اسم الشخص / الجهة">
            <TextInput
              value={form.person}
              onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
              placeholder="مثال: خالد أو بنك التمويل"
              required
            />
          </FormField>
          <FormField label="المبلغ الإجمالي (ر.س)">
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
          <FormField label="القسط الشهري (اختياري — للقروض)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={form.installment}
              onChange={(e) => setForm((f) => ({ ...f, installment: e.target.value }))}
              placeholder="اتركه فارغاً إن لم يكن قرضاً بأقساط"
            />
          </FormField>
          <FormField label="التاريخ">
            <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </FormField>
          <FormField label="موعد التسديد (اختياري)">
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </FormField>
          <FormField label="ملاحظات (اختياري)">
            <TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="مثال: قرض شخصي" />
          </FormField>
          <PrimaryButton type="submit">إضافة الدين</PrimaryButton>
        </form>
      </Modal>

      {/* Log a payment */}
      <Modal open={payFor !== null} onClose={() => setPayFor(null)} title={payFor ? `سداد دفعة · ${payFor.person}` : 'سداد دفعة'}>
        {payFor && (
          <form onSubmit={handlePaySubmit}>
            <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm flex items-center justify-between">
              <span className="text-slate-400">المتبقي</span>
              <span className="font-bold text-white tabular-nums">{formatCurrency(debtRemaining(payFor))}</span>
            </div>
            <FormField label="مبلغ الدفعة (ر.س)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                required
                autoFocus
              />
            </FormField>
            <button
              type="button"
              onClick={() => setPayForm((f) => ({ ...f, amount: String(debtRemaining(payFor)) }))}
              className="text-xs text-emerald-400 hover:text-emerald-300 mb-4 -mt-2"
            >
              سداد كامل المتبقي ({formatCurrency(debtRemaining(payFor))})
            </button>
            <FormField label="التاريخ">
              <TextInput type="date" value={payForm.date} onChange={(e) => setPayForm((f) => ({ ...f, date: e.target.value }))} required />
            </FormField>
            <FormField label="ملاحظة (اختياري)">
              <TextInput
                value={payForm.note}
                onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="مثال: قسط الشهر"
              />
            </FormField>
            {payFor.direction === 'عليّ' && (
              <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payForm.asExpense}
                  onChange={(e) => setPayForm((f) => ({ ...f, asExpense: e.target.checked }))}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm text-slate-300">احسبها ضمن مصروفات هذا الشهر (فئة: أقساط)</span>
              </label>
            )}
            <PrimaryButton type="submit">تسجيل الدفعة</PrimaryButton>
          </form>
        )}
      </Modal>
    </div>
  )
}
