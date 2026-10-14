-- 023_finance_roles.sql: Add finance_officer and accounts_staff roles with finance_scope

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'registrar', 'finance_officer', 'accounts_staff', 'hod', 'faculty', 'staff', 'student', 'parent'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS finance_scope VARCHAR(50);
-- finance_scope can be: INSTITUTION, DEPARTMENT, HOSTEL, EXAMINATION, SCHOLARSHIP
