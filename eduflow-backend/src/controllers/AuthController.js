import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'

export class AuthController {
  /**
   * POST /api/v1/auth/login
   * Accepts { email, password }
   * If institutionId is passed as 'demo' or undefined, queries user by email directly.
   * Query: SELECT * FROM users WHERE email = $1 LIMIT 1
   * Password check: await bcrypt.compare(password, user.password_hash)
   * Returns JWT on success, or 401 with { "error": "Invalid credentials" }
   */
  static async login(req, res) {
    try {
      const { email, username, password, institutionId, role } = req.body || {}
      const targetEmail = (email || username || '').trim()

      if (!targetEmail || !password) {
        return res.status(400).json({ error: 'Validation failed', message: 'Email and password are required' })
      }

      // Query user by email (case-insensitive and username fallback supported)
      let userRes = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [targetEmail])
      if (!userRes || !userRes.rows || userRes.rows.length === 0) {
        userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [targetEmail])
      }
      if (!userRes || !userRes.rows || userRes.rows.length === 0) {
        userRes = await pool.query('SELECT * FROM users WHERE username = $1 OR LOWER(username) = LOWER($1) LIMIT 1', [targetEmail])
      }

      const user = userRes?.rows?.[0]
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      if (role && user.role !== role) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eduflow-refresh-secret-key-456'

      const accessToken = jwt.sign(
        { id: user.id, role: user.role, institutionId: user.institution_id, username: user.username || user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      )
      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await pool.query(
          `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
          [user.id, refreshToken, expiresAt]
        )
      } catch {
        // Non-blocking in case refresh_tokens table not yet present
      }

      let instData = {
        id: user.institution_id || 1,
        name: 'EduFlow AI',
        subscriptionTier: 'enterprise',
        primaryColor: '#2563EB',
        secondaryColor: '#1E40AF',
        logoUrl: '/logo.png',
      }
      try {
        if (user.institution_id && user.institution_id !== 'demo' && !isNaN(Number(user.institution_id))) {
          const instRes = await pool.query('SELECT * FROM institutions WHERE id = $1 LIMIT 1', [Number(user.institution_id)])
          if (instRes && instRes.rows && instRes.rows.length > 0) {
            const inst = instRes.rows[0]
            instData = {
              id: inst.id,
              name: inst.name,
              subscriptionTier: inst.subscription_tier,
              primaryColor: inst.primary_color,
              secondaryColor: inst.secondary_color,
              logoUrl: inst.logo_url,
            }
          }
        }
      } catch {
        // Non-blocking
      }

      return res.json({
        accessToken,
        refreshToken,
        token: accessToken,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          firstName: user.first_name || user.name || '',
          lastName: user.last_name || '',
        },
        institution: instData,
      })
    } catch (err) {
      console.error('Login error in AuthController:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export const login = AuthController.login
export default AuthController
