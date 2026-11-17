# EduFlowAI Sprint Page Tiering

## Overview
This document categorizes all 196 pages in EduFlowAI into three explicit tiers according to the Anti-Faking and Ground-Truth rules:
- **Tier A (Pilot & Demo Core — Target 20–25 functional pages):** Guaranteed end-to-end functionality backed by real API endpoints, real write mutations, passing integration/unit tests with MSW or supertest, loading/error states, and role guards.
- **Tier B (Stretch Pages — Target 30–40 pages):** Features with partial backend integration or write capability scheduled for hardening as time permits.
- **Tier C (The Rest — ~135 pages):** Honestly labeled as unverified / presentation mock / static renders until backend endpoints and test suites are developed.

---

## Tier A: The Demo & Pilot Core (25 Pages)

### 1. Already Verified & Functional (10 pages + 7 subcomponents)
| Page | Route | Backend Flow | Status |
|---|---|---|---|
| `admin/AcademicCalendarPage.jsx` | `/admin-dashboard/calendar` | `GET/POST/PUT/DELETE /api/calendar` | REAL (100% verified) |
| `admin/Calendar*` (7 subcomponents) | `/admin-dashboard/calendar` | Modularized calendar tabs | REAL (100% verified) |
| `hod/HodCalendarPage.jsx` | `/hod-dashboard/calendar` | `GET /api/calendar` (HOD view) | REAL (100% verified) |
| `faculty/attendanceEntry.jsx` | `/faculty-dashboard/attendance-entry` | `POST /api/attendance` | REAL (100% verified) |
| `student/attendanceOverview.jsx` | `/student-dashboard/attendance` | `GET /api/attendance` | REAL (100% verified) |
| `admin/AttendanceIntegrationPage.jsx`| `/admin-dashboard/attendance` | `GET /api/attendance/audit` | REAL (100% verified) |
| `admin/attendanceAudit.jsx` | `/admin-dashboard/attendance-audit` | `GET /api/attendance/audit` | REAL (100% verified) |
| `admin/WhatsAppAttendancePage.jsx` | `/admin-dashboard/whatsapp-attendance`| `POST /api/attendance/whatsapp` | REAL (100% verified) |
| `student/GrievancePage.jsx` | `/student-dashboard/grievances` | `GET/POST /api/grievances` | REAL (100% verified) |
| `admin/GrievanceManagementPage.jsx` | `/admin-dashboard/grievances` | `GET/PATCH /api/grievances` | REAL (100% verified) |
| `student/DeanEscalationPage.jsx` | `/student-dashboard/dean-escalation` | `GET/POST /api/dean/escalations` | REAL (100% verified) |

### 2. Tier A Target Execution List (All 16 Priority Pages Completed & Verified)
| # | Page | Route | Backend Flow | Status & Verification |
|---|---|---|---|---|
| 1 | `common/ProfilePage.jsx` | `/profile` | `GET/PUT /api/user/profile` | REAL (5/5 tests passing in `ProfilePage.test.jsx`) |
| 2 | `public/LoginPage.jsx` | `/login` | `POST /api/auth/login` | REAL (Verified in `LoginPage.test.jsx`, `login.dean.test.jsx`) |
| 3 | `public/InstitutionRegister.jsx` | `/register-institution` | `POST /api/v1/institutions/register` | REAL (Verified in `InstitutionRegister.test.jsx`) |
| 4 | `public/ForgotPasswordPage.jsx` | `/forgot-password` | `POST /api/v1/auth/forgot-password` | REAL (3/3 tests passing in `ForgotPasswordPage.test.jsx`) |
| 5 | `public/OnboardingPage.jsx` | `/onboarding` | `POST /api/v1/onboarding/*` | REAL (3/3 tests passing in `OnboardingPage.test.jsx`) |
| 6 | `admin/studentManagement.jsx` | `/admin-dashboard/student-management` | `GET/POST/DELETE /api/admin/students` | REAL (5/5 tests passing in `studentManagement.test.jsx`) |
| 7 | `faculty/marksEntry.jsx` | `/faculty-dashboard/marks-entry` | `GET/POST /api/v1/academics/marks` | REAL (5/5 tests passing in `marksEntry.test.jsx`) |
| 8 | `student/feeStatus.jsx` | `/student-dashboard/fee-status` | `GET/POST /api/v1/payments/*` | REAL (4/4 tests passing in `feeStatus.test.jsx`) |
| 9 | `parent/feeDashboard.jsx` | `/parent-dashboard/fee-dashboard` | `GET/POST /api/v1/payments/*` | REAL (4/4 tests passing in `feeDashboard.test.jsx`) |
| 10 | `hod/LeaveApprovalsPage.jsx` | `/hod-dashboard/leave-approvals` | `GET/PATCH /api/v1/leave/*` | REAL (5/5 tests passing in `LeaveApprovalsPage.test.jsx`) |
| 11 | `finance/PayrollGenerationPage.jsx` | `/finance-dashboard/payroll` | `GET/POST /api/v1/finance/payslips` | REAL (4/4 tests passing in `PayrollGenerationPage.test.jsx`) |
| 12 | `admin/InstitutionSettingsPage.jsx` | `/admin-dashboard/settings` | `GET/PATCH /api/v1/institution/settings` | REAL (4/4 tests passing in `InstitutionSettingsPage.test.jsx`) |
| 13 | `faculty/assignmentCreator.jsx` | `/faculty-dashboard/assignment-creator` | `GET/POST /api/v1/academics/assignments` | REAL (4/4 tests passing in `assignmentCreator.test.jsx`) |
| 14 | `student/assignments.jsx` | `/student-dashboard/assignments` | `GET/POST /api/v1/academics/assignments/*` | REAL (4/4 tests passing in `assignments.test.jsx`) |
| 15 | `student/timetable.jsx` | `/student-dashboard/timetable` | `GET /api/v1/academics/timetable` | REAL (3/3 tests passing in `timetable.test.jsx`) |
| 16 | `parent/childAttendance.jsx` | `/parent-dashboard/child-attendance` | `GET /api/v1/parent/overview` & `/v1/leave/apply` | REAL (4/4 tests passing in `childAttendance.test.jsx`) |

---

## Tier B: Stretch Pages & Complete Subsystems (33 Verified Pages)

