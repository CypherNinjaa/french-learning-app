-- ====================================================================
-- FRENCH LEARNING APP - COMPLETE DATABASE RECREATION SCRIPT
-- This script recreates the entire database from scratch
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- ⚠️ WARNING: THIS WILL DELETE ALL EXISTING DATA!
-- Only run this if you want to start completely fresh

-- ====================================================================
-- STEP 1: DROP ALL EXISTING TABLES (Clean Slate)
-- ====================================================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS user_milestone_completions CASCADE;
DROP TABLE IF EXISTS milestone_rewards CASCADE;
DROP TABLE IF EXISTS user_gamification_stats CASCADE;
DROP TABLE IF EXISTS streak_shields CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS user_challenge_completions CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS content_tag_associations CASCADE;
DROP TABLE IF EXISTS content_tags CASCADE;
DROP TABLE IF EXISTS lesson_tags CASCADE;
DROP TABLE IF EXISTS vocabulary_tags CASCADE;
DROP TABLE IF EXISTS lesson_grammar CASCADE;
DROP TABLE IF EXISTS lesson_vocabulary CASCADE;
DROP TABLE IF EXISTS user_grammar_progress CASCADE;
DROP TABLE IF EXISTS user_vocabulary_progress CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS points_history CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS grammar_rules CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS levels CASCADE;
DROP TABLE IF EXISTS pronunciation_words CASCADE;
DROP TABLE IF EXISTS content_cache_metadata CASCADE;
DROP TABLE IF EXISTS content_analytics CASCADE;
DROP TABLE IF EXISTS user_content_preferences CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS content_versions CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS daily_streaks CASCADE;
DROP TABLE IF EXISTS avatars CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_user_level() CASCADE;
-- DROP FUNCTION IF EXISTS initialize_user_gamification_stats() CASCADE; -- Removed

-- ====================================================================
-- STEP 2: CREATE UTILITY FUNCTIONS AND TRIGGERS
-- ====================================================================

-- Function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user level from points
CREATE OR REPLACE FUNCTION calculate_user_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level progression: 1-999 (1), 1000-2999 (2), 3000-5999 (3), etc.
  IF total_points < 1000 THEN RETURN 1;
  ELSIF total_points < 3000 THEN RETURN 2;
  ELSIF total_points < 6000 THEN RETURN 3;
  ELSIF total_points < 10000 THEN RETURN 4;
  ELSIF total_points < 15000 THEN RETURN 5;
  ELSIF total_points < 25000 THEN RETURN 6;
  ELSE RETURN 7;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update user level
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_level := calculate_user_level(NEW.total_points);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to initialize user gamification stats (removed to fix signup issues)
-- CREATE OR REPLACE FUNCTION initialize_user_gamification_stats()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO user_gamification_stats (user_id)
--   VALUES (NEW.id)
--   ON CONFLICT (user_id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- ====================================================================
-- STEP 3: CREATE CORE TABLES
-- ====================================================================

-- User roles enum
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'super_admin');

-- Main user profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  level TEXT DEFAULT 'beginner',
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  user_role TEXT DEFAULT 'user',
  last_login_at TIMESTAMP WITH TIME ZONE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  favorite_topic TEXT,
  daily_goal INTEGER DEFAULT 20,
  notification_enabled BOOLEAN DEFAULT true,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avatar storage table
CREATE TABLE avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- STEP 4: CREATE LEARNING CONTENT STRUCTURE
-- ====================================================================

-- Learning levels (Beginner, Intermediate, Advanced)
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules within each level
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  estimated_duration_minutes INTEGER DEFAULT 60,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  learning_objectives TEXT[], -- Array of learning objectives
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual lessons
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Dynamic content structure with sections
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('vocabulary', 'grammar', 'conversation', 'pronunciation', 'reading', 'listening')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  estimated_time_minutes INTEGER DEFAULT 10,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  points_reward INTEGER DEFAULT 10,
  completion_criteria JSONB DEFAULT '{"min_score": 60, "max_attempts": 5}',
  estimated_duration INTEGER DEFAULT 5, -- in minutes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- STEP 5: CREATE VOCABULARY SYSTEM
-- ====================================================================

-- Vocabulary words with pronunciation and examples
CREATE TABLE vocabulary (
  id SERIAL PRIMARY KEY,
  french_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  pronunciation TEXT, -- IPA or phonetic notation
  audio_url TEXT, -- URL to pronunciation audio
  example_sentence_fr TEXT,
  example_sentence_en TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- e.g., 'food', 'travel', 'business'
  gender TEXT CHECK (gender IN ('masculine', 'feminine', 'neutral')), -- For nouns
  word_type TEXT CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection')),
  conjugation_group TEXT, -- For verbs: 'first', 'second', 'third', 'irregular'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- STEP 6: CREATE GRAMMAR SYSTEM
-- ====================================================================

-- Grammar rules with examples
CREATE TABLE grammar_rules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  examples JSONB, -- Array of example objects with French and English
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- e.g., 'verbs', 'nouns', 'adjectives', 'sentence_structure'
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- STEP 7: CREATE QUESTIONS AND ASSESSMENTS
-- ====================================================================

-- Dynamic questions for lessons and assessments
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'pronunciation', 'matching', 'translation', 'listening')),
  options JSONB, -- For multiple choice, matching, etc.
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- Why this answer is correct
  points INTEGER DEFAULT 10,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  audio_url TEXT, -- For listening questions
  image_url TEXT, -- For visual questions
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- STEP 8: CREATE CONTENT RELATIONSHIPS
-- ====================================================================

-- Many-to-many: Lessons and Vocabulary
CREATE TABLE lesson_vocabulary (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary vocabulary for this lesson
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, vocabulary_id)
);

-- Many-to-many: Lessons and Grammar Rules
CREATE TABLE lesson_grammar (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  grammar_rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary grammar focus for this lesson
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, grammar_rule_id)
);

-- ====================================================================
-- STEP 9: CREATE CONTENT ORGANIZATION
-- ====================================================================

-- Content categories for organization
CREATE TABLE content_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  color TEXT, -- Hex color code
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content tags for flexible categorization
CREATE TABLE content_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#007AFF', -- Hex color code
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many: Lessons and Tags
CREATE TABLE lesson_tags (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, tag_id)
);

-- Many-to-many: Vocabulary and Tags
CREATE TABLE vocabulary_tags (
  id SERIAL PRIMARY KEY,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vocabulary_id, tag_id)
);

-- ====================================================================
-- STEP 10: CREATE USER PROGRESS TRACKING
-- ====================================================================

-- User lesson progress tracking
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    score INTEGER DEFAULT 0, -- 0-100 percentage score
    time_spent INTEGER DEFAULT 0, -- in seconds
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    section_progress JSONB DEFAULT '[]', -- Array of section progress objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Points history for detailed tracking
CREATE TABLE points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    points_type TEXT NOT NULL, -- 'lesson', 'streak', 'achievement', 'bonus', etc.
    source_id INTEGER, -- lesson_id, achievement_id, etc.
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily statistics
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    points_earned INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    lessons_started INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    study_time_minutes INTEGER DEFAULT 0,
    goal_met BOOLEAN DEFAULT false,
    streak_maintained BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- User vocabulary progress (spaced repetition)
CREATE TABLE user_vocabulary_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0, -- 0-5 scale (0=not started, 5=mastered)
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE, -- for spaced repetition
    difficulty_rating INTEGER DEFAULT 3, -- 1-5 user difficulty rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vocabulary_id)
);

-- User grammar progress
CREATE TABLE user_grammar_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    grammar_rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0, -- 0-5 scale
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    difficulty_rating INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, grammar_rule_id)
);

-- ====================================================================
-- STEP 11: CREATE GAMIFICATION SYSTEM
-- ====================================================================

-- Achievements system
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_color TEXT DEFAULT '#FFD700',
  points_required INTEGER DEFAULT 0,
  achievement_type TEXT DEFAULT 'general', -- 'general', 'streak', 'lessons', 'time'
  category TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'special'
  is_active BOOLEAN DEFAULT true,
  requirements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements tracking
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- For tracking partial progress
  is_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Daily challenges system
CREATE TABLE daily_challenges (
  id SERIAL PRIMARY KEY,
  challenge_date DATE UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL, -- Challenge requirements and goals
  reward_points INTEGER NOT NULL,
  challenge_type TEXT NOT NULL, -- 'lesson', 'vocabulary', 'streak', 'accuracy'
  difficulty_level TEXT DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User challenge completions
CREATE TABLE user_challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  points_earned INTEGER,
  performance_data JSONB, -- Store completion details
  UNIQUE(user_id, challenge_id)
);

-- Leaderboards system
CREATE TABLE leaderboard_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time', 'streak'
  period_start DATE,
  period_end DATE,
  score INTEGER NOT NULL,
  rank INTEGER,
  additional_data JSONB, -- Store category-specific data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streak shields system
CREATE TABLE streak_shields (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  shield_type TEXT DEFAULT 'daily', -- 'daily', 'weekly'
  is_used BOOLEAN DEFAULT false
);

-- User gamification stats
CREATE TABLE user_gamification_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_achievements INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_shields INTEGER DEFAULT 0,
  used_shields INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- in minutes
  lessons_completed_today INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  streak_freeze_used BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestone rewards system
CREATE TABLE milestone_rewards (
  id SERIAL PRIMARY KEY,
  milestone_type TEXT NOT NULL, -- 'points', 'streak', 'level', 'achievements'
  threshold_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'points', 'badge', 'content', 'feature'
  reward_data JSONB NOT NULL, -- Reward details
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- User milestone completions
CREATE TABLE user_milestone_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id INTEGER REFERENCES milestone_rewards(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, milestone_id)
);

-- ====================================================================
-- STEP 12: CREATE ADDITIONAL FEATURES
-- ====================================================================

-- User sessions for analytics
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  lessons_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  device_info JSONB
);

-- Daily streaks tracking
CREATE TABLE daily_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  activity_completed BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_date)
);

-- Pronunciation words with audio guides
CREATE TABLE pronunciation_words (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    pronunciation TEXT, -- IPA or phonetic notation
    audio_url TEXT, -- URL to pronunciation audio
    example_sentence_fr TEXT,
    example_sentence_en TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT, -- e.g., 'food', 'travel', 'business'
    pronunciation_tips TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Add compatibility columns that the frontend expects
    french TEXT GENERATED ALWAYS AS (french_word) STORED,
    english TEXT GENERATED ALWAYS AS (english_translation) STORED,
    example_sentence TEXT GENERATED ALWAYS AS (example_sentence_fr) STORED,
    example TEXT GENERATED ALWAYS AS (example_sentence_fr) STORED
);

-- Learning paths for personalized recommendations
CREATE TABLE learning_paths (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_level TEXT,
    recommended_lessons INTEGER[], -- Array of lesson IDs
    current_lesson_id INTEGER REFERENCES lessons(id),
    completion_percentage INTEGER DEFAULT 0,
    estimated_time_remaining INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User content preferences for personalization
CREATE TABLE user_content_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_lesson_types TEXT[], -- Array of lesson types
    difficulty_preference TEXT DEFAULT 'beginner',
    daily_goal_minutes INTEGER DEFAULT 30,
    learning_style TEXT, -- 'visual', 'auditory', 'kinesthetic', 'reading'
    topics_of_interest TEXT[], -- Array of topic categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content analytics for performance tracking
CREATE TABLE content_analytics (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL, -- 'completion_rate', 'average_score', 'time_spent', etc.
    metric_value DECIMAL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content cache metadata for API optimization
CREATE TABLE content_cache_metadata (
    id SERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL,
    content_hash TEXT NOT NULL, -- MD5 hash of content for change detection
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_time TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content versioning for tracking changes
CREATE TABLE content_versions (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Content tag associations (many-to-many for all content types)
CREATE TABLE content_tag_associations (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'lesson', 'vocabulary', 'grammar', 'question'
    content_id INTEGER NOT NULL,
    tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, tag_id)
);

-- ====================================================================
-- STEP 13: CREATE ADMIN SYSTEM
-- ====================================================================

-- Admin permissions
CREATE TABLE admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_role, permission_name)
);

-- Admin activity log
CREATE TABLE admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'content', 'system'
  target_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- STEP 14: CREATE PERFORMANCE INDEXES
-- ====================================================================

-- Content indexes
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX idx_lessons_active ON lessons(is_active);

CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty_level);
CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_word_type ON vocabulary(word_type);
CREATE INDEX idx_vocabulary_active ON vocabulary(is_active);

