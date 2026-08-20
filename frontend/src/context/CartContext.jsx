import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSettings } from '../api/settingsApi'
import { getShippingRules, normalizeState } from '../api/shippingApi'

const CartContext = createContext(null)

const STORAGE_KEY = 'sgl_cart'
const LAST_ORDER_KEY = 'sgl_last_order'
export const SHIPPING_FEE = 50
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 999

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function lastShippingState() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY)
    if (!raw) return ''
    const order = JSON.parse(raw)
    const state = order?.shippingState || order?.address?.state || ''
    return typeof state === 'string' ? state.trim() : ''
  } catch {
    return ''
  }
}

function itemKey(productId, option) {
  return `${productId}::${option || 'default'}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD)
  const [shippingFee, setShippingFee] = useState(SHIPPING_FEE)
  const [shippingRules, setShippingRules] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    let cancelled = false
    getSettings()
      .then((data) => {
        if (!cancelled) {
          if (data.freeShippingThreshold != null) setFreeShippingThreshold(Number(data.freeShippingThreshold))
          if (data.shippingFee != null) setShippingFee(Number(data.shippingFee))
        }
      })
      .catch(() => {})
    getShippingRules()
      .then((rules) => {
        if (!cancelled && Array.isArray(rules)) setShippingRules(rules)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const appliedShippingFee = useMemo(() => {
    const state = lastShippingState()
    if (state) {
      const rule = shippingRules.find((r) => r.state === normalizeState(state))
      if (rule && rule.flatShippingRate != null) return Number(rule.flatShippingRate)
    }
    return shippingFee
  }, [shippingRules, shippingFee])

  const addToCart = (product, quantity = 1, option) => {
    setItems((prev) => {
      const key = itemKey(product.id, option)
      const existing = prev.find((i) => itemKey(i.productId, i.option) === key)
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.option) === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
            : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.totalValue ?? product.price,
          originalPrice: product.originalPrice,
          option: option || 'default',
          quantity,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId, option) => {
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.option) !== itemKey(productId, option)))
  }

  const updateQuantity = (productId, option, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.productId, i.option) === itemKey(productId, option) ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const discount = 0
    const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : appliedShippingFee
    const tax = 0
    const total = subtotal + shipping + tax
    const count = items.reduce((s, i) => s + i.quantity, 0)
    return { subtotal, discount, shipping, tax, total, count }
  }, [items, freeShippingThreshold, appliedShippingFee])

  const getCartTotal = () => totals
  const getCartCount = () => totals.count

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    totals,
    freeShippingThreshold,
    shippingFee: appliedShippingFee,
    shippingRules,
    isCartOpen,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}