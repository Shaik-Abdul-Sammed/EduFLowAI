import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AttendanceController,
  activeSessionCodes,
  sessionReportedDevices,
  sessionPulses,
  sessionAttendanceRecords
} from '../../src/controllers/AttendanceController.js'
import { VALID_OVERRIDE_REASONS } from '../../src/services/presence.js'

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

describe('P2.1 — Manual Override with Reason Codes and Neutral Student Badge', () => {
  const SESSION_ID = 'session-override-test'

  beforeEach(async () => {
    activeSessionCodes.clear()
    sessionReportedDevices.clear()
    sessionPulses.clear()
    sessionAttendanceRecords.clear()

    // Initialize review roster
    const reqRoster = {
      params: { sessionId: SESSION_ID },
      query: { courseId: 'CS301' },
      user: { id: 'faculty-prof-sen', role: 'faculty', institutionId: 1 }
    }
    const resRoster = createMockRes()
    await AttendanceController.getSessionReviewRoster(reqRoster, resRoster)
  })

  test('manual override accepts reason code and persists faculty audit', async () => {
    const resolutions = [
      { rollNumber: '2023CSE001', status: 'PRESENT', reason: 'no_device' },
      { rollNumber: '2023CSE002', status: 'PRESENT', reason: 'device_dead' },
      { rollNumber: '2023CSE019', status: 'ON_DUTY', reason: 'accessibility' }
    ]

    const reqFinalize = {
      params: { sessionId: SESSION_ID },
      body: {
        resolutions,
        autoMarkRemainingAbsent: true
      },
      user: { id: 'faculty-prof-sen', role: 'faculty' }
    }
    const resFinalize = createMockRes()
    await AttendanceController.finalizeAttendanceSession(reqFinalize, resFinalize)

    assert.strictEqual(resFinalize.statusCode, 200)

    const stored = sessionAttendanceRecords.get(SESSION_ID)
    const s1 = stored.find(s => s.rollNumber === '2023CSE001')
    assert.strictEqual(s1.reviewState, 'faculty_override')
    assert.strictEqual(s1.overriddenBy, 'faculty-prof-sen')
    assert.strictEqual(s1.overrideReason, 'no_device')
    assert.strictEqual(s1.status, 'PRESENT')

    const s2 = stored.find(s => s.rollNumber === '2023CSE002')
    assert.strictEqual(s2.overrideReason, 'device_dead')

    const s3 = stored.find(s => s.rollNumber === '2023CSE019')
    assert.strictEqual(s3.overrideReason, 'accessibility')
  })

  test('invalid reason code falls back to manual_verified with warning', async () => {
    const resolutions = [
      { rollNumber: '2023CSE001', status: 'PRESENT', reason: 'invalid_unrecognized_reason_123' }
    ]

    const reqFinalize = {
      params: { sessionId: SESSION_ID },
      body: {
        resolutions,
        autoMarkRemainingAbsent: true
      },
      user: { id: 'faculty-prof-sen', role: 'faculty' }
    }
    const resFinalize = createMockRes()
    await AttendanceController.finalizeAttendanceSession(reqFinalize, resFinalize)

    assert.strictEqual(resFinalize.statusCode, 200)

    const stored = sessionAttendanceRecords.get(SESSION_ID)
    const s1 = stored.find(s => s.rollNumber === '2023CSE001')
    assert.strictEqual(s1.reviewState, 'faculty_override')
    assert.strictEqual(s1.overrideReason, 'manual_verified')
  })

  test('student view renders neutral badge for faculty-marked entries', async () => {
    const reqStudent = {
      params: { studentId: '2023CSE045' },
      user: { id: '2023CSE045', role: 'student', institutionId: 1 }
    }
    const resStudent = createMockRes()
    await AttendanceController.getStudentAttendance(reqStudent, resStudent)

    assert.strictEqual(resStudent.statusCode, 200)
    assert.ok(Array.isArray(resStudent.data.records))

    // Check that records marked by faculty carry the neutral badge
    const facultyMarked = resStudent.data.records.filter(r => r.review_state === 'faculty_override' || r.badge)
    assert.ok(facultyMarked.length > 0)
    for (const r of facultyMarked) {
      assert.strictEqual(r.badge, 'Marked by faculty')
      // Ensure no stigmatizing words like "Overridden" or "Exception"
      assert.doesNotMatch(r.badge, /overridden/i)
      assert.doesNotMatch(r.badge, /exception/i)
    }
  })
})
