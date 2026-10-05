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
      const token = getAuthToken()
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

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

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
