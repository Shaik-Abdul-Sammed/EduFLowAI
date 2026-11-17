-- 034_attendance_review_state.sql: Attendance review state and faculty override tracking

ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS review_state VARCHAR(30) DEFAULT 'auto_present';
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS overridden_by VARCHAR(100);
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS override_reason VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_attendance_records_review_state ON attendance_records(review_state);
