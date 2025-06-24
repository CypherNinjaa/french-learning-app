-- Final Database Restore Script for French Learning App
-- Execute this in Supabase SQL Editor to restore all functionality
-- Version: Final - No circular dependencies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on our tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 1. PROFILES TABLE (User profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Gamification fields
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    daily_goal INTEGER DEFAULT 50
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. LEVELS TABLE
CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for levels
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- Insert default levels
INSERT INTO levels (name, description, order_index) VALUES 
('Beginner', 'Basic French for beginners', 1),
('Intermediate', 'Intermediate French skills', 2),
('Advanced', 'Advanced French proficiency', 3)
ON CONFLICT DO NOTHING;

-- 3. MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    estimated_duration_minutes INTEGER DEFAULT 30,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    learning_objectives TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Insert default modules
INSERT INTO modules (title, description, level_id, order_index) VALUES 
('French Basics', 'Learn basic French greetings and phrases', 1, 1),
('Personal Introduction', 'Learn to introduce yourself in French', 1, 2),
('Numbers and Colors', 'Learn numbers and basic colors', 1, 3),
('Food and Dining', 'Essential food vocabulary', 2, 1),
('Travel Essentials', 'Travel-related vocabulary and phrases', 2, 2)
ON CONFLICT DO NOTHING;

-- 4. LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{"sections": []}',
    lesson_type TEXT DEFAULT 'vocabulary' CHECK (lesson_type IN ('vocabulary', 'grammar', 'pronunciation', 'conversation', 'cultural', 'mixed')),
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER DEFAULT 15,
    points_reward INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Insert sample lessons with proper content structure
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level) VALUES 
(1, 'Dire Bonjour', '{
    "introduction": "Learn how to greet people in French",
    "sections": [
        {
            "id": "vocab-greetings",
            "type": "vocabulary",
            "title": "Greetings",
            "items": [
                {"french": "Bonjour", "english": "Hello", "pronunciation": "bon-ZHOOR"},
                {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"},
                {"french": "Salut", "english": "Hi", "pronunciation": "sah-LU"}
            ]
        }
    ]
}', 'vocabulary', 1, 'beginner'),
(1, 'Les Nombres', '{
    "introduction": "Learn basic numbers in French",
    "sections": [
        {
            "id": "numbers-1-10",
            "type": "vocabulary",
            "title": "Numbers 1-10",
            "items": [
                {"french": "un", "english": "one", "pronunciation": "uhn"},
                {"french": "deux", "english": "two", "pronunciation": "duh"},
                {"french": "trois", "english": "three", "pronunciation": "twah"}
            ]
        }
    ]
}', 'vocabulary', 2, 'beginner')
ON CONFLICT DO NOTHING;

-- 5. VOCABULARY TABLE
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    pronunciation TEXT,
    part_of_speech TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for vocabulary
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- 6. GRAMMAR RULES TABLE
CREATE TABLE IF NOT EXISTS grammar_rules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    rule_text TEXT NOT NULL,
    examples JSONB DEFAULT '[]',
    category TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for grammar_rules
ALTER TABLE grammar_rules ENABLE ROW LEVEL SECURITY;

-- 7. USER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS for user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 8. POINTS HISTORY TABLE
CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for points_history
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- 9. DAILY STATS TABLE
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS for daily_stats
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- 10. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria JSONB NOT NULL,
    points_reward INTEGER DEFAULT 0,
    badge_color TEXT DEFAULT '#FFD700',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, criteria, points_reward, badge_color) VALUES 
('First Steps', 'Complete your first lesson', '🎯', '{"type": "lessons_completed", "count": 1}', 50, '#4CAF50'),
('Dedicated Learner', 'Complete 5 lessons', '📚', '{"type": "lessons_completed", "count": 5}', 100, '#2196F3'),
('Week Warrior', 'Maintain a 7-day streak', '🔥', '{"type": "streak_days", "count": 7}', 200, '#FF5722')
ON CONFLICT DO NOTHING;

-- 11. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 12. QUESTIONS TABLE (for exercises)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'fill_blank', 'translation', 'audio', 'matching')),
    options JSONB DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_modules_level_id ON modules(level_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_lesson_id ON grammar_rules(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);

-- CREATE ROW LEVEL SECURITY POLICIES

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Content policies (public read, authenticated write)
CREATE POLICY "Public can read levels" ON levels FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read modules" ON modules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read lessons" ON lessons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read vocabulary" ON vocabulary FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read grammar_rules" ON grammar_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read achievements" ON achievements FOR SELECT USING (is_active = true);

-- Management policies (authenticated users for now - to be refined with admin checks later)
CREATE POLICY "Authenticated users can manage levels" ON levels FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage modules" ON modules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage lessons" ON lessons FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage vocabulary" ON vocabulary FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage grammar_rules" ON grammar_rules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage questions" ON questions FOR ALL USING (auth.uid() IS NOT NULL);

-- User-specific data policies
CREATE POLICY "Users can access own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own points" ON points_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- CREATE FUNCTION TO AUTO-UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_levels_updated_at BEFORE UPDATE ON levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grammar_rules_updated_at BEFORE UPDATE ON grammar_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VERIFICATION QUERY
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 'levels', 'modules', 'lessons', 'vocabulary', 
        'grammar_rules', 'user_progress', 'points_history', 'daily_stats',
        'achievements', 'user_achievements', 'questions'
    )
ORDER BY tablename;

-- Show created policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
