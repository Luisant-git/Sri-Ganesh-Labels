import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  ShoppingBag,
  PackageSearch,
  Wallet,
  CreditCard,
  MapPin,
  Calendar,
  Hash,
  BadgeCheck,
  Printer,
  Truck,
} from 'lucide-react'
import { formatINR, formatDate } from '../utils/format'

export default function OrderSuccess() {
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)

  useEffect(() => {
    if (!order) {
      try {
        const raw = localStorage.getItem('sgl_last_order')
        if (raw) setOrder(JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
  }, [order])

  if (!order) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <PackageSearch size={52} className="text-slate-300" />
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">No recent order</h1>
        <p className="mt-2 text-sm text-slate-500">Place an order to see your confirmation here.</p>
        <Link
          to="/products"
          className="mt-6 flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <ShoppingBag size={17} /> Shop Now
        </Link>
      </div>
    )
  }

  const steps = ['Order Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
  const currentStep = 0

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 lg:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="animate-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 size={44} className="text-teal-500" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Order Placed Successfully!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Thank you for shopping with Sri Ganesh Labels. Your order has been received successfully.
          </p>

          {/* Order info */}
          <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Hash size={16} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order ID</p>
                <p className="text-sm font-bold text-slate-900">{order.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Calendar size={16} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order Date</p>
                <p className="text-sm font-bold text-slate-900">{formatDate(order.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                {order.payment === 'Cash on Delivery' ? <Wallet size={16} /> : <CreditCard size={16} />}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment Method</p>
                <p className="text-sm font-bold text-slate-900">{order.payment}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Delivery To</p>
                <p className="truncate text-sm font-bold text-slate-900">
                  {order.address.fullName}, {order.address.city}, {order.address.pincode}
                </p>
              </div>
            </div>
            {order.gstin && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <BadgeCheck size={16} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">GSTIN</p>
                  <p className="text-sm font-bold text-slate-900">{order.gstin}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-5 text-left">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Printer size={16} className="text-brand-700" /> Order Items
            </p>
            <ul className="mt-4 space-y-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3">
                    <img src={it.image} alt={it.name} loading="lazy" className="h-11 w-11 rounded-lg border border-slate-200 object-cover" />
                    <span className="text-slate-700">
                      {it.name}
                      {it.option && it.option !== 'default' && (
                        <span className="block text-xs text-slate-400">{it.option}</span>
                      )}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        Qty: {it.qty} × {formatINR(it.price)}
                      </span>
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-right font-semibold text-slate-900">
                    {formatINR(it.price * it.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(order.totals.subtotal)}</span>
              </div>
              {(order.totals.shipping > 0 || order.totals.shippingRate > 0) && (
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  {order.totals.shipping === 0 ? (
                    <span className="font-semibold">
                      <span className="mr-1 text-slate-400 line-through">{formatINR(order.totals.shippingRate)}</span>
                      <span className="text-teal-600">FREE</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatINR(order.totals.shipping)}</span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between pt-1 text-sm font-semibold text-slate-700">
                <span>Order Total</span>
                <span className="font-display text-xl font-bold text-brand-800">{formatINR(order.totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline preview */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                    i <= currentStep ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className={`h-0.5 w-6 rounded ${i < currentStep ? 'bg-teal-400' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">Track your order in real time</p>

          {/* CTA */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              <ShoppingBag size={17} /> Continue Shopping
            </Link>
            <Link
              to="/order-tracking"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-700/25 transition-colors hover:bg-brand-800"
            >
              <Truck size={17} /> View Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}