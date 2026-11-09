-- Migration 029: Async Workers document_status and Ethical Counseling Alerts
CREATE TABLE IF NOT EXISTS document_status (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(100) UNIQUE NOT NULL,
  queue_name VARCHAR(50) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  filename VARCHAR(255),
  file_path TEXT,
  file_size INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Processing...', -- 'Processing...', 'Ready', 'Failed'
  error_message TEXT,
  institution_id INTEGER DEFAULT 1,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_status_job_id ON document_status(job_id);

ALTER TABLE attendance_alerts ADD COLUMN IF NOT EXISTS counseling_required BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance_alerts ADD COLUMN IF NOT EXISTS counseling_note TEXT;
ALTER TABLE attendance_alerts ADD COLUMN IF NOT EXISTS counseling_logged_by INTEGER;
ALTER TABLE attendance_alerts ADD COLUMN IF NOT EXISTS counseling_logged_at TIMESTAMP;
