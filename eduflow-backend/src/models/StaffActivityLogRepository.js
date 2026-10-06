import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryActivityLogs = []
let memoryLogIdCounter = 1

export class StaffActivityLogRepository {
  static clearMemory() {
    memoryActivityLogs.length = 0
    memoryLogIdCounter = 1
  }

  static async logAction(data) {
    const {
      institutionId = 1,
      staffUserId,
      officerKey,
      actionType,
      promptText = '',
      outputSummary = '',
      approvalStatus = 'NOT_REQUIRED', // 'PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'
      approvedBy = null,
      approvedAt = null,
      rejectionReason = null,
      sessionId = null,
    } = data

    try {
      const query = `
        INSERT INTO staff_activity_log (
          institution_id, staff_user_id, officer_key, action_type,
          prompt_text, output_summary, approval_status, approved_by,
          approved_at, rejection_reason, session_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `
      const res = await pool.query(query, [
        institutionId, staffUserId, officerKey, actionType,
        promptText, outputSummary, approvalStatus, approvedBy,
        approvedAt, rejectionReason, sessionId,
      ])
      return res.rows[0]
    } catch (err) {
      logger.warn(`StaffActivityLogRepository.logAction using memory store: ${err.message}`)
      const entry = {
        id: memoryLogIdCounter++,
        institution_id: institutionId,
        staff_user_id: staffUserId,
        officer_key: officerKey,
        action_type: actionType,
        prompt_text: promptText,
        output_summary: outputSummary,
        approval_status: approvalStatus,
        approved_by: approvedBy,
        approved_at: approvedAt,
        rejection_reason: rejectionReason,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      }
      memoryActivityLogs.unshift(entry)
      return entry
    }
  }

  static async findById(id) {
    try {
      const res = await pool.query('SELECT * FROM staff_activity_log WHERE id = $1', [id])
      if (res.rows[0]) return res.rows[0]
      return memoryActivityLogs.find((l) => String(l.id) === String(id)) || null
    } catch (err) {
      logger.warn(`StaffActivityLogRepository.findById using memory store: ${err.message}`)
      return memoryActivityLogs.find((l) => String(l.id) === String(id)) || null
    }
  }

  static async findPending({ departmentId = null, institutionId = 1 } = {}) {
    try {
      let query = `
        SELECT sal.*, u.first_name, u.last_name, u.email, u.staff_designation, u.department_id
        FROM staff_activity_log sal
        JOIN users u ON sal.staff_user_id = u.id
        WHERE sal.approval_status = 'PENDING' AND sal.institution_id = $1
      `
      const params = [institutionId]
      if (departmentId) {
        params.push(departmentId)
        query += ` AND u.department_id = $${params.length}`
      }
      query += ` ORDER BY sal.created_at DESC`
      const res = await pool.query(query, params)
      if (res.rows.length > 0) return res.rows
      return memoryActivityLogs.filter((l) => l.approval_status === 'PENDING')
    } catch (err) {
      logger.warn(`StaffActivityLogRepository.findPending using memory store: ${err.message}`)
      return memoryActivityLogs.filter((l) => l.approval_status === 'PENDING')
    }
  }

  static async updateApproval(id, { status, approvedBy, rejectionReason = null }) {
    try {
      const query = `
        UPDATE staff_activity_log
        SET approval_status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3
        WHERE id = $4
        RETURNING *
      `
      const res = await pool.query(query, [status, approvedBy, rejectionReason, id])
      if (res.rows[0]) return res.rows[0]
      const log = memoryActivityLogs.find((l) => String(l.id) === String(id))
      if (log) {
        log.approval_status = status
        log.approved_by = approvedBy
        log.approved_at = new Date().toISOString()
        log.rejection_reason = rejectionReason
      }
      return log || null
    } catch (err) {
      logger.warn(`StaffActivityLogRepository.updateApproval using memory store: ${err.message}`)
      const log = memoryActivityLogs.find((l) => String(l.id) === String(id))
      if (log) {
        log.approval_status = status
        log.approved_by = approvedBy
        log.approved_at = new Date().toISOString()
        log.rejection_reason = rejectionReason
      }
      return log || null
    }
  }

  static async findByStaff(staffUserId, limit = 20) {
    try {
      const res = await pool.query(
        `SELECT * FROM staff_activity_log WHERE staff_user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [staffUserId, limit]
      )
      if (res.rows.length > 0) return res.rows
      return memoryActivityLogs
        .filter((l) => String(l.staff_user_id) === String(staffUserId))
        .slice(0, limit)
    } catch (err) {
      logger.warn(`StaffActivityLogRepository.findByStaff using memory store: ${err.message}`)
      return memoryActivityLogs
        .filter((l) => String(l.staff_user_id) === String(staffUserId))
        .slice(0, limit)
    }
  }
}

export default StaffActivityLogRepository
