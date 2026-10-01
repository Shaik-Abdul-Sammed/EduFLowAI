-- Migration: Create leads table for Automation Business
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
  status VARCHAR(30) DEFAULT 'NEW',
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