CREATE INDEX idx_grammar_difficulty ON grammar_rules(difficulty_level);
CREATE INDEX idx_grammar_category ON grammar_rules(category);
CREATE INDEX idx_grammar_active ON grammar_rules(is_active);

CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_active ON questions(is_active);

-- Association indexes
CREATE INDEX idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX idx_lesson_vocabulary_vocab_id ON lesson_vocabulary(vocabulary_id);
CREATE INDEX idx_lesson_grammar_lesson_id ON lesson_grammar(lesson_id);
CREATE INDEX idx_lesson_grammar_rule_id ON lesson_grammar(grammar_rule_id);

-- Progress tracking indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at);

CREATE INDEX idx_points_history_user_id ON points_history(user_id);
CREATE INDEX idx_points_history_earned_at ON points_history(earned_at);
CREATE INDEX idx_points_history_type ON points_history(points_type);

CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- Gamification indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX idx_user_challenge_completions_user_id ON user_challenge_completions(user_id);
CREATE INDEX idx_leaderboard_entries_type_period ON leaderboard_entries(leaderboard_type, period_start, period_end);
CREATE INDEX idx_streak_shields_user_id ON streak_shields(user_id);
CREATE INDEX idx_user_gamification_stats_user_id ON user_gamification_stats(user_id);

-- Content API indexes
CREATE INDEX idx_content_versions_type_id ON content_versions(content_type, content_id);
CREATE INDEX idx_content_versions_created_at ON content_versions(created_at);

-- Pronunciation indexes
CREATE INDEX idx_pronunciation_words_french_word ON pronunciation_words(french_word);
CREATE INDEX idx_pronunciation_words_difficulty ON pronunciation_words(difficulty_level);
CREATE INDEX idx_pronunciation_words_category ON pronunciation_words(category);
CREATE INDEX idx_pronunciation_words_active ON pronunciation_words(is_active);

-- ====================================================================
-- STEP 15: CREATE TRIGGERS
-- ====================================================================

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_levels_updated_at 
  BEFORE UPDATE ON levels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
  BEFORE UPDATE ON modules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON lessons 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at 
  BEFORE UPDATE ON vocabulary 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grammar_rules_updated_at 
  BEFORE UPDATE ON grammar_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_progress_updated_at 
  BEFORE UPDATE ON user_vocabulary_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_grammar_progress_updated_at 
  BEFORE UPDATE ON user_grammar_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update user level
CREATE TRIGGER update_profile_level 
    BEFORE UPDATE OF total_points ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Trigger to initialize gamification stats for new users (removed to fix signup issues)
-- CREATE TRIGGER trigger_initialize_user_gamification_stats
--   AFTER INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION initialize_user_gamification_stats();

-- ====================================================================
-- STEP 16: ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- STEP 17: CREATE RLS POLICIES
-- ====================================================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Content policies (public read, admin write)
CREATE POLICY "Allow authenticated users to read levels" ON levels FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read lessons" ON lessons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated users to read vocabulary" ON vocabulary FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated users to read grammar_rules" ON grammar_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated users to read questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated users to read lesson_vocabulary" ON lesson_vocabulary FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read lesson_grammar" ON lesson_grammar FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read content_categories" ON content_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated users to read content_tags" ON content_tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read lesson_tags" ON lesson_tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read vocabulary_tags" ON vocabulary_tags FOR SELECT USING (true);

-- Admin content management policies
CREATE POLICY "Allow admin users to manage levels" ON levels FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage modules" ON modules FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage lessons" ON lessons FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage vocabulary" ON vocabulary FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage grammar_rules" ON grammar_rules FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage questions" ON questions FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

