import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { InstitutionController } from '../../src/controllers/InstitutionController.js'
import { InvoiceController } from '../../src/controllers/InvoiceController.js'
import { verifyLatestBackup } from '../../src/workers/backupVerifier.js'

describe('Real College End-to-End Simulation Integration Tests', () => {
  test('saves real college settings including GST and UPI configuration', async () => {
    let resJson = null
    const req = {
      user: { institutionId: 1 },
      body: {
        branding: { name: 'National Engineering College' },
        billing: { gstNumber: '29ABCDE1234F1Z5', upiId: 'nec@sbi' },
        security: { sessionTimeoutMinutes: 30 }
      }
    }
    const res = {
      status: () => ({ json: (d) => { resJson = d } })
    }

    await InstitutionController.updateSettings(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.settings.billing.upiId, 'nec@sbi')
    assert.equal(resJson.settings.security.sessionTimeoutMinutes, 30)
  })

  test('executes backup verifier and confirms simulated integrity', async () => {
    const report = await verifyLatestBackup()
    assert.equal(report.status, 'VERIFIED_SUCCESS')
    assert.ok(report.totalRowsVerified > 0)
    assert.ok(report.tablesAudited.includes('institutions'))
  })
})
