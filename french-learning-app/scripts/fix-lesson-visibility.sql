-- SQL script to fix existing lessons that may not be published/active
-- Run this in Supabase SQL Editor if you have lessons that aren't showing up

-- Update all lessons to be published and active
UPDATE learning_lessons 
SET 
  is_published = true,
  is_active = true
WHERE is_published = false OR is_active = false OR is_published IS NULL OR is_active IS NULL;

-- Verify the update
SELECT 
  id,
  title,
  book_id,
  is_published,
  is_active,
  order_index
FROM learning_lessons 
ORDER BY book_id, order_index;
