import { Link } from 'react-router-dom'
import { User, ShoppingBag, Heart, Truck, PackageSearch, ChevronRight, ShieldCheck, LogOut, Phone } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

export default function Account() {
  const { getCartCount } = useCart()
  const { count } = useWishlist()
  const { user, isLoggedIn, login, openLogin, logout } = useAuth()

  const links = [
    {
      icon: PackageSearch,
      title: 'My Orders',
      desc: 'Track your placed orders',
      to: '/order-tracking',
    },
    {
      icon: ShoppingBag,
      title: 'My Cart',
      desc: `${getCartCount()} item${getCartCount() !== 1 ? 's' : ''} in your cart`,
      to: '/cart',
    },
    {
      icon: Heart,
      title: 'My Wishlist',
      desc: `${count} saved product${count !== 1 ? 's' : ''}`,
      to: '/wishlist',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 lg:py-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {user ? <Phone size={38} /> : <User size={40} />}
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          {user ? 'Welcome!' : 'Guest Account'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          {user ? (
            <>
              You are logged in with <span className="font-semibold text-brand-700">{user.mobile}</span>. Shop, add to
              cart and place orders easily.
            </>
          ) : (
            'Login with your mobile number to add products to cart, wishlist or buy instantly.'
          )}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout()
                toast('Logged out')
              }}
              className="flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <button
              onClick={() => openLogin(() => toast('Logged in!'))}
              className="flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              <Phone size={14} /> Login with mobile
            </button>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700">
            <ShieldCheck size={14} /> OTP-based login
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {links.map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={title}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-700/25 transition-transform group-hover:scale-110">
              <Icon size={20} />
            </span>
            <h3 className="mt-4 flex items-center gap-1 font-display text-sm font-bold text-slate-900">
              {title}
              <ChevronRight size={15} className="text-slate-300 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 active:scale-95"
        >
          <ShoppingBag size={17} /> Start Shopping
        </Link>
      </div>
    </div>
  )
}