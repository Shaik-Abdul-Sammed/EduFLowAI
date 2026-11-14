-- 030_campus_operations_and_portals.sql
-- Enterprise modules for Grievances, Library, Hostel, Leave, Budget, Scholarships, Admissions, Placement, Appraisals, Payroll, Online Exams

-- 1. Grievance Redressal
CREATE TABLE IF NOT EXISTS grievances (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_name VARCHAR(150) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Academic, Hostel, Mess, Infrastructure, Fee, Other
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, IN_REVIEW, RESOLVED, REJECTED
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Library Management
CREATE TABLE IF NOT EXISTS library_books (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    isbn VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_issues (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES library_books(id) ON DELETE CASCADE,
    book_title VARCHAR(255) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ISSUED', -- ISSUED, RETURNED, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hostel Allocations & Gate Logs
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    hostel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    bed_number VARCHAR(10),
    allocation_date DATE DEFAULT CURRENT_DATE,
    vacating_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, VACATED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_gate_logs (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- IN, OUT
    reason VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(100)
);

-- 4. Student Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- Medical, Personal, OnDuty, Emergency
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    parent_consent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_by VARCHAR(100),
    review_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Budget Tracking & Expenses
CREATE TABLE IF NOT EXISTS department_budgets (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Lab Equipment, Maintenance, Research, Library, IT Infrastructure
    fiscal_year VARCHAR(20) NOT NULL,
    allocated_amount NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_expenses (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES department_budgets(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    vendor_name VARCHAR(255),
    invoice_number VARCHAR(100),
    expense_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Scholarship Management
CREATE TABLE IF NOT EXISTS scholarship_applications (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    scholarship_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Merit, Need-Based, Sports, Minority
    amount NUMERIC(10, 2) NOT NULL,
    gpa NUMERIC(4, 2),
    annual_family_income NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, VERIFIED, DEDUCTED, REJECTED
    verified_by VARCHAR(100),
    invoice_deduction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Online Admissions
CREATE TABLE IF NOT EXISTS admission_applications (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    desired_program VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    percentage_or_cgpa NUMERIC(5, 2) NOT NULL,
    application_fee NUMERIC(8, 2) DEFAULT 1000.00,
    payment_status VARCHAR(50) DEFAULT 'PAID', -- PENDING, PAID
    payment_utr VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, PROVISIONALLY_ADMITTED, REJECTED
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Placement Readiness & Drives
CREATE TABLE IF NOT EXISTS placement_drives (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    ctc_lpa NUMERIC(5, 2) NOT NULL,
    eligibility_cgpa NUMERIC(4, 2) DEFAULT 6.00,
    eligible_branches TEXT[] NOT NULL,
    drive_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    job_description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, COMPLETED
    applicants_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS placement_applications (
    id SERIAL PRIMARY KEY,
    drive_id INTEGER REFERENCES placement_drives(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    student_cgpa NUMERIC(4, 2),
    branch VARCHAR(50) NOT NULL,
    resume_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, SHORTLISTED, SELECTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Student Mock Tests
CREATE TABLE IF NOT EXISTS mock_tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Quantitative, Logical Reasoning, Verbal, Technical
    duration_mins INTEGER DEFAULT 30,
    total_questions INTEGER DEFAULT 10,
    questions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mock_test_submissions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    answers JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Faculty Appraisal
CREATE TABLE IF NOT EXISTS faculty_appraisals (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    research_score NUMERIC(5, 2) NOT NULL, -- 0-100
    teaching_score NUMERIC(5, 2) NOT NULL, -- 0-100
    admin_score NUMERIC(5, 2) NOT NULL, -- 0-100
    total_score NUMERIC(5, 2) NOT NULL, -- 0-100
    performance_band VARCHAR(50), -- Outstanding, Exceeds Expectations, Meets Expectations, Needs Improvement
    remarks TEXT,
    evaluated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Payroll & Payslips
CREATE TABLE IF NOT EXISTS payslips (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    faculty_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    basic_pay NUMERIC(10, 2) NOT NULL,
    da NUMERIC(10, 2) NOT NULL,
    hra NUMERIC(10, 2) NOT NULL,
    allowances NUMERIC(10, 2) DEFAULT 0.00,
    pf_deduction NUMERIC(10, 2) NOT NULL,
    tax_deduction NUMERIC(10, 2) NOT NULL,
    net_salary NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAID',
    pdf_url VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Online Exam & Proctoring
CREATE TABLE IF NOT EXISTS online_exams (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    duration_mins INTEGER DEFAULT 45,
    total_marks INTEGER DEFAULT 50,
    questions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PUBLISHED', -- DRAFT, PUBLISHED, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_violations (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES online_exams(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    violation_type VARCHAR(100) NOT NULL, -- tab_switch_violation, window_blur, fullscreen_exit
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
