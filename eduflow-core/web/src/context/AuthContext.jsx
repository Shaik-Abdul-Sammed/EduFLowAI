import { createContext, useMemo, useState, useEffect, useContext } from 'react'
import { loginWithRole, logout as apiLogout, registerInstitution } from '../services/authService'

const STORAGE_KEY = 'eduflow-ai-auth'
const LANGUAGE_KEY = 'eduflow-ai-language'
// Legacy keys — read once for migration, then delete
const LEGACY_AUTH_KEY = 'sri-sudha-auth'
const LEGACY_USER_KEY = 'sri-sudha-user'
const LEGACY_LANG_KEY = 'sri-sudha-language'
const AuthContext = createContext(null)

/** Read from new key, fall back to legacy key, migrate on the fly */
function readWithMigration(newKey, legacyKey) {
  try {
    const newVal = localStorage.getItem(newKey)
    if (newVal) return newVal
    const legacyVal = localStorage.getItem(legacyKey)
    if (legacyVal) {
      localStorage.setItem(newKey, legacyVal)
      localStorage.removeItem(legacyKey)
    }
    return legacyVal
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedAuth = readWithMigration(STORAGE_KEY, LEGACY_AUTH_KEY)
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth)
        if (parsed?.user) return parsed.user
      }
      return null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY)
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth)
        if (parsed?.token) return parsed.token
      }
      return localStorage.getItem('accessToken')
    } catch {
      return null
    }
  })
  const [language, setLanguage] = useState(
    readWithMigration(LANGUAGE_KEY, LEGACY_LANG_KEY) || 'English'
  )

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('accessToken') || localStorage.getItem(STORAGE_KEY)
      if (!newToken && token) {
        setUser(null)
        setToken(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [token])

  async function login(credentials) {
    const response = await loginWithRole(credentials)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: response.user, token: response.token }))
    // Clean up any legacy keys
    localStorage.removeItem(LEGACY_AUTH_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    if (response.token) {
      localStorage.setItem('accessToken', response.token)
    }
    return response
  }

  async function register(registrationData) {
    const response = await registerInstitution(registrationData)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: response.user, token: response.token }))
    localStorage.removeItem(LEGACY_AUTH_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    if (response.token) {
      localStorage.setItem('accessToken', response.token)
    }
    return response
  }

  async function logout() {
    if (typeof apiLogout === 'function') {
      try {
        await apiLogout()
      } catch (e) {
        console.warn('API logout failed:', e)
      }
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_AUTH_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('institutionId')
  }

  function updateLanguage(value) {
    setLanguage(value)
    localStorage.setItem(LANGUAGE_KEY, value)
    localStorage.removeItem(LEGACY_LANG_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      language,
      login,
      register,
      logout,
      updateLanguage,
    }),
    [user, token, language],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export { AuthContext }
