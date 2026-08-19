import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, PackageX, X, ChevronLeft, ChevronRight, Home as HomeIcon } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products, categories, sortOptions } from '../data/products'
import { formatINR } from '../utils/format'

const PER_PAGE = 8
const PRICE_MIN = 0
const PRICE_MAX = 800

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'
  const searchQuery = searchParams.get('search') || ''
  const [sort, setSort] = useState('popular')
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [page, setPage] = useState(1)
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX])

  const setCategory = (cat) => {
    const next = new URLSearchParams(searchParams)
    if (cat === 'All') next.delete('category')
    else next.set('category', cat)
    setSearchParams(next)
    setPage(1)
  }

  const applySearch = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (localSearch.trim()) next.set('search', localSearch.trim())
    else next.delete('search')
    setSearchParams(next)
    setPage(1)
  }

  const clearSearch = () => {
    setLocalSearch('')
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
    setPage(1)
  }

  const isFiltered =
    activeCategory !== 'All' ||
    !!searchQuery ||
    sort !== 'popular' ||
    priceRange[0] !== PRICE_MIN ||
    priceRange[1] !== PRICE_MAX

  const clearFilters = () => {
    setCategory('All')
    clearSearch()
    setSort('popular')
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((p) => [p.name, p.category, p.description].join(' ').toLowerCase().includes(q))
    }
    const [min, max] = priceRange
    list = list.filter((p) => p.price >= min && p.price <= max)
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviews - a.reviews)
    }
    return list
  }, [activeCategory, searchQuery, sort, priceRange])

  const allCats = ['All', ...categories.map((c) => c.name)]
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 py-14 lg:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Our Store</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Shop Labels &amp; Stickers
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-100/90">
            Browse premium labels, barcode rolls, packaging labels and promotional stickers. Add to cart and order online — no account needed.
          </p>
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
            <span className="text-xs font-semibold uppercase tracking-wider text-white">Products</span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="gap-8 lg:grid lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
                <SlidersHorizontal size={16} className="text-brand-700" /> Filters
              </h3>

              {/* Search */}
              <form onSubmit={applySearch} className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <Search size={15} className="shrink-0 text-slate-400" />
                  <input
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  {localSearch && (
                    <button type="button" onClick={clearSearch} aria-label="Clear search">
                      <X size={15} className="text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </form>

              {/* Categories */}
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-slate-600">Category</label>
                <div className="flex flex-col gap-1">
                  {allCats.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                        activeCategory === cat
                          ? 'bg-brand-700 font-semibold text-white shadow-md shadow-brand-700/25'
                          : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && <span className="text-xs opacity-80">•</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-slate-600">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-brand-500"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Price range</label>
                  <span className="text-xs font-medium text-slate-500">
                    {formatINR(priceRange[0])} – {formatINR(priceRange[1])}
                  </span>
                </div>
                <div className="relative h-6">
                  <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
                  <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
                    style={{
                      left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
                      right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={10}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), priceRange[1])
                      setPriceRange([v, priceRange[1]])
                      setPage(1)
                    }}
                    className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-700 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-700 [&::-moz-range-thumb]:shadow-md"
                  />
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={10}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), priceRange[0])
                      setPriceRange([priceRange[0], v])
                      setPage(1)
                    }}
                    className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-700 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-700 [&::-moz-range-thumb]:shadow-md"
                  />
                </div>
              </div>

              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product list */}
          <div className="mt-6 lg:mt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{filtered.length}</span> products
                {activeCategory !== 'All' && (
                  <>
                    {' '}
                    in <span className="font-semibold text-brand-700">{activeCategory}</span>
                  </>
                )}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <PackageX size={48} className="text-slate-300" />
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">No products found</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try a different search term like “label”, “barcode”, “sticker”, “packaging” or “roll”, or clear the filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-3">
                  {pageItems.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                          safePage === n
                            ? 'bg-brand-700 text-white shadow-lg shadow-brand-700/25'
                            : 'border border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}