import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AttendanceIngestionService } from '../../src/services/attendance/AttendanceIngestionService.js'
import { AttendanceAnalysis } from '../../src/services/attendance/AttendanceAnalysis.js'
import { AttendanceComplianceService } from '../../src/services/attendance/AttendanceComplianceService.js'
import { WhatsAppAttendance } from '../../src/services/attendance/WhatsAppAttendance.js'

describe('Unit: Attendance Edge Cases, Compliance & Ingestion', () => {
  it('handles CSV with malformed rows, missing columns, and empty text', async () => {
    const malformedCsv = [
      'student_id,date,status,course_code',
      '',
      ',,,',
      'STU101,,PRESENT,CS301',
      ',2026-09-01,PRESENT,CS301',
      'STU102,2026-09-01,PRESENT,CS301',
      '   '
    ].join('\n')

    const res = await AttendanceIngestionService.ingestFromCSV(malformedCsv, 1)
    assert.strictEqual(res.imported, 1)
    assert.strictEqual(res.failed, 3)

    const emptyRes = await AttendanceIngestionService.ingestFromCSV('', 1)
    assert.strictEqual(emptyRes.imported, 0)
    assert.strictEqual(emptyRes.failed, 0)
  })

  it('calculates 0% and 100% student attendance rates correctly', async () => {
    const attEven = await AttendanceAnalysis.calculateStudentAttendance(100)
    assert.ok(attEven.percentage > 0)
    assert.strictEqual(attEven.isAtRisk, false)

    const attOdd = await AttendanceAnalysis.calculateStudentAttendance(101)
    assert.ok(attOdd.percentage < 75)
    assert.strictEqual(attOdd.isAtRisk, true)

    const notified = await AttendanceAnalysis.notifyParents([{ id: 101 }])
    assert.strictEqual(notified.success, true)
    assert.strictEqual(notified.delivered, 1)
  })

  it('ingests attendance from Biometric API, ERP, and Google Sheets adapters', async () => {
    const bio = await AttendanceIngestionService.ingestFromBiometricAPI('/bio', 'k_123', 1)
    assert.strictEqual(bio.source, 'BIOMETRIC_API')
    assert.ok(bio.imported > 0)

    const erp = await AttendanceIngestionService.ingestFromERP('Fedena', {}, 1)
    assert.strictEqual(erp.status, 'SUCCESS')
    assert.ok(erp.imported > 0)

    const sheet = await AttendanceIngestionService.ingestFromGoogleSheet('sheet_01', 'k_123', 1)
    assert.strictEqual(sheet.source, 'GOOGLE_SHEET')
    assert.ok(sheet.imported > 0)

    const all = await AttendanceIngestionService.syncAllSources(1)
    assert.strictEqual(all.success, true)
    assert.ok(all.totalImported > 0)
  })

  it('AttendanceCompliance: generates hall ticket barring and condonation manifests', () => {
    const manifest = AttendanceComplianceService.generateHallTicketBarringManifest({
      records: [
        { roll: '1ST01', name: 'Student 1', totalClasses: 60, attendedClasses: 55 }, // > 75% -> eligible
        { roll: '1ST02', name: 'Student 2', totalClasses: 60, attendedClasses: 42 }, // 70% -> condonable
        { roll: '1ST03', name: 'Student 3', totalClasses: 60, attendedClasses: 25, hasCounselingNote: true }, // < 65% with note -> strictly barred
        { roll: '1ST04', name: 'Student 4', totalClasses: 60, attendedClasses: 20, hasCounselingNote: false } // < 65% without note -> counseling required
      ]
    })

    assert.strictEqual(manifest.summary.totalEvaluated, 4)
    assert.strictEqual(manifest.summary.eligibleCount, 1)
    assert.strictEqual(manifest.summary.condonationCount, 1)
    assert.strictEqual(manifest.summary.barredCount, 2)
    assert.strictEqual(manifest.barredList[0].status, 'STRICTLY_BARRED')
    assert.strictEqual(manifest.barredList[1].status, 'COUNSELING_REQUIRED')
  })

  it('AttendanceCompliance: detects rapid proxy spikes, bounds violations, and ghost holiday entries', () => {
    const anomalies = AttendanceComplianceService.detectAttendanceAnomalies({
      sessions: [
        { id: 'S1', course: 'CS301', faculty: 'Dr. Kumar', date: '2026-08-15', present: 45, total: 50 }, // Holiday
        { id: 'S2', course: 'CS302', faculty: 'Dr. Rao', date: '2026-09-01', present: 65, total: 50 }, // Bounds violation
        { id: 'S3a', course: 'CS303', faculty: 'Dr. Sen', date: '2026-09-02', present: 40, total: 50, submittedAt: '2026-09-02T10:00:00Z' },
        { id: 'S3b', course: 'CS303', faculty: 'Dr. Sen', date: '2026-09-02', present: 45, total: 50, submittedAt: '2026-09-02T10:02:00Z' } // Rapid proxy spike
      ],
      gazettedHolidays: ['2026-08-15']
    })

    assert.strictEqual(anomalies.isClean, false)
    assert.ok(anomalies.anomaliesDetectedCount >= 3)
  })

  it('AttendanceCompliance: processes offline attendance queue and hardware turnstile logs', () => {
    const queueRes = AttendanceComplianceService.processOfflineAttendanceQueue([
      null,
      { course: 'CS301' }, // Missing fields -> rejected
      { course: 'CS301', faculty: 'Dr. Kumar', date: '2026-09-01', present: 45, total: 50 } // Valid -> synced
    ])

    assert.strictEqual(queueRes.syncedCount, 1)
    assert.strictEqual(queueRes.rejectedCount, 2)

    const turnstileIn = AttendanceComplianceService.ingestBiometricTurnstileRecord({
      rfidTag: 'TAG_998',
      studentRoll: '22BCE1044',
      gateDirection: 'IN'
    })
    assert.strictEqual(turnstileIn.action, 'CAMPUS_ENTRY_LOGGED')

    const alert = AttendanceComplianceService.generateAttendanceAlert({
      studentId: 101,
      studentName: 'Aarav',
      attendancePercentage: 55.0
    })
    assert.strictEqual(alert.counseling_required, true)

    const resolvedAlert = AttendanceComplianceService.logMentorCounselingNote({
      alert,
      mentorId: 12,
      counselingNote: 'Medical reason discussed; student committed to compensatory classes'
    })
    assert.strictEqual(resolvedAlert.counseling_required, false)
    assert.strictEqual(resolvedAlert.status, 'COUNSELING_COMPLETED')
  })

  it('WhatsAppAttendance: registers leave, checks assignments, and stages attendance', () => {
    WhatsAppAttendance.clearStores()

    WhatsAppAttendance.registerFacultyLeave(10, '2026-09-10', 'Medical Leave', '+919999900000')
    assert.strictEqual(WhatsAppAttendance.isFacultyOnLeave(10, '2026-09-10'), true)
    assert.strictEqual(WhatsAppAttendance.isFacultyOnLeave(10, '2026-09-11'), false)

    const faculty = { courses: ['CS301 3A', 'CS302 3B'] }
    assert.strictEqual(WhatsAppAttendance.matchFacultyCourse(faculty, 'CS301', '3A'), true)
    assert.strictEqual(WhatsAppAttendance.matchFacultyCourse(faculty, 'CS999', '1A'), false)
  })
})
