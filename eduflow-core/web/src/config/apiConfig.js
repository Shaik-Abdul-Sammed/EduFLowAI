// API configuration - resolves at runtime, not module load time
let apiBaseURL = null

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

  if (envUrl) {
    // Normalize: if the configured URL ends with /v1, strip it since caller routes append /v1
    apiBaseURL = envUrl.replace(/\/v1\/?$/, '').replace(/\/+$/, '')
  } else {
    // Fallback URL pointing to live Render backend
    apiBaseURL = 'https://eduflow-backend-jvn8.onrender.com/api'
  }

  return apiBaseURL
}
