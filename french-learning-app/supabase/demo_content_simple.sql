-- Simple Demo Content for French Learning App
-- This adds essential content for testing without complex relationships

-- ==============================================
-- ESSENTIAL VOCABULARY ONLY
-- ==============================================

INSERT INTO vocabulary (french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category, word_type) VALUES
-- Essential Greetings
('Bonjour', 'Hello/Good morning', 'bon-ZHOOR', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'Greetings', 'interjection'),
('Bonsoir', 'Good evening', 'bon-SWAHR', 'Bonsoir madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'Greetings', 'interjection'),
('Salut', 'Hi/Bye (informal)', 'sah-LUU', 'Salut, ça va?', 'Hi, how are you doing?', 'beginner', 'Greetings', 'interjection'),
('Merci', 'Thank you', 'mer-SEE', 'Merci beaucoup.', 'Thank you very much.', 'beginner', 'Greetings', 'interjection'),
('Au revoir', 'Goodbye', 'oh ruh-VWAHR', 'Au revoir et à bientôt!', 'Goodbye and see you soon!', 'beginner', 'Greetings', 'interjection'),

-- Essential Personal Words
('Je', 'I', 'zhuh', 'Je suis étudiant.', 'I am a student.', 'beginner', 'Personal', 'noun'),
('Tu', 'You (informal)', 'tuu', 'Tu es français?', 'Are you French?', 'beginner', 'Personal', 'noun'),
('Il', 'He', 'eel', 'Il parle français.', 'He speaks French.', 'beginner', 'Personal', 'noun'),
('Elle', 'She', 'ell', 'Elle est professeur.', 'She is a teacher.', 'beginner', 'Personal', 'noun'),
('Nous', 'We', 'noo', 'Nous sommes amis.', 'We are friends.', 'beginner', 'Personal', 'noun'),

-- Essential Numbers
('Un', 'One', 'uhn', 'Il y a un chat.', 'There is one cat.', 'beginner', 'Numbers', 'noun'),
('Deux', 'Two', 'duh', 'J''ai deux frères.', 'I have two brothers.', 'beginner', 'Numbers', 'noun'),
('Trois', 'Three', 'twah', 'Il y a trois chaises.', 'There are three chairs.', 'beginner', 'Numbers', 'noun'),
('Quatre', 'Four', 'kat-ruh', 'Nous avons quatre chats.', 'We have four cats.', 'beginner', 'Numbers', 'noun'),
('Cinq', 'Five', 'sank', 'Elle a cinq livres.', 'She has five books.', 'beginner', 'Numbers', 'noun'),

-- Essential Colors
('Rouge', 'Red', 'roozh', 'La pomme est rouge.', 'The apple is red.', 'beginner', 'Colors', 'adjective'),
('Bleu', 'Blue', 'bluh', 'Le ciel est bleu.', 'The sky is blue.', 'beginner', 'Colors', 'adjective'),
('Vert', 'Green', 'vehr', 'L''herbe est verte.', 'The grass is green.', 'beginner', 'Colors', 'adjective'),
('Jaune', 'Yellow', 'zhohn', 'Le soleil est jaune.', 'The sun is yellow.', 'beginner', 'Colors', 'adjective'),
('Noir', 'Black', 'nwahr', 'Le chat est noir.', 'The cat is black.', 'beginner', 'Colors', 'adjective'),

-- Essential Family
('Famille', 'Family', 'fah-mee', 'Ma famille est grande.', 'My family is big.', 'beginner', 'Family', 'noun'),
('Père', 'Father', 'pehr', 'Mon père travaille.', 'My father works.', 'beginner', 'Family', 'noun'),
('Mère', 'Mother', 'mehr', 'Ma mère cuisine.', 'My mother cooks.', 'beginner', 'Family', 'noun'),
('Frère', 'Brother', 'frehr', 'Mon frère étudie.', 'My brother studies.', 'beginner', 'Family', 'noun'),
('Soeur', 'Sister', 'suhr', 'Ma soeur chante.', 'My sister sings.', 'beginner', 'Family', 'noun'),

-- Essential Food
('Pain', 'Bread', 'pan', 'Le pain est frais.', 'The bread is fresh.', 'intermediate', 'Food', 'noun'),
('Eau', 'Water', 'oh', 'L''eau est froide.', 'The water is cold.', 'intermediate', 'Food', 'noun'),
('Café', 'Coffee', 'kah-fay', 'Le café est chaud.', 'The coffee is hot.', 'intermediate', 'Food', 'noun'),
('Fromage', 'Cheese', 'froh-mahzh', 'Le fromage est délicieux.', 'The cheese is delicious.', 'intermediate', 'Food', 'noun'),
('Vin', 'Wine', 'van', 'Le vin est rouge.', 'The wine is red.', 'intermediate', 'Food', 'noun');

-- ==============================================
-- BASIC GRAMMAR RULES  
-- ==============================================

INSERT INTO grammar_rules (title, explanation, examples, difficulty_level, category, order_index) VALUES
('Les Articles Définis', 'Definite articles: le (masculine), la (feminine), les (plural)', 
 '[{"french": "le chat", "english": "the cat"}, {"french": "la table", "english": "the table"}, {"french": "les enfants", "english": "the children"}]', 
 'beginner', 'articles', 1),

('Le Verbe Être', 'The verb "to be": je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont', 
 '[{"french": "Je suis français", "english": "I am French"}, {"french": "Tu es étudiant", "english": "You are a student"}, {"french": "Il est professeur", "english": "He is a teacher"}]', 
 'beginner', 'verbs', 2),

('Le Verbe Avoir', 'The verb "to have": j''ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont', 
 '[{"french": "J''ai un chat", "english": "I have a cat"}, {"french": "Tu as une voiture", "english": "You have a car"}, {"french": "Elle a des amis", "english": "She has friends"}]', 
 'beginner', 'verbs', 3);

-- ==============================================
-- SUMMARY
-- ==============================================

-- This basic script provides:
-- ✅ 30 Essential French vocabulary words
-- ✅ 3 Core grammar rules  
-- ✅ Proper pronunciation guides
-- ✅ Example sentences for context
-- ✅ Difficulty levels for progressive learning
-- ✅ Categories for organized content

-- Perfect for testing your Content Management Dashboard!
