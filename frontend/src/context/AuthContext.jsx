import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const AUTH_KEY = 'sgl_auth'

function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [loginOpen, setLoginOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  }, [user])

  const openLogin = (onSuccess) => {
    setPendingAction(() => onSuccess)
    setLoginOpen(true)
  }

  const closeLogin = () => {
    setLoginOpen(false)
    setPendingAction(null)
  }

  const login = (mobile) => {
    setUser({ mobile })
    setLoginOpen(false)
    const action = pendingAction
    setPendingAction(null)
    if (action) action()
  }

  const logout = () => setUser(null)

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    loginOpen,
    openLogin,
    closeLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}