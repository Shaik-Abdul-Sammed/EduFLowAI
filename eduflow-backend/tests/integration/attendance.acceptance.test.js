import { test, describe } from 'node:test'
import assert from 'node:assert'
import { AttendanceController } from '../../src/controllers/AttendanceController.js'
import { setPrivacyConsent, hasPrivacyConsent } from '../../src/services/presence.js'

describe('User Acceptance Testing (UAT): Faculty Attendance & Institutional Verification', () => {

  test('UAT-SCENARIO-1: Faculty 1-Click BLE Attendance Verification with Roster Boundary', async () => {
    // Given: Faculty Dr. Ramesh Kumar is teaching CS301 (Operating Systems) for Section CSE-6A
    // And: 8 enrolled students exist in CSE-6A
    // When: Faculty initiates Auto BLE Sync, and the RF scanner picks up 6 enrolled students + 2 enrolled absent + 3 external devices in corridor
    // Then: Exactly 8 enrolled students appear on the official attendance register
    // And: The 6 detected enrolled students are marked PRESENT with high confidence
    // And: The 2 non-detected students are marked ABSENT
    // And: None of the 3 external devices appear in the attendance records or affect the register

    const req = {
      user: { id: 1, role: 'faculty', institutionId: 1, assignedCourses: ['CS301'] },
      body: {
        ble_hashes: [
          '2023CSE001',
          '2023CSE002',
          '2023CSE019',
          '2023CSE042',
          '2023CSE089',
          '2023CSE102',
          // External devices present in corridor outside classroom:
          '2023CSE201-EXTERNAL',
          '2023CSE205-EXTERNAL',
          'IPHONE-VISITOR-BLE-UUID'
        ],
        course_id: 'CS301',
        section: 'CSE-6A',
        teacher_id: 1,
        date: new Date().toISOString().split('T')[0]
      }
    }

    let result = null
    const res = {
      status(code) { return this },
      json(data) { result = data; return this }
    }

    await AttendanceController.bleSync(req, res)

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.courseId, 'CS301')
    assert.strictEqual(result.section, 'CSE-6A')
    assert.strictEqual(result.totalEnrolled, 8)
    assert.strictEqual(result.presentCount, 6)
    assert.strictEqual(result.absentCount, 2)
    assert.strictEqual(result.foreignDevicesDetectedCount, 3)
    assert.strictEqual(result.records.length, 8)

    // Check that absent students are properly identified
    const absentRecords = result.records.filter(r => r.status === 'ABSENT')
    assert.strictEqual(absentRecords.length, 2)
    assert.ok(absentRecords.some(r => r.rollNumber === '2024-CSE-001'))
    assert.ok(absentRecords.some(r => r.rollNumber === '2024-CSE-042'))
  })

  test('UAT-SCENARIO-2: Faculty Manual Override with Mandatory Audit Justification', async () => {
    // Given: Student 2024-CSE-001 was absent because their phone battery was completely dead
    // When: Faculty manually verifies the student was sitting in the front row and overrides status to PRESENT
    // Then: The attendance record is updated with status PRESENT and isOverridden: true

    const req = {
      user: { id: 1, role: 'faculty', institutionId: 1, assignedCourses: ['CS301'] },
      body: {
        ble_hashes: ['2023CSE001'],
        course_id: 'CS301',
        section: 'CSE-6A',
        manual_overrides: {
          '2024-CSE-001': 'PRESENT' // Student had dead battery, physically verified
        }
      }
    }

    let result = null
    const res = {
      status() { return this },
      json(data) { result = data; return this }
    }

    await AttendanceController.bleSync(req, res)
    const overriddenStudent = result.records.find(r => r.rollNumber === '2024-CSE-001')

    assert.ok(overriddenStudent)
    assert.strictEqual(overriddenStudent.status, 'PRESENT')
    assert.strictEqual(overriddenStudent.isOverridden, true)
    assert.strictEqual(overriddenStudent.bleDetected, false)
  })

  test('UAT-SCENARIO-3: DPDP Act 2023 Privacy Consent Life Cycle', () => {
    // Given: A student initially grants consent for Wi-Fi / BLE presence tracking
    const studentRoll = '2023CSE001'
    setPrivacyConsent({ studentId: studentRoll, consented: true, policyVersion: '2026.1' })
    assert.strictEqual(hasPrivacyConsent(studentRoll), true, 'Student must have active consent')

    // When: Student exercises their DPDP Act statutory right to revoke telemetry consent
    setPrivacyConsent({ studentId: studentRoll, consented: false, optOutReason: 'Privacy preference for non-biometric tracking' })
    assert.strictEqual(hasPrivacyConsent(studentRoll), false, 'Revoked consent must return false immediately')
  })

  test('UAT-SCENARIO-4: UGC 75% Statutory Condonation & At-Risk Flagging', async () => {
    // Acceptance criterion: University requires continuous flagging of students with historical attendance < 75%
    const roster = await AttendanceController._getCourseRoster('CS301', 1, 'CSE-6A')
    const atRiskStudents = roster.filter(s => s.historicalAttendance < 75.0)

    assert.ok(atRiskStudents.length > 0, 'Roster must contain identified at-risk students (< 75%)')
    assert.ok(atRiskStudents.some(s => s.rollNumber === '2023CSE019' && s.historicalAttendance === 74.5))
    assert.ok(atRiskStudents.some(s => s.rollNumber === '2023CSE089' && s.historicalAttendance === 68.0))
  })
})
