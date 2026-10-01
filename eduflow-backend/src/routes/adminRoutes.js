import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

export function createAdminRouter() {
  const router = Router()

  router.use(authMiddleware)
  router.use(requireRole(['admin'])) // Restrict all admin routes to admin role

  /**
   * GET /api/v1/admin/audit-logs
   * Fetch system audit logs for the institution.
   * Query params: limit, category (optional)
   */
  router.get('/audit-logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 100
      let query = `
        SELECT a.id, a.action, a.metadata, a.ip_address as ip, a.created_at as timestamp,
               u.username as user, u.role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.institution_id = $1
      `
      const params = [req.user.institutionId]
      
      // Basic filtering based on action prefixes mapped to categories
      if (req.query.category && req.query.category !== 'All') {
        const cat = req.query.category
        if (cat === 'Security') {
          query += ` AND a.action LIKE 'AUTH_%'`
        } else if (cat === 'System' || cat === 'Officers') {
          query += ` AND a.action LIKE 'OFFICER_%'`
        }
      }

      query += ` ORDER BY a.created_at DESC LIMIT $2`
      params.push(limit)

      const result = await pool.query(query, params)
      
      const logs = result.rows.map(row => {
        let category = 'System'
        if (row.action.startsWith('AUTH_')) category = 'Security'
        if (row.action.startsWith('OFFICER_')) category = 'Officers'

        let status = 'success'
        if (row.action === 'AUTH_LOGIN_FAILED') status = 'failed'

        return {
          id: row.id,
          timestamp: new Date(row.timestamp).toLocaleString(),
          user: row.user || 'System',
          role: row.role || 'System',
          action: row.action,
          category,
          ip: row.ip,
          status,
          metadata: row.metadata
        }
      })

      res.json(logs)
    } catch (err) {
      logger.error('Audit logs error:', err)
      res.status(500).json({ error: 'Failed to fetch audit logs' })
    }
  })

  /**
   * GET /api/v1/admin/backup/status
   * Retrieve the latest database backup metadata.
   */
  router.get('/backup/status', async (_req, res) => {
    try {
      const manifestPath = path.resolve(process.cwd(), 'backups/backups-manifest.json')
      const altManifestPath = path.resolve(process.cwd(), 'backups-manifest.json')

      let manifest = null
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      } else if (fs.existsSync(altManifestPath)) {
        manifest = JSON.parse(fs.readFileSync(altManifestPath, 'utf-8'))
      }

      if (!manifest) {
        return res.json({
          lastBackupTimestamp: null,
          lastBackupSize: null,
          backupCount: 0,
          storageLocation: 'local',
        })
      }

      res.json({
        lastBackupTimestamp: manifest.lastBackupTimestamp,
        lastBackupSize: manifest.lastBackupSize,
        backupCount: manifest.backupCount,
        storageLocation: manifest.storageLocation || 'local',
      })
    } catch (err) {
      logger.error('Backup status error:', err)
      res.status(500).json({ error: 'Failed to retrieve backup status' })
    }
  })

  return router
}
