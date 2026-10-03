-- EduFlow AI OS: Automation Tables & Schema Migration
-- Idempotently ensures all automation tables and columns exist

-- 1. Ensure automation_type column exists on leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS automation_type VARCHAR(50) DEFAULT 'accreditation';
CREATE INDEX IF NOT EXISTS leads_automation_type_idx ON leads(automation_type);

-- 2. Ensure delivered_reports table exists
CREATE TABLE IF NOT EXISTS delivered_reports (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) DEFAULT 'NAAC_EXECUTIVE_SUMMARY',
  title VARCHAR(255) NOT NULL,
  report_content TEXT NOT NULL,
  criteria_scores JSONB DEFAULT '{}'::jsonb,
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivered_reports_token ON delivered_reports(token);
CREATE INDEX IF NOT EXISTS idx_delivered_reports_lead_id ON delivered_reports(lead_id);

-- 3. Ensure invoices table exists
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) DEFAULT '',
  contact_email VARCHAR(255) NOT NULL,
  address TEXT DEFAULT '',
  gst_number VARCHAR(50) DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  amount NUMERIC(12,2) DEFAULT 0.00,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_percent NUMERIC(5,2) DEFAULT 18.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  description TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'UNPAID',
  bank_details TEXT DEFAULT '',
  company_gst VARCHAR(50) DEFAULT '',
  notes TEXT DEFAULT '',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

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
