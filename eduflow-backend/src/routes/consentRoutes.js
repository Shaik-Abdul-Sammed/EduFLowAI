import express from 'express'
import { AttendanceController } from '../controllers/AttendanceController.js'

const router = express.Router()

router.post('/presence-tracking', AttendanceController.updatePrivacyConsent)
router.get('/presence-tracking', AttendanceController.getPrivacyConsent)

export function createConsentRouter() {
  return router
}

export default router
