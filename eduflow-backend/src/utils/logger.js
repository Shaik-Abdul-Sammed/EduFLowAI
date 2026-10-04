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

export default logger
