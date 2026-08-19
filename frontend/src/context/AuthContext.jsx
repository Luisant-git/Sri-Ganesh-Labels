import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const AUTH_KEY = 'sgl_auth'
const USERS_KEY = 'sgl_users'

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

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

  const register = ({ mobile, name, password }) => {
    const users = loadUsers()
    if (users.some((u) => u.mobile === mobile)) {
      return { ok: false, error: 'Mobile number already registered. Please login.' }
    }
    const newUser = { mobile, name: (name || '').trim(), password }
    saveUsers([...users, newUser])
    setUser({ mobile, name: newUser.name })
    setLoginOpen(false)
    runPending()
    return { ok: true }
  }

  const login = ({ mobile, password }) => {
    const users = loadUsers()
    const found = users.find((u) => u.mobile === mobile)
    if (!found) {
      return { ok: false, error: 'No account found with this mobile number. Please register.' }
    }
    if (found.password !== password) {
      return { ok: false, error: 'Incorrect password. Please try again.' }
    }
    setUser({ mobile, name: found.name || '' })
    setLoginOpen(false)
    runPending()
    return { ok: true }
  }

  const logout = () => setUser(null)

  const isRegistered = (mobile) => loadUsers().some((u) => u.mobile === mobile)

  const value = {
    user,
    isLoggedIn: !!user,
    register,
    login,
    logout,
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