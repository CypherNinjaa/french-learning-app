-- Stage 4.1: Essential Progress Tracking Tables (Simplified)
-- Create core tables needed for lesson progress tracking

-- Essential user progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Essential points tracking
CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    points_type TEXT NOT NULL,
    source_id INTEGER,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add essential fields to profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_points') THEN
        ALTER TABLE profiles ADD COLUMN total_points INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_level') THEN
        ALTER TABLE profiles ADD COLUMN current_level INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_streak') THEN
        ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add essential fields to lessons
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='estimated_duration') THEN
        ALTER TABLE lessons ADD COLUMN estimated_duration INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='points_reward') THEN
        ALTER TABLE lessons ADD COLUMN points_reward INTEGER DEFAULT 10;
    END IF;
END $$;

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id);

-- RLS policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users access own progress" ON user_progress;
DROP POLICY IF EXISTS "Users access own points" ON points_history;

CREATE POLICY "Users access own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own points" ON points_history
    FOR ALL USING (auth.uid() = user_id);
