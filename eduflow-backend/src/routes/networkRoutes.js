import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { NetworkWebhookController } from '../controllers/NetworkWebhookController.js'

export function createNetworkRouter() {
  const router = express.Router()

  // High-throughput rate limiter for campus Wi-Fi AP association events: 10,000 requests per minute
  const associationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10000,
    message: { error: 'Too many network association requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
  })

  // Network Webhook Ingestion endpoint
  router.post('/association', associationLimiter, NetworkWebhookController.handleAssociation)

  // Live Granular Presence for Faculty
  router.get('/presence/live', NetworkWebhookController.getLivePresence)

  // DPDP-compliant Sanitized Presence for Students
  router.get('/presence/student', NetworkWebhookController.getStudentSanitizedPresence)
  router.get('/presence/student/:roll', NetworkWebhookController.getStudentSanitizedPresence)
  router.get('/student-presence', NetworkWebhookController.getStudentSanitizedPresence)
  router.get('/student-presence/:roll', NetworkWebhookController.getStudentSanitizedPresence)

  // Student Dispute Workflows
  router.post('/presence/dispute', NetworkWebhookController.submitDispute)
  router.get('/presence/disputes', NetworkWebhookController.getDisputes)
  router.patch('/presence/disputes/:id', NetworkWebhookController.resolveDispute)

  // Device Registration (stores SHA-256 hash only)
  router.post('/devices/register', NetworkWebhookController.registerDevice)

  // Network AP Zones
  router.get('/zones', NetworkWebhookController.getZones)

  return router
}

export default createNetworkRouter
