import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { InsightsController, insightsRateLimiter } from '../controllers/InsightsController.js'

export function createInsightsRouter() {
  const router = Router()

  // Apply rate limiter, authentication, and admin role requirement
  router.use(insightsRateLimiter)
  router.use(authMiddleware)
  router.use(requireRole(['admin']))

  // Consolidated dashboard & recent activity (must be before :domain)
  router.get('/dashboard', InsightsController.dashboard)
  router.get('/activity', InsightsController.activity)

  // Domain-specific endpoints
  router.post('/:domain/explain', InsightsController.explain)
  router.post('/:domain/ask', InsightsController.ask)
  router.post('/:domain/predict', InsightsController.predict)
  router.post('/:domain/improve', InsightsController.improve)
  router.get('/:domain/history', InsightsController.history)

  return router
}

export default createInsightsRouter
