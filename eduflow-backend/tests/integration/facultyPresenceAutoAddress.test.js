import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import crypto from 'node:crypto'
import { createApp } from '../../src/app.js'
import { memoryPresenceStore } from '../../src/workers/presenceEngine.js'
import { NetworkWebhookController } from '../../src/controllers/NetworkWebhookController.js'

describe('Faculty Bluetooth & Wi-Fi Automatic Student Address Attendance Verification', () => {
  let server
  let baseUrl
  const TEST_MAC = 'A4:C3:F0:89:12:44'
  const TEST_ROLL = '2024-CSE-999'
  const CLASSROOM_AP_BSSID = '00:1A:2B:3C:4D:01' // Room 101 AP (CLASSROOM)
  const DORM_AP_BSSID = '00:1A:2B:3C:4D:10'      // Block D - Dorm 204 AP (DORM)
  const EXPECTED_HASH = crypto.createHash('sha256').update('a4c3f0891244').digest('hex')

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('1. Cryptographic hashing: raw device MAC address is never stored or leaked', () => {
    const rawMac = '  a4:C3:F0:89:12:44  '
    const computedHash = NetworkWebhookController.hashMac(rawMac)
    assert.equal(computedHash, EXPECTED_HASH, 'Normalized MAC hash must match SHA-256 standard')
    assert.ok(!computedHash.includes(':'), 'Hashed MAC must not retain raw separators')
    assert.equal(computedHash.length, 64, 'SHA-256 output must be exactly 64 hex characters')
  })

  it('2. Student device registration stores hash and masks raw hardware address', async () => {
    const res = await fetch(`${baseUrl}/api/v1/network/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 999,
        studentRoll: TEST_ROLL,
        studentName: 'Siddharth Rao',
        collegeEmail: 'siddharth.r@eduflow.edu',
        macAddress: TEST_MAC,
        deviceName: 'OnePlus 12 5G (Wi-Fi 7)'
      })
    })

    assert.equal(res.status, 201)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(body.device)
    assert.equal(body.device.studentRoll, TEST_ROLL)
    // Verify raw MAC is not in response; only masked preview
    assert.ok(!JSON.stringify(body).includes(TEST_MAC))
    assert.ok(body.device.macHashPreview.includes('...'))
  })

  it('3. Network association rejects unauthorized mesh beacon requests', async () => {
    const res = await fetch(`${baseUrl}/api/v1/network/association`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-network-secret': 'wrong-mesh-secret-key'
      },
      body: JSON.stringify({
        macAddress: TEST_MAC,
        apBssid: CLASSROOM_AP_BSSID,
        ipAddress: '192.168.10.88'
      })
    })

    assert.equal(res.status, 401)
    const body = await res.json()
    assert.ok(body.error.includes('Unauthorized'))
  })

  it('4. Automatic association logs student into classroom zone via Wi-Fi AP', async () => {
    const res = await fetch(`${baseUrl}/api/v1/network/association`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-network-secret': 'eduflow-mesh-secret-2026'
      },
      body: JSON.stringify({
        macAddress: TEST_MAC,
        apBssid: CLASSROOM_AP_BSSID,
        ipAddress: '192.168.10.88',
        timestamp: new Date().toISOString()
      })
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.equal(body.session.studentRoll, TEST_ROLL)
    assert.equal(body.session.zoneType, 'CLASSROOM')
  })

  it('5. Faculty live classroom telemetry reflects connected student devices', async () => {
    const res = await fetch(`${baseUrl}/api/v1/network/presence/live?courseId=CS301`)

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(Array.isArray(body.sessions))

    const studentSession = body.sessions.find(s => s.student_roll === TEST_ROLL)
    assert.ok(studentSession, 'Student session must be found in live faculty presence feed')
    assert.equal(studentSession.student_name, 'Siddharth Rao')
  })

  it('6. Dormitory association does NOT grant classroom presence status', async () => {
    // Register dorm student
    const DORM_MAC = 'B2:44:11:00:99:88'
    const DORM_ROLL = '2024-CSE-007'

    await fetch(`${baseUrl}/api/v1/network/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 1007,
        studentRoll: DORM_ROLL,
        studentName: 'Varun Tej',
        macAddress: DORM_MAC,
        deviceName: 'Student Laptop'
      })
    })

    // Associate with Kaveri Girls Hostel AP
    const assocRes = await fetch(`${baseUrl}/api/v1/network/association`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-network-secret': 'eduflow-mesh-secret-2026'
      },
      body: JSON.stringify({
        macAddress: DORM_MAC,
        apBssid: DORM_AP_BSSID,
        ipAddress: '192.168.40.12'
      })
    })

    assert.equal(assocRes.status, 200)
    const assocBody = await assocRes.json()
    assert.equal(assocBody.session.zoneType, 'DORM')

    // Check live faculty presence for CS301
    const liveRes = await fetch(`${baseUrl}/api/v1/network/presence/live?courseId=CS301`)
    const liveBody = await liveRes.json()
    const dormSession = liveBody.sessions.find(s => s.student_roll === DORM_ROLL)
    if (dormSession) {
      assert.notEqual(dormSession.status, 'PRESENT', 'Student in dormitory must not be marked PRESENT for lecture')
    }
  })

  it('7. Student presence dispute and faculty 1-click approval lifecycle', async () => {
    // 1. Student files dispute
    const disputeRes = await fetch(`${baseUrl}/api/v1/network/presence/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 999,
        studentRoll: TEST_ROLL,
        sessionId: 1,
        courseId: 'CS301',
        reason: 'Wi-Fi reconnected multiple times due to power fluctuation in Hall 1.'
      })
    })

    assert.equal(disputeRes.status, 201)
    const disputeBody = await disputeRes.json()
    assert.ok(disputeBody.success)
    const disputeId = disputeBody.dispute.id

    // 2. Faculty views pending disputes
    const listRes = await fetch(`${baseUrl}/api/v1/network/presence/disputes`)
    assert.equal(listRes.status, 200)
    const listBody = await listRes.json()
    assert.ok(listBody.disputes.some(d => d.id === disputeId))

    // 3. Faculty resolves dispute with 1-click approval
    const resolveRes = await fetch(`${baseUrl}/api/v1/network/presence/disputes/${disputeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        resolvedBy: 'Dr. Suresh Kumar (Professor)'
      })
    })

    assert.equal(resolveRes.status, 200)
    const resolveBody = await resolveRes.json()
    assert.ok(resolveBody.success)
    assert.equal(resolveBody.dispute.status, 'APPROVED')
    assert.equal(resolveBody.dispute.resolved_by, 'Dr. Suresh Kumar (Professor)')
  })

  it('8. DPDP-compliant student self-query sanitizes telemetry and protects privacy', async () => {
    const res = await fetch(`${baseUrl}/api/v1/network/presence/student/${TEST_ROLL}`)

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.equal(body.studentRoll, TEST_ROLL)
    // Ensures physical AP BSSID and raw MAC are not exposed in student portal
    assert.ok(!body.apBssid, 'AP BSSID must not be exposed to students')
    assert.ok(!body.macAddress, 'Raw MAC address must not be exposed to students')
    assert.equal(body.dpdpCompliant, true)
    assert.ok(body.sanitizedStatus)
  })
})
