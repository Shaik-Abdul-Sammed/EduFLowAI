# Academic Calendar Feature Audit

## 1. Files Touched
### Frontend
- `eduflow-core/web/src/pages/admin/AcademicCalendarPage.jsx` — Primary administrative calendar generator, holiday visualizer, and event manager.
- `eduflow-core/web/src/pages/hod/HodCalendarPage.jsx` — Department-scoped academic calendar and compensatory holiday adjustments.
- `eduflow-core/web/src/components/Sidebar.jsx` — Navigation entry points for Admin (`/admin-dashboard/calendar`) and HOD (`/hod-dashboard/calendar`).
- `eduflow-core/web/src/App.jsx` — Route registrations guarded by `<ProtectedRoute allowedRoles={['admin', 'hod']}>`.

### Backend
- `eduflow-backend/src/routes/calendarRoutes.js` — Express router registering calendar endpoints with `requireRole` middleware.
- `eduflow-backend/src/controllers/CalendarController.js` — Request/response orchestration, input validation, and pool queries.
- `eduflow-backend/src/services/calendar/CalendarGenerator.js` — State gazetted holiday engine and working-day calculations.
- `eduflow-backend/src/services/calendar/CalendarAdjustments.js` — Dynamic rescheduling, compensatory class injection, and event shifts.
- `eduflow-backend/src/services/calendar/AcademicCalendarPdfBuilder.js` — PDF generation with collegiate gazette templates.
- `eduflow-backend/src/db/migrations/015_academic_calendar.sql` — PostgreSQL schema definitions for `holidays`, `academic_calendars`, `calendar_events`, and `calendar_adjustments`.

---

## 2. API Contract
| Method | Path | Request Body | Response Shape | Status | Allowed Roles |
|---|---|---|---|---|---|
| `GET` | `/api/v1/calendar/:institutionId/:academicYear` | None | `{ success: true, calendar: AcademicCalendar, events: Event[], holidays: Holiday[] }` | 200, 404, 500 | `admin`, `hod`, `faculty`, `student`, `parent` |
| `GET` | `/api/v1/calendar/holidays/:year?stateCode=KA` | None | `{ success: true, year: number, stateCode: string, holidays: Holiday[] }` | 200, 500 | Public / Authenticated |
| `GET` | `/api/v1/calendar/:institutionId/:academicYear/events` | Query: `stateCode`, `applySecondSaturday` | `{ success: true, events: CalendarEvent[] }` | 200, 500 | Authenticated |
| `POST` | `/api/v1/calendar/generate` | `{ academicYear, stateCode, targetWorkingDays, startDate, endDate, applySecondSaturday }` | `{ success: true, calendarId, events, stats: { totalWorkingDays, holidays } }` | 201, 400, 500 | `admin`, `hod` |
| `POST` | `/api/v1/calendar/event` | `{ title, startDate, endDate, eventType, description, affectedDepartments }` | `{ success: true, event: CalendarEvent }` | 201, 400, 500 | `admin`, `hod`, `faculty`, `staff` |
| `DELETE`| `/api/v1/calendar/event/:id` | None | `{ success: true, message: string, eventId: string }` | 200, 404, 500 | `admin`, `hod` |
| `POST` | `/api/v1/calendar/:calendarId/publish` | None | `{ success: true, status: 'PUBLISHED', publishedAt: ISOString }` | 200, 403, 500 | `admin` |
| `POST` | `/api/v1/calendar/:calendarId/approve` | None | `{ success: true, status: 'APPROVED', approvedBy: userId }` | 200, 403, 500 | `admin` |
| `POST` | `/api/v1/calendar/:calendarId/adjust` | `{ adjustmentType, eventId, additionalDays, newStartDate, reason }` | `{ success: true, adjustment: CalendarAdjustment }` | 200, 400, 500 | `admin`, `hod` |
| `POST` | `/api/v1/calendar/export-pdf` | `{ calendarData, academicYear, institutionName }` | PDF Binary Stream (`application/pdf`) | 200, 500 | Authenticated |

---

## 3. Data Model
```sql
CREATE TABLE academic_calendars (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  academic_year VARCHAR(50) NOT NULL, -- '2026-2027'
  semester_type VARCHAR(20) NOT NULL, -- 'ODD', 'EVEN', 'FULL_YEAR'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_working_days INTEGER DEFAULT 90,
  total_holidays INTEGER DEFAULT 15,
  status VARCHAR(30) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'PUBLISHED', 'ARCHIVED'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  calendar_id INTEGER REFERENCES academic_calendars(id) ON DELETE CASCADE,
  institution_id INTEGER REFERENCES institutions(id),
  event_type VARCHAR(50) NOT NULL, -- 'SEMESTER_START', 'MID_EXAM', 'LAB_EXAM', 'END_EXAM', 'VACATION'
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  affected_departments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Role Matrix
| Action | Admin | HOD | Faculty | Student | Parent |
|---|---|---|---|---|---|
| View Published Calendar | Allowed | Allowed | Allowed | Allowed | Allowed |
| Generate Draft Calendar | Allowed | Allowed | Denied (403) | Denied (403) | Denied (403) |
| Create Event / Exam | Allowed | Allowed | Allowed | Denied (403) | Denied (403) |
| Delete Event | Allowed | Allowed (Dept Scope) | Denied (403) | Denied (403) | Denied (403) |
| Approve / Publish Calendar | Allowed | Denied (403) | Denied (403) | Denied (403) | Denied (403) |
| Reschedule / Adjust Holiday | Allowed | Allowed | Denied (403) | Denied (403) | Denied (403) |
| Export Official Gazette PDF | Allowed | Allowed | Allowed | Allowed | Allowed |

---

## 5. Gap List
1. **Field Mismatch**: Frontend calls `createEvent` with `{ title, startDate, endDate }`, while DB schema column is `name`. Backend controller currently bridges this by aliasing `title -> name` or using mock fallback.
2. **Department Scoping**: `affected_departments` JSONB array exists in the DB, but `getEvents` was returning all events without filtering for HOD's department when requested by an HOD role.
3. **Date Validation**: `endDate >= startDate` should be enforced strictly with a 400 Bad Request error prior to database insertion.
