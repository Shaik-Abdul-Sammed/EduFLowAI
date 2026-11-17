import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AttendanceController,
  activeSessionCodes,
  sessionReportedDevices,
  sessionPulses
} from '../../src/controllers/AttendanceController.js'
import {
  studentPrivacyConsents,
  setPrivacyConsent,
  hasPrivacyConsent
} from '../../src/services/presence.js'
import {
  memoryPresenceStore,
  runDataRetentionCleanup
} from '../../src/workers/presenceEngine.js'

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

describe('P1.3 — DPDP Act 2023 Explicit Consent + Data Retention Split', () => {
  const SESSION_ID = 'session-privacy-101'
  const STUDENT_CONSENTED = '2024-CSE-001'
  const STUDENT_OPT_OUT = '2024-CSE-099'

  beforeEach(async () => {
    activeSessionCodes.clear()
    sessionReportedDevices.clear()
    sessionPulses.clear()
    studentPrivacyConsents.clear()

    // Generate active session code
    const reqGen = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen = createMockRes()
    await AttendanceController.generateSessionCode(reqGen, resGen)
  })

  test('non-consenting student telemetry is dropped at ingest', async () => {
    const active = activeSessionCodes.get(SESSION_ID)
    const validCode = active.code

    // Student has NOT consented (no record in studentPrivacyConsents)
    assert.strictEqual(hasPrivacyConsent(STUDENT_OPT_OUT), false)

    const reqReport = {
      body: {
        deviceInstallId: 'device-unconsented',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: STUDENT_OPT_OUT
      }
    }
    const resReport = createMockRes()
    await AttendanceController.reportPresence(reqReport, resReport)

    // Should be rejected / dropped with 403
    assert.strictEqual(resReport.statusCode, 403)
    assert.strictEqual(resReport.data.code, 'CONSENT_REQUIRED')
    assert.strictEqual(resReport.data.dropped, true)

    // Verify no pulses recorded
    const pulses = sessionPulses.get(SESSION_ID)
    assert.ok(!pulses || !pulses.has('device-unconsented'))
  })

  test('revoking consent stops presence tracking immediately', async () => {
    const active = activeSessionCodes.get(SESSION_ID)
    const validCode = active.code

    // 1. Grant consent
    const reqConsent = {
      body: {
        studentId: STUDENT_CONSENTED,
        consented: true
      }
    }
    const resConsent = createMockRes()
    await AttendanceController.updatePrivacyConsent(reqConsent, resConsent)
    assert.strictEqual(resConsent.statusCode, 200)
    assert.strictEqual(hasPrivacyConsent(STUDENT_CONSENTED), true)

    // 2. Presence report succeeds
    const reqReport1 = {
      body: {
        deviceInstallId: 'device-consented',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: STUDENT_CONSENTED
      }
    }
    const resReport1 = createMockRes()
    await AttendanceController.reportPresence(reqReport1, resReport1)
    assert.strictEqual(resReport1.statusCode, 200)

    // 3. Student revokes consent
    const reqRevoke = {
      body: {
        studentId: STUDENT_CONSENTED,
        consented: false,
        optOutReason: 'Privacy preference'
      }
    }
    const resRevoke = createMockRes()
    await AttendanceController.updatePrivacyConsent(reqRevoke, resRevoke)
    assert.strictEqual(resRevoke.statusCode, 200)
    assert.strictEqual(hasPrivacyConsent(STUDENT_CONSENTED), false)

    // 4. Subsequent report immediately dropped
    const reqReport2 = {
      body: {
        deviceInstallId: 'device-consented',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: STUDENT_CONSENTED
      }
    }
    const resReport2 = createMockRes()
    await AttendanceController.reportPresence(reqReport2, resReport2)
    assert.strictEqual(resReport2.statusCode, 403)
    assert.strictEqual(resReport2.data.dropped, true)
  })

  test('retention cleaner purges telemetry older than 90 days', async () => {
    const now = new Date('2026-11-17T12:00:00Z')
    const date100DaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000)
    const date30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Setup raw telemetry and presence sessions
    memoryPresenceStore.sessions = [
      { id: 1, created_at: date100DaysAgo.toISOString(), status: 'PRESENT' },
      { id: 2, created_at: date30DaysAgo.toISOString(), status: 'PRESENT' }
    ]
    memoryPresenceStore.rawTelemetry = [
      { id: 101, created_at: date100DaysAgo.toISOString(), rssi: -65 },
      { id: 102, created_at: date30DaysAgo.toISOString(), rssi: -70 }
    ]

    const cleanupResult = await runDataRetentionCleanup({
      telemetryRetentionDays: 90,
      now
    })

    assert.strictEqual(cleanupResult.status, 'SUCCESS')
    assert.strictEqual(cleanupResult.purgedSessions, 1)
    assert.strictEqual(cleanupResult.purgedTelemetry, 1)

    // Only 30-day session remains
    assert.strictEqual(memoryPresenceStore.sessions.length, 1)
    assert.strictEqual(memoryPresenceStore.sessions[0].id, 2)
    assert.strictEqual(memoryPresenceStore.rawTelemetry.length, 1)
    assert.strictEqual(memoryPresenceStore.rawTelemetry[0].id, 102)
  })

  test('retention cleaner PRESERVES final attendance records >=90 days', async () => {
    const now = new Date('2026-11-17T12:00:00Z')
    const date120DaysAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000) // > 90 days, < 365 days
    const date400DaysAgo = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000) // > 365 days

    memoryPresenceStore.sessions = [
      { id: 1, created_at: date120DaysAgo.toISOString(), status: 'PRESENT' }
    ]
    memoryPresenceStore.rawTelemetry = [
      { id: 201, created_at: date120DaysAgo.toISOString(), rssi: -68 }
    ]
    memoryPresenceStore.attendanceRecords = [
      { id: 'att-120d', date: date120DaysAgo.toISOString().split('T')[0], created_at: date120DaysAgo.toISOString(), status: 'PRESENT', course_code: 'CS301' },
      { id: 'att-400d', date: date400DaysAgo.toISOString().split('T')[0], created_at: date400DaysAgo.toISOString(), status: 'PRESENT', course_code: 'CS301' }
    ]

    await runDataRetentionCleanup({
      telemetryRetentionDays: 90,
      attendanceRetentionDays: 365,
      now
    })

    // Raw telemetry is purged at 90 days
    assert.strictEqual(memoryPresenceStore.sessions.length, 0)
    assert.strictEqual(memoryPresenceStore.rawTelemetry.length, 0)

    // Final statutory attendance record at 120 days is PRESERVED (under 1 academic year)
    assert.strictEqual(memoryPresenceStore.attendanceRecords.length, 1)
    assert.strictEqual(memoryPresenceStore.attendanceRecords[0].id, 'att-120d')
  })
})
