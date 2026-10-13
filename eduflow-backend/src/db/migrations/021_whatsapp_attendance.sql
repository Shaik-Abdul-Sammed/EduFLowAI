-- Migration 021: WhatsApp-Based Faculty Attendance Tables
CREATE TABLE IF NOT EXISTS whatsapp_staged_attendance (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER DEFAULT 1,
    faculty_id INTEGER,
    faculty_phone VARCHAR(50),
    course_code VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    present_count INTEGER NOT NULL,
    absent_count INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, REJECTED, PROCESSED
    raw_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS whatsapp_message_log (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER DEFAULT 1,
    direction VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    body TEXT NOT NULL,
    message_sid VARCHAR(100),
    status VARCHAR(20) DEFAULT 'DELIVERED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_staged_status ON whatsapp_staged_attendance(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_staged_phone ON whatsapp_staged_attendance(faculty_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_from ON whatsapp_message_log(from_number);
