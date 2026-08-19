import { Link } from 'react-router-dom'
import { SearchX, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
        <SearchX size={44} className="text-brand-300" />
      </span>
      <h1 className="mt-6 font-display text-5xl font-bold text-brand-800">404</h1>
      <p className="mt-2 font-display text-xl font-semibold text-slate-900">Page not found</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you are looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Go Home
        </Link>
        <Link
          to="/products"
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ShoppingBag size={16} /> Shop Products
        </Link>
      </div>
    </div>
  )
}