import { StaffPermissionRepository } from '../models/StaffPermissionRepository.js'
import { StaffActivityLogRepository } from '../models/StaffActivityLogRepository.js'
import { logger } from '../utils/logger.js'

export class StaffPermissionController {
  static async grantPermission(req, res) {
    try {
      const user = req.user
      const {
        staffUserId,
        officerKey,
        permissionLevel = 'DRAFT',
        departmentId = user.departmentId || null,
        maxRequestsPerDay = 20,
        requiresApproval = true,
        validFrom,
        validUntil,
      } = req.body || {}

      if (!staffUserId || !officerKey) {
        return res.status(400).json({ error: 'staffUserId and officerKey are required' })
      }

      // HOD can only grant to their own department
      if (user.role === 'hod' && user.departmentId && String(departmentId) !== String(user.departmentId)) {
        return res.status(403).json({ error: 'HODs can only grant permissions within their own department' })
      }

      const permission = await StaffPermissionRepository.create({
        institutionId: user.institutionId || 1,
        staffUserId,
        grantedBy: user.id,
        officerKey,
        permissionLevel,
        departmentId,
        maxRequestsPerDay: Number(maxRequestsPerDay) || 20,
        requiresApproval: Boolean(requiresApproval),
        validFrom: validFrom || new Date().toISOString().slice(0, 10),
        validUntil: validUntil || null,
        isActive: true,
      })

      logger.info(`Permission granted: staff ${staffUserId} for ${officerKey} (${permissionLevel}) by user ${user.id}`)

      return res.status(201).json({
        success: true,
        message: `Permission granted for officer '${officerKey}'`,
        permission,
      })
    } catch (err) {
      logger.error(`Error in grantPermission: ${err.message}`)
      return res.status(500).json({ error: 'Failed to grant permission' })
    }
  }

  static async getStaffPermissions(req, res) {
    try {
      const { staffUserId } = req.params
      const permissions = await StaffPermissionRepository.findByStaff(staffUserId)
      return res.status(200).json({
        success: true,
        permissions,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch staff permissions' })
    }
  }

  static async getMyPermissions(req, res) {
    try {
      const user = req.user
      const permissions = await StaffPermissionRepository.findByStaff(user.id)
      return res.status(200).json({
        success: true,
        permissions,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch your permissions' })
    }
  }

  static async updatePermission(req, res) {
    try {
      const { id } = req.params
      const updates = req.body || {}
      const updated = await StaffPermissionRepository.update(id, updates)
      if (!updated) {
        return res.status(404).json({ error: 'Permission not found' })
      }
      return res.status(200).json({
        success: true,
        permission: updated,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update permission' })
    }
  }

  static async revokePermission(req, res) {
    try {
      const { id } = req.params
      const revoked = await StaffPermissionRepository.delete(id)
      if (!revoked) {
        return res.status(404).json({ error: 'Permission not found' })
      }
      return res.status(200).json({
        success: true,
        message: 'Permission revoked successfully',
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to revoke permission' })
    }
  }

  static async requestAccess(req, res) {
    try {
      const user = req.user
      const { officerKey, reason = 'Administrative task preparation' } = req.body || {}

      if (!officerKey) {
        return res.status(400).json({ error: 'officerKey is required' })
      }

      // Log request as an activity entry
      await StaffActivityLogRepository.logAction({
        institutionId: user.institutionId || 1,
        staffUserId: user.id,
        officerKey,
        actionType: 'ACCESS_REQUEST',
        promptText: `Request for ${officerKey} access: ${reason}`,
        outputSummary: 'Pending HOD approval',
        approvalStatus: 'PENDING',
      })

      logger.info(`Access request logged: staff ${user.id} requested ${officerKey}`)

      return res.status(200).json({
        success: true,
        message: `Access request for '${officerKey}' sent to your HOD for review.`,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to request access' })
    }
  }

  static async getActivity(req, res) {
    try {
      const user = req.user
      const limit = Number(req.query.limit) || 20

      if (user.role === 'staff') {
        const activity = await StaffActivityLogRepository.findByStaff(user.id, limit)
        return res.status(200).json({ success: true, activity })
      }

      // HOD or Admin gets pending/all activity
      const departmentId = user.role === 'hod' ? user.departmentId : null
      const activity = await StaffActivityLogRepository.findPending({
        departmentId,
        institutionId: user.institutionId || 1,
      })

      return res.status(200).json({ success: true, activity })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch activity' })
    }
  }
}

export default StaffPermissionController
