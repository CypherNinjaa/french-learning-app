-- ====================================================================
-- FIX LEARNING OBJECTIVES DATABASE SCHEMA
-- This script fixes the learning_objectives field to be a proper array
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Step 1: Update the modules table to use TEXT[] for learning_objectives
ALTER TABLE modules 
ALTER COLUMN learning_objectives TYPE TEXT[] 
USING CASE 
  WHEN learning_objectives IS NULL THEN '{}'::TEXT[]
  WHEN learning_objectives = '' THEN '{}'::TEXT[]
  ELSE string_to_array(learning_objectives, E'\n')
END;

-- Step 2: Set default value for new records
ALTER TABLE modules 
ALTER COLUMN learning_objectives SET DEFAULT '{}';

-- Step 3: Update any existing NULL values to empty arrays
UPDATE modules 
SET learning_objectives = '{}' 
WHERE learning_objectives IS NULL;

-- Step 4: Verify the changes
SELECT 
  id,
  title,
  learning_objectives,
  array_length(learning_objectives, 1) as objectives_count
FROM modules 
ORDER BY id;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================
SELECT 
  '✅ LEARNING OBJECTIVES SCHEMA FIXED!' as message,
  'The learning_objectives field is now properly configured as TEXT[]' as details,
  'Your app should no longer show the map() error' as result;
