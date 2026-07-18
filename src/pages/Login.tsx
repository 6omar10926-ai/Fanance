import { useState } from 'react'
import { Coins, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authErrorMessage } from '../lib/authErrors'
import { FormField, TextInput, PrimaryButton } from '../components/FormField'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-white leading-none">مالي</h1>
            <p className="text-[11px] text-slate-500 mt-1">إدارة ماليتك الشخصية</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1220] p-6 animate-fade-in">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'signup' ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField label="البريد الإلكتروني">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </FormField>
            <FormField label="كلمة المرور">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </FormField>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التنفيذ...
                </span>
              ) : mode === 'login' ? (
                'تسجيل الدخول'
              ) : (
                'إنشاء الحساب'
              )}
            </PrimaryButton>
          </form>
        </div>

        <p className="text-[11px] text-slate-600 text-center mt-6">بياناتك محفوظة بأمان ومرتبطة بحسابك فقط</p>
      </div>
    </div>
  )
}
