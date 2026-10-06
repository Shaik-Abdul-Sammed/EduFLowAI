import { useState, useRef, useCallback, useEffect } from 'react'
import { getFullApiUrl } from '../config/apiConfig'

function getAuthToken() {
  try {
    // Try new key first, fall back to legacy for sessions created before rebrand
    const storedAuth = localStorage.getItem('eduflow-ai-auth') || localStorage.getItem('sri-sudha-auth')
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth)
      if (parsed?.token) return parsed.token
    }
  } catch {
    // ignore parse error
  }
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
}

function parseJwtExp(token) {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const decoded = JSON.parse(jsonPayload)
    return decoded.exp ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

function isTokenExpiredOrExpiring(token) {
  const expMs = parseJwtExp(token)
  if (!expMs) return false
  return Date.now() >= (expMs - 60000)
}

async function getOrRefreshToken() {
  let token = getAuthToken()
  const refreshToken = localStorage.getItem('refreshToken') || ''

  if (token && isTokenExpiredOrExpiring(token)) {
    if (refreshToken) {
      try {
        const refreshUrl = getFullApiUrl('/v1/auth/refresh')
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (res.ok) {
          const data = await res.json()
          const newToken = data.accessToken || data.token
          if (newToken) {
            localStorage.setItem('accessToken', newToken)
            localStorage.setItem('token', newToken)
            try {
              const authKey = localStorage.getItem('eduflow-ai-auth') ? 'eduflow-ai-auth' : 'sri-sudha-auth'
              const stored = localStorage.getItem(authKey)
              if (stored) {
                const parsed = JSON.parse(stored)
                parsed.token = newToken
                localStorage.setItem(authKey, JSON.stringify(parsed))
              }
            } catch {
              // ignore storage write errors
            }
            return newToken
          }
        }
      } catch (err) {
        console.warn('Proactive token refresh error:', err)
      }
    }
    // Refresh failed or no refreshToken
    try {
      sessionStorage.setItem('loginMessage', 'Session expired. Please log in again.')
    } catch {
      // ignore sessionStorage errors
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please log in again.')
  }

  return token
}

/**
 * Hook for consuming Server-Sent Events (SSE) from EduFlow AI Officer streaming endpoints.
 * Uses fetch + ReadableStream to support POST requests with JSON payload and auth headers.
 *
 * @returns {{
 *   tokens: string,
 *   status: 'idle' | 'connecting' | 'streaming' | 'done' | 'error',
 *   error: string | null,
 *   start: (endpoint: string, payload?: object) => Promise<void>,
 *   stop: () => void
 * }}
 */
export function useStreamingOfficer() {
  const [tokens, setTokens] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'connecting' | 'streaming' | 'done' | 'error'
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStatus((prev) => (prev === 'streaming' || prev === 'connecting' ? 'idle' : prev))
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const start = useCallback(async (endpoint, payload = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setTokens('')
    setError(null)
    setStatus('connecting')

    try {
      let token = await getOrRefreshToken()
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let targetUrl = endpoint
      if (typeof endpoint === 'string') {
        if (endpoint.startsWith('/api/')) {
          targetUrl = getFullApiUrl(endpoint.replace(/^\/api/, ''))
        } else if (endpoint.startsWith('/v1/')) {
          targetUrl = getFullApiUrl(endpoint)
        }
      }

      let response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      // If 401 received, attempt one refresh and retry
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken') || ''
        let refreshed = false
        if (refreshToken) {
          try {
            const refreshUrl = getFullApiUrl('/v1/auth/refresh')
            const res = await fetch(refreshUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            })
            if (res.ok) {
              const data = await res.json()
              const newToken = data.accessToken || data.token
              if (newToken) {
                localStorage.setItem('accessToken', newToken)
                localStorage.setItem('token', newToken)
                headers['Authorization'] = `Bearer ${newToken}`
                refreshed = true
                response = await fetch(targetUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(payload),
                  signal: controller.signal,
                })
              }
            }
          } catch (rErr) {
            console.warn('Reactive refresh failed:', rErr)
          }
        }

        if (!refreshed || response.status === 401) {
          try {
            sessionStorage.setItem('loginMessage', 'Session expired. Please log in again.')
          } catch {
            // ignore sessionStorage errors
          }
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login'
          }
          throw new Error('Session expired. Please log in again.')
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let message = `Request failed (${response.status})`
        try {
          const parsed = JSON.parse(errorText)
          if (parsed?.error) message = parsed.error
        } catch {
          if (errorText) message = errorText
        }
        throw new Error(message)
      }

      setStatus('streaming')

      if (!response.body) {
        throw new Error('ReadableStream not supported or response body is empty')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue

          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue

          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'token') {
              accumulated += data.text || ''
              setTokens(accumulated)
            } else if (data.type === 'done') {
              setStatus('done')
            } else if (data.type === 'error') {
              setError(data.message || 'Stream processing error')
              setStatus('error')
            }
          } catch {
            // Ignore incomplete JSON chunks
          }
        }
      }

      setStatus((prev) => (prev === 'streaming' ? 'done' : prev))
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle')
      } else {
        console.error('Streaming officer error:', err)
        setError(err.message || 'Streaming failed')
        setStatus('error')
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }, [])

  return {
    tokens,
    status,
    error,
    start,
    stop,
  }
}

export default useStreamingOfficer
