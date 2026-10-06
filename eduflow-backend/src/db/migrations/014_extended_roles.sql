-- 014_extended_roles.sql: Add 'hod' and 'staff' roles and departments table

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'hod', 'faculty', 'staff', 'student', 'parent'));

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  hod_user_id INTEGER REFERENCES users(id),
  total_students INTEGER DEFAULT 0,
  total_faculty INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (institution_id, code)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reports_to INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_designation VARCHAR(100);
CREATE INDEX IF NOT EXISTS users_department_idx ON users(department_id);
CREATE INDEX IF NOT EXISTS users_reports_to_idx ON users(reports_to);

-- Seed 8 departments for demo institution (id 1 or default)
INSERT INTO departments (institution_id, name, code, total_students, total_faculty)
VALUES 
  (1, 'Computer Science & Engineering', 'CSE', 480, 24),
  (1, 'Electronics & Communication Engineering', 'ECE', 360, 18),
  (1, 'Electrical & Electronics Engineering', 'EEE', 240, 14),
  (1, 'Mechanical Engineering', 'MECH', 240, 16),
  (1, 'Civil Engineering', 'CIVIL', 180, 12),
  (1, 'Information Technology', 'IT', 240, 15),
  (1, 'Artificial Intelligence & Data Science', 'AI', 180, 12),
  (1, 'Master of Business Administration', 'MBA', 120, 8)
ON CONFLICT (institution_id, code) DO UPDATE 
SET total_students = EXCLUDED.total_students, total_faculty = EXCLUDED.total_faculty;
