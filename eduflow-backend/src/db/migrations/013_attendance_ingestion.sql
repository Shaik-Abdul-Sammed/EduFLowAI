-- 013_attendance_ingestion.sql: Attendance ingestion, portal connections, and sync tracking

CREATE TABLE IF NOT EXISTS attendance_sources (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  source_type VARCHAR(50) NOT NULL, -- 'CSV', 'BIOMETRIC', 'MYSQL', 'POSTGRES', 'ORACLE', 'FEDENA', 'CAMPUS365', 'CLASSPRO', 'GOOGLE_SHEET'
  name VARCHAR(200) NOT NULL,
  connection_config JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(30) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SYNCING', 'ERROR'
  last_synced_at TIMESTAMP,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  source_id INTEGER REFERENCES attendance_sources(id) ON DELETE SET NULL,
  student_id INTEGER,
  student_external_id VARCHAR(100),
  department_id INTEGER,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE', 'ON_DUTY'
  period_number INTEGER DEFAULT 1,
  course_code VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attendance_records_inst_date_idx ON attendance_records(institution_id, date);
CREATE INDEX IF NOT EXISTS attendance_records_student_idx ON attendance_records(student_id);

CREATE TABLE IF NOT EXISTS attendance_sync_logs (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  source_id INTEGER REFERENCES attendance_sources(id) ON DELETE CASCADE,
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  sync_status VARCHAR(30) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'PARTIAL'
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_alerts (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  student_id INTEGER,
  student_name VARCHAR(200),
  department_name VARCHAR(100),
  attendance_percentage NUMERIC(5, 2) NOT NULL,
  alert_level VARCHAR(20) DEFAULT 'WARNING', -- 'CRITICAL', 'WARNING', 'NOTICE'
  parent_notified BOOLEAN DEFAULT FALSE,
  notification_channel VARCHAR(30) DEFAULT 'SMS',
  created_at TIMESTAMP DEFAULT NOW()
);
