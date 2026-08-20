import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  ShoppingBag,
  PackageSearch,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Phone,
  LogIn,
  MapPin,
  Home as HomeIcon,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

function HeroBreadcrumb({ current }) {
  return (
    <nav className="mt-3 inline-flex items-center gap-3">
      <Link
        to="/"
        className="group flex items-center gap-2 text-xs font-semibold text-secondary-200/80 transition-colors hover:text-white"
      >
        <HomeIcon size={13} className="text-accent-400 transition-transform duration-200 group-hover:-translate-y-0.5" />
        Home
      </Link>
      <span className="flex items-center">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent-400" />
        <span className="mx-2 text-[11px] text-accent-400">✦</span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent-400" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider text-white">{current}</span>
    </nav>
  )
}

function HeroHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 py-8 lg:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">{eyebrow}</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-100/90">{subtitle}</p>
        <HeroBreadcrumb current="My Account" />
      </div>
    </section>
  )
}

export default function Account() {
  const { getCartCount } = useCart()
  const { user, isLoggedIn, openLogin, logout } = useAuth()

  const cartCount = getCartCount()

  const [lastOrder] = useState(() => {
    try {
      const raw = localStorage.getItem('sgl_last_order')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const shipping = lastOrder?.address

  const quickActions = [
    {
      icon: PackageSearch,
      title: 'My Orders',
      desc: 'Track status of your placed orders',
      to: '/my-orders',
      accent: 'bg-violet-50 text-violet-600',
    },
    {
      icon: ShoppingBag,
      title: 'My Cart',
      desc: `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart`,
      to: '/cart',
      accent: 'bg-brand-50 text-brand-600',
    },
  ]

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] bg-slate-50 pb-16">
        <HeroHeader
          eyebrow="My Account"
          title="Welcome to My Account"
          subtitle="Login or create an account to track your orders, manage your cart and shop faster."
        />
        <div className="mx-auto mt-8 max-w-xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <User size={40} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-900">You are browsing as a guest</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Login or create an account to track your orders, manage your cart and shop faster.
            </p>
            <button
              onClick={() => openLogin(() => toast('Logged in!'))}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/30 transition-all hover:shadow-accent-500/40 active:scale-95"
            >
              <LogIn size={17} /> Login / Register
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-teal-500" /> Secure mobile number based login
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 pb-16">
      <HeroHeader
        eyebrow="Your Profile"
        title="My Account"
        subtitle="Manage your cart, track orders and keep your shopping details in one place."
      />

      <div className="mx-auto mt-8 grid max-w-4xl items-stretch gap-6 px-4 lg:grid-cols-[300px_1fr]">
        {/* Left sidebar: profile */}
        <aside className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="relative flex flex-1 flex-col items-center justify-center border-b border-slate-100 bg-slate-50/70 px-6 py-10 text-center">
            <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-brand-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-accent-100/60 blur-2xl" />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/25 ring-4 ring-white">
              <User size={44} />
            </span>
            <h2 className="relative mt-4 max-w-full truncate font-display text-xl font-bold text-slate-900">{user.name || 'Hello!'}</h2>
            <p className="relative mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Phone size={13} className="text-slate-400" /> +91 {user.mobile}
            </p>
            <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
              <ShieldCheck size={13} /> {user.name ? 'Verified Account' : 'Mobile Verified'}
            </span>
          </div>
          <div className="px-4 py-4">
            <button
              onClick={() => {
                logout()
                toast('Logged out')
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Right content */}
        <div className="flex min-w-0">
          <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25">
                <ShieldCheck size={22} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Welcome back, {user.name || 'customer'}!
                </h3>
                <p className="text-xs text-slate-500">Manage your orders and cart in one place.</p>
              </div>
            </div>
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="font-display text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {quickActions.map(({ icon: Icon, title, desc, to, accent }) => (
                <Link
                  key={title}
                  to={to}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                    <Icon size={20} />
                  </span>
                  <span className="flex-1 min-w-0 leading-tight">
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{desc}</span>
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
                  />
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <MapPin size={20} />
                </span>
<div className="flex-1 min-w-0 leading-tight">
                <span className="block text-sm font-semibold text-slate-900">Shipping Address</span>
                  {shipping ? (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {shipping.fullName} · {shipping.address} · {shipping.city}, {shipping.state} - {shipping.pincode}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      No address saved yet — add one at checkout.
                    </span>
                  )}
                </div>
                <Link
                  to="/checkout"
                  aria-label="Edit shipping address"
                  className="shrink-0 text-slate-300 transition-all hover:text-brand-600"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            <div className="mt-auto border-t border-slate-100 px-6 py-4">
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3 text-sm font-bold text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 active:scale-[0.98]"
              >
                <ShoppingBag size={17} /> Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}