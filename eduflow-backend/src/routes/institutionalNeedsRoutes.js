import { Router } from 'express'
import { StatutoryQualityService } from '../services/compliance/StatutoryQualityService.js'
import { AttendanceComplianceService } from '../services/attendance/AttendanceComplianceService.js'
import { ExamOperationsService } from '../services/exam/ExamOperationsService.js'
import { AcademicSchedulingService } from '../services/calendar/AcademicSchedulingService.js'
import { BursaryReconciliationService } from '../services/finance/BursaryReconciliationService.js'
import { StudentLifecycleService } from '../services/student/StudentLifecycleService.js'
import { ParentEngagementService } from '../services/parent/ParentEngagementService.js'
import { HostelMessService } from '../services/hostel/HostelMessService.js'
import { FacultyGovernanceService } from '../services/faculty/FacultyGovernanceService.js'
import { UniversalDirectoryIndex } from '../services/search/UniversalDirectoryIndex.js'

function safeHandle(fn) {
  return (req, res, next) => {
    try {
      const result = fn(req, res)
      if (result && typeof result.then === 'function') {
        result.then(data => res.json(data)).catch(next)
      } else {
        res.json(result)
      }
    } catch (err) {
      next(err)
    }
  }
}

export function createInstitutionalNeedsRouter() {
  const router = Router()

  // Phase 1: Accreditation & Statutory Quality
  router.post('/compliance/co-po-attainment', safeHandle(req => StatutoryQualityService.calculateCOPOAttainment(req.body || {})))
  router.post('/compliance/ugc-90-days', safeHandle(req => StatutoryQualityService.verifyUGC90DayRule(req.body || {})))
  router.get('/compliance/aicte-sfr', safeHandle(() => StatutoryQualityService.checkAICTESFRCompliance()))
  router.post('/compliance/iqac-minutes', safeHandle(req => StatutoryQualityService.generateIQACMinutes(req.body || {})))
  router.post('/compliance/peer-team-mock', safeHandle(req => StatutoryQualityService.simulatePeerTeamMockVisit(req.body || {})))

  // Phase 2: Attendance & WhatsApp Compliance
  router.post('/attendance/barring-manifest', safeHandle(req => AttendanceComplianceService.generateHallTicketBarringManifest(req.body || {})))
  router.post('/attendance/anomalies', safeHandle(req => AttendanceComplianceService.detectAttendanceAnomalies(req.body || {})))
  router.post('/attendance/offline-reconcile', safeHandle(req => AttendanceComplianceService.processOfflineAttendanceQueue((req.body && req.body.queue) || [])))
  router.post('/attendance/biometric-turnstile', safeHandle(req => AttendanceComplianceService.ingestBiometricTurnstileRecord(req.body || {})))

  // Phase 3: Exam Operations
  router.post('/exams/randomized-seating', safeHandle(req => ExamOperationsService.generateRandomizedSeatingBlueprint(req.body || {})))
  router.post('/exams/invigilation-workload', safeHandle(req => ExamOperationsService.balanceInvigilationWorkload(req.body || {})))
  router.post('/exams/blooms-taxonomy-audit', safeHandle(req => ExamOperationsService.analyzeQuestionPaperBloomsTaxonomy(req.body || {})))
  router.post('/exams/re-evaluation-request', safeHandle(req => ExamOperationsService.processReEvaluationRequest(req.body || {})))

  // Phase 4: Academic Scheduling
  router.post('/calendar/compensatory-saturdays', safeHandle(req => AcademicSchedulingService.scheduleCompensatoryWorkingSaturdays(req.body || {})))
  router.post('/calendar/elective-sync', safeHandle(req => AcademicSchedulingService.synchronizeElectiveTimeSlots(req.body || {})))
  router.get('/calendar/cie-milestones', safeHandle(() => AcademicSchedulingService.generateCIEMilestoneSchedule({})))

  // Phase 5: Bursary & Fee Reconciliation
  router.post('/finance/brs-match', safeHandle(req => BursaryReconciliationService.autoMatchBankStatementUTR(req.body || {})))
  router.post('/finance/escalation-tiers', safeHandle(req => BursaryReconciliationService.generateEscalationReminderTiers(req.body || {})))
  router.post('/finance/scholarship-split', safeHandle(req => BursaryReconciliationService.calculateGovernmentScholarshipSplit(req.body || {})))
  router.post('/finance/no-dues-clearance', safeHandle(req => BursaryReconciliationService.generateDigitalNoDuesClearance(req.body || {})))

  // Phase 6: Student Lifecycle & Placement
  router.post('/students/mentor-allocation', safeHandle(req => StudentLifecycleService.allocateFacultyMentors(req.body || {})))
  router.post('/students/placement-filter', safeHandle(req => StudentLifecycleService.filterCampusPlacementEligible(req.body || {})))
  router.get('/students/360-dossier/:roll', safeHandle(req => StudentLifecycleService.generateStudent360Dossier({ studentRoll: req.params.roll })))
  router.post('/students/bonafide-cert', safeHandle(req => StudentLifecycleService.generateSignedBonafideCertificate(req.body || {})))

  // Phase 7: Parent Engagement
  router.post('/parents/multilingual-notice', safeHandle(req => ParentEngagementService.dispatchMultilingualParentNotice(req.body || {})))
  router.post('/parents/hostel-outing-leave', safeHandle(req => ParentEngagementService.processHostelOutingPermission(req.body || {})))
  router.post('/parents/ptm-slot', safeHandle(req => ParentEngagementService.schedulePTMAppointmentSlot(req.body || {})))

  // Phase 8: Hostel & Mess
  router.post('/hostel/mess-rebate', safeHandle(req => HostelMessService.calculateMessRebate(req.body || {})))
  router.post('/hostel/maintenance-ticket', safeHandle(req => HostelMessService.createMaintenanceTicket(req.body || {})))
  router.post('/hostel/roommate-match', safeHandle(req => HostelMessService.matchRoommatePreferences(req.body || {})))
  router.post('/hostel/curfew-checkin', safeHandle(req => HostelMessService.logNightCurfewGateEntry(req.body || {})))

  // Phase 9: Faculty Governance
  router.post('/faculty/leave-application', safeHandle(req => FacultyGovernanceService.processFacultyLeaveApplication(req.body || {})))
  router.post('/faculty/api-cas-score', safeHandle(req => FacultyGovernanceService.calculateUGCAPIScore(req.body || {})))
  router.post('/faculty/guest-honorarium', safeHandle(req => FacultyGovernanceService.calculateGuestFacultyHonorarium(req.body || {})))
  router.get('/faculty/research-metrics/:name', safeHandle(req => FacultyGovernanceService.trackResearchCitations({ facultyName: req.params.name })))

  // Phase 10: Universal Search & Self-Healing
  router.get('/search/universal', safeHandle(req => UniversalDirectoryIndex.searchDirectory(req.query.q, req.query.type)))
  router.get('/system/ai-health-chain', safeHandle(() => UniversalDirectoryIndex.verifySelfHealingAIFallback({})))

  return router
}
