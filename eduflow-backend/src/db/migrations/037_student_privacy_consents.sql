-- 037_student_privacy_consents.sql: DPDP Act 2023 Explicit Consent and Data Retention Split

CREATE TABLE IF NOT EXISTS student_privacy_consents (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  consented BOOLEAN DEFAULT FALSE,
  consented_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  policy_version VARCHAR(20) DEFAULT '2026.1',
  opt_out_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_privacy_consents_student ON student_privacy_consents(student_id);
