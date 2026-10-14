import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let ioInstance = null
const activeSockets = new Map()

export class SocketService {
  static getIO() {
    return ioInstance
  }

  static getActiveSockets() {
    return activeSockets
  }

  /**
   * Attach Socket.IO to HTTP server with authentication and multi-tenant room routing
   */
  static attachSocketIO(httpServer) {
    if (ioInstance) return ioInstance

    ioInstance = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 30000,
      pingInterval: 25000
    })

    // Authentication & Tenant Room Middleware
    ioInstance.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')

      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
          const decoded = jwt.verify(token, secret)
          socket.user = decoded
        } catch (err) {
          // Allow connection as anonymous/guest if token expired, or attach minimal context
          socket.user = { institutionId: 1, role: 'guest', id: null }
        }
      } else {
        socket.user = { institutionId: 1, role: 'guest', id: null }
      }
      next()
    })

    ioInstance.on('connection', (socket) => {
      const user = socket.user || { institutionId: 1, role: 'guest' }
      const institutionId = user.institutionId || 1
      activeSockets.set(socket.id, { socketId: socket.id, user, connectedAt: new Date() })

      // Automatically join institutional, role, and user-specific rooms
      socket.join(`institution_${institutionId}`)
      if (user.role) {
        socket.join(`role_${institutionId}_${user.role}`)
      }
      if (user.id) {
        socket.join(`user_${user.id}`)
      }

      console.log(`[SocketService] Client connected: ${socket.id} (Inst: ${institutionId}, Role: ${user.role})`)

      // Acknowledge connection
      socket.emit('connection:ack', {
        socketId: socket.id,
        institutionId,
        role: user.role,
        connectedAt: new Date().toISOString()
      })

      // Handle custom client room subscriptions
      socket.on('subscribe:channel', (channel) => {
        socket.join(channel)
      })

      socket.on('unsubscribe:channel', (channel) => {
        socket.leave(channel)
      })

      socket.on('disconnect', () => {
        activeSockets.delete(socket.id)
        console.log(`[SocketService] Client disconnected: ${socket.id}`)
      })
    })

    return ioInstance
  }

  /**
   * Broadcast an event to all users within an institution
   */
  static emitToInstitution(institutionId, event, data) {
    if (!ioInstance) return false
    ioInstance.to(`institution_${institutionId}`).emit(event, {
      ...data,
      emittedAt: new Date().toISOString()
    })
    return true
  }

  /**
   * Send an event directly to a single user
   */
  static emitToUser(userId, event, data) {
    if (!ioInstance) return false
    ioInstance.to(`user_${userId}`).emit(event, {
      ...data,
      emittedAt: new Date().toISOString()
    })
    return true
  }

  /**
   * Send an event to all users of a specific role within an institution
   */
  static emitToRole(institutionId, role, event, data) {
    if (!ioInstance) return false
    ioInstance.to(`role_${institutionId}_${role}`).emit(event, {
      ...data,
      emittedAt: new Date().toISOString()
    })
    return true
  }

  /**
   * Broadcast across all connected clients
   */
  static emitBroadcast(event, data) {
    if (!ioInstance) return false
    ioInstance.emit(event, {
      ...data,
      emittedAt: new Date().toISOString()
    })
    return true
  }

  /**
   * Helper for attendance marked events
   */
  static broadcastAttendanceUpdate(institutionId, attendanceRecord) {
    return this.emitToInstitution(institutionId, 'attendance:update', attendanceRecord)
  }

  /**
   * Helper for fee payments received
   */
  static broadcastFeePaymentReceived(institutionId, paymentData) {
    return this.emitToInstitution(institutionId, 'fee:payment_received', paymentData)
  }

  /**
   * Helper for new academic escalations
   */
  static broadcastEscalation(institutionId, escalationData) {
    return this.emitToRole(institutionId, 'hod', 'escalation:new', escalationData)
  }
}
