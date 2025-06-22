-- Create pronunciation_words table for French learning app
-- This table stores pronunciation guides for French words

CREATE TABLE IF NOT EXISTS pronunciation_words (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    pronunciation TEXT NOT NULL, -- Phonetic pronunciation guide
    audio_url TEXT, -- URL to audio file (optional)
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT, -- e.g., 'greetings', 'restaurant', 'professions'
    example_sentence TEXT, -- Example sentence using the word
    notes TEXT, -- Additional pronunciation notes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;

-- Policies for pronunciation_words table
CREATE POLICY "Allow public read access to pronunciation_words" ON pronunciation_words 
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert pronunciation_words" ON pronunciation_words 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update pronunciation_words" ON pronunciation_words 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete pronunciation_words" ON pronunciation_words 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_french_word ON pronunciation_words(french_word);
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_difficulty ON pronunciation_words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_category ON pronunciation_words(category);
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_active ON pronunciation_words(is_active);

-- Full-text search index for searching words
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_search ON pronunciation_words 
    USING gin(to_tsvector('english', french_word || ' ' || coalesce(pronunciation, '') || ' ' || coalesce(notes, '')));
