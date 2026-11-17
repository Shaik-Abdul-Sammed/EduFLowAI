import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { NetworkWebhookController } from '../../src/controllers/NetworkWebhookController.js'
import { memoryPresenceStore } from '../../src/workers/presenceEngine.js'

function createMockRes() {
  const mock = {
    statusCode: 200,
    data: null,
    status(code) {
      mock.statusCode = code
      return mock
    },
    json(payload) {
      mock.data = payload
      return mock
    }
  }
  return mock
}

describe('P0.1 — Attendance Identity Resolution via deviceInstallId', () => {
  const KNOWN_INSTALL_ID = 'install-uuid-student-101'
  const UNREGISTERED_INSTALL_ID = '00000000-0000-0000-0000-unregistered99'
  const REVOKED_INSTALL_ID = 'install-uuid-student-revoked'
  const VALID_SECRET = 'eduflow-mesh-secret-2026'

  beforeEach(() => {
    // Reset registrations in memoryPresenceStore
    memoryPresenceStore.deviceRegistrations = [
      {
        id: 'd1010000-0000-0000-0000-000000000001',
        device_install_id: KNOWN_INSTALL_ID,
        student_id: 101,
        student_roll: '2024-CSE-042',
        student_name: 'Aarav Sharma',
        mac_hash: 'a9b2ad6f4919c2ddcc2e04825227372ce079c0fe392d636d293d9f048a2c7926',
        registered_at: new Date(),
        last_seen_at: new Date(),
        revoked_at: null
      },
      {
        id: 'd1020000-0000-0000-0000-000000000002',
        device_install_id: REVOKED_INSTALL_ID,
        student_id: 102,
        student_roll: '2024-CSE-088',
        student_name: 'Riya Patel',
        mac_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        registered_at: new Date(),
        last_seen_at: new Date(),
        revoked_at: new Date(Date.now() - 3600000) // revoked 1h ago
      }
    ]
    memoryPresenceStore.sessions = []
  })

  test('resolves student from deviceInstallId, not MAC', async () => {
    const req = {
      headers: { 'x-network-secret': VALID_SECRET },
      body: {
        deviceInstallId: KNOWN_INSTALL_ID,
        apBssid: '00:1A:2B:3C:4D:03',
        ipAddress: '10.20.103.45',
        timestamp: new Date().toISOString()
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.handleAssociation(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(res.data.success, true)
    assert.equal(res.data.session.studentRoll, '2024-CSE-042')
  })

  test('MAC rotation does NOT break presence resolution', async () => {
    // Pulse 1 with randomized MAC #1
    const req1 = {
      headers: { 'x-network-secret': VALID_SECRET },
      body: {
        deviceInstallId: KNOWN_INSTALL_ID,
        macAddress: '12:34:56:78:9A:BC', // Randomized MAC 1
        apBssid: '00:1A:2B:3C:4D:03'
      }
    }
    const res1 = createMockRes()
    await NetworkWebhookController.handleAssociation(req1, res1)
    assert.equal(res1.statusCode, 200)
    assert.equal(res1.data.session.studentRoll, '2024-CSE-042')

    // Pulse 2 with randomized MAC #2 (few minutes later)
    const req2 = {
      headers: { 'x-network-secret': VALID_SECRET },
      body: {
        deviceInstallId: KNOWN_INSTALL_ID,
        macAddress: 'FE:DC:BA:98:76:54', // Randomized MAC 2
        apBssid: '00:1A:2B:3C:4D:03'
      }
    }
    const res2 = createMockRes()
    await NetworkWebhookController.handleAssociation(req2, res2)
    assert.equal(res2.statusCode, 200)
    // Must still resolve to the identical student despite differing MAC
    assert.equal(res2.data.session.studentRoll, '2024-CSE-042')
  })

  test('unregistered deviceInstallId is rejected with 403', async () => {
    const req = {
      headers: { 'x-network-secret': VALID_SECRET },
      body: {
        deviceInstallId: UNREGISTERED_INSTALL_ID,
        apBssid: '00:1A:2B:3C:4D:03'
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.handleAssociation(req, res)

    assert.equal(res.statusCode, 403)
    assert.equal(res.data.code, 'UNREGISTERED_DEVICE')
  })

  test('revoked device registration cannot mark attendance', async () => {
    const req = {
      headers: { 'x-network-secret': VALID_SECRET },
      body: {
        deviceInstallId: REVOKED_INSTALL_ID,
        apBssid: '00:1A:2B:3C:4D:03'
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.handleAssociation(req, res)

    assert.equal(res.statusCode, 403)
    assert.equal(res.data.code, 'DEVICE_REVOKED')
  })
})
