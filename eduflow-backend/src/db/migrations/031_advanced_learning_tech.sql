-- Migration 031: Advanced Learning Technologies & Missing Roadmap Capabilities
-- EduFlow AI International Tier-1 University Learning & Innovation Stack

CREATE TABLE IF NOT EXISTS adaptive_learning_paths (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    current_level VARCHAR(64) DEFAULT 'Intermediate',
    recommended_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_style VARCHAR(64) DEFAULT 'Visual-Kinesthetic',
    mastery_score REAL DEFAULT 78.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adaptive_paths_student ON adaptive_learning_paths(student_id);

CREATE TABLE IF NOT EXISTS micro_credentials (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    student_roll VARCHAR(64),
    skill_name VARCHAR(128) NOT NULL,
    blockchain_hash VARCHAR(128) NOT NULL UNIQUE,
    issuer_name VARCHAR(128) DEFAULT 'EduFlow Global Academic Consortium',
    badge_icon VARCHAR(64) DEFAULT 'award',
    verification_url TEXT,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_micro_credentials_student ON micro_credentials(student_id);
CREATE INDEX IF NOT EXISTS idx_micro_credentials_hash ON micro_credentials(blockchain_hash);

CREATE TABLE IF NOT EXISTS plagiarism_reports (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(128) NOT NULL,
    student_id INT,
    assignment_title VARCHAR(255) DEFAULT 'Research Term Paper',
    content_snippet TEXT,
    ai_score REAL DEFAULT 0.0,
    similarity_percentage REAL DEFAULT 0.0,
    matched_sources JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'CLEAN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plagiarism_submission ON plagiarism_reports(submission_id);

CREATE TABLE IF NOT EXISTS gamification_profiles (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL UNIQUE,
    student_roll VARCHAR(64),
    student_name VARCHAR(128),
    xp_points INT DEFAULT 0,
    level INT DEFAULT 1,
    badges_json JSONB DEFAULT '[]'::jsonb,
    rank INT DEFAULT 1,
    streak_days INT DEFAULT 3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gamification_xp ON gamification_profiles(xp_points DESC);

CREATE TABLE IF NOT EXISTS digital_whiteboards (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(128) NOT NULL UNIQUE,
    board_data_json JSONB NOT NULL DEFAULT '{"elements": []}'::jsonb,
    created_by VARCHAR(128) DEFAULT 'Faculty Lead',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whiteboards_room ON digital_whiteboards(room_id);

CREATE TABLE IF NOT EXISTS simulation_results (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    simulation_type VARCHAR(128) NOT NULL,
    score REAL DEFAULT 0.0,
    duration_seconds INT DEFAULT 0,
    parameters_json JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_simulation_student ON simulation_results(student_id);

CREATE TABLE IF NOT EXISTS translation_logs (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    language_code VARCHAR(16) NOT NULL,
    module VARCHAR(64) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translation_lang ON translation_logs(language_code);
