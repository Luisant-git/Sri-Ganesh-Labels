import { Link } from 'react-router-dom'
import { Home as HomeIcon } from 'lucide-react'

export default function LegalLayout({ eyebrow, title, subtitle, crumb, children }) {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 py-8 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">{eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-100/90">{subtitle}</p>
          )}
          <nav className="mt-3 inline-flex items-center gap-3">
            <Link
              to="/"
              className="group flex items-center gap-2 text-xs font-semibold text-secondary-200/80 transition-colors hover:text-white"
            >
              <HomeIcon size={13} className="text-accent-400 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Home
            </Link>
            <span className="flex items-center">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent-400" />
              <span className="mx-2 text-[11px] text-accent-400">✦</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white">{crumb}</span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">{children}</div>
      </section>
    </div>
  )
}
