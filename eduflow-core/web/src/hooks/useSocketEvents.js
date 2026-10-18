import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getApiBaseURL } from '../config/apiConfig'

function getSocketUrl() {
  // 1. Try environment variable first
  let apiBase
  try {
    const metaEnv = new Function('try { return import.meta.env } catch { return undefined }')()
    apiBase = (metaEnv && metaEnv.VITE_API_BASE_URL) ||
      (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL)
  } catch {
    apiBase = undefined
  }

  // 2. Fallback to production backend if env is missing or relative
  if (!apiBase || apiBase.startsWith('/')) {
    apiBase = 'https://eduflow-backend-jvn8.onrender.com/api'
  }

  try {
    // Create URL object to safely parse host and protocol
    const url = new URL(apiBase)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${url.host}`
  } catch {
    // Ultimate fallback
    return 'wss://eduflow-backend-jvn8.onrender.com'
  }
}

export function useSocketEvents() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [recentUpdates, setRecentUpdates] = useState([])

  useEffect(() => {
    const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
    if (!token) {
      setIsConnected(false)
      return
    }

    const socketUrl = getSocketUrl()

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 20000,
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))
    socket.on('connect_error', () => {
      setIsConnected(false)
    })

    const handleGenericEvent = (eventName) => (data) => {
      const payload = { event: eventName, data, timestamp: new Date().toISOString() }
      setLastEvent(payload)
      setRecentUpdates((prev) => [payload, ...prev.slice(0, 19)])
    }

    socket.on('attendance:update', handleGenericEvent('attendance:update'))
    socket.on('fee:payment_received', handleGenericEvent('fee:payment_received'))
    socket.on('escalation:new', handleGenericEvent('escalation:new'))
    socket.on('notification:new', handleGenericEvent('notification:new'))

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const emitEvent = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data)
      return true
    }
    return false
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  return {
    isConnected,
    lastEvent,
    recentUpdates,
    emitEvent,
    getSocket
  }
}

