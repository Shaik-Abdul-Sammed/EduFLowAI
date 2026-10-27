import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'
import teTranslations from './locales/te.json'

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  te: teTranslations,
}

const getSavedLanguage = () => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('eduflow-ai-language') || localStorage.getItem('sri-sudha-language')
    if (saved && ['en', 'hi', 'te'].includes(saved)) {
      return saved
    }
  }
  return 'en'
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      te: { translation: teTranslations },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
}

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  if (obj[path] !== undefined) return obj[path]
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getSavedLanguage)

  useEffect(() => {
    localStorage.setItem('eduflow-ai-language', locale)
    localStorage.removeItem('sri-sudha-language')
    document.documentElement.lang = locale
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  const t = (key, vars = {}) => {
    const raw = getNestedValue(translations[locale], key) ??
                getNestedValue(translations.en, key) ??
                key
    // simple interpolation for {name} placeholders
    return String(raw).replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? `{${v}}`))
  }

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLocaleState(lang)
      i18n.changeLanguage(lang)
    }
  }

  const value = { t, locale, setLanguage }

  return React.createElement(I18nContext.Provider, { value }, children)
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Fallback: return a minimal safe interface using English translations
    return {
      t: (key, vars = {}) => {
        const raw = getNestedValue(translations.en, key) ?? key
        return String(raw).replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? `{${v}}`))
      },
      locale: i18n.language || 'en',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
      },
    }
  }
  return ctx
}

// Export translations & i18n for use in other services
export { translations, i18n }
export default i18n
