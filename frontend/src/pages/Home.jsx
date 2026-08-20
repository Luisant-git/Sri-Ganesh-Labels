import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShoppingBag,
  Printer,
  Layers,
  Palette,
  Award,
  Star,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import SectionHeading from '../components/SectionHeading'
import { getStorefrontProducts } from '../api/productApi'
import { getActiveBanners } from '../api/bannerApi'
import { getCategories } from '../api/categoryApi'

const heroCollage = ['/web/hero1.jpg', '/web/hero2.jpg', '/web/hero3.jpg', '/web/hero4.jpg', '/web/hero5.jpg']

const features = [
  { icon: Printer, title: 'Premium Materials', desc: 'Vinyl, thermal and waterproof substrates built to last.' },
  { icon: Layers, title: 'Sharp Reliable Printing', desc: 'Crisp colours and precise cuts, batch after batch.' },
  { icon: Palette, title: 'Professional Finishing', desc: 'Matte, gloss, metallic and clear finishes to choose from.' },
  { icon: Award, title: 'Quality Guaranteed', desc: 'Every order is checked for accuracy before shipping.' },
]

const testimonials = [
  {
    name: 'Ravi Kumar',
    role: 'Food Brand Owner',
    quote:
      'The labels look premium and the colour printing is sharp. My products finally stand out on the shelf. Ordering online was super easy with COD.',
  },
  {
    name: 'Priya Sharma',
    role: 'Cosmetic Startup',
    quote:
      'Beautiful transparent labels with excellent adhesion. The ordering flow was smooth — cart, checkout and delivery in just a few days.',
  },
  {
    name: 'Anil Mehta',
    role: 'E-commerce Seller',
    quote:
      'Thermal rolls print perfectly in my label printer. Great quality at a fair price, and the online ordering saved me so much time.',
  },
]

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [banners, setBanners] = useState(null)
  const [apiCategories, setApiCategories] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])

  const heroSlides = banners
    ? banners.map((b) => ({
        image: b.image,
        mobileImage: b.mobileImage || null,
        title: b.title || 'Sri Ganesh Labels',
        subtitle: '',
        link: b.link || '/products',
      }))
    : []

  const displayCategories = (apiCategories || []).map((c) => ({
    id: c.id,
    name: c.name,
    image: c.image,
    count: c.subCategories?.length || 0,
  }))

  useEffect(() => {
    let cancelled = false
    getActiveBanners()
      .then((data) => {
        if (!cancelled) setBanners(Array.isArray(data) && data.length > 0 ? data : [])
      })
      .catch(() => {
        if (!cancelled) setBanners([])
      })
    getCategories()
      .then((data) => {
        if (!cancelled) setApiCategories(Array.isArray(data) && data.length > 0 ? data : [])
      })
      .catch(() => {
        if (!cancelled) setApiCategories([])
      })
    getStorefrontProducts()
      .then((data) => {
        if (!cancelled) setFeaturedProducts(Array.isArray(data) ? data.slice(0, 8) : [])
      })
      .catch(() => {
        if (!cancelled) setFeaturedProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (heroSlides.length === 0) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  return (
    <div>
      {/* HERO CAROUSEL */}
      {heroSlides.length > 0 && (
      <section className="relative h-[55vh] min-h-[320px] overflow-hidden sm:h-[60vh] sm:min-h-[420px] md:h-[70vh] lg:h-[85vh] lg:min-h-[500px]">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.mobileImage ? (
              <>
                <img
                  src={slide.mobileImage}
                  alt={`Sri Ganesh Labels ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover md:hidden"
                />
                <img
                  src={slide.image}
                  alt={`Sri Ganesh Labels ${i + 1}`}
                  className="absolute inset-0 hidden h-full w-full object-cover md:block"
                />
              </>
            ) : (
              <img
                src={slide.image}
                alt={`Sri Ganesh Labels ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-900/40 to-transparent" />

        {/* Text overlay */}
        {heroSlides.map((slide, i) => (
          <div
            key={`t-${i}`}
            className={`absolute inset-0 flex items-center transition-opacity duration-1000 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
              <div
                className={`max-w-xl transition-all duration-700 ${
                  i === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-50 drop-shadow sm:text-base">
                  {slide.subtitle}
                </p>
              )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={slide.link || '/products'}
                    className="group inline-flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-accent-500/40 transition-all duration-200 hover:bg-accent-600 active:scale-95"
                  >
                    <ShoppingBag size={16} />
                    Shop Now
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-secondary-700/40 px-7 py-3 text-sm font-semibold text-white ring-1 ring-secondary-300/40 backdrop-blur transition-all duration-200 hover:bg-secondary-700/60 active:scale-95"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dot indicator */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 lg:left-auto lg:right-6 lg:translate-x-0">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full shadow-md transition-all duration-300 ${
                i === current ? 'h-2.5 w-2.5 bg-white' : 'h-2 w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>
      )}

      {/* Categories */}
      {displayCategories.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <SectionHeading
          eyebrow="Browse Collections"
          title="Shop by Category"
          subtitle="Find the perfect labels for your products — from barcode rolls to premium custom stickers."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <div>
                  <p className="font-display text-sm font-semibold text-white sm:text-base">{cat.name}</p>
                  <p className="text-xs text-brand-100/80">{cat.count} sizes</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <SectionHeading
              eyebrow="Handpicked For You"
              title="Featured Products"
              subtitle="Our most-loved labels, stickers and rolls chosen by customers across India."
            />
            <Link
              to="/products"
              className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              View all products
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} centered />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Offer banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600 shadow-2xl shadow-accent-500/25">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid items-center gap-8 px-6 py-12 lg:grid-cols-2 lg:px-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">Limited Period Offer</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Premium Labels for <span className="underline decoration-white/40 decoration-4 underline-offset-8">Every Order</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
                Stock up your packaging with premium labels. Free shipping on orders above ₹999 and COD available
                across India.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-accent-600 shadow-xl transition-all duration-200 hover:bg-accent-50 active:scale-95"
                >
                  <ShoppingBag size={17} /> Shop the Sale
                </Link>
                <Link
                  to="/products?category=Thermal+Roll"
                  className="flex items-center gap-2 rounded-xl border-2 border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Thermal Rolls
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {heroCollage.slice(0, 3).map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Labels offer"
                  className={`aspect-[3/4] w-full rounded-2xl border-2 border-white/25 object-cover shadow-xl ${
                    i === 1 ? '-translate-y-3' : i === 2 ? 'translate-y-3' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Why Sri Ganesh Labels"
            title="Quality You Can Trust"
            subtitle="We are a professional label and printing brand built around quality, reliable printing and customer satisfaction."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-xl hover:shadow-brand-900/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-700/25 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <SectionHeading
          eyebrow="Customer Love"
          title="What Our Customers Say"
          subtitle="Real feedback from brands and sellers who order their labels online with us."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex gap-1 text-accent-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">“{t.quote}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-gradient-to-r from-secondary-900 to-secondary-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready to upgrade your packaging?</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 active:scale-95"
            >
              <ShoppingBag size={17} /> Start Shopping
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border-2 border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}