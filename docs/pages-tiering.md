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

## Tier B: Stretch Pages (35 Pages)

### 1. Completed & Verified Tier B Pages (9 Priority Pages Fully Verified)
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
