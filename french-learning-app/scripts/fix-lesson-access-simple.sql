-- Fix lesson access using the new simplified approach
-- This script ensures users have progress records for lessons they should have access to

BEGIN;

-- Step 1: Ensure all users have access to the first lesson of any book they've started
INSERT INTO user_lesson_progress (
    user_id, 
    lesson_id, 
    status, 
    content_viewed, 
    examples_practiced, 
    test_passed, 
    total_study_time_minutes, 
    bookmarks, 
    notes,
    created_at,
    updated_at,
    last_accessed_at
)
SELECT DISTINCT 
    ubp.user_id,
    ll.id as lesson_id,
    'not_started' as status,
    false as content_viewed,
    false as examples_practiced,
    false as test_passed,
    0 as total_study_time_minutes,
    '[]'::jsonb as bookmarks,
    '' as notes,
    NOW() as created_at,
    NOW() as updated_at,
    NOW() as last_accessed_at
FROM user_book_progress ubp
JOIN learning_lessons ll ON ll.book_id = ubp.book_id AND ll.order_index = 0
WHERE NOT EXISTS (
    SELECT 1 FROM user_lesson_progress ulp 
    WHERE ulp.user_id = ubp.user_id AND ulp.lesson_id = ll.id
);

-- Step 2: For users who have passed tests, unlock their next lessons
INSERT INTO user_lesson_progress (
    user_id, 
    lesson_id, 
    status, 
    content_viewed, 
    examples_practiced, 
    test_passed, 
    total_study_time_minutes, 
    bookmarks, 
    notes,
    created_at,
    updated_at,
    last_accessed_at
)
SELECT DISTINCT
    ulp.user_id,
    next_lesson.id as lesson_id,
    'not_started' as status,
    false as content_viewed,
    false as examples_practiced,
    false as test_passed,
    0 as total_study_time_minutes,
    '[]'::jsonb as bookmarks,
    '' as notes,
    NOW() as created_at,
    NOW() as updated_at,
    NOW() as last_accessed_at
FROM user_lesson_progress ulp
JOIN learning_lessons current_lesson ON current_lesson.id = ulp.lesson_id
JOIN learning_lessons next_lesson ON next_lesson.book_id = current_lesson.book_id 
    AND next_lesson.order_index = current_lesson.order_index + 1
WHERE ulp.test_passed = true
AND NOT EXISTS (
    SELECT 1 FROM user_lesson_progress ulp2 
    WHERE ulp2.user_id = ulp.user_id AND ulp2.lesson_id = next_lesson.id
);

-- Step 3: Show summary of what was fixed
SELECT 
    'First lessons unlocked' as fix_type,
    COUNT(*) as records_created
FROM user_lesson_progress ulp
JOIN learning_lessons ll ON ll.id = ulp.lesson_id
WHERE ll.order_index = 0
AND ulp.created_at >= NOW() - INTERVAL '1 minute'

UNION ALL

SELECT 
    'Next lessons unlocked' as fix_type,
    COUNT(*) as records_created
FROM user_lesson_progress ulp
JOIN learning_lessons ll ON ll.id = ulp.lesson_id
WHERE ll.order_index > 0
AND ulp.created_at >= NOW() - INTERVAL '1 minute';

COMMIT;
