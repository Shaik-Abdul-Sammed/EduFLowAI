import { getApiBaseURL } from '../config/apiConfig'
import { wakeUpFetch } from '../utils/wakeUpHandler'

export function mapAuthError(err, status) {
  console.error('Auth error detail:', err)

  const effectiveStatus = status || err?.status || err?.statusCode || (typeof err === 'number' ? err : undefined)

  if (effectiveStatus === 401) {
    return "Invalid email or password. Please check and try again. If using demo, click 'Fill Admin Credentials'."
  }
  if (effectiveStatus === 404) {
    return 'Email not found. Did you mean to sign up?'
  }
  if (effectiveStatus === 429) {
    return 'Too many login attempts. Please wait 15 minutes.'
  }
  if (effectiveStatus === 500 || effectiveStatus === 502) {
    return 'Server is temporarily unavailable. Please try again in a minute.'
  }

  const errMsg = (err?.message || (typeof err === 'string' ? err : '')).toLowerCase()

  if (errMsg.includes('401') || errMsg.includes('invalid email') || errMsg.includes('invalid credential') || errMsg.includes('invalid password')) {
    return "Invalid email or password. Please check and try again. If using demo, click 'Fill Admin Credentials'."
  }
  if (errMsg.includes('404') || errMsg.includes('email not found')) {
    return 'Email not found. Did you mean to sign up?'
  }
  if (errMsg.includes('429') || errMsg.includes('too many login attempts') || errMsg.includes('rate limit')) {
    return 'Too many login attempts. Please wait 15 minutes.'
  }
  if (errMsg.includes('500') || errMsg.includes('502') || errMsg.includes('temporarily unavailable')) {
    return 'Server is temporarily unavailable. Please try again in a minute.'
  }
  if (
    errMsg.includes('failed to fetch') ||
    errMsg.includes('network') ||
    errMsg.includes('connection_refused') ||
    errMsg.includes('enotfound') ||
    errMsg.includes('timeout') ||
    errMsg.includes('abort') ||
    errMsg.includes('cannot reach server') ||
    err?.name === 'TypeError'
  ) {
    return 'Cannot reach server. The backend may be waking up. Please wait 30 seconds and try again.'
  }

  if (err?.message && !errMsg.includes('failed to fetch') && !errMsg.includes('networkerror')) {
    return err.message
  }

  return 'Something went wrong. Please try again.'
}

/**
 * Perform login using the real backend API.
 */
export async function loginWithRole({ role, username, email, password, institutionId }) {
  const baseUrl = getApiBaseURL() + '/v1'
  const effectiveEmail = email || username
  const effectiveUsername = username || email

  try {
    // 1. Get default institution for MVP or use provided institutionId
    let targetInstId = institutionId
    if (!targetInstId || targetInstId === 'demo' || targetInstId === 1 || targetInstId === '1') {
      try {
        const instResponse = await wakeUpFetch(`${baseUrl}/auth/default-institution`)
        if (instResponse.ok) {
          const instData = await instResponse.json()
          targetInstId = instData?.id
        }
      } catch {
        targetInstId = undefined
      }
    }

    // 2. Perform actual login
    const requestBody = {
      username: effectiveUsername,
      email: effectiveEmail,
      password,
      ...(role ? { role } : {})
    }
    if (targetInstId && targetInstId !== 'demo') {
      requestBody.institutionId = targetInstId
    }

    const loginResponse = await wakeUpFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!loginResponse.ok) {
      const errText = await loginResponse.text().catch(() => '')
      let errJson = {}
      try {
        errJson = JSON.parse(errText)
      } catch (parseErr) {
        errJson = { raw: errText, error: String(parseErr) }
      }
      const mappedMsg = mapAuthError(errJson, loginResponse.status)
      throw new Error(mappedMsg)
    }

    const data = await loginResponse.json()

    // 3. Store tokens
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

    return {
      token: data.accessToken,
      user: data.user
    }
  } catch (err) {
    const knownMessages = [
      "Invalid email or password. Please check and try again. If using demo, click 'Fill Admin Credentials'.",
      "Email not found. Did you mean to sign up?",
      "Too many login attempts. Please wait 15 minutes.",
      "Server is temporarily unavailable. Please try again in a minute.",
      "Cannot reach server. The backend may be waking up. Please wait 30 seconds and try again.",
      "Something went wrong. Please try again."
    ]
    if (knownMessages.includes(err.message)) {
      throw err
    }
    const friendlyMsg = mapAuthError(err)
    throw new Error(friendlyMsg, { cause: err })
  }
}

/**
 * Register a new institution and admin user.
 */
export async function registerInstitution(registrationData) {
  const baseUrl = getApiBaseURL() + '/v1'
  
  try {
    const response = await fetch(`${baseUrl}/institutions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

    return {
      token: data.accessToken,
      user: data.user
    }
  } catch (err) {
    console.error('Registration error:', err)
    throw err
  }
}

/**
 * Handle logout
 */
export async function logout() {
  const baseUrl = getApiBaseURL() + '/v1'
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
    } catch (e) {
      console.error('Logout API failed:', e)
    }
  }
  
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

/**
 * Automatically fetch a new access token using the refresh token
 */
export async function refreshSession() {
  const baseUrl = getApiBaseURL() + '/v1'
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token available')

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  if (!response.ok) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    throw new Error('Session expired')
  }

  const data = await response.json()
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  
  return data.accessToken
}
