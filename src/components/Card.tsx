import type { ReactNode } from 'react'

export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-[#0d1220] p-5 animate-fade-in ${className}`}>
      {children}
    </div>
  )
}
