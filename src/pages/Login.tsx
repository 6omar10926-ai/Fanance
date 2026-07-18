import { useState } from 'react'
import { Coins, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { pinErrorMessage } from '../lib/authErrors'
import { PIN_ACCOUNT_EMAIL } from '../lib/firebase'
import { PrimaryButton } from '../components/FormField'

const PIN_LENGTH = 6

function PinInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <input
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      autoFocus={autoFocus}
      autoComplete="off"
      maxLength={PIN_LENGTH}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
      placeholder="••••••"
      className="w-full text-center text-3xl font-black tracking-[0.5em] rounded-xl bg-white/5 border border-white/10 py-4 px-3 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors tabular-nums"
    />
  )
}

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pin.length !== PIN_LENGTH) {
      setError(`الرمز لازم يكون ${PIN_LENGTH} أرقام`)
      return
    }
    if (mode === 'signup' && pin !== confirmPin) {
      setError('الرمزان غير متطابقين')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(PIN_ACCOUNT_EMAIL, pin)
      } else {
        await signUp(PIN_ACCOUNT_EMAIL, pin)
      }
    } catch (err) {
      setError(pinErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError('')
    setPin('')
    setConfirmPin('')
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
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أدخل الرمز
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'signup' ? 'bg-emerald-500 text-[#06110c]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أول مرة، أنشئ رمز
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              {mode === 'login' ? 'أدخل رمزك المكوّن من 6 أرقام' : 'اختر رمزاً من 6 أرقام تتذكّره'}
            </div>

            <div className="mb-4">
              <PinInput value={pin} onChange={setPin} autoFocus />
            </div>

            {mode === 'signup' && (
              <div className="mb-4">
                <p className="text-[11px] text-slate-500 mb-1.5 text-center">تأكيد الرمز</p>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4 text-center">
                {error}
              </p>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التنفيذ...
                </span>
              ) : mode === 'login' ? (
                'دخول'
              ) : (
                'إنشاء الرمز والدخول'
              )}
            </PrimaryButton>
          </form>
        </div>

        <p className="text-[11px] text-slate-600 text-center mt-6">
          {mode === 'signup'
            ? 'احفظ رمزك جيداً — ما فيه بريد إلكتروني لاسترجاعه إذا نسيته'
            : 'بياناتك محفوظة بأمان ومرتبطة برمزك فقط'}
        </p>
      </div>
    </div>
  )
}
