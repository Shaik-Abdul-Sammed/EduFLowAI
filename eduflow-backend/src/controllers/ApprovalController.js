import { StaffActivityLogRepository } from '../models/StaffActivityLogRepository.js'
import { logger } from '../utils/logger.js'

export class ApprovalController {
  static async getPending(req, res) {
    try {
      const user = req.user
      // HOD only sees department staff, Admin sees all
      const departmentId = user.role === 'hod' ? user.departmentId : null
      const institutionId = user.institutionId || 1

      const pending = await StaffActivityLogRepository.findPending({
        departmentId,
        institutionId,
      })

      return res.status(200).json({
        success: true,
        count: pending.length,
        approvals: pending,
      })
    } catch (err) {
      logger.error(`Error in getPending approvals: ${err.message}`)
      return res.status(500).json({ error: 'Failed to fetch pending approvals' })
    }
  }

  static async approve(req, res) {
    try {
      const { logId } = req.params
      const user = req.user

      const updated = await StaffActivityLogRepository.updateApproval(logId, {
        status: 'APPROVED',
        approvedBy: user.id,
      })

      if (!updated) {
        return res.status(404).json({ error: 'Activity log entry not found' })
      }

      logger.info(`Staff activity ${logId} APPROVED by user ${user.id} (${user.role})`)

      return res.status(200).json({
        success: true,
        message: 'Workflow approved successfully',
        approval: updated,
      })
    } catch (err) {
      logger.error(`Error in approve activity: ${err.message}`)
      return res.status(500).json({ error: 'Failed to approve activity' })
    }
  }

  static async reject(req, res) {
    try {
      const { logId } = req.params
      const { reason = 'Not aligned with departmental requirements' } = req.body || {}
      const user = req.user

      const updated = await StaffActivityLogRepository.updateApproval(logId, {
        status: 'REJECTED',
        approvedBy: user.id,
        rejectionReason: reason,
      })

      if (!updated) {
        return res.status(404).json({ error: 'Activity log entry not found' })
      }

      logger.info(`Staff activity ${logId} REJECTED by user ${user.id}: ${reason}`)

      return res.status(200).json({
        success: true,
        message: 'Workflow rejected',
        approval: updated,
      })
    } catch (err) {
      logger.error(`Error in reject activity: ${err.message}`)
      return res.status(500).json({ error: 'Failed to reject activity' })
    }
  }

  static async bulkApprove(req, res) {
    try {
      const { logIds = [] } = req.body || {}
      const user = req.user

      if (!Array.isArray(logIds) || logIds.length === 0) {
        return res.status(400).json({ error: 'logIds array is required' })
      }

      const results = []
      for (const id of logIds) {
        const item = await StaffActivityLogRepository.updateApproval(id, {
          status: 'APPROVED',
          approvedBy: user.id,
        })
        if (item) results.push(item)
      }

      logger.info(`Bulk approved ${results.length} activity logs by user ${user.id}`)

      return res.status(200).json({
        success: true,
        approvedCount: results.length,
        approvals: results,
      })
    } catch (err) {
      logger.error(`Error in bulkApprove: ${err.message}`)
      return res.status(500).json({ error: 'Failed to bulk approve' })
    }
  }

  static async getHistory(req, res) {
    try {
      const user = req.user
      const departmentId = user.role === 'hod' ? user.departmentId : null
      const logs = await StaffActivityLogRepository.findPending({
        departmentId,
        institutionId: user.institutionId || 1,
      })
      // Return history
      return res.status(200).json({
        success: true,
        history: logs,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch approval history' })
    }
  }
}

export default ApprovalController
