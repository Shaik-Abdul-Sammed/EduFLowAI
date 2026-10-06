import express from 'express'
import { MonitoringService } from '../services/monitoring/MonitoringService.js'

export function createMonitoringRouter() {
  const router = express.Router()

  // Full health report for admin dashboard
  router.get('/health', async (_req, res) => {
    try {
      const health = await MonitoringService.checkHealth()
      res.json(health)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // Capture client-side errors
  router.post('/client-error', async (req, res) => {
    try {
      const { error, stack, url, userAgent, context } = req.body || {}
      await MonitoringService.captureError({ message: error, stack }, { url, userAgent, context, source: 'client' })
      res.json({ success: true, message: 'Client error logged' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}
