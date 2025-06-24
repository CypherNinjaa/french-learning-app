
-- Complete Book-Style Lessons Recreation Script
-- This ensures lessons are properly structured and clickable

-- First, let's ensure the lessons table has the right structure
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 10;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 15;

-- Clear existing test data to avoid conflicts
DELETE FROM lessons WHERE title LIKE '%Test%' OR title LIKE '%Sample%';

-- Insert comprehensive book-style lessons with proper content structure
INSERT INTO lessons (
    title, 
    module_id, 
    lesson_type, 
    order_index, 
    is_active, 
    difficulty_level, 
    estimated_duration, 
    points_reward,
    content
) VALUES 
-- Lesson 1: French Greetings
(
    'French Greetings and Politeness',
    1,
    'vocabulary',
    1,
    true,
    'beginner',
    20,
    15,
    '{
        "introduction": "Welcome to your first comprehensive lesson on French greetings and polite expressions. In this chapter, you will discover the rich world of French social etiquette and learn how to make great first impressions.",
        "sections": [
            {
                "id": "greetings-basics",
                "title": "Essential Daily Greetings",
                "content": "French greetings are the cornerstone of polite conversation. The word ''bonjour'' is perhaps the most important French word you will learn.",
                "examples": [
                    {
                        "french": "Bonjour",
                        "english": "Hello / Good day",
                        "pronunciation": "bon-ZHOOR"
                    },
                    {
                        "french": "Bonsoir", 
                        "english": "Good evening",
                        "pronunciation": "bon-SWAHR"
                    }
                ],
                "order_index": 0,
                "is_required": true
            },
            {
                "id": "polite-expressions",
                "title": "Polite Expressions",
                "content": "Politeness is deeply ingrained in French culture. These expressions will help you navigate social situations with confidence.",
                "examples": [
                    {
                        "french": "S''il vous plaît",
                        "english": "Please (formal)",
                        "pronunciation": "see voo PLAY"
                    },
                    {
                        "french": "Merci beaucoup",
                        "english": "Thank you very much",
                        "pronunciation": "mer-see boh-KOO"
                    }
                ],
                "order_index": 1,
                "is_required": true
            }
        ],
        "summary": "You have learned the essential greetings and polite expressions that form the foundation of French social interaction.",
        "examples": [
            {
                "french": "Bonjour, comment allez-vous?",
                "english": "Hello, how are you?",
                "pronunciation": "bon-ZHOOR, koh-mahn tah-lay VOO"
            }
        ]
    }'
),
-- Lesson 2: Numbers and Counting
(
    'Numbers and Counting',
    1,
    'vocabulary',
    2,
    true,
    'beginner',
    25,
    20,
    '{
        "introduction": "Numbers are essential in any language. In this lesson, you will master French numbers from 0 to 100 and learn how to use them in everyday situations.",
        "sections": [
            {
                "id": "numbers-1-10",
                "title": "Numbers 1-10",
                "content": "Let''s start with the basic numbers. These form the foundation for all other numbers in French.",
                "examples": [
                    {
                        "french": "un",
                        "english": "one",
                        "pronunciation": "ahn"
                    },
                    {
                        "french": "deux",
                        "english": "two", 
                        "pronunciation": "duh"
                    },
                    {
                        "french": "trois",
                        "english": "three",
                        "pronunciation": "twah"
                    }
                ],
                "order_index": 0,
                "is_required": true
            },
            {
                "id": "numbers-11-20",
                "title": "Numbers 11-20",
                "content": "Numbers 11-16 have unique forms, while 17-19 follow a pattern similar to English.",
                "examples": [
                    {
                        "french": "onze",
                        "english": "eleven",
                        "pronunciation": "ohnz"
                    },
                    {
                        "french": "douze",
                        "english": "twelve",
                        "pronunciation": "dooz"
                    }
                ],
                "order_index": 1,
                "is_required": true
            }
        ],
        "summary": "You now know the French numbers and can count with confidence. Practice using them in daily situations!",
        "examples": [
            {
                "french": "J''ai vingt ans",
                "english": "I am twenty years old",
                "pronunciation": "zhay vahn tahn"
            }
        ]
    }'
),
-- Lesson 3: Family and Relationships
(
    'Family and Relationships',
    1,
    'vocabulary',
    3,
    true,
    'beginner',
    30,
    25,
    '{
        "introduction": "Family is at the heart of French culture. Learn how to talk about your family members and relationships in French.",
        "sections": [
            {
                "id": "immediate-family",
                "title": "Immediate Family",
                "content": "The immediate family members are the people closest to you. Let''s learn how to talk about them in French.",
                "examples": [
                    {
                        "french": "la famille",
                        "english": "the family",
                        "pronunciation": "lah fah-MEEL"
                    },
                    {
                        "french": "les parents",
                        "english": "the parents",
                        "pronunciation": "lay pah-RAHN"
                    },
                    {
                        "french": "le père",
                        "english": "the father",
                        "pronunciation": "luh PAIR"
                    }
                ],
                "order_index": 0,
                "is_required": true
            },
            {
                "id": "extended-family",
                "title": "Extended Family",
                "content": "Beyond immediate family, let''s explore the extended family relationships.",
                "examples": [
                    {
                        "french": "les grands-parents",
                        "english": "the grandparents",
                        "pronunciation": "lay grahn-pah-RAHN"
                    },
                    {
                        "french": "l''oncle",
                        "english": "the uncle",
                        "pronunciation": "lohn-kluh"
                    }
                ],
                "order_index": 1,
                "is_required": true
            }
        ],
        "summary": "You can now talk about your family in French and understand family relationships. This vocabulary will help you in many social situations.",
        "examples": [
            {
                "french": "Ma famille est très importante pour moi",
                "english": "My family is very important to me",
                "pronunciation": "mah fah-MEEL ay tray eem-por-TAHNT poor mwah"
            }
        ]
    }'
);

-- Ensure we have at least one module for the lessons
INSERT INTO modules (title, description, level_id, order_index, is_active)
SELECT 'Beginner French Basics', 'Essential French vocabulary and phrases for beginners', 1, 1, true
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE id = 1);

-- Update lesson module_id to ensure they're linked correctly
UPDATE lessons SET module_id = 1 WHERE module_id IS NULL OR module_id NOT IN (SELECT id FROM modules);

-- Verify the data
SELECT 
    l.id,
    l.title,
    l.lesson_type,
    l.is_active,
    l.estimated_duration,
    l.points_reward,
    CASE 
        WHEN l.content IS NOT NULL THEN 'Has Content'
        ELSE 'No Content'
    END as content_status,
    m.title as module_title
FROM lessons l
LEFT JOIN modules m ON l.module_id = m.id
WHERE l.is_active = true
ORDER BY l.order_index;
