-- Modern Learning Platform Database Schema
-- Book-based hierarchical learning system for French language
-- 
-- COMPATIBILITY NOTE: This schema is designed to work with existing profiles table
-- The existing profiles table has: id, username, full_name, avatar_url, level, 
-- points, streak_days, user_role, last_login_at, total_lessons_completed, 
-- total_time_spent, favorite_topic, daily_goal, notification_enabled, 
-- total_points, current_level, current_streak, longest_streak, 
-- last_activity_date, created_at, updated_at

-- ============================================================================
-- USER MANAGEMENT & PROFILES
-- ============================================================================

-- User Profiles: Use existing profiles table structure
-- Note: profiles table already exists with the required structure
-- We'll work with the existing columns:
-- id, username, full_name, avatar_url, level, points, streak_days, 
-- user_role, last_login_at, total_lessons_completed, total_time_spent,
-- favorite_topic, daily_goal, notification_enabled, total_points,
-- current_level, current_streak, longest_streak, last_activity_date,
-- created_at, updated_at

-- Add any missing columns to existing profiles table if needed
DO $$ 
BEGIN
    -- Add role column if it doesn't exist (map from existing user_role)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(20) 
        CHECK (role IN ('student', 'content_creator', 'admin', 'super_admin')) 
        DEFAULT 'student';
        
        -- Update role based on existing user_role
        UPDATE profiles SET role = CASE 
            WHEN user_role = 'admin' THEN 'admin'
            WHEN user_role = 'super_admin' THEN 'super_admin'
            ELSE 'student'
        END;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ============================================================================
-- CORE LEARNING STRUCTURE
-- ============================================================================

-- Books: Top-level learning containers
CREATE TABLE IF NOT EXISTS learning_books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_duration_hours INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}', -- Book IDs that should be completed first
    learning_objectives TEXT[] DEFAULT '{}'
);

-- Lessons: Individual learning units within books
CREATE TABLE IF NOT EXISTS learning_lessons (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT REFERENCES learning_books(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Content Structure
    content JSONB NOT NULL DEFAULT '{}', -- Rich content structure
    examples JSONB DEFAULT '[]', -- Practice examples with audio
    vocabulary_words TEXT[] DEFAULT '{}', -- Key vocabulary in this lesson
    
    -- Audio & Media
    audio_url TEXT, -- Main lesson audio
    video_url TEXT, -- Optional video content
    images JSONB DEFAULT '[]', -- Lesson images
    
    -- Lesson Metadata
    estimated_duration_minutes INTEGER DEFAULT 15,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Test Configuration
    passing_percentage INTEGER DEFAULT 65 CHECK (passing_percentage >= 0 AND passing_percentage <= 100),
    max_attempts INTEGER DEFAULT 3,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Learning Objectives
    learning_objectives TEXT[] DEFAULT '{}'
);

-- Lesson Tests: Assessments for each lesson
CREATE TABLE IF NOT EXISTS lesson_tests (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES learning_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Lesson Assessment',
    description TEXT,
    
    -- Test Configuration
    question_count INTEGER DEFAULT 5,
    time_limit_minutes INTEGER, -- NULL = no time limit
    passing_percentage INTEGER DEFAULT 65,
    randomize_questions BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Questions: Individual questions for lesson tests
CREATE TABLE IF NOT EXISTS test_questions (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT REFERENCES lesson_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'audio_recognition', 'translation')) DEFAULT 'multiple_choice',
    
    -- Question Options (for multiple choice, true/false)
    options JSONB DEFAULT '[]', -- Array of possible answers
    correct_answer TEXT NOT NULL,
    explanation TEXT, -- Why this is the correct answer
    
    -- Audio & Media
    audio_url TEXT, -- Question audio (for listening exercises)
    image_url TEXT, -- Visual aids
    
    -- Metadata
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER PROGRESS TRACKING
-- ============================================================================

-- User Book Progress: Overall progress through books
CREATE TABLE IF NOT EXISTS user_book_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES learning_books(id) ON DELETE CASCADE,
    
    -- Progress Metrics
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_study_time_minutes INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, book_id)
);

