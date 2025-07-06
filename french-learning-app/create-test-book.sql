-- SQL Script to create a test book for lesson creation
-- Run this directly in the Supabase SQL Editor

-- First, let's check if there are any books
SELECT COUNT(*) as book_count FROM learning_books;

-- Create a test book if none exist
INSERT INTO learning_books (
    title,
    description,
    difficulty_level,
    estimated_duration_hours,
    order_index,
    is_published,
    is_active,
    tags,
    prerequisites,
    learning_objectives
) VALUES (
    'French Fundamentals',
    'Learn the basics of French language with interactive lessons',
    'beginner',
    20,
    1,
    true,
    true,
    ARRAY['french', 'basics', 'beginner'],
    ARRAY[]::text[],
    ARRAY[
        'Master basic French greetings',
        'Learn numbers 1-20', 
        'Understand basic introductions',
        'Practice common vocabulary'
    ]
)
ON CONFLICT DO NOTHING;

-- Verify the book was created
SELECT id, title, is_published, is_active FROM learning_books ORDER BY order_index;
