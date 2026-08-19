import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Zap } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/format'
import { toast } from './Toast'

export default function ProductCard({ product, centered = false }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { isLoggedIn, openLogin } = useAuth()
  const navigate = useNavigate()
  const wished = isWishlisted(product.id)

  const requireLogin = (action) => {
    if (isLoggedIn) action()
    else openLogin(action)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requireLogin(() => {
      addToCart(product, 1, product.options?.[0])
      toast(`${product.name} added to cart`)
    })
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requireLogin(() => {
      addToCart(product, 1, product.options?.[0])
      navigate('/checkout')
    })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requireLogin(() => {
      toggleWishlist(product.id)
      toast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'wishlist')
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            wished ? 'bg-white/95 text-rose-500' : 'bg-white/95 text-slate-600 hover:bg-rose-50 hover:text-rose-500'
          }`}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className={`flex flex-1 flex-col p-4 ${centered ? 'items-center text-center' : ''}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{product.category}</p>
        <Link
          to={`/products/${product.id}`}
          className="mt-1 font-display text-sm font-semibold text-slate-900 transition-colors hover:text-brand-700 sm:text-[15px]"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-brand-800">{formatINR(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">{formatINR(product.originalPrice)}</span>
          )}
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-brand-800 active:scale-95"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-accent-500 bg-accent-500 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-accent-600 active:scale-95"
          >
            <Zap size={14} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}