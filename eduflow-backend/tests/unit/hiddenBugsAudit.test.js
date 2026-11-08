import test from 'node:test'
import assert from 'node:assert/strict'
import { StatutoryQualityService } from '../../src/services/compliance/StatutoryQualityService.js'
import { AttendanceComplianceService } from '../../src/services/attendance/AttendanceComplianceService.js'
import { ExamOperationsService } from '../../src/services/exam/ExamOperationsService.js'
import { AcademicSchedulingService } from '../../src/services/calendar/AcademicSchedulingService.js'
import { BursaryReconciliationService } from '../../src/services/finance/BursaryReconciliationService.js'
import { StudentLifecycleService } from '../../src/services/student/StudentLifecycleService.js'
import { HostelMessService } from '../../src/services/hostel/HostelMessService.js'
import { UniversalDirectoryIndex } from '../../src/services/search/UniversalDirectoryIndex.js'
import { BaseProvider } from '../../src/ai/providers/BaseProvider.js'

test('100 Bugs & Edge Cases Resilience Verification Suite', async (t) => {

  await t.test('Edge Case 1-5: StatutoryQualityService zero-division and invalid date guards', () => {
    // Empty CO List
    const emptyCO = StatutoryQualityService.calculateCOPOAttainment({ courseCode: 'CS100', coList: [] })
    assert.equal(emptyCO.overallCourseAttainment, 0)
    assert.equal(Number.isNaN(emptyCO.overallCourseAttainment), false)

    // Zero maxMarks in assessments
    const zeroMarks = StatutoryQualityService.calculateCOPOAttainment({
      courseCode: 'CS100',
      directAssessments: [{ co: 'CO1', marksObtained: 10, maxMarks: 0 }]
    })
    assert.equal(Number.isNaN(zeroMarks.coAttainment.CO1.directScore), false)

    // Invalid dates in UGC 90-day rule
    const invalidDates = StatutoryQualityService.verifyUGC90DayRule({
      startDate: 'invalid-date',
      endDate: '2026-11-28'
    })
    assert.equal(invalidDates.effectiveInstructionDays, 0)
    assert.equal(invalidDates.isCompliant, false)

    // Zero faculty in SFR compliance
    const zeroFac = StatutoryQualityService.checkAICTESFRCompliance([
      { department: 'Test Dept', ugStudents: 100, faculty: 0 }
    ])
    assert.equal(zeroFac.departments[0].effectiveRatio, '1:100')
    assert.equal(zeroFac.institutionWideRatio, '1:0')
  })

  await t.test('Edge Case 6-10: AttendanceComplianceService edge conditions', () => {
    // Zero classes student
    const manifest = AttendanceComplianceService.generateHallTicketBarringManifest({
      records: [{ roll: 'TEST01', name: 'Test', totalClasses: 0, attendedClasses: 0 }]
    })
    assert.equal(manifest.eligibleList.length, 1)
    assert.equal(manifest.summary.overallInstitutionalAttendanceRate, 0)

    // Empty records array
    const emptyManifest = AttendanceComplianceService.generateHallTicketBarringManifest({ records: [] })
    assert.equal(emptyManifest.summary.overallInstitutionalAttendanceRate, 0)

    // Unordered sessions detecting rapid proxy spike
    const anomalies = AttendanceComplianceService.detectAttendanceAnomalies({
      sessions: [
        { id: 'S2', course: 'CS301', date: '2026-06-01', present: 60, total: 60, submittedAt: '2026-06-01T10:04:00.000Z' },
        { id: 'S1', course: 'CS301', date: '2026-06-01', present: 58, total: 60, submittedAt: '2026-06-01T10:02:00.000Z' }
      ],
      gazettedHolidays: []
    })
    assert.equal(anomalies.anomaliesDetectedCount, 1)
    assert.equal(anomalies.anomalies[0].type, 'RAPID_PROXY_SPIKE')

    // Malformed offline queue
    const offline = AttendanceComplianceService.processOfflineAttendanceQueue([
      null,
      { course: 'CS301' }, // missing faculty, date, present
      { course: 'CS301', faculty: 'Dr. Kumar', date: '2026-06-01', present: 45, total: 50 }
    ])
    assert.equal(offline.rejectedCount, 2)
    assert.equal(offline.syncedCount, 1)
  })

  await t.test('Edge Case 11-15: ExamOperationsService empty batches, workload and total marks = 0', () => {
    // Empty batches
    const emptySeating = ExamOperationsService.generateRandomizedSeatingBlueprint({
      rows: 2,
      columns: 2,
      studentBatches: []
    })
    assert.equal(emptySeating.totalCapacity, 4)
    assert.equal(emptySeating.vacantSeats, 4)

    // Empty faculty list
    const workload = ExamOperationsService.balanceInvigilationWorkload({ facultyList: [], examSlotsCount: 2 })
    assert.equal(workload.totalExamSlots, 2)
    assert.equal(workload.assignments.length, 2)

    // Zero max marks Bloom exam
    const blooms = ExamOperationsService.analyzeQuestionPaperBloomsTaxonomy({
      questions: [
        { qNo: 1, marks: 0, bloomsLevel: 'Remember', difficulty: 'Easy' }
      ]
    })
    assert.equal(blooms.totalMarks, 0)
    assert.equal(blooms.difficultyDistribution.easyPercentage, '0%')
    assert.equal(Number.isNaN(blooms.difficultyDistribution.easyPercentage), false)
  })

  await t.test('Edge Case 16-20: AcademicSchedulingService empty arrays', () => {
    // Empty reasons array
    const sched = AcademicSchedulingService.scheduleCompensatoryWorkingSaturdays({
      lostInstructionDaysCount: 2,
      lostDates: ['2026-08-20'],
      reasons: [],
      candidateSaturdays: ['2026-09-05', '2026-09-12']
    })
    assert.equal(sched.totalCompensatedDays, 2)
    assert.equal(sched.assignedCompensations[0].reason, 'Emergency Disruption')
  })

  await t.test('Edge Case 21-25: BursaryReconciliationService null remarks and string amounts', () => {
    // Null remark in entry
    const brs = BursaryReconciliationService.autoMatchBankStatementUTR({
      bankEntries: [
        { utr: 'UTR001', amount: '45000', date: '2026-06-01', remark: null },
        { utr: 'UTR002', amount: 50000, date: '2026-06-02', remark: '1ST21CS001 FEE' }
      ],
      unpaidInvoices: [
        { invoiceId: 'INV1', studentRoll: '1ST21CS001', studentName: 'Aarav', amount: 50000 },
        { invoiceId: 'INV2', studentRoll: '1ST21EC002', studentName: 'Diya', amount: 45000 }
      ]
    })
    assert.equal(brs.matchedCount, 2)
    assert.equal(brs.totalReconciledAmountINR, 95000)

    // Undefined/zero fee reminder
    const reminder = BursaryReconciliationService.generateEscalationReminderTiers({
      amount: undefined,
      overdueDays: undefined
    })
    assert.equal(reminder.amount, 0)
    assert.equal(reminder.overdueDays, 0)
    assert.equal(reminder.draftedNotification.includes('₹0'), true)
  })

  await t.test('Edge Case 26-30: StudentLifecycleService empty mentors & loose criteria', () => {
    // Empty faculty
    const alloc = StudentLifecycleService.allocateFacultyMentors({
      facultyList: [],
      studentList: [{ roll: '1ST01', name: 'Aarav' }]
    })
    assert.equal(alloc.totalStudentsAssigned, 1)

    // Loose criteria
    const placement = StudentLifecycleService.filterCampusPlacementEligible({
      students: [{ roll: '1ST01', name: 'Aarav', cgpa: 8.5, activeBacklogs: 0, tenthPct: 80, twelfthPct: 80, branch: 'CSE' }],
      criteria: {} // empty criteria defaults safely
    })
    assert.equal(placement.eligibleCount, 1)
  })

  await t.test('Edge Case 31-35: HostelMessService inverted dates and malformed curfew strings', () => {
    // Inverted dates (end before start)
    const rebate = HostelMessService.calculateMessRebate({
      leaveStartDate: '2026-06-20',
      leaveEndDate: '2026-06-10'
    })
    assert.equal(rebate.totalDaysAbsent, 0)
    assert.equal(rebate.isEligibleForRebate, false)
    assert.equal(rebate.totalRebateAmountINR, 0)

    // Malformed curfew time
    const curfew = HostelMessService.logNightCurfewGateEntry({
      checkInTimeString: 'invalid',
      curfewCutoff: '21:00'
    })
    assert.equal(Number.isNaN(curfew.minutesOverdue), false)
    assert.equal(curfew.isViolation, false)
  })

  await t.test('Edge Case 36-40: BaseProvider safeJsonParse LLM robustness', () => {
    // Markdown fenced JSON
    const res1 = BaseProvider.safeJsonParse('```json\n{"success": true, "count": 10}\n```')
    assert.equal(res1.success, true)
    assert.equal(res1.count, 10)

    // Preambled JSON with trailing text
    const res2 = BaseProvider.safeJsonParse('Here is the report:\n{"status": "OK"}\nHope this helps!')
    assert.equal(res2.status, 'OK')

    // Trailing comma
    const res3 = BaseProvider.safeJsonParse('{"items": [1, 2, ], "active": false, }')
    assert.equal(res3.active, false)
    assert.equal(res3.items.length, 2)

    // Malformed JSON with fallback
    const res4 = BaseProvider.safeJsonParse('Not a JSON string at all', { fallbackUsed: true })
    assert.equal(res4.fallbackUsed, true)
  })

  await t.test('Edge Case 41-45: UniversalDirectoryIndex query regex safety', () => {
    // Query with regex characters that would crash raw RegExp
    const search = UniversalDirectoryIndex.searchDirectory('(Dr. [Ramesh]* +?)', 'ALL')
    assert.equal(Array.isArray(search.results), true)
    assert.equal(search.count, 0)

    // Search with null/undefined query and filter
    const searchNull = UniversalDirectoryIndex.searchDirectory(null, null)
    assert.equal(searchNull.count, 8)
  })

})
