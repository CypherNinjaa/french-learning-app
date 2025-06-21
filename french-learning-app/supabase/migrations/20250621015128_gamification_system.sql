-- Stage 7.2: Gamification System
-- Complete gamification implementation based on Gamification-System-Rules.md

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER DEFAULT 0,
  badge_color TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'special'
  category TEXT NOT NULL, -- 'learning', 'streak', 'social', 'challenge'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns to existing achievements table
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS achievement_type TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category TEXT;

-- Update achievement_type from type column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'type') THEN
    UPDATE achievements SET achievement_type = type WHERE achievement_type IS NULL;
  END IF;
END;
$$;

-- User achievements tracking
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  achievement_id INTEGER REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- For tracking partial progress
  is_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Daily challenges system
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

-- User challenge completions
CREATE TABLE IF NOT EXISTS user_challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  challenge_id INTEGER REFERENCES daily_challenges(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  points_earned INTEGER,
  performance_data JSONB, -- Store completion details
  UNIQUE(user_id, challenge_id)
);

-- Leaderboards system
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

-- Streak shields system
CREATE TABLE IF NOT EXISTS streak_shields (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  shield_type TEXT DEFAULT 'daily', -- 'daily', 'weekly'
  is_used BOOLEAN DEFAULT false
);

-- User gamification stats (extended profile)
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

-- Milestone rewards system
CREATE TABLE IF NOT EXISTS milestone_rewards (
  id SERIAL PRIMARY KEY,
  milestone_type TEXT NOT NULL, -- 'points', 'streak', 'level', 'achievements'
  threshold_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'points', 'badge', 'content', 'feature'
  reward_data JSONB NOT NULL, -- Reward details
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- User milestone completions
CREATE TABLE IF NOT EXISTS user_milestone_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  milestone_id INTEGER REFERENCES milestone_rewards(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, milestone_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_id ON user_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_period ON leaderboard_entries(leaderboard_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_streak_shields_user_id ON streak_shields(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_id ON user_gamification_stats(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read, admin write)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'achievements_public_read') THEN
    CREATE POLICY "achievements_public_read" ON achievements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'achievements_admin_write') THEN
    CREATE POLICY "achievements_admin_write" ON achievements FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin')
    );
  END IF;
END;
$$;

-- RLS Policies for user achievements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'user_achievements_own_data') THEN
    CREATE POLICY "user_achievements_own_data" ON user_achievements FOR ALL USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- RLS Policies for daily challenges (public read)
CREATE POLICY "daily_challenges_public_read" ON daily_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "daily_challenges_admin_write" ON daily_challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin')
);

-- RLS Policies for user challenge completions
CREATE POLICY "user_challenge_completions_own_data" ON user_challenge_completions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for leaderboards (public read)
CREATE POLICY "leaderboard_entries_public_read" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "leaderboard_entries_own_data" ON leaderboard_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streak shields
CREATE POLICY "streak_shields_own_data" ON streak_shields FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user gamification stats
CREATE POLICY "user_gamification_stats_own_data" ON user_gamification_stats FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for milestone rewards (public read, admin write)
CREATE POLICY "milestone_rewards_public_read" ON milestone_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "milestone_rewards_admin_write" ON milestone_rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin')
);

-- RLS Policies for user milestone completions
CREATE POLICY "user_milestone_completions_own_data" ON user_milestone_completions FOR ALL USING (auth.uid() = user_id);

