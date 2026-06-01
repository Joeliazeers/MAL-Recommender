-- Base schema: core tables required by all subsequent migrations
-- This migration must run first (earliest timestamp)

-- Users table: stores MAL OAuth users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mal_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_mal_id ON users(mal_id);

-- User anime list cache
CREATE TABLE IF NOT EXISTS user_anime_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mal_anime_id BIGINT NOT NULL,
  title TEXT,
  image_url TEXT,
  score INTEGER DEFAULT 0,
  status VARCHAR(50),
  genres JSONB DEFAULT '[]'::jsonb,
  synopsis TEXT,
  studios JSONB DEFAULT '[]'::jsonb,
  mean_score DECIMAL,
  popularity INTEGER,
  season VARCHAR(20),
  year INTEGER,
  num_episodes INTEGER,
  media_type VARCHAR(50),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mal_anime_id)
);

CREATE INDEX IF NOT EXISTS idx_user_anime_list_user_id ON user_anime_list(user_id);
CREATE INDEX IF NOT EXISTS idx_user_anime_list_mal_id ON user_anime_list(mal_anime_id);

-- User manga list cache
CREATE TABLE IF NOT EXISTS user_manga_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mal_manga_id BIGINT NOT NULL,
  title TEXT,
  image_url TEXT,
  score INTEGER DEFAULT 0,
  status VARCHAR(50),
  genres JSONB DEFAULT '[]'::jsonb,
  synopsis TEXT,
  authors JSONB DEFAULT '[]'::jsonb,
  mean_score DECIMAL,
  popularity INTEGER,
  num_chapters INTEGER,
  num_volumes INTEGER,
  media_type VARCHAR(50),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mal_manga_id)
);

CREATE INDEX IF NOT EXISTS idx_user_manga_list_user_id ON user_manga_list(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manga_list_mal_id ON user_manga_list(mal_manga_id);

-- Shared recommendations
CREATE TABLE IF NOT EXISTS shared_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(10) CHECK (type IN ('anime', 'manga')),
  mode VARCHAR(20),
  recommendations JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_rec_share_code ON shared_recommendations(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_rec_expires ON shared_recommendations(expires_at);
