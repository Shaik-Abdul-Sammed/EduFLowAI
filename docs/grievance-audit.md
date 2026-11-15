# Student Complaint / Grievance Portal Feature Audit

## 1. Files Touched
### Frontend
- `eduflow-core/web/src/pages/student/GrievancePage.jsx` — Student grievance submission form with category selection, description, priority, and live status tracker.
- `eduflow-core/web/src/pages/admin/GrievanceManagementPage.jsx` — Administrative/HOD grievance queue with status filters, resolution notes modal, and state transitions.
- `eduflow-core/web/src/pages/student/ARScannerPage.jsx` / `DeanEscalationPage.jsx` — High-priority academic escalation desk connecting directly to the Dean and Faculty.
- `eduflow-core/web/src/pages/faculty/StudentEscalationsPage.jsx` — Faculty/Dean resolution desk with AI sentiment summarization and directive generation.
- `eduflow-core/web/src/utils/escalationService.js` — Client-side fallback store, AI root-cause classifier, and broadcast dispatcher.

### Backend
- `eduflow-backend/src/routes/campusOperationsRoutes.js` — Routes for `/api/v1/grievances` (`POST`, `GET`, `PATCH /:id/resolve`).
- `eduflow-backend/src/controllers/CampusOperationsController.js` — Grievance ingestion, AI sentiment scoring, persistence, and status updates.
- `eduflow-backend/src/services/AIService.js` — Heuristic and LLM sentiment analysis for auto-escalating severe or harassment-related complaints.
- `eduflow-backend/src/db/migrations/` — `grievances` table schema in PostgreSQL.

---

## 2. API Contract
| Method | Path | Request Body | Response Shape | Status | Allowed Roles |
|---|---|---|---|---|---|
| `POST` | `/api/v1/grievances` | `{ category, subject, description, priority, isAnonymous }` | `{ success: true, grievance: Grievance, sentiment: { score, priority } }` | 201, 400, 500 | `student` |
| `GET` | `/api/v1/grievances` | None (reads role from token) | `{ success: true, grievances: Grievance[] }` | 200, 500 | `student` (own only), `admin`, `hod`, `faculty` |
| `PATCH` | `/api/v1/grievances/:id/resolve` | `{ status, resolution_notes }` | `{ success: true, grievance: Grievance }` | 200, 400, 404, 500 | `admin`, `hod`, `faculty` |
| `GET` | `/api/v1/grievances/:id` | None | `{ success: true, grievance: Grievance }` | 200, 403, 404 | Owner or `admin`/`hod` |

---

## 3. Data Model
```sql
CREATE TABLE grievances (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  student_id INTEGER REFERENCES users(id),
  student_name VARCHAR(150),
  student_roll VARCHAR(50),
  category VARCHAR(100) NOT NULL, -- 'Academic', 'Hostel & Mess', 'Infrastructure', 'Harassment / Anti-Ragging', 'Fees'
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  sentiment_score NUMERIC(3, 2),
  sentiment_priority VARCHAR(20),
  status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'
  resolution_notes TEXT,
  resolved_by VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Role Matrix
| Action | Student | Faculty | HOD | Admin |
|---|---|---|---|---|
| Submit Grievance | Allowed | Denied (403) | Denied (403) | Denied (403) |
| View Own Grievances | Allowed | Denied (403) | Denied (403) | Denied (403) |
| View All Department Grievances | Denied (403) | Allowed (Assigned) | Allowed (Dept Scope) | Allowed (All) |
| Transition Status (`SUBMITTED` → `IN_PROGRESS`) | Denied (403) | Allowed | Allowed | Allowed |
| Resolve Grievance (`RESOLVED` / `CLOSED`) | Denied (403) | Allowed | Allowed | Allowed |
| Delete Grievance Record | Denied (403) | Denied (403) | Denied (403) | Allowed (Admin Only) |

---

## 5. Gap List
1. **Student Scoping Isolation**: In `CampusOperationsController.getGrievances`, when a student requests grievances, the response should filter by `student_id = req.user.id` so students cannot view confidential grievances submitted by peers.
2. **Status Transition Validation**: Transition from `RESOLVED` directly back to `SUBMITTED` or invalid states should be blocked with a 400 Bad Request error.
3. **Student ID Security**: The studentId must always be extracted from `req.user.id` from the verified JWT payload rather than trusting arbitrary payload parameters from the request body.
