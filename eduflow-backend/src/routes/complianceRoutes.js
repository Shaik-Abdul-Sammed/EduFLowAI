import express from 'express'
import { ComplianceController } from '../controllers/ComplianceController.js'

export function createComplianceRouter() {
  const router = express.Router()

  // SOC 2 Reports & Reviews
  router.get('/access-review', ComplianceController.getAccessReview)
  router.get('/change-log', ComplianceController.getChangeLog)
  router.get('/incidents', ComplianceController.getIncidents)

  // DPDP 2023 Reports
  router.get('/data-inventory', ComplianceController.getDataInventory)
  router.get('/dpia', ComplianceController.getDPIA)

  // Download complete SOC 2 & DPDP package (ZIP)
  router.get('/export-audit-package', ComplianceController.exportAuditPackage)

  // Manual Trigger for Data Retention Policy Purge
  router.post('/purge', ComplianceController.triggerPurge)

  return router
}
