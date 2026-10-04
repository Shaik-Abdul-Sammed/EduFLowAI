-- EduFlow AI OS: AI Analysis Layer Migration
-- Creates tables for NAAC report analyses, peer team visit predictions, and improvement plans

CREATE TABLE IF NOT EXISTS naac_report_analyses (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  report_id INTEGER,
  report_type VARCHAR(50),
  criterion_number INTEGER,
  analysis_type VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  input_summary TEXT,
  analysis_output JSONB,
  model_used VARCHAR(50),
  tokens_used INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS naac_report_analyses_inst_idx ON naac_report_analyses(institution_id);
CREATE INDEX IF NOT EXISTS naac_report_analyses_type_idx ON naac_report_analyses(analysis_type);

CREATE TABLE IF NOT EXISTS naac_visit_predictions (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  predicted_visit_score DECIMAL(4,2),
  predicted_grade VARCHAR(10),
  predicted_cgpa DECIMAL(4,2),
  confidence DECIMAL(4,2),
  peer_team_concerns JSONB,
  peer_team_strengths JSONB,
  prepared_recommendations JSONB,
  visit_readiness_score INTEGER,
  estimated_visit_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS naac_visit_predictions_inst_idx ON naac_visit_predictions(institution_id);

CREATE TABLE IF NOT EXISTS naac_improvement_plans (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  current_grade VARCHAR(10),
  current_cgpa DECIMAL(4,2),
  target_grade VARCHAR(10),
  target_cgpa DECIMAL(4,2),
  gap_analysis JSONB,
  roadmap JSONB,
  timeline_months INTEGER,
  estimated_effort VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