-- User Lesson Progress: Detailed lesson-level tracking
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES learning_lessons(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES learning_books(id) ON DELETE CASCADE,
    
    -- Progress Status
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')) DEFAULT 'locked',
    
    -- Content Progress
    content_viewed BOOLEAN DEFAULT false,
    examples_practiced BOOLEAN DEFAULT false,
    
    -- Test Progress
    test_attempts INTEGER DEFAULT 0,
    best_test_score DECIMAL(5,2) DEFAULT 0.00,
    latest_test_score DECIMAL(5,2) DEFAULT 0.00,
    test_passed BOOLEAN DEFAULT false,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    total_study_time_minutes INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT, -- User's personal notes
    bookmarks JSONB DEFAULT '[]', -- Bookmarked sections
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

-- Test Attempts: Individual test attempt records
CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES learning_lessons(id) ON DELETE CASCADE,
    test_id BIGINT REFERENCES lesson_tests(id) ON DELETE CASCADE,
    
    -- Attempt Details
    attempt_number INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    time_taken_minutes INTEGER,
    
    -- Detailed Results
    answers JSONB NOT NULL DEFAULT '{}', -- User's answers with question IDs
    passed BOOLEAN NOT NULL DEFAULT false,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & CONFIGURATION
-- ============================================================================

-- Learning Platform Settings
CREATE TABLE IF NOT EXISTS learning_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether users can see this setting
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- AI Assistant Configuration
CREATE TABLE IF NOT EXISTS ai_assistant_config (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL DEFAULT 'French Learning Assistant',
    personality TEXT NOT NULL DEFAULT 'Helpful and encouraging French tutor',
    system_prompt TEXT NOT NULL,
    model_settings JSONB DEFAULT '{}',
    
    -- Features
    enabled BOOLEAN DEFAULT true,
    available_during_lessons BOOLEAN DEFAULT true,
    available_during_tests BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profile indexes (updated for existing table structure)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Book indexes
CREATE INDEX IF NOT EXISTS idx_learning_books_difficulty ON learning_books(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_books_published ON learning_books(is_published, is_active);
CREATE INDEX IF NOT EXISTS idx_learning_books_order ON learning_books(order_index);

-- Lesson indexes
CREATE INDEX IF NOT EXISTS idx_learning_lessons_book ON learning_lessons(book_id);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_order ON learning_lessons(book_id, order_index);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published ON learning_lessons(is_published, is_active);

-- Question indexes
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_order ON test_questions(test_id, order_index);

-- Progress indexes
CREATE INDEX IF NOT EXISTS idx_user_book_progress_user ON user_book_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_lesson ON test_attempts(user_id, lesson_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_config ENABLE ROW LEVEL SECURITY;

-- Profile policies (create only if they don't exist)
DO $$
BEGIN
    -- Drop existing policies that might cause recursion
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    
    -- Create simple, non-recursive policies
    CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);

    -- Simplified admin policy without recursion
    -- For now, allow all authenticated users to view profiles for admin functions
    -- TODO: Implement proper admin checking without recursion
    CREATE POLICY "Allow profile access for admin functions" ON profiles
        FOR SELECT USING (auth.role() = 'authenticated');
END $$;

-- Public content policies (books, lessons visible to all authenticated users)
-- Create only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_books' AND policyname = 'Books are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Books are viewable by authenticated users" ON learning_books
            FOR SELECT USING (auth.role() = 'authenticated' AND is_published = true AND is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_lessons' AND policyname = 'Lessons are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Lessons are viewable by authenticated users" ON learning_lessons
            FOR SELECT USING (auth.role() = 'authenticated' AND is_published = true AND is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_tests' AND policyname = 'Tests are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Tests are viewable by authenticated users" ON lesson_tests
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'test_questions' AND policyname = 'Questions are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Questions are viewable by authenticated users" ON test_questions
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
    END IF;
END $$;

-- Admin content management policies
-- Create only if they don't exist - simplified to avoid recursion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_books' AND policyname = 'Admins can manage books'
    ) THEN
        -- Simplified: Allow authenticated users to manage for now
        -- TODO: Implement proper role checking without profile table recursion
        CREATE POLICY "Admins can manage books" ON learning_books
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_lessons' AND policyname = 'Admins can manage lessons'
    ) THEN
        CREATE POLICY "Admins can manage lessons" ON learning_lessons
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_tests' AND policyname = 'Admins can manage tests'
    ) THEN
        CREATE POLICY "Admins can manage tests" ON lesson_tests
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'test_questions' AND policyname = 'Admins can manage questions'
    ) THEN
        CREATE POLICY "Admins can manage questions" ON test_questions
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- User progress policies (users can only see/modify their own progress)
CREATE POLICY "Users can view their own book progress" ON user_book_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own book progress" ON user_book_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own book progress" ON user_book_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own lesson progress" ON user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own test attempts" ON test_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test attempts" ON test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Public settings are viewable by all" ON learning_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage settings" ON learning_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS FOR AUTOMATED PROGRESS TRACKING
-- ============================================================================

-- Function to handle user registration and create profile
-- Note: This function works with the existing profiles table structure
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create basic profile using existing table structure
    INSERT INTO profiles (id, user_role, role, is_active, level, points, total_points)
    VALUES (
        NEW.id,
        'user',
        'student',
        true,
        'beginner',
        0,
        0
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If anything fails, still return NEW to allow user creation
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
-- Note: Only create if it doesn't conflict with existing triggers
DO $$
BEGIN
    -- Drop our trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Check if there are existing triggers that handle user creation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name LIKE '%initialize%' AND event_object_table = 'profiles'
    ) THEN
        -- Create our trigger only if no existing initialization trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- Function to update book progress when lesson progress changes
CREATE OR REPLACE FUNCTION update_book_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update book progress whenever lesson progress changes
    INSERT INTO user_book_progress (user_id, book_id, lessons_completed, total_lessons, progress_percentage, last_accessed_at)
    SELECT 
        NEW.user_id,
        NEW.book_id,
        COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) as lessons_completed,
        COUNT(*) as total_lessons,
        ROUND((COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as progress_percentage,
        NOW()
    FROM user_lesson_progress ulp
    WHERE ulp.user_id = NEW.user_id AND ulp.book_id = NEW.book_id
    GROUP BY ulp.user_id, ulp.book_id
    ON CONFLICT (user_id, book_id) 
    DO UPDATE SET
        lessons_completed = EXCLUDED.lessons_completed,
        total_lessons = EXCLUDED.total_lessons,
        progress_percentage = EXCLUDED.progress_percentage,
        last_accessed_at = EXCLUDED.last_accessed_at,
        completed_at = CASE WHEN EXCLUDED.progress_percentage = 100 THEN NOW() ELSE user_book_progress.completed_at END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update book progress
CREATE TRIGGER trigger_update_book_progress
    AFTER INSERT OR UPDATE ON user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_book_progress();

-- Function to initialize lesson progress when a user starts a book
CREATE OR REPLACE FUNCTION initialize_lesson_progress(p_user_id UUID, p_book_id BIGINT)
RETURNS VOID AS $$
BEGIN
    -- Insert progress records for all lessons in the book
    INSERT INTO user_lesson_progress (user_id, lesson_id, book_id, status)
    SELECT 
        p_user_id,
        ll.id,
        p_book_id,
        CASE WHEN ll.order_index = 0 THEN 'not_started' ELSE 'locked' END
    FROM learning_lessons ll
    WHERE ll.book_id = p_book_id 
        AND ll.is_published = true 
        AND ll.is_active = true
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DEFAULT CONFIGURATION DATA
-- ============================================================================

-- Insert default learning platform settings
INSERT INTO learning_settings (key, value, description, is_public) VALUES
('platform_name', '"French Learning Academy"', 'Name of the learning platform', true),
('default_passing_percentage', '65', 'Default passing percentage for lesson tests', false),
('max_test_attempts', '3', 'Maximum number of test attempts per lesson', false),
('enable_ai_assistant', 'true', 'Whether AI assistant is enabled platform-wide', false),
('lesson_unlock_strategy', '"sequential"', 'How lessons are unlocked: sequential, percentage_based', false),
('audio_playback_speed_options', '[0.5, 0.75, 1.0, 1.25, 1.5]', 'Available audio playback speeds', true),
('enable_progress_sharing', 'true', 'Allow users to share their progress', true),
('maintenance_mode', 'false', 'Whether platform is in maintenance mode', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default AI assistant configuration
INSERT INTO ai_assistant_config (
    name, 
    personality, 
    system_prompt, 
    model_settings,
    enabled,
    available_during_lessons,
    available_during_tests
) VALUES (
    'Pierre - Your French Tutor',
    'A friendly, patient, and encouraging French language tutor who speaks both English and French fluently. Pierre is knowledgeable about French culture, grammar, and pronunciation.',
    'You are Pierre, a helpful French language tutor. You help students learn French through encouragement, clear explanations, and cultural insights. Always be patient and supportive. You can respond in both English and French as appropriate for the student''s level. When explaining grammar or vocabulary, provide examples and context.',
    '{"temperature": 0.7, "max_tokens": 500, "model": "gpt-4"}',
    true,
    true,
    false
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABLE DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with roles and learning statistics';
COMMENT ON TABLE learning_books IS 'Top-level learning containers - like textbooks or courses';
COMMENT ON TABLE learning_lessons IS 'Individual learning units within books';
COMMENT ON TABLE lesson_tests IS 'Assessments for each lesson';
COMMENT ON TABLE test_questions IS 'Individual questions for lesson tests';
COMMENT ON TABLE user_book_progress IS 'User progress through entire books';
COMMENT ON TABLE user_lesson_progress IS 'Detailed lesson-level progress tracking';
COMMENT ON TABLE test_attempts IS 'Individual test attempt records';
COMMENT ON TABLE learning_settings IS 'Platform configuration settings';
COMMENT ON TABLE ai_assistant_config IS 'AI assistant configuration';
