# Attendance (Student ↔ Teacher ↔ Admin) Feature Audit

## 1. Files Touched
### Frontend
- `eduflow-core/web/src/pages/faculty/attendanceEntry.jsx` — Teacher attendance marking interface with session date, course code, section, status toggles (P/A/OD/L), and Bluetooth/QR simulation.
- `eduflow-core/web/src/pages/student/attendanceOverview.jsx` — Student attendance viewer showing overall percentage, subject-wise attendance (present/absent/late), monthly heatmap, and condonation risk warnings (<75%).
- `eduflow-core/web/src/pages/admin/attendanceAudit.jsx` — Administrative attendance audit ledger with section, faculty, and status filtering.
- `eduflow-core/web/src/pages/admin/AttendanceIntegrationPage.jsx` — Multi-portal ingestion, sample ingestion, parent notifications, and presence disputes.
- `eduflow-core/web/src/pages/admin/WhatsAppAttendancePage.jsx` — WhatsApp conversational attendance staging, message simulations, and confirmation queues.

### Backend
- `eduflow-backend/src/routes/attendanceRoutes.js` — Core attendance routes (`/stats`, `/at-risk`, `/student/:studentId`, `/upload-csv`, `/ingest/sample`, `/sync-now`, `/notify-parents`, `/counseling-note`).
- `eduflow-backend/src/routes/studentRoutes.js` — Student-scoped endpoint (`GET /api/v1/student/attendance`).
- `eduflow-backend/src/controllers/AttendanceController.js` — Controller handling ingestion, risk analysis, BLE sync, and student statistics.
- `eduflow-backend/src/services/attendance/AttendanceIngestionService.js` — CSV parser, validator, and database upsert service.
- `eduflow-backend/src/services/attendance/AttendanceAnalysis.js` — Condonation risk detection, percentage aggregation, and parent notification dispatcher.
- `eduflow-backend/src/services/attendance/WhatsAppAttendance.js` — Staged SMS/WhatsApp incoming attendance parser.

---

## 2. API Contract
| Method | Path | Request Body | Response Shape | Status | Allowed Roles |
|---|---|---|---|---|---|
| `POST` | `/api/v1/attendance/mark` | `{ classId, subjectId, date, period, records: [{ studentId, roll, status }] }` | `{ success: true, markedCount: number, batchId: string }` | 200, 400, 403 | `faculty`, `admin` |
| `GET` | `/api/v1/student/attendance` | None (reads auth token) | `[{ subject_code, subject_name, attended, total, percentage, status }]` | 200, 500 | `student` |
| `GET` | `/api/v1/attendance/student/:studentId` | None | `{ success: true, overallPercentage: number, records: AttendanceRecord[] }` | 200, 403, 404 | `admin`, `hod`, `faculty`, `parent` (ward only), `student` (self only) |
| `GET` | `/api/v1/attendance/stats` | None | `{ success: true, overallPercentage: number, totalStudents: number, atRiskCount: number }` | 200, 500 | `admin`, `hod` |
| `GET` | `/api/v1/attendance/at-risk` | Query: `threshold=75` | `{ success: true, flaggedCount: number, students: AtRiskStudent[] }` | 200, 500 | `admin`, `hod`, `faculty` |
| `POST` | `/api/v1/attendance/sync-now` | None | `{ success: true, message: string, syncedCount: number }` | 200, 403, 500 | `admin`, `hod` |
| `POST` | `/api/v1/attendance/notify-parents` | `{ studentIds: number[] }` | `{ success: true, notifiedCount: number }` | 200, 403, 500 | `admin`, `hod` |

---

## 3. Data Model
```sql
CREATE TABLE student_attendance (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  student_id INTEGER REFERENCES users(id),
  student_roll VARCHAR(50) NOT NULL,
  class_section VARCHAR(50) NOT NULL,
  course_code VARCHAR(50) NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE', 'ON_DUTY'
  marked_by INTEGER REFERENCES users(id),
  marked_at TIMESTAMP DEFAULT NOW(),
  remarks TEXT,
  UNIQUE(student_id, course_code, attendance_date, class_section)
);
```

---

## 4. Role Matrix
| Action | Admin | HOD | Faculty | Student | Parent |
|---|---|---|---|---|---|
| Mark Class Attendance | Allowed | Allowed | Allowed (assigned class) | Denied (403) | Denied (403) |
| Update Attendance (within 24h) | Allowed | Allowed | Allowed (own records) | Denied (403) | Denied (403) |
| View Own Attendance | Allowed | Allowed | Allowed | Allowed (self only) | Allowed (ward only) |
| Ingest Biometric / CSV Ledger | Allowed | Allowed | Denied (403) | Denied (403) | Denied (403) |
| Run Condonation (<75%) Audit | Allowed | Allowed | Allowed (Dept) | Denied (403) | Denied (403) |
| Trigger WhatsApp / SMS Notices | Allowed | Allowed | Denied (403) | Denied (403) | Denied (403) |

---

## 5. Gap List
1. **Student ↔ Teacher Record Linkage**: `attendanceEntry.jsx` previously saved state locally without committing an explicit POST to backend `/api/v1/attendance/mark`. The student overview relied on static mock arrays rather than reading the live attendance record posted by the teacher.
2. **Status Enum Harmonization**: Teacher interface marks `'P'`, `'A'`, `'OD'`, `'L'`, while backend tables store `'PRESENT'`, `'ABSENT'`, `'ON_DUTY'`, `'LATE'`. Both formats must be normalized seamlessly in the ingestion service and API responses.
3. **Idempotency Guarantee**: Submitting attendance twice for the same student, course, and date must execute an `ON CONFLICT DO UPDATE` (upsert) rather than creating duplicate rows.
