-- 032_student_roll_login_and_bulk.sql
-- Supports scalable Student Roll Number + DOB Login and Bulk Student Provisioning (10k+ capacity)

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(20),
  dob VARCHAR(20) NOT NULL, -- Stored as DDMMYYYY or YYYY-MM-DD
  department VARCHAR(100) DEFAULT 'Computer Science & Engineering',
  program VARCHAR(100) DEFAULT 'B.Tech',
  semester INTEGER DEFAULT 1,
  batch VARCHAR(50) DEFAULT '2024-2028',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON students(institution_id);

-- Seed initial test students for testing roll/dob login
INSERT INTO students (institution_id, roll_number, name, email, dob, department, program, semester, batch)
VALUES 
  (1, '2024-CSE-042', 'Aditya Sharma', 'aditya.sharma@demo.edu', '15082004', 'Computer Science & Engineering', 'B.Tech', 5, '2024-2028'),
  (1, '2024-CSE-055', 'Sneha Patel', 'sneha.patel@demo.edu', '22112004', 'Computer Science & Engineering', 'B.Tech', 5, '2024-2028'),
  (1, '2024-ECE-019', 'Rahul Verma', 'rahul.verma@demo.edu', '05012005', 'Electronics & Communication', 'B.Tech', 3, '2024-2028')
ON CONFLICT (roll_number) DO NOTHING;