-- Insert default achievements based on Gamification-System-Rules.md (only if table is empty)
INSERT INTO achievements (name, description, icon, points_required, badge_color, achievement_type, category) 
SELECT * FROM (VALUES
-- Beginner Achievements
('First Steps', 'Complete your first lesson', '🌟', 50, '#FFD700', 'beginner', 'learning'),
('Vocabulary Builder', 'Learn 50 words', '📚', 100, '#4CAF50', 'beginner', 'learning'),
('Grammar Explorer', 'Complete 10 grammar exercises', '🔍', 150, '#2196F3', 'beginner', 'learning'),
('Pronunciation Pioneer', 'Complete 5 pronunciation exercises', '🗣️', 100, '#FF9800', 'beginner', 'learning'),
('Consistent Learner', 'Maintain a 7-day streak', '🔥', 200, '#F44336', 'beginner', 'streak'),

-- Intermediate Achievements
('Conversation Starter', 'Complete your first conversation', '💬', 300, '#9C27B0', 'intermediate', 'learning'),
('Culture Enthusiast', 'Complete 5 cultural lessons', '🎭', 250, '#795548', 'intermediate', 'learning'),
('Grammar Master', 'Perfect score on 20 grammar quizzes', '👑', 500, '#FFD700', 'intermediate', 'learning'),
('Speed Learner', 'Complete 10 lessons in one day', '⚡', 400, '#FFEB3B', 'intermediate', 'learning'),
('Dedicated Student', 'Maintain a 30-day streak', '🔥🔥', 750, '#F44336', 'intermediate', 'streak'),

-- Advanced Achievements
('Fluent Speaker', 'Pass advanced conversation test', '🎯', 1000, '#4CAF50', 'advanced', 'learning'),
('Cultural Expert', 'Complete all cultural modules', '🏛️', 800, '#795548', 'advanced', 'learning'),
('Perfectionist', 'Achieve 100 perfect lesson scores', '💎', 1200, '#E1BEE7', 'advanced', 'learning'),
('Marathon Learner', 'Maintain a 100-day streak', '🏃‍♂️', 2000, '#F44336', 'advanced', 'streak'),
('French Master', 'Reach Expert level', '👑👑', 5000, '#FFD700', 'advanced', 'learning'),

-- Special Achievements
('Early Bird', 'Study before 7 AM (5 times)', '🌅', 200, '#FF9800', 'special', 'social'),
('Night Owl', 'Study after 10 PM (5 times)', '🦉', 200, '#3F51B5', 'special', 'social'),
('Weekend Warrior', 'Study on weekends (4 weeks)', '⚔️', 300, '#9C27B0', 'special', 'social'),
('Challenge Champion', 'Complete 10 daily challenges', '🏆', 500, '#FFD700', 'special', 'challenge'),
('Social Learner', 'Share progress 5 times', '📱', 150, '#2196F3', 'special', 'social')
) AS v(name, description, icon, points_required, badge_color, achievement_type, category)
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1);

-- Insert default milestone rewards (only if table is empty)
INSERT INTO milestone_rewards (milestone_type, threshold_value, reward_type, reward_data, description) 
SELECT * FROM (VALUES
  ('points', 1000, 'badge', '{"badge_name": "Rising Star", "badge_color": "#FFD700"}'::jsonb, 'Earned 1,000 points'),
  ('points', 5000, 'content', '{"unlock_type": "cultural_lessons", "count": 5}'::jsonb, 'Earned 5,000 points'),
  ('points', 10000, 'feature', '{"feature": "advanced_stats", "duration_days": 30}'::jsonb, 'Earned 10,000 points'),
  ('streak', 7, 'points', '{"bonus_points": 100}'::jsonb, '7-day streak milestone'),
  ('streak', 30, 'points', '{"bonus_points": 500}'::jsonb, '30-day streak milestone'),
  ('streak', 100, 'badge', '{"badge_name": "Streak Master", "badge_color": "#F44336"}'::jsonb, '100-day streak milestone'),
  ('level', 3, 'content', '{"unlock_type": "advanced_grammar", "count": 10}'::jsonb, 'Reached level 3'),
  ('level', 5, 'feature', '{"feature": "ai_tutor", "duration_days": 7}'::jsonb, 'Reached level 5'),
  ('achievements', 10, 'points', '{"bonus_points": 300}'::jsonb, 'Earned 10 achievements'),
  ('achievements', 25, 'badge', '{"badge_name": "Achievement Hunter", "badge_color": "#9C27B0"}'::jsonb, 'Earned 25 achievements')
) AS v(milestone_type, threshold_value, reward_type, reward_data, description)
WHERE NOT EXISTS (SELECT 1 FROM milestone_rewards LIMIT 1);

-- Function to initialize user gamification stats
CREATE OR REPLACE FUNCTION initialize_user_gamification_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_gamification_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize gamification stats for new users
CREATE TRIGGER trigger_initialize_user_gamification_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_gamification_stats();
