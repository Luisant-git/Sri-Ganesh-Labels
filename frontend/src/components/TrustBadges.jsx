import { Truck, ShieldCheck, Wallet, RotateCcw } from 'lucide-react'

const badges = [
  { icon: Truck, title: 'Fast Shipping', desc: 'Pan-India delivery' },
  { icon: Wallet, title: 'COD Available', desc: 'Pay on delivery' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% safe checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Simple refund policy' },
]

export default function TrustBadges({ compact = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {badges.map(({ icon: Icon, title, desc }, i) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              i % 2 === 0 ? 'bg-brand-50 text-brand-700' : 'bg-teal-50 text-teal-600'
            }`}
          >
            <Icon size={19} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">{title}</span>
            {!compact && <span className="block text-xs text-slate-500">{desc}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}