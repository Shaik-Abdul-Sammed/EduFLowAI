-- EduFlow AI OS - Multi-Tenant Schema

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS recent_searches CASCADE;
DROP TABLE IF EXISTS campus_assets CASCADE;
DROP TABLE IF EXISTS transport_routes CASCADE;
DROP TABLE IF EXISTS hostel_rooms CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'FREE', -- FREE, PRO, ULTRA_PRO, ULTRA_PRO_PLUS
    primary_color VARCHAR(7) DEFAULT '#2563EB',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- student, faculty, admin, parent
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Enterprise Modules (Ultra Pro+)
-- ==========================================

CREATE TABLE hostels (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    warden_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_rooms (
    id SERIAL PRIMARY KEY,
    hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0
);

CREATE TABLE transport_routes (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    route_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20)
);

CREATE TABLE campus_assets (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE recent_searches (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    query TEXT NOT NULL,
    route_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, route_path)
);

-- ==========================================
-- Enterprise Operations & Portals
-- ==========================================

CREATE TABLE grievances (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_name VARCHAR(150) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE library_books (
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

CREATE TABLE book_issues (
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
    status VARCHAR(50) DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_allocations (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    hostel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    bed_number VARCHAR(10),
    allocation_date DATE DEFAULT CURRENT_DATE,
    vacating_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_gate_logs (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    reason VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(100)
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    parent_consent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by VARCHAR(100),
    review_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE department_budgets (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    fiscal_year VARCHAR(20) NOT NULL,
    allocated_amount NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_expenses (
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

CREATE TABLE scholarship_applications (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    scholarship_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    gpa NUMERIC(4, 2),
    annual_family_income NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'APPLIED',
    verified_by VARCHAR(100),
    invoice_deduction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admission_applications (
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
    payment_status VARCHAR(50) DEFAULT 'PAID',
    payment_utr VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE placement_drives (
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
    status VARCHAR(50) DEFAULT 'ACTIVE',
    applicants_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE placement_applications (
    id SERIAL PRIMARY KEY,
    drive_id INTEGER REFERENCES placement_drives(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    student_cgpa NUMERIC(4, 2),
    branch VARCHAR(50) NOT NULL,
    resume_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPLIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mock_tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration_mins INTEGER DEFAULT 30,
    total_questions INTEGER DEFAULT 10,
    questions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mock_test_submissions (
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

CREATE TABLE faculty_appraisals (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    research_score NUMERIC(5, 2) NOT NULL,
    teaching_score NUMERIC(5, 2) NOT NULL,
    admin_score NUMERIC(5, 2) NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    performance_band VARCHAR(50),
    remarks TEXT,
    evaluated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payslips (
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

CREATE TABLE online_exams (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    duration_mins INTEGER DEFAULT 45,
    total_marks INTEGER DEFAULT 50,
    questions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PUBLISHED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_violations (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES online_exams(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hardware-Free Wi-Fi Invisible Presence Tracking & Dwell-Time Engine
CREATE TABLE network_zones (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    ap_bssid VARCHAR(64) NOT NULL UNIQUE,
    ip_subnet VARCHAR(64),
    zone_type VARCHAR(32) NOT NULL CHECK (zone_type IN ('CLASSROOM', 'DORM', 'LIBRARY', 'CAFETERIA')),
    room_name VARCHAR(128) NOT NULL,
    building_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_devices (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_roll VARCHAR(64),
    mac_address_hash VARCHAR(128) NOT NULL UNIQUE,
    college_email VARCHAR(255),
    device_name VARCHAR(128) DEFAULT 'Student Smartphone',
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE presence_sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_roll VARCHAR(64) NOT NULL,
    student_name VARCHAR(128),
    zone_id INTEGER REFERENCES network_zones(id) ON DELETE SET NULL,
    course_id VARCHAR(64),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    dwell_time_percentage REAL DEFAULT 0.0,
    status VARCHAR(32) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'DISPUTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE presence_disputes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_roll VARCHAR(64) NOT NULL,
    session_id INTEGER REFERENCES presence_sessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    resolved_by VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
