import express from 'express'
import { SSOController } from '../controllers/SSOController.js'

export function createSSORouter() {
  const router = express.Router()

  // Public / Login SSO discovery and callbacks
  router.get('/:institutionId/providers', SSOController.getProviders)
  router.post('/:institutionId/saml/login', SSOController.initiateSAML)
  router.post('/:institutionId/saml/callback', SSOController.handleSAMLCallback)
  router.post('/:institutionId/oidc/login', SSOController.initiateOIDC)
  router.get('/:institutionId/oidc/callback', SSOController.handleOIDCCallback)
  router.post('/:institutionId/ldap/login', SSOController.handleLDAPLogin)

  // Admin SSO management
  router.post('/admin/config', SSOController.saveSSOConfig)
  router.post('/admin/config/:id/test', SSOController.testSSOConfig)
  router.get('/admin/logs', SSOController.getSSOLogs)

  return router
}
