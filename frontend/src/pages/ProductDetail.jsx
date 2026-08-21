import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  ArrowLeft,
  PackageCheck,
  Loader2,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { getStorefrontProduct, getStorefrontProducts } from '../api/productApi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/format'
import { getTierUnitPrice } from '../utils/pricing'
import { toast } from '../components/Toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLoggedIn, openLogin } = useAuth()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOption, setSelectedOption] = useState('')
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getStorefrontProduct(id), getStorefrontProducts()])
      .then(([prod, all]) => {
        if (cancelled) return
        setProduct(prod)
        setSelectedImage(0)
        setQty(1)
        if (prod) {
          setSelectedOption(prod.options?.[0] || '')
          const same = (all || []).filter((p) => p.id !== prod.id && p.category === prod.category)
          const others = (all || []).filter((p) => p.id !== prod.id && p.category !== prod.category)
          setRelated([...same, ...others].slice(0, 4))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null)
          setRelated([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const gallery = useMemo(
    () => (product ? [product.image, ...(product.gallery || []).filter((g) => g !== product.image)].slice(0, 5) : []),
    [product]
  )

  const tiers = product?.quantityPrices || []
  const unitPrice = product ? getTierUnitPrice(tiers, product.price, qty) ?? product.price : 0
  const activeTier = [...tiers]
    .sort((a, b) => a.quantity - b.quantity)
    .filter((t) => qty >= t.quantity)
    .pop()

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <Loader2 size={44} className="animate-spin text-brand-700" />
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Loading product...</h1>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <PackageCheck size={52} className="text-slate-300" />
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-2 text-slate-500">The product you are looking for does not exist.</p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  const requireLogin = (action) => {
    if (isLoggedIn) action()
    else openLogin(action)
  }

  const handleAdd = () => {
    requireLogin(() => {
      addToCart(product, qty, selectedOption)
      toast(`${qty} × ${product.name} added to cart`)
    })
  }

  const handleBuyNow = () => {
    requireLogin(() => {
      addToCart(product, qty, selectedOption)
      navigate('/checkout')
    })
  }

  const mouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <div className="bg-slate-50/60">
      {/* Page header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <button
          onClick={() => navigate(-1)}
          className="group absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-all duration-200 hover:bg-white/25 active:scale-95 lg:left-8 lg:top-6"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
        <div className="relative mx-auto max-w-7xl px-4 py-8 text-center lg:py-10">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-400">
            {product.category}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <div className="mt-0 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <div
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={mouseMove}
            >
              <img
                src={gallery[selectedImage]}
                alt={product.name}
                className="aspect-square w-full object-cover transition-transform duration-300"
                style={{
                  transformOrigin: `${zoom ? 'var(--mx, 50%) var(--my, 50%)' : 'center'}`,
                  transform: zoom ? 'scale(1.7)' : 'scale(1)',
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {gallery.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    selectedImage === i
                      ? 'border-brand-600 shadow-lg shadow-brand-600/20'
                      : 'border-slate-200 opacity-80 hover:border-brand-300 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">{product.category}</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-brand-800 sm:text-4xl">{formatINR(unitPrice)}</span>
              {activeTier && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {formatINR(activeTier.totalValue)} total for {activeTier.quantity} pcs
                </span>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-600">{product.description}</p>

            {/* Quantity pricing tiers */}
            {tiers.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">Quantity Price</p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {[...tiers]
                    .sort((a, b) => a.quantity - b.quantity)
                    .map((t) => {
                      const isActive = activeTier && activeTier.quantity === t.quantity
                      const each = Math.round(((t.totalValue ?? t.price) / t.quantity) * 100) / 100
                      return (
                        <button
                          key={t.quantity}
                          type="button"
                          onClick={() => setQty(t.quantity)}
                          className={`flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm transition-all duration-200 ${
                            isActive
                              ? 'border-brand-600 bg-brand-50 shadow-md shadow-brand-600/10'
                              : 'border-slate-200 bg-white hover:border-brand-300'
                          }`}
                        >
                          <span className="font-semibold text-slate-700">Buy {t.quantity}</span>
                          <span className="text-right">
                            <span className="block font-bold text-brand-800">{formatINR(t.totalValue ?? t.price)}</span>
                            <span className="block text-[11px] font-medium text-slate-400">{formatINR(each)} each</span>
                          </span>
                        </button>
                      )
                    })}
                </div>
                <p className="mt-2 text-xs text-slate-400">Tap a quantity — the amount shown is the total price for that quantity.</p>
              </div>
            )}

            {/* Options */}
            {product.options?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">
                  Select Option <span className="font-normal text-slate-400">({selectedOption || 'none'})</span>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {product.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedOption === opt
                          ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-md shadow-brand-600/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-slate-300 bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition-colors hover:text-brand-700"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition-colors hover:text-brand-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-slate-500">Total:</span>
                <span className="font-display text-lg font-bold text-brand-800">{formatINR(unitPrice * qty)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-700/25 transition-all duration-200 hover:bg-brand-800 active:scale-[0.98]"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 active:scale-[0.98]"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">You may also like</h2>
              <Link to="/products" className="hidden text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 sm:block">
                View all →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}