import { logger } from './logger.js'

/**
 * Validates required environment variables at application startup.
 * Checks:
 * - DATABASE_URL must be present
 * - JWT_SECRET must be present and at least 32 characters
 * - JWT_REFRESH_SECRET must be present and at least 32 characters
 * - AI_PROVIDER must be one of: gemini, openai, claude, ollama
 * - AI_API_KEY must be present unless AI_PROVIDER is ollama
 * - In NODE_ENV=production, missing any of the above exits with code 1
 */
export function validateEnv() {
  const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production'
  const errors = []

  // DATABASE_URL
  if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
    if (isProduction) {
      errors.push('DATABASE_URL must be present')
    } else {
      logger.warn('DATABASE_URL is not set; running with memory pool fallback')
    }
  }

  // JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET || ''
  if (!jwtSecret || jwtSecret.length < 32) {
    if (isProduction) {
      errors.push('JWT_SECRET must be present and at least 32 characters')
    } else if (jwtSecret) {
      logger.warn('JWT_SECRET should be at least 32 characters in production')
    }
  }

  // JWT_REFRESH_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || ''
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
    if (isProduction) {
      errors.push('JWT_REFRESH_SECRET must be present and at least 32 characters')
    } else if (jwtRefreshSecret) {
      logger.warn('JWT_REFRESH_SECRET should be at least 32 characters in production')
    }
  }

  // AI_PROVIDER
  const validProviders = ['gemini', 'openai', 'claude', 'ollama']
  const aiProvider = (process.env.AI_PROVIDER || '').toLowerCase()
  if (!aiProvider || !validProviders.includes(aiProvider)) {
    if (isProduction) {
      errors.push(`AI_PROVIDER must be one of: ${validProviders.join(', ')}`)
    } else {
      logger.warn(`AI_PROVIDER '${aiProvider}' is not recognized or not set; fallback may be used`)
    }
  }

  // AI_API_KEY (required unless AI_PROVIDER is ollama)
  if (aiProvider !== 'ollama' && (!process.env.AI_API_KEY || !String(process.env.AI_API_KEY).trim())) {
    if (isProduction) {
      errors.push('AI_API_KEY must be present unless AI_PROVIDER is ollama')
    } else {
      logger.warn('AI_API_KEY is not set in development mode. Falling back to MockProvider / FallbackProvider.')
    }
  }

  if (errors.length > 0) {
    const errorMsg = `FATAL: Environment validation failed in production:\n  - ${errors.join('\n  - ')}`
    logger.error(errorMsg)
    // eslint-disable-next-line no-console
    console.error(`\n❌ ${errorMsg}\nPlease check your environment variables before starting the server.\n`)
    process.exit(1)
  }

  logger.info({ nodeEnv: process.env.NODE_ENV || 'development' }, 'Environment variable validation passed')
}

export default validateEnv
