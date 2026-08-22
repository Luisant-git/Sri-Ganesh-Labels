import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Truck,
  CheckCircle2,
  Package,
  ShoppingBag,
  Search,
  PackageX,
  Home,
  Wallet,
  CreditCard,
  BadgeCheck,
  Printer,
  MapPin,
  Store,
  Banknote,
  Loader2,
} from 'lucide-react'
import { formatINR, formatDate } from '../utils/format'
import BackButton from '../components/BackButton'
import { getPublicOrder } from '../api/orderApi'

const STORE = {
  name: 'Sri Ganesh Labels',
  address: '300, Cherry Road, Salem-636007, Tamil Nadu',
  phone: 'Ph: 0427-4030892 · Cen: 8754030968 · Off: 9443665335',
  email: 'sriganeshlabelssale@gmail.com',
}

const STEPS = [
  { icon: CheckCircle2, label: 'Order Confirmed', desc: 'Your order has been received' },
  { icon: Package, label: 'Processing', desc: 'We are preparing your labels' },
  { icon: Truck, label: 'Shipped', desc: 'Handed over to courier' },
  { icon: Home, label: 'Out for Delivery', desc: 'Out for delivery to your address' },
  { icon: CheckCircle2, label: 'Delivered', desc: 'Delivered successfully' },
]

const buildSteps = (order) => {
  if (!order) return STEPS.map((s) => ({ ...s, done: false, active: false }))
  const status = order.status || 'Placed'
  if (status === 'Cancelled' || status === 'CODReturn') {
    return [
      { icon: CheckCircle2, label: 'Order Confirmed', desc: 'Your order has been received', done: true, active: false },
      {
        icon: PackageX,
        label: status === 'Cancelled' ? 'Cancelled' : 'COD Return',
        desc: status === 'Cancelled' ? order.cancelRemarks || 'Your order has been cancelled.' : order.codReturnRemarks || 'Package returned to origin.',
        done: true,
        active: true,
        isAlert: true,
      },
    ]
  }
  const stepIndex = {
    Placed: 0,
    Pending: 0,
    Processing: 1,
    Accepted: 1,
    Shipped: 2,
    'Out for Delivery': 3,
    Delivered: 4,
  }[status] ?? 0
  const shippedDesc = order.courierName || order.trackingId
    ? `${order.courierName ? `via ${order.courierName}` : ''}${order.trackingId ? ` · Tracking ID: ${order.trackingId}` : ''}`.trim()
    : 'Handed over to courier'
  return [
    { icon: CheckCircle2, label: 'Order Confirmed', desc: 'Your order has been received', done: stepIndex >= 1, active: stepIndex === 0 },
    { icon: Package, label: 'Processing', desc: 'We are preparing your labels', done: stepIndex >= 2, active: stepIndex === 1 },
    { icon: Truck, label: 'Shipped', desc: shippedDesc, done: stepIndex >= 3, active: stepIndex === 2, link: order.trackingLink },
    { icon: Home, label: 'Out for Delivery', desc: 'Out for delivery to your address', done: stepIndex >= 4, active: stepIndex === 3 },
    { icon: CheckCircle2, label: 'Delivered', desc: 'Delivered successfully', done: stepIndex >= 5, active: stepIndex === 4 },
  ]
}

const formatAddress = (a) => {
  if (!a) return 'No shipping address saved.'
  const lines = [
    a.fullName,
    a.address,
    [a.city, a.state].filter(Boolean).join(', '),
    a.pincode,
  ]
  return lines.filter(Boolean).join(' · ')
}

const normalizeOrder = (o) => {
  const address = o.shippingAddress || {}
  const items = (o.items || []).map((it) => ({
    name: it.name || 'Product',
    option: it.size || it.color || '',
    qty: it.quantity || 1,
    price: Number(it.price) || 0,
    originalPrice: 0,
    image: it.imageUrl || '',
    productId: it.productId,
    weight: Number(it.weight ?? it.product?.weight) || 0,
  }))
  return {
    id: o.id,
    status: o.status || 'Placed',
    date: o.createdAt,
    payment: (o.paymentMethod || 'cod') === 'cod' ? 'Cash on Delivery' : 'Online Payment',
    items,
    totals: {
      subtotal: Number(o.subtotal) || 0,
      shipping: Number(o.deliveryFee) || 0,
      shippingRate: Number(o.deliveryFee) || 0,
      total: Number(o.total) || 0,
    },
    address: {
      fullName: address.fullName || address.name || '',
      address: address.addressLine1 || address.addressLine || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      mobile: address.mobile || '',
      deliveryMethod: address.deliveryMethod || '',
      courierPartner: address.courierPartner || null,
    },
    invoiceUrl: o.invoiceUrl || null,
    gstin: o.gstin || '',
    cancelRemarks: o.cancelRemarks || '',
    codReturnRemarks: o.codReturnRemarks || '',
    courierName: o.courierName || '',
    trackingId: o.trackingId || '',
    trackingLink: o.trackingLink || '',
    createdAt: o.createdAt,
  }
}

