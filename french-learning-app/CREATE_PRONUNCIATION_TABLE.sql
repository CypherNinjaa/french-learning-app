-- ====================================================================
-- FIX PRONUNCIATION_WORDS TABLE SCHEMA
-- This script ensures the pronunciation_words table has the correct columns
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Step 1: Check if pronunciation_words table exists and its current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pronunciation_words' 
ORDER BY ordinal_position;

-- Step 2: Drop and recreate the pronunciation_words table with correct structure
DROP TABLE IF EXISTS pronunciation_words CASCADE;

-- Step 3: Create pronunciation_words table with both old and new column names for compatibility
CREATE TABLE pronunciation_words (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    pronunciation TEXT, -- IPA or phonetic notation
    audio_url TEXT, -- URL to pronunciation audio
    example_sentence_fr TEXT,
    example_sentence_en TEXT,
    example_sentence TEXT, -- Alias for compatibility
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT, -- e.g., 'food', 'travel', 'business'
    pronunciation_tips TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Add compatibility columns that the frontend expects
    french TEXT GENERATED ALWAYS AS (french_word) STORED,
    english TEXT GENERATED ALWAYS AS (english_translation) STORED,
    example TEXT GENERATED ALWAYS AS (COALESCE(example_sentence_fr, example_sentence)) STORED
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_pronunciation_words_french_word ON pronunciation_words(french_word);
CREATE INDEX idx_pronunciation_words_difficulty ON pronunciation_words(difficulty_level);
CREATE INDEX idx_pronunciation_words_category ON pronunciation_words(category);
CREATE INDEX idx_pronunciation_words_active ON pronunciation_words(is_active);

-- Step 5: Enable RLS
ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policy
CREATE POLICY "Allow public read access to pronunciation_words" ON pronunciation_words FOR SELECT USING (true);

-- Step 7: Add trigger for updated_at
CREATE TRIGGER update_pronunciation_words_updated_at 
  BEFORE UPDATE ON pronunciation_words 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Insert sample pronunciation words for testing
INSERT INTO pronunciation_words (french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category) VALUES
('bonjour', 'hello', 'bon-ZHOOR', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'greetings'),
('merci', 'thank you', 'mer-SEE', 'Merci beaucoup!', 'Thank you very much!', 'beginner', 'greetings'),
('au revoir', 'goodbye', 'oh ruh-VWAHR', 'Au revoir, à bientôt!', 'Goodbye, see you soon!', 'beginner', 'greetings'),
('s''il vous plaît', 'please', 'see voo PLEH', 'Un café, s''il vous plaît.', 'A coffee, please.', 'beginner', 'greetings'),
('excusez-moi', 'excuse me', 'eks-kew-zay MWAH', 'Excusez-moi, où est la gare?', 'Excuse me, where is the train station?', 'beginner', 'greetings'),
('comment', 'how', 'koh-MAHN', 'Comment ça va?', 'How are you?', 'beginner', 'questions'),
('pourquoi', 'why', 'poor-KWAH', 'Pourquoi pas?', 'Why not?', 'beginner', 'questions'),
('où', 'where', 'OO', 'Où habitez-vous?', 'Where do you live?', 'beginner', 'questions'),
('quand', 'when', 'kahn', 'Quand partez-vous?', 'When are you leaving?', 'beginner', 'questions'),
('qui', 'who', 'kee', 'Qui est-ce?', 'Who is it?', 'beginner', 'questions'),
('le pain', 'bread', 'luh PAN', 'J''achète le pain.', 'I''m buying bread.', 'beginner', 'food'),
('l''eau', 'water', 'LOH', 'Je bois de l''eau.', 'I drink water.', 'beginner', 'food'),
('le fromage', 'cheese', 'luh froh-MAHZH', 'J''aime le fromage français.', 'I like French cheese.', 'beginner', 'food'),
('la boulangerie', 'bakery', 'lah boo-lahn-zhuh-REE', 'Je vais à la boulangerie.', 'I''m going to the bakery.', 'intermediate', 'places'),
('l''hôpital', 'hospital', 'loh-pee-TAHL', 'L''hôpital est près d''ici.', 'The hospital is nearby.', 'intermediate', 'places');

-- Step 9: Verify the table structure and data
SELECT 
  id,
  french_word,
  french, -- Generated column
  english_translation,
  english, -- Generated column
  pronunciation,
  example_sentence_fr,
  example, -- Generated column
  difficulty_level,
  category
FROM pronunciation_words 
ORDER BY difficulty_level, category
LIMIT 5;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================
SELECT 
  '✅ PRONUNCIATION_WORDS TABLE CREATED SUCCESSFULLY!' as message,
  'Table has both old and new column names for compatibility' as details,
  'Your PronunciationTestScreen should now work correctly' as result;
