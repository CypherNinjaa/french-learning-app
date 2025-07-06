-- Quick fix for lesson unlocking issues

-- 1. Update test_passed for users who have scored >= passing percentage on tests
UPDATE user_lesson_progress ulp
SET test_passed = true
FROM test_attempts ta
JOIN lesson_tests lt ON ta.test_id = lt.id
WHERE ulp.user_id = ta.user_id
AND ulp.lesson_id = ta.lesson_id
AND ta.score >= lt.passing_percentage
AND ta.completed_at IS NOT NULL
AND ulp.test_passed = false;

-- 2. Unlock next lessons where the previous lesson has test_passed = true
WITH locked_lessons AS (
  SELECT 
    ulp.user_id,
    l.id AS current_lesson_id,
    l.book_id,
    l.order_index,
    (
      SELECT nl.id
      FROM learning_lessons nl
      WHERE nl.book_id = l.book_id
      AND nl.order_index = l.order_index + 1
      LIMIT 1
    ) AS next_lesson_id
  FROM user_lesson_progress ulp
  JOIN learning_lessons l ON ulp.lesson_id = l.id
  WHERE ulp.test_passed = true
)
INSERT INTO user_lesson_progress (user_id, lesson_id, status, created_at, updated_at, last_accessed_at, content_viewed, examples_practiced, test_passed, total_study_time_minutes, bookmarks, notes)
SELECT 
  ll.user_id,
  ll.next_lesson_id,
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
FROM locked_lessons ll
WHERE ll.next_lesson_id IS NOT NULL
ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
  status = 'not_started',
  updated_at = NOW()
WHERE user_lesson_progress.status = 'locked';

-- 3. Ensure the first lesson of each book is always unlocked for each user
INSERT INTO user_lesson_progress (user_id, lesson_id, status, created_at, updated_at, last_accessed_at, content_viewed, examples_practiced, test_passed, total_study_time_minutes, bookmarks, notes)
SELECT DISTINCT
  auth.uid() as user_id,
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
FROM learning_lessons l
WHERE l.order_index = 0
ON CONFLICT (user_id, lesson_id) DO NOTHING;
