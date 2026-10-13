import express from 'express'
import { FeeReminderController } from '../controllers/FeeReminderController.js'

export function createFeeReminderRouter() {
  const router = express.Router()

  router.get('/pending', FeeReminderController.getPending)
  router.post('/send-now', FeeReminderController.sendNow)
  router.get('/history', FeeReminderController.getHistory)
  router.get('/settings', FeeReminderController.getSettings)
  router.post('/settings', FeeReminderController.updateSettings)
  router.post('/test-preview', FeeReminderController.sendTestPreview)

  return router
}
