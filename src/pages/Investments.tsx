import { useState } from 'react'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Coins, PieChart as PieIcon } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { Investment, InvestmentType } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, Select, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, formatPercent, todayISO } from '../lib/format'
import { totalInvested, totalCurrentValue, investmentReturnPct } from '../lib/calculations'

const types: InvestmentType[] = ['أسهم', 'صناديق استثمار', 'عقار', 'ذهب ومعادن', 'عملات رقمية', 'ودائع بنكية', 'أخرى']

export default function Investments() {
  const { investments, addInvestment, updateInvestment, removeInvestment } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const emptyForm = {
    name: '',
    type: types[0] as InvestmentType,
    platform: '',
    amountInvested: '',
    currentValue: '',
    date: todayISO(),
    endDate: '',
    notes: '',
  }
  const [form, setForm] = useState(emptyForm)

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
      notes: inv.notes ?? '',
    })
    setOpen(true)
  }

  const invested = totalInvested(investments)
  const currentValue = totalCurrentValue(investments)
  const roi = investmentReturnPct(investments)
  const gain = currentValue - invested

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountInvested = Number(form.amountInvested)
    const currentVal = Number(form.currentValue)
    if (!amountInvested || amountInvested <= 0 || !currentVal || currentVal < 0 || !form.name.trim()) return
    const payload: Omit<Investment, 'id'> = {
      name: form.name.trim(),
      type: form.type,
      amountInvested,
      currentValue: currentVal,
      date: form.date,
      ...(form.platform.trim() ? { platform: form.platform.trim() } : {}),
      ...(form.endDate ? { endDate: form.endDate } : {}),
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

  const sorted = [...investments].sort((a, b) => b.currentValue - a.currentValue)

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
        <StatCard label="نسبة العائد المتوقع" value={formatPercent(roi)} icon={gain >= 0 ? TrendingUp : TrendingDown} accent={gain >= 0 ? 'emerald' : 'rose'} />
      </div>

      <Card>
        <h3 className="text-sm font-bold text-white mb-4">محفظة الاستثمارات</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد استثمارات مسجلة بعد</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[760px]">
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
                {sorted.map((inv) => {
                  const invGain = inv.currentValue - inv.amountInvested
                  const invRoi = inv.amountInvested ? (invGain / inv.amountInvested) * 100 : 0
                  return (
                    <tr key={inv.id} className="border-b border-white/5 last:border-0 group">
                      <td className="px-2 py-3">
                        <p className="font-medium text-white">{inv.name}</p>
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
          <FormField label="ملاحظات (اختياري)">
            <TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
          </FormField>
          <PrimaryButton type="submit">{editId ? 'حفظ التعديلات' : 'إضافة الاستثمار'}</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
