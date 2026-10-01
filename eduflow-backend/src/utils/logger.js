import pino from 'pino'

const redactPaths = [
  'password',
  '*.password',
  'token',
  '*.token',
  'refreshToken',
  '*.refreshToken',
  'authorization',
  '*.authorization',
  'apiKey',
  '*.apiKey',
  'headers.authorization',
  'req.headers.authorization',
]

export const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

function adaptMethod(fn, instance) {
  return (first, second, third) => {
    if (typeof first === 'string' && second !== undefined) {
      if (second instanceof Error) {
        return fn.call(instance, { err: second, ...(third || {}) }, first)
      }
      if (typeof second === 'object' && second !== null) {
        return fn.call(instance, { ...second }, first)
      }
    }
    return fn.call(instance, first, second)
  }
}

export function wrapLogger(instance) {
  return {
    info: adaptMethod(instance.info, instance),
    error: adaptMethod(instance.error, instance),
    warn: adaptMethod(instance.warn, instance),
    debug: adaptMethod(instance.debug, instance),
    child(bindings) {
      return wrapLogger(instance.child(bindings))
    },
    raw: instance,
  }
}

export const logger = wrapLogger(pinoInstance)

export function createLogger(name) {
  return wrapLogger(pinoInstance.child({ logger: name }))
}

export default logger
