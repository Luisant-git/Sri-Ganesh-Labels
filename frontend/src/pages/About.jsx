import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Award,
  Printer,
  Scissors,
  Smile,
  Gem,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  Home as HomeIcon,
} from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

const values = [
  {
    icon: Gem,
    title: 'Quality First',
    desc: 'Every label is produced with premium materials and strict quality checks so your products always look their best.',
  },
  {
    icon: Award,
    title: 'Premium Materials',
    desc: 'From vinyl and thermal stock to glossy and transparent films, we choose substrates that last and impress.',
  },
  {
    icon: Printer,
    title: 'Reliable Printing',
    desc: 'Sharp, colour-accurate printing with precise die-cutting, batch after batch, order after order.',
  },
  {
    icon: Scissors,
    title: 'Professional Finishing',
    desc: 'Clean cuts, perfect sizing and flawless finish on every label we ship to your doorstep.',
  },
  {
    icon: Smile,
    title: 'Customer Satisfaction',
    desc: 'Easy online ordering, transparent pricing and responsive support — we treat every customer like a partner.',
  },
  {
    icon: ShieldCheck,
    title: 'Consistent Quality',
    desc: 'Repeatable results you can rely on for packaging, branding and retail operations at any scale.',
  },
]

const stats = [
  { value: '10+', label: 'Years of Printing' },
  { value: '500+', label: 'Brands Served' },
  { value: '1M+', label: 'Labels Delivered' },
  { value: '99%', label: 'Happy Customers' },
]

const process = [
  { icon: ShoppingBag, title: 'Order Online', desc: 'Browse our manufactured labels, add to cart and check out in minutes — no account needed.' },
  { icon: Printer, title: 'We Manufacture & Pack', desc: 'Your labels are manufactured in-house, quality-checked and carefully packed.' },
  { icon: PackageCheck, title: 'Fast Delivery', desc: 'Shipped directly from our facility across India with tracking, COD available.' },
]

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 py-8 lg:py-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Our Story</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            About Sri Ganesh Labels
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-100/90">
            A professional label manufacturer and seller — we design, manufacture and supply premium labels and
            packaging products with reliable quality, honest pricing and fast delivery.
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
            <span className="text-xs font-semibold uppercase tracking-wider text-white">About Us</span>
          </nav>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src="/web/hero2.jpg"
              alt="Sri Ganesh Labels printing"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl border border-slate-200 object-cover shadow-2xl"
            />
            <img
              src="/web/hero1.jpg"
              alt="Label production"
              loading="lazy"
              className="absolute -bottom-8 -right-4 hidden w-48 rounded-2xl border-4 border-white object-cover shadow-2xl sm:block lg:-right-8"
            />
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title="Manufacturing & Selling Premium Labels"
            />
            <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
              Sri Ganesh Labels is a dedicated label manufacturer and seller. We manufacture and supply labels for
              businesses of every size — from home kitchens and startups to established brands — helping them look
              professional with high-quality labels, barcode rolls, packaging labels and promotional stickers.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              We believe great packaging sells. That is why every label we manufacture uses premium materials,
              precise printing and a finishing touch that makes your product stand out on the shelf — made by us,
              sold directly to you at fair, wholesale-friendly prices.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="font-display text-2xl font-bold text-brand-800">{s.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="What Drives Us"
            title="Our Core Values"
            subtitle="Everything we do revolves around quality, reliability and the satisfaction of our customers."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5"
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

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <SectionHeading
          eyebrow="Simple & Direct"
          title="From Our Factory to Your Doorstep"
          subtitle="We manufacture in-house and sell directly to you — no middlemen, no markups, just quality labels."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {process.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <span className="absolute right-5 top-4 font-display text-4xl font-bold text-slate-100">{i + 1}</span>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-lg shadow-accent-500/30">
                <Icon size={24} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-gradient-to-r from-brand-900 to-brand-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center lg:flex-row lg:text-left">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-lg shadow-accent-500/30">
              <BadgeCheck size={26} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Quality labels, honest prices</h2>
            </div>
          </div>
          <Link
            to="/products"
            className="group flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent-500/30 transition-all duration-200 hover:bg-accent-600 active:scale-95"
          >
            <ShoppingBag size={17} /> Shop Now
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}