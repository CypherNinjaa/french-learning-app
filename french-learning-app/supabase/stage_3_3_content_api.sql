-- Stage 3.3: Content Versioning and API Enhancement Tables
-- Create tables to support content versioning and advanced API features

-- Content versions table for tracking content changes
CREATE TABLE IF NOT EXISTS content_versions (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'level', 'module', 'lesson', 'vocabulary', 'grammar_rule'
    content_id INTEGER NOT NULL,
    version TEXT NOT NULL,
    changes JSONB, -- Store the changes made in this version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for efficient version lookups
CREATE INDEX IF NOT EXISTS idx_content_versions_type_id ON content_versions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at);

-- Learning paths table for personalized recommendations
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_level TEXT NOT NULL,
    recommended_lessons INTEGER[], -- Array of lesson IDs
    current_lesson_id INTEGER REFERENCES lessons(id),
    completion_percentage INTEGER DEFAULT 0,
    estimated_time_remaining INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User content preferences for personalization
CREATE TABLE IF NOT EXISTS user_content_preferences (
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

-- Content analytics for tracking performance
CREATE TABLE IF NOT EXISTS content_analytics (
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
CREATE TABLE IF NOT EXISTS content_cache_metadata (
    id SERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL,
    content_hash TEXT NOT NULL, -- MD5 hash of content for change detection
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_time TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson vocabulary associations (many-to-many)
CREATE TABLE IF NOT EXISTS lesson_vocabulary (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false, -- Whether this vocabulary is a primary focus
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id, vocabulary_id)
);

-- Lesson grammar associations (many-to-many)
CREATE TABLE IF NOT EXISTS lesson_grammar (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    grammar_rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false, -- Whether this grammar rule is a primary focus
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id, grammar_rule_id)
);

-- Content tags for better organization and filtering
CREATE TABLE IF NOT EXISTS content_tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#007AFF',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content tag associations (many-to-many for all content types)
CREATE TABLE IF NOT EXISTS content_tag_associations (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'lesson', 'vocabulary', 'grammar_rule', etc.
    content_id INTEGER NOT NULL,
    tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, tag_id)
);

-- Add updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_learning_paths_updated_at 
    BEFORE UPDATE ON learning_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_preferences_updated_at 
    BEFORE UPDATE ON user_content_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_preferences_user_id ON user_content_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_type_id ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_cache_metadata_key ON content_cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_grammar_lesson_id ON lesson_grammar(lesson_id);
CREATE INDEX IF NOT EXISTS idx_content_tag_associations_content ON content_tag_associations(content_type, content_id);

-- RLS policies for security
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own learning paths and preferences
CREATE POLICY "Users can access own learning paths" ON learning_paths
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own content preferences" ON user_content_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Admin users can access content versions and analytics
CREATE POLICY "Admins can access content versions" ON content_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can access content analytics" ON content_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Insert some default content tags
INSERT INTO content_tags (name, color, description) VALUES
    ('Beginner', '#34C759', 'Content suitable for beginners'),
    ('Intermediate', '#FF9500', 'Content suitable for intermediate learners'),
    ('Advanced', '#FF3B30', 'Content suitable for advanced learners'),
    ('Grammar', '#5856D6', 'Grammar-focused content'),
    ('Vocabulary', '#007AFF', 'Vocabulary-focused content'),
    ('Pronunciation', '#AF52DE', 'Pronunciation-focused content'),
    ('Conversation', '#FF2D92', 'Conversation practice content'),
    ('Cultural', '#32D74B', 'French culture and context'),
    ('Business', '#8E8E93', 'Business French content'),
    ('Travel', '#30B0C7', 'Travel-related French content')
ON CONFLICT (name) DO NOTHING;
