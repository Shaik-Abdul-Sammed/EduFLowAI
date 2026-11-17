-- Migration 031: Canonical Device Registrations for Presence Tracking
-- Replaces MAC address identity resolution with app-installation UUID (deviceInstallId)
-- MAC hash is kept solely for fraud detection / device binding at registration.

CREATE TABLE IF NOT EXISTS device_registrations (
  id UUID PRIMARY KEY,
  device_install_id TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL,
  student_roll TEXT,
  student_name TEXT,
  mac_hash TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_device_reg_student ON device_registrations(student_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_device_reg_install_id ON device_registrations(device_install_id) WHERE revoked_at IS NULL;
