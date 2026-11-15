# Grievance Portal Functional Specification

## Expected Behaviors & Invariants

### 1. Student Submission Flow
- A student submits a complaint with category, subject, description, and requested priority.
- The `student_id` is always extracted from the authenticated JWT session (`req.user.id`), never trusted blindly from user-submitted request bodies.
- Initial status is automatically set to `SUBMITTED`.

### 2. Automated Sentiment & Urgency Triaging
- Every incoming complaint is passed through the AI grievance sentiment analyzer:
  - If severe keywords (e.g. harassment, lab safety hazard, medical emergency) are detected, priority is automatically elevated to `CRITICAL` or `HIGH`.
  - The calculated sentiment score is stored on the grievance record.

### 3. Admin & HOD Queue State Transitions
- The grievance appears in the Admin and HOD queues with real-time status.
- Valid status transitions:
  - `SUBMITTED` → `IN_PROGRESS`
  - `IN_PROGRESS` → `RESOLVED`
  - `RESOLVED` → `CLOSED`
- Direct transition from `CLOSED` back to `SUBMITTED` is rejected.
- When resolving, the administrator/HOD supplies mandatory `resolution_notes` and their name is recorded in `resolved_by`.

### 4. Confidentiality & Peer Isolation
- Students can only retrieve grievances where `student_id == req.user.id`.
- Fetching another student's grievance by direct ID query yields HTTP 403 Forbidden.
