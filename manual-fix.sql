-- SQL to manually fix lesson unlocking
-- Run this directly in Supabase SQL Editor

-- 1. Fix any test_passed flags that should be true
UPDATE user_lesson_progress ulp
SET test_passed = true
FROM test_attempts ta
JOIN lesson_tests lt ON ta.test_id = lt.id
WHERE ulp.user_id = ta.user_id
AND ulp.lesson_id = ta.lesson_id
AND ta.score >= lt.passing_percentage
AND ta.completed_at IS NOT NULL
AND ulp.test_passed = false;

-- 2. Ensure lesson 1 of each book is always unlocked
INSERT INTO user_lesson_progress (user_id, lesson_id, status, created_at, updated_at, last_accessed_at, content_viewed, examples_practiced, test_passed, total_study_time_minutes, bookmarks, notes)
SELECT 
  u.id as user_id,
  l.id as lesson_id,
  'not_started',
  NOW(),
  NOW(),
  NOW(),
  false,
  false,
  false,
  0,
  '[]'::jsonb,
  ''
FROM auth.users u
CROSS JOIN learning_lessons l
WHERE l.order_index = 0
ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET status = 'not_started' WHERE user_lesson_progress.status = 'locked';

-- 3. Unlock next lessons for completed tests
INSERT INTO user_lesson_progress (user_id, lesson_id, status, created_at, updated_at, last_accessed_at, content_viewed, examples_practiced, test_passed, total_study_time_minutes, bookmarks, notes)
WITH next_lessons AS (
  SELECT DISTINCT
    ulp.user_id,
    nl.id as next_lesson_id
  FROM user_lesson_progress ulp
  JOIN learning_lessons l ON ulp.lesson_id = l.id
  JOIN learning_lessons nl ON nl.book_id = l.book_id AND nl.order_index = l.order_index + 1
  WHERE ulp.test_passed = true
)
SELECT 
  next_lessons.user_id,
  next_lessons.next_lesson_id,
  'not_started',
  NOW(),
  NOW(),
  NOW(),
  false,
  false,
  false,
  0,
  '[]'::jsonb,
  ''
FROM next_lessons
ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET status = 'not_started' WHERE user_lesson_progress.status = 'locked';
