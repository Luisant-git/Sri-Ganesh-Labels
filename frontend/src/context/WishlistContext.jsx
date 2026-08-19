import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'sgl_wishlist'

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(loadWishlist)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggleWishlist = (productId) => {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const isWishlisted = (productId) => ids.includes(productId)

  const value = { ids, toggleWishlist, isWishlisted, count: ids.length }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}