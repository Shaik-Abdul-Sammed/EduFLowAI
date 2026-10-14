import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { AcademicEscalationController } from '../controllers/AcademicEscalationController.js'

const router = express.Router()

router.use(authMiddleware)

// Raise escalation: finance_officer, accounts_staff, admin
router.post(
  '/raise',
  requireRole('finance_officer', 'accounts_staff', 'admin'),
  AcademicEscalationController.raiseEscalation
)

// HOD pending list: hod, admin, finance_officer
router.get(
  '/hod/pending',
  requireRole('hod', 'admin', 'finance_officer'),
  AcademicEscalationController.getPendingHOD
)

// Approve consequence: hod, admin
router.post(
  '/:id/approve',
  requireRole('hod', 'admin'),
  AcademicEscalationController.approve
)

// Reject consequence: hod, admin
router.post(
  '/:id/reject',
  requireRole('hod', 'admin'),
  AcademicEscalationController.reject
)

// Summary for Dean / Registrar / Finance Officer
router.get(
  '/summary',
  requireRole('admin', 'registrar', 'finance_officer'),
  AcademicEscalationController.getSummary
)

export default router
