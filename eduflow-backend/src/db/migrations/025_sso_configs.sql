-- 025_sso_configs.sql: Single Sign-On and Institutional LDAP Configuration
CREATE TABLE IF NOT EXISTS sso_configs (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('SAML', 'OIDC', 'LDAP')),
  display_name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  auto_provision BOOLEAN DEFAULT true,
  default_role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sso_login_logs (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER NOT NULL,
  user_id INTEGER,
  provider_type VARCHAR(20) NOT NULL,
  external_id VARCHAR(255),
  email VARCHAR(255),
  role_assigned VARCHAR(50),
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_configs_inst ON sso_configs(institution_id);
CREATE INDEX IF NOT EXISTS idx_sso_login_logs_inst ON sso_login_logs(institution_id);
