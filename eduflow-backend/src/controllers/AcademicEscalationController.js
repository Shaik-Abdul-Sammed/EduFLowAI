import { AcademicEscalationService } from '../services/finance/AcademicEscalationService.js'

export class AcademicEscalationController {
  /**
   * POST /api/v1/escalations/raise
   * Auth: finance_officer, accounts_staff, admin
   */
  static async raiseEscalation(req, res) {
    try {
      const {
        invoiceId,
        studentId,
        studentName,
        studentRoll,
        department,
        invoiceNumber,
        amount,
        actionRequested,
        reason
      } = req.body

      if (!invoiceId) {
        return res.status(400).json({ error: 'invoiceId is required' })
      }

      const escalation = await AcademicEscalationService.escalateToHOD({
        institutionId: req.user?.institutionId || 1,
        invoiceId,
        studentId,
        studentName,
        studentRoll,
        department,
        invoiceNumber,
        amount,
        raisedBy: req.user?.id || 1,
        actionRequested: actionRequested || 'HALL_TICKET_HOLD',
        reason: reason || 'Overdue fee beyond grace period'
      })

      return res.status(201).json({
        success: true,
        message: 'Escalation successfully submitted to HOD for academic intervention',
        escalation
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * GET /api/v1/escalations/hod/pending
   * Auth: hod, admin, finance_officer
   */
  static async getPendingHOD(req, res) {
    try {
      const department = req.user?.role === 'hod' ? req.user?.department : req.query.department || null
      const pending = await AcademicEscalationService.getPendingForHOD({
        department,
        institutionId: req.user?.institutionId || 1
      })
      return res.status(200).json({ success: true, pending, escalations: pending })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * POST /api/v1/escalations/:id/approve
   * Auth: hod, admin
   */
  static async approve(req, res) {
    try {
      const { id } = req.params
      const escalation = await AcademicEscalationService.approveEscalation(
        id,
        req.user?.id || 1,
        req.user?.institutionId || 1
      )
      return res.status(200).json({
        success: true,
        message: `Academic consequence (${escalation.action_requested}) approved by HOD. Audit log recorded.`,
        escalation
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * POST /api/v1/escalations/:id/reject
   * Auth: hod, admin
   */
  static async reject(req, res) {
    try {
      const { id } = req.params
      const { reason } = req.body
      const escalation = await AcademicEscalationService.rejectEscalation(
        id,
        reason || 'Deferred on student academic appeal',
        req.user?.id || 1
      )
      return res.status(200).json({
        success: true,
        message: 'Escalation rejected / deferred by HOD',
        escalation
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * GET /api/v1/escalations/summary
   * Auth: admin, registrar, finance_officer
   */
  static async getSummary(req, res) {
    try {
      const data = await AcademicEscalationService.getAllSummary({
        institutionId: req.user?.institutionId || 1
      })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}

AcademicEscalationController.createEscalation = AcademicEscalationController.raiseEscalation
AcademicEscalationController.getPendingForHOD = AcademicEscalationController.getPendingHOD
AcademicEscalationController.approveEscalation = AcademicEscalationController.approve
AcademicEscalationController.rejectEscalation = AcademicEscalationController.reject

