-- Fix RLS policies for content_tags and related tables
-- This patch ensures proper access control for content management

-- Enable RLS on content_tags and content_tag_associations
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cache_metadata ENABLE ROW LEVEL SECURITY;

-- Content tags should be readable by everyone (public content)
-- but only admins can create/modify them
CREATE POLICY "Everyone can view content tags" ON content_tags
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage content tags" ON content_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Content tag associations should be readable by everyone
-- but only admins can create/modify them
CREATE POLICY "Everyone can view content tag associations" ON content_tag_associations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage content tag associations" ON content_tag_associations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Lesson vocabulary associations should be readable by everyone
-- but only admins can create/modify them
CREATE POLICY "Everyone can view lesson vocabulary" ON lesson_vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lesson vocabulary" ON lesson_vocabulary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Lesson grammar associations should be readable by everyone
-- but only admins can create/modify them
CREATE POLICY "Everyone can view lesson grammar" ON lesson_grammar
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lesson grammar" ON lesson_grammar
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Content cache metadata should only be accessible to admins
CREATE POLICY "Admins can access content cache metadata" ON content_cache_metadata
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'super_admin')
        )
    );

-- Temporarily disable RLS to insert default content tags
ALTER TABLE content_tags DISABLE ROW LEVEL SECURITY;

-- Re-insert default content tags (with conflict resolution)
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

-- Re-enable RLS after inserting default data
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
