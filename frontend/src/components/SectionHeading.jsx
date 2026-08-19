export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', light = false }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-2">{eyebrow}</p>
      )}
      <h2
        className={`font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      <div className={`mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 ${align === 'center' ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className={`mt-4 text-sm sm:text-base ${light ? 'text-brand-100' : 'text-slate-500'}`}>{subtitle}</p>
      )}
    </div>
  )
}