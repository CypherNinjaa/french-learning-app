-- Script to fix issues with test_passed and unlock lessons that should be unlocked

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
UPDATE user_lesson_progress ulp
SET status = 'not_started'
FROM locked_lessons ll
WHERE ulp.user_id = ll.user_id
AND ulp.lesson_id = ll.next_lesson_id
AND ulp.status = 'locked'
AND ll.next_lesson_id IS NOT NULL;

-- 3. Unlock next level's first lesson when all previous level lessons are passed
WITH completed_levels AS (
  SELECT 
    ulp.user_id,
    lb.difficulty_level,
    (
      SELECT COUNT(*)
      FROM learning_lessons l
      JOIN learning_books b ON l.book_id = b.id
      WHERE b.difficulty_level = lb.difficulty_level
    ) AS total_lessons,
    (
      SELECT COUNT(*)
      FROM user_lesson_progress p
      JOIN learning_lessons l ON p.lesson_id = l.id
      JOIN learning_books b ON l.book_id = b.id
      WHERE p.user_id = ulp.user_id
      AND b.difficulty_level = lb.difficulty_level
      AND p.test_passed = true
    ) AS passed_lessons
  FROM user_lesson_progress ulp
  JOIN learning_lessons ll ON ulp.lesson_id = ll.id
  JOIN learning_books lb ON ll.book_id = lb.id
  GROUP BY ulp.user_id, lb.difficulty_level
),
next_level_first_lessons AS (
  SELECT 
    cl.user_id,
    (
      SELECT l.id
      FROM learning_lessons l
      JOIN learning_books b ON l.book_id = b.id
      WHERE 
        CASE 
          WHEN cl.difficulty_level = 'beginner' THEN b.difficulty_level = 'intermediate'
          WHEN cl.difficulty_level = 'intermediate' THEN b.difficulty_level = 'advanced'
          ELSE false -- No next level after advanced
        END
      ORDER BY l.order_index ASC
      LIMIT 1
    ) AS first_lesson_id
  FROM completed_levels cl
  WHERE cl.total_lessons = cl.passed_lessons
  AND cl.difficulty_level != 'advanced' -- Skip if already at advanced level
)
UPDATE user_lesson_progress ulp
SET status = 'not_started'
FROM next_level_first_lessons nfl
WHERE ulp.user_id = nfl.user_id
AND ulp.lesson_id = nfl.first_lesson_id
AND ulp.status = 'locked';
