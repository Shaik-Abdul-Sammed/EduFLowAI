import { useState, useEffect } from 'react'

const DARK_MODE_KEY = 'eduflow-ai-dark-mode'
const LEGACY_KEY = 'sri-sudha-dark-mode'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      // Migrate from legacy key
      const stored = typeof localStorage !== 'undefined' ? (localStorage.getItem(DARK_MODE_KEY) ?? localStorage.getItem(LEGACY_KEY)) : null
      if (stored !== null) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(DARK_MODE_KEY, stored)
          localStorage.removeItem(LEGACY_KEY)
        }
        return stored === 'true'
      }
      return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DARK_MODE_KEY, isDarkMode)
      }
    } catch {
      // ignore localStorage errors in sandboxed contexts
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorageChange = (e) => {
      if (e.key === DARK_MODE_KEY && e.newValue !== null) {
        setIsDarkMode(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  return { isDarkMode, toggleDarkMode }
}
