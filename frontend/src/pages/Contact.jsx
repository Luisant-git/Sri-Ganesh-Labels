import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Home as HomeIcon } from 'lucide-react'
import { toast } from '../components/Toast'

const info = [
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+91 98765 43210', '+91 98765 43211'],
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['sales@sriganeshlabels.in', 'support@sriganeshlabels.in'],
  },
  {
    icon: MapPin,
    title: 'Address',
    lines: ['123, GST Road, Guindy', 'Chennai, Tamil Nadu 600032'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    lines: ['Mon – Sat: 9:00 AM – 7:00 PM', 'Sunday: Closed'],
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const setField = (key) => (e) => {
    const value = key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim() || form.name.trim().length < 2) er.name = 'Please enter your name'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Please enter a valid email'
    if (form.phone && !/^\d{10}$/.test(form.phone)) er.phone = 'Enter a valid 10-digit number'
    if (!form.message.trim() || form.message.trim().length < 10) er.message = 'Message should be at least 10 characters'
    setErrors(er)
    if (Object.keys(er).length > 0) return
    setSent(true)
    toast('Message sent successfully!')
    setForm({ name: '', email: '', phone: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }

  const inputCls = (key) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:ring-2 ${
      errors[key]
        ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`

  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 py-8 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Get in Touch</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-100/90">
            Questions about an order, shipping or a product? We are happy to help — reach out any time.
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
            <span className="text-xs font-semibold uppercase tracking-wider text-white">Contact Us</span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-2">
            {info.map(({ icon: Icon, title, lines }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-700/20">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">{title}</h3>
                  {lines.map((l, i) => (
                    <p key={i} className="mt-0.5 text-sm text-slate-500">
                      {title === 'Email' ? <a href={`mailto:${l}`} className="hover:text-brand-700">{l}</a> : l}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="font-display text-lg font-bold text-slate-900">Send us a message</h2>
              <p className="mt-1 text-sm text-slate-500">For general enquiries, order support or feedback.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Name *</label>
                  <input value={form.name} onChange={setField('name')} placeholder="Your name" className={inputCls('name')} />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
                  <input value={form.email} onChange={setField('email')} placeholder="you@example.com" className={inputCls('email')} />
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={setField('phone')}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    className={inputCls('phone')}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={setField('message')}
                    rows={5}
                    placeholder="How can we help you?"
                    className={`${inputCls('message')} resize-none`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all duration-200 hover:bg-brand-800 active:scale-95"
                >
                  <Send size={16} /> Send Message
                </button>
                {sent && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-teal-600">
                    <CheckCircle2 size={16} /> Message sent!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <iframe
            title="Sri Ganesh Labels location"
            src="https://www.google.com/maps?q=Chennai,+Tamil+Nadu,+India&output=embed"
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  )
}