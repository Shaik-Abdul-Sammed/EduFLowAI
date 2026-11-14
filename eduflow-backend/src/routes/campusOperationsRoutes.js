import { Router } from 'express'
import { CampusOperationsController } from '../controllers/CampusOperationsController.js'

export function createCampusOperationsRouter() {
  const router = Router()

  // Phase 1: Grievance Redressal
  router.post('/grievances', CampusOperationsController.submitGrievance)
  router.get('/grievances', CampusOperationsController.getGrievances)
  router.patch('/grievances/:id/resolve', CampusOperationsController.resolveGrievance)

  // Phase 1: Parent Portal & Mentor Chat
  router.get('/parent/overview', CampusOperationsController.getParentPortalOverview)
  router.get('/parent/chat', CampusOperationsController.getParentMentorChat)
  router.post('/parent/chat', CampusOperationsController.sendParentMentorMessage)

  // Phase 2: Library Management
  router.get('/library/books', CampusOperationsController.getLibraryBooks)
  router.post('/library/books', CampusOperationsController.addLibraryBook)
  router.post('/library/issue', CampusOperationsController.issueLibraryBook)
  router.post('/library/return', CampusOperationsController.returnLibraryBook)
  router.get('/library/issues', CampusOperationsController.getLibraryIssues)

  // Phase 2: Hostel Management
  router.get('/hostel/allocations', CampusOperationsController.getHostelAllocations)
  router.post('/hostel/allocate', CampusOperationsController.allocateHostelRoom)
  router.get('/hostel/gate-logs', CampusOperationsController.getHostelGateLogs)
  router.post('/hostel/gate-pass', CampusOperationsController.logHostelGatePass)

  // Phase 2: Student Leave Management
  router.post('/leave/apply', CampusOperationsController.applyLeave)
  router.get('/leave/requests', CampusOperationsController.getLeaveRequests)
  router.patch('/leave/:id/status', CampusOperationsController.updateLeaveStatus)

  // Phase 3: Budget Tracking
  router.get('/finance/budgets', CampusOperationsController.getBudgets)
  router.post('/finance/budgets', CampusOperationsController.setBudget)
  router.get('/finance/expenses', CampusOperationsController.getExpenses)
  router.post('/finance/expenses', CampusOperationsController.recordExpense)

  // Phase 3: Scholarship Management
  router.post('/scholarships/apply', CampusOperationsController.applyScholarship)
  router.get('/scholarships', CampusOperationsController.getScholarships)
  router.patch('/scholarships/:id/verify', CampusOperationsController.verifyScholarship)

  // Phase 3: Online Admissions
  router.post('/admissions/apply', CampusOperationsController.submitAdmission)
  router.get('/admissions/status/:appNo', CampusOperationsController.getAdmissionStatus)
  router.get('/admissions', CampusOperationsController.getAdmissionsList)

  // Phase 4: Placement Readiness & Mock Tests
  router.get('/placement/drives', CampusOperationsController.getPlacementDrives)
  router.post('/placement/drives', CampusOperationsController.createPlacementDrive)
  router.post('/placement/drives/:id/apply', CampusOperationsController.applyPlacementDrive)
  router.get('/placement/mock-tests', CampusOperationsController.getMockTests)
  router.post('/placement/mock-tests/:id/submit', CampusOperationsController.submitMockTest)
  router.get('/placement/mock-tests/submissions', CampusOperationsController.getMockTestSubmissions)

  // Phase 5: Faculty Appraisal & Payroll
  router.get('/faculty/appraisals', CampusOperationsController.getFacultyAppraisals)
  router.post('/faculty/appraisals', CampusOperationsController.submitFacultyAppraisal)
  router.get('/finance/payslips', CampusOperationsController.getPayslips)
  router.post('/finance/payslips/generate', CampusOperationsController.generatePayslip)
  router.get('/finance/payslips/:id/pdf', CampusOperationsController.getPayslipPdf)

  // Phase 6: Automated Online Exam & Proctoring
  router.get('/exams/online', CampusOperationsController.getOnlineExams)
  router.post('/exams/online/:id/submit', CampusOperationsController.submitOnlineExam)
  router.post('/exams/online/:id/violation', CampusOperationsController.logExamViolation)
  router.get('/exams/online/:id/violations', CampusOperationsController.getExamViolations)

  return router
}
