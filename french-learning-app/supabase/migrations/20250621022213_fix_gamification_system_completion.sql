-- Fix Gamification System Completion
-- This migration adds the missing tables and components from the gamification system

-- Daily challenges system (missing)
CREATE TABLE IF NOT EXISTS daily_challenges (
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

-- User challenge completions (missing)
CREATE TABLE IF NOT EXISTS user_challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  challenge_id INTEGER REFERENCES daily_challenges(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  points_earned INTEGER,
  performance_data JSONB, -- Store completion details
  UNIQUE(user_id, challenge_id)
);

-- Leaderboards system (missing)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  leaderboard_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time', 'streak'
  period_start DATE,
  period_end DATE,
  score INTEGER NOT NULL,
  rank INTEGER,
  additional_data JSONB, -- Store category-specific data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streak shields system (missing)
CREATE TABLE IF NOT EXISTS streak_shields (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  shield_type TEXT DEFAULT 'daily', -- 'daily', 'weekly'
  is_used BOOLEAN DEFAULT false
);

-- User gamification stats (missing)
CREATE TABLE IF NOT EXISTS user_gamification_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
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

-- Milestone rewards system (missing)
CREATE TABLE IF NOT EXISTS milestone_rewards (
  id SERIAL PRIMARY KEY,
  milestone_type TEXT NOT NULL, -- 'points', 'streak', 'level', 'achievements'
  threshold_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'points', 'badge', 'content', 'feature'
  reward_data JSONB NOT NULL, -- Reward details
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- User milestone completions (missing)
CREATE TABLE IF NOT EXISTS user_milestone_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  milestone_id INTEGER REFERENCES milestone_rewards(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, milestone_id)
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_id ON user_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_period ON leaderboard_entries(leaderboard_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_streak_shields_user_id ON streak_shields(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_id ON user_gamification_stats(user_id);

-- Row Level Security (RLS) policies for new tables
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily challenges (public read)
CREATE POLICY "daily_challenges_public_read" ON daily_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "daily_challenges_admin_write" ON daily_challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- RLS Policies for user challenge completions
CREATE POLICY "user_challenge_completions_own_data" ON user_challenge_completions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for leaderboards (public read)
CREATE POLICY "leaderboard_entries_public_read" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "leaderboard_entries_own_data" ON leaderboard_entries FOR INSERT USING (auth.uid() = user_id);

-- RLS Policies for streak shields
CREATE POLICY "streak_shields_own_data" ON streak_shields FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user gamification stats
CREATE POLICY "user_gamification_stats_own_data" ON user_gamification_stats FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for milestone rewards (public read, admin write)
CREATE POLICY "milestone_rewards_public_read" ON milestone_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "milestone_rewards_admin_write" ON milestone_rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- RLS Policies for user milestone completions
CREATE POLICY "user_milestone_completions_own_data" ON user_milestone_completions FOR ALL USING (auth.uid() = user_id);

-- Insert default milestone rewards (only if table is empty)
INSERT INTO milestone_rewards (milestone_type, threshold_value, reward_type, reward_data, description) 
SELECT * FROM (VALUES
  ('points', 1000, 'badge', '{"badge_name": "Rising Star", "badge_color": "#FFD700"}', 'Earned 1,000 points'),
  ('points', 5000, 'content', '{"unlock_type": "cultural_lessons", "count": 5}', 'Earned 5,000 points'),
  ('points', 10000, 'feature', '{"feature": "advanced_stats", "duration_days": 30}', 'Earned 10,000 points'),
  ('streak', 7, 'points', '{"bonus_points": 100}', '7-day streak milestone'),
  ('streak', 30, 'points', '{"bonus_points": 500}', '30-day streak milestone'),
  ('streak', 100, 'badge', '{"badge_name": "Streak Master", "badge_color": "#F44336"}', '100-day streak milestone'),
  ('level', 3, 'content', '{"unlock_type": "advanced_grammar", "count": 10}', 'Reached level 3'),
  ('level', 5, 'feature', '{"feature": "ai_tutor", "duration_days": 7}', 'Reached level 5'),
  ('achievements', 10, 'points', '{"bonus_points": 300}', 'Earned 10 achievements'),
  ('achievements', 25, 'badge', '{"badge_name": "Achievement Hunter", "badge_color": "#9C27B0"}', 'Earned 25 achievements')
) AS v(milestone_type, threshold_value, reward_type, reward_data, description)
WHERE NOT EXISTS (SELECT 1 FROM milestone_rewards LIMIT 1);

-- Function to initialize user gamification stats (create if not exists)
CREATE OR REPLACE FUNCTION initialize_user_gamification_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_gamification_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_initialize_user_gamification_stats') THEN
    CREATE TRIGGER trigger_initialize_user_gamification_stats
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION initialize_user_gamification_stats();
  END IF;
END;
$$;

-- Populate user_gamification_stats for existing users who don't have stats yet
INSERT INTO user_gamification_stats (user_id)
SELECT id FROM profiles 
WHERE id NOT IN (SELECT user_id FROM user_gamification_stats);
