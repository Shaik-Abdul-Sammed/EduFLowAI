import { Router } from 'express'
import { LTIController } from '../controllers/LTIController.js'

export function createLTIRouter() {
  const router = Router()

  /**
   * POST /api/v1/lti/launch
   */
  router.post('/launch', LTIController.launchLTI)

  return router
}
