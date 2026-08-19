import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  Phone,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/products'
import { formatINR } from '../utils/format'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact Us' },
]

function CartButton({ className = '' }) {
  const { getCartCount } = useCart()
  const count = getCartCount()
  return (
    <Link
      to="/cart"
      aria-label="Cart"
      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700 ${className}`}
    >
      <ShoppingCart size={21} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white shadow-md shadow-accent-500/40">
          {count}
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count: wishCount } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else setQuery('')
  }, [searchOpen])

  const results = query.trim()
    ? products
        .filter((p) =>
          [p.name, p.category, p.description].join(' ').toLowerCase().includes(query.trim().toLowerCase())
        )
        .slice(0, 6)
    : []

  const submitSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchOpen(false)
    navigate(`/products?search=${encodeURIComponent(query.trim())}`)
  }

  const navCls = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'
    } after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-full after:bg-accent-500 after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    }`

  return (
    <>
      <header className="sticky top-0 z-50">
      {/* Main bar */}
      <div
        className={`border-b bg-white/95 backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'border-slate-200 shadow-lg shadow-slate-900/5' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Sri Ganesh Labels - Home">
            <img src="/images/LOgo.png" alt="Sri Ganesh Labels" className="h-17 w-23 object-cover" />
            <span className="leading-tight">
              <span className="block font-display text-base font-bold tracking-tight sm:text-lg">
                <span className="text-brand-700">Sri</span>{' '}
                <span className="text-secondary-700">Ganesh</span>{' '}
                <span className="text-accent-500">Labels</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Premium Printing
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={navCls}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Search size={21} />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-500"
            >
              <Heart size={21} />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md">
                  {wishCount}
                </span>
              )}
            </Link>
            <CartButton className="hidden lg:flex" />
            <Link
              to="/account"
              aria-label="Account"
              title={user ? `Logged in: ${user.mobile}` : 'Login / Account'}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:flex"
            >
              {user ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[9px] font-bold text-white">
                  {user.mobile.slice(-4)}
                </span>
              ) : (
                <User size={21} />
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-brand-50 lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="mx-auto max-w-3xl px-4 py-5">
            <form onSubmit={submitSearch} className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <Search size={18} className="text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search labels, barcode, stickers, packaging, rolls..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Search
              </button>
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="rounded-xl border border-slate-200 p-3 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </form>

            {query.trim() && (
              <div className="mt-3 max-h-80 overflow-auto">
                {results.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-slate-400">
                    No products found for “{query}”. Try label, barcode, sticker, packaging or roll.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/products/${p.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-brand-50"
                        >
                          <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-slate-900">{p.name}</span>
                            <span className="text-xs text-slate-500">{p.category}</span>
                          </span>
                          <span className="flex items-center gap-2 text-sm font-bold text-brand-800">
                            {formatINR(p.price)}
                            <ChevronRight size={16} className="text-slate-300" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!query.trim() && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Popular:</span>
                {['label', 'barcode', 'sticker', 'packaging', 'roll'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Mobile drawer (outside header to avoid backdrop-blur containing-block bug) */}
    {mobileOpen && (
      <>
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl lg:hidden">
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <img src="/images/LOgo.png" alt="Sri Ganesh Labels" className="h-9 w-10 object-cover" />
              <span className="leading-tight">
                <span className="block font-display text-sm font-bold tracking-tight">
                  <span className="text-brand-700">Sri</span>{' '}
                  <span className="text-secondary-700">Ganesh</span>{' '}
                  <span className="text-accent-500">Labels</span>
                </span>
                <span className="block text-[9px] font-medium uppercase tracking-widest text-slate-400">
                  Premium Printing
                </span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Menu</p>
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMobileOpen(false)}>
                {({ isActive }) => (
                  <span
                    className={`mb-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-700 text-white shadow-md shadow-brand-700/25' : 'text-slate-700 hover:bg-brand-50'
                    }`}
                  >
                    {l.label}
                    <ChevronRight size={16} className={isActive ? 'text-white/70' : 'text-slate-300'} />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-slate-100 px-3 py-4">
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50"
            >
              {user ? <Phone size={16} /> : <User size={16} />} {user ? user.mobile : 'My Account'}
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-rose-50"
            >
              <Heart size={16} /> My Wishlist
              {wishCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </>
    )}
    </>
  )
}