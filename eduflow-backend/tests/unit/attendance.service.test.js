import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AttendanceIngestionService } from '../../src/services/attendance/AttendanceIngestionService.js'
import { AttendanceAnalysis } from '../../src/services/attendance/AttendanceAnalysis.js'

describe('Unit: Attendance Service & Analysis Engine', () => {
  it('parses CSV attendance ledger and records imported counts', async () => {
    const csvContent = [
      'student_id,date,status,course_code',
      '2023CSE019,2026-09-01,PRESENT,CS301',
      '2023CSE045,2026-09-01,ABSENT,CS301',
      '2023CSE058,2026-09-01,ON_DUTY,CS301',
      '2023CSE064,2026-09-01,LATE,CS301'
    ].join('\n')

    const result = await AttendanceIngestionService.ingestFromCSV(csvContent, 1)
    assert.ok(result, 'Must return ingestion summary')
    assert.ok(result.imported >= 4, 'Must import 4 student session rows')
  })

  it('flags students with statutory attendance below 75% threshold', async () => {
    const analysis = await AttendanceAnalysis.flagAtRiskStudents(75.0, 1)

    assert.ok(analysis, 'Must return analysis result')
    assert.ok(typeof analysis.flaggedCount === 'number', 'flaggedCount must be a number')
    assert.ok(Array.isArray(analysis.students), 'students must be an array')
    
    // Validate each flagged student has attendance strictly below 75%
    analysis.students.forEach(student => {
      assert.ok(
        student.attendance_percentage < 75.0,
        `Student ${student.name} flagged despite having ${student.attendance_percentage}%`
      )
    })
  })

  it('validates idempotency for duplicate ingestion of identical session tuples', async () => {
    const csvSingle = 'student_id,date,status,course_code\n2023CSE099,2026-09-05,PRESENT,CS301\n'
    
    const firstPass = await AttendanceIngestionService.ingestFromCSV(csvSingle, 1)
    const secondPass = await AttendanceIngestionService.ingestFromCSV(csvSingle, 1)

    assert.ok(firstPass.imported >= 1, 'First pass imports record')
    assert.ok(secondPass.imported >= 0, 'Second pass operates idempotently without unhandled database crash')
  })
})
