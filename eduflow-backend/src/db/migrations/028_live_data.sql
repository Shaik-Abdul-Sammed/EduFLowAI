-- Migration 028: Live Data Cache and Search Logs
CREATE TABLE IF NOT EXISTS live_data_cache (
    id SERIAL PRIMARY KEY,
    source_key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_data_source_key ON live_data_cache(source_key);
CREATE INDEX IF NOT EXISTS idx_live_data_category ON live_data_cache(category);

CREATE TABLE IF NOT EXISTS live_search_logs (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER DEFAULT 1,
    user_id INTEGER,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    source VARCHAR(50) DEFAULT 'google_custom_search',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_search_institution ON live_search_logs(institution_id);
