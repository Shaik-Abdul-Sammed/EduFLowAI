# Tier C Pages Blockers & Missing Endpoints

Per the Anti-Faking rule: pages that lack real backend routes, real persistence, or end-to-end tests are kept in Tier C. Fake fetches or hardcoded client fixtures are strictly forbidden.

## Missing Backend Capabilities & Endpoints for Tier C Pages

| Module / Area | Impacted Pages | Missing Endpoints / Capabilities |
|---|---|---|
| **Student Preparation & Tests** | `student/jeeMainsPrep.jsx`, `student/neetPrep.jsx`, `student/weeklyExams.jsx`, `student/mockTests.jsx` | `/api/exam-engine/questions`, `/api/exam-engine/attempts`, `/api/exam-engine/results` |
| **Student Academics & Materials**| `student/digitalMaterials.jsx`, `student/mpcCourses.jsx`, `student/bipcCourses.jsx`, `student/mbipcCourses.jsx`, `student/studentAcademy.jsx` | `/api/lms/courses`, `/api/lms/materials/download`, `/api/lms/stream` |
| **Student Facilities & Services** | `student/hostelInfo.jsx`, `student/transportTracking.jsx`, `student/labBookings.jsx`, `student/libraryAccount.jsx` | `/api/facilities/hostel/rooms`, `/api/transport/gps-stream`, `/api/facilities/lab-slots`, `/api/library/issued-books` |
| **Student Mentorship & Connect** | `student/mentorConnect.jsx`, `student/WellnessCompanionPage.jsx`, `student/sectionsPlanner.jsx` | `/api/mentorship/chat`, `/api/wellness/checkin`, `/api/academics/sections` |
| **Faculty Course Delivery** | `faculty/syllabusTracker.jsx`, `faculty/lessonPlanner.jsx`, `faculty/courseOutcomes.jsx`, `faculty/questionBank.jsx` | `/api/curriculum/syllabus/progress`, `/api/curriculum/lesson-plans`, `/api/academics/obe/outcomes`, `/api/questions/repository` |
| **Faculty Mentoring & Parent CRM** | `faculty/menteeProgress.jsx`, `faculty/parentMessaging.jsx`, `faculty/leaveRequests.jsx` | `/api/faculty/mentees`, `/api/messaging/parents`, `/api/leaves/faculty-apply` |
| **Parent Portal Features** | `parent/busTracking.jsx`, `parent/parentConsent.jsx`, `parent/teacherChat.jsx`, `parent/reportCard.jsx` | `/api/transport/route-live`, `/api/consents/sign`, `/api/messaging/threads`, `/api/academics/report-cards` |
| **Admin Operations & Audits** | `admin/degreeAudit.jsx`, `admin/inventoryTracker.jsx`, `admin/alumniNetwork.jsx`, `admin/busRoutePlanner.jsx` | `/api/audit/degrees/eligibility`, `/api/procurement/inventory`, `/api/alumni/members`, `/api/transport/routes` |
| **Staff & Campus Facilities** | `staff/gatePass.jsx`, `staff/maintenanceRequests.jsx`, `staff/inventoryDesk.jsx` | `/api/security/gatepass`, `/api/facilities/tickets`, `/api/inventory/log` |

Until these backend services and database models are provisioned with tested CRUD handlers, these pages remain honestly classified as Tier C (Presentation Only).
