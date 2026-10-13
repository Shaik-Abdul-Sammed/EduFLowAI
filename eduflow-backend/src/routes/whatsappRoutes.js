import express from 'express'
import { WhatsAppWebhookController } from '../controllers/WhatsAppWebhookController.js'

export function createWhatsAppRouter() {
  const router = express.Router()

  // Webhook endpoints (Twilio & Meta)
  router.get('/webhook', WhatsAppWebhookController.verifyWebhook)
  router.post('/webhook', WhatsAppWebhookController.handleInboundMessage)

  // System & Simulator endpoints
  router.get('/status', WhatsAppWebhookController.getStatus)
  router.post('/simulate-message', WhatsAppWebhookController.handleInboundMessage)

  // Staged Attendance Queue
  router.get('/staged', WhatsAppWebhookController.getStaged)
  router.post('/staged/:id/confirm', WhatsAppWebhookController.confirmStaged)
  router.post('/staged/:id/reject', WhatsAppWebhookController.rejectStaged)

  // Logs & Directory
  router.get('/logs', WhatsAppWebhookController.getLogs)
  router.get('/faculty', WhatsAppWebhookController.getFaculty)

  return router
}
