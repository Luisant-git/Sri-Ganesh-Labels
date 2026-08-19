import { useState } from 'react'
import { X, Lock, User, ShieldCheck, LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from './Toast'

export default function LoginModal() {
  const { loginOpen, closeLogin, login, register, isRegistered } = useAuth()
  const [stage, setStage] = useState('mobile') // 'mobile' | 'pass' | 'signup'
  const [mobile, setMobile] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  if (!loginOpen) return null

  const reset = () => {
    setStage('mobile')
    setMobile('')
    setName('')
    setPassword('')
    setErrors({})
  }

  const close = () => {
    closeLogin()
    reset()
  }

  const goBack = () => {
    setStage('mobile')
    setPassword('')
    setErrors({})
  }

  const checkMobile = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(mobile)) {
      setErrors({ mobile: 'Enter a valid 10-digit mobile number' })
      return
    }
    setErrors({})
    if (isRegistered(mobile)) {
      setStage('pass')
      toast('Welcome back! Enter your password to login.')
    } else {
      setStage('signup')
      toast('New number! Create your account to continue.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const er = {}
    if (stage === 'signup' && name.trim() && name.trim().length < 3) er.name = 'Name must be at least 3 characters'
    if (!password || password.length < 4) er.password = 'Password must be at least 4 characters'
    setErrors(er)
    if (Object.keys(er).length > 0) return

    if (stage === 'pass') {
      const res = login({ mobile, password })
      if (!res.ok) {
        toast(res.error, 'error')
        setErrors({ password: res.error })
        return
      }
      toast('Login successful!')
    } else {
      const res = register({ mobile, name, password })
      if (!res.ok) {
        toast(res.error, 'error')
        return
      }
      toast('Account created & logged in!')
    }
    reset()
  }

  const fieldCls = (key) =>
    `w-full rounded-xl border px-4 py-3.5 text-sm font-medium outline-none transition-all focus:ring-4 ${
      errors[key]
        ? 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100'
        : 'border-slate-200 bg-slate-50 focus:border-secondary-500 focus:bg-white focus:ring-secondary-500/10'
    }`

  const inputWrapCls = 'relative mt-2 flex items-center gap-3'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={close} />
      <div className="animate-pop relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Decorative top */}
        <div className="relative bg-gradient-to-b from-white via-white to-secondary-50 px-8 pb-16 pt-9 text-center">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-accent-50/80 to-transparent" />
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
          >
            <X size={17} />
          </button>
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-secondary-900/10 ring-1 ring-slate-100">
            <img src="/images/LOgo.png" alt="Sri Ganesh Labels" className="h-full w-full object-cover" />
          </span>
          <h2 className="relative mt-4 font-display text-2xl font-bold text-slate-900">Welcome to Sri Ganesh Labels</h2>
          <p className="relative mt-1.5 text-sm text-slate-500">
            {stage === 'mobile'
              ? 'Enter your mobile number to continue'
              : stage === 'pass'
              ? 'Enter your password to login'
              : 'Create your account to start shopping'}
          </p>
        </div>

        {/* Card overlapping the top */}
        <div className="relative -mt-8 px-6 pb-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5">
            {stage === 'mobile' ? (
              <form onSubmit={checkMobile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Mobile Number</label>
                  <div className={inputWrapCls}>
                    <span className="pointer-events-none absolute left-4 text-sm font-semibold text-slate-400">+91</span>
                    <input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      autoFocus
                      className={`${fieldCls('mobile')} pl-11`}
                    />
                  </div>
                  {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile}</p>}
                </div>
                <button
                  type="submit"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all hover:shadow-accent-500/40 active:scale-[0.98]"
                >
                  <LogIn size={16} /> Continue
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck size={12} className="text-teal-500" /> We will check if you are already registered.
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-[11px] font-medium text-secondary-700 hover:underline"
                >
                  <ArrowLeft size={11} /> Change mobile number
                </button>

                {stage === 'signup' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Name <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <div className={inputWrapCls}>
                      <User size={16} className="pointer-events-none absolute left-4 text-secondary-600" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className={`${fieldCls('name')} pl-10`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    {stage === 'signup' ? 'Create Password' : 'Password'}
                  </label>
                  <div className={inputWrapCls}>
                    <Lock size={16} className="pointer-events-none absolute left-4 text-secondary-600" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoFocus
                      className={`${fieldCls('password')} pl-10`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all hover:shadow-accent-500/40 active:scale-[0.98]"
                >
                  {stage === 'pass' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {stage === 'pass' ? 'Login' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}