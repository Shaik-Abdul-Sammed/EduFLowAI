import crypto from 'crypto'
import { logger } from '../utils/logger.js'

export const apSecretStore = {
  current: process.env.NETWORK_WEBHOOK_SECRET_CURRENT || process.env.NETWORK_WEBHOOK_SECRET || 'eduflow-mesh-secret-2026',
  previous: process.env.NETWORK_WEBHOOK_SECRET_PREVIOUS || null,
  rotatedAt: null,
  rotationHistory: []
}

/**
 * Computes HMAC-SHA256 signature for payload
 */
export function computeHmacSignature(payload, secret) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload)
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

/**
 * Verifies if a given signature or raw secret matches current or previous secret
 */
export function verifyWebhookAuth({ payload, signature, secretHeader, logger: customLogger = logger } = {}) {
  const currentSecret = apSecretStore.current
  const previousSecret = apSecretStore.previous

  const sigToTest = signature ? signature.replace(/^sha256=/, '').trim().toLowerCase() : null
  const headerSecret = secretHeader ? secretHeader.trim() : null

  // 1. Check against current secret
  if (sigToTest) {
    const expectedCurrentSig = computeHmacSignature(payload, currentSecret).toLowerCase()
    if (sigToTest.length === expectedCurrentSig.length && crypto.timingSafeEqual(Buffer.from(sigToTest, 'hex'), Buffer.from(expectedCurrentSig, 'hex'))) {
      return { valid: true, secretUsed: 'current' }
    }
  } else if (headerSecret) {
    if (headerSecret === currentSecret) {
      return { valid: true, secretUsed: 'current' }
    }
  }

  // 2. Check against previous secret (within transition window)
  if (previousSecret) {
    if (sigToTest) {
      const expectedPrevSig = computeHmacSignature(payload, previousSecret).toLowerCase()
      if (sigToTest.length === expectedPrevSig.length && crypto.timingSafeEqual(Buffer.from(sigToTest, 'hex'), Buffer.from(expectedPrevSig, 'hex'))) {
        return { valid: true, secretUsed: 'previous', warning: 'Using previous secret during transition window' }
      }
    } else if (headerSecret) {
      if (headerSecret === previousSecret) {
        return { valid: true, secretUsed: 'previous', warning: 'Using previous secret during transition window' }
      }
    }
  }

  // 3. Stale or invalid secret
  const alertMsg = 'STALE_WEBHOOK_SECRET: AP webhook signature did not match current or previous secret'
  if (customLogger?.warn) customLogger.warn(alertMsg)
  else if (customLogger?.error) customLogger.error(alertMsg)

  return { valid: false, code: 'STALE_WEBHOOK_SECRET', error: 'Invalid or stale webhook secret' }
}

/**
 * Promotes current -> previous, generates new 32-byte hex for current
 */
export function rotateApSecret(rotatedBy = 'admin-01') {
  const now = new Date()
  const oldCurrent = apSecretStore.current
  const newSecret = crypto.randomBytes(32).toString('hex')

  apSecretStore.previous = oldCurrent
  apSecretStore.current = newSecret
  apSecretStore.rotatedAt = now.toISOString()
  apSecretStore.rotationHistory.unshift({
    rotatedAt: now.toISOString(),
    rotatedBy,
    previousSecretSnippet: oldCurrent.slice(0, 6) + '...',
    currentSecretSnippet: newSecret.slice(0, 6) + '...'
  })

  logger?.info?.(`[AP Webhook] Secret rotated by ${rotatedBy}. Previous secret retained for transition window.`)

  return {
    success: true,
    message: 'AP webhook secret rotated successfully',
    currentSecret: newSecret,
    previousSecret: oldCurrent,
    rotatedAt: apSecretStore.rotatedAt
  }
}

export default {
  apSecretStore,
  computeHmacSignature,
  verifyWebhookAuth,
  rotateApSecret
}
