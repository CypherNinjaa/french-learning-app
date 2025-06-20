-- Verification script for Stage 3.3 Content API Implementation Migration
-- Run this to verify all tables were created successfully

-- Check if all new tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'content_versions',
        'learning_paths',
        'user_content_preferences',
        'content_analytics',
        'content_cache_metadata',
        'lesson_vocabulary',
        'lesson_grammar',
        'content_tags',
        'content_tag_associations'
    )
ORDER BY table_name;

-- Check if indexes were created
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND (indexname LIKE 'idx_content_%' 
         OR indexname LIKE 'idx_learning_%' 
         OR indexname LIKE 'idx_user_content_%'
         OR indexname LIKE 'idx_lesson_%')
ORDER BY tablename, indexname;

-- Check if RLS is enabled on the new tables
SELECT 
    table_name,
    row_security
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'content_versions',
        'learning_paths',
        'user_content_preferences',
        'content_analytics'
    )
    AND row_security = 'YES';

-- Check if default content tags were inserted
SELECT 
    name,
    color,
    description
FROM content_tags
ORDER BY name;

-- Check migration was recorded
SELECT 
    version,
    name,
    executed_at
FROM supabase_migrations.schema_migrations
WHERE version = '20250620064124'
ORDER BY executed_at DESC;
