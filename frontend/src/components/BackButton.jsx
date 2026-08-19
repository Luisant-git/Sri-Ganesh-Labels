import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(fallback))}
      aria-label="Go back"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      <ArrowLeft size={18} />
    </button>
  )
}