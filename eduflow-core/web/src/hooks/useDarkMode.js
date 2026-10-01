import { useState, useEffect } from 'react'

const DARK_MODE_KEY = 'eduflow-ai-dark-mode'
const LEGACY_KEY = 'sri-sudha-dark-mode'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Migrate from legacy key
    const stored = localStorage.getItem(DARK_MODE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (stored !== null) {
      localStorage.setItem(DARK_MODE_KEY, stored)
      localStorage.removeItem(LEGACY_KEY)
      return stored === 'true'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, isDarkMode)
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  return { isDarkMode, toggleDarkMode }
}
