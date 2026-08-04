import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Coins,
  PieChart as PieIcon,
  CheckCircle2,
  RotateCcw,
  Repeat,
  Banknote,
} from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Investment, InvestmentType, PayoutFrequency } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, formatPercent, todayISO } from '../lib/format'
import {
  totalInvested,
  totalCurrentValue,
  investmentReturnPct,
  activeInvestments,
  closedInvestments,
  realizedProfit,
} from '../lib/calculations'

const types: InvestmentType[] = ['أسهم', 'صناديق استثمار', 'عقار', 'ذهب ومعادن', 'عملات رقمية', 'ودائع بنكية', 'أخرى']
const payoutFreqs: PayoutFrequency[] = ['شهري', 'ربع سنوي', 'سنوي']

export default function Investments() {
  const { investments, addInvestment, updateInvestment, removeInvestment, closeInvestment, reopenInvestment, addIncome } =
    useFinanceData()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [closeFor, setCloseFor] = useState<Investment | null>(null)

  const emptyForm = {
    name: '',
    type: types[0] as InvestmentType,
    platform: '',
    amountInvested: '',
    currentValue: '',
    date: todayISO(),
    endDate: '',
    payout: '',
    payoutFreq: 'شهري' as PayoutFrequency,
    notes: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [closeForm, setCloseForm] = useState({ receivedAmount: '', closedDate: todayISO(), asIncome: true })

  function openAdd() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(inv: Investment) {
    setEditId(inv.id)
    setForm({
      name: inv.name,
      type: inv.type,
      platform: inv.platform ?? '',
      amountInvested: String(inv.amountInvested),
      currentValue: String(inv.currentValue),
      date: inv.date,
      endDate: inv.endDate ?? '',
      payout: inv.payout ? String(inv.payout) : '',
      payoutFreq: inv.payoutFreq ?? 'شهري',
      notes: inv.notes ?? '',
    })
    setOpen(true)
  }

  const invested = totalInvested(investments)
  const currentValue = totalCurrentValue(investments)
  const roi = investmentReturnPct(investments)
  const gain = currentValue - invested

  const active = [...activeInvestments(investments)].sort((a, b) => b.currentValue - a.currentValue)
  const closed = [...closedInvestments(investments)].sort(
    (a, b) => new Date(b.closedDate ?? b.date).getTime() - new Date(a.closedDate ?? a.date).getTime(),
  )
  const scheduled = active.filter((i) => i.payout && i.payout > 0)
  const realized = realizedProfit(investments)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountInvested = Number(form.amountInvested)
    const currentVal = Number(form.currentValue)
    if (!amountInvested || amountInvested <= 0 || !currentVal || currentVal < 0 || !form.name.trim()) return
    const payoutAmount = Number(form.payout)
    const payload: Omit<Investment, 'id'> = {
      name: form.name.trim(),
      type: form.type,
      amountInvested,
      currentValue: currentVal,
      date: form.date,
      ...(form.platform.trim() ? { platform: form.platform.trim() } : {}),
      ...(form.endDate ? { endDate: form.endDate } : {}),
      ...(payoutAmount > 0 ? { payout: payoutAmount, payoutFreq: form.payoutFreq } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    }
    if (editId) {
      updateInvestment(editId, payload)
    } else {
      addInvestment(payload)
    }
    setForm(emptyForm)
    setEditId(null)
    setOpen(false)
  }

  function openClose(inv: Investment) {
    setCloseForm({ receivedAmount: String(inv.currentValue), closedDate: todayISO(), asIncome: true })
    setCloseFor(inv)
  }

  function handleCloseSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!closeFor) return
    const received = Number(closeForm.receivedAmount)
    if (received < 0 || closeForm.receivedAmount === '') return
    closeInvestment(closeFor.id, received, closeForm.closedDate, closeForm.asIncome)
    setCloseFor(null)
  }

  function logPayout(inv: Investment) {
    if (!inv.payout || inv.payout <= 0) return
    addIncome({ date: todayISO(), source: `دخل استثمار: ${inv.name}`, frequency: 'مرة واحدة', amount: inv.payout })
  }

  const closeReceived = Number(closeForm.receivedAmount)
  const closeProfit = closeFor ? closeReceived - closeFor.amountInvested : 0

  return (
    <div>
      <PageHeader
        title="الاستثمارات"
        subtitle="تابع محفظتك الاستثمارية وعوائدها"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة استثمار
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="المبلغ المستثمر (رأس المال)" value={formatCurrency(invested)} icon={Coins} accent="sky" />
        <StatCard label="الإجمالي المتوقع" value={formatCurrency(currentValue)} icon={PieIcon} accent="violet" />
        <StatCard
          label="الربح المتوقع"
          value={formatCurrency(gain)}
          icon={gain >= 0 ? TrendingUp : TrendingDown}
          accent={gain >= 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          label="نسبة العائد المتوقع"
          value={formatPercent(roi)}
          icon={gain >= 0 ? TrendingUp : TrendingDown}
          accent={gain >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      <Card>
        <h3 className="text-sm font-bold text-white mb-4">محفظة الاستثمارات النشطة</h3>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد استثمارات نشطة</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-slate-500 text-[11px] border-b border-white/5">
                  <th className="text-start font-medium px-2 pb-3">الاسم</th>
                  <th className="text-start font-medium px-2 pb-3">النوع</th>
                  <th className="text-start font-medium px-2 pb-3">المنصة</th>
                  <th className="text-start font-medium px-2 pb-3">رأس المال</th>
                  <th className="text-start font-medium px-2 pb-3">الإجمالي المتوقع</th>
                  <th className="text-start font-medium px-2 pb-3">العائد المتوقع</th>
                  <th className="text-start font-medium px-2 pb-3">الانتهاء</th>
                  <th className="text-start font-medium px-2 pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {active.map((inv) => {
                  const invGain = inv.currentValue - inv.amountInvested
                  const invRoi = inv.amountInvested ? (invGain / inv.amountInvested) * 100 : 0
                  return (
                    <tr key={inv.id} className="border-b border-white/5 last:border-0 group">
                      <td className="px-2 py-3">
                        <p className="font-medium text-white flex items-center gap-1.5">
                          {inv.name}
                          {inv.payout ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                              <Repeat className="w-3 h-3" /> {formatCurrency(inv.payout)}/{inv.payoutFreq}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-slate-500">منذ {formatDate(inv.date)}</p>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/5 text-slate-300">{inv.type}</span>
                      </td>
                      <td className="px-2 py-3 text-slate-300">{inv.platform || <span className="text-slate-600">—</span>}</td>
                      <td className="px-2 py-3 tabular-nums text-slate-300">{formatCurrency(inv.amountInvested)}</td>
                      <td className="px-2 py-3 tabular-nums font-bold text-white">{formatCurrency(inv.currentValue)}</td>
                      <td className="px-2 py-3">
                        <span className={`font-bold tabular-nums ${invRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatPercent(invRoi)}</span>
                      </td>
                      <td className="px-2 py-3 text-slate-300 text-[11px]">
                        {inv.endDate ? formatDate(inv.endDate) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-2 py-3 text-left">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openClose(inv)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all whitespace-nowrap"
                            aria-label="إنهاء الاستثمار"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> إنهاء
                          </button>
                          <button
                            onClick={() => openEdit(inv)}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            aria-label="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeInvestment(inv.id)}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {scheduled.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-emerald-400" /> دفعات مجدولة مستلمة
          </h3>
          <div className="space-y-2">
            {scheduled.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inv.name}</p>
                    <p className="text-[11px] text-slate-500">دفعة {inv.payoutFreq}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-bold text-emerald-400 tabular-nums">{formatCurrency(inv.payout ?? 0)}</p>
                  <button
                    onClick={() => logPayout(inv)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> سجّل الاستلام
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">عند الضغط على «سجّل الاستلام» يُضاف المبلغ إلى الدخل.</p>
        </Card>
      )}

      {closed.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-white">الاستثمارات المنتهية</h3>
            <span className={`text-xs font-semibold ${realized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              الأرباح المحققة: {formatCurrency(realized)}
            </span>
          </div>
          <div className="space-y-2">
            {closed.map((inv) => {
              const profit = (inv.receivedAmount ?? 0) - inv.amountInvested
              const pct = inv.amountInvested ? (profit / inv.amountInvested) * 100 : 0
              return (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group flex-wrap gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inv.name}</p>
                    <p className="text-[11px] text-slate-500">
                      رأس المال {formatCurrency(inv.amountInvested)}
                      {inv.closedDate && ` · انتهى ${formatDate(inv.closedDate)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left">
                      <p className="text-sm font-bold text-white tabular-nums">
                        استُلم {formatCurrency(inv.receivedAmount ?? 0)}
                      </p>
                      <p className={`text-[11px] font-semibold tabular-nums ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {profit >= 0 ? 'ربح' : 'خسارة'} {formatCurrency(Math.abs(profit))} ({formatPercent(pct)})
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => reopenInvestment(inv.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        aria-label="إعادة فتح"
                        title="إعادة فتح"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeInvestment(inv.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Add / edit investment */}
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل الاستثمار' : 'إضافة استثمار جديد'}>
        <form onSubmit={handleSubmit}>
          <FormField label="اسم الاستثمار">
            <TextInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: صندوق مؤشر أمريكي"
              required
            />
          </FormField>
          <FormField label="النوع">
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as InvestmentType }))}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="منصة الاستثمار (اختياري)">
            <TextInput
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              placeholder="مثال: الراجحي المالية، Binance"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="المبلغ المستثمر (رأس المال)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.amountInvested}
                onChange={(e) => setForm((f) => ({ ...f, amountInvested: e.target.value }))}
                placeholder="0"
                required
              />
            </FormField>
            <FormField label="المبلغ الإجمالي المتوقع">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.currentValue}
                onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
                placeholder="0"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="تاريخ بداية الاستثمار">
              <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            </FormField>
            <FormField label="تاريخ انتهاء الاستثمار (اختياري)">
              <TextInput type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="دفعة مجدولة مستلمة (اختياري)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.payout}
                onChange={(e) => setForm((f) => ({ ...f, payout: e.target.value }))}
                placeholder="مثل توزيعات أو إيجار"
              />
            </FormField>
            <FormField label="تكرار الدفعة">
              <Select value={form.payoutFreq} onChange={(e) => setForm((f) => ({ ...f, payoutFreq: e.target.value as PayoutFrequency }))}>
                {payoutFreqs.map((fq) => (
                  <option key={fq} value={fq}>
                    {fq}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="ملاحظات (اختياري)">
            <TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
          </FormField>
          <PrimaryButton type="submit">{editId ? 'حفظ التعديلات' : 'إضافة الاستثمار'}</PrimaryButton>
        </form>
      </Modal>

      {/* End / cash out investment */}
      <Modal open={closeFor !== null} onClose={() => setCloseFor(null)} title={closeFor ? `إنهاء الاستثمار · ${closeFor.name}` : 'إنهاء الاستثمار'}>
        {closeFor && (
          <form onSubmit={handleCloseSubmit}>
            <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رأس المال</span>
                <span className="font-bold text-white tabular-nums">{formatCurrency(closeFor.amountInvested)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الإجمالي المتوقع</span>
                <span className="font-bold text-white tabular-nums">{formatCurrency(closeFor.currentValue)}</span>
              </div>
            </div>
            <FormField label="كم استلمت فعلياً؟ (ر.س)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={closeForm.receivedAmount}
                onChange={(e) => setCloseForm((f) => ({ ...f, receivedAmount: e.target.value }))}
                placeholder="0"
                required
                autoFocus
              />
            </FormField>
            {closeForm.receivedAmount !== '' && (
              <p className={`text-xs font-semibold -mt-2 mb-4 ${closeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {closeProfit >= 0 ? 'ربح محقق' : 'خسارة محققة'}: {formatCurrency(Math.abs(closeProfit))}
              </p>
            )}
            <FormField label="تاريخ الاستلام">
              <TextInput
                type="date"
                value={closeForm.closedDate}
                onChange={(e) => setCloseForm((f) => ({ ...f, closedDate: e.target.value }))}
                required
              />
            </FormField>
            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={closeForm.asIncome}
                onChange={(e) => setCloseForm((f) => ({ ...f, asIncome: e.target.checked }))}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-sm text-slate-300">أضِف المبلغ المستلم إلى الدخل</span>
            </label>
            <PrimaryButton type="submit">إنهاء الاستثمار</PrimaryButton>
          </form>
        )}
      </Modal>
    </div>
  )
}
