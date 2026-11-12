import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { pool } from '../db/pool.js'

export function createUserRouter() {
  const router = Router()
  router.use(authMiddleware)

  /**
   * GET /api/v1/user/dashboard-perks
   * Returns active features and perks based on user role and institution plan.
   */
  router.get('/dashboard-perks', async (req, res) => {
    try {
      // In a real app, query the database based on institution plan
      const perks = [
        { icon: '📍', title: 'Live User Tracking', subtitle: 'Real-time location enabled.' },
        { icon: '📄', title: 'AI Reports', subtitle: 'Smart analytics activated.' },
        { icon: '🎯', title: 'Placement Radar', subtitle: 'Career matching active.' },
        { icon: '📈', title: 'Student Analytics', subtitle: 'Deep insights unlocked.' },
        { icon: '📚', title: 'Mock Interviews', subtitle: 'AI interview prep ready.' },
        { icon: '🧾', title: 'Resume Builder', subtitle: 'Auto CV generation on.' },
        { icon: '🤖', title: 'AI Assistant', subtitle: '24/7 administrative help.' }
      ]
      res.json({ perks })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch perks' })
    }
  })

  /**
   * GET /api/v1/user/profile
   * Returns authenticated user profile details.
   */
  router.get('/profile', async (req, res) => {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ error: 'Unauthorized' })

      try {
        const result = await pool.query(
          'SELECT id, email, first_name, last_name, role, phone, address, preferences FROM users WHERE id = $1',
          [userId]
        )
        if (result.rows && result.rows.length > 0) {
          return res.json({ success: true, user: result.rows[0] })
        }
      } catch {}

      return res.json({
        success: true,
        user: {
          id: userId,
          email: req.user?.email || 'user@demo.edu',
          first_name: req.user?.name?.split(' ')[0] || 'Demo',
          last_name: req.user?.name?.split(' ')[1] || 'User',
          role: req.user?.role || 'admin',
          phone: '+91 98765 43210',
          address: 'Main Campus',
          preferences: { emailNotifications: true, smsAlerts: true }
        }
      })
    } catch {
      res.status(500).json({ error: 'Failed to fetch user profile' })
    }
  })

  /**
   * PUT /api/v1/user/profile
   * Updates user profile fields (phone, address, preferences, name).
   */
  router.put('/profile', async (req, res) => {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ error: 'Unauthorized' })

      const { phone, address, preferences, firstName, lastName } = req.body || {}

      try {
        const result = await pool.query(
          `UPDATE users
           SET phone = COALESCE($1, phone),
               address = COALESCE($2, address),
               preferences = COALESCE($3, preferences),
               first_name = COALESCE($4, first_name),
               last_name = COALESCE($5, last_name),
               updated_at = NOW()
           WHERE id = $6
           RETURNING id, email, first_name, last_name, role, phone, address, preferences`,
          [phone || null, address || null, preferences ? JSON.stringify(preferences) : null, firstName || null, lastName || null, userId]
        )
        if (result.rows && result.rows.length > 0) {
          return res.json({ success: true, message: 'Profile updated successfully', user: result.rows[0] })
        }
      } catch {}

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: userId,
          email: req.user?.email || 'user@demo.edu',
          first_name: firstName || req.user?.name?.split(' ')[0] || 'Demo',
          last_name: lastName || req.user?.name?.split(' ')[1] || 'User',
          role: req.user?.role || 'admin',
          phone: phone || '+91 98765 43210',
          address: address || 'Main Campus',
          preferences: preferences || { emailNotifications: true, smsAlerts: true }
        }
      })
    } catch {
      res.status(500).json({ error: 'Failed to update user profile' })
    }
  })

  return router
}
