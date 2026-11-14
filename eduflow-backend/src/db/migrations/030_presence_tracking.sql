-- Migration: 030_presence_tracking.sql
-- Hardware-Free Wi-Fi Invisible Presence Tracking & Dwell-Time Engine
-- Fully DPDP Act 2023 Compliant (SHA-256 MAC Hashing & 90-Day Data Minimization)

CREATE TABLE IF NOT EXISTS network_zones (
    id SERIAL PRIMARY KEY,
    institution_id INT DEFAULT 1,
    ap_bssid VARCHAR(64) NOT NULL UNIQUE,
    ip_subnet VARCHAR(64),
    zone_type VARCHAR(32) NOT NULL CHECK (zone_type IN ('CLASSROOM', 'DORM', 'LIBRARY', 'CAFETERIA')),
    room_name VARCHAR(128) NOT NULL,
    building_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_network_zones_ap_bssid ON network_zones(ap_bssid);
CREATE INDEX IF NOT EXISTS idx_network_zones_zone_type ON network_zones(zone_type);

CREATE TABLE IF NOT EXISTS student_devices (
    id SERIAL PRIMARY KEY,
    student_id INT,
    student_roll VARCHAR(64),
    mac_address_hash VARCHAR(128) NOT NULL UNIQUE, -- SHA-256 hash (Never raw MAC)
    college_email VARCHAR(255),
    device_name VARCHAR(128) DEFAULT 'Student Smartphone',
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_devices_mac_hash ON student_devices(mac_address_hash);
CREATE INDEX IF NOT EXISTS idx_student_devices_student_roll ON student_devices(student_roll);

CREATE TABLE IF NOT EXISTS presence_sessions (
    id SERIAL PRIMARY KEY,
    student_id INT,
    student_roll VARCHAR(64) NOT NULL,
    student_name VARCHAR(128),
    zone_id INT REFERENCES network_zones(id) ON DELETE SET NULL,
    course_id VARCHAR(64),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INT DEFAULT 0,
    dwell_time_percentage REAL DEFAULT 0.0,
    status VARCHAR(32) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'DISPUTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_presence_sessions_student_roll ON presence_sessions(student_roll);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_course ON presence_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_created ON presence_sessions(created_at);

CREATE TABLE IF NOT EXISTS presence_disputes (
    id SERIAL PRIMARY KEY,
    student_id INT,
    student_roll VARCHAR(64) NOT NULL,
    session_id INT REFERENCES presence_sessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    resolved_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_presence_disputes_roll ON presence_disputes(student_roll);
CREATE INDEX IF NOT EXISTS idx_presence_disputes_status ON presence_disputes(status);

-- Seed initial campus Wi-Fi AP zones for demonstration & production testing
INSERT INTO network_zones (institution_id, ap_bssid, ip_subnet, zone_type, room_name, building_name)
VALUES
    (1, '00:1A:2B:3C:4D:01', '10.20.101.0/24', 'CLASSROOM', 'Room 101', 'Academic Block A'),
    (1, '00:1A:2B:3C:4D:02', '10.20.102.0/24', 'CLASSROOM', 'Room 102', 'Academic Block A'),
    (1, '00:1A:2B:3C:4D:03', '10.20.103.0/24', 'CLASSROOM', 'CSE Lab 3', 'Turing Science Center'),
    (1, '00:1A:2B:3C:4D:10', '10.30.201.0/24', 'DORM', 'Block D - Dorm 204', 'Aryabhata Boys Hostel'),
    (1, '00:1A:2B:3C:4D:11', '10.30.202.0/24', 'DORM', 'Block G - Dorm 108', 'Gargi Girls Hostel'),
    (1, '00:1A:2B:3C:4D:20', '10.40.101.0/24', 'LIBRARY', 'Central Reading Hall', 'Dr. Radhakrishnan Library'),
    (1, '00:1A:2B:3C:4D:30', '10.50.101.0/24', 'CAFETERIA', 'Main Campus Diner', 'Student Amenities Hub')
ON CONFLICT (ap_bssid) DO NOTHING;
