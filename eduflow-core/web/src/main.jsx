// Unregister any existing service workers to prevent old routes from caching
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  }).catch(() => {})
}

async function checkAppVersion() {
  try {
    const res = await fetch('/version.json?t=' + Date.now())
    if (!res.ok) return
    const data = await res.json()
    const fetchedVersion = data?.version
    if (!fetchedVersion) return

    const storedVersion = localStorage.getItem('app_version')
    if (storedVersion) {
      if (storedVersion !== fetchedVersion) {
        localStorage.setItem('app_version', fetchedVersion)
        window.location.reload(true)
      }
    } else {
      localStorage.setItem('app_version', fetchedVersion)
    }
  } catch {
    // Fail silently on network or parse error
  }
}

checkAppVersion()
setInterval(checkAppVersion, 60000)

const EXTENSION_PATTERNS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'installHook.js',
  'zotero_config.js',
  'inject.js',
  'offscreenTranslate.js',
  'virtualOffscreenTranslate.js',
  'itemSaver.js',
  'pageSaving.js',
  'singlefile.js',
  'messagingGeneric.js',
  'Auth error detail',
]

function isExtensionNoise(args) {
  return args.some((arg) => {
    const s = typeof arg === 'string' ? arg : (arg && arg.stack) || (arg && arg.message) || ''
    return EXTENSION_PATTERNS.some((pat) => String(s).includes(pat))
  })
}

const _error = console.error.bind(console)
const _warn = console.warn.bind(console)
const _log = console.log.bind(console)
console.error = (...args) => { if (!isExtensionNoise(args)) _error(...args) }
console.warn = (...args) => { if (!isExtensionNoise(args)) _warn(...args) }
console.log = (...args) => { if (!isExtensionNoise(args)) _log(...args) }

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    try {
      const reloadKey = 'eduflow_last_chunk_reload'
      const now = Date.now()
      const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10)
      if (now - lastReload > 10000) {
        sessionStorage.setItem(reloadKey, String(now))
        window.location.reload()
      }
    } catch {
      window.location.reload()
    }
  })

  window.addEventListener('error', (event) => {
    const src = event.filename || ''
    if (EXTENSION_PATTERNS.some((p) => src.includes(p))) {
      event.stopImmediatePropagation()
      event.preventDefault()
      return true
    }
  }, true)

  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event.reason && (event.reason.stack || event.reason.message || String(event.reason))) || ''
    if (EXTENSION_PATTERNS.some((p) => reason.includes(p))) event.preventDefault()
  })
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
