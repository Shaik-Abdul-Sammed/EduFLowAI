import { Router } from 'express'
import { ReportDeliveryController } from '../controllers/ReportDeliveryController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

export function createReportDeliveryRouter() {
  const router = Router()

  // Public retrieval by token & sharing
  router.get('/token/:token', ReportDeliveryController.getReportByToken)
  router.get('/download/:token', ReportDeliveryController.downloadPublicReportPdf)
  router.post('/share', ReportDeliveryController.shareReport)
  router.post('/email', ReportDeliveryController.emailReport)

  // Protected Admin routes
  const adminGuard = [authMiddleware, requireRole(['admin'])]
  router.post('/deliver', adminGuard, ReportDeliveryController.deliverReport)
  router.get('/', adminGuard, ReportDeliveryController.getDeliveredReports)

  return router
}

export default createReportDeliveryRouter