-- User progress policies
CREATE POLICY "Users can access own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own points history" ON points_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own daily stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own vocabulary progress" ON user_vocabulary_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own grammar progress" ON user_grammar_progress FOR ALL USING (auth.uid() = user_id);

-- Gamification policies
CREATE POLICY "Allow public read access to achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can access own user achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to daily challenges" ON daily_challenges FOR SELECT USING (true);
CREATE POLICY "Users can access own challenge completions" ON user_challenge_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to leaderboards" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can access own streak shields" ON streak_shields FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own gamification stats" ON user_gamification_stats FOR ALL USING (auth.uid() = user_id);

-- Sessions and streaks policies
CREATE POLICY "Users can access own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own streaks" ON daily_streaks FOR ALL USING (auth.uid() = user_id);

-- Content API policies
CREATE POLICY "Users can access own learning paths" ON learning_paths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own content preferences" ON user_content_preferences FOR ALL USING (auth.uid() = user_id);

-- Pronunciation policies
CREATE POLICY "Allow public read access to pronunciation_words" ON pronunciation_words FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Super admins can manage permissions" ON admin_permissions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role = 'super_admin'));

CREATE POLICY "Admins can view activity log" ON admin_activity_log FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

-- ====================================================================
-- STEP 18: INSERT DEFAULT DATA
-- ====================================================================

-- Insert default levels
INSERT INTO levels (name, description, order_index) VALUES 
('Débutant', 'Complete beginner level - Basic French fundamentals', 1),
('Élémentaire', 'Elementary level - Building basic vocabulary and grammar', 2),
('Intermédiaire', 'Intermediate level - Expanding vocabulary and complex grammar', 3),
('Avancé', 'Advanced level - Fluent conversation and advanced topics', 4);

-- Insert default content categories
INSERT INTO content_categories (name, description, icon, color, order_index) VALUES
('Greetings', 'Basic greetings and introductions', '👋', '#FF6B6B', 1),
('Food & Dining', 'Food vocabulary and restaurant conversations', '🍽️', '#4ECDC4', 2),
('Travel', 'Travel-related vocabulary and phrases', '✈️', '#45B7D1', 3),
('Family', 'Family members and relationships', '👨‍👩‍👧‍👦', '#96CEB4', 4),
('Work & Study', 'Professional and academic vocabulary', '💼', '#F7B731', 5),
('Culture', 'French culture and traditions', '🎭', '#A55EEA', 6);

-- Insert default content tags
INSERT INTO content_tags (name, color, description) VALUES
('Beginner', '#34C759', 'Content suitable for beginners'),
('Intermediate', '#FF9500', 'Content suitable for intermediate learners'),
('Advanced', '#FF3B30', 'Content suitable for advanced learners'),
('Grammar', '#5856D6', 'Grammar-focused content'),
('Vocabulary', '#007AFF', 'Vocabulary-focused content'),
('Pronunciation', '#FF2D92', 'Pronunciation practice content'),
('Conversation', '#30B0C7', 'Conversation practice content'),
('Culture', '#8E8E93', 'Cultural content'),
('Business', '#FF9500', 'Business-related content'),
('Travel', '#34C759', 'Travel-related content'),
('Essential', '#FF3B30', 'Essential/core content'),
('Quick-learn', '#AF52DE', 'Quick learning content'),
('Grammar-focus', '#74B9FF', 'Grammar-heavy content');

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points_required, badge_color, achievement_type, category, requirements) VALUES
-- Beginner Achievements
('First Steps', 'Complete your first lesson', '🌟', 50, '#FFD700', 'beginner', 'learning', '{"lessons_completed": 1}'),
('Vocabulary Builder', 'Learn 50 words', '📚', 100, '#4CAF50', 'beginner', 'learning', '{"vocabulary_learned": 50}'),
('Grammar Explorer', 'Complete 10 grammar exercises', '🔍', 150, '#2196F3', 'beginner', 'learning', '{"grammar_exercises": 10}'),
('Pronunciation Pioneer', 'Complete 5 pronunciation exercises', '🗣️', 100, '#FF9800', 'beginner', 'learning', '{"pronunciation_exercises": 5}'),
('Consistent Learner', 'Maintain a 7-day streak', '🔥', 200, '#F44336', 'beginner', 'streak', '{"streak_days": 7}'),

