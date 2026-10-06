import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PortalReaderService } from '../../src/services/portal/PortalReaderService.js'

describe('Unit: Portal Reader Service', () => {
  it('tests connection to external portal endpoints', async () => {
    const res = await PortalReaderService.testConnection('FEDENA', { url: 'https://fedena.institution.edu' })
    assert.equal(res.connected, true)
    assert.ok(res.latencyMs > 0)
  })

  it('normalizes heterogeneous attendance records into canonical format', () => {
    const fedenaRec = { id: 'STU-001', status: 'present', marked_at: '2026-03-10T09:00:00Z' }
    const normFed = PortalReaderService.normalizeAttendance(fedenaRec, { studentIdField: 'id' })
    assert.equal(normFed.studentExternalId, 'STU-001')
    assert.equal(normFed.status, 'PRESENT')

    const biometricRec = { badge_id: 'BIO-555', punch_time: '2026-03-10 08:30:00' }
    const normBio = PortalReaderService.normalizeAttendance(biometricRec, { studentIdField: 'badge_id' })
    assert.equal(normBio.studentExternalId, 'BIO-555')
  })
})
