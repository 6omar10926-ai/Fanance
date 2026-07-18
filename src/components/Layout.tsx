import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Banknote,
  CalendarClock,
  Coins,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'المصروفات', icon: Wallet },
  { to: '/investments', label: 'الاستثمارات', icon: TrendingUp },
  { to: '/income', label: 'الدخل', icon: Banknote },
  { to: '/payments', label: 'المدفوعات', icon: CalendarClock },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-[#0b0f19]">
      <aside className="w-64 shrink-0 hidden md:flex flex-col border-l border-white/5 bg-[#0d1220] px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">مالي</h1>
            <p className="text-[11px] text-slate-500 mt-1">إدارة ماليتك الشخصية</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 py-4 rounded-xl bg-white/5 text-[11px] text-slate-500 leading-relaxed">
          بياناتك محفوظة محلياً في متصفحك فقط، ولا يتم إرسالها لأي خادم.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-2 px-4 py-3 bg-[#0d1220]/95 backdrop-blur border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-white">مالي</h1>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-center justify-around bg-[#0d1220] border-t border-white/5 px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
