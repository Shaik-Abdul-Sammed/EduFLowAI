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

### 2. Tier A Target Execution List (15 priority pages to make 100% real)
| # | Page | Route | Target Backend Flow | Action Planned |
|---|---|---|---|---|
| 1 | `common/ProfilePage.jsx` | `/profile` | `GET/PUT /api/auth/profile` | Real user read/update + test |
| 2 | `public/LoginPage.jsx` | `/login` | `POST /api/auth/login` | Real token auth + test |
| 3 | `public/InstitutionRegister.jsx` | `/register-institution` | `POST /api/auth/register-institution` | Real org onboard + test |
| 4 | `public/ForgotPasswordPage.jsx` | `/forgot-password` | `POST /api/auth/forgot-password` | Real password reset request |
| 5 | `public/OnboardingPage.jsx` | `/onboarding` | `POST /api/institution/onboarding` | Wizard state persistence |
| 6 | `admin/studentManagement.jsx` | `/admin-dashboard/student-management` | `GET/POST/PUT /api/students` | Real student CRUD |
| 7 | `faculty/marksEntry.jsx` | `/faculty-dashboard/marks-entry` | `GET/POST /api/marks` | Real grade submissions |
| 8 | `student/feeStatus.jsx` | `/student-dashboard/fee-status` | `GET /api/finance/fees` | Real fee dues & status |
| 9 | `parent/feeDashboard.jsx` | `/parent-dashboard/fee-dashboard` | `GET /api/finance/fees` | Real student fee breakdown |
| 10 | `hod/LeaveApprovalsPage.jsx` | `/hod-dashboard/leave-approvals` | `GET/PATCH /api/leaves` | Real approve/reject workflow |
| 11 | `finance/PayrollGenerationPage.jsx` | `/finance-dashboard/payroll` | `GET/POST /api/finance/payroll` | Real salary run processing |
| 12 | `admin/InstitutionSettingsPage.jsx` | `/admin-dashboard/settings` | `GET/PUT /api/institution/settings` | Real institution branding & config |
| 13 | `faculty/assignmentCreator.jsx` | `/faculty-dashboard/assignment-creator` | `POST /api/assignments` | Real homework publishing |
| 14 | `student/assignments.jsx` | `/student-dashboard/assignments` | `GET/POST /api/assignments` | Real submission workflow |
| 15 | `student/timetable.jsx` | `/student-dashboard/timetable` | `GET /api/timetable` | Real class schedule lookup |
| 16 | `parent/childAttendance.jsx` | `/parent-dashboard/child-attendance` | `GET /api/attendance/student/:id` | Real ward attendance tracking |

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
