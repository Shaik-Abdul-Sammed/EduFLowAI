import { rateLimit } from 'express-rate-limit'
import pinoHttp from 'pino-http'
import { pinoInstance } from '../utils/logger.js'

export {
  validateRequest,
  loginSchema,
  registerUserSchema,
  registerInstitutionSchema,
  officerPromptSchema,
  aiChatSchema,
} from './validateRequest.js'

/**
 * E.1: Production Rate Limiter
 * - Authenticated routes: 100 requests per 15 mins (RATE_LIMIT_MAX_AUTH)
 * - Unauthenticated routes: 20 requests per 15 mins (RATE_LIMIT_MAX_UNAUTH)
 * - Window: 15 mins (RATE_LIMIT_WINDOW_MS)
 * - Custom 429 handler with Retry-After header
 * - Skips /api/health and /api/health/db
 */
const maxAuth = parseInt(process.env.RATE_LIMIT_MAX_AUTH || '100', 10)
const maxUnauth = parseInt(process.env.RATE_LIMIT_MAX_UNAUTH || '20', 10)
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)

export const productionRateLimiter = rateLimit({
  windowMs,
  limit: (req) => {
    const authHeader = req.headers.authorization || ''
    const hasAuth = authHeader.startsWith('Bearer ') && authHeader.length > 10
    return hasAuth ? maxAuth : maxUnauth
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    const p = req.originalUrl || req.path
    return p === '/api/health' || p === '/api/health/db' || p.startsWith('/api/health')
  },
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    })
  },
})

/**
 * E.3: Pino HTTP Logging Middleware
 * - Logs: method, url, statusCode, responseTime, userAgent, ip, userId
 * - Does NOT log request bodies
 */
export const httpLogger = pinoHttp({
  logger: pinoInstance,
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.raw?.user?.id || req.user?.id || undefined,
      }
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      }
    },
  },
  customProps: (req) => ({
    userId: req.user?.id || req.raw?.user?.id || undefined,
  }),
  autoLogging: {
    ignore: (req) => {
      const p = req.url || ''
      return p === '/api/health' || p === '/api/health/db'
    },
  },
})

export default {
  productionRateLimiter,
  httpLogger,
}
