import pino from 'pino'

export const pinoInstance = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
})

export const logger = pinoInstance

export function createLogger(name) {
  if (name) {
    return pinoInstance.child({ name })
  }
  return pinoInstance
}

// Feature 71: Ensure Pino logger captures all unhandled rejections and uncaught exceptions
let globalLoggingInitialized = false
export function setupGlobalErrorLogging() {
  if (globalLoggingInitialized) return
  globalLoggingInitialized = true

  process.on('unhandledRejection', (reason, promise) => {
    pinoInstance.error({ reason, promise }, 'Unhandled Rejection at Promise')
  })

  process.on('uncaughtException', (err) => {
    pinoInstance.error({ err }, 'Uncaught Exception thrown')
  })
}

if (process.env.NODE_ENV !== 'test') {
  setupGlobalErrorLogging()
}

export default logger
