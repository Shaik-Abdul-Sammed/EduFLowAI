import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryPermissions = []
let memoryIdCounter = 1

export class StaffPermissionRepository {
  static clearMemory() {
    memoryPermissions.length = 0
    memoryIdCounter = 1
  }

  static async create(data) {
    const {
      institutionId = 1,
      staffUserId,
      grantedBy,
      officerKey,
      permissionLevel = 'DRAFT', // 'VIEW_ONLY', 'DRAFT', 'FULL'
      departmentId = null,
      maxRequestsPerDay = 20,
      requiresApproval = true,
      validFrom = new Date().toISOString().slice(0, 10),
      validUntil = null,
      isActive = true,
    } = data

    try {
      const query = `
        INSERT INTO staff_permissions (
          institution_id, staff_user_id, granted_by, officer_key,
          permission_level, department_id, max_requests_per_day,
          requires_approval, valid_from, valid_until, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (staff_user_id, officer_key, department_id) DO UPDATE
        SET permission_level = EXCLUDED.permission_level,
            max_requests_per_day = EXCLUDED.max_requests_per_day,
            requires_approval = EXCLUDED.requires_approval,
            valid_from = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        RETURNING *
      `
      const res = await pool.query(query, [
        institutionId, staffUserId, grantedBy, officerKey,
        permissionLevel, departmentId, maxRequestsPerDay,
        requiresApproval, validFrom, validUntil, isActive,
      ])
      return res.rows[0]
    } catch (err) {
      logger.warn(`StaffPermissionRepository.create using memory store: ${err.message}`)
      const existingIdx = memoryPermissions.findIndex(
        (p) => String(p.staff_user_id) === String(staffUserId) &&
               p.officer_key === officerKey &&
               String(p.department_id || '') === String(departmentId || '')
      )

      const entry = {
        id: existingIdx >= 0 ? memoryPermissions[existingIdx].id : memoryIdCounter++,
        institution_id: institutionId,
        staff_user_id: staffUserId,
        granted_by: grantedBy,
        officer_key: officerKey,
        permission_level: permissionLevel,
        department_id: departmentId,
        max_requests_per_day: maxRequestsPerDay,
        requires_approval: requiresApproval,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (existingIdx >= 0) {
        memoryPermissions[existingIdx] = entry
      } else {
        memoryPermissions.push(entry)
      }
      return entry
    }
  }

  static async findByStaffAndOfficer(staffUserId, officerKey) {
    try {
      const res = await pool.query(
        `SELECT * FROM staff_permissions 
         WHERE staff_user_id = $1 AND officer_key = $2 AND is_active = true`,
        [staffUserId, officerKey]
      )
      if (res.rows[0]) return res.rows[0]
      return memoryPermissions.find(
        (p) => String(p.staff_user_id) === String(staffUserId) &&
               p.officer_key === officerKey &&
               p.is_active
      ) || null
    } catch (err) {
      logger.warn(`StaffPermissionRepository.findByStaffAndOfficer using memory store: ${err.message}`)
      return memoryPermissions.find(
        (p) => String(p.staff_user_id) === String(staffUserId) &&
               p.officer_key === officerKey &&
               p.is_active
      ) || null
    }
  }

  static async findByStaff(staffUserId) {
    try {
      const res = await pool.query(
        `SELECT * FROM staff_permissions WHERE staff_user_id = $1 ORDER BY created_at DESC`,
        [staffUserId]
      )
      if (res.rows.length > 0) return res.rows
      return memoryPermissions.filter((p) => String(p.staff_user_id) === String(staffUserId))
    } catch (err) {
      logger.warn(`StaffPermissionRepository.findByStaff using memory store: ${err.message}`)
      return memoryPermissions.filter((p) => String(p.staff_user_id) === String(staffUserId))
    }
  }

  static async findAll({ departmentId = null, institutionId = 1 } = {}) {
    try {
      let query = `SELECT sp.*, u.first_name, u.last_name, u.email, u.staff_designation 
                   FROM staff_permissions sp
                   JOIN users u ON sp.staff_user_id = u.id
                   WHERE sp.institution_id = $1`
      const params = [institutionId]
      if (departmentId) {
        params.push(departmentId)
        query += ` AND sp.department_id = $${params.length}`
      }
      query += ` ORDER BY sp.created_at DESC`
      const res = await pool.query(query, params)
      if (res.rows.length > 0) return res.rows
      return memoryPermissions.filter(
        (p) => !departmentId || String(p.department_id) === String(departmentId)
      )
    } catch (err) {
      logger.warn(`StaffPermissionRepository.findAll using memory store: ${err.message}`)
      return memoryPermissions.filter(
        (p) => !departmentId || String(p.department_id) === String(departmentId)
      )
    }
  }

  static async update(id, updates) {
    try {
      const fields = []
      const values = []
      Object.entries(updates).forEach(([key, val]) => {
        fields.push(`${key} = $${fields.length + 1}`)
        values.push(val)
      })
      values.push(id)
      const query = `UPDATE staff_permissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`
      const res = await pool.query(query, values)
      if (res.rows[0]) return res.rows[0]
      const item = memoryPermissions.find((p) => String(p.id) === String(id))
      if (item) Object.assign(item, updates, { updated_at: new Date().toISOString() })
      return item || null
    } catch (err) {
      logger.warn(`StaffPermissionRepository.update using memory store: ${err.message}`)
      const item = memoryPermissions.find((p) => String(p.id) === String(id))
      if (item) Object.assign(item, updates, { updated_at: new Date().toISOString() })
      return item || null
    }
  }

  static async delete(id) {
    return this.update(id, { is_active: false })
  }
}

export default StaffPermissionRepository