### 1. Completed & Verified Tier B Pages
| # | Page | Route | Backend Flow | Status & Verification |
|---|---|---|---|---|
| 1 | `admin/BudgetTrackingPage.jsx` | `/admin-dashboard/budget` | `GET/POST /api/v1/finance/budgets`, `GET/POST /api/v1/finance/expenses` | REAL (4/4 tests passing in `BudgetTrackingPage.test.jsx`) |
| 2 | `admin/LibraryManagementPage.jsx` | `/admin-dashboard/library` | `GET /v1/library/books`, `GET /v1/library/issues`, `POST /v1/library/issue`, `POST /v1/library/return` | REAL (4/4 tests passing in `LibraryManagementPage.test.jsx`) |
| 3 | `student/LeaveApplicationPage.jsx` | `/student-dashboard/leave` | `GET /v1/leave/requests`, `POST /v1/leave/apply` | REAL (4/4 tests passing in `LeaveApplicationPage.test.jsx`) |
| 4 | `admin/HostelWardenPage.jsx` | `/admin-dashboard/hostel` | `GET /v1/hostel/allocations`, `GET /v1/hostel/gate-logs`, `POST /v1/hostel/allocate`, `POST /v1/hostel/gate-pass` | REAL (4/4 tests passing in `HostelWardenPage.test.jsx`) |
| 5 | `admin/ScholarshipManagementPage.jsx` | `/admin-dashboard/scholarships` | `GET /v1/scholarships`, `POST /v1/scholarships/apply`, `PATCH /v1/scholarships/:id/verify` | REAL (5/5 tests passing in `ScholarshipManagementPage.test.jsx`) |
| 6 | `admin/PlacementDrivesPage.jsx` | `/admin-dashboard/placement-drives` | `GET /v1/placement/drives`, `POST /v1/placement/drives`, `POST /v1/placement/drives/:id/apply` | REAL (4/4 tests passing in `PlacementDrivesPage.test.jsx`) |
| 7 | `student/OnlineExamPage.jsx` | `/student-dashboard/online-exam` | `GET /v1/exams/online`, `POST /v1/exams/online/:id/submit`, `POST /v1/exams/online/:id/violation` | REAL (4/4 tests passing in `OnlineExamPage.test.jsx`) |
| 8 | `student/StudentMockTestPage.jsx` | `/student-dashboard/mock-tests` | `GET /v1/placement/mock-tests`, `POST /v1/placement/mock-tests/:id/submit` | REAL (3/3 tests passing in `StudentMockTestPage.test.jsx`) |
| 9 | `admin/SupportTicketsPage.jsx` | `/admin-dashboard/support-tickets` | `GET /v1/support/tickets`, `POST /v1/support/tickets`, `PATCH /v1/support/tickets/:id` | REAL (5/5 tests passing in `SupportTicketsPage.test.jsx`) |
| 10 | `public/ServicesPage.jsx` | `/services` | Dynamic AI automation services catalog, pilot inquiries, category filters | REAL (3/3 tests passing in `ServicesPage.test.jsx`) |
| 11 | `public/SignupPage.jsx` | `/signup` | Multi-step institution onboarding registration flow | REAL (2/2 tests passing in `SignupPage.test.jsx`) |
| 12 | `parent/parentNotices.jsx` | `/parent-dashboard/parent-notices` | `GET /v1/parent/overview`, `POST /v1/parents/multilingual-notice` | REAL (3/3 tests passing in `parentNotices.test.jsx`) |
| 13 | `parent/ptmBooking.jsx` | `/parent-dashboard/ptm-booking` | `GET /v1/parent/overview`, `POST /v1/parents/ptm-slot` | REAL (3/3 tests passing in `ptmBooking.test.jsx`) |
| 14 | `parent/leaveRequests.jsx` | `/parent-dashboard/leave-requests` | `GET /v1/leave/requests`, `POST /v1/parents/hostel-outing-leave` | REAL (3/3 tests passing in `parentLeaveRequests.test.jsx`) |
| 15 | `parent/marksProgress.jsx` | `/parent-dashboard/marks-progress` | `GET /v1/parent/overview`, `GET /v1/academics/marks` | REAL (3/3 tests passing in `parentMarksProgress.test.jsx`) |
| 16 | `parent/healthRecords.jsx` | `/parent-dashboard/health-records` | `GET /v1/parent/overview`, `POST /v1/parents/dispatch-alert` | REAL (3/3 tests passing in `parentHealthRecords.test.jsx`) |
| 17 | `parent/scholarshipView.jsx` | `/parent-dashboard/scholarship-view` | `GET /v1/scholarships`, `POST /v1/scholarships/apply` | REAL (3/3 tests passing in `parentScholarshipView.test.jsx`) |
| 18 | `parent/profileSettings.jsx` | `/parent-dashboard/profile-settings` | `GET/PUT /api/user/profile`, `GET /v1/parent/overview` | REAL (3/3 tests passing in `parentProfileSettings.test.jsx`) |
| 19 | `admin/facultyManagement.jsx` | `/admin-dashboard/faculty-management` | `GET/POST /api/admin/faculty`, `PUT /api/admin/faculty/:id` | REAL (3/3 tests passing in `facultyManagement.test.jsx`) |
| 20 | `admin/feeCollection.jsx` | `/admin-dashboard/fee-collection` | `GET/POST /api/admin/fees` | REAL (3/3 tests passing in `feeCollection.test.jsx`) |
| 21 | `admin/hostelAllocation.jsx` | `/admin-dashboard/hostel-allocation` | `GET /api/admin/hostel`, `POST /api/admin/hostel/allocate`, `POST /api/admin/hostel/evict` | REAL (3/3 tests passing in `hostelAllocation.test.jsx`) |
| 22 | `admin/examSetup.jsx` | `/admin-dashboard/exam-setup` | `GET/POST/DELETE /api/admin/exams` | REAL (3/3 tests passing in `examSetup.test.jsx`) |
| 23 | `admin/resultPublishing.jsx` | `/admin-dashboard/result-publishing` | `GET /api/admin/results`, `POST /api/admin/results/publish`, `POST /api/admin/results/retract`, `POST /api/admin/results/moderate` | REAL (3/3 tests passing in `resultPublishing.test.jsx`) |
| 24 | `admin/parentAccounts.jsx` | `/admin-dashboard/parent-accounts` | `GET/POST /api/admin/parents`, `PUT /api/admin/parents/:id/status`, `POST /api/admin/parents/dispatch-alert` | REAL (3/3 tests passing in `parentAccounts.test.jsx`) |
| 25 | `admin/payrollPreview.jsx` | `/admin-dashboard/payroll-preview` | `GET/POST /api/admin/payroll` | REAL (3/3 tests passing in `payrollPreview.test.jsx`) |
| 26 | `admin/timetableGeneration.jsx` | `/admin-dashboard/timetable-generation` | `GET /api/admin/timetable`, `POST /api/admin/timetable/slots` | REAL (3/3 tests passing in `timetableGeneration.test.jsx`) |
| 27 | `admin/backupManagement.jsx` | `/admin-dashboard/backup-management` | `GET /api/backup/status`, `POST /api/backup/snapshot` | REAL (3/3 tests passing in `backupManagement.test.jsx`) |
| 28 | `student/libraryAccount.jsx` | `/student-dashboard/library-account` | `GET /v1/library/issues`, `GET /v1/library/books`, `POST /v1/library/return`, `POST /v1/library/issue` | REAL (3/3 tests passing in `studentLibraryAccount.test.jsx`) |
| 29 | `student/hostelInfo.jsx` | `/student-dashboard/hostel-info` | `GET /v1/hostel/allocations`, `POST /v1/hostel/gate-pass`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `studentHostelInfo.test.jsx`) |
| 30 | `student/scholarshipStatus.jsx` | `/student-dashboard/scholarship-status` | `GET /v1/scholarships`, `POST /v1/scholarships/apply` | REAL (3/3 tests passing in `studentScholarshipStatus.test.jsx`) |
| 31 | `student/subjectMarks.jsx` | `/student-dashboard/subject-marks` | `GET /v1/academics/marks`, `POST /v1/grievances` | REAL (3/3 tests passing in `studentSubjectMarks.test.jsx`) |
| 32 | `faculty/classTimetable.jsx` | `/faculty-dashboard/class-timetable` | `GET /api/admin/timetable`, `POST /api/admin/timetable/slots` | REAL (3/3 tests passing in `facultyClassTimetable.test.jsx`) |
| 33 | `parent/teacherCommunication.jsx` | `/parent-dashboard/teacher-communication` | `GET /v1/parent/chat`, `POST /v1/parent/chat` | REAL (3/3 tests passing in `parentTeacherCommunication.test.jsx`) |
| 34 | `faculty/leaveApplication.jsx` | `/faculty-dashboard/leave-application` | `GET /v1/leave/requests`, `POST /v1/leave/apply` | REAL (3/3 tests passing in `facultyLeaveApplication.test.jsx`) |
| 35 | `faculty/lessonPlanner.jsx` | `/faculty-dashboard/lesson-planner` | `GET/POST /v1/academics/assignments` | REAL (3/3 tests passing in `facultyLessonPlanner.test.jsx`) |
| 36 | `faculty/syllabusTracker.jsx` | `/faculty-dashboard/syllabus-tracker` | `GET /v1/academics/marks`, `POST /v1/academics/assignments` | REAL (3/3 tests passing in `facultySyllabusTracker.test.jsx`) |
| 37 | `faculty/mentoringLog.jsx` | `/faculty-dashboard/mentoring-log` | `GET/POST /v1/parent/chat` | REAL (3/3 tests passing in `facultyMentoringLog.test.jsx`) |
| 38 | `faculty/departmentNotices.jsx` | `/faculty-dashboard/department-notices` | `GET /v1/parent/overview`, `POST /v1/parents/multilingual-notice` | REAL (3/3 tests passing in `facultyDepartmentNotices.test.jsx`) |
| 39 | `faculty/examInvigilation.jsx` | `/faculty-dashboard/exam-invigilation` | `GET /api/admin/exams`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `facultyExamInvigilation.test.jsx`) |
| 40 | `faculty/parentMessaging.jsx` | `/faculty-dashboard/parent-messaging` | `GET/POST /v1/parent/chat` | REAL (3/3 tests passing in `facultyParentMessaging.test.jsx`) |
| 41 | `faculty/questionBankUpload.jsx` | `/faculty-dashboard/question-bank-upload` | `GET /v1/exams/online`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `facultyQuestionBankUpload.test.jsx`) |
| 42 | `student/examSchedule.jsx` | `/student-dashboard/exam-schedule` | `GET /api/admin/exams`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `studentExamSchedule.test.jsx`) |
| 43 | `student/paymentHistory.jsx` | `/student-dashboard/payment-history` | `GET /api/admin/fees`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `studentPaymentHistory.test.jsx`) |
| 44 | `student/submissionStatus.jsx` | `/student-dashboard/submission-status` | `GET/POST /v1/academics/assignments/*` | REAL (3/3 tests passing in `studentSubmissionStatus.test.jsx`) |
| 45 | `student/digitalMaterials.jsx` | `/student-dashboard/digital-materials` | `GET /v1/library/books`, `POST /v1/library/issue` | REAL (3/3 tests passing in `studentDigitalMaterials.test.jsx`) |
| 46 | `student/labBookings.jsx` | `/student-dashboard/lab-bookings` | `GET/POST /v1/support/tickets` | REAL (3/3 tests passing in `studentLabBookings.test.jsx`) |
| 47 | `student/CourseFeedbackPage.jsx` | `/student-dashboard/course-feedback` | `GET /v1/academics/marks`, `POST /v1/grievances` | REAL (3/3 tests passing in `studentCourseFeedback.test.jsx`) |
| 48 | `parent/childTracking.jsx` | `/parent-dashboard/child-tracking` | `GET /api/v1/network/presence/student`, `GET/POST /v1/parent/*` | REAL (3/3 tests passing in `parentChildTracking.test.jsx`) |
| 49 | `parent/dailyHomework.jsx` | `/parent-dashboard/daily-homework` | `GET /v1/academics/assignments`, `POST /v1/parent/chat` | REAL (3/3 tests passing in `parentDailyHomework.test.jsx`) |
| 50 | `parent/dueAlerts.jsx` | `/parent-dashboard/due-alerts` | `GET /api/admin/fees`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `parentDueAlerts.test.jsx`) |
| 51 | `parent/examCalendar.jsx` | `/parent-dashboard/exam-calendar` | `GET /api/admin/exams`, `POST /v1/support/tickets` | REAL (3/3 tests passing in `parentExamCalendar.test.jsx`) |
| 52 | `parent/disciplineAlerts.jsx` | `/parent-dashboard/discipline-alerts` | `GET /v1/parent/overview`, `POST /v1/parent/chat` | REAL (3/3 tests passing in `parentDisciplineAlerts.test.jsx`) |
| 53 | `admin/admissionsPipeline.jsx` | `/admin-dashboard/admissions-pipeline` | `GET /v1/admissions`, `POST /v1/admissions/apply` | REAL (3/3 tests passing in `adminAdmissionsPipeline.test.jsx`) |

