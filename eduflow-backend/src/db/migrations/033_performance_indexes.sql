-- 033_performance_indexes.sql
-- High-Performance Indexes for Enterprise Scaling (Feature 62)

CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON students(institution_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_institution_id ON attendance_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
