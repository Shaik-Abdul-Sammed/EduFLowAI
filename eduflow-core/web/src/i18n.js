import React, { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    brand: 'EduFlow',
    directory: 'Directory',
    entry: 'Entry',
    login: 'Login',
    dashboard: 'Dashboard',
    pages: 'Pages',
    search_placeholder: 'Search modules...',
    search_recent: 'Recent searches',
    search_no_results: 'No results',
    language: 'Language',
    welcome_back: 'Welcome back',
    sign_in: 'Sign In',
    username_label: 'Username / ID',
    password_label: 'Password',
    scan_qr: 'Scan QR Code',
    or_login_with: 'Or Login With',
    login_securely: 'Login Securely',
    request_mobile_otp: 'Request Mobile OTP',
    use_password_instead: 'Use Password instead',
    logout: 'Logout',
    assignments: 'Assignments',
    assignments_desc: 'Check assignment deadlines and submission instructions.',
    profile: 'Profile'
  },
  hi: {
    brand: 'श्री सुधा',
    directory: 'निर्देशिका',
    entry: 'प्रवेश',
    login: 'लॉगिन',
    dashboard: 'डैशबोर्ड',
    pages: 'पृष्ठ',
    search_placeholder: 'मॉड्यूल खोजें...',
    search_recent: 'हाल की खोज',
    search_no_results: 'कोई परिणाम नहीं',
    language: 'भाषा',
    welcome_back: 'फिर से स्वागत है',
    sign_in: 'साइन इन',
    username_label: 'उपयोगकर्ता नाम / आईडी',
    password_label: 'पासवर्ड',
    scan_qr: 'QR कोड स्कैन करें',
    or_login_with: 'या इनसे लॉगिन करें',
    login_securely: 'सुरक्षित रूप से लॉगिन करें',
    request_mobile_otp: 'मोबाइल OTP अनुरोध करें',
    use_password_instead: 'इसके बजाय पासवर्ड का उपयोग करें',
    logout: 'लॉगआउट',
    assignments: 'असाइनमेंट',
    assignments_desc: 'असाइनमेंट की समय सीमा और प्रस्तुति निर्देश देखें।',
    profile: 'प्रोफाइल'
  },
  te: {
    brand: 'శ్రీ సుధ',
    directory: 'డైరెక్టరీ',
    entry: 'ఎంట్రీ',
    login: 'లాగిన్',
    dashboard: 'డ్యాష్‌బోర్డ్',
    pages: 'పేజీలు',
    search_placeholder: 'మాడ్యూల్‌లను శోధించండి...',
    search_recent: 'ఇటీవల శోధనలు',
    search_no_results: 'ఫలితాలు లేవు',
    language: 'భాష',
    welcome_back: 'మళ్లీ స్వాగతం',
    sign_in: 'సైన్ ఇన్',
    username_label: 'వినియోగదారు పేరు / ID',
    password_label: 'పాస్వర్డ్',
    scan_qr: 'QR కోడ్ స్కాన్ చేయండి',
    or_login_with: 'లాగిన్ చేయడానికి లేదా',
    login_securely: 'భద్రంగా లాగిన్ చేయండి',
    request_mobile_otp: 'మొబైల్ OTP అభ్యర్థించండి',
    use_password_instead: 'దీనికి బదులుగా పాస్వర్డ్ ఉపయోగించండి',
    logout: 'లాగআউట్',
    assignments: 'అసైనమెంట్‌లు',
    assignments_desc: 'అసైనమెంట్ డెడ్‌లైన్‌లు మరియు సమర్పణ సూచనలను తనిఖీ చేయండి.',
    profile: 'ప్రొఫైల్'
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = localStorage.getItem('eduflow-ai-language') || localStorage.getItem('sri-sudha-language')
      // If saved language is no longer supported, default to 'en'
      if (saved && ['en', 'hi', 'te'].includes(saved)) {
      return saved
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('eduflow-ai-language', locale)
    localStorage.removeItem('sri-sudha-language')
    document.documentElement.lang = locale
  }, [locale])

  const t = (key, vars = {}) => {
    const raw = translations[locale]?.[key] ?? translations.en[key] ?? key
    // simple interpolation for {name} placeholders
    return String(raw).replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? `{${v}}`))
  }

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLocaleState(lang)
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
        const raw = translations.en[key] ?? key
        return String(raw).replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? `{${v}}`))
      },
      locale: 'en',
      setLanguage: () => {},
    }
  }
  // Force component re-render when locale changes by including locale in dependency
  return ctx
}

// Export translations for use in other services
export { translations }
