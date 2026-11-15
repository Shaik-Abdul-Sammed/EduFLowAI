# EduFlow AI — Route Map

Human-readable table of all routes grouped by role and subsystem.

## Public & Guest Routes (`public`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/about` | `AboutPage` | `public/AboutPage.jsx` | No (Public) |
| `/apply` | `OnlineAdmissionPage` | `public/OnlineAdmissionPage.jsx` | No (Public) |
| `/docs` | `DocsPage` | `public/DocsPage.jsx` | No (Public) |
| `/dpa` | `DataProcessingAgreementPage` | `public/DataProcessingAgreementPage.jsx` | No (Public) |
| `/entry` | `EntryPage` | `public/EntryPage.jsx` | No (Public) |
| `/for-colleges` | `LeadIntakePage` | `public/LeadIntakePage.jsx` | No (Public) |
| `/forgot-password` | `ForgotPasswordPage` | `public/ForgotPasswordPage.jsx` | No (Public) |
| `/help` | `HelpCenterPage` | `public/HelpCenterPage.jsx` | No (Public) |
| `/how-attendance-works` | `AttendanceExplainerPage` | `public/AttendanceExplainerPage.jsx` | No (Public) |
| `/login` | `LoginPage` | `public/LoginPage.jsx` | No (Public) |
| `/onboarding` | `OnboardingPage` | `public/OnboardingPage.jsx` | No (Public) |
| `/privacy` | `PrivacyPolicyPage` | `public/PrivacyPolicyPage.jsx` | No (Public) |
| `/r/:token` | `PublicReportViewer` | `public/PublicReportViewer.jsx` | No (Public) |
| `/register-institution` | `InstitutionRegister` | `public/InstitutionRegister.jsx` | No (Public) |
| `/services` | `ServicesPage` | `public/ServicesPage.jsx` | No (Public) |
| `/signup` | `InstitutionRegister` | `public/InstitutionRegister.jsx` | No (Public) |
| `/signup (alias for InstitutionRegister)` | `SignupPage` | `public/SignupPage.jsx` | No (Public) |
| `/terms` | `TermsOfServicePage` | `public/TermsOfServicePage.jsx` | No (Public) |
| `/welcome` | `EntryPage` | `public/EntryPage.jsx` | No (Public) |
| `/why-eduflow` | `WhyEduFlowPage` | `public/WhyEduFlowPage.jsx` | No (Public) |

## Common & Shared Authenticated Routes (`common`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/profile` | `ProfilePage` | `common/ProfilePage.jsx` | Yes (`common`) |
| `/research-workspace` | `ResearchWorkspacePage` | `common/ResearchWorkspacePage.jsx` | Yes (`common`) |
| `/virtual-classroom` | `VirtualClassroomPage` | `common/VirtualClassroomPage.jsx` | Yes (`common`) |
| `/whiteboard` | `WhiteboardPage` | `common/WhiteboardPage.jsx` | Yes (`common`) |

