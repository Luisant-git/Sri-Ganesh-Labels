import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Search,
  PackageX,
  Truck,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Clock,
  X,
} from 'lucide-react'
import { formatINR, formatDate } from '../utils/format'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/orderApi'

const FILTERS = [
  'All',
  'Placed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'COD Return',
]

const STATUS_STYLES = {
  Placed: 'bg-sky-100 text-sky-700',
  Pending: 'bg-sky-100 text-sky-700',
  Processing: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-violet-100 text-violet-700',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  CODReturn: 'bg-rose-100 text-rose-700',
}

const STATUS_ICON = {
  Placed: Clock,
  Pending: Clock,
  Processing: Package,
  Accepted: Package,
  Shipped: Truck,
  'Out for Delivery': Truck,
  Delivered: CheckCircle2,
  Cancelled: X,
  CODReturn: X,
}

const statusLabel = (s) => (s === 'CODReturn' ? 'COD Return' : s || 'Placed')

const normalizeOrder = (o) => {
  const address = o.shippingAddress || {}
  const items = (o.items || []).map((it) => ({
    name: it.name || 'Product',
    option: it.size || it.color || '',
    qty: it.quantity || 1,
    price: Number(it.price) || 0,
    image: it.imageUrl || '',
  }))
  return {
    id: o.id,
    status: statusLabel(o.status),
    date: o.createdAt,
    items,
    totals: {
      subtotal: Number(o.subtotal) || 0,
      shipping: Number(o.deliveryFee) || 0,
      total: Number(o.total) || 0,
    },
    payment: (o.paymentMethod || 'cod') === 'cod' ? 'Cash on Delivery' : 'Online Payment',
    city: address.city || '',
  }
}

export default function MyOrders() {
  const { isLoggedIn, openLogin } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isLoggedIn) return
    let cancelled = false
    setLoading(true)
    getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data.map(normalizeOrder))
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'All' || o.status === filter
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      String(o.id).toLowerCase().includes(q) ||
      String(o.totals.total).includes(q.replace(/[^0-9.]/g, '')) ||
      (o.city || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] bg-slate-50 pb-16 pt-10">
        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Package size={40} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-900">Login to view your orders</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Login or create an account to see all your orders in one place.
            </p>
            <button
              onClick={() => openLogin()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
            >
              Login / Register
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-4xl px-4 py-10 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Orders</h1>
              <p className="mt-1 text-sm text-slate-500">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order id, city, total"
              className="w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const label = f === 'All' ? 'All' : f
            const count = f === 'All' ? orders.length : counts[f] || 0
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-brand-700 bg-brand-700 text-white shadow-md shadow-brand-700/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Orders list */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <Loader2 size={36} className="animate-spin text-brand-500" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading your orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <PackageX size={44} className="text-slate-300" />
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                {filter !== 'All' || search ? 'No orders match your filter' : 'No orders yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {filter !== 'All' || search
                  ? 'Try a different filter or search term.'
                  : 'When you place an order, it will show up here.'}
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                <Package size={16} /> Start Shopping
              </Link>
            </div>
          ) : (
            filtered.map((o) => {
              const StatusIcon = STATUS_ICON[o.status] || Package
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/order-tracking?id=${o.id}`)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-brand-300 hover:shadow-md sm:p-5"
                >
                  {/* Thumbnails */}
                  <div className="flex shrink-0 -space-x-3">
                    {(o.items.length ? o.items.slice(0, 3) : [{ image: '' }]).map((it, i) => (
                      <span
                        key={i}
                        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-slate-100 text-slate-300 shadow-sm ${
                          i > 0 ? 'relative z-10' : ''
                        }`}
                      >
                        {it.image ? (
                          <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <Package size={18} />
                        )}
                      </span>
                    ))}
                    {o.items.length > 3 && (
                      <span className="relative z-20 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-brand-700 text-[10px] font-bold text-white shadow-sm">
                        +{o.items.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Order #{o.id}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        <StatusIcon size={11} /> {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(o.date)} · {o.items.reduce((s, i) => s + i.qty, 0)} item{o.items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''} · {o.payment}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {o.items.map((i) => i.name).join(', ')}
                    </p>
                  </div>

                  {/* Total + chevron */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-brand-800">{formatINR(o.totals.total)}</p>
                    <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 transition-transform group-hover:translate-x-0.5">
                      View <ChevronRight size={13} />
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}