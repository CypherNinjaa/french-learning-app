-- Test Script for Learning Platform Schema
-- Run this to apply the complete schema to your Supabase database

BEGIN;

-- First, check if we're connected properly
SELECT NOW() as current_time, 'Schema deployment starting...' as status;

-- Apply the complete schema
\i LEARNING_PLATFORM_SCHEMA.sql

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE '%learning%' 
    OR tablename = 'profiles'
ORDER BY tablename;

-- Check if indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND (tablename LIKE '%learning%' OR tablename = 'profiles')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test creating a sample profile (this should work if everything is set up correctly)
-- Note: This assumes auth.users table exists and has a test user
/*
INSERT INTO profiles (id, email, username, full_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001',  -- Sample UUID
    'test@example.com',
    'testuser',
    'Test User',
    'student'
) ON CONFLICT (id) DO NOTHING;
*/

SELECT 'Schema deployment completed successfully!' as status;

COMMIT;
