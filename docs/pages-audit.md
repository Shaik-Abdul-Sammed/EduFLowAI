# EduFlowAI Comprehensive Page-by-Page Audit

## Ground-Truth Status Summary
- **Total Audited Pages:** 196
- **REAL:** 33 (calendar, attendance, grievances, dean escalation — verified with real API, tests & role guards)
- **PARTIAL:** 56 (has API calls but lacks full write action, end-to-end assertions, or integration tests)
- **MOCK:** 98 (uses local state, hardcoded arrays, or mock fixtures)
- **STUB:** 7 (placeholder or under construction component)
- **ORPHAN:** 2 (unrouted legacy or internal subcomponent)

## Page Inventory

| Page | Route | Current State | Real API? | Real Action? | Has Test? | Role Guard? | Tier | Blocker |
|---|---|---|---|---|---|---|---|---|
| `admin/AcademicCalendarPage.jsx` | `/admin-dashboard/calendar` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/AttendanceIntegrationPage.jsx` | `/admin-dashboard/attendance` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/BudgetTrackingPage.jsx` | `/admin-dashboard/budget` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/BulkDataImportPage.jsx` | `/admin-dashboard/bulk-data-import` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/BulkStudentImportPage.jsx` | `/admin-dashboard/bulk-import` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/CalendarActionModals.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarAnalyticsChart.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarDiagnosisTab.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarGridTab.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarPreviewExportModals.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarTablesTab.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CalendarVacationBlocks.jsx` | `/admin-dashboard/calendar (subcomponent)` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/CompliancePage.jsx` | `/admin-dashboard/compliance` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/CurriculumMappingPage.jsx` | `/curriculum-mapping` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/DegreeAuditPage.jsx` | `/admin-dashboard/degree-audit` | `PARTIAL` | Yes | No | Yes | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `admin/FeeReminderPage.jsx` | `/admin-dashboard/fee-reminders` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/GrievanceManagementPage.jsx` | `/hod-dashboard/grievances` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/HostelWardenPage.jsx` | `/admin-dashboard/hostel-management` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/InsightsDashboardPage.jsx` | `/admin-dashboard/'insights'` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/InstitutionSettingsPage.jsx` | `/admin-dashboard/settings` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/InvoiceGeneratorPage.jsx` | `/finance-dashboard/invoices` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/LeadManagementPage.jsx` | `/admin-dashboard/'leads'` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/LibraryManagementPage.jsx` | `/staff-dashboard/library` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/LibraryScannerPage.jsx` | `/library-scanner` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/LiveDataPage.jsx` | `/admin-dashboard/live-data` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/NaacAiAnalysisPage.jsx` | `/admin-dashboard/'naac-ai-analysis'` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/NaacDashboardPage.jsx` | `/admin-dashboard/'naac-dashboard'` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/NirfDashboardPage.jsx` | `/admin-dashboard/'nirf'` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/OnboardingWizardPage.jsx` | `/admin-dashboard/onboarding` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/PlacementDrivesPage.jsx` | `/admin-dashboard/placement-drives` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/PortalConnectionPage.jsx` | `/admin-dashboard/portal` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/ProcurementPage.jsx` | `/admin-dashboard/procurement` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/ReportDeliveryPage.jsx` | `/admin-dashboard/'report-delivery'` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/SSOConfigPage.jsx` | `/admin-dashboard/sso-config` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/ScholarshipManagementPage.jsx` | `/admin-dashboard/scholarships` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/StaffManagementPage.jsx` | `/admin-dashboard/staff` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/SupportTicketsPage.jsx` | `/admin-dashboard/support-tickets` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/SystemHealthPage.jsx` | `/admin-dashboard/system-health` | `PARTIAL` | Yes | No | Yes | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `admin/UPICollectionPage.jsx` | `/admin-dashboard/upi-collection` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/WhatsAppAttendancePage.jsx` | `/admin-dashboard/whatsapp-attendance` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/admissionsPipeline.jsx` | `/admin-dashboard/admissions-pipeline` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/analyticsCenter.jsx` | `/admin-dashboard/analytics-center` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/attendanceAudit.jsx` | `/admin-dashboard/attendance-audit` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/auditLogs.jsx` | `/admin-dashboard/audit-logs` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/backupManagement.jsx` | `/admin-dashboard/backup-management` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/examSetup.jsx` | `/admin-dashboard/exam-setup` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/facultyManagement.jsx` | `/admin-dashboard/faculty-management` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/feeCollection.jsx` | `/admin-dashboard/fee-collection` | `MOCK` | No | No | Yes | Yes | Tier C | Hardcoded mock data / local state only |
| `admin/hostelAllocation.jsx` | `/admin-dashboard/hostel-allocation` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `admin/insights/DomainInsightPage.jsx` | `/admin-dashboard/insights/:domain` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `admin/parentAccounts.jsx` | `/admin-dashboard/parent-accounts` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `admin/payrollPreview.jsx` | `/admin-dashboard/payroll-preview` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/resultPublishing.jsx` | `/admin-dashboard/result-publishing` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/rolePermissions.jsx` | `/admin-dashboard/role-permissions` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/studentManagement.jsx` | `/admin-dashboard/student-management` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `admin/timetableGeneration.jsx` | `/admin-dashboard/timetable-generation` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `admin/userTracking.jsx` | `/admin-dashboard/user-tracking` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/AITerminal.jsx` | `/ai-terminal` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `ai/BuildManager.jsx` | `/build-manager` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `ai/DigitalTwinManager.jsx` | `/digital-twin` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `ai/OfficersDashboard.jsx` | `/officers-dashboard` | `PARTIAL` | Yes | No | Yes | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `ai/officers/AccreditationOfficer.jsx` | `/officer/accreditation` | `PARTIAL` | Yes | No | No | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `ai/officers/AdmissionOfficer.jsx` | `/officer/admission` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/officers/FinanceOfficer.jsx` | `/officer/finance` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/officers/OfficerPlaceholder.jsx` | `/officer/placeholder` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/officers/StudentSuccessOfficer.jsx` | `/officer/student-success` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/officers/TimetableOfficer.jsx` | `/officer/timetable` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `ai/officers/TimetableUploadPage.jsx` | `/officer/timetable-upload` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `common/ProfilePage.jsx` | `/profile` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `common/ResearchWorkspacePage.jsx` | `/research-workspace` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `common/VirtualClassroomPage.jsx` | `/virtual-classroom` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `common/WhiteboardPage.jsx` | `/whiteboard` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `demo/ObservationMode.jsx` | `/demo/observe` | `PARTIAL` | Yes | No | Yes | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `faculty/AttendanceAnalyticsPage.jsx` | `/faculty-dashboard/attendance-analytics` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `faculty/ClassDiscussionBoardPage.jsx` | `/faculty-dashboard/class-discussion-board` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/CurriculumRevisionPage.jsx` | `/faculty-dashboard/curriculum-revision` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/ExamQuestionGeneratorPage.jsx` | `/faculty-dashboard/exam-question-generator` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `faculty/FacultyWalletPage.jsx` | `/faculty-wallet` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `faculty/LabInventoryPage.jsx` | `/faculty-dashboard/lab-inventory` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/PeerEvaluationPage.jsx` | `/faculty-dashboard/peer-evaluation` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/PlagiarismCheckerPage.jsx` | `/faculty-dashboard/plagiarism-checker` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `faculty/PodcastStudioPage.jsx` | `/faculty-dashboard/podcast-studio` | `MOCK` | No | No | Yes | Yes | Tier C | Hardcoded mock data / local state only |
| `faculty/PublicationRepositoryPage.jsx` | `/faculty-dashboard/publication-repository` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/ResearchGrantTrackerPage.jsx` | `/faculty-dashboard/research-grant-tracker` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/RubricBuilderPage.jsx` | `/faculty-dashboard/rubric-builder` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `faculty/SpeedGraderPage.jsx` | `/staff-dashboard/speed-grader` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `faculty/StudentEscalationsPage.jsx` | `/faculty-dashboard/student-escalations` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/StudentInterventionPage.jsx` | `/faculty-dashboard/student-intervention` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/TeachingPortfolioPage.jsx` | `/faculty-dashboard/teaching-portfolio` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/VirtualOfficeHoursPage.jsx` | `/faculty-dashboard/virtual-office-hours` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/academicAnalytics.jsx` | `/faculty-dashboard/academic-analytics` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `faculty/assignmentCreator.jsx` | `/faculty-dashboard/assignment-creator` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `faculty/attendanceEntry.jsx` | `/faculty-dashboard/attendance-entry` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `faculty/classTimetable.jsx` | `/faculty-dashboard/class-timetable` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `faculty/departmentNotices.jsx` | `/faculty-dashboard/department-notices` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/examInvigilation.jsx` | `/faculty-dashboard/exam-invigilation` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `faculty/leaveApplication.jsx` | `/faculty-dashboard/leave-application` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/lessonPlanner.jsx` | `/faculty-dashboard/lesson-planner` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/marksEntry.jsx` | `/faculty-dashboard/marks-entry` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `faculty/mentoringLog.jsx` | `/faculty-dashboard/mentoring-log` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `faculty/parentMessaging.jsx` | `/faculty-dashboard/parent-messaging` | `MOCK` | No | No | Yes | Yes | Tier C | Hardcoded mock data / local state only |
| `faculty/questionBankUpload.jsx` | `/faculty-dashboard/question-bank-upload` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/researchTracker.jsx` | `/faculty-dashboard/research-tracker` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/resourceRepository.jsx` | `/faculty-dashboard/resource-repository` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `faculty/syllabusTracker.jsx` | `/faculty-dashboard/syllabus-tracker` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `finance/FinanceDashboardPage.jsx` | `/finance-dashboard` | `PARTIAL` | Yes | No | Yes | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `finance/PayrollGenerationPage.jsx` | `/admin-dashboard/payroll` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `hod/FacultyAppraisalPage.jsx` | `/hod-dashboard/faculty-appraisal` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `hod/HodCalendarPage.jsx` | `/hod-dashboard/calendar` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `hod/HodDashboardPage.jsx` | `/hod-dashboard` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `hod/LeaveApprovalsPage.jsx` | `/hod-dashboard/leave-approvals` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `hod/StaffManagementPage.jsx` | `/hod-dashboard/staff` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `parent/ParentDashboardPage.jsx` | `/parent-dashboard` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `parent/childAttendance.jsx` | `/parent-dashboard/child-attendance` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `parent/childTracking.jsx` | `/parent-dashboard/child-tracking` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `parent/dailyHomework.jsx` | `/parent-dashboard/daily-homework` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `parent/disciplineAlerts.jsx` | `/parent-dashboard/discipline-alerts` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `parent/dueAlerts.jsx` | `/parent-dashboard/due-alerts` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `parent/examCalendar.jsx` | `/parent-dashboard/exam-calendar` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `parent/feeDashboard.jsx` | `/parent-dashboard/fee-dashboard` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `parent/healthRecords.jsx` | `/parent-dashboard/health-records` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/leaveRequests.jsx` | `/parent-dashboard/leave-requests` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/marksProgress.jsx` | `/parent-dashboard/marks-progress` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/parentNotices.jsx` | `/parent-dashboard/parent-notices` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/profileSettings.jsx` | `/parent-dashboard/profile-settings` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/ptmBooking.jsx` | `/parent-dashboard/ptm-booking` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/scholarshipView.jsx` | `/parent-dashboard/scholarship-view` | `STUB` | No | No | No | Yes | Tier C | Placeholder stub page |
| `parent/teacherCommunication.jsx` | `/parent-dashboard/teacher-communication` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `public/AboutPage.jsx` | `/about` | `MOCK` | No | No | Yes | Public | Tier C | Static presentation component |
| `public/AttendanceExplainerPage.jsx` | `/how-attendance-works` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `public/DataProcessingAgreementPage.jsx` | `/dpa` | `MOCK` | No | No | Yes | Public | Tier C | Static presentation component |
| `public/DocsPage.jsx` | `/docs` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `public/EntryPage.jsx` | `/entry` | `MOCK` | No | No | Yes | Public | Tier C | Hardcoded mock data / local state only |
| `public/ForgotPasswordPage.jsx` | `/forgot-password` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `public/HelpCenterPage.jsx` | `/help` | `PARTIAL` | Yes | Yes | Yes | Public | Tier B | Write action exists but lacks integration tests / audit |
| `public/InstitutionRegister.jsx` | `/register-institution` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `public/LeadIntakePage.jsx` | `/for-colleges` | `PARTIAL` | Yes | Yes | Yes | Public | Tier B | Write action exists but lacks integration tests / audit |
| `public/LoginPage.jsx` | `/login` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `public/OnboardingPage.jsx` | `/onboarding` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `public/OnlineAdmissionPage.jsx` | `/apply` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `public/PrivacyPolicyPage.jsx` | `/privacy` | `MOCK` | No | No | Yes | Public | Tier C | Static presentation component |
| `public/PublicReportViewer.jsx` | `/r/:token` | `PARTIAL` | Yes | No | No | Yes | Tier C | Read-only fetch without mutation or missing endpoint |
| `public/ServicesPage.jsx` | `None` | `ORPHAN` | No | No | Yes | No | Tier C | No route registered in App.jsx |
| `public/SignupPage.jsx` | `None` | `ORPHAN` | No | No | No | No | Tier C | No route registered in App.jsx |
| `public/TermsOfServicePage.jsx` | `/terms` | `MOCK` | No | No | Yes | Public | Tier C | Static presentation component |
| `public/WhyEduFlowPage.jsx` | `/why-eduflow` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `staff/StaffDashboardPage.jsx` | `/staff-dashboard` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/ARScannerPage.jsx` | `/student-dashboard/ar-scanner` | `MOCK` | No | No | Yes | Yes | Tier C | Static presentation component |
| `student/AdaptiveLearningPage.jsx` | `/student-dashboard/adaptive-learning` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/AlumniDirectoryPage.jsx` | `/student-dashboard/alumni-directory` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/CampusEventsPage.jsx` | `/student-dashboard/campus-events` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/CapstoneProjectPage.jsx` | `/student-dashboard/capstone-project` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/CareerRoadmapPage.jsx` | `/student-dashboard/career-roadmap` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/CertificatePage.jsx` | `/student-dashboard/certificates` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/CourseFeedbackPage.jsx` | `/student-dashboard/course-feedback` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/CredentialWalletPage.jsx` | `/student-dashboard/credentials` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/DeanEscalationPage.jsx` | `/student-dashboard/dean-escalation` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/DigitalIdCard.jsx` | `/student-dashboard/digital-id` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/DoubtSolvingPage.jsx` | `/student-dashboard/doubt-solving` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/ElectiveBiddingPage.jsx` | `/student-dashboard/elective-bidding` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/GatePrepPage.jsx` | `/student-dashboard/gate-prep` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/GrievancePage.jsx` | `/student-dashboard/grievances` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/LeaderboardPage.jsx` | `/student-dashboard/leaderboard` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/LeaveApplicationPage.jsx` | `/student-dashboard/leave-application` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/LostFoundPage.jsx` | `/student-dashboard/lost-found` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/MessMenuPage.jsx` | `/student-dashboard/mess-menu` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/OnlineExamPage.jsx` | `/student-dashboard/online-exam` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/ResumeBuilderPage.jsx` | `/student-dashboard/resume-builder` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/StudentMockTestPage.jsx` | `/student-dashboard/mock-tests` | `PARTIAL` | Yes | Yes | No | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/StudyPlannerPage.jsx` | `/student-dashboard/study-planner` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/VirtualLabsPage.jsx` | `/student-dashboard/virtual-labs` | `PARTIAL` | Yes | Yes | Yes | Yes | Tier B | Write action exists but lacks integration tests / audit |
| `student/WellnessCompanionPage.jsx` | `/student-dashboard/wellness-companion` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/assignments.jsx` | `/student-dashboard/assignments` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/attendanceOverview.jsx` | `/student-dashboard/attendance` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/bipcCourses.jsx` | `/student-dashboard/bipc-courses` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/digitalMaterials.jsx` | `/student-dashboard/digital-materials` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/examSchedule.jsx` | `/student-dashboard/exam-schedule` | `MOCK` | No | No | Yes | Yes | Tier C | Hardcoded mock data / local state only |
| `student/feeStatus.jsx` | `/student-dashboard/fee-status` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/hostelInfo.jsx` | `/student-dashboard/hostel-info` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/jeeMainsPrep.jsx` | `/student-dashboard/jee-mains-prep` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/labBookings.jsx` | `/student-dashboard/lab-bookings` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/libraryAccount.jsx` | `/student-dashboard/library-account` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/mbipcCourses.jsx` | `/student-dashboard/mbipc-courses` | `MOCK` | No | No | No | Yes | Tier C | Static presentation component |
| `student/mentorConnect.jsx` | `/student-dashboard/mentor-connect` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/mpcCourses.jsx` | `/student-dashboard/mpc-courses` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/neetPrep.jsx` | `/student-dashboard/neet-prep` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/paymentHistory.jsx` | `/student-dashboard/payment-history` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/referencesHub.jsx` | `/student-dashboard/references-hub` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/scholarshipStatus.jsx` | `/student-dashboard/scholarship-status` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/sectionsPlanner.jsx` | `/student-dashboard/sections-planner` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/studentAcademy.jsx` | `/student-dashboard/student-academy` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/subjectMarks.jsx` | `/student-dashboard/subject-marks` | `MOCK` | No | No | Yes | Yes | Tier C | Hardcoded mock data / local state only |
| `student/submissionStatus.jsx` | `/student-dashboard/submission-status` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/timetable.jsx` | `/student-dashboard/timetable` | `REAL` | Yes | Yes | Yes | Yes | Tier A | None (Verified in Sprint) |
| `student/transportTracking.jsx` | `/student-dashboard/transport-tracking` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
| `student/weeklyExams.jsx` | `/student-dashboard/weekly-exams` | `MOCK` | No | No | No | Yes | Tier C | Hardcoded mock data / local state only |
