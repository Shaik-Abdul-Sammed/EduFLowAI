CREATE TABLE IF NOT EXISTS onboarding_progress (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id) UNIQUE,
  current_step INTEGER DEFAULT 1,
  profile_data JSONB DEFAULT '{}'::jsonb,
  departments_data JSONB DEFAULT '[]'::jsonb,
  faculty_data JSONB DEFAULT '[]'::jsonb,
  students_data JSONB DEFAULT '[]'::jsonb,
  academic_data JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_acceptances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  institution_id INTEGER REFERENCES institutions(id),
  document_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  ip_address VARCHAR(50),
  user_agent TEXT,
  accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE institutions ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "academic": { "academicYear": "2026-2027", "semesterType": "ODD", "workingDaysPerWeek": 6, "holidaysState": "KA" },
  "localization": { "primaryLanguage": "English", "timezone": "Asia/Kolkata", "dateFormat": "DD/MM/YYYY" },
  "notification": { "email": true, "whatsapp": false, "inApp": true },
  "security": { "sessionTimeoutMinutes": 30, "require2FA": false, "ipWhitelist": [] },
  "billing": { "gstNumber": "", "billingAddress": "", "billingEmail": "", "upiId": "eduflow@icici" }
}'::jsonb;
