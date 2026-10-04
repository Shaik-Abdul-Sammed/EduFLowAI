import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { NirfController, nirfRateLimiter } from '../controllers/NirfController.js'

export function createNirfRouter() {
  const router = Router()

  // Apply rate limiter, authentication, and admin role requirement
  router.use(nirfRateLimiter)
  router.use(authMiddleware)
  router.use(requireRole(['admin']))

  // Endpoints:
  router.get('/score', NirfController.getScore)
  router.get('/predict-rank', NirfController.predictRank)
  router.post('/explain', NirfController.explain)
  router.post('/benchmark', NirfController.benchmark)
  router.post('/improve', NirfController.improve)
  router.get('/compare-naac', NirfController.compareNaac)
  router.get('/peers', NirfController.getPeers)
  router.post('/export-pdf', NirfController.exportPdf)

  return router
}

export default createNirfRouter
