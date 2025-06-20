-- Stage 4.1: Core Learning Features - Progress Tracking Tables
-- Create tables for lesson progress tracking, completion logic, and adaptive difficulty

-- User progress tracking table (core lesson completion tracking)
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'mastered'
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

-- Points history table (detailed points tracking for gamification)
CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    points_type TEXT NOT NULL, -- 'lesson', 'streak', 'achievement', 'bonus', etc.
    source_id INTEGER, -- lesson_id, achievement_id, etc.
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily statistics table (for streak tracking and daily goals)
CREATE TABLE IF NOT EXISTS daily_stats (
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

-- User vocabulary progress (detailed vocabulary mastery tracking)
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
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

-- User grammar progress (detailed grammar mastery tracking)
CREATE TABLE IF NOT EXISTS user_grammar_progress (
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

-- Update profiles table with additional gamification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 20; -- daily points goal
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_difficulty TEXT DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_velocity DECIMAL DEFAULT 0; -- lessons per week

-- Update lessons table with additional fields for adaptive difficulty
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 5; -- in minutes
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 10;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{"min_score": 60, "max_attempts": 5}';

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at);

CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_earned_at ON points_history(earned_at);
CREATE INDEX IF NOT EXISTS idx_points_history_type ON points_history(points_type);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_vocabulary_progress_user_id ON user_vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_progress_mastery ON user_vocabulary_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_progress_next_review ON user_vocabulary_progress(next_review);

CREATE INDEX IF NOT EXISTS idx_user_grammar_progress_user_id ON user_grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grammar_progress_mastery ON user_grammar_progress(mastery_level);

CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_lessons_type_difficulty ON lessons(lesson_type, difficulty_level);

-- Add updated_at trigger for progress tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_progress_updated_at 
    BEFORE UPDATE ON user_vocabulary_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_grammar_progress_updated_at 
    BEFORE UPDATE ON user_grammar_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for progress tracking tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress data
CREATE POLICY "Users can access own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own points history" ON points_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own daily stats" ON daily_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own vocabulary progress" ON user_vocabulary_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own grammar progress" ON user_grammar_progress
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies for analytics and management
CREATE POLICY "Admins can access all progress data" ON user_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can access points history" ON points_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Function to calculate user level based on total points
CREATE OR REPLACE FUNCTION calculate_user_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level progression: 0, 100, 300, 600, 1100, 1850, 2850, 4350, 6350, 9350+
    IF total_points < 100 THEN RETURN 1;
    ELSIF total_points < 300 THEN RETURN 2;
    ELSIF total_points < 600 THEN RETURN 3;
    ELSIF total_points < 1100 THEN RETURN 4;
    ELSIF total_points < 1850 THEN RETURN 5;
    ELSIF total_points < 2850 THEN RETURN 6;
    ELSIF total_points < 4350 THEN RETURN 7;
    ELSIF total_points < 6350 THEN RETURN 8;
    ELSIF total_points < 9350 THEN RETURN 9;
    ELSE RETURN 10 + FLOOR((total_points - 9350) / 3000); -- Each level after 10 requires 3000 more points
    END IF;
END;
$$ language 'plpgsql';

-- Function to update user level when points change
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_level = calculate_user_level(NEW.total_points);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update user level
CREATE TRIGGER update_profile_level 
    BEFORE UPDATE OF total_points ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Function to maintain daily streaks
CREATE OR REPLACE FUNCTION update_streak_on_activity()
RETURNS TRIGGER AS $$
DECLARE
    last_activity DATE;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get user's last activity date
    SELECT last_activity_date INTO last_activity 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Update streak logic
    IF last_activity IS NULL OR last_activity < current_date - INTERVAL '1 day' THEN
        -- Reset streak if more than 1 day gap
        IF last_activity IS NULL OR last_activity < current_date - INTERVAL '1 day' THEN
            UPDATE profiles 
            SET current_streak = 1,
                last_activity_date = current_date
            WHERE id = NEW.user_id;
        END IF;
    ELSIF last_activity = current_date - INTERVAL '1 day' THEN
        -- Increment streak for consecutive day
        UPDATE profiles 
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = current_date
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update streaks when lessons are completed
CREATE TRIGGER update_streak_on_lesson_completion
    AFTER INSERT ON user_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_streak_on_activity();

-- Insert some default lesson difficulty data for existing lessons
UPDATE lessons SET 
    difficulty_level = CASE 
        WHEN order_index <= 3 THEN 'beginner'
        WHEN order_index <= 7 THEN 'intermediate'
        ELSE 'advanced'
    END,
    estimated_duration = CASE lesson_type
        WHEN 'vocabulary' THEN 5
        WHEN 'grammar' THEN 8
        WHEN 'pronunciation' THEN 6
        WHEN 'conversation' THEN 10
        ELSE 7
    END,
    points_reward = CASE difficulty_level
        WHEN 'beginner' THEN 10
        WHEN 'intermediate' THEN 15
        WHEN 'advanced' THEN 20
        ELSE 10
    END
WHERE difficulty_level IS NULL OR difficulty_level = 'beginner';
