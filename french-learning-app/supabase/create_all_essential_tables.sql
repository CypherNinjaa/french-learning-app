-- Create all essential tables for the French Learning App
-- Execute this in Supabase SQL Editor to restore all functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Policies for profiles (without admin check for now)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Insert default modules
INSERT INTO modules (title, description, level_id, order_index) VALUES 
('French Basics', 'Learn basic French greetings and phrases', 1, 1),
('Personal Introduction', 'Learn to introduce yourself in French', 1, 2),
('Numbers and Colors', 'Learn numbers and basic colors', 1, 3),
('Food and Dining', 'Essential food vocabulary', 2, 1),
('Travel Essentials', 'Travel-related vocabulary and phrases', 2, 2)
ON CONFLICT DO NOTHING;

-- 4. LESSONS TABLE (Main table for lesson content)
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    lesson_type TEXT DEFAULT 'vocabulary' CHECK (lesson_type IN ('vocabulary', 'grammar', 'pronunciation', 'conversation', 'cultural', 'mixed')),
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER DEFAULT 15, -- in minutes
    points_reward INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample lessons with proper content structure
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level) VALUES 
(1, 'Dire Bonjour', '{
    "introduction": "Learn how to greet people in French",
    "sections": [
        {
            "id": "vocab-greetings",
            "type": "vocabulary",
            "title": "Basic Greetings",
            "content": {
                "explanation": "These are the most common greetings in French",
                "words": [
                    {"french": "Bonjour", "english": "Hello/Good morning", "pronunciation": "bon-ZHOOR"},
                    {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"},
                    {"french": "Salut", "english": "Hi/Bye (informal)", "pronunciation": "sah-LUU"}
                ]
            },
            "order_index": 1,
            "is_required": true
        }
    ]
}', 'vocabulary', 1, 'beginner'),

(1, 'Politesse de Base', '{
    "introduction": "Learn essential polite expressions",
    "sections": [
        {
            "id": "vocab-politeness",
            "type": "vocabulary",
            "title": "Polite Expressions",
            "content": {
                "explanation": "These expressions show good manners in French",
                "words": [
                    {"french": "Merci", "english": "Thank you", "pronunciation": "mer-SEE"},
                    {"french": "Au revoir", "english": "Goodbye", "pronunciation": "oh ruh-VWAHR"},
                    {"french": "S''il vous plaît", "english": "Please", "pronunciation": "seel voo PLAY"}
                ]
            },
            "order_index": 1,
            "is_required": true
        }
    ]
}', 'vocabulary', 2, 'beginner'),

(2, 'Je me présente', '{
    "introduction": "Learn to introduce yourself in French",
    "sections": [
        {
            "id": "grammar-pronouns",
            "type": "grammar",
            "title": "Personal Pronouns",
            "content": {
                "explanation": "Personal pronouns are essential for introducing yourself",
                "pronouns": [
                    {"french": "Je", "english": "I", "example": "Je suis étudiant"},
                    {"french": "Tu", "english": "You (informal)", "example": "Tu es français?"},
                    {"french": "Il", "english": "He", "example": "Il s''appelle Pierre"},
                    {"french": "Elle", "english": "She", "example": "Elle est professeure"}
                ]
            },
            "order_index": 1,
            "is_required": true
        }
    ]
}', 'grammar', 1, 'beginner')
ON CONFLICT DO NOTHING;

-- 5. VOCABULARY TABLE
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    pronunciation TEXT,
    part_of_speech TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    example_sentence TEXT,
    audio_url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRAMMAR_RULES TABLE
CREATE TABLE IF NOT EXISTS grammar_rules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rule_category TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    examples JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER_PROGRESS TABLE (Track user progress through lessons)
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    attempts INTEGER DEFAULT 0,
    section_progress JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS for user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress
CREATE POLICY "Users can access own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- 8. POINTS_HISTORY TABLE (Track points earned)
CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    lesson_id INTEGER REFERENCES lessons(id),
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for points_history
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Policies for points_history
CREATE POLICY "Users can access own points" ON points_history FOR ALL USING (auth.uid() = user_id);

-- 9. DAILY_STATS TABLE (Track daily learning statistics)
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS for daily_stats
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for daily_stats
CREATE POLICY "Users can access own stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);

-- 10. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    badge_color TEXT DEFAULT '#FFD700',
    requirement_type TEXT NOT NULL, -- 'lessons_completed', 'streak', 'points', etc.
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points_reward) VALUES 
('First Steps', 'Complete your first lesson', '🎯', 'lessons_completed', 1, 50),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 7, 100),
('Point Master', 'Earn 1000 points', '⭐', 'points', 1000, 200)
ON CONFLICT DO NOTHING;

-- 11. USER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for user_achievements
CREATE POLICY "Users can access own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- 12. QUESTIONS TABLE (For quizzes and exercises)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_blank', 'true_false', 'matching')),
    options JSONB, -- For multiple choice questions
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    points INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_earned_at ON points_history(earned_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Enable RLS on main tables
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Public read policies for content tables
CREATE POLICY "Public can read levels" ON levels FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read modules" ON modules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read lessons" ON lessons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read vocabulary" ON vocabulary FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read grammar_rules" ON grammar_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read achievements" ON achievements FOR SELECT USING (is_active = true);

-- Admin content management policies (for authenticated users - to be refined later)
CREATE POLICY "Authenticated users can manage levels" ON levels FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage modules" ON modules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage lessons" ON lessons FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage vocabulary" ON vocabulary FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage grammar_rules" ON grammar_rules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage questions" ON questions FOR ALL USING (auth.uid() IS NOT NULL);

-- Add admin policies after profiles table is fully set up
-- This will be done in a separate step to avoid circular references

-- Verify tables were created
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
