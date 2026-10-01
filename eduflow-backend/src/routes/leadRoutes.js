import { Router } from 'express'
import { LeadController } from '../controllers/LeadController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

export function createLeadRouter() {
  const router = Router()

  // PUBLIC: Submit lead interest from /for-colleges
  router.post('/', LeadController.submitPublicLead)

  // ADMIN ONLY ROUTES
  const adminGuard = [authMiddleware, requireRole(['admin'])]

  router.get('/', adminGuard, LeadController.getLeads)
  router.get('/:id', adminGuard, LeadController.getLeadById)
  router.patch('/:id', adminGuard, LeadController.updateLead)
  router.delete('/:id', adminGuard, LeadController.deleteLead)
  router.post('/:id/send-pilot-offer', adminGuard, LeadController.sendPilotOffer)

  return router
}

export default createLeadRouter
