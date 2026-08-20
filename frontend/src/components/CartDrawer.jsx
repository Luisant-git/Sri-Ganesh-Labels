import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/format'

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, totals, freeShippingThreshold } = useCart()
  const navigate = useNavigate()

  const goCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const goCart = () => {
    closeCart()
    navigate('/cart')
  }

  const progress = Math.min(100, (totals.subtotal / freeShippingThreshold) * 100)
  const remaining = freeShippingThreshold - totals.subtotal

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" onClick={closeCart} />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <ShoppingBag size={18} className="text-brand-700" />
            Your Cart
            {totals.count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
                {totals.count}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-600">
              <Truck size={14} className="text-brand-600" />
              {remaining > 0 ? (
                <>
                  Add <span className="font-semibold text-brand-700">{formatINR(remaining)}</span> more for FREE shipping
                </>
              ) : (
                <span className="font-semibold text-brand-700">You have FREE shipping!</span>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={48} className="text-slate-300" />
            <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-slate-500">Add some premium labels and stickers to get started.</p>
            <button
              onClick={closeCart}
              className="mt-6 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={`${item.productId}::${item.option}`} className="flex gap-3">
                    <Link to={`/products/${item.productId}`} onClick={closeCart} className="shrink-0">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            onClick={closeCart}
                            className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-700"
                          >
                            {item.name}
                          </Link>
                          {item.option !== 'default' && (
                            <p className="mt-0.5 text-xs text-slate-500">{item.option}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.option)}
                          aria-label="Remove item"
                          className="text-slate-400 transition-colors hover:text-rose-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) removeFromCart(item.productId, item.option)
                              else updateQuantity(item.productId, item.option, item.quantity - 1)
                            }}
                            aria-label="Decrease quantity"
                            className="flex h-7 w-7 items-center justify-center text-slate-500 transition-colors hover:text-brand-700"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.option, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-7 w-7 items-center justify-center text-slate-500 transition-colors hover:text-brand-700"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-brand-800">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="font-display text-lg font-bold text-slate-900">{formatINR(totals.subtotal)}</span>
              </div>
              {totals.shipping > 0 && (
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Shipping</span>
                  <span>{formatINR(totals.shipping)}</span>
                </div>
              )}
              <button
                onClick={goCheckout}
                className="mt-4 w-full rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Checkout · {formatINR(totals.total)}
              </button>
              <button
                onClick={goCart}
                className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                View Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}