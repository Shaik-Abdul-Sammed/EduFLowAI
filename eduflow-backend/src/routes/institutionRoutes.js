import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { validateRequest, registerInstitutionSchema } from '../middleware/validateRequest.js'

export function createInstitutionRouter() {
  const router = Router()

  const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eduflow-refresh-secret-key-456'

  const generateTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, institutionId: user.institution_id, username: user.username },
      JWT_SECRET,
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
    return { accessToken, refreshToken }
  }

  /**
   * POST /api/v1/institutions/register
   */
  router.post('/register', validateRequest(registerInstitutionSchema), async (req, res) => {
    const client = await pool.connect()
    try {
      const institutionName = req.body.institutionName || req.body.name
      const subdomain = req.body.subdomain
      const adminName = req.body.adminName || 'Admin'
      const email = req.body.email || req.body.adminEmail
      const password = req.body.password || 'Demo@2026'

      await client.query('BEGIN')

      // Check if subdomain already exists
      const existingInst = await client.query('SELECT id FROM institutions WHERE subdomain = $1', [subdomain])
      if (existingInst.rows.length > 0) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'Subdomain is already taken' })
      }

      // Create institution
      const instResult = await client.query(`
        INSERT INTO institutions (name, subdomain, type)
        VALUES ($1, $2, 'school')
        RETURNING id, name
      `, [institutionName, subdomain])
      
      const institutionId = instResult.rows[0].id

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create admin user
      const userResult = await client.query(`
        INSERT INTO users (institution_id, role, username, password_hash, name)
        VALUES ($1, 'admin', $2, $3, $4)
        RETURNING id, role, username, name, metadata, institution_id
      `, [institutionId, email, passwordHash, adminName])
      
      const user = userResult.rows[0]

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // Store refresh token
      await client.query(`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, refreshToken, expiresAt])

      await client.query('COMMIT')

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          role: user.role,
          username: user.username,
          name: user.name,
          metadata: user.metadata
        }
      })
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Registration error:', err)
      res.status(500).json({ error: 'Internal server error' })
    } finally {
      client.release()
    }
  })

  /**
   * GET /api/v1/institution/plan-config
   */
  router.get('/plan-config', async (req, res) => {
    try {
      res.json({
        plan: 'Enterprise',
        features: ['AI Officers', 'CareerForge', 'GuardianWatch', 'SSO'],
        limits: {
          students: 10000,
          storage_gb: 500
        }
      })
    } catch (err) {
      console.error('Plan config error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
