-- 016_staff_permissions.sql: Granular per-officer permission system for staff

CREATE TABLE IF NOT EXISTS staff_permissions (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  staff_user_id INTEGER REFERENCES users(id),
  granted_by INTEGER REFERENCES users(id),
  officer_key VARCHAR(50) NOT NULL,
  permission_level VARCHAR(30) NOT NULL CHECK (permission_level IN ('VIEW_ONLY', 'DRAFT', 'FULL')),
  department_id INTEGER REFERENCES departments(id),
  max_requests_per_day INTEGER DEFAULT 20,
  requires_approval BOOLEAN DEFAULT TRUE,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (staff_user_id, officer_key, department_id)
);

CREATE INDEX IF NOT EXISTS staff_permissions_user_idx ON staff_permissions(staff_user_id);
CREATE INDEX IF NOT EXISTS staff_permissions_officer_idx ON staff_permissions(officer_key);
CREATE INDEX IF NOT EXISTS staff_permissions_dept_idx ON staff_permissions(department_id);
