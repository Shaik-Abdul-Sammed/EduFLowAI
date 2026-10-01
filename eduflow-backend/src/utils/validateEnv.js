import { logger } from './logger.js'

/**
 * Validates required environment variables at application startup.
 * Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, AI_PROVIDER, AI_API_KEY
 * - In NODE_ENV=development, missing AI_API_KEY issues a warning and proceeds.
 * - In NODE_ENV=production, missing AI_API_KEY is fatal.
 * - Any other missing required vars causes process.exit(1).
 */
export function validateEnv() {
  const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production'

  const requiredAlways = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'AI_PROVIDER',
  ]

  const missing = []

  for (const varName of requiredAlways) {
    if (!process.env[varName] || !String(process.env[varName]).trim()) {
      missing.push(varName)
    }
  }

  // AI_API_KEY check
  const hasAiApiKey = Boolean(process.env.AI_API_KEY && String(process.env.AI_API_KEY).trim())
  if (!hasAiApiKey) {
    if (isProduction) {
      missing.push('AI_API_KEY')
    } else {
      logger.warn(
        'AI_API_KEY is not set in development mode. Falling back to MockProvider / FallbackProvider.',
      )
    }
  }

  if (missing.length > 0) {
    const errorMsg = `FATAL: Missing required environment variables: ${missing.join(', ')}`
    logger.error(errorMsg)
    // eslint-disable-next-line no-console
    console.error(`\n❌ ${errorMsg}\nPlease check your .env file before starting the server.\n`)
    process.exit(1)
  }

  logger.info({ nodeEnv: process.env.NODE_ENV || 'development' }, 'Environment variable validation passed')
}

export default validateEnv
