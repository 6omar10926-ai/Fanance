import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Repeat, CalendarClock, CircleDollarSign, ArrowLeft } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Debt, Payment, PaymentStatus } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { activeInstallments, debtRemaining, nextInstallmentDate } from '../lib/calculations'

const statuses: PaymentStatus[] = ['مستحق', 'مدفوع', 'متأخر']

const statusStyle: Record<PaymentStatus, { badge: string; icon: typeof CheckCircle2 }> = {
  'مدفوع': { badge: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle2 },
  'مستحق': { badge: 'bg-amber-500/15 text-amber-400', icon: Clock },
  'متأخر': { badge: 'bg-rose-500/15 text-rose-400', icon: AlertCircle },
}

export default function Payments() {
  const { payments, addPayment, removePayment, updatePaymentStatus, debts, addDebtPayment } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'الكل' | PaymentStatus>('الكل')

  const installments = useMemo(() => activeInstallments(debts), [debts])

  function payInstallment(d: Debt) {
    const remaining = debtRemaining(d)
    const amount = Math.min(d.installment ?? 0, remaining)
    if (amount <= 0) return
    // Logs against the debt and records it as a monthly expense (category أقساط).
    addDebtPayment(d.id, { date: todayISO(), amount, note: 'قسط الشهر' }, true)
  }

  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: todayISO(),
    category: '',
    recurring: false,
  })

  const totalDue = payments.filter((p) => p.status === 'مستحق').reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments.filter((p) => p.status === 'متأخر').reduce((s, p) => s + p.amount, 0)
  const totalPaid = payments.filter((p) => p.status === 'مدفوع').reduce((s, p) => s + p.amount, 0)
  const recurringCount = payments.filter((p) => p.recurring).length

  const filtered = useMemo(() => {
    const list = tab === 'الكل' ? payments : payments.filter((p) => p.status === tab)
    return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [payments, tab])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || !form.name.trim()) return
    const payload: Omit<Payment, 'id'> = {
      name: form.name.trim(),
      amount,
      dueDate: form.dueDate,
      status: 'مستحق',
      recurring: form.recurring,
      category: form.category.trim() || 'عام',
    }
    addPayment(payload)
    setForm({ name: '', amount: '', dueDate: todayISO(), category: '', recurring: false })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="المدفوعات"
        subtitle="تابع فواتيرك والتزاماتك المالية"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة دفعة
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="مستحقة الدفع" value={formatCurrency(totalDue)} icon={Clock} accent="amber" />
        <StatCard label="متأخرة" value={formatCurrency(totalOverdue)} icon={AlertCircle} accent="rose" />
        <StatCard label="تم دفعها" value={formatCurrency(totalPaid)} icon={CheckCircle2} accent="emerald" />
        <StatCard label="دفعات متكررة" value={String(recurringCount)} icon={Repeat} accent="sky" />
      </div>

      {installments.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-orange-400" /> أقساط القروض الشهرية
            </h3>
            <Link to="/debts" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              إدارة الديون <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {installments.map((d) => {
              const remaining = debtRemaining(d)
              const amount = Math.min(d.installment ?? 0, remaining)
              const due = nextInstallmentDate(d)
              return (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-500/15 text-orange-400 shrink-0">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{d.person}</p>
                      <p className="text-[11px] text-slate-500">
                        القسط القادم {formatDate(due.toISOString())} · متبقٍ {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-bold text-white tabular-nums">{formatCurrency(amount)}</p>
                    <button
                      onClick={() => payInstallment(d)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" /> سداد القسط
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            تُسجَّل الأقساط تلقائياً في الديون، وتُخصم قيمة القسط من مصروفات الشهر (فئة: أقساط) عند السداد.
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white">قائمة المدفوعات</h3>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {(['الكل', ...statuses] as const).map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  tab === s ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد مدفوعات في هذا التصنيف</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const Icon = statusStyle[p.status].icon
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${statusStyle[p.status].badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                        {p.name}
                        {p.recurring && <Repeat className="w-3 h-3 text-slate-500" />}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {p.category} · استحقاق {formatDate(p.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-bold text-white tabular-nums">{formatCurrency(p.amount)}</p>
                    <select
                      value={p.status}
                      onChange={(e) => updatePaymentStatus(p.id, e.target.value as PaymentStatus)}
                      className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${statusStyle[p.status].badge}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="bg-[#111624] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removePayment(p.id)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة دفعة جديدة">
        <form onSubmit={handleSubmit}>
          <FormField label="اسم الدفعة">
            <TextInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: فاتورة الجوال"
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
          <FormField label="تاريخ الاستحقاق">
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} required />
          </FormField>
          <FormField label="الفئة (اختياري)">
            <TextInput value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="مثال: فواتير" />
          </FormField>
          <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            <span className="text-sm text-slate-300 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" /> دفعة متكررة شهرياً
            </span>
          </label>
          <PrimaryButton type="submit">إضافة الدفعة</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
