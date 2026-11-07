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

export function createInstitutionalNeedsRouter() {
  const router = Router()

  // Phase 1: Accreditation & Statutory Quality
  router.post('/compliance/co-po-attainment', (req, res) => {
    res.json(StatutoryQualityService.calculateCOPOAttainment(req.body))
  })
  router.post('/compliance/ugc-90-days', (req, res) => {
    res.json(StatutoryQualityService.verifyUGC90DayRule(req.body))
  })
  router.get('/compliance/aicte-sfr', (_req, res) => {
    res.json(StatutoryQualityService.checkAICTESFRCompliance())
  })
  router.post('/compliance/iqac-minutes', (req, res) => {
    res.json(StatutoryQualityService.generateIQACMinutes(req.body))
  })
  router.post('/compliance/peer-team-mock', (req, res) => {
    res.json(StatutoryQualityService.simulatePeerTeamMockVisit(req.body))
  })

  // Phase 2: Attendance & WhatsApp Compliance
  router.post('/attendance/barring-manifest', (req, res) => {
    res.json(AttendanceComplianceService.generateHallTicketBarringManifest(req.body))
  })
  router.post('/attendance/anomalies', (req, res) => {
    res.json(AttendanceComplianceService.detectAttendanceAnomalies(req.body))
  })
  router.post('/attendance/offline-reconcile', (req, res) => {
    res.json(AttendanceComplianceService.processOfflineAttendanceQueue(req.body.queue))
  })
  router.post('/attendance/biometric-turnstile', (req, res) => {
    res.json(AttendanceComplianceService.ingestBiometricTurnstileRecord(req.body))
  })

  // Phase 3: Exam Operations
  router.post('/exams/randomized-seating', (req, res) => {
    res.json(ExamOperationsService.generateRandomizedSeatingBlueprint(req.body))
  })
  router.post('/exams/invigilation-workload', (req, res) => {
    res.json(ExamOperationsService.balanceInvigilationWorkload(req.body))
  })
  router.post('/exams/blooms-taxonomy-audit', (req, res) => {
    res.json(ExamOperationsService.analyzeQuestionPaperBloomsTaxonomy(req.body))
  })
  router.post('/exams/re-evaluation-request', (req, res) => {
    res.json(ExamOperationsService.processReEvaluationRequest(req.body))
  })

  // Phase 4: Academic Scheduling
  router.post('/calendar/compensatory-saturdays', (req, res) => {
    res.json(AcademicSchedulingService.scheduleCompensatoryWorkingSaturdays(req.body))
  })
  router.post('/calendar/elective-sync', (req, res) => {
    res.json(AcademicSchedulingService.synchronizeElectiveTimeSlots(req.body))
  })
  router.get('/calendar/cie-milestones', (_req, res) => {
    res.json(AcademicSchedulingService.generateCIEMilestoneSchedule({}))
  })

  // Phase 5: Bursary & Fee Reconciliation
  router.post('/finance/brs-match', (req, res) => {
    res.json(BursaryReconciliationService.autoMatchBankStatementUTR(req.body))
  })
  router.post('/finance/escalation-tiers', (req, res) => {
    res.json(BursaryReconciliationService.generateEscalationReminderTiers(req.body))
  })
  router.post('/finance/scholarship-split', (req, res) => {
    res.json(BursaryReconciliationService.calculateGovernmentScholarshipSplit(req.body))
  })
  router.post('/finance/no-dues-clearance', (req, res) => {
    res.json(BursaryReconciliationService.generateDigitalNoDuesClearance(req.body))
  })

  // Phase 6: Student Lifecycle & Placement
  router.post('/students/mentor-allocation', (req, res) => {
    res.json(StudentLifecycleService.allocateFacultyMentors(req.body))
  })
  router.post('/students/placement-filter', (req, res) => {
    res.json(StudentLifecycleService.filterCampusPlacementEligible(req.body))
  })
  router.get('/students/360-dossier/:roll', (req, res) => {
    res.json(StudentLifecycleService.generateStudent360Dossier({ studentRoll: req.params.roll }))
  })
  router.post('/students/bonafide-cert', (req, res) => {
    res.json(StudentLifecycleService.generateSignedBonafideCertificate(req.body))
  })

  // Phase 7: Parent Engagement
  router.post('/parents/multilingual-notice', (req, res) => {
    res.json(ParentEngagementService.dispatchMultilingualParentNotice(req.body))
  })
  router.post('/parents/hostel-outing-leave', (req, res) => {
    res.json(ParentEngagementService.processHostelOutingPermission(req.body))
  })
  router.post('/parents/ptm-slot', (req, res) => {
    res.json(ParentEngagementService.schedulePTMAppointmentSlot(req.body))
  })

  // Phase 8: Hostel & Mess
  router.post('/hostel/mess-rebate', (req, res) => {
    res.json(HostelMessService.calculateMessRebate(req.body))
  })
  router.post('/hostel/maintenance-ticket', (req, res) => {
    res.json(HostelMessService.createMaintenanceTicket(req.body))
  })
  router.post('/hostel/roommate-match', (req, res) => {
    res.json(HostelMessService.matchRoommatePreferences(req.body))
  })
  router.post('/hostel/curfew-checkin', (req, res) => {
    res.json(HostelMessService.logNightCurfewGateEntry(req.body))
  })

  // Phase 9: Faculty Governance
  router.post('/faculty/leave-application', (req, res) => {
    res.json(FacultyGovernanceService.processFacultyLeaveApplication(req.body))
  })
  router.post('/faculty/api-cas-score', (req, res) => {
    res.json(FacultyGovernanceService.calculateUGCAPIScore(req.body))
  })
  router.post('/faculty/guest-honorarium', (req, res) => {
    res.json(FacultyGovernanceService.calculateGuestFacultyHonorarium(req.body))
  })
  router.get('/faculty/research-metrics/:name', (req, res) => {
    res.json(FacultyGovernanceService.trackResearchCitations({ facultyName: req.params.name }))
  })

  // Phase 10: Universal Search & Self-Healing
  router.get('/search/universal', (req, res) => {
    res.json(UniversalDirectoryIndex.searchDirectory(req.query.q, req.query.type))
  })
  router.get('/system/ai-health-chain', (_req, res) => {
    res.json(UniversalDirectoryIndex.verifySelfHealingAIFallback({}))
  })

  return router
}
