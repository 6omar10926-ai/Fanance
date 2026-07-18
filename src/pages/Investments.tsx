import { useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Coins, PieChart as PieIcon } from 'lucide-react'
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
  const { investments, addInvestment, removeInvestment } = useFinanceData()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    type: types[0] as InvestmentType,
    amountInvested: '',
    currentValue: '',
    date: todayISO(),
    notes: '',
  })

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
      notes: form.notes.trim() || undefined,
    }
    addInvestment(payload)
    setForm({ name: '', type: types[0], amountInvested: '', currentValue: '', date: todayISO(), notes: '' })
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
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة استثمار
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="رأس المال المستثمر" value={formatCurrency(invested)} icon={Coins} accent="sky" />
        <StatCard label="القيمة الحالية" value={formatCurrency(currentValue)} icon={PieIcon} accent="violet" />
        <StatCard
          label="الأرباح / الخسائر"
          value={formatCurrency(gain)}
          icon={gain >= 0 ? TrendingUp : TrendingDown}
          accent={gain >= 0 ? 'emerald' : 'rose'}
        />
        <StatCard label="نسبة العائد الإجمالي" value={formatPercent(roi)} icon={gain >= 0 ? TrendingUp : TrendingDown} accent={gain >= 0 ? 'emerald' : 'rose'} />
      </div>

      <Card>
        <h3 className="text-sm font-bold text-white mb-4">محفظة الاستثمارات</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">لا توجد استثمارات مسجلة بعد</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-slate-500 text-[11px] border-b border-white/5">
                  <th className="text-start font-medium px-2 pb-3">الاسم</th>
                  <th className="text-start font-medium px-2 pb-3">النوع</th>
                  <th className="text-start font-medium px-2 pb-3">المستثمر</th>
                  <th className="text-start font-medium px-2 pb-3">القيمة الحالية</th>
                  <th className="text-start font-medium px-2 pb-3">العائد</th>
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
                      <td className="px-2 py-3 tabular-nums text-slate-300">{formatCurrency(inv.amountInvested)}</td>
                      <td className="px-2 py-3 tabular-nums font-bold text-white">{formatCurrency(inv.currentValue)}</td>
                      <td className="px-2 py-3">
                        <span className={`font-bold tabular-nums ${invRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatPercent(invRoi)}</span>
                      </td>
                      <td className="px-2 py-3 text-left">
                        <button
                          onClick={() => removeInvestment(inv.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة استثمار جديد">
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="المبلغ المستثمر">
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
            <FormField label="القيمة الحالية">
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
          <FormField label="تاريخ الاستحواذ">
            <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </FormField>
          <FormField label="ملاحظات (اختياري)">
            <TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
          </FormField>
          <PrimaryButton type="submit">إضافة الاستثمار</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