## Admin Dashboard & Management Routes (`admin`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/admin-dashboard/admissions-pipeline` | `admissionsPipeline` | `admin/admissionsPipeline.jsx` | Yes (`admin`) |
| `/admin-dashboard/analytics-center` | `analyticsCenter` | `admin/analyticsCenter.jsx` | Yes (`admin`) |
| `/admin-dashboard/attendance` | `AttendanceIntegrationPage` | `admin/AttendanceIntegrationPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/attendance-audit` | `attendanceAudit` | `admin/attendanceAudit.jsx` | Yes (`admin`) |
| `/admin-dashboard/audit-logs` | `auditLogs` | `admin/auditLogs.jsx` | Yes (`admin`) |
| `/admin-dashboard/backup-management` | `backupManagement` | `admin/backupManagement.jsx` | Yes (`admin`) |
| `/admin-dashboard/budget` | `BudgetTrackingPage` | `admin/BudgetTrackingPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/bulk-data-import` | `BulkDataImportPage` | `admin/BulkDataImportPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/bulk-import` | `BulkStudentImportPage` | `admin/BulkStudentImportPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/calendar` | `AcademicCalendarPage` | `admin/AcademicCalendarPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/compliance` | `CompliancePage` | `admin/CompliancePage.jsx` | Yes (`admin`) |
| `/admin-dashboard/curriculum-mapping` | `CurriculumMappingPage` | `admin/CurriculumMappingPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/degree-audit` | `DegreeAuditPage` | `admin/DegreeAuditPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/exam-setup` | `examSetup` | `admin/examSetup.jsx` | Yes (`admin`) |
| `/admin-dashboard/faculty-management` | `facultyManagement` | `admin/facultyManagement.jsx` | Yes (`admin`) |
| `/admin-dashboard/fee-collection` | `feeCollection` | `admin/feeCollection.jsx` | Yes (`admin`) |
| `/admin-dashboard/fee-reminders` | `FeeReminderPage` | `admin/FeeReminderPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/grievances` | `GrievanceManagementPage` | `admin/GrievanceManagementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/hostel-allocation` | `hostelAllocation` | `admin/hostelAllocation.jsx` | Yes (`admin`) |
| `/admin-dashboard/hostel-management` | `HostelWardenPage` | `admin/HostelWardenPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/insights` | `InsightsDashboardPage` | `admin/InsightsDashboardPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/insights/:domain` | `DomainInsightPage` | `admin/insights/DomainInsightPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/leads` | `LeadManagementPage` | `admin/LeadManagementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/library` | `LibraryManagementPage` | `admin/LibraryManagementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/library-scanner` | `LibraryScannerPage` | `admin/LibraryScannerPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/live-data` | `LiveDataPage` | `admin/LiveDataPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/naac-ai-analysis` | `NaacAiAnalysisPage` | `admin/NaacAiAnalysisPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/naac-dashboard` | `NaacDashboardPage` | `admin/NaacDashboardPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/nirf` | `NirfDashboardPage` | `admin/NirfDashboardPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/onboarding` | `OnboardingWizardPage` | `admin/OnboardingWizardPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/parent-accounts` | `parentAccounts` | `admin/parentAccounts.jsx` | Yes (`admin`) |
| `/admin-dashboard/payroll-preview` | `payrollPreview` | `admin/payrollPreview.jsx` | Yes (`admin`) |
| `/admin-dashboard/placement-drives` | `PlacementDrivesPage` | `admin/PlacementDrivesPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/portal` | `PortalConnectionPage` | `admin/PortalConnectionPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/procurement` | `ProcurementPage` | `admin/ProcurementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/report-delivery` | `ReportDeliveryPage` | `admin/ReportDeliveryPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/result-publishing` | `resultPublishing` | `admin/resultPublishing.jsx` | Yes (`admin`) |
| `/admin-dashboard/role-permissions` | `rolePermissions` | `admin/rolePermissions.jsx` | Yes (`admin`) |
| `/admin-dashboard/scholarships` | `ScholarshipManagementPage` | `admin/ScholarshipManagementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/settings` | `InstitutionSettingsPage` | `admin/InstitutionSettingsPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/sso-config` | `SSOConfigPage` | `admin/SSOConfigPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/staff` | `StaffManagementPage` | `admin/StaffManagementPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/student-management` | `studentManagement` | `admin/studentManagement.jsx` | Yes (`admin`) |
| `/admin-dashboard/support-tickets` | `SupportTicketsPage` | `admin/SupportTicketsPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/system-health` | `SystemHealthPage` | `admin/SystemHealthPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/timetable-generation` | `timetableGeneration` | `admin/timetableGeneration.jsx` | Yes (`admin`) |
| `/admin-dashboard/upi-collection` | `UPICollectionPage` | `admin/UPICollectionPage.jsx` | Yes (`admin`) |
| `/admin-dashboard/user-tracking` | `userTracking` | `admin/userTracking.jsx` | Yes (`admin`) |
| `/admin-dashboard/whatsapp-attendance` | `WhatsAppAttendancePage` | `admin/WhatsAppAttendancePage.jsx` | Yes (`admin`) |
| `/admin/bulk-data-import` | `BulkDataImportPage` | `admin/BulkDataImportPage.jsx` | Yes (`admin`) |
| `/curriculum-mapping` | `CurriculumMappingPage` | `admin/CurriculumMappingPage.jsx` | Yes (`admin`) |
| `/finance-dashboard/budget` | `BudgetTrackingPage` | `admin/BudgetTrackingPage.jsx` | Yes (`admin`) |
| `/finance-dashboard/fee-reminders` | `FeeReminderPage` | `admin/FeeReminderPage.jsx` | Yes (`admin`) |
| `/finance-dashboard/invoices` | `InvoiceGeneratorPage` | `admin/InvoiceGeneratorPage.jsx` | Yes (`admin`) |
| `/finance-dashboard/scholarships` | `ScholarshipManagementPage` | `admin/ScholarshipManagementPage.jsx` | Yes (`admin`) |
| `/finance-dashboard/upi-collection` | `UPICollectionPage` | `admin/UPICollectionPage.jsx` | Yes (`admin`) |
| `/hod-dashboard/grievances` | `GrievanceManagementPage` | `admin/GrievanceManagementPage.jsx` | Yes (`admin`) |
| `/library-scanner` | `LibraryScannerPage` | `admin/LibraryScannerPage.jsx` | Yes (`admin`) |
| `/staff-dashboard/library` | `LibraryManagementPage` | `admin/LibraryManagementPage.jsx` | Yes (`admin`) |

