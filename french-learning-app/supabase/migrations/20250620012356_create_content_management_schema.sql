-- Stage 3.1: Content Management System Database Schema
-- French Learning App - Complete content management tables

-- Create levels table (if not exists from Stage 1)
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create modules table (if not exists from Stage 1) 
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons and Content
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Dynamic content structure
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('vocabulary', 'grammar', 'conversation', 'pronunciation', 'reading', 'listening')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  estimated_time_minutes INTEGER DEFAULT 10,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vocabulary Management
CREATE TABLE vocabulary (
  id SERIAL PRIMARY KEY,
  french_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  pronunciation TEXT, -- IPA or phonetic notation
  audio_url TEXT, -- URL to pronunciation audio
  example_sentence_fr TEXT,
  example_sentence_en TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- e.g., 'food', 'travel', 'business'
  gender TEXT CHECK (gender IN ('masculine', 'feminine', 'neutral')), -- For nouns
  word_type TEXT CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection')),
  conjugation_group TEXT, -- For verbs: 'first', 'second', 'third', 'irregular'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Grammar Rules
CREATE TABLE grammar_rules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  examples JSONB, -- Array of example objects with French and English
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- e.g., 'verbs', 'nouns', 'adjectives', 'sentence_structure'
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dynamic Questions
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'pronunciation', 'matching', 'translation', 'listening')),
  options JSONB, -- For multiple choice, matching, etc.
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- Why this answer is correct
  points INTEGER DEFAULT 10,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  audio_url TEXT, -- For listening questions
  image_url TEXT, -- For visual questions
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lesson Vocabulary Associations (many-to-many)
CREATE TABLE lesson_vocabulary (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary vocabulary for this lesson
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, vocabulary_id)
);

-- Lesson Grammar Associations (many-to-many)
CREATE TABLE lesson_grammar (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  grammar_rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary grammar focus for this lesson
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, grammar_rule_id)
);

-- Content Categories for organization
CREATE TABLE content_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  color TEXT, -- Hex color code
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Tags for flexible categorization
CREATE TABLE content_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT, -- Hex color code
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lesson Tags (many-to-many)
CREATE TABLE lesson_tags (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, tag_id)
);

-- Vocabulary Tags (many-to-many)
CREATE TABLE vocabulary_tags (
  id SERIAL PRIMARY KEY,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vocabulary_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX idx_lessons_active ON lessons(is_active);

CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty_level);
CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_word_type ON vocabulary(word_type);
CREATE INDEX idx_vocabulary_active ON vocabulary(is_active);

CREATE INDEX idx_grammar_difficulty ON grammar_rules(difficulty_level);
CREATE INDEX idx_grammar_category ON grammar_rules(category);
CREATE INDEX idx_grammar_active ON grammar_rules(is_active);

CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_active ON questions(is_active);

CREATE INDEX idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX idx_lesson_vocabulary_vocab_id ON lesson_vocabulary(vocabulary_id);

CREATE INDEX idx_lesson_grammar_lesson_id ON lesson_grammar(lesson_id);
CREATE INDEX idx_lesson_grammar_rule_id ON lesson_grammar(grammar_rule_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_levels_updated_at BEFORE UPDATE ON levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grammar_rules_updated_at BEFORE UPDATE ON grammar_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data
INSERT INTO levels (name, description, order_index) VALUES
('Débutant', 'Complete beginner level - Basic French fundamentals', 1),
('Élémentaire', 'Elementary level - Building basic vocabulary and grammar', 2),
('Intermédiaire', 'Intermediate level - Expanding vocabulary and complex grammar', 3),
('Avancé', 'Advanced level - Fluent conversation and advanced topics', 4);

INSERT INTO content_categories (name, description, icon, color, order_index) VALUES
('Greetings', 'Basic greetings and introductions', '👋', '#FF6B6B', 1),
('Food & Dining', 'Food vocabulary and restaurant conversations', '🍽️', '#4ECDC4', 2),
('Travel', 'Travel-related vocabulary and phrases', '✈️', '#45B7D1', 3),
('Family', 'Family members and relationships', '👨‍👩‍👧‍👦', '#96CEB4', 4),
('Numbers', 'Numbers, time, and dates', '🔢', '#FFEAA7', 5),
('Colors', 'Colors and descriptions', '🎨', '#DDA0DD', 6),
('Weather', 'Weather and seasons', '🌤️', '#74B9FF', 7),
('Shopping', 'Shopping and commerce', '🛍️', '#FD79A8', 8);

INSERT INTO content_tags (name, description, color) VALUES
('essential', 'Essential vocabulary for beginners', '#FF6B6B'),
('conversation', 'Conversational phrases and expressions', '#4ECDC4'),
('formal', 'Formal language and expressions', '#45B7D1'),
('informal', 'Informal/casual language', '#96CEB4'),
('business', 'Business and professional French', '#FFEAA7'),
('cultural', 'Cultural context and expressions', '#DDA0DD'),
('grammar-focus', 'Grammar-heavy content', '#74B9FF'),
('pronunciation', 'Pronunciation practice', '#FD79A8');

-- RLS Policies for content tables
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_tags ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read content
CREATE POLICY "Allow authenticated users to read levels" ON levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read modules" ON modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read lessons" ON lessons FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to read vocabulary" ON vocabulary FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to read grammar_rules" ON grammar_rules FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to read questions" ON questions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to read lesson_vocabulary" ON lesson_vocabulary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read lesson_grammar" ON lesson_grammar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read content_categories" ON content_categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to read content_tags" ON content_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read lesson_tags" ON lesson_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read vocabulary_tags" ON vocabulary_tags FOR SELECT TO authenticated USING (true);

-- Allow admin users to manage content
CREATE POLICY "Allow admin users to manage levels" ON levels FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage modules" ON modules FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage lessons" ON lessons FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage vocabulary" ON vocabulary FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage grammar_rules" ON grammar_rules FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage questions" ON questions FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage lesson_vocabulary" ON lesson_vocabulary FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage lesson_grammar" ON lesson_grammar FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage content_categories" ON content_categories FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage content_tags" ON content_tags FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage lesson_tags" ON lesson_tags FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));

CREATE POLICY "Allow admin users to manage vocabulary_tags" ON vocabulary_tags FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_role IN ('admin', 'super_admin')));
