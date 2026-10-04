-- EduFlow AI OS: NAAC Operational Data Schema Migration
-- Creates demo tables for NAAC reporting and accreditation intelligence

CREATE TABLE IF NOT EXISTS demo_students (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(20),
  gender VARCHAR(10),
  category VARCHAR(20),
  program VARCHAR(100),
  department VARCHAR(100),
  batch_year INTEGER,
  current_semester INTEGER,
  cgpa DECIMAL(4,2),
  attendance_percentage DECIMAL(5,2),
  fee_status VARCHAR(20),
  placement_status VARCHAR(30),
  scholarship VARCHAR(100),
  is_first_generation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_faculty (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  employee_id VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  designation VARCHAR(100),
  department VARCHAR(100),
  qualification VARCHAR(100),
  specialization VARCHAR(200),
  experience_years INTEGER,
  publications_count INTEGER DEFAULT 0,
  phd_guided INTEGER DEFAULT 0,
  is_phd_holder BOOLEAN DEFAULT FALSE,
  joined_year INTEGER,
  email VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_courses (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  program_name VARCHAR(150) NOT NULL,
  program_level VARCHAR(20),
  department VARCHAR(100),
  duration_years DECIMAL(3,1),
  total_seats INTEGER,
  filled_seats INTEGER,
  fee_per_year INTEGER,
  curriculum_type VARCHAR(50),
  has_internship BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_placements (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  student_id INTEGER REFERENCES demo_students(id),
  company_name VARCHAR(200),
  package_lpa DECIMAL(6,2),
  placement_year INTEGER,
  offer_type VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_research (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  faculty_id INTEGER REFERENCES demo_faculty(id),
  title VARCHAR(500),
  journal_name VARCHAR(300),
  year INTEGER,
  citations INTEGER DEFAULT 0,
  impact_factor DECIMAL(5,2),
  is_scopus BOOLEAN DEFAULT FALSE,
  is_ugc_care BOOLEAN DEFAULT FALSE,
  is_web_of_science BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_infrastructure (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),
  count INTEGER,
  area_sqft INTEGER,
  capacity INTEGER,
  year_built INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_students_institution_idx ON demo_students(institution_id);
CREATE INDEX IF NOT EXISTS demo_faculty_institution_idx ON demo_faculty(institution_id);
CREATE INDEX IF NOT EXISTS demo_placements_institution_idx ON demo_placements(institution_id);