## Faculty Dashboard & Grading Routes (`faculty`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/faculty-dashboard/academic-analytics` | `academicAnalytics` | `faculty/academicAnalytics.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/assignment-creator` | `assignmentCreator` | `faculty/assignmentCreator.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/attendance-entry` | `attendanceEntry` | `faculty/attendanceEntry.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/class-timetable` | `classTimetable` | `faculty/classTimetable.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/department-notices` | `departmentNotices` | `faculty/departmentNotices.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/exam-invigilation` | `examInvigilation` | `faculty/examInvigilation.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/leave-application` | `leaveApplication` | `faculty/leaveApplication.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/lesson-planner` | `lessonPlanner` | `faculty/lessonPlanner.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/marks-entry` | `marksEntry` | `faculty/marksEntry.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/mentoring-log` | `mentoringLog` | `faculty/mentoringLog.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/parent-messaging` | `parentMessaging` | `faculty/parentMessaging.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/plagiarism-checker` | `PlagiarismCheckerPage` | `faculty/PlagiarismCheckerPage.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/podcast-studio` | `PodcastStudioPage` | `faculty/PodcastStudioPage.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/question-bank-upload` | `questionBankUpload` | `faculty/questionBankUpload.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/research-tracker` | `researchTracker` | `faculty/researchTracker.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/resource-repository` | `resourceRepository` | `faculty/resourceRepository.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/speed-grader` | `SpeedGraderPage` | `faculty/SpeedGraderPage.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/syllabus-tracker` | `syllabusTracker` | `faculty/syllabusTracker.jsx` | Yes (`faculty`) |
| `/faculty-dashboard/wallet` | `FacultyWalletPage` | `faculty/FacultyWalletPage.jsx` | Yes (`faculty`) |
| `/faculty-wallet` | `FacultyWalletPage` | `faculty/FacultyWalletPage.jsx` | Yes (`faculty`) |
| `/faculty/wallet` | `FacultyWalletPage` | `faculty/FacultyWalletPage.jsx` | Yes (`faculty`) |
| `/staff-dashboard/speed-grader` | `SpeedGraderPage` | `faculty/SpeedGraderPage.jsx` | Yes (`faculty`) |

