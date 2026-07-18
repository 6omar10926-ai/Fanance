import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Wallet, TrendingUp, Banknote, PiggyBank, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { formatCurrency, formatDate, formatPercent } from '../lib/format'
import {
  getMonthlyIncome,
  getAnnualIncome,
  totalExpenses,
  expensesInMonth,
  expensesByCategory,
  investmentsByType,
  totalInvested,
  totalCurrentValue,
  investmentReturnPct,
  savingsRate,
  expenseRatio,
  investmentRatio,
  monthlySeries,
  netWorth,
} from '../lib/calculations'

const PIE_COLORS = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c', '#f87171', '#2dd4bf']

function RatioBar({ label, value, suffix = '%', color = 'bg-emerald-500' }: { label: string; value: number; suffix?: string; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-white tabular-nums">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const data = useFinanceData()
  const now = new Date()

  const monthlyIncome = getMonthlyIncome(data.incomes)
  const annualIncome = getAnnualIncome(data.incomes)
  const spendThisMonth = expensesInMonth(data.expenses, now.getFullYear(), now.getMonth())
  const totalSpend = totalExpenses(data.expenses)
  const invested = totalInvested(data.investments)
  const currentValue = totalCurrentValue(data.investments)
  const roi = investmentReturnPct(data.investments)
  const worth = netWorth(data)

  const sRate = savingsRate(monthlyIncome || annualIncome / 12, spendThisMonth)
  const eRatio = expenseRatio(monthlyIncome || annualIncome / 12, spendThisMonth)
  const iRatio = investmentRatio(annualIncome, invested)

  const categoryData = expensesByCategory(data.expenses)
  const investmentTypeData = investmentsByType(data.investments)
  const series = monthlySeries(data.expenses, data.incomes, 6)

  const upcoming = [...data.payments]
    .filter((p) => p.status !== 'مدفوع')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)

  return (
    <div>
      <PageHeader
        title="لوحة التحكم المالية"
        subtitle={`نظرة عامة على وضعك المالي · ${now.toLocaleDateString('ar-SA-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="الدخل الشهري" value={formatCurrency(monthlyIncome)} icon={Banknote} accent="emerald" sub={`سنوياً ${formatCurrency(annualIncome)}`} />
        <StatCard label="مصروفات هذا الشهر" value={formatCurrency(spendThisMonth)} icon={Wallet} accent="rose" sub={`الإجمالي المسجّل ${formatCurrency(totalSpend)}`} />
        <StatCard label="قيمة الاستثمارات" value={formatCurrency(currentValue)} icon={TrendingUp} accent="sky" trend={roi} trendLabel="عائد" />
        <StatCard label="صافي الثروة" value={formatCurrency(worth)} icon={PiggyBank} accent="violet" sub="النقد + الاستثمارات" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4">الدخل مقابل المصروفات (آخر 6 أشهر)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2537" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `${v / 1000}ك`} />
              <Tooltip
                contentStyle={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'Tajawal' }}
                labelStyle={{ color: '#e5e7eb' }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Area type="monotone" dataKey="income" name="الدخل" stroke="#34d399" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="#f87171" fill="url(#expenseGrad)" strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-white mb-4">المصروفات حسب الفئة</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">لا توجد بيانات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'Tajawal' }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
            {categoryData.slice(0, 6).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-5">النسب المالية الرئيسية</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <RatioBar label="معدل الادخار" value={sRate} color="bg-emerald-500" />
            <RatioBar label="نسبة المصروفات إلى الدخل" value={eRatio} color="bg-rose-500" />
            <RatioBar label="نسبة الاستثمار إلى الدخل السنوي" value={iRatio} color="bg-sky-500" />
            <RatioBar label="عائد الاستثمار الإجمالي" value={roi} color={roi >= 0 ? 'bg-violet-500' : 'bg-rose-500'} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-white mb-4">تخصيص الاستثمارات</h3>
          {investmentTypeData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">لا توجد استثمارات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={investmentTypeData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {investmentTypeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'Tajawal' }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">مدفوعات قادمة</h3>
          <Link to="/payments" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            عرض الكل <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">لا توجد مدفوعات مستحقة، أحسنت!</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'متأخر' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-[11px] text-slate-500">استحقاق {formatDate(p.dueDate)}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white tabular-nums">{formatCurrency(p.amount)}</p>
                  <p className={`text-[11px] font-semibold ${p.status === 'متأخر' ? 'text-rose-400' : 'text-amber-400'}`}>{p.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-[11px] text-slate-600 text-center mt-6">
        {formatPercent(sRate)} معدل ادخار هذا الشهر
      </p>
    </div>
  )
}
