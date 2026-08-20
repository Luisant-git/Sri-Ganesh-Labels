import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Landmark,
  Hash,
  BadgeCheck,
  Wallet,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ShoppingCart,
  Copy,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR, generateOrderId } from '../utils/format'
import BackButton from '../components/BackButton'
import { toast } from '../components/Toast'

const initialForm = {
  shippingFullName: '',
  shippingMobile: '',
  shippingEmail: '',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingPincode: '',
  gstin: '',
  billingFullName: '',
  billingMobile: '',
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingPincode: '',
}

const states = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]

const onlineMethods = [
  { id: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm & more' },
  { id: 'card', label: 'Card', desc: 'Credit / Debit cards' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks' },
]

export default function Checkout() {
  const { items, totals, clearCart, freeShippingThreshold } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(() => {
    let lastAddress = null
    try {
      const raw = localStorage.getItem('sgl_last_order')
      if (raw) lastAddress = JSON.parse(raw).address
    } catch {
      lastAddress = null
    }
    return {
      ...initialForm,
      shippingFullName: user?.name || lastAddress?.fullName || '',
      shippingMobile: user?.mobile || lastAddress?.mobile || '',
      shippingEmail: lastAddress?.email || '',
      shippingAddress: lastAddress?.address || '',
      shippingCity: lastAddress?.city || '',
      shippingState: lastAddress?.state || '',
      shippingPincode: lastAddress?.pincode || '',
    }
  })
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState('cod')
  const [onlineMethod, setOnlineMethod] = useState('upi')
  const [placed, setPlaced] = useState(false)
  const [terms, setTerms] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        shippingFullName: f.shippingFullName || user.name || '',
        shippingMobile: f.shippingMobile || user.mobile || '',
      }))
    }
  }, [user])

  const numericKeys = ['shippingMobile', 'shippingPincode', 'billingMobile', 'billingPincode']

  const setField = (key) => (e) => {
    const value =
      numericKeys.includes(key)
        ? e.target.value.replace(/\D/g, '')
        : key === 'gstin'
        ? e.target.value.toUpperCase()
        : e.target.value
    setForm((f) => ({
      ...f,
      [key]:
        key === 'shippingMobile' || key === 'billingMobile'
          ? value.slice(0, 10)
          : key === 'shippingPincode' || key === 'billingPincode'
          ? value.slice(0, 6)
          : key === 'gstin'
          ? value.slice(0, 15)
          : value,
    }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }))
  }

  const handleSameAsShipping = (checked) => {
    setSameAsShipping(checked)
    if (checked) {
      setForm((f) => ({
        ...f,
        billingFullName: f.shippingFullName,
        billingMobile: f.shippingMobile,
        billingAddress: f.shippingAddress,
        billingCity: f.shippingCity,
        billingState: f.shippingState,
        billingPincode: f.shippingPincode,
      }))
    }
  }

  const validate = () => {
    const er = {}
    if (!form.shippingFullName.trim() || form.shippingFullName.trim().length < 3)
      er.shippingFullName = 'Enter your full name (min 3 characters)'
    if (!/^\d{10}$/.test(form.shippingMobile)) er.shippingMobile = 'Enter a valid 10-digit mobile number'
    if (form.shippingEmail && !/^\S+@\S+\.\S+$/.test(form.shippingEmail)) er.shippingEmail = 'Enter a valid email address'
    if (!form.shippingAddress.trim() || form.shippingAddress.trim().length < 8)
      er.shippingAddress = 'Enter your complete address'
    if (!form.shippingCity.trim()) er.shippingCity = 'Enter your city'
    if (!form.shippingState) er.shippingState = 'Select your state'
    if (!/^\d{6}$/.test(form.shippingPincode)) er.shippingPincode = 'Enter a valid 6-digit pincode'
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gstin))
      er.gstin = 'Enter a valid 15-character GSTIN'

    if (!sameAsShipping) {
      if (!form.billingFullName.trim() || form.billingFullName.trim().length < 3)
        er.billingFullName = 'Enter your full name (min 3 characters)'
      if (!/^\d{10}$/.test(form.billingMobile)) er.billingMobile = 'Enter a valid 10-digit mobile number'
      if (!form.billingAddress.trim() || form.billingAddress.trim().length < 8)
        er.billingAddress = 'Enter your complete address'
      if (!form.billingCity.trim()) er.billingCity = 'Enter your city'
      if (!form.billingState) er.billingState = 'Select your state'
      if (!/^\d{6}$/.test(form.billingPincode)) er.billingPincode = 'Enter a valid 6-digit pincode'
    }

    if (!terms) er.terms = 'Please accept the terms to place your order'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (placed) return
    if (!validate()) {
      toast('Please fix the highlighted fields', 'error')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setPlaced(true)

    const shippingAddress = {
      fullName: form.shippingFullName,
      mobile: form.shippingMobile,
      email: form.shippingEmail,
      address: form.shippingAddress,
      city: form.shippingCity,
      state: form.shippingState,
      pincode: form.shippingPincode,
    }
    const billingAddress = sameAsShipping
      ? { ...shippingAddress }
      : {
          fullName: form.billingFullName,
          mobile: form.billingMobile,
          address: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          pincode: form.billingPincode,
        }

    const order = {
      id: generateOrderId(),
      date: new Date().toISOString(),
      payment: payment === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      paymentDetail: payment === 'cod' ? 'Pay at your doorstep' : onlineMethod.toUpperCase(),
      items: items.map((i) => ({ name: i.name, option: i.option, qty: i.quantity, price: i.price, image: i.image })),
      totals,
      address: shippingAddress,
      billingAddress,
      gstin: form.gstin.trim() || null,
    }
    localStorage.setItem('sgl_last_order', JSON.stringify(order))
    clearCart()
    if (payment === 'cod') {
      navigate('/order-success', { state: { order } })
    } else {
      setTimeout(() => navigate('/order-success', { state: { order } }), 1600)
    }
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
          <ShoppingCart size={44} className="text-brand-300" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add some products to your cart before checking out.</p>
        <Link
          to="/products"
          className="mt-6 flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const inputCls = (key) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:ring-2 ${
      errors[key]
        ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`

  const shippingSection = (prefix, isBilling = false) => (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Full Name *</label>
        <div className="relative">
          <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={form[`${prefix}FullName`]}
            onChange={setField(`${prefix}FullName`)}
            placeholder="e.g. Ravi Kumar"
            className={`${inputCls(`${prefix}FullName`)} pl-10`}
          />
        </div>
        {errors[`${prefix}FullName`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}FullName`]}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Mobile Number *</label>
        <div className="relative">
          <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={form[`${prefix}Mobile`]}
            onChange={setField(`${prefix}Mobile`)}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            className={`${inputCls(`${prefix}Mobile`)} pl-10`}
          />
        </div>
        {errors[`${prefix}Mobile`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}Mobile`]}</p>}
      </div>
      {!isBilling && (
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={form.shippingEmail}
              onChange={setField('shippingEmail')}
              placeholder="you@example.com"
              className={`${inputCls('shippingEmail')} pl-10`}
            />
          </div>
          {errors.shippingEmail && <p className="mt-1 text-xs text-rose-500">{errors.shippingEmail}</p>}
        </div>
      )}
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Address *</label>
        <div className="relative">
          <MapPin size={15} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
          <textarea
            value={form[`${prefix}Address`]}
            onChange={setField(`${prefix}Address`)}
            placeholder="House no, street, area, landmark"
            rows={2}
            className={`${inputCls(`${prefix}Address`)} resize-none pl-10`}
          />
        </div>
        {errors[`${prefix}Address`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}Address`]}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">City *</label>
        <div className="relative">
          <Building2 size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={form[`${prefix}City`]}
            onChange={setField(`${prefix}City`)}
            placeholder="e.g. Chennai"
            className={`${inputCls(`${prefix}City`)} pl-10`}
          />
        </div>
        {errors[`${prefix}City`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}City`]}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">State *</label>
        <div className="relative">
          <Landmark size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={form[`${prefix}State`]}
            onChange={setField(`${prefix}State`)}
            className={`${inputCls(`${prefix}State`)} cursor-pointer pl-10 ${form[`${prefix}State`] ? '' : 'text-slate-400'}`}
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {errors[`${prefix}State`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}State`]}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Pincode *</label>
        <div className="relative">
          <Hash size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={form[`${prefix}Pincode`]}
            onChange={setField(`${prefix}Pincode`)}
            placeholder="6-digit pincode"
            inputMode="numeric"
            className={`${inputCls(`${prefix}Pincode`)} pl-10`}
          />
        </div>
        {errors[`${prefix}Pincode`] && <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}Pincode`]}</p>}
      </div>
      {!isBilling && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            GSTIN <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <div className="relative">
            <BadgeCheck size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={form.gstin}
              onChange={setField('gstin')}
              placeholder="Enter GSTIN (Optional)"
              className={`${inputCls('gstin')} pl-10`}
            />
          </div>
          {errors.gstin && <p className="mt-1 text-xs text-rose-500">{errors.gstin}</p>}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Secure Checkout</h1>
              <p className="mt-1 text-sm text-slate-500">
                Guest checkout — no registration or login required.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Shipping address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">1</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">Shipping Address</h2>
                  <p className="text-xs text-slate-400">Where should we deliver your order?</p>
                </div>
              </div>

              {shippingSection('shipping')}
            </section>

            {/* Billing address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">2</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">Billing Address</h2>
                  <p className="text-xs text-slate-400">Billing address for this order</p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => handleSameAsShipping(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-700 accent-brand-700"
                />
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Copy size={14} className="text-brand-600" />
                  Billing Address is the same as Shipping Address
                </span>
              </label>

              {sameAsShipping ? (
                <div className="mt-4 rounded-xl bg-brand-50/60 px-4 py-3.5 text-sm text-slate-600">
                  {form.shippingFullName ? (
                    <>
                      <p className="font-semibold text-slate-900">{form.shippingFullName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {form.shippingAddress}
                        {form.shippingCity && <span> — {form.shippingCity}, {form.shippingState} - {form.shippingPincode}</span>}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Shipping address will be used as billing address.</span>
                  )}
                </div>
              ) : (
                shippingSection('billing', true)
              )}
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">3</span>
                <h2 className="font-display text-lg font-bold text-slate-900">Select Payment Method</h2>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPayment('cod')}
                  className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                    payment === 'cod'
                      ? 'border-brand-600 bg-brand-50 shadow-lg shadow-brand-600/10'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      payment === 'cod' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Wallet size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-slate-900">Cash on Delivery</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${payment === 'cod' ? 'border-brand-600' : 'border-slate-300'}`}>
                        {payment === 'cod' && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">Pay when your order is delivered.</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment('online')}
                  className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                    payment === 'online'
                      ? 'border-brand-600 bg-brand-50 shadow-lg shadow-brand-600/10'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      payment === 'online' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <CreditCard size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-slate-900">Online Payment</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${payment === 'online' ? 'border-brand-600' : 'border-slate-300'}`}>
                        {payment === 'online' && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                      Pay securely using UPI, Card, Net Banking or other available online methods.
                    </span>
                  </span>
                </button>
              </div>

              <label className="mt-6 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => {
                    setTerms(e.target.checked)
                    if (errors.terms) setErrors((er) => ({ ...er, terms: null }))
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 accent-brand-700"
                />
                <span className="text-xs leading-relaxed text-slate-600">
                  I agree to the <span className="font-semibold text-brand-700">Terms &amp; Conditions</span> and
                  <span className="font-semibold text-brand-700"> Privacy Policy</span>. By placing this order I confirm the delivery details are correct.
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-xs text-rose-500">{errors.terms}</p>}
            </section>
          </div>

          {/* Right column — order summary */}
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-slate-900">Your Order</h2>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={`${item.productId}::${item.option}`} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <span className="flex-1 text-xs font-medium text-slate-700">
                      {item.name}
                      {item.option && item.option !== 'default' && (
                        <span className="block text-[11px] text-slate-400">{item.option}</span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{formatINR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2.5 border-t border-dashed border-slate-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold text-slate-900">{formatINR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="font-semibold text-slate-900">
                    {totals.shipping === 0 ? <span className="text-teal-600">FREE</span> : formatINR(totals.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tax</dt>
                  <dd className="font-semibold text-slate-900">{formatINR(0)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
                <span className="font-display text-base font-bold text-slate-900">Total</span>
                <span className="font-display text-2xl font-bold text-brand-800">{formatINR(totals.total)}</span>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Payment method:</span>{' '}
                {payment === 'cod' ? (
                  <span className="flex items-center gap-1.5 font-medium text-teal-600">
                    <Wallet size={13} /> Cash on Delivery
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-medium text-brand-700">
                    <CreditCard size={13} /> Online Payment
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={placed}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-xl transition-all duration-200 active:scale-[0.98] ${
                  placed
                    ? 'cursor-wait bg-teal-500 shadow-teal-500/30'
                    : 'bg-accent-500 shadow-accent-500/30 hover:bg-accent-600'
                }`}
              >
                {placed ? (
                  <>
                    <Lock size={17} className="animate-pulse" /> Processing payment…
                  </>
                ) : payment === 'cod' ? (
                  <>
                    <CheckCircle2 size={17} /> Place Order
                  </>
                ) : (
                  <>
                    <Lock size={17} /> Pay {formatINR(totals.total)} &amp; Place Order
                  </>
                )}
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Lock size={12} className="text-teal-500" /> 100% secure</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-brand-600" /> Buyer protection</span>
                <span className="flex items-center gap-1"><Truck size={12} className="text-accent-600" /> {totals.subtotal >= freeShippingThreshold ? 'Free shipping' : 'COD available'}</span>
              </div>

              <Link
                to="/cart"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-brand-700"
              >
                <ChevronLeft size={14} /> Back to cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}