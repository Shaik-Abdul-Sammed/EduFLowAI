import { Router } from 'express'
import { InvoiceController } from '../controllers/InvoiceController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

export function createInvoiceRouter() {
  const router = Router()

  // PDF download can be accessed with token or admin auth
  router.get('/:id/pdf', InvoiceController.downloadInvoicePdf)

  // Protected Admin routes
  const adminGuard = [authMiddleware, requireRole(['admin'])]
  router.post('/', adminGuard, InvoiceController.createInvoice)
  router.get('/', adminGuard, InvoiceController.getInvoices)
  router.get('/:id', adminGuard, InvoiceController.getInvoiceById)
  router.patch('/:id/mark-paid', adminGuard, InvoiceController.markPaid)
  router.post('/:id/upi-link', adminGuard, InvoiceController.generateUpiLink)
  router.post('/:id/mark-paid-manual', adminGuard, InvoiceController.markPaidManual)

  return router
}

export default createInvoiceRouter
