-- 024_academic_escalations.sql: Table for finance escalations requesting HOD academic action

CREATE TABLE IF NOT EXISTS academic_escalations (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  invoice_id INTEGER REFERENCES invoices(id),
  student_id INTEGER,
  raised_by INTEGER REFERENCES users(id),
  raised_at TIMESTAMP DEFAULT NOW(),
  action_requested VARCHAR(50),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  effective_from DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_escalations_status ON academic_escalations(status);
CREATE INDEX IF NOT EXISTS idx_academic_escalations_inst ON academic_escalations(institution_id);
