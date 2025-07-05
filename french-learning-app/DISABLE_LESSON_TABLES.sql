-- Phase 1: Complete Learning Tab Removal - Database Cleanup
-- Execute this in Supabase Dashboard SQL Editor

-- 1. Disable lesson-related tables by marking all records as inactive
-- This preserves data but makes it invisible to the app

UPDATE lessons SET is_active = false WHERE is_active = true;
UPDATE modules SET is_active = false WHERE is_active = true;
UPDATE levels SET is_active = false WHERE is_active = true;

-- 2. Clean up lesson associations
DELETE FROM lesson_vocabulary;
DELETE FROM lesson_grammar;
DELETE FROM lesson_tags;

-- 3. Clean up user progress related to lessons
DELETE FROM user_progress WHERE lesson_id IS NOT NULL;

-- 4. Clean up questions that reference lessons
DELETE FROM questions WHERE lesson_id IS NOT NULL;

-- 5. Optional: If you want to completely drop the tables (CAREFUL!)
-- Uncomment these lines only if you're sure you want to permanently delete lesson data

-- DROP TABLE IF EXISTS lesson_vocabulary CASCADE;
-- DROP TABLE IF EXISTS lesson_grammar CASCADE; 
-- DROP TABLE IF EXISTS lesson_tags CASCADE;
-- DROP TABLE IF EXISTS questions CASCADE;
-- DROP TABLE IF EXISTS user_progress CASCADE;
-- DROP TABLE IF EXISTS lessons CASCADE;
-- DROP TABLE IF EXISTS modules CASCADE;
-- DROP TABLE IF EXISTS levels CASCADE;

-- 6. Update any points history that references lessons
UPDATE points_history 
SET points_type = 'vocabulary' 
WHERE points_type = 'lesson';

-- Success message
SELECT 'Lesson tables disabled successfully! All lesson data is now inactive.' as result;
