import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  CheckCircle2,
  Package,
  ShoppingBag,
  Search,
  PackageX,
  Home,
  MapPin,
  Wallet,
  CreditCard,
  BadgeCheck,
} from 'lucide-react'
import { formatINR, formatDate } from '../utils/format'
import BackButton from '../components/BackButton'

const steps = [
  { icon: CheckCircle2, label: 'Order Confirmed', desc: 'Your order has been received' },
  { icon: Package, label: 'Processing', desc: 'We are preparing your labels' },
  { icon: Truck, label: 'Shipped', desc: 'Handed over to courier' },
  { icon: Home, label: 'Out for Delivery', desc: 'Out for delivery to your address' },
  { icon: CheckCircle2, label: 'Delivered', desc: 'Delivered successfully' },
]

export default function OrderTracking() {
  const [order, setOrder] = useState(null)
  const [orderIdInput, setOrderIdInput] = useState('')
  const [searched, setSearched] = useState(false)
  const [currentStep] = useState(1)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sgl_last_order')
      if (raw) {
        const o = JSON.parse(raw)
        setOrder(o)
        setOrderIdInput(o.id)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearched(true)
    try {
      const raw = localStorage.getItem('sgl_last_order')
      if (raw) {
        const o = JSON.parse(raw)
        if (o.id === orderIdInput.trim().toUpperCase()) {
          setOrder(o)
          setSearched(false)
          return
        }
      }
    } catch {
      /* ignore */
    }
    setOrder(null)
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Track Your Order</h1>
              <p className="mt-1 text-sm text-slate-500">Follow the live status of your order with Sri Ganesh Labels.</p>
            </div>
          </div>
        </div>

        {/* Search order */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search size={16} className="text-slate-400" />
            <input
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              placeholder="Enter order ID (e.g. SGL123456)"
              className="w-full bg-transparent text-sm outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Track
          </button>
        </form>

        {order ? (
          <div className="mt-8 space-y-6">
            {/* Order header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order ID</p>
                  <p className="font-display text-lg font-bold text-brand-800">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Placed on</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(order.date)}</p>
                </div>
                <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">Order Total</p>
                  <p className="font-display text-lg font-bold text-brand-800">{formatINR(order.totals.total)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-dashed border-slate-200 pt-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  {order.payment === 'Cash on Delivery' ? <Wallet size={13} className="text-teal-600" /> : <CreditCard size={13} className="text-brand-600" />}
                  {order.payment}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-accent-600" />
                  {order.address.fullName}, {order.address.city} - {order.address.pincode}
                </span>
                {order.gstin && (
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-brand-600" /> GSTIN: {order.gstin}
                  </span>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">Order Status</h2>
              <p className="mt-1 text-xs font-semibold text-brand-700">
                Current: {steps[currentStep].label}
              </p>
              <div className="mt-8">
                {steps.map((s, i) => {
                  const done = i < currentStep
                  const active = i === currentStep
                  return (
                    <div key={s.label} className="relative flex gap-5 pb-10 last:pb-0">
                      {i < steps.length - 1 && (
                        <span
                          className={`absolute left-[19px] top-11 h-full w-0.5 rounded-full ${
                            done ? 'bg-teal-400' : 'bg-slate-200'
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          done
                            ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                            : active
                            ? 'animate-pulse border-brand-600 bg-brand-700 text-white shadow-lg shadow-brand-700/30'
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        <s.icon size={17} />
                      </span>
                      <div className="pt-1">
                        <p className={`font-display text-sm font-bold ${active ? 'text-brand-800' : done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.label}
                          {active && (
                            <span className="ml-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              CURRENT
                            </span>
                          )}
                        </p>
                        <p className={`mt-0.5 text-xs ${done || active ? 'text-slate-500' : 'text-slate-400'}`}>{s.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-base font-bold text-slate-900">Items in this order</h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <img src={it.image} alt={it.name} className="h-11 w-11 rounded-lg border border-slate-200 object-cover" />
                      <span className="text-slate-700">
                        {it.name}
                        {it.option && it.option !== 'default' && <span className="block text-xs text-slate-400">{it.option}</span>}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-semibold text-slate-900">
                      {it.qty} × {formatINR(it.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                <ShoppingBag size={17} /> Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <PackageX size={48} className="text-slate-300" />
            <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
              {searched ? 'Order not found' : 'No order to track yet'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {searched
                ? 'We could not find an order with that ID on this device. Check the order ID and try again.'
                : 'Place an order and track its journey from confirmation to delivery right here.'}
            </p>
            <Link
              to="/products"
              className="mt-5 flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <ShoppingBag size={16} /> Shop Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}