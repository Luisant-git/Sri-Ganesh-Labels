import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useWishlist } from '../context/WishlistContext'
import { products } from '../data/products'

export default function Wishlist() {
  const { ids } = useWishlist()
  const items = products.filter((p) => ids.includes(p.id))

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-50">
          <Heart size={44} className="text-rose-300" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Your wishlist is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Tap the heart icon on any product to save it here for later.
        </p>
        <Link
          to="/products"
          className="mt-7 flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-colors hover:bg-brand-800"
        >
          <ShoppingBag size={17} /> Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">
        {items.length} saved product{items.length !== 1 ? 's' : ''}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}