import { pool } from '../db/pool.js'

export class OfficerRepository {
  static async getROISummary(institutionId) {
    const result = await pool.query(`
      SELECT 
        SUM(roi_hours_saved) as total_hours,
        SUM(roi_money_saved) as total_money,
        officer_type
      FROM officer_sessions
      WHERE institution_id = $1
      GROUP BY officer_type
    `, [institutionId])
    return result.rows
  }

  static async getRecentActivity(institutionId, limit = 6) {
    // Assuming audit_logs has officer activity logged with action like 'OFFICER_CHAT'
    const result = await pool.query(`
      SELECT action, metadata, created_at
      FROM audit_logs
      WHERE institution_id = $1 AND action LIKE 'OFFICER_%'
      ORDER BY created_at DESC
      LIMIT $2
    `, [institutionId, limit])
    return result.rows
  }

  static async logSession(institutionId, officerType, messages, lastOutput, hoursSaved, moneySaved) {
    try {
      const result = await pool.query(`
        INSERT INTO officer_sessions (institution_id, officer_type, messages, last_output, roi_hours_saved, roi_money_saved)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [institutionId, officerType, JSON.stringify(messages), JSON.stringify(lastOutput), hoursSaved, moneySaved])
      return result.rows[0]
    } catch (err) {
      return null
    }
  }
}
