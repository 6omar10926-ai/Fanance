import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Target,
  Trophy,
  Coins,
  Timer,
  PartyPopper,
  ChevronDown,
  CircleCheck,
} from 'lucide-react'
import { useFinanceData } from '../context/DataContext'
import type { IncomeGoal } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { FormField, TextInput, PrimaryButton } from '../components/FormField'
import { formatCurrency, formatDate, todayISO, countdownLabel } from '../lib/format'
import { goalProgress } from '../lib/calculations'

export default function IncomeGoals() {
  const { goals, addGoal, updateGoal, removeGoal, addContribution, removeContribution } = useFinanceData()

  const [goalOpen, setGoalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Contribution modal state — which goal we're logging income against.
  const [contribGoalId, setContribGoalId] = useState<string | null>(null)

  const emptyGoal = {
    title: '',
    source: '',
    targetAmount: '',
    startDate: todayISO(),
    deadline: '',
  }
  const [goalForm, setGoalForm] = useState(emptyGoal)

  const emptyContrib = { amount: '', date: todayISO(), note: '' }
  const [contribForm, setContribForm] = useState(emptyContrib)

  function openAddGoal() {
    setEditingId(null)
    setGoalForm(emptyGoal)
    setGoalOpen(true)
  }

  function openEditGoal(goal: IncomeGoal) {
    setEditingId(goal.id)
    setGoalForm({
      title: goal.title,
      source: goal.source ?? '',
      targetAmount: String(goal.targetAmount),
      startDate: goal.startDate,
      deadline: goal.deadline ?? '',
    })
    setGoalOpen(true)
  }

  function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetAmount = Number(goalForm.targetAmount)
    if (!targetAmount || targetAmount <= 0 || !goalForm.title.trim()) return
    const existing = editingId ? goals.find((g) => g.id === editingId) : null
    const payload: Omit<IncomeGoal, 'id'> = {
      title: goalForm.title.trim(),
      targetAmount,
      startDate: goalForm.startDate,
      contributions: existing?.contributions ?? [],
    }
    if (goalForm.source.trim()) payload.source = goalForm.source.trim()
    if (goalForm.deadline) payload.deadline = goalForm.deadline
    if (editingId) {
      updateGoal(editingId, payload)
    } else {
      addGoal(payload)
    }
    setGoalOpen(false)
    setEditingId(null)
    setGoalForm(emptyGoal)
  }

  function openAddContribution(goalId: string) {
    setContribGoalId(goalId)
    setContribForm(emptyContrib)
  }

  function handleContribSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contribGoalId) return
    const amount = Number(contribForm.amount)
    if (!amount || amount <= 0) return
    const note = contribForm.note.trim()
    addContribution(contribGoalId, {
      amount,
      date: contribForm.date,
      ...(note ? { note } : {}),
    })
    // Keep progress visible by making sure the goal is expanded.
    setExpanded((m) => ({ ...m, [contribGoalId]: true }))
    setContribGoalId(null)
    setContribForm(emptyContrib)
  }

  const stats = useMemo(() => {
    let collected = 0
    let target = 0
    let completed = 0
    for (const g of goals) {
      const p = goalProgress(g)
      collected += p.collected
      target += g.targetAmount
      if (p.isComplete) completed++
    }
    return {
      collected,
      target,
      completed,
      active: goals.length - completed,
    }
  }, [goals])

  // Active challenges first, completed ones at the bottom.
  const sorted = useMemo(
    () =>
      [...goals].sort((a, b) => {
        const ca = goalProgress(a).isComplete ? 1 : 0
        const cb = goalProgress(b).isComplete ? 1 : 0
        if (ca !== cb) return ca - cb
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      }),
    [goals],
  )

  const contribGoal = contribGoalId ? goals.find((g) => g.id === contribGoalId) : null

  return (
    <div>
      <PageHeader
        title="تحديات الدخل"
        subtitle="حدّد هدفاً لدخلك وسجّل كل مبلغ يصلك حتى تُقفل التحدي"
        action={
          <button
            onClick={openAddGoal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> تحدي جديد
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="تحديات نشطة" value={String(stats.active)} icon={Target} accent="emerald" />
        <StatCard label="إجمالي المحصّل" value={formatCurrency(stats.collected)} icon={Coins} accent="sky" />
        <StatCard label="مجموع الأهداف" value={formatCurrency(stats.target)} icon={Trophy} accent="violet" />
        <StatCard label="تحديات مكتملة" value={String(stats.completed)} icon={PartyPopper} accent="amber" />
      </div>

      {sorted.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">لا توجد تحديات بعد</p>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              أنشئ تحدياً مثل «دخل العقار ١٠٬٠٠٠ ريال» وابدأ بإضافة كل مبلغ يصلك حتى تصل للهدف.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((goal) => {
            const p = goalProgress(goal)
            const isOpen = expanded[goal.id] ?? false
            const contributions = [...(goal.contributions ?? [])].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            return (
              <Card key={goal.id} className={p.isComplete ? 'border-emerald-500/30' : ''}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        p.isComplete ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {p.isComplete ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{goal.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        {goal.source && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300">
                            {goal.source}
                          </span>
                        )}
                        {p.isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                            <PartyPopper className="w-3 h-3" /> اكتمل التحدي
                          </span>
                        ) : p.daysLeft !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                              p.isOverdue ? 'bg-rose-500/15 text-rose-400' : 'bg-white/5 text-slate-400'
                            }`}
                            title={goal.deadline ? formatDate(goal.deadline) : undefined}
                          >
                            <Timer className="w-3 h-3" />
                            {p.isOverdue ? 'انتهى الموعد' : countdownLabel(p.daysLeft)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditGoal(goal)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
                      aria-label="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2 mb-2">
                  <p className="text-2xl font-black text-white tabular-nums">
                    {formatCurrency(p.collected)}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">من {formatCurrency(goal.targetAmount)}</p>
                </div>

                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.isComplete
                        ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                        : 'bg-linear-to-r from-emerald-500 to-sky-500'
                    }`}
                    style={{ width: `${p.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    {Math.round(p.percent)}%
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {p.isComplete ? 'تم الوصول للهدف 🎉' : `متبقٍ ${formatCurrency(p.remaining)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => openAddContribution(goal.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-2 rounded-xl text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> أضف دخلاً وصلك
                  </button>
                  {contributions.length > 0 && (
                    <button
                      onClick={() => setExpanded((m) => ({ ...m, [goal.id]: !isOpen }))}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                    >
                      {contributions.length} دفعة
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {isOpen && contributions.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                    {contributions.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CircleCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {c.note || 'دفعة'}
                            </p>
                            <p className="text-[10px] text-slate-500">{formatDate(c.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <p className="text-xs font-bold text-emerald-400 tabular-nums">
                            +{formatCurrency(c.amount)}
                          </p>
                          <button
                            onClick={() => removeContribution(goal.id, c.id)}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            aria-label="حذف الدفعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / edit challenge */}
      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title={editingId ? 'تعديل التحدي' : 'تحدي دخل جديد'}>
        <form onSubmit={handleGoalSubmit}>
          <FormField label="اسم التحدي">
            <TextInput
              value={goalForm.title}
              onChange={(e) => setGoalForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: دخل العقار"
              required
            />
          </FormField>
          <FormField label="المصدر (اختياري)">
            <TextInput
              value={goalForm.source}
              onChange={(e) => setGoalForm((f) => ({ ...f, source: e.target.value }))}
              placeholder="مثال: عقار، عمل حر"
            />
          </FormField>
          <FormField label="المبلغ المستهدف (ر.س)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={goalForm.targetAmount}
              onChange={(e) => setGoalForm((f) => ({ ...f, targetAmount: e.target.value }))}
              placeholder="10000"
              required
            />
          </FormField>
          <FormField label="تاريخ البداية">
            <TextInput
              type="date"
              value={goalForm.startDate}
              onChange={(e) => setGoalForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </FormField>
          <FormField label="الموعد النهائي (اختياري)">
            <TextInput
              type="date"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </FormField>
          <PrimaryButton type="submit">{editingId ? 'حفظ التعديل' : 'إنشاء التحدي'}</PrimaryButton>
        </form>
      </Modal>

      {/* Log a contribution */}
      <Modal
        open={contribGoalId !== null}
        onClose={() => setContribGoalId(null)}
        title={contribGoal ? `أضف دخلاً — ${contribGoal.title}` : 'أضف دخلاً'}
      >
        <form onSubmit={handleContribSubmit}>
          <FormField label="المبلغ الذي وصلك (ر.س)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={contribForm.amount}
              onChange={(e) => setContribForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0"
              required
              autoFocus
            />
          </FormField>
          <FormField label="التاريخ">
            <TextInput
              type="date"
              value={contribForm.date}
              onChange={(e) => setContribForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </FormField>
          <FormField label="ملاحظة (اختياري)">
            <TextInput
              value={contribForm.note}
              onChange={(e) => setContribForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="مثال: إيجار شهر يناير"
            />
          </FormField>
          <PrimaryButton type="submit">إضافة الدفعة</PrimaryButton>
        </form>
      </Modal>
    </div>
  )
}