-- Intermediate Achievements
('Conversation Starter', 'Complete your first conversation', '💬', 300, '#9C27B0', 'intermediate', 'learning', '{"conversations_completed": 1}'),
('Culture Enthusiast', 'Complete 5 cultural lessons', '🎭', 250, '#795548', 'intermediate', 'learning', '{"cultural_lessons": 5}'),
('Speed Learner', 'Complete 3 lessons in one day', '⚡', 300, '#FF5722', 'intermediate', 'learning', '{"lessons_per_day": 3}'),
('Streak Master', 'Maintain a 30-day streak', '🏆', 500, '#673AB7', 'intermediate', 'streak', '{"streak_days": 30}'),
('Point Collector', 'Earn 1000 points', '💎', 400, '#607D8B', 'intermediate', 'learning', '{"total_points": 1000}'),

-- Advanced Achievements
('Fluent Speaker', 'Complete 50 conversation exercises', '🗨️', 800, '#4CAF50', 'advanced', 'learning', '{"conversations_completed": 50}'),
('Cultural Expert', 'Complete all cultural modules', '🇫🇷', 1000, '#2196F3', 'advanced', 'learning', '{"cultural_modules_completed": 10}'),
('Perfectionist', 'Achieve 100 perfect lesson scores', '💎', 1200, '#E1BEE7', 'advanced', 'learning', '{"perfect_scores": 100}'),
('Marathon Learner', 'Maintain a 100-day streak', '🏃‍♂️', 2000, '#F44336', 'advanced', 'streak', '{"streak_days": 100}'),
('French Master', 'Reach Expert level', '👑👑', 5000, '#FFD700', 'advanced', 'learning', '{"user_level": 7}'),

-- Special Achievements
('Early Bird', 'Study before 7 AM (5 times)', '🌅', 200, '#FF9800', 'special', 'social', '{"early_sessions": 5}'),
('Night Owl', 'Study after 10 PM (5 times)', '🦉', 200, '#3F51B5', 'special', 'social', '{"late_sessions": 5}'),
('Weekend Warrior', 'Study on weekends (4 weeks)', '⚔️', 300, '#9C27B0', 'special', 'social', '{"weekend_sessions": 8}'),
('Challenge Champion', 'Complete 10 daily challenges', '🏆', 500, '#FFD700', 'special', 'challenge', '{"daily_challenges": 10}'),
('Social Learner', 'Share progress 5 times', '📱', 150, '#2196F3', 'special', 'social', '{"shares": 5}');

-- Insert default milestone rewards
INSERT INTO milestone_rewards (milestone_type, threshold_value, reward_type, reward_data, description) VALUES
('points', 1000, 'badge', '{"badge_name": "Rising Star", "badge_color": "#FFD700"}', 'Earned 1,000 points'),
('points', 5000, 'content', '{"unlock_type": "cultural_lessons", "count": 5}', 'Earned 5,000 points'),
('points', 10000, 'feature', '{"feature": "advanced_stats", "duration_days": 30}', 'Earned 10,000 points'),
('streak', 7, 'points', '{"bonus_points": 100}', '7-day streak milestone'),
('streak', 30, 'points', '{"bonus_points": 500}', '30-day streak milestone'),
('streak', 100, 'badge', '{"badge_name": "Streak Master", "badge_color": "#F44336"}', '100-day streak milestone'),
('level', 3, 'content', '{"unlock_type": "advanced_grammar", "count": 10}', 'Reached level 3'),
('level', 5, 'feature', '{"feature": "ai_tutor", "duration_days": 7}', 'Reached level 5'),
('achievements', 10, 'points', '{"bonus_points": 300}', 'Earned 10 achievements'),
('achievements', 25, 'badge', '{"badge_name": "Achievement Hunter", "badge_color": "#9C27B0"}', 'Earned 25 achievements');

