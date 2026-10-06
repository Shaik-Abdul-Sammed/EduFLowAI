-- 015_academic_calendar.sql: Academic calendar intelligence, holiday sync, and scheduling

CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  type VARCHAR(50) DEFAULT 'GAZETTED', -- GAZETTED, RESTRICTED, FESTIVAL, STATE
  state_code VARCHAR(10) DEFAULT 'ALL', -- ALL, AP, TS, TN, KA, KL, MH, DL, UP
  year INTEGER NOT NULL,
  source VARCHAR(100) DEFAULT 'government_gazette',
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (name, date, state_code)
);

CREATE INDEX IF NOT EXISTS holidays_year_state_idx ON holidays(year, state_code);
CREATE INDEX IF NOT EXISTS holidays_date_idx ON holidays(date);

CREATE TABLE IF NOT EXISTS academic_calendars (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  academic_year VARCHAR(50) NOT NULL, -- e.g. '2026-2027'
  semester_type VARCHAR(20) NOT NULL, -- 'ODD', 'EVEN', 'FULL_YEAR'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_working_days INTEGER DEFAULT 90,
  total_holidays INTEGER DEFAULT 15,
  status VARCHAR(30) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'PUBLISHED', 'ARCHIVED'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  calendar_id INTEGER REFERENCES academic_calendars(id) ON DELETE CASCADE,
  institution_id INTEGER REFERENCES institutions(id),
  event_type VARCHAR(50) NOT NULL, -- 'SEMESTER_START', 'MID_EXAM', 'LAB_EXAM', 'END_EXAM', 'VACATION', 'SPORTS', 'FEST'
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  affected_departments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_adjustments (
  id SERIAL PRIMARY KEY,
  calendar_id INTEGER REFERENCES academic_calendars(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) NOT NULL, -- 'EXTEND_HOLIDAY', 'REDUCE_HOLIDAY', 'POSTPONE_EXAM', 'COMPENSATORY_CLASS'
  original_event_id INTEGER REFERENCES calendar_events(id) ON DELETE SET NULL,
  new_start_date DATE,
  new_end_date DATE,
  reason TEXT NOT NULL,
  adjusted_by INTEGER REFERENCES users(id),
  adjusted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS government_holiday_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  last_fetched_at TIMESTAMP,
  fetch_status VARCHAR(30) DEFAULT 'IDLE',
  created_at TIMESTAMP DEFAULT NOW()
);
