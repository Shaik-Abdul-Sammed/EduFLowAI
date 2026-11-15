# Attendance (Student ↔ Teacher ↔ Admin Link) Functional Specification

## Expected Behaviors & Invariants

### 1. Teacher Marks Attendance → Student Observes Identical Record
- When a faculty member marks attendance for course `CS301`, section `CSE-6A`, on date `2026-09-01`, a persistent record is generated with:
  - `markedBy = facultyId`
  - `status = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'`
- The **exact same record** must immediately reflect in `student/attendanceOverview` for student `22BCE1007` under subject `CS301` with status matching what was recorded.

### 2. Idempotency on Repeated Marking
- If the teacher submits attendance for the same student, course, section, and date multiple times (e.g. correcting a student from 'A' to 'P' or 'OD'):
  - The API must update the existing record rather than inserting a duplicate row.
  - The unique constraint `UNIQUE(student_id, course_code, attendance_date, class_section)` is preserved.

### 3. Role Scoping & Access Control
- **Student**: Cannot mark or edit attendance (HTTP 403 Forbidden). Direct fetch to `/api/v1/attendance/student/:id` for an ID different from the authenticated student token is rejected with HTTP 403.
- **Faculty**: Can mark attendance only for classes/subjects assigned to their workload.
- **Admin**: Can audit all records across all departments, sections, and dates.

### 4. Percentage & Condonation Calculation Invariants
- Statutory attendance percentage formula:
  $$\text{Percentage} = \frac{\text{Present} + \text{On-Duty} + (0.5 \times \text{Late})}{\text{Total Sessions}} \times 100$$
- If overall attendance falls below **75.0%**, the student is flagged as `Condonation Risk (<75%)` and becomes visible in the Dean's at-risk audit queue.

### 5. Multi-Channel Fallbacks (WhatsApp & Biometric Turnstile)
- Staged records from WhatsApp or biometric CSV imports normalize into identical student attendance rows upon admin confirmation.
