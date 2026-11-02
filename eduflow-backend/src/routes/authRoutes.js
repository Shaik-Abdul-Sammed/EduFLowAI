import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository.js'
import { pool } from '../db/pool.js'
import { rateLimit } from 'express-rate-limit'
import { validateRequest, loginSchema, registerUserSchema } from '../middleware/validateRequest.js'
import { seedDemoData } from '../../scripts/seed-demo.js'
import { seedDeanAccount } from '../../scripts/seed-dean-account.js'
import { resetDemoData } from '../../scripts/reset-demo-data.js'
import { AuthController } from '../controllers/AuthController.js'
import { WhatsAppAttendance } from '../services/attendance/WhatsAppAttendance.js'

export function createAuthRouter() {
  const router = Router()

  // Rate Limiting for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  })

  const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eduflow-refresh-secret-key-456'

  // Helper to generate tokens
  const generateTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, institutionId: user.institution_id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' } // Extended access token for uninterrupted sessions
    )
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Long lived refresh token
    )
    return { accessToken, refreshToken }
  }

  /**
   * GET /api/v1/auth/default-institution
   * (Utility for MVP: Gets the first institution ID for login if subdomain not provided)
   */
  router.get('/default-institution', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name FROM institutions ORDER BY id ASC LIMIT 1')
      if (!result?.rows || result.rows.length === 0) {
        return res.json({ id: 1, name: 'EduFlow Campus' })
      }
      return res.json({ id: result.rows[0].id, name: result.rows[0].name })
    } catch (err) {
      console.warn('Database error in /default-institution, returning fallback:', err.message)
      return res.json({ id: 1, name: 'EduFlow Campus' })
    }
  })

  /**
   * GET /api/v1/auth/emergency-seed
   * Triggers database seeding for demo institution and dean account
   */
  router.get('/emergency-seed', async (req, res) => {
    if (req.query.secret !== 'eduflow2026') {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    try {
      await seedDemoData(pool)
      await seedDeanAccount(pool)
      res.json({ success: true, message: 'Database seeded successfully. You can now log in.' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  /**
   * GET & POST /api/v1/auth/reset-demo-data
   * Reset and re-seed all demo datasets to factory demo state.
   */
  const handleAuthReset = async (req, res) => {
    const secret = req.query?.secret || req.body?.secret
    if (secret !== 'eduflow2026') {
      return res.status(401).json({ error: 'Unauthorized: Invalid secret' })
    }
    try {
      const result = await resetDemoData(pool)
      return res.json({
        success: true,
        message: 'Demo dataset successfully wiped and re-seeded to factory demo state.',
        details: result
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
  router.get('/reset-demo-data', handleAuthReset)
  router.post('/reset-demo-data', handleAuthReset)

  /**
   * POST /api/v1/auth/login
   */
  router.post('/login', validateRequest(loginSchema), AuthController.login)

  /**
   * POST /api/v1/auth/refresh
   */
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })

      // Verify signature
      let decoded
      try {
        decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      } catch (e) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' })
      }

      const user = await UserRepository.findById(decoded.id)
      if (!user) return res.status(403).json({ error: 'User not found' })

      // Verify in DB
      const dbToken = await UserRepository.findRefreshToken(user.id, refreshToken)
      if (!dbToken) {
        await UserRepository.logAudit(user.institution_id, user.id, 'REFRESH_TOKEN_REUSE_DETECTED', req.ip, req.get('user-agent'))
        return res.status(403).json({ error: 'Invalid refresh token' })
      }

      // Issue new tokens (rotation)
      const tokens = generateTokens(user)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // Revoke old, save new
      await UserRepository.revokeRefreshToken(user.id, refreshToken)
      await UserRepository.saveRefreshToken(user.id, tokens.refreshToken, expiresAt)

      res.json(tokens)
    } catch (err) {
      console.error('Refresh error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  /**
   * POST /api/v1/auth/logout
   */
  router.post('/logout', async (req, res) => {
    try {
      const { refreshToken } = req.body
      if (refreshToken) {
        // Attempt decode to find user id without throwing if expired
        const decoded = jwt.decode(refreshToken)
        if (decoded?.id) {
          try {
            await UserRepository.revokeRefreshToken(decoded.id, refreshToken)
            const user = await UserRepository.findById(decoded.id)
            if (user) {
              await UserRepository.logAudit(user.institution_id, user.id, 'LOGOUT_SUCCESS', req.ip, req.get('user-agent'))
            }
          } catch (dbErr) {
            console.warn('Non-blocking logout db operation:', dbErr.message)
          }
        }
      }
      return res.json({ success: true })
    } catch (err) {
      console.warn('Logout error handled cleanly:', err.message)
      return res.json({ success: true })
    }
  })

  /**
   * POST /api/v1/auth/register
   * Basic registration endpoint
   */
  router.post('/register', validateRequest(registerUserSchema), async (req, res) => {
    try {
      const { institutionId = 1, username, email, password, name, role } = req.body
      const effectiveUsername = username || email

      // Check if user already exists
      const existing = await UserRepository.findByUsername(institutionId, effectiveUsername)
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create user
      const user = await UserRepository.createUser({
        institutionId,
        role,
        username: effectiveUsername,
        passwordHash,
        name
      })

      await UserRepository.logAudit(institutionId, user.id, 'USER_REGISTERED', req.ip, req.get('user-agent'))

      const phone = req.body.phone || req.body.adminPhone
      if (phone) {
        try {
          const message = `Welcome to EduFlow AI! Your institution EduFlow AI is ready.
Login here: https://eduflow-web.onrender.com/login
Email: ${effectiveUsername}
Password: ${password}
Please change your password after your first login.`
          await WhatsAppAttendance.sendMessage(phone, message)
        } catch (whatsappErr) {
          console.warn('Failed to send WhatsApp registration credentials:', whatsappErr.message)
        }
      }

      res.status(201).json({ success: true, user })
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
