import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AttendanceController,
  activeSessionCodes,
  sessionReportedDevices,
  sessionPulses,
  sessionAttendanceRecords
} from '../../src/controllers/AttendanceController.js'

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

describe('P0.3 — Attendance Review Flow (Confidence Bands + Faculty Review)', () => {
  const SESSION_ID = 'session-review-flow-test'

  beforeEach(() => {
    activeSessionCodes.clear()
    sessionReportedDevices.clear()
    sessionPulses.clear()
    sessionAttendanceRecords.clear()
  })

  test('faculty sees needs_review rows in a separate section', async () => {
    // Set up a session with 1 confident student pulse and 1 partial student pulse
    // Student 1: High dwell (10 pulses = 3000s > 80% of 3600), valid code -> auto_present
    // Student 2: Partial dwell (5 pulses = 1500s ~ 41%), valid code -> needs_review
    // Student 3: No pulses -> needs_review (no_session_code)
    const pulsesMap = new Map()
    pulsesMap.set('device-s1', {
      deviceInstallId: 'device-s1',
      studentIdentifier: '2023CSE001',
      pulseCount: 10,
      validCodeCount: 10,
      rssiSamples: [-65],
      firstSeenAt: new Date(),
      lastSeenAt: new Date()
    })
    pulsesMap.set('device-s2', {
      deviceInstallId: 'device-s2',
      studentIdentifier: '2023CSE002',
      pulseCount: 5,
      validCodeCount: 5,
      rssiSamples: [-70],
      firstSeenAt: new Date(),
      lastSeenAt: new Date()
    })
    sessionPulses.set(SESSION_ID, pulsesMap)

    const req = {
      params: { sessionId: SESSION_ID },
      query: { courseId: 'CS301' },
      user: { id: 'faculty-alice', role: 'faculty', institutionId: 1 }
    }
    const res = createMockRes()

    await AttendanceController.getSessionReviewRoster(req, res)

    assert.strictEqual(res.statusCode, 200)
    assert.ok(res.data.sections)
    assert.ok(Array.isArray(res.data.sections.autoPresent))
    assert.ok(Array.isArray(res.data.sections.needsReview))
    assert.ok(res.data.sections.needsReview.length > 0)

    // Check confident student is in autoPresent
    const s1 = res.data.sections.autoPresent.find(s => s.rollNumber === '2023CSE001')
    assert.ok(s1, 'Student 1 should be in autoPresent')
    assert.strictEqual(s1.reviewState, 'auto_present')
    assert.strictEqual(s1.confidence, 'high')

    // Check partial student is in needsReview
    const s2 = res.data.sections.needsReview.find(s => s.rollNumber === '2023CSE002')
    assert.ok(s2, 'Student 2 should be in needsReview')
    assert.strictEqual(s2.reviewState, 'needs_review')
    assert.strictEqual(s2.confidence, 'medium')
  })

  test('faculty cannot finalize until all needs_review rows are resolved', async () => {
    // Initialize roster
    const reqRoster = {
      params: { sessionId: SESSION_ID },
      query: { courseId: 'CS301' },
      user: { id: 'faculty-alice', role: 'faculty', institutionId: 1 }
    }
    const resRoster = createMockRes()
    await AttendanceController.getSessionReviewRoster(reqRoster, resRoster)
    assert.strictEqual(resRoster.statusCode, 200)

    // Attempt to finalize without resolving needs_review
    const reqFinalize = {
      params: { sessionId: SESSION_ID },
      body: { resolutions: [] },
      user: { id: 'faculty-alice', role: 'faculty' }
    }
    const resFinalize = createMockRes()
    await AttendanceController.finalizeAttendanceSession(reqFinalize, resFinalize)

    assert.strictEqual(resFinalize.statusCode, 400)
    assert.strictEqual(resFinalize.data.code, 'UNRESOLVED_NEEDS_REVIEW')
    assert.match(resFinalize.data.error, /Faculty cannot finalize until all needs_review rows are resolved/)
    assert.ok(resFinalize.data.unresolvedCount > 0)
  })

  test('reviewed rows persist as faculty_override with facultyId', async () => {
    // 1. Initialize roster
    const reqRoster = {
      params: { sessionId: SESSION_ID },
      query: { courseId: 'CS301' },
      user: { id: 'faculty-alice', role: 'faculty', institutionId: 1 }
    }
    const resRoster = createMockRes()
    await AttendanceController.getSessionReviewRoster(reqRoster, resRoster)

    const needsReviewList = resRoster.data.sections.needsReview
    assert.ok(needsReviewList.length > 0)

    // 2. Resolve every needs_review student with specific choices (e.g. Present, Absent, On-Duty)
    const resolutions = needsReviewList.map((student, idx) => ({
      rollNumber: student.rollNumber,
      status: idx % 2 === 0 ? 'PRESENT' : 'ABSENT',
      reason: 'faculty_manual_review'
    }))

    const reqFinalize = {
      params: { sessionId: SESSION_ID },
      body: { resolutions },
      user: { id: 'faculty-alice', role: 'faculty' }
    }
    const resFinalize = createMockRes()
    await AttendanceController.finalizeAttendanceSession(reqFinalize, resFinalize)

    assert.strictEqual(resFinalize.statusCode, 200)
    assert.strictEqual(resFinalize.data.finalizedBy, 'faculty-alice')

    // 3. Verify all resolved records persist as 'faculty_override' with overriddenBy set to facultyId
    const storedRecords = sessionAttendanceRecords.get(SESSION_ID)
    for (const resItem of resolutions) {
      const match = storedRecords.find(r => r.rollNumber === resItem.rollNumber)
      assert.ok(match)
      assert.strictEqual(match.reviewState, 'faculty_override')
      assert.strictEqual(match.overriddenBy, 'faculty-alice')
      assert.strictEqual(match.status, resItem.status)
    }
  })
})
