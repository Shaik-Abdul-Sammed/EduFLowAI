-- EduFlow AI OS Database Schema
-- Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  type TEXT DEFAULT 'college',
  short_code TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'free',
  primary_color TEXT DEFAULT '#2563EB',
  secondary_color TEXT DEFAULT '#1E40AF',
  logo_url TEXT,
  admin_email TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital Twins (persistent AI knowledge per institution)
CREATE TABLE IF NOT EXISTS digital_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID UNIQUE NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  knowledge JSONB NOT NULL DEFAULT '{}',
  modules JSONB NOT NULL DEFAULT '[]',
  theme JSONB NOT NULL DEFAULT '{}',
  navigation JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge documents (uploaded PDFs, URLs, etc.)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('pdf','url','docx','xlsx','image','text')),
  source_name TEXT NOT NULL,
  extracted_text TEXT,
  structured_knowledge JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flutter build jobs
CREATE TABLE IF NOT EXISTS build_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','generating','building','analyzing','repairing','done','failed')),
  trigger_message TEXT,
  generation_spec JSONB DEFAULT '{}',
  logs TEXT DEFAULT '',
  error_log TEXT,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Compiled releases
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  build_job_id UUID REFERENCES build_jobs(id),
  version TEXT NOT NULL,
  version_code INT NOT NULL,
  apk_url TEXT,
  aab_url TEXT,
  release_notes TEXT,
  store_listing JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module Marketplace
CREATE TABLE IF NOT EXISTS marketplace_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  price_usd NUMERIC(10,2) DEFAULT 0,
  install_count INT DEFAULT 0,
  source_institution_id UUID REFERENCES institutions(id),
  module_spec JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_conversations_institution ON conversations(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_build_jobs_institution ON build_jobs(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_releases_institution ON releases(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_institution ON knowledge_documents(institution_id, created_at DESC);

-- ============================================
-- EduFlow AI OS v2.0 — AI Officers Schema
-- ============================================

-- AI Officer sessions per institution
CREATE TABLE IF NOT EXISTS officer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  officer_type TEXT NOT NULL CHECK (officer_type IN ('accreditation','timetable','admissions','finance','student_success')),
  messages JSONB NOT NULL DEFAULT '[]',
  last_output JSONB DEFAULT '{}',
  roi_hours_saved NUMERIC(10,2) DEFAULT 0,
  roi_money_saved NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated reports (NAAC, NBA, financial, etc.)
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  officer_type TEXT NOT NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  file_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','final','submitted')),
  hours_saved NUMERIC(8,2),
  money_saved NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institution Knowledge Graph nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('campus','department','course','subject','faculty','student','policy','facility')),
  node_id TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  parent_id UUID REFERENCES knowledge_nodes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(institution_id, node_type, node_id)
);

-- ROI Metrics tracking (per action)
CREATE TABLE IF NOT EXISTS roi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  officer_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  hours_saved NUMERIC(8,2) DEFAULT 0,
  money_saved NUMERIC(12,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for officer tables
CREATE INDEX IF NOT EXISTS idx_officer_sessions_institution ON officer_sessions(institution_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_institution ON generated_reports(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_institution ON knowledge_nodes(institution_id, node_type);
CREATE INDEX IF NOT EXISTS idx_roi_metrics_institution ON roi_metrics(institution_id, recorded_at DESC);

-- ============================================
-- EduFlow AI OS v2.1 — Authentication & Users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'parent', 'admin')),
  username TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, username)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id, role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_institution ON audit_logs(institution_id, created_at DESC);

-- Phase 3: GuardianWatch & CareerForge
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  total_classes INT DEFAULT 0,
  attended_classes INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_university TEXT NOT NULL,
  target_program TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  generated_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Recent Searches (Search persistence & audit)
-- ============================================

CREATE TABLE IF NOT EXISTS recent_searches (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  query TEXT NOT NULL,
  route_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role, route_path)
);

CREATE INDEX IF NOT EXISTS recent_searches_role_created_idx ON recent_searches (role, created_at DESC);


-- ============================================
-- Automation Business (Leads, Delivered Reports, Invoices)
-- ============================================

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
