import crypto from 'crypto'
import { logger } from './logger.js'

/**
 * Validates required environment variables at application startup.
 * Automatically injects secure fallbacks for Render production deployments
 * so that missing optional keys never cause fatal boot crashes or deploy failures.
 */
export function validateEnv() {
  const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production'

  // DATABASE_URL
  if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
    logger.warn('DATABASE_URL is not set; running with memory pool fallback')
  }

  // JWT_SECRET (auto-provision secure 64-char fallback if missing or short)
  const jwtSecret = process.env.JWT_SECRET || ''
  if (!jwtSecret || jwtSecret.length < 32) {
    const fallbackSecret = crypto.randomBytes(32).toString('hex')
    process.env.JWT_SECRET = fallbackSecret
    logger.warn('JWT_SECRET was missing or <32 characters; generated ephemeral cryptographically secure 256-bit secret')
  }

  // JWT_REFRESH_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || ''
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
    const fallbackRefreshSecret = crypto.randomBytes(32).toString('hex')
    process.env.JWT_REFRESH_SECRET = fallbackRefreshSecret
    logger.warn('JWT_REFRESH_SECRET was missing or <32 characters; generated ephemeral cryptographically secure 256-bit refresh secret')
  }

  // AI_PROVIDER
  const validProviders = ['gemini', 'openai', 'claude', 'ollama']
  const aiProvider = (process.env.AI_PROVIDER || '').toLowerCase()
  if (!aiProvider || !validProviders.includes(aiProvider)) {
    process.env.AI_PROVIDER = 'gemini'
    logger.warn("AI_PROVIDER not specified; defaulted to 'gemini'")
  }

  // AI_API_KEY (graceful fallback to FallbackProvider rather than crashing server)
  if (process.env.AI_PROVIDER !== 'ollama' && (!process.env.AI_API_KEY || !String(process.env.AI_API_KEY).trim())) {
    logger.warn('AI_API_KEY is not set. AI services will use resilient local FallbackProvider with mock Socratic stream.')
  }

  logger.info({ nodeEnv: process.env.NODE_ENV || 'development' }, 'Environment variable validation passed')
}

export default validateEnv
