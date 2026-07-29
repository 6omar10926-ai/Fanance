import { HashRouter, Routes, Route } from 'react-router-dom'
import { Loader2, AlertTriangle } from 'lucide-react'
import Layout from './components/Layout'
import { DataProvider } from './context/DataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isFirebaseConfigured } from './lib/firebase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Investments from './pages/Investments'
import Income from './pages/Income'
import IncomeGoals from './pages/IncomeGoals'
import Payments from './pages/Payments'

function NotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-6">
      <div className="max-w-sm text-center rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <h1 className="text-white font-bold mb-2">لم يتم ربط قاعدة البيانات بعد</h1>
        <p className="text-sm text-slate-400">
          أضف إعدادات مشروع Firebase الخاص بك في <code className="text-amber-300">src/lib/firebase.ts</code> ثم أعد التشغيل.
        </p>
      </div>
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="investments" element={<Investments />} />
            <Route path="income" element={<Income />} />
            <Route path="income-goals" element={<IncomeGoals />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}

function App() {
  if (!isFirebaseConfigured) return <NotConfigured />

  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

export default App
