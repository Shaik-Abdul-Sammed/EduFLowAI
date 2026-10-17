import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getApiBaseURL } from '../config/apiConfig'

function getSocketUrl() {
  const apiBase = getApiBaseURL() // e.g., "https://eduflow-backend-jvn8.onrender.com/api"
  try {
    const url = new URL(apiBase)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${url.host}` // e.g., "wss://eduflow-backend-jvn8.onrender.com"
  } catch {
    const fallbackHost = typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')
      ? 'localhost:3000'
      : 'eduflow-backend-jvn8.onrender.com'
    const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
    return `${isHttps ? 'wss:' : 'ws:'}//${fallbackHost}`
  }
}

export function useSocketEvents() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [recentUpdates, setRecentUpdates] = useState([])

  useEffect(() => {
    const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
    const socketUrl = getSocketUrl()

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    })

    const checkHealthFallback = () => {
      const apiBase = getApiBaseURL()
      fetch(`${apiBase}/health`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.ok) {
            setIsConnected(true)
          } else {
            setIsConnected(false)
          }
        })
        .catch(() => setIsConnected(false))
    }

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))
    socket.on('connect_error', (err) => {
      console.warn('[socket] connection failed:', err.message)
      checkHealthFallback()
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

