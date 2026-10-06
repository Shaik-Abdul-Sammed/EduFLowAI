import { pool } from '../db/pool.js'

export class UserRepository {
  static async findByUsernameOrEmail(institutionId, identifier) {
    if (institutionId) {
      const result = await pool.query(
        `SELECT u.*, i.name as inst_name, i.subscription_tier, i.primary_color, i.secondary_color, i.logo_url 
         FROM users u 
         JOIN institutions i ON u.institution_id = i.id 
         WHERE u.institution_id = $1 AND (LOWER(u.username) = LOWER($2) OR LOWER(u.email) = LOWER($2))`,
        [institutionId, identifier]
      )
      return result.rows[0]
    }
    const result = await pool.query(
      `SELECT u.*, i.name as inst_name, i.subscription_tier, i.primary_color, i.secondary_color, i.logo_url 
       FROM users u 
       JOIN institutions i ON u.institution_id = i.id 
       WHERE (LOWER(u.username) = LOWER($1) OR LOWER(u.email) = LOWER($1))`,
      [identifier]
    )
    return result.rows[0]
  }

  static async findByEmail(institutionId, email) {
    return UserRepository.findByUsernameOrEmail(institutionId, email)
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
  }

  static async createUser({ institutionId, role, email, passwordHash, firstName, lastName }) {
    const result = await pool.query(
      `INSERT INTO users (institution_id, role, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, role, email, first_name, last_name`,
      [institutionId, role, email, passwordHash, firstName, lastName]
    )
    return result.rows[0]
  }

  static async saveRefreshToken(userId, tokenHash, expiresAt) {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    )
  }

  static async findRefreshToken(userId, tokenHash) {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens 
       WHERE user_id = $1 AND token_hash = $2 AND revoked = FALSE AND expires_at > NOW()`,
      [userId, tokenHash]
    )
    return result.rows[0]
  }

  static async revokeRefreshToken(userId, tokenHash) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked = TRUE 
       WHERE user_id = $1 AND token_hash = $2`,
      [userId, tokenHash]
    )
  }

  static async logAudit(institutionId, userId, action, ipAddress, userAgent, metadata = {}) {
    try {
      const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
      const validUserId = isUuid ? userId : null
      await pool.query(
        `INSERT INTO audit_logs (institution_id, user_id, action, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [institutionId, validUserId, action, ipAddress, userAgent, metadata]
      )
    } catch {
      // Non-fatal logging failure
    }
  }
}
