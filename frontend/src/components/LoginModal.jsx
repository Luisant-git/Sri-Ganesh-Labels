import { useState } from 'react'
import { X, Phone, Lock, ShieldCheck, LogIn, MessageSquare, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from './Toast'

export default function LoginModal() {
  const { loginOpen, closeLogin, login } = useAuth()
  const [step, setStep] = useState('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)

  if (!loginOpen) return null

  const sendOtp = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(mobile)) {
      toast('Enter a valid 10-digit mobile number', 'error')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setStep('otp')
      toast('OTP sent to ' + mobile)
    }, 700)
  }

  const verifyOtp = (e) => {
    e.preventDefault()
    if (otp !== '1234') {
      toast('Incorrect OTP. Use 1234', 'error')
      return
    }
    login(mobile)
    toast('Login successful!')
    setOtp('')
    setStep('mobile')
    setMobile('')
  }

  const reset = () => {
    setStep('mobile')
    setOtp('')
    setMobile('')
  }

  const close = () => {
    closeLogin()
    reset()
  }

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
            {step === 'mobile'
              ? 'Login with your mobile number to start shopping'
              : `Enter the 4-digit OTP sent to +91 ${mobile}`}
          </p>
        </div>

        {/* Card overlapping the top */}
        <div className="relative -mt-8 px-6 pb-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5">
            {step === 'mobile' ? (
              <form onSubmit={sendOtp}>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Mobile Number</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-secondary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-500/10">
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-500">
                    <Phone size={15} className="text-secondary-600" /> +91
                  </span>
                  <span className="h-5 w-px bg-slate-200" />
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    className="w-full bg-transparent text-sm font-medium tracking-wide outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all hover:shadow-accent-500/40 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                >
                  <MessageSquare size={16} />
                  {sending ? 'Sending OTP…' : 'Send OTP'}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck size={12} className="text-teal-500" /> Demo mode — OTP is always <span className="font-bold text-slate-600">1234</span>
                </p>
              </form>
            ) : (
              <form onSubmit={verifyOtp}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Enter OTP</label>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="flex items-center gap-1 text-[11px] font-medium text-secondary-700 hover:underline"
                  >
                    <ArrowLeft size={11} /> Change number
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-secondary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-500/10">
                  <Lock size={16} className="shrink-0 text-secondary-600" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4-digit OTP"
                    inputMode="numeric"
                    className="w-full bg-transparent text-sm font-medium tracking-[0.4em] outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all hover:shadow-accent-500/40 active:scale-[0.98]"
                >
                  <LogIn size={16} /> Verify &amp; Login
                </button>
                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Demo OTP: <span className="font-bold tracking-widest text-secondary-700">1234</span>
                </p>
              </form>
            )}
          </div>

         
        </div>
      </div>
    </div>
  )
}