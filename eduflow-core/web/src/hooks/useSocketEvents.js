import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

let globalSocket = null

function getSocketInstance() {
  if (!globalSocket) {
    const token = localStorage.getItem('accessToken') || ''
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : window.location.origin

    globalSocket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    })
  }
  return globalSocket
}

export function useSocketEvents() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [recentUpdates, setRecentUpdates] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = getSocketInstance()
    socketRef.current = socket

    const onConnect = () => {
      setIsConnected(true)
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    const handleGenericEvent = (eventName) => (data) => {
      const payload = { event: eventName, data, timestamp: new Date().toISOString() }
      setLastEvent(payload)
      setRecentUpdates((prev) => [payload, ...prev.slice(0, 19)])
    }

    const onAttendanceUpdate = handleGenericEvent('attendance:update')
    const onFeePayment = handleGenericEvent('fee:payment_received')
    const onEscalation = handleGenericEvent('escalation:new')
    const onNotification = handleGenericEvent('notification:new')

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('attendance:update', onAttendanceUpdate)
    socket.on('fee:payment_received', onFeePayment)
    socket.on('escalation:new', onEscalation)
    socket.on('notification:new', onNotification)

    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('attendance:update', onAttendanceUpdate)
      socket.off('fee:payment_received', onFeePayment)
      socket.off('escalation:new', onEscalation)
      socket.off('notification:new', onNotification)
    }
  }, [])

  const emitEvent = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data)
      return true
    }
    return false
  }, [])

  return {
    isConnected,
    lastEvent,
    recentUpdates,
    emitEvent,
    socket: socketRef.current
  }
}
