import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

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
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col items-end gap-2 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-pop flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20"
        >
          <CheckCircle2 size={18} className="shrink-0 text-teal-400" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}