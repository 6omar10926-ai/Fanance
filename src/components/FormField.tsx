import type { ReactNode } from 'react'

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClass} ${props.className ?? ''}`}>
      {props.children}
    </select>
  )
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#06110c] font-bold py-2.5 text-sm transition-colors disabled:opacity-50 ${props.className ?? ''}`}
    />
  )
}