## Student Dashboard & Learning Routes (`student`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/student-dashboard/adaptive-learning` | `AdaptiveLearningPage` | `student/AdaptiveLearningPage.jsx` | Yes (`student`) |
| `/student-dashboard/ar-scanner` | `ARScannerPage` | `student/ARScannerPage.jsx` | Yes (`student`) |
| `/student-dashboard/assignments` | `assignments` | `student/assignments.jsx` | Yes (`student`) |
| `/student-dashboard/attendance-overview` | `attendanceOverview` | `student/attendanceOverview.jsx` | Yes (`student`) |
| `/student-dashboard/bipc-courses` | `bipcCourses` | `student/bipcCourses.jsx` | Yes (`student`) |
| `/student-dashboard/certificates` | `CertificatePage` | `student/CertificatePage.jsx` | Yes (`student`) |
| `/student-dashboard/credentials` | `CredentialWalletPage` | `student/CredentialWalletPage.jsx` | Yes (`student`) |
| `/student-dashboard/digital-id` | `DigitalIdCard` | `student/DigitalIdCard.jsx` | Yes (`student`) |
| `/student-dashboard/digital-materials` | `digitalMaterials` | `student/digitalMaterials.jsx` | Yes (`student`) |
| `/student-dashboard/exam-schedule` | `examSchedule` | `student/examSchedule.jsx` | Yes (`student`) |
| `/student-dashboard/fee-status` | `feeStatus` | `student/feeStatus.jsx` | Yes (`student`) |
| `/student-dashboard/grievances` | `GrievancePage` | `student/GrievancePage.jsx` | Yes (`student`) |
| `/student-dashboard/hostel-info` | `hostelInfo` | `student/hostelInfo.jsx` | Yes (`student`) |
| `/student-dashboard/jee-mains-prep` | `jeeMainsPrep` | `student/jeeMainsPrep.jsx` | Yes (`student`) |
| `/student-dashboard/lab-bookings` | `labBookings` | `student/labBookings.jsx` | Yes (`student`) |
| `/student-dashboard/leaderboard` | `LeaderboardPage` | `student/LeaderboardPage.jsx` | Yes (`student`) |
| `/student-dashboard/leave-application` | `LeaveApplicationPage` | `student/LeaveApplicationPage.jsx` | Yes (`student`) |
| `/student-dashboard/library-account` | `libraryAccount` | `student/libraryAccount.jsx` | Yes (`student`) |
| `/student-dashboard/mbipc-courses` | `mbipcCourses` | `student/mbipcCourses.jsx` | Yes (`student`) |
| `/student-dashboard/mentor-connect` | `mentorConnect` | `student/mentorConnect.jsx` | Yes (`student`) |
| `/student-dashboard/mock-tests` | `StudentMockTestPage` | `student/StudentMockTestPage.jsx` | Yes (`student`) |
| `/student-dashboard/mpc-courses` | `mpcCourses` | `student/mpcCourses.jsx` | Yes (`student`) |
| `/student-dashboard/neet-prep` | `neetPrep` | `student/neetPrep.jsx` | Yes (`student`) |
| `/student-dashboard/online-exam` | `OnlineExamPage` | `student/OnlineExamPage.jsx` | Yes (`student`) |
| `/student-dashboard/payment-history` | `paymentHistory` | `student/paymentHistory.jsx` | Yes (`student`) |
| `/student-dashboard/references-hub` | `referencesHub` | `student/referencesHub.jsx` | Yes (`student`) |
| `/student-dashboard/scholarship-status` | `scholarshipStatus` | `student/scholarshipStatus.jsx` | Yes (`student`) |
| `/student-dashboard/sections-planner` | `sectionsPlanner` | `student/sectionsPlanner.jsx` | Yes (`student`) |
| `/student-dashboard/student-academy` | `studentAcademy` | `student/studentAcademy.jsx` | Yes (`student`) |
| `/student-dashboard/subject-marks` | `subjectMarks` | `student/subjectMarks.jsx` | Yes (`student`) |
| `/student-dashboard/submission-status` | `submissionStatus` | `student/submissionStatus.jsx` | Yes (`student`) |
| `/student-dashboard/timetable` | `timetable` | `student/timetable.jsx` | Yes (`student`) |
| `/student-dashboard/transport-tracking` | `transportTracking` | `student/transportTracking.jsx` | Yes (`student`) |
| `/student-dashboard/virtual-labs` | `VirtualLabsPage` | `student/VirtualLabsPage.jsx` | Yes (`student`) |
| `/student-dashboard/weekly-exams` | `weeklyExams` | `student/weeklyExams.jsx` | Yes (`student`) |
| `/student/certificates` | `CertificatePage` | `student/CertificatePage.jsx` | Yes (`student`) |

## Parent Dashboard & Student Monitoring Routes (`parent`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/parent-dashboard` | `ParentDashboardPage` | `parent/ParentDashboardPage.jsx` | Yes (`parent`) |
| `/parent-dashboard/child-attendance` | `childAttendance` | `parent/childAttendance.jsx` | Yes (`parent`) |
| `/parent-dashboard/child-tracking` | `childTracking` | `parent/childTracking.jsx` | Yes (`parent`) |
| `/parent-dashboard/daily-homework` | `dailyHomework` | `parent/dailyHomework.jsx` | Yes (`parent`) |
| `/parent-dashboard/discipline-alerts` | `disciplineAlerts` | `parent/disciplineAlerts.jsx` | Yes (`parent`) |
| `/parent-dashboard/due-alerts` | `dueAlerts` | `parent/dueAlerts.jsx` | Yes (`parent`) |
| `/parent-dashboard/exam-calendar` | `examCalendar` | `parent/examCalendar.jsx` | Yes (`parent`) |
| `/parent-dashboard/fee-dashboard` | `feeDashboard` | `parent/feeDashboard.jsx` | Yes (`parent`) |
| `/parent-dashboard/health-records` | `healthRecords` | `parent/healthRecords.jsx` | Yes (`parent`) |
| `/parent-dashboard/leave-requests` | `leaveRequests` | `parent/leaveRequests.jsx` | Yes (`parent`) |
| `/parent-dashboard/marks-progress` | `marksProgress` | `parent/marksProgress.jsx` | Yes (`parent`) |
| `/parent-dashboard/parent-notices` | `parentNotices` | `parent/parentNotices.jsx` | Yes (`parent`) |
| `/parent-dashboard/profile-settings` | `profileSettings` | `parent/profileSettings.jsx` | Yes (`parent`) |
| `/parent-dashboard/ptm-booking` | `ptmBooking` | `parent/ptmBooking.jsx` | Yes (`parent`) |
| `/parent-dashboard/scholarship-view` | `scholarshipView` | `parent/scholarshipView.jsx` | Yes (`parent`) |
| `/parent-dashboard/teacher-communication` | `teacherCommunication` | `parent/teacherCommunication.jsx` | Yes (`parent`) |

