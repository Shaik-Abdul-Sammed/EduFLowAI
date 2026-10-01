CREATE TABLE IF NOT EXISTS delivered_reports (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL DEFAULT 'NAAC_EXECUTIVE_SUMMARY',
  title VARCHAR(255) NOT NULL,
  report_content TEXT NOT NULL,
  criteria_scores JSONB,
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivered_reports_token ON delivered_reports(token);
CREATE INDEX IF NOT EXISTS idx_delivered_reports_lead_id ON delivered_reports(lead_id);
