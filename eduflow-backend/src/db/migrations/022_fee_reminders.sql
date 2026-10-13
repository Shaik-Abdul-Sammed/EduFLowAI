-- Migration 022: Automated Fee Reminders and Collections System
CREATE TABLE IF NOT EXISTS fee_reminder_log (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER DEFAULT 1,
    invoice_id INTEGER NOT NULL,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    student_phone VARCHAR(50),
    channel VARCHAR(20) NOT NULL, -- EMAIL, WHATSAPP, SMS
    template_used VARCHAR(50), -- TIER_1, TIER_2, TIER_3, TIER_4
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SENT', -- SENT, FAILED, OPENED, PAID
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS fee_reminder_settings (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER UNIQUE DEFAULT 1,
    cadence_days JSONB DEFAULT '[1, 7, 15, 30, 45, 60]',
    channels JSONB DEFAULT '{"email": true, "whatsapp": true, "sms": false}',
    custom_templates JSONB,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fee_reminder_inst ON fee_reminder_log(institution_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminder_inv ON fee_reminder_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminder_status ON fee_reminder_log(status);
