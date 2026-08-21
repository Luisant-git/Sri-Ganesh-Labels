import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import BackButton from '../components/BackButton'
import { formatINR } from '../utils/format'
import { toast } from '../components/Toast'

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totals, freeShippingThreshold, shippingFee } = useCart()
  const [popular, setPopular] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getStorefrontProducts()
      .then((data) => {
        if (!cancelled) setPopular(Array.isArray(data) ? data.slice(0, 4) : [])
      })
      .catch(() => {
        if (!cancelled) setPopular([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
          <ShoppingCart size={44} className="text-brand-300" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Looks like you haven't added any labels yet. Explore our premium collection and start shopping.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/products"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all duration-200 hover:bg-brand-800 active:scale-95"
          >
            <ShoppingBag size={17} /> Continue Shopping
          </Link>
          <Link
            to="/products?category=Thermal+Roll"
            className="rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Shop Thermal Rolls
          </Link>
        </div>

        <div className="mt-16 w-full">
          <h2 className="font-display text-lg font-bold text-slate-900">Popular right now</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const freeShippingEnabled = freeShippingThreshold > 0
  const shippingProgress = freeShippingEnabled ? Math.min(100, (totals.subtotal / freeShippingThreshold) * 100) : 0
  const remaining = freeShippingEnabled ? freeShippingThreshold - totals.subtotal : 0
  const isFreeShipping = freeShippingEnabled && totals.shipping === 0 && shippingFee > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Shopping Cart</h1>
            <p className="mt-1 text-sm text-slate-500">
              {totals.count} item{totals.count !== 1 ? 's' : ''} in your cart
            </p>
          </div>
        </div>
        <Link to="/products" className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">
          ← Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          {/* Free shipping progress */}
          {freeShippingEnabled && (
            <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              {remaining > 0 ? (
                <p className="text-sm font-medium text-brand-800">
                  <Truck size={15} className="mr-1.5 inline -translate-y-0.5" />
                  Add {formatINR(remaining)} more to get <span className="font-bold">FREE shipping</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-teal-700">
                  <Truck size={15} className="mr-1.5 inline -translate-y-0.5" />
                  Congratulations! You've unlocked FREE shipping.
                </p>
              )}
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity
              return (
                <div key={`${item.productId}::${item.option}`} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                  <Link to={`/products/${item.productId}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl border border-slate-200 object-cover sm:h-24 sm:w-24"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-display text-sm font-semibold text-slate-900 transition-colors hover:text-brand-700 sm:text-base"
                        >
                          {item.name}
                        </Link>
                        {item.option && item.option !== 'default' && (
                          <p className="mt-0.5 text-xs text-slate-500">Option: {item.option}</p>
                        )}
                      </div>
                      <p className="whitespace-nowrap font-display text-sm font-bold text-slate-900 sm:text-base">
                        {formatINR(lineTotal)}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-lg border border-slate-300">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) removeFromCart(item.productId, item.option)
                            else updateQuantity(item.productId, item.option, item.quantity - 1)
                          }}
                          aria-label="Decrease"
                          className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:text-brand-700"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.option, item.quantity + 1)}
                          aria-label="Increase"
                          className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:text-brand-700"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            removeFromCart(item.productId, item.option)
                            toast('Removed from cart')
                          }}
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-slate-900">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatINR(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-semibold text-slate-900">
                  {isFreeShipping ? (
                    <>
                      <span className="mr-1.5 text-slate-400 line-through">{formatINR(shippingFee)}</span>
                      <span className="text-teal-600">FREE</span>
                    </>
                  ) : (
                    formatINR(totals.shipping)
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-5">
              <span className="font-display text-base font-bold text-slate-900">Grand Total</span>
              <span className="font-display text-2xl font-bold text-brand-800">{formatINR(totals.total)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 active:scale-[0.98]"
            >
              Proceed to Checkout <ArrowRight size={17} />
            </button>
            <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-teal-500" /> Secure</span>
              <span className="flex items-center gap-1"><Truck size={13} className="text-brand-600" /> COD available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}import { getStorefrontProducts } from '../api/productApi'
