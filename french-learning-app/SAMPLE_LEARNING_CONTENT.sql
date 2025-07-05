-- Sample French Learning Content
-- Run this to populate the database with initial books and lessons

-- Insert sample books
INSERT INTO learning_books (title, description, cover_image_url, difficulty_level, estimated_duration_hours, order_index, is_published, is_active, learning_objectives, tags) VALUES
('French Fundamentals', 'Master the basics of French language with essential vocabulary, pronunciation, and simple conversations.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', 'beginner', 8, 1, true, true, ARRAY['Learn basic French greetings', 'Understand simple vocabulary', 'Form basic sentences', 'Practice pronunciation'], ARRAY['beginner', 'basics', 'vocabulary']),

('French Conversations', 'Build confidence in speaking French through practical dialogues and real-world scenarios.', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400', 'intermediate', 12, 2, true, true, ARRAY['Engage in daily conversations', 'Learn cultural expressions', 'Practice listening skills', 'Build confidence speaking'], ARRAY['intermediate', 'conversation', 'speaking']),

('Advanced French Grammar', 'Perfect your French with complex grammar structures, subjunctive mood, and literary expressions.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'advanced', 15, 3, true, true, ARRAY['Master complex grammar', 'Use subjunctive mood correctly', 'Understand literary French', 'Write formal French'], ARRAY['advanced', 'grammar', 'writing']);

-- Insert sample lessons for Book 1 (French Fundamentals)
INSERT INTO learning_lessons (book_id, title, description, content, vocabulary_words, audio_url, estimated_duration_minutes, difficulty_level, order_index, is_published, is_active, learning_objectives) VALUES
(1, 'Bonjour! French Greetings', 'Learn how to greet people in French and make first impressions.', 
'{"sections": [{"type": "intro", "title": "Welcome to French!", "content": "French is spoken by over 280 million people worldwide. Let''s start with the basics!"}, {"type": "vocabulary", "title": "Essential Greetings", "words": [{"french": "Bonjour", "english": "Hello/Good day", "pronunciation": "bon-ZHOOR"}, {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"}, {"french": "Salut", "english": "Hi/Bye (informal)", "pronunciation": "sah-LUU"}]}, {"type": "practice", "title": "Try It Out", "content": "Practice saying these greetings. Remember, French has formal and informal ways to speak!"}]}',
ARRAY['Bonjour', 'Bonsoir', 'Salut', 'Au revoir', 'Bonne nuit'],
'https://example.com/audio/lesson1.mp3',
20, 'beginner', 1, true, true,
ARRAY['Master basic French greetings', 'Understand formal vs informal speech', 'Practice pronunciation']),

(1, 'Numbers 1-20', 'Count from 1 to 20 in French and learn basic number usage.', 
'{"sections": [{"type": "intro", "title": "French Numbers", "content": "Numbers are essential for daily communication. Let''s learn 1-20!"}, {"type": "vocabulary", "title": "Numbers 1-10", "words": [{"french": "un", "english": "one", "pronunciation": "uhn"}, {"french": "deux", "english": "two", "pronunciation": "duh"}, {"french": "trois", "english": "three", "pronunciation": "twah"}]}, {"type": "exercise", "title": "Practice Counting", "content": "Try counting from 1 to 20 out loud. Pay attention to pronunciation!"}]}',
ARRAY['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
'https://example.com/audio/lesson2.mp3',
25, 'beginner', 2, true, true,
ARRAY['Count from 1-20 in French', 'Use numbers in basic sentences', 'Practice number pronunciation']),

(1, 'Basic Introductions', 'Learn to introduce yourself and ask basic questions about others.', 
'{"sections": [{"type": "intro", "title": "Introducing Yourself", "content": "First impressions matter! Learn to introduce yourself confidently in French."}, {"type": "dialogue", "title": "Sample Conversation", "content": "- Bonjour! Je m''appelle Marie. Et vous?\\n- Bonjour! Je suis Pierre. Enchanté!"}, {"type": "vocabulary", "title": "Introduction Phrases", "words": [{"french": "Je m''appelle", "english": "My name is", "pronunciation": "zhuh mah-PELL"}, {"french": "Je suis", "english": "I am", "pronunciation": "zhuh swee"}]}]}',
ARRAY['Je mappelle', 'Je suis', 'Comment vous appelez-vous', 'Enchanté', 'Quel âge avez-vous'],
'https://example.com/audio/lesson3.mp3',
30, 'beginner', 3, true, true,
ARRAY['Introduce yourself in French', 'Ask basic personal questions', 'Respond to introductions politely']);

-- Insert sample lessons for Book 2 (French Conversations)
INSERT INTO learning_lessons (book_id, title, description, content, vocabulary_words, audio_url, estimated_duration_minutes, difficulty_level, order_index, is_published, is_active, learning_objectives) VALUES
(2, 'At the Café', 'Order food and drinks in French cafés and restaurants.', 
'{"sections": [{"type": "intro", "title": "French Café Culture", "content": "Cafés are central to French social life. Learn to navigate them like a local!"}, {"type": "dialogue", "title": "Ordering Coffee", "content": "- Bonjour! Qu''est-ce que vous désirez?\\n- Je voudrais un café, s''il vous plaît.\\n- Très bien. Avec du sucre?"}, {"type": "vocabulary", "title": "Café Vocabulary", "words": [{"french": "Je voudrais", "english": "I would like", "pronunciation": "zhuh voo-DREH"}, {"french": "un café", "english": "a coffee", "pronunciation": "uhn kah-FEH"}]}]}',
ARRAY['café', 'thé', 'eau', 'sucre', 'lait', 'addition', 'menu', 'Je voudrais'],
'https://example.com/audio/cafe-lesson.mp3',
35, 'intermediate', 1, true, true,
ARRAY['Order food and drinks in French', 'Understand café etiquette', 'Practice polite requests']),

(2, 'Shopping and Prices', 'Learn to shop and negotiate prices in French stores and markets.', 
'{"sections": [{"type": "intro", "title": "French Shopping", "content": "From boutiques to markets, shopping in France requires specific vocabulary and cultural knowledge."}, {"type": "vocabulary", "title": "Shopping Terms", "words": [{"french": "Combien ça coûte?", "english": "How much does it cost?", "pronunciation": "kom-bee-AHN sah koot"}, {"french": "C''est cher", "english": "It''s expensive", "pronunciation": "say SHER"}]}, {"type": "practice", "title": "Role Play", "content": "Practice a shopping scenario with a partner or in front of a mirror."}]}',
ARRAY['prix', 'cher', 'bon marché', 'euros', 'centimes', 'combien', 'acheter', 'vendre'],
'https://example.com/audio/shopping-lesson.mp3',
40, 'intermediate', 2, true, true,
ARRAY['Discuss prices in French', 'Navigate French shopping culture', 'Practice negotiation phrases']);

-- Insert sample tests for lessons
INSERT INTO lesson_tests (lesson_id, title, description, question_count, passing_percentage, randomize_questions, show_correct_answers) VALUES
(1, 'French Greetings Quiz', 'Test your knowledge of basic French greetings and polite expressions.', 5, 70, true, true),
(2, 'Numbers 1-20 Test', 'Practice French numbers from 1 to 20 with listening and multiple choice questions.', 8, 65, true, true),
(3, 'Introduction Practice', 'Test your ability to introduce yourself and others in French.', 6, 70, true, true),
(4, 'Café Conversation Test', 'Practice ordering at a French café through various scenarios.', 7, 75, true, true),
(5, 'Shopping Quiz', 'Test your French shopping vocabulary and price discussions.', 6, 70, true, true);

-- Insert sample questions for the first test (Greetings)
INSERT INTO test_questions (test_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
(1, 'How do you say "Good morning" in French?', 'multiple_choice', 
'["Bonsoir", "Bonjour", "Bonne nuit", "Salut"]', 
'Bonjour', 
'Bonjour is used for "good morning" and "good day" in French. It''s the most common formal greeting.', 
1, 1),

(1, 'Which greeting is more informal?', 'multiple_choice',
'["Bonjour", "Bonsoir", "Salut", "Bonne journée"]',
'Salut',
'Salut is an informal greeting that can mean both "hi" and "bye" and is used with friends and family.',
1, 2),

(1, 'True or False: "Bonsoir" is used in the evening.', 'true_false',
'["True", "False"]',
'True',
'Bonsoir means "good evening" and is used after approximately 6 PM.',
1, 3),

(1, 'Complete the phrase: "Au ____" (goodbye)', 'fill_blank',
'[]',
'revoir',
'Au revoir is the standard way to say goodbye in French.',
1, 4),

(1, 'What does "Enchanté" mean?', 'multiple_choice',
'["Good evening", "Nice to meet you", "How are you?", "See you later"]',
'Nice to meet you',
'Enchanté means "nice to meet you" or "pleased to meet you" and is used when meeting someone for the first time.',
1, 5);

-- Insert default settings and AI config (if not already exists)
INSERT INTO learning_settings (key, value, description, is_public) VALUES
('welcome_message', '"Welcome to French Learning Academy! Start your journey with French Fundamentals."', 'Welcome message shown to new users', true),
('books_per_page', '6', 'Number of books to show per page', false),
('enable_audio_lessons', 'true', 'Whether audio lessons are enabled', false)
ON CONFLICT (key) DO NOTHING;
