import { Star } from 'lucide-react'

export default function RatingStars({ rating = 0, size = 14, reviews }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  return (
    <span className="inline-flex items-center gap-2">
      <Star size={size} fill="currentColor" strokeWidth={0} className="shrink-0 text-accent-500" />
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-xs text-slate-400">({reviews} reviews)</span>
      )}
    </span>
  )
}