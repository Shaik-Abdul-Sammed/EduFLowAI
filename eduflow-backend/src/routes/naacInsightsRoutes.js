import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { NaacInsightsController, naacInsightsRateLimiter } from '../controllers/NaacInsightsController.js'

export function createNaacInsightsRouter() {
  const router = Router()

  // Apply rate limiter, authentication, and admin role check
  router.use(naacInsightsRateLimiter)
  router.use(authMiddleware)
  router.use(requireRole(['admin']))

  router.post('/explain', NaacInsightsController.explain)
  router.post('/ask', NaacInsightsController.ask)
  router.post('/compare-ideal', NaacInsightsController.compareIdeal)
  router.post('/predict-visit', NaacInsightsController.predictVisit)
  router.get('/visit-history', NaacInsightsController.visitHistory)
  router.post('/improvement-plan', NaacInsightsController.improvementPlan)
  router.get('/improvement-history', NaacInsightsController.improvementHistory)
  router.get('/dashboard-insights', NaacInsightsController.dashboardInsights)

  return router
}

export default createNaacInsightsRouter