### 2. Remaining Tier B Candidates
Pages with existing partial API clients or write capabilities that require additional integration tests or endpoint alignment:
- `admin/BulkDataImportPage.jsx`
- `admin/BulkStudentImportPage.jsx`
- `admin/CompliancePage.jsx`
- `admin/CurriculumMappingPage.jsx`
- `admin/FeeReminderPage.jsx`
- `admin/LibraryScannerPage.jsx`
- `admin/NaacDashboardPage.jsx`
- `admin/NirfDashboardPage.jsx`
- `admin/ProcurementPage.jsx`
- `admin/StaffManagementPage.jsx`
- `admin/SystemHealthPage.jsx`
- `admin/UPICollectionPage.jsx`
- `faculty/AttendanceAnalyticsPage.jsx`
- `faculty/ExamQuestionGeneratorPage.jsx`
- `faculty/FacultyWalletPage.jsx`
- `faculty/PlagiarismCheckerPage.jsx`
- `faculty/PodcastStudioPage.jsx`
- `faculty/SpeedGraderPage.jsx`
- `faculty/StudentEscalationsPage.jsx`
- `hod/FacultyAppraisalPage.jsx`
- `hod/HodDashboardPage.jsx`
- `hod/StaffManagementPage.jsx`
- `student/AdaptiveLearningPage.jsx`
- `student/CertificatePage.jsx`
- `student/CredentialWalletPage.jsx`
- `student/DigitalIdCard.jsx`

---

## Tier C: The Rest (~136 Pages) — Honest "Renders Only"
Pages that currently render static fixtures, mock data, or placeholders. See `docs/tier-c-blockers.md` for the explicit list of missing backend routes and blockers.
