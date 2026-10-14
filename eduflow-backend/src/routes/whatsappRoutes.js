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

  // Governance Summaries & Leave Management
  router.get('/hod-daily-summary', WhatsAppWebhookController.getHodDailySummary)
  router.get('/dean-attendance-summary', WhatsAppWebhookController.getDeanAttendanceSummary)
  router.post('/leave', WhatsAppWebhookController.registerFacultyLeave)

  return router
}
