-- Migration 005: Automation Tables (leads, delivered_reports, invoices)

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  college_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city_state VARCHAR(255),
  student_count INTEGER,
  naac_cycle VARCHAR(50),
  message TEXT,
  status VARCHAR(30) DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','PILOT_OFFERED','PILOT_DELIVERED','WON','LOST')),
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT DEFAULT '',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE TABLE IF NOT EXISTS delivered_reports (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  token VARCHAR(64) UNIQUE,
  secure_token VARCHAR(64) UNIQUE,
  college_name VARCHAR(255),
  contact_email VARCHAR(255),
  report_type VARCHAR(100) DEFAULT 'NAAC_EXECUTIVE_SUMMARY',
  title VARCHAR(255),
  report_title VARCHAR(255),
  report_content TEXT,
  report_text TEXT,
  criteria_scores JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS delivered_reports_token_idx ON delivered_reports(secure_token);
CREATE INDEX IF NOT EXISTS idx_delivered_reports_token ON delivered_reports(token);
CREATE INDEX IF NOT EXISTS idx_delivered_reports_lead_id ON delivered_reports(lead_id);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  institution_name VARCHAR(255),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  address TEXT,
  gst_number VARCHAR(50),
  items JSONB DEFAULT '[]',
  amount DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 18.00,
  gst_percent DECIMAL(5,2) DEFAULT 18.00,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  description TEXT,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'UNPAID',
  bank_details TEXT,
  company_gst VARCHAR(50),
  notes TEXT DEFAULT '',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Column compatibility safeguards
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'college';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username) WHERE username IS NOT NULL;
