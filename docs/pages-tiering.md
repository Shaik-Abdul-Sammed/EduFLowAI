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
Pages with existing partial API clients or write capabilities that require additional integration tests or endpoint alignment:
- `admin/BudgetTrackingPage.jsx`
- `admin/BulkDataImportPage.jsx`
- `admin/BulkStudentImportPage.jsx`
- `admin/CompliancePage.jsx`
- `admin/CurriculumMappingPage.jsx`
- `admin/FeeReminderPage.jsx`
- `admin/HostelWardenPage.jsx`
- `admin/LibraryManagementPage.jsx`
- `admin/LibraryScannerPage.jsx`
- `admin/NaacDashboardPage.jsx`
- `admin/NirfDashboardPage.jsx`
- `admin/PlacementDrivesPage.jsx`
- `admin/ProcurementPage.jsx`
- `admin/ScholarshipManagementPage.jsx`
- `admin/StaffManagementPage.jsx`
- `admin/SupportTicketsPage.jsx`
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
- `student/LeaveApplicationPage.jsx`
- `student/OnlineExamPage.jsx`
- `student/StudentMockTestPage.jsx`

---

## Tier C: The Rest (~136 Pages) — Honest "Renders Only"
Pages that currently render static fixtures, mock data, or placeholders. See `docs/tier-c-blockers.md` for the explicit list of missing backend routes and blockers.
