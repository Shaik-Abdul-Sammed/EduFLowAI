CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  user_id INTEGER REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  response TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_institution ON support_tickets(institution_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
