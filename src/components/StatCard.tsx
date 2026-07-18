import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  accent?: 'emerald' | 'rose' | 'sky' | 'amber' | 'violet'
  trend?: number
  trendLabel?: string
  sub?: string
}

const accentMap = {
  emerald: 'from-emerald-400/20 to-emerald-600/5 text-emerald-400',
  rose: 'from-rose-400/20 to-rose-600/5 text-rose-400',
  sky: 'from-sky-400/20 to-sky-600/5 text-sky-400',
  amber: 'from-amber-400/20 to-amber-600/5 text-amber-400',
  violet: 'from-violet-400/20 to-violet-600/5 text-violet-400',
}

export default function StatCard({ label, value, icon: Icon, accent = 'emerald', trend, trendLabel, sub }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d1220] p-5 animate-fade-in">
      <div className={`absolute -top-6 -left-6 w-28 h-28 rounded-full bg-linear-to-br ${accentMap[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-black text-white mt-2 tabular-nums">{value}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${accentMap[accent].split(' ').pop()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="relative mt-3 flex items-center gap-1 text-xs font-semibold">
          {trend >= 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className={trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          {trendLabel && <span className="text-slate-500 font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
