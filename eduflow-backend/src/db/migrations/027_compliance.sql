-- 027_compliance.sql: SOC 2 Type I and DPDP Act 2023 Compliance Schema
CREATE TABLE IF NOT EXISTS compliance_events (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ACCESS', 'CHANGE', 'INCIDENT', 'DATA')),
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  actor_id INTEGER,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retention_policies (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  data_type VARCHAR(100) NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  auto_delete BOOLEAN DEFAULT true,
  last_purge_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_events_inst ON compliance_events(institution_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_cat ON compliance_events(category);
CREATE INDEX IF NOT EXISTS idx_retention_policies_inst ON retention_policies(institution_id);
