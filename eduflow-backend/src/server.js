import dotenv from 'dotenv'
import { createApp } from './app.js'
import { Server } from 'socket.io'
import { validateEnv } from './utils/validateEnv.js'
import { logger } from './utils/logger.js'
import { pool } from './db/pool.js'
import { disconnectRedis } from './utils/cache.js'

dotenv.config()
validateEnv()

const app = createApp()
app.set('trust proxy', 1)
const BASE_PORT = Number(process.env.PORT || 3000)

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', () => resolve(server))

    server.on('error', (error) => {
      server.close(() => reject(error))
    })
  })
}

function setupGracefulShutdown(server) {
  let isShuttingDown = false

  const shutdown = (signal) => {
    if (isShuttingDown) return
    isShuttingDown = true

    logger.info(`Received ${signal}. Shutting down gracefully...`)

    const forceTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcing exit.')
      process.exit(1)
    }, 10000)
    forceTimer.unref()

    server.close(async (closeErr) => {
      if (closeErr) {
        logger.error('Error closing HTTP server:', closeErr)
      } else {
        logger.info('HTTP server closed.')
      }

      try {
        await pool.end()
        logger.info('Database pool closed.')
      } catch (dbErr) {
        logger.error('Error closing database pool:', dbErr)
      }

      try {
        await disconnectRedis()
        logger.info('Redis client closed.')
      } catch {
        // Ignore if redis wasn't connected
      }

      clearTimeout(forceTimer)
      logger.info('Graceful shutdown complete.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

async function startServer() {
  const maxAttempts = 5

  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = BASE_PORT + offset

    try {
      const server = await listenOnPort(port)
      setupGracefulShutdown(server)
      
      // Initialize Socket.io for Live User GPS tracking
      const io = new Server(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })
      
      io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`)
        
        // Mock user GPS movement generator
        let lat = 17.3850
        let lng = 78.4867
        const interval = setInterval(() => {
          lat += (Math.random() - 0.5) * 0.0005
          lng += (Math.random() - 0.5) * 0.0005
          socket.emit('user_location_update', { 
            userId: 'U1001', 
            name: 'Shaik Abdul Sammed', 
            role: 'Student', 
            lat, 
            lng, 
            timestamp: new Date() 
          })
        }, 5000)
        
        socket.on('chat_message', (msg) => {
          // Broadcast to everyone (in a real app, use rooms per user)
          io.emit('chat_message', { ...msg, timestamp: new Date() })
        })

        socket.on('disconnect', () => {
          clearInterval(interval)
          console.log(`Socket disconnected: ${socket.id}`)
        })
      })

      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${port}`)
      return
    } catch (error) {
      if (error?.code !== 'EADDRINUSE' || offset === maxAttempts - 1) {
        throw error
      }

      // eslint-disable-next-line no-console
      console.warn(`Port ${port} is busy, trying ${port + 1}...`)
    }
  }
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', error.message)
  process.exit(1)
})
