import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AttendanceIngestionService } from '../../src/services/attendance/AttendanceIngestionService.js'
import { AttendanceAnalysis } from '../../src/services/attendance/AttendanceAnalysis.js'

describe('Unit: Attendance Ingestion & Analysis', () => {
  it('parses CSV attendance records correctly', async () => {
    const csv = `student_id,date,status,course_code
STU-101,2026-03-10,PRESENT,CS-401
STU-102,2026-03-10,ABSENT,CS-401`

    const res = await AttendanceIngestionService.ingestFromCSV(csv, 1)
    assert.equal(res.imported, 2)
    assert.equal(res.failed, 0)
  })

  it('calculates student attendance percentage and flags at-risk students below 75%', async () => {
    const atRiskReport = await AttendanceAnalysis.flagAtRiskStudents(75.0, 1)
    assert.ok(atRiskReport.flaggedCount > 0)
    for (const student of atRiskReport.students) {
      assert.ok(student.percentage < 75.0)
    }
  })
})
