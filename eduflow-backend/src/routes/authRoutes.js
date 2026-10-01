import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository.js'
import { pool } from '../db/pool.js'
import { rateLimit } from 'express-rate-limit'
import { validateRequest, loginSchema, registerUserSchema } from '../middleware/validateRequest.js'

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
      { expiresIn: '15m' } // Short lived access token
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
      if (result.rows.length === 0) return res.status(404).json({ error: 'No institutions found' })
      res.json({ id: result.rows[0].id, name: result.rows[0].name })
    } catch (err) {
      res.status(500).json({ error: 'Database error' })
    }
  })

  /**
   * POST /api/v1/auth/login
   */
  router.post('/login', validateRequest(loginSchema), async (req, res) => {
    try {
      const { institutionId, email, username, password, role } = req.body
      const identifier = username || email

      // Find user and join with institution
      const user = await UserRepository.findByUsernameOrEmail(institutionId, identifier)
      if (!user) {
        await UserRepository.logAudit(institutionId, null, 'LOGIN_FAILED_USER_NOT_FOUND', req.ip, req.get('user-agent'), { identifier })
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      // Optional: strict role check
      if (role && user.role !== role) {
        await UserRepository.logAudit(institutionId, user.id, 'LOGIN_FAILED_ROLE_MISMATCH', req.ip, req.get('user-agent'), { identifier, requestedRole: role })
        return res.status(401).json({ error: 'Invalid credentials or role' })
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        await UserRepository.logAudit(institutionId, user.id, 'LOGIN_FAILED_INVALID_PASSWORD', req.ip, req.get('user-agent'), { email })
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user)

      // Store refresh token in DB
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await UserRepository.saveRefreshToken(user.id, refreshToken, expiresAt)

      // Log success
      await UserRepository.logAudit(institutionId, user.id, 'LOGIN_SUCCESS', req.ip, req.get('user-agent'))

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        institution: {
          id: user.institution_id,
          name: user.inst_name,
          subscriptionTier: user.subscription_tier,
          primaryColor: user.primary_color,
          secondaryColor: user.secondary_color,
          logoUrl: user.logo_url
        }
      })
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

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
          await UserRepository.revokeRefreshToken(decoded.id, refreshToken)
          const user = await UserRepository.findById(decoded.id)
          if (user) {
            await UserRepository.logAudit(user.institution_id, user.id, 'LOGOUT_SUCCESS', req.ip, req.get('user-agent'))
          }
        }
      }
      res.json({ success: true })
    } catch (err) {
      console.error('Logout error:', err)
      res.status(500).json({ error: 'Internal server error' })
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

      res.status(201).json({ success: true, user })
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