-- Insert default admin permissions
INSERT INTO admin_permissions (name, description, category) VALUES
('manage_users', 'Create, update, and delete user accounts', 'user_management'),
('manage_content', 'Create, update, and delete learning content', 'content_management'),
('view_analytics', 'Access user analytics and reports', 'analytics'),
('manage_system', 'System configuration and maintenance', 'system'),
('moderate_content', 'Review and approve user-generated content', 'moderation');

-- Assign permissions to roles
INSERT INTO role_permissions (user_role, permission_name) VALUES
('admin', 'manage_content'),
('admin', 'view_analytics'),
('admin', 'moderate_content'),
('super_admin', 'manage_users'),
('super_admin', 'manage_content'),
('super_admin', 'view_analytics'),
('super_admin', 'manage_system'),
('super_admin', 'moderate_content');

-- ====================================================================
-- STEP 19: CREATE AVATAR STORAGE BUCKET AND POLICIES
-- ====================================================================

-- Create avatars storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies first (if they exist)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- ====================================================================
-- STEP 20: CREATE ADMIN DASHBOARD VIEW
-- ====================================================================

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE user_role = 'user') as total_users,
  (SELECT COUNT(*) FROM profiles WHERE user_role IN ('admin', 'super_admin')) as total_admins,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_this_week,
  (SELECT COUNT(*) FROM profiles WHERE last_login_at > NOW() - INTERVAL '24 hours') as active_users_today,
  (SELECT COUNT(*) FROM user_sessions WHERE session_start > NOW() - INTERVAL '24 hours') as sessions_today;

-- ====================================================================
-- STEP 21: SUCCESS MESSAGE AND VERIFICATION
-- ====================================================================

-- Display success message
SELECT 
  '🎉 FRENCH LEARNING APP DATABASE CREATED SUCCESSFULLY! 🎉' as message,
  'All tables, indexes, triggers, and policies have been created.' as details,
  'Your app is ready for content creation and user registration.' as status;

-- Display table counts for verification
SELECT 
  'Table Creation Summary' as section,
  'profiles' as table_name, 
  'Core user profiles and authentication' as description,
  COUNT(*) as records_count 
FROM profiles
UNION ALL
SELECT 'Tables', 'levels', 'Learning levels (Beginner, Intermediate, Advanced)', COUNT(*) FROM levels  
UNION ALL
SELECT 'Tables', 'content_categories', 'Content organization categories', COUNT(*) FROM content_categories
UNION ALL
SELECT 'Tables', 'content_tags', 'Flexible content tagging system', COUNT(*) FROM content_tags
UNION ALL
SELECT 'Tables', 'achievements', 'Gamification achievements system', COUNT(*) FROM achievements
UNION ALL
SELECT 'Tables', 'milestone_rewards', 'Milestone reward system', COUNT(*) FROM milestone_rewards
UNION ALL
SELECT 'Tables', 'admin_permissions', 'Admin permission system', COUNT(*) FROM admin_permissions
UNION ALL
SELECT 'Tables', 'role_permissions', 'Role-based permissions', COUNT(*) FROM role_permissions
ORDER BY section, table_name;

-- Display features summary
SELECT 
  '✅ FEATURES IMPLEMENTED' as summary,
  '• User Authentication & Profiles' as feature_1,
  '• Content Management (Lessons, Vocabulary, Grammar)' as feature_2,
  '• Progress Tracking & Analytics' as feature_3,
  '• Gamification System (Achievements, Streaks, Points)' as feature_4,
  '• Admin Panel & Content Management' as feature_5,
  '• Row Level Security (RLS) Protection' as feature_6,
  '• Performance Optimized Indexes' as feature_7,
  '• Automatic Triggers & Functions' as feature_8;

-- Display next steps
SELECT 
  '🚀 NEXT STEPS' as action,
  '1. Test user registration in your app' as step_1,
  '2. Create admin users via SQL or app' as step_2,
  '3. Add learning content via admin panel' as step_3,
  '4. Verify gamification features work' as step_4,
  '5. Test lesson completion and progress' as step_5,
  'Your French Learning App is now fully functional!' as final_message;
