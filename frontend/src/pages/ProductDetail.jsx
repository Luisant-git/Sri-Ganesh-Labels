import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  ArrowLeft,
  PackageCheck,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { getProductById, getRelatedProducts } from '../data/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR, formatINRDecimal } from '../utils/format'
import { toast } from '../components/Toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = getProductById(id)
  const { addToCart } = useCart()
  const { isLoggedIn, openLogin } = useAuth()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOption, setSelectedOption] = useState(product?.options?.[0] || '')
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)

  const gallery = useMemo(
    () => (product ? [product.image, ...(product.gallery || []).filter((g) => g !== product.image)].slice(0, 5) : []),
    [product]
  )

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

  const related = getRelatedProducts(product)

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
        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center lg:py-16">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-400">
            {product.category}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
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
                  <img src={img} alt={`${product.name} ${i + 1}`} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">{product.category}</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{product.name}</h1>

            {product.rate != null && product.gstPercentage != null && product.totalValue != null ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pricing</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Rate</span>
                    <span className="font-display text-sm font-bold text-slate-900">
                      {formatINRDecimal(product.rate * qty)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">GST</span>
                    <span className="font-display text-sm font-bold text-slate-900">
                      {product.gstPercentage}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-display text-sm font-bold text-slate-900">Total Price</span>
                  <span className="font-display text-base font-bold text-brand-800">
                    {formatINRDecimal(product.totalValue * qty)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-3xl font-bold text-brand-800 sm:text-4xl">
                  {formatINR(product.price)}
                </span>
              </div>
            )}

            <p className="mt-6 text-sm leading-relaxed text-slate-600">{product.description}</p>

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
    </div>
  )
}