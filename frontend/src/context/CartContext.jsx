import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { discountPercent } from '../utils/format'

const CartContext = createContext(null)

const STORAGE_KEY = 'sgl_cart'
export const FREE_SHIPPING_THRESHOLD = 999
export const SHIPPING_FEE = 50

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function itemKey(productId, option) {
  return `${productId}::${option || 'default'}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

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
          price: product.price,
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
    const originalTotal = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.quantity, 0)
    const discount = originalTotal - subtotal
    const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const tax = 0
    const total = subtotal + shipping + tax
    const count = items.reduce((s, i) => s + i.quantity, 0)
    return { subtotal, discount, shipping, tax, total, count }
  }, [items])

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

export { discountPercent }