-- Search & Browse Curricula - Database Schema
-- Supports full-text search, vector embeddings, and user saved/adopted curricula.
-- Prerequisites: curricula, lessons, users tables must exist.

-- Curriculum search metadata (extends existing curricula or standalone)
CREATE TABLE IF NOT EXISTS curriculum_search_meta (
  curriculum_id UUID PRIMARY KEY REFERENCES curricula(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (source IN ('public', 'curated', 'user')),
  depth VARCHAR(20) NOT NULL DEFAULT 'intermediate' CHECK (depth IN ('intro', 'intermediate', 'deep')),
  time_estimate_minutes INT NOT NULL DEFAULT 0,
  rating_avg FLOAT,
  adoption_count INT NOT NULL DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en',
  full_text_tsvector TSVECTOR,
  embedding_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_curriculum_search_meta_source ON curriculum_search_meta(source);
CREATE INDEX idx_curriculum_search_meta_depth ON curriculum_search_meta(depth);
CREATE INDEX idx_curriculum_search_meta_rating ON curriculum_search_meta(rating_avg);
CREATE INDEX idx_curriculum_search_meta_adoption ON curriculum_search_meta(adoption_count);
CREATE INDEX idx_curriculum_search_meta_fulltext ON curriculum_search_meta USING GIN(full_text_tsvector);

-- Lesson embeddings for semantic search
CREATE TABLE IF NOT EXISTS lesson_search_meta (
  lesson_id UUID PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
  embedding_id VARCHAR(255),
  full_text_tsvector TSVECTOR,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lesson_search_meta_fulltext ON lesson_search_meta USING GIN(full_text_tsvector);

-- User saved curricula (bookmarks)
CREATE TABLE IF NOT EXISTS user_saved_curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  cloned_curriculum_id UUID REFERENCES curricula(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  adopted_flag BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, source_curriculum_id)
);

CREATE INDEX idx_user_saved_curricula_user ON user_saved_curricula(user_id);
CREATE INDEX idx_user_saved_curricula_source ON user_saved_curricula(source_curriculum_id);

-- Search analytics log
CREATE TABLE IF NOT EXISTS search_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query_text VARCHAR(512) NOT NULL,
  filters_json JSONB,
  result_count INT NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_log_user ON search_log(user_id);
CREATE INDEX idx_search_log_timestamp ON search_log(timestamp);

-- Autosuggest cache (optional - for popular queries/tags)
CREATE TABLE IF NOT EXISTS autosuggest_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('title', 'topic', 'author', 'query')),
  text VARCHAR(255) NOT NULL,
  meta VARCHAR(255),
  frequency INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autosuggest_cache_type_text ON autosuggest_cache(type, text);
