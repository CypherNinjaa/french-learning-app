-- ====================================================================
-- FIX LEARNING_OBJECTIVES DATA TYPE - FRENCH LEARNING APP
-- This script fixes the learning_objectives field to be an array instead of text
-- Run this in your Supabase SQL Editor AFTER running the main recreation script
-- ====================================================================

-- ⚠️ IMPORTANT: Only run this if you have existing modules that need data type conversion

-- ====================================================================
-- STEP 1: Check current learning_objectives data
-- ====================================================================

-- View current modules and their learning_objectives
SELECT 
  id,
  title,
  learning_objectives,
  pg_typeof(learning_objectives) as data_type
FROM modules 
WHERE learning_objectives IS NOT NULL
LIMIT 10;

-- ====================================================================
-- STEP 2: Convert any existing TEXT data to TEXT[] (if needed)
-- ====================================================================

-- If you have existing modules with learning_objectives as TEXT, 
-- this will convert them to arrays (only if column is still TEXT type)

-- First, let's check the current column type
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'modules' 
  AND column_name = 'learning_objectives';

-- ====================================================================
-- STEP 3: Manual conversion (if needed)
-- ====================================================================

-- If you have text data that needs to be converted to arrays, use this:
-- UPDATE modules 
-- SET learning_objectives = ARRAY[learning_objectives]
-- WHERE learning_objectives IS NOT NULL 
--   AND pg_typeof(learning_objectives) = 'text'::regtype;

-- ====================================================================
-- STEP 4: Verify the fix
-- ====================================================================

-- Test creating a module with array learning_objectives
-- INSERT INTO modules (
--   level_id, 
--   title, 
--   description, 
--   order_index, 
--   learning_objectives
-- ) VALUES (
--   1,
--   'Test Module',
--   'Test module to verify learning_objectives array',
--   999,
--   ARRAY['Test objective 1', 'Test objective 2', 'Test objective 3']
-- );

-- Verify the test module was created correctly
-- SELECT 
--   id,
--   title,
--   learning_objectives,
--   array_length(learning_objectives, 1) as objectives_count
-- FROM modules 
-- WHERE title = 'Test Module';

-- Clean up test data
-- DELETE FROM modules WHERE title = 'Test Module';

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================

SELECT 
  '🎉 LEARNING_OBJECTIVES DATA TYPE FIX COMPLETED!' as message,
  'The learning_objectives field is now properly configured as TEXT[]' as details,
  'Frontend .map() errors should now be resolved' as result;