const localOrder = () => {
  try {
    const raw = localStorage.getItem('sgl_last_order')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams()
  const urlOrderId = searchParams.get('id')
  const [order, setOrder] = useState(null)
  const [orderIdInput, setOrderIdInput] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (urlOrderId && /^\d+$/.test(String(urlOrderId))) {
      setOrderIdInput(String(urlOrderId))
      getPublicOrder(String(urlOrderId))
        .then((o) => {
          if (!cancelled) {
            setOrder(normalizeOrder(o))
            setSearched(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            const local = localOrder()
            if (local && String(local.id).toUpperCase() === String(urlOrderId).toUpperCase()) setOrder(local)
            else setOrder(null)
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
    const local = localOrder()
    if (local) {
      setOrderIdInput(local.id || '')
      if (!cancelled && /^\d+$/.test(String(local.id || ''))) {
        getPublicOrder(String(local.id))
          .then((o) => {
            if (!cancelled) setOrder(normalizeOrder(o))
          })
          .catch(() => {
            if (!cancelled) setOrder(local)
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      } else {
        setOrder(local)
        setLoading(false)
      }
    } else {
      setOrder(null)
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [urlOrderId])

  const handleSearch = (e) => {
    e.preventDefault()
    const id = orderIdInput.trim().toUpperCase()
    setSearched(true)
    setLoading(true)
    if (/^\d+$/.test(id)) {
      getPublicOrder(id)
        .then((o) => {
          setOrder(normalizeOrder(o))
          setSearched(false)
        })
        .catch(() => {
          const local = localOrder()
          if (local && String(local.id).toUpperCase() === id) setOrder(local)
          else setOrder(null)
        })
        .finally(() => setLoading(false))
    } else {
      const local = localOrder()
      if (local && String(local.id).toUpperCase() === id) setOrder(local)
      else setOrder(null)
      setLoading(false)
    }
  }

  const status = order?.status || 'Placed'
  const steps = buildSteps(order)

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
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

        {loading ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Loader2 size={40} className="animate-spin text-brand-500" />
            <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">Loading your order...</h3>
            <p className="mt-1 text-sm text-slate-500">Fetching the latest status from the server.</p>
          </div>
        ) : order ? (
          <div className="mt-8 space-y-6">
            {/* Order card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Order header */}
              <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((it, i) => (
                    <Link
                      key={i}
                      to={it.productId ? `/products/${it.productId}` : '#'}
                      className="pointer-events-auto"
                    >
                      <img
                        src={it.image}
                        alt={it.name}
                        loading="lazy"
                        className="h-12 w-12 rounded-full border-2 border-white object-cover transition-transform duration-200 hover:scale-110"
                      />
                    </Link>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-bold text-slate-900">Order #{order.id}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                      <Package size={11} /> {status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {order.items.length} items · {order.items.reduce((s, i) => s + (Number(i.weight) || 0) * i.qty, 0).toFixed(2)} kg · {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-brand-800">{formatINR(order.totals.total)}</p>
                  <p className="text-[11px] text-slate-500">Total paid</p>
                </div>
              </div>

{/* Track Shipment + Order details in one grid */}
              <div className="grid gap-8 border-t border-slate-100 p-5 sm:p-6 lg:grid-cols-3">
                {/* Order details (stacked: items then summary) */}
                <div className="space-y-8 lg:col-span-2">
                  {/* Left: Items + From/To + Invoice */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</p>
                    <div className="space-y-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex gap-3">
                          {it.productId ? (
                            <Link to={`/products/${it.productId}`} className="shrink-0">
                              <img
                                src={it.image}
                                alt={it.name}
                                className="h-14 w-14 rounded-lg border border-slate-200 object-cover transition-transform duration-200 hover:scale-105"
                              />
                            </Link>
                          ) : (
                            <img
                              src={it.image}
                              alt={it.name}
                              loading="lazy"
                              className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">{it.name}</p>
                            {it.option && it.option !== 'default' && <p className="text-xs text-slate-400">{it.option}</p>}
                            <p className="text-xs text-slate-500">Qty {it.qty} × {formatINR(it.price)}</p>
                            {Number(it.weight) > 0 && (
                              <p className="text-xs text-slate-400">Weight: {(Number(it.weight) * it.qty).toFixed(2)} kg</p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatINR(it.price * it.qty)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <Store size={12} /> {STORE.name}
                      </p>
                      <p className="text-xs text-slate-600">{STORE.address}</p>
                      <p className="text-xs text-slate-600">{STORE.phone}</p>
                      <p className="text-xs text-slate-600">{STORE.email}</p>
                    </div>

                    <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <MapPin size={12} /> Shipping Address
                    </p>
                    <p className="text-sm text-slate-700">{formatAddress(order.address)}</p>

                    {(order.invoiceUrl || order.invoice) && status !== 'Cancelled' && status !== 'COD Return' && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <a
                          href={order.invoiceUrl || order.invoice}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
                        >
                          <Printer size={15} /> Download Invoice
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right: Summary + Payment */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Order Summary</p>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatINR(order.totals.subtotal)}</span>
                      </div>
                      {(order.address?.deliveryMethod === 'Courier Partner' || order.totals.shipping > 0 || order.totals.shippingRate > 0) && (
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          {order.address?.deliveryMethod === 'Courier Partner' ? (
                            <span className="font-semibold italic text-slate-500">
                              As per {order.address.courierPartner || 'courier partner'} charges
                            </span>
                          ) : order.totals.shipping === 0 ? (
                            <span className="font-semibold">
                              <span className="mr-1 text-slate-400 line-through">{formatINR(order.totals.shippingRate)}</span>
                              <span className="text-teal-600">FREE</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-900">{formatINR(order.totals.shipping)}</span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Total Weight</span>
                        <span className="font-semibold text-slate-900">{order.items.reduce((s, i) => s + (Number(i.weight) || 0) * i.qty, 0).toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between font-semibold text-brand-800">
                        <span>Total</span>
                        <span>{formatINR(order.totals.total)}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-4">
                      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <CreditCard size={12} /> Payment Details
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        {order.payment === 'Cash on Delivery' ? (
                          <Banknote size={15} className="text-teal-600" />
                        ) : (
                          <CreditCard size={15} className="text-brand-700" />
                        )}
                        <span className="font-medium text-slate-800 capitalize">{order.payment}</span>
                      </div>
                      {order.gstin && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                          <BadgeCheck size={14} className="text-brand-600" /> GSTIN: {order.gstin}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Track Shipment (last) */}
                <div className="lg:col-span-1">
                  <h4 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Truck size={14} className="text-brand-700" /> Track Shipment
                  </h4>
                  <div className="relative">
                    <div className="absolute bottom-2 left-[15px] top-2 z-0 w-0.5 bg-slate-200" />
                    {steps.map((s, i) => (
                      <div key={s.label} className="relative z-10 flex items-start gap-4 pb-7 last:pb-0">
                        <span
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            s.done
                              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                              : s.active
                              ? s.isAlert
                                ? 'animate-pulse bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                : 'animate-pulse bg-brand-700 text-white shadow-lg shadow-brand-700/30'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <s.icon size={15} />
                        </span>
                        <div className="pt-0.5">
                          <p className={`text-sm font-bold ${s.active ? (s.isAlert ? 'text-rose-600' : 'text-brand-800') : s.done ? 'text-slate-900' : 'text-slate-400'}`}>
                            {s.label}
                            {s.active && (
                              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${s.isAlert ? 'bg-rose-500' : 'bg-accent-500'}`}>
                                {s.isAlert ? 'Alert' : 'Current'}
                              </span>
                            )}
                          </p>
                          <p className={`mt-0.5 text-xs ${s.done || s.active ? 'text-slate-500' : 'text-slate-400'}`}>{s.desc}</p>
                          {s.link && (
                            <a
                              href={s.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                            >
                              Track Package ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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