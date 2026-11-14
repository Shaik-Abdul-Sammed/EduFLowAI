import { Router } from 'express'
import { LTIController } from '../controllers/LTIController.js'

export function createLTIRouter() {
  const router = Router()

  /**
   * GET /api/v1/lti/.well-known/jwks.json & /jwks.json
   */
  router.get('/.well-known/jwks.json', LTIController.getJWKS)
  router.get('/jwks.json', LTIController.getJWKS)

  /**
   * GET & POST /api/v1/lti/login
   */
  router.get('/login', LTIController.loginLTI)
  router.post('/login', LTIController.loginLTI)

  /**
   * POST /api/v1/lti/launch
   */
  router.post('/launch', LTIController.launchLTI)

  return router
}

export default createLTIRouter
