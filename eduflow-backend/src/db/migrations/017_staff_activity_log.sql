-- 017_staff_activity_log.sql: Audit trail and approval queue for staff actions

CREATE TABLE IF NOT EXISTS staff_activity_log (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  staff_user_id INTEGER REFERENCES users(id),
  officer_key VARCHAR(50),
  action_type VARCHAR(50),
  prompt_text TEXT,
  output_summary TEXT,
  approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED')),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  session_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS staff_activity_log_user_idx ON staff_activity_log(staff_user_id);
CREATE INDEX IF NOT EXISTS staff_activity_log_status_idx ON staff_activity_log(approval_status);
CREATE INDEX IF NOT EXISTS staff_activity_log_created_idx ON staff_activity_log(created_at);
