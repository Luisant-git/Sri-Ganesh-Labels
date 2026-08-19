import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('sgl:toast', { detail: { message, type } }))
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, ...e.detail }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 2600)
    }
    window.addEventListener('sgl:toast', handler)
    return () => window.removeEventListener('sgl:toast', handler)
  }, [])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col items-end gap-2 sm:right-5">
      {toasts.map((t) => {
        const isError = t.type === 'error'
        return (
          <div
            key={t.id}
            className={`animate-pop flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl shadow-slate-900/10 ${
              isError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {isError ? (
              <XCircle size={18} className="shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 text-green-600" />
            )}
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}