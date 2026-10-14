import { test } from 'node:test'
import assert from 'node:assert'
import { ComplianceService } from '../../src/services/compliance/ComplianceService.js'

test('ComplianceService - generateAccessReview returns compliant SOC 2 report', async () => {
  const review = await ComplianceService.generateAccessReview(1)
  assert.strictEqual(review.institutionId, 1)
  assert.strictEqual(review.reportType, 'SOC2_QUARTERLY_ACCESS_REVIEW')
  assert.strictEqual(review.reviewStatus, 'COMPLIANT')
  assert(review.users.length >= 5)
  assert.strictEqual(review.rolesBreakdown.admin, 1)
  assert.strictEqual(review.rolesBreakdown.finance_officer, 1)
})

test('ComplianceService - generateChangeLog returns change audit entries', async () => {
  const log = await ComplianceService.generateChangeLog('2026-01-01', '2026-10-14', 1)
  assert.strictEqual(log.reportType, 'SOC2_CHANGE_LOG')
  assert(log.totalChanges >= 1)
  assert(Array.isArray(log.changeEvents))
})

test('ComplianceService - generateIncidentReport reflects zero open incidents', async () => {
  const report = await ComplianceService.generateIncidentReport(1)
  assert.strictEqual(report.reportType, 'SOC2_SECURITY_INCIDENTS_REPORT')
  assert.strictEqual(report.openIncidents, 0)
  assert(report.incidents.length >= 1)
})

test('ComplianceService - generateDataInventory covers 4 regulatory tiers under DPDP 2023', () => {
  const inventory = ComplianceService.generateDataInventory()
  assert.strictEqual(inventory.reportType, 'DPDP_2023_DATA_INVENTORY')
  assert.strictEqual(inventory.dataCategories.length, 4)
  assert(inventory.dataCategories.some(c => c.category === 'Student Identity'))
  assert(inventory.dataCategories.some(c => c.category === 'Financial Ledger'))
})

test('ComplianceService - generateDPIAReport satisfies statutory obligations', () => {
  const dpia = ComplianceService.generateDPIAReport(1)
  assert.strictEqual(dpia.reportType, 'DPDP_ACT_2023_DPIA')
  assert.strictEqual(dpia.evaluation.overallRiskScore, 'LOW_RESIDUAL_RISK')
  assert(dpia.evaluation.dataPrincipalRights.includes('RIGHT_TO_ACCESS'))
})

test('ComplianceService - exportAuditPackage generates valid ZIP archive buffer', async () => {
  const zipBuffer = await ComplianceService.exportAuditPackage(1)
  assert(Buffer.isBuffer(zipBuffer))
  assert(zipBuffer.length > 500)
  // ZIP files start with magic bytes PK (0x50, 0x4B)
  assert.strictEqual(zipBuffer[0], 0x50)
  assert.strictEqual(zipBuffer[1], 0x4b)
})
