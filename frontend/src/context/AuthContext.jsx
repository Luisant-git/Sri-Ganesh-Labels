import { createContext, useContext, useEffect, useState } from 'react'
import { userLogin, userRegister, userCheck, setToken, clearToken, decodeToken } from '../api/authApi'

const AuthContext = createContext(null)

const AUTH_KEY = 'sgl_auth'
const LAST_ORDER_KEY = 'sgl_last_order'

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

  const runPending = () => {
    const action = pendingAction
    setPendingAction(null)
    if (action) action()
  }

  const register = async ({ mobile, name, password }) => {
    try {
      const data = await userRegister(mobile, password, name)
      setToken(data.access_token)
      const payload = decodeToken(data.access_token)
      setUser({ mobile: payload.phone || mobile, name: (payload.name || (name || '').trim() || '').trim() })
      window.dispatchEvent(new CustomEvent('sgl:login', { detail: { mobile } }))
      setLoginOpen(false)
      runPending()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const login = async ({ mobile, password }) => {
    try {
      const data = await userLogin(mobile, password)
      setToken(data.access_token)
      const payload = decodeToken(data.access_token)
      setUser({ mobile: payload.phone || mobile, name: (payload.name || '').trim() })
      window.dispatchEvent(new CustomEvent('sgl:login', { detail: { mobile } }))
      setLoginOpen(false)
      runPending()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const logout = () => {
    window.dispatchEvent(new CustomEvent('sgl:logout', { detail: { mobile: user?.mobile } }))
    clearToken()
    localStorage.removeItem(LAST_ORDER_KEY)
    setUser(null)
  }

  const updateUserName = (name) => {
    setUser((u) => (u ? { ...u, name } : u))
  }

  const isRegistered = async (mobile) => {
    try {
      const data = await userCheck(mobile)
      return data.exists
    } catch {
      return false
    }
  }

  const value = {
    user,
    isLoggedIn: !!user,
    register,
    login,
    logout,
    updateUserName,
    isRegistered,
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