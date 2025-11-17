-- Initial schema for Academic Dashboard
-- Minimal schema - no sensitive data stored

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255)
);

-- Transcripts table (one per user)
CREATE TABLE IF NOT EXISTS transcripts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  degree VARCHAR(255)
);

-- Terms table
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  term_code VARCHAR(50),
  term_name VARCHAR(255),
  term_gpa DECIMAL(3,2),
  credits DECIMAL(5,2),
  earned_credits DECIMAL(5,2),
  points DECIMAL(6,2),
  is_planned BOOLEAN DEFAULT FALSE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(255),
  units DECIMAL(4,2),
  earned_units DECIMAL(4,2),
  grade VARCHAR(10),
  points DECIMAL(5,2)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_transcript_id ON terms(transcript_id);
CREATE INDEX IF NOT EXISTS idx_courses_term_id ON courses(term_id);
CREATE INDEX IF NOT EXISTS idx_terms_term_code ON terms(term_code);

