-- Migration 010: NIRF Ranking and Peer Benchmarking Architecture
-- Creates tables for NIRF score tracking, peer institutions benchmark data, reports, and improvement plans.

CREATE TABLE IF NOT EXISTS nirf_scores (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  nirf_category VARCHAR(50) DEFAULT 'Engineering',
  academic_year VARCHAR(20) DEFAULT '2024-25',
  tlr_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  rp_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  go_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  oi_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  pr_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  category_rank INTEGER,
  overall_rank INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nirf_scores_institution ON nirf_scores(institution_id);
CREATE INDEX IF NOT EXISTS idx_nirf_scores_category ON nirf_scores(nirf_category);

CREATE TABLE IF NOT EXISTS nirf_peer_institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'Engineering',
  academic_year VARCHAR(20) DEFAULT '2024',
  tlr_score NUMERIC(5,2) NOT NULL,
  rp_score NUMERIC(5,2) NOT NULL,
  go_score NUMERIC(5,2) NOT NULL,
  oi_score NUMERIC(5,2) NOT NULL,
  pr_score NUMERIC(5,2) NOT NULL,
  total_score NUMERIC(5,2) NOT NULL,
  nirf_rank INTEGER NOT NULL,
  naac_grade VARCHAR(10) DEFAULT 'A+',
  location_state VARCHAR(100),
  institution_type VARCHAR(100) DEFAULT 'University',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nirf_peers_rank ON nirf_peer_institutions(nirf_rank);
CREATE INDEX IF NOT EXISTS idx_nirf_peers_category ON nirf_peer_institutions(category);
CREATE INDEX IF NOT EXISTS idx_nirf_peers_type ON nirf_peer_institutions(institution_type);

CREATE TABLE IF NOT EXISTS nirf_benchmark_reports (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(50) DEFAULT 'Engineering',
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  peer_comparison JSONB NOT NULL DEFAULT '{}'::jsonb,
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nirf_benchmark_inst ON nirf_benchmark_reports(institution_id);

CREATE TABLE IF NOT EXISTS nirf_improvement_plans (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  current_score NUMERIC(5,2) NOT NULL,
  target_score NUMERIC(5,2) NOT NULL,
  target_rank INTEGER NOT NULL,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline_months INTEGER DEFAULT 12,
  estimated_effort VARCHAR(50) DEFAULT 'Medium',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nirf_improvement_inst ON nirf_improvement_plans(institution_id);
