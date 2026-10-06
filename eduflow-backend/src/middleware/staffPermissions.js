import { StaffPermissionRepository } from '../models/StaffPermissionRepository.js'
import { StaffActivityLogRepository } from '../models/StaffActivityLogRepository.js'
import { DailyLimitService } from '../services/staff/DailyLimitService.js'

/**
 * Middleware factory to enforce delegated permissions for staff members.
 * Allows full access to 'admin' and 'hod'.
 * Granularly verifies 'staff' permissions per officer.
 */
export function checkOfficerPermission(officerKey) {
  return async (req, res, next) => {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Admins and HODs have unrestricted access across all officers
    if (user.role === 'admin' || user.role === 'hod') {
      return next()
    }

    // Non-staff roles (students, parents) don't have officer access
    if (user.role !== 'staff') {
      return res.status(403).json({
        error: `Role '${user.role}' is not authorized to access AI officers.`,
      })
    }

    try {
      const permission = await StaffPermissionRepository.findByStaffAndOfficer(
        user.id,
        officerKey
      )

      if (!permission || !permission.is_active) {
        return res.status(403).json({
          error: `You do not have permission to access this officer (${officerKey}). Contact your HOD.`,
          code: 'PERMISSION_DENIED',
          officerKey,
        })
      }

      // Check date validity
      const today = new Date().toISOString().slice(0, 10)
      if (permission.valid_from && permission.valid_from > today) {
        return res.status(403).json({
          error: `Permission for ${officerKey} is not yet active (valid from ${permission.valid_from}).`,
        })
      }
      if (permission.valid_until && permission.valid_until < today) {
        return res.status(403).json({
          error: `Permission for ${officerKey} has expired (valid until ${permission.valid_until}). Contact your HOD.`,
        })
      }

      // Check VIEW_ONLY restriction for mutation methods
      if (
        permission.permission_level === 'VIEW_ONLY' &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())
      ) {
        return res.status(403).json({
          error: `Staff permission level is VIEW_ONLY for ${officerKey}. You cannot submit prompts or run workflows.`,
          permissionLevel: 'VIEW_ONLY',
        })
      }

      // Enforce daily request limits
      const limitCheck = DailyLimitService.checkAndIncrement(
        user.id,
        officerKey,
        permission.max_requests_per_day || 20
      )

      if (!limitCheck.allowed) {
        return res.status(429).json({
          error: `Daily limit of ${limitCheck.max} requests reached for ${officerKey}. Try again tomorrow or request a limit increase from your HOD.`,
          code: 'DAILY_LIMIT_EXCEEDED',
          current: limitCheck.current,
          max: limitCheck.max,
        })
      }

      // Attach permission metadata to request for downstream handlers
      req.staffPermission = permission
      req.requiresApproval = permission.permission_level === 'DRAFT' || permission.requires_approval

      next()
    } catch (err) {
      next(err)
    }
  }
}

/**
 * Intercepts outputs for DRAFT permissions and logs them as PENDING approval.
 */
export async function recordStaffActivity(req, officerKey, promptText, outputSummary) {
  if (req.user && req.user.role === 'staff') {
    const isDraft = req.requiresApproval || req.staffPermission?.permission_level === 'DRAFT'
    return await StaffActivityLogRepository.logAction({
      institutionId: req.user.institutionId || 1,
      staffUserId: req.user.id,
      officerKey,
      actionType: req.method,
      promptText: typeof promptText === 'string' ? promptText : JSON.stringify(promptText),
      outputSummary: typeof outputSummary === 'string' ? outputSummary : JSON.stringify(outputSummary),
      approvalStatus: isDraft ? 'PENDING' : 'NOT_REQUIRED',
    })
  }
  return null
}

export default { checkOfficerPermission, recordStaffActivity }
