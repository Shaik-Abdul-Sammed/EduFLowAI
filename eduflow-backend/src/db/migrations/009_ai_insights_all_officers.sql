-- Migration 009: AI Insights Across All Officers
-- Stores explain, ask, predict, and improve runs and historical prediction snapshots

CREATE TABLE IF NOT EXISTS ai_insight_runs (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  officer_domain VARCHAR(50) NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  input_text TEXT,
  input_context JSONB,
  output_data JSONB,
  model_used VARCHAR(50),
  tokens_used INTEGER,
  duration_ms INTEGER,
  confidence NUMERIC(4,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insight_runs_inst ON ai_insight_runs(institution_id);
CREATE INDEX IF NOT EXISTS idx_ai_insight_runs_domain ON ai_insight_runs(officer_domain);
CREATE INDEX IF NOT EXISTS idx_ai_insight_runs_type ON ai_insight_runs(insight_type);

CREATE TABLE IF NOT EXISTS ai_prediction_snapshots (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  officer_domain VARCHAR(50) NOT NULL,
  current_score NUMERIC(5,2),
  predicted_score NUMERIC(5,2),
  predicted_outcome VARCHAR(100),
  confidence NUMERIC(4,2),
  risk_factors JSONB,
  opportunities JSONB,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_pred_snapshots_inst_domain ON ai_prediction_snapshots(institution_id, officer_domain);