## Head of Department (HOD) Academic Governance Routes (`hod`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/admin-dashboard/faculty-appraisal` | `FacultyAppraisalPage` | `hod/FacultyAppraisalPage.jsx` | Yes (`hod`) |
| `/admin-dashboard/leave-approvals` | `LeaveApprovalsPage` | `hod/LeaveApprovalsPage.jsx` | Yes (`hod`) |
| `/hod-dashboard` | `HodDashboardPage` | `hod/HodDashboardPage.jsx` | Yes (`hod`) |
| `/hod-dashboard/calendar` | `HodCalendarPage` | `hod/HodCalendarPage.jsx` | Yes (`hod`) |
| `/hod-dashboard/faculty-appraisal` | `FacultyAppraisalPage` | `hod/FacultyAppraisalPage.jsx` | Yes (`hod`) |
| `/hod-dashboard/leave-approvals` | `LeaveApprovalsPage` | `hod/LeaveApprovalsPage.jsx` | Yes (`hod`) |
| `/hod-dashboard/staff` | `StaffManagementPage` | `hod/StaffManagementPage.jsx` | Yes (`hod`) |

## Non-Teaching Staff Operations Routes (`staff`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/staff-dashboard` | `StaffDashboardPage` | `staff/StaffDashboardPage.jsx` | Yes (`staff`) |

## Finance Officer & Bursar Governance Routes (`finance`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/admin-dashboard/payroll` | `PayrollGenerationPage` | `finance/PayrollGenerationPage.jsx` | Yes (`finance`) |
| `/finance-dashboard` | `FinanceDashboardPage` | `finance/FinanceDashboardPage.jsx` | Yes (`finance`) |
| `/finance-dashboard/payroll` | `PayrollGenerationPage` | `finance/PayrollGenerationPage.jsx` | Yes (`finance`) |

## AI Agents & Streaming Officers (`ai`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/ai-terminal` | `AITerminal` | `ai/AITerminal.jsx` | Yes (`ai`) |
| `/build-manager` | `BuildManager` | `ai/BuildManager.jsx` | Yes (`ai`) |
| `/digital-twin` | `DigitalTwinManager` | `ai/DigitalTwinManager.jsx` | Yes (`ai`) |
| `/officer/accreditation` | `AccreditationOfficer` | `ai/officers/AccreditationOfficer.jsx` | Yes (`ai`) |
| `/officer/admissions` | `AdmissionOfficer` | `ai/officers/AdmissionOfficer.jsx` | Yes (`ai`) |
| `/officer/finance` | `FinanceOfficer` | `ai/officers/FinanceOfficer.jsx` | Yes (`ai`) |
| `/officer/student-success` | `StudentSuccessOfficer` | `ai/officers/StudentSuccessOfficer.jsx` | Yes (`ai`) |
| `/officer/timetable` | `TimetableOfficer` | `ai/officers/TimetableOfficer.jsx` | Yes (`ai`) |
| `/officer/timetable/upload` | `TimetableUploadPage` | `ai/officers/TimetableUploadPage.jsx` | Yes (`ai`) |
| `/officers-dashboard` | `OfficersDashboard` | `ai/OfficersDashboard.jsx` | Yes (`ai`) |
| `/timetable/upload` | `TimetableUploadPage` | `ai/officers/TimetableUploadPage.jsx` | Yes (`ai`) |

## Demonstration & Sandbox Routes (`demo`)

| Route Path | Component Name | Source File | Protected? |
|---|---|---|---|
| `/demo/observe` | `ObservationMode` | `demo/ObservationMode.jsx` | No (Public) |

