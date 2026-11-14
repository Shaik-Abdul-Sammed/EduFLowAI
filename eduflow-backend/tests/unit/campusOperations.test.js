import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { CampusOperationsController } from '../../src/controllers/CampusOperationsController.js'

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

describe('Campus Operations & Enterprise Portals Unit Tests', () => {
  let createdGrievanceId = null
  let issuedBookId = null
  let appliedLeaveId = null
  let scholarshipId = null
  let admissionAppNo = null

  // -------------------------------------------------------------
  // Phase 1: Student Grievances, Parent Portal & Digital ID
  // -------------------------------------------------------------
  test('submitGrievance creates a new student complaint with SUBMITTED status', async () => {
    const req = {
      body: {
        student_roll: 'SS26',
        student_name: 'Ananya Sharma',
        category: 'Hostel',
        subject: 'Room 204 Fan Regulator Malfunction',
        description: 'Ceiling fan runs only at full speed.',
        priority: 'MEDIUM'
      }
    }
    const res = createMockRes()
    await CampusOperationsController.submitGrievance(req, res)

    assert.equal(res.statusCode, 201)
    assert.ok(res.data.success)
    assert.equal(res.data.grievance.subject, 'Room 204 Fan Regulator Malfunction')
    assert.equal(res.data.grievance.status, 'SUBMITTED')
    createdGrievanceId = res.data.grievance.id
  })

  test('getGrievances returns list of student grievances', async () => {
    const req = { query: {} }
    const res = createMockRes()
    await CampusOperationsController.getGrievances(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(Array.isArray(res.data.grievances))
    assert.ok(res.data.grievances.length > 0)
  })

  test('resolveGrievance updates status with resolution notes and resolver name', async () => {
    const req = {
      params: { id: createdGrievanceId || 1 },
      body: {
        status: 'RESOLVED',
        resolution_notes: 'Electrician replaced speed regulator switch.'
      },
      user: { name: 'Dr. Ramesh Kumar (HOD)' }
    }
    const res = createMockRes()
    await CampusOperationsController.resolveGrievance(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.data.success)
    assert.equal(res.data.grievance.status, 'RESOLVED')
    assert.equal(res.data.grievance.resolution_notes, 'Electrician replaced speed regulator switch.')
  })

  test('getParentPortalOverview returns child attendance, fees and mentor profile', async () => {
    const req = {}
    const res = createMockRes()
    await CampusOperationsController.getParentPortalOverview(req, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.data.child.overallAttendance >= 75)
    assert.ok(Array.isArray(res.data.child.subjectAttendance))
    assert.equal(res.data.fees.status, 'CLEAR')
    assert.ok(res.data.mentor.name)
  })

  test('getParentMentorChat and sendParentMentorMessage append to message thread', async () => {
    const postReq = {
      body: { text: 'Will extra lab hours be scheduled before midterms?', sender: 'parent' }
    }
    const postRes = createMockRes()
    await CampusOperationsController.sendParentMentorMessage(postReq, postRes)

    assert.equal(postRes.statusCode, 201)
    assert.ok(postRes.data.success)

    const getReq = {}
    const getRes = createMockRes()
    await CampusOperationsController.getParentMentorChat(getReq, getRes)

    assert.equal(getRes.statusCode, 200)
    assert.ok(Array.isArray(getRes.data.messages))
  })

  // -------------------------------------------------------------
  // Phase 2: Campus Operations (Hostel, Library, Leave)
  // -------------------------------------------------------------
  test('Library: getLibraryBooks, issueLibraryBook, and returnLibraryBook with fine calculation', async () => {
    const getRes = createMockRes()
    await CampusOperationsController.getLibraryBooks({}, getRes)
    assert.equal(getRes.statusCode, 200)
    assert.ok(getRes.data.books.length > 0)

    const issueReq = {
      body: { book_id: 1, student_roll: 'SS26', student_name: 'Ananya Sharma', days: 14 }
    }
    const issueRes = createMockRes()
    await CampusOperationsController.issueLibraryBook(issueReq, issueRes)
    assert.equal(issueRes.statusCode, 201)
    assert.equal(issueRes.data.issue.status, 'ISSUED')
    issuedBookId = issueRes.data.issue.id

    const returnReq = { body: { issue_id: issuedBookId } }
    const returnRes = createMockRes()
    await CampusOperationsController.returnLibraryBook(returnReq, returnRes)
    assert.equal(returnRes.statusCode, 200)
    assert.equal(returnRes.data.issue.status, 'RETURNED')
    assert.equal(typeof returnRes.data.fineAmount, 'number')
  })

  test('Hostel: allocateHostelRoom and logHostelGatePass', async () => {
    const allocReq = {
      body: {
        hostel_name: 'Aryabhata Boys Hostel',
        room_number: 'B-301',
        student_roll: '1ST22CS099',
        student_name: 'Tarun Rao'
      }
    }
    const allocRes = createMockRes()
    await CampusOperationsController.allocateHostelRoom(allocReq, allocRes)
    assert.equal(allocRes.statusCode, 201)
    assert.equal(allocRes.data.allocation.room_number, 'B-301')

    const gateReq = {
      body: {
        student_roll: '1ST22CS099',
        student_name: 'Tarun Rao',
        direction: 'OUT',
        reason: 'Weekend library pass'
      }
    }
    const gateRes = createMockRes()
    await CampusOperationsController.logHostelGatePass(gateReq, gateRes)
    assert.equal(gateRes.statusCode, 201)
    assert.equal(gateRes.data.log.direction, 'OUT')
  })

  test('Leave: applyLeave and updateLeaveStatus (HOD 1-click approval)', async () => {
    const applyReq = {
      body: {
        student_roll: 'SS26',
        student_name: 'Ananya Sharma',
        leave_type: 'OnDuty',
        from_date: '2026-11-20',
        to_date: '2026-11-22',
        reason: 'Attending AI Hackathon at IISc'
      }
    }
    const applyRes = createMockRes()
    await CampusOperationsController.applyLeave(applyReq, applyRes)
    assert.equal(applyRes.statusCode, 201)
    assert.equal(applyRes.data.leave.status, 'PENDING')
    appliedLeaveId = applyRes.data.leave.id

    const updateReq = {
      params: { id: appliedLeaveId },
      body: { status: 'APPROVED', review_comment: 'Approved with invitation verified.' },
      user: { name: 'Dr. Ramesh Kumar (HOD)' }
    }
    const updateRes = createMockRes()
    await CampusOperationsController.updateLeaveStatus(updateReq, updateRes)
    assert.equal(updateRes.statusCode, 200)
    assert.equal(updateRes.data.leave.status, 'APPROVED')
  })

  // -------------------------------------------------------------
  // Phase 3: Budget Tracking, Scholarship & Admissions
  // -------------------------------------------------------------
  test('Budget: getBudgets and recordExpense against departmental budget', async () => {
    const getRes = createMockRes()
    await CampusOperationsController.getBudgets({}, getRes)
    assert.equal(getRes.statusCode, 200)
    assert.ok(getRes.data.budgets.length > 0)

    const expReq = {
      body: {
        budget_id: 1,
        department: 'Computer Science',
        category: 'Lab Equipment',
        amount: 25000,
        vendor_name: 'Cisco Systems India',
        description: 'Gigabit Switch for AI cluster'
      }
    }
    const expRes = createMockRes()
    await CampusOperationsController.recordExpense(expReq, expRes)
    assert.equal(expRes.statusCode, 201)
    assert.equal(expRes.data.expense.amount, 25000)
  })

  test('Scholarship: applyScholarship and verifyScholarship auto-deducts credit', async () => {
    const applyReq = {
      body: {
        student_roll: 'SS26',
        scholarship_name: 'State Merit Scholarship',
        amount: 30000,
        gpa: 9.4
      }
    }
    const applyRes = createMockRes()
    await CampusOperationsController.applyScholarship(applyReq, applyRes)
    assert.equal(applyRes.statusCode, 201)
    scholarshipId = applyRes.data.scholarship.id

    const verifyReq = {
      params: { id: scholarshipId },
      user: { name: 'Finance Officer' }
    }
    const verifyRes = createMockRes()
    await CampusOperationsController.verifyScholarship(verifyReq, verifyRes)
    assert.equal(verifyRes.statusCode, 200)
    assert.equal(verifyRes.data.scholarship.status, 'VERIFIED')
    assert.ok(verifyRes.data.scholarship.invoice_deduction_id)
  })

  test('Admissions: submitAdmission and getAdmissionStatus by application number', async () => {
    const applyReq = {
      body: {
        full_name: 'Kavita Menon',
        email: 'kavita.m@example.com',
        desired_program: 'B.Tech Computer Science',
        percentage_or_cgpa: 95.8,
        payment_utr: 'UPI/9822331144/SUCCESS'
      }
    }
    const applyRes = createMockRes()
    await CampusOperationsController.submitAdmission(applyReq, applyRes)
    assert.equal(applyRes.statusCode, 201)
    assert.ok(applyRes.data.application.application_number)
    admissionAppNo = applyRes.data.application.application_number

    const statusReq = { params: { appNo: admissionAppNo } }
    const statusRes = createMockRes()
    await CampusOperationsController.getAdmissionStatus(statusReq, statusRes)
    assert.equal(statusRes.statusCode, 200)
    assert.equal(statusRes.data.application.full_name, 'Kavita Menon')
  })

  // -------------------------------------------------------------
  // Phase 4: Placement Readiness & Student Mock Aptitude Tests
  // -------------------------------------------------------------
  test('Placement: getPlacementDrives, applyPlacementDrive, and submitMockTest with auto-grading', async () => {
    const drivesRes = createMockRes()
    await CampusOperationsController.getPlacementDrives({}, drivesRes)
    assert.equal(drivesRes.statusCode, 200)
    assert.ok(drivesRes.data.drives.length > 0)

    const applyRes = createMockRes()
    await CampusOperationsController.applyPlacementDrive({ params: { id: 1 } }, applyRes)
    assert.equal(applyRes.statusCode, 200)
    assert.ok(applyRes.data.success)

    const mockRes = createMockRes()
    await CampusOperationsController.submitMockTest(
      {
        params: { id: 1 },
        body: { answers: { q1: 1, q2: 2, q3: 1, q4: 1, q5: 2 } }
      },
      mockRes
    )
    assert.equal(mockRes.statusCode, 200)
    assert.equal(mockRes.data.submission.score, 5)
    assert.equal(mockRes.data.submission.percentage, 100)
  })

  // -------------------------------------------------------------
  // Phase 5: Faculty Appraisal & Payroll
  // -------------------------------------------------------------
  test('submitFacultyAppraisal calculates weighted score and band correctly', async () => {
    const req = {
      body: {
        faculty_name: 'Prof. Ananya Roy',
        department: 'Physics',
        research_score: 90,
        teaching_score: 95,
        admin_score: 85
      }
    }
    const res = createMockRes()
    await CampusOperationsController.submitFacultyAppraisal(req, res)
    assert.equal(res.statusCode, 201)
    assert.equal(res.data.appraisal.total_score, 91)
    assert.equal(res.data.appraisal.performance_band, 'Outstanding')
  })

  test('generatePayslip calculates statutory allowances, PF, tax, and net pay', async () => {
    const req = {
      body: {
        faculty_name: 'Dr. M. Venkat',
        designation: 'Associate Professor',
        month: 'November',
        year: 2026,
        basic_pay: 100000
      }
    }
    const res = createMockRes()
    await CampusOperationsController.generatePayslip(req, res)
    assert.equal(res.statusCode, 201)
    assert.equal(res.data.payslip.basic_pay, 100000)
    assert.equal(res.data.payslip.da, 50000)
    assert.equal(res.data.payslip.hra, 24000)
    assert.equal(res.data.payslip.pf_deduction, 12000)
    assert.equal(res.data.payslip.tax_deduction, 10000)
    assert.equal(res.data.payslip.net_salary, 160000)

    const pdfRes = createMockRes()
    await CampusOperationsController.getPayslipPdf({ params: { id: res.data.payslip.id } }, pdfRes)
    assert.equal(pdfRes.statusCode, 200)
    assert.equal(pdfRes.data.pdfMetadata.document, 'INSTITUTIONAL_SALARY_SLIP')
  })

  // -------------------------------------------------------------
  // Phase 6: Automated Exam Proctoring & Tab Switch Violations
  // -------------------------------------------------------------
  test('logExamViolation records tab_switch_violation and issues warning', async () => {
    const req = {
      params: { id: 1 },
      body: {
        student_roll: 'SS26',
        student_name: 'Ananya Sharma',
        violation_type: 'tab_switch_violation',
        details: 'User navigated away to search engine tab during exam.'
      }
    }
    const res = createMockRes()
    await CampusOperationsController.logExamViolation(req, res)
    assert.equal(res.statusCode, 201)
    assert.equal(res.data.violation.violation_type, 'tab_switch_violation')
    assert.ok(res.data.warning.includes('PROCTORING WARNING'))

    const getRes = createMockRes()
    await CampusOperationsController.getExamViolations({ params: { id: 1 } }, getRes)
    assert.equal(getRes.statusCode, 200)
    assert.ok(getRes.data.violations.length > 0)
  })
})
