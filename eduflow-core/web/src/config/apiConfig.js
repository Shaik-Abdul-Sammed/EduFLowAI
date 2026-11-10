let apiBaseURL = null

export function resetApiBaseURL() {
  apiBaseURL = null
}

export function getApiBaseURL() {
  if (apiBaseURL) return apiBaseURL

  let metaEnv
  try {
    metaEnv = new Function('try { return import.meta.env } catch { return undefined }')()
  } catch {
    metaEnv = undefined
  }

  const envUrl = (metaEnv && metaEnv.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL)

  const hostname = typeof window !== 'undefined' ? (window.__hostname || window.location?.hostname || '') : ''
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

  if (envUrl && envUrl.trim() !== '') {
    let cleaned = envUrl.replace(/\/v1\/?$/, '').replace(/\/+$/, '')
    // Auto-fix typo in Render backend hostname (1vn8 -> jvn8)
    cleaned = cleaned.replace(/eduflow-backend-1vn8/gi, 'eduflow-backend-jvn8')
    apiBaseURL = cleaned
  } else if (isLocalhost) {
    apiBaseURL = 'http://localhost:3000/api'
  } else {
    apiBaseURL = 'https://eduflow-backend-jvn8.onrender.com/api'
  }

  return apiBaseURL
}

export function getFullApiUrl(path) {
  const base = getApiBaseURL()
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return base + cleanPath
}
