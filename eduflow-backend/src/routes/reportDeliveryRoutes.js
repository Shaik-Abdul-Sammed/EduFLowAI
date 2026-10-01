import { Router } from 'express'
import { ReportDeliveryController } from '../controllers/ReportDeliveryController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

export function createReportDeliveryRouter() {
  const router = Router()

  // Public retrieval by token
  router.get('/token/:token', ReportDeliveryController.getReportByToken)
  router.get('/download/:token', ReportDeliveryController.downloadPublicReportPdf)

  // Protected Admin routes
  const adminGuard = [authMiddleware, requireRole(['admin'])]
  router.post('/deliver', adminGuard, ReportDeliveryController.deliverReport)
  router.get('/', adminGuard, ReportDeliveryController.getDeliveredReports)

  return router
}

export default createReportDeliveryRouter
