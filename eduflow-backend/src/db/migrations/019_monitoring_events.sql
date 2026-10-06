CREATE TABLE IF NOT EXISTS monitoring_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  user_id INTEGER REFERENCES users(id),
  institution_id INTEGER REFERENCES institutions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monitoring_events_type ON monitoring_events(event_type);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_severity ON monitoring_events(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_created ON monitoring_events(created_at);
