-- ====================================================================
-- BOOK-STYLE LESSONS DATABASE SCHEMA UPDATE
-- This script updates the lessons table to support rich book-like content
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Step 1: Update lessons table structure for book-style content
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS book_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS lesson_summary TEXT,
ADD COLUMN IF NOT EXISTS key_vocabulary TEXT[],
ADD COLUMN IF NOT EXISTS grammar_points TEXT[],
ADD COLUMN IF NOT EXISTS cultural_notes TEXT;

-- Step 2: Update the content column to support rich book structure
-- The content will now follow this structure:
-- {
--   "introduction": "Chapter introduction",
--   "sections": [
--     {
--       "id": "section-1",
--       "title": "Section Title",
--       "content": "Rich text content with examples",
--       "examples": [
--         {"french": "Bonjour", "english": "Hello", "pronunciation": "bon-ZHOOR"}
--       ],
--       "vocabulary": ["bonjour", "salut"],
--       "grammar_focus": "Present tense",
--       "cultural_tip": "In France, greeting is very important"
--     }
--   ],
--   "summary": "Chapter summary",
--   "exercises": [...],
--   "next_lesson_preview": "What's coming next"
-- }

-- Step 3: Add reading progress tracking
CREATE TABLE IF NOT EXISTS lesson_reading_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    section_id TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reading_time_seconds INTEGER DEFAULT 0,
    is_bookmarked BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id, section_id)
);

-- Step 4: Add lesson bookmarks
CREATE TABLE IF NOT EXISTS lesson_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    section_id TEXT,
    bookmark_text TEXT,
    page_position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id, section_id)
);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_reading_progress_user_lesson 
ON lesson_reading_progress(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user 
ON lesson_bookmarks(user_id);

-- Step 6: Enable RLS on new tables
ALTER TABLE lesson_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Users can manage own reading progress" ON lesson_reading_progress 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON lesson_bookmarks 
FOR ALL USING (auth.uid() = user_id);

-- Step 8: Update modules to support book-style organization
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS book_description TEXT,
ADD COLUMN IF NOT EXISTS book_cover_image TEXT,
ADD COLUMN IF NOT EXISTS total_chapters INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER DEFAULT 0;

-- Step 9: Insert sample book-style lesson content
UPDATE lessons 
SET content = '{
  "introduction": "Welcome to this comprehensive lesson where you will learn the fundamentals of French greetings and polite expressions.",
  "sections": [
    {
      "id": "section-1",
      "title": "Basic Greetings",
      "content": "French greetings are an essential part of daily communication. Understanding when and how to use different greetings will help you navigate social situations with confidence.\n\nThe most common greeting in French is ''bonjour'', which literally means ''good day''. This greeting is appropriate for most formal and informal situations during the daytime.",
      "examples": [
        {
          "french": "Bonjour",
          "english": "Hello/Good day",
          "pronunciation": "bon-ZHOOR",
          "usage": "Used from morning until about 5 PM"
        },
        {
          "french": "Bonsoir",
          "english": "Good evening",
          "pronunciation": "bon-SWAHR",
          "usage": "Used after 5 PM"
        }
      ],
      "vocabulary": ["bonjour", "bonsoir", "salut"],
      "grammar_focus": "No grammatical changes needed for basic greetings",
      "cultural_tip": "In France, it is considered polite to greet shopkeepers when entering a store."
    },
    {
      "id": "section-2", 
      "title": "Formal vs Informal",
      "content": "French distinguishes between formal and informal communication. This is crucial for proper social interaction.\n\nWhen meeting someone for the first time, in business settings, or with people significantly older than you, use formal greetings.",
      "examples": [
        {
          "french": "Bonjour Monsieur/Madame",
          "english": "Hello Sir/Madam",
          "pronunciation": "bon-ZHOOR muh-SYUR/mah-DAHM",
          "usage": "Formal greeting with title"
        },
        {
          "french": "Salut",
          "english": "Hi/Bye",
          "pronunciation": "sah-LUU",
          "usage": "Informal greeting with friends"
        }
      ],
      "vocabulary": ["monsieur", "madame", "mademoiselle"],
      "grammar_focus": "Using titles with greetings",
      "cultural_tip": "Always err on the side of formality when unsure."
    }
  ],
  "summary": "In this lesson, you learned the basic French greetings and how to distinguish between formal and informal situations. Practice using these greetings in appropriate contexts.",
  "key_vocabulary": ["bonjour", "bonsoir", "salut", "monsieur", "madame"],
  "grammar_points": ["No conjugation needed for greetings", "Use of titles"],
  "cultural_notes": "Greeting etiquette is very important in French culture. Always greet people when entering shops or meeting someone new."
}'
WHERE id IN (SELECT id FROM lessons LIMIT 3);

-- Step 10: Verify the updates
SELECT 
    l.id,
    l.title,
    l.reading_time_minutes,
    l.lesson_summary,
    l.content->>'introduction' as introduction,
    jsonb_array_length(l.content->'sections') as section_count
FROM lessons l 
WHERE l.content IS NOT NULL 
LIMIT 5;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================
SELECT 
  '✅ BOOK-STYLE LESSONS SCHEMA UPDATED!' as message,
  'Lessons now support rich book-like content with sections, examples, and reading progress' as details,
  'Ready for admin panel and frontend updates' as next_step;
