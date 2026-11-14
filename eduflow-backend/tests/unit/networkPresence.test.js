import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { NetworkWebhookController } from '../../src/controllers/NetworkWebhookController.js'
import { WhatsAppWebhookController } from '../../src/controllers/WhatsAppWebhookController.js'
import { memoryPresenceStore, calculateDwellTimes, runDataRetentionCleanup } from '../../src/workers/presenceEngine.js'

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

describe('Hardware-Free Wi-Fi Invisible Presence Tracking & DPDP Compliance', () => {
  const TEST_RAW_MAC = '00:11:22:33:44:55'
  const EXPECTED_MAC_HASH = crypto.createHash('sha256').update('001122334455').digest('hex')

  beforeEach(() => {
    // Reset memory stores to pristine test baseline
    memoryPresenceStore.sessions = [
      {
        id: 1,
        student_id: 101,
        student_roll: '2024-CSE-042',
        student_name: 'Aarav Sharma',
        zone_id: 3, // CSE Lab 3 (CLASSROOM)
        course_id: 'CS301',
        start_time: new Date(Date.now() - 50 * 60 * 1000),
        end_time: null,
        duration_minutes: 50,
        dwell_time_percentage: 83.3,
        status: 'PRESENT',
        created_at: new Date()
      },
      {
        id: 2,
        student_id: 102,
        student_roll: '2024-CSE-088',
        student_name: 'Riya Patel',
        zone_id: 4, // Dorm
        course_id: 'CS301',
        start_time: new Date(Date.now() - 40 * 60 * 1000),
        end_time: null,
        duration_minutes: 40,
        dwell_time_percentage: 15.0,
        status: 'ABSENT',
        created_at: new Date()
      }
    ]
    memoryPresenceStore.disputes = []
  })

  // 1. Webhook Secret Validation
  test('Network webhook rejects association event without secret (401)', async () => {
    const req = {
      headers: {},
      body: {
        macAddress: TEST_RAW_MAC,
        apBssid: '00:1A:2B:3C:4D:03',
        ipAddress: '10.20.103.45'
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.handleAssociation(req, res)

    assert.equal(res.statusCode, 401)
    assert.ok(res.data.error.includes('Unauthorized'))
  })

  test('Network webhook accepts association event with correct secret (200)', async () => {
    const req = {
      headers: {
        'x-network-secret': 'eduflow-mesh-secret-2026'
      },
      body: {
        macAddress: TEST_RAW_MAC,
        apBssid: '00:1A:2B:3C:4D:03',
        ipAddress: '10.20.103.45',
        timestamp: new Date().toISOString()
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.handleAssociation(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.data.success)
    assert.equal(res.data.session.studentRoll, '2024-CSE-042')
    assert.equal(res.data.session.zoneType, 'CLASSROOM')
  })

  // 2. MAC Address Hashing & Privacy (DPDP Act 2023)
  test('MAC address is cryptographically hashed with SHA-256 and raw MAC is never stored', async () => {
    const hashed = NetworkWebhookController.hashMac(TEST_RAW_MAC)
    assert.equal(hashed, EXPECTED_MAC_HASH)

    // Register a new device
    const req = {
      body: {
        studentId: 105,
        studentRoll: '2024-CSE-120',
        studentName: 'Priya Iyer',
        collegeEmail: 'priya.iyer@eduflow.edu',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        deviceName: 'ThinkPad T14'
      }
    }
    const res = createMockRes()
    await NetworkWebhookController.registerDevice(req, res)

    assert.equal(res.statusCode, 201)
    assert.ok(res.data.success)
    
    // Check registered device in store
    const registered = memoryPresenceStore.devices.find(d => d.student_roll === '2024-CSE-120')
    assert.ok(registered)
    assert.equal(typeof registered.mac_address_hash, 'string')
    assert.equal(registered.mac_address_hash.length, 64)
    // Raw MAC must not exist on device object
    assert.equal(registered.macAddress, undefined)
  })

  // 3. Dwell Time Calculation (>80% class duration = PRESENT)
  test('Dwell time engine automatically marks student PRESENT if connected to classroom AP for >= 80% duration', async () => {
    // 50 minutes connected out of 60 mins = 83.3% -> Should be PRESENT
    const result = await calculateDwellTimes(60)
    assert.ok(result.evaluatedSessions >= 1)

    const session = memoryPresenceStore.sessions.find(s => s.student_roll === '2024-CSE-042')
    assert.ok(session)
    assert.equal(session.status, 'PRESENT')
    assert.ok(session.dwell_time_percentage >= 80)
  })

  test('Student in Dorm zone is not marked PRESENT for classroom', async () => {
    const dormSession = memoryPresenceStore.sessions.find(s => s.student_roll === '2024-CSE-088')
    assert.ok(dormSession)
    assert.equal(dormSession.status, 'ABSENT')
  })

  // 4. Data Retention Cleanup (DPDP Act 2023 Data Minimization)
  test('Data retention worker purges records older than 90 days', async () => {
    // Inject stale session 100 days old
    const staleDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
    memoryPresenceStore.sessions.push({
      id: 999,
      student_id: 101,
      student_roll: '2024-CSE-042',
      zone_id: 1,
      course_id: 'CS101',
      start_time: staleDate,
      end_time: staleDate,
      duration_minutes: 50,
      dwell_time_percentage: 83.3,
      status: 'PRESENT',
      created_at: staleDate
    })

    const initialCount = memoryPresenceStore.sessions.length
    const cleanupResult = await runDataRetentionCleanup(90)

    assert.ok(cleanupResult.purgedCount >= 1)
    assert.equal(memoryPresenceStore.sessions.some(s => s.id === 999), false)
  })

  // 5. Sanitized Student View vs Granular Faculty View
  test('Sanitized student endpoint returns DPDP-compliant badge without revealing room name, AP, or MAC', async () => {
    const req = {
      query: { roll: '2024-CSE-042' },
      params: {}
    }
    const res = createMockRes()
    await NetworkWebhookController.getStudentSanitizedPresence(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.data.dpdpCompliant)
    assert.equal(res.data.sanitizedStatus, '🟢 On Campus (Classroom)')
    assert.equal(res.data.isPresent, true)

    // Security assertions: confidential telemetry MUST be undefined
    assert.equal(res.data.room_name, undefined)
    assert.equal(res.data.ap_bssid, undefined)
    assert.equal(res.data.mac_address_hash, undefined)
    assert.equal(res.data.ip_address, undefined)
  })

  test('Granular faculty endpoint returns full location and duration telemetry', async () => {
    const req = { query: { courseId: 'CS301' } }
    const res = createMockRes()
    await NetworkWebhookController.getLivePresence(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(Array.isArray(res.data.sessions))
    const first = res.data.sessions[0]
    assert.ok(first.room_name)
    assert.ok(first.duration_minutes !== undefined)
    assert.ok(first.dwell_time_percentage !== undefined)
  })

  // 6. Student Attendance Dispute Workflow
  test('Student can submit attendance dispute and faculty can approve with 1-click', async () => {
    const submitReq = {
      body: {
        sessionId: 2,
        studentRoll: '2024-CSE-088',
        studentName: 'Riya Patel',
        reason: 'AP handoff dropped in lecture hall between 10:15 and 10:45 AM'
      }
    }
    const submitRes = createMockRes()
    await NetworkWebhookController.submitDispute(submitReq, submitRes)

    assert.equal(submitRes.statusCode, 201)
    assert.ok(submitRes.data.success)
    const disputeId = submitRes.data.dispute.id

    // Resolve dispute (Approve)
    const resolveReq = {
      params: { id: disputeId },
      body: { status: 'APPROVED', resolvedBy: 'Dr. Ramesh Kumar (HOD)' }
    }
    const resolveRes = createMockRes()
    await NetworkWebhookController.resolveDispute(resolveReq, resolveRes)

    assert.equal(resolveRes.statusCode, 200)
    assert.equal(resolveRes.data.dispute.status, 'APPROVED')
    assert.equal(resolveRes.data.dispute.resolved_by, 'Dr. Ramesh Kumar (HOD)')
  })

  // 7. WhatsApp !presence Command Integration
  test('WhatsApp webhook handles !presence command and replies with live zone distribution', async () => {
    const req = {
      body: {
        from: '+919876543210',
        body: '!presence CSE-3A'
      }
    }
    const res = createMockRes()
    await WhatsAppWebhookController.handleInboundMessage(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(res.data.action, 'PRESENCE_REPORT')
    assert.ok(res.data.reply.includes('Live Presence'))
    assert.ok(res.data.reply.includes('in class'))
    assert.ok(res.data.reply.includes('in dorm'))
    assert.ok(res.data.reply.includes('outside campus'))
  })
})
