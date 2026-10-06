import express from 'express'
import { LegalController } from '../controllers/LegalController.js'

export function createLegalRouter() {
  const router = express.Router()

  router.get('/terms', LegalController.getTerms)
  router.get('/privacy', LegalController.getPrivacy)
  router.get('/dpa', LegalController.getDpa)
  router.post('/accept', LegalController.acceptTerms)

  return router
}
