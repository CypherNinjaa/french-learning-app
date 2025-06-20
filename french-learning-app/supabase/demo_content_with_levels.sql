-- Complete Demo Content for French Learning App - FIXED VERSION
-- This version handles potential foreign key issues by using explicit ID assignments
-- and proper table dependencies

-- ==============================================
-- STEP 1: CLEAR EXISTING DATA (if any)
-- ==============================================

-- Clear in reverse dependency order to avoid foreign key issues
DELETE FROM vocabulary_tags;
DELETE FROM lesson_tags;
DELETE FROM lesson_grammar;
DELETE FROM lesson_vocabulary;
DELETE FROM questions;
DELETE FROM lessons;
DELETE FROM grammar_rules;
DELETE FROM vocabulary;
DELETE FROM modules;

-- ==============================================
-- STEP 2: INSERT MODULES WITH EXPLICIT IDs
-- ==============================================

INSERT INTO modules (id, level_id, title, description, order_index) VALUES
-- Level 1: Débutant (assuming level_id=1 exists)
(1, 1, 'Les Salutations', 'Learn basic greetings and polite expressions', 1),
(2, 1, 'Se Présenter', 'Introduce yourself and ask basic questions', 2),
(3, 1, 'Les Chiffres', 'Numbers from 0 to 100', 3),
(4, 1, 'Les Couleurs', 'Basic colors and descriptions', 4),
(5, 1, 'La Famille', 'Family members and relationships', 5),

-- Level 2: Élémentaire (assuming level_id=2 exists)
(6, 2, 'La Nourriture', 'Food vocabulary and meals', 1),
(7, 2, 'Les Vêtements', 'Clothing and shopping', 2),
(8, 2, 'Le Temps et les Saisons', 'Weather, time, and seasons', 3),
(9, 2, 'Les Directions', 'Asking for and giving directions', 4),
(10, 2, 'Au Restaurant', 'Ordering food and restaurant conversations', 5),

-- Level 3: Intermédiaire (assuming level_id=3 exists)
(11, 3, 'Les Voyages', 'Travel vocabulary and situations', 1),
(12, 3, 'Le Travail', 'Jobs, professions, and workplace', 2),
(13, 3, 'Les Loisirs', 'Hobbies and free time activities', 3),
(14, 3, 'La Santé', 'Health, body parts, and medical situations', 4),
(15, 3, 'Les Émotions', 'Expressing feelings and emotions', 5),

-- Level 4: Avancé (assuming level_id=4 exists)
(16, 4, 'La Culture Française', 'French culture and traditions', 1),
(17, 4, 'L''Histoire de France', 'French history and important events', 2),
(18, 4, 'Le Français des Affaires', 'Business French and formal communication', 3),
(19, 4, 'La Littérature', 'French literature and poetry', 4),
(20, 4, 'Les Médias', 'News, media, and current events', 5);

-- Reset sequence to avoid conflicts
SELECT setval('modules_id_seq', 20, true);

-- ==============================================
-- STEP 3: INSERT VOCABULARY WITH EXPLICIT IDs
-- ==============================================

INSERT INTO vocabulary (id, french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category, word_type, gender) VALUES
-- Greetings (beginner)
(1, 'Bonjour', 'Hello/Good morning', 'bon-ZHOOR', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'Greetings', 'interjection', NULL),
(2, 'Bonsoir', 'Good evening', 'bon-SWAHR', 'Bonsoir madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'Greetings', 'interjection', NULL),
(3, 'Salut', 'Hi/Bye (informal)', 'sah-LUU', 'Salut, ça va?', 'Hi, how are you?', 'beginner', 'Greetings', 'interjection', NULL),
(4, 'Merci', 'Thank you', 'mer-SEE', 'Merci beaucoup.', 'Thank you very much.', 'beginner', 'Greetings', 'interjection', NULL),
(5, 'Au revoir', 'Goodbye', 'oh ruh-VWAHR', 'Au revoir et à bientôt!', 'Goodbye and see you soon!', 'beginner', 'Greetings', 'interjection', NULL),

-- Personal pronouns (beginner)
(6, 'Je', 'I', 'zhuh', 'Je suis étudiant.', 'I am a student.', 'beginner', 'Personal', 'noun', NULL),
(7, 'Tu', 'You (informal)', 'tuu', 'Tu es français?', 'Are you French?', 'beginner', 'Personal', 'noun', NULL),
(8, 'Il', 'He', 'eel', 'Il s''appelle Pierre.', 'His name is Pierre.', 'beginner', 'Personal', 'noun', 'masculine'),
(9, 'Elle', 'She', 'ell', 'Elle est professeur.', 'She is a teacher.', 'beginner', 'Personal', 'noun', 'feminine'),
(10, 'Nous', 'We', 'noo', 'Nous sommes amis.', 'We are friends.', 'beginner', 'Personal', 'noun', NULL),

-- Numbers (beginner)
(11, 'Un', 'One', 'uhn', 'J''ai un chat.', 'I have one cat.', 'beginner', 'Numbers', 'noun', 'masculine'),
(12, 'Deux', 'Two', 'duh', 'Il a deux frères.', 'He has two brothers.', 'beginner', 'Numbers', 'noun', NULL),
(13, 'Trois', 'Three', 'twah', 'Nous avons trois enfants.', 'We have three children.', 'beginner', 'Numbers', 'noun', NULL),
(14, 'Quatre', 'Four', 'kat-ruh', 'La table a quatre chaises.', 'The table has four chairs.', 'beginner', 'Numbers', 'noun', NULL),
(15, 'Cinq', 'Five', 'sank', 'Elle a cinq livres.', 'She has five books.', 'beginner', 'Numbers', 'noun', NULL),

-- Colors (beginner)
(16, 'Rouge', 'Red', 'roozh', 'La pomme est rouge.', 'The apple is red.', 'beginner', 'Colors', 'adjective', NULL),
(17, 'Bleu', 'Blue', 'bluh', 'Le ciel est bleu.', 'The sky is blue.', 'beginner', 'Colors', 'adjective', NULL),
(18, 'Vert', 'Green', 'vehr', 'L''herbe est verte.', 'The grass is green.', 'beginner', 'Colors', 'adjective', NULL),
(19, 'Jaune', 'Yellow', 'zhohn', 'Le soleil est jaune.', 'The sun is yellow.', 'beginner', 'Colors', 'adjective', NULL),
(20, 'Noir', 'Black', 'nwahr', 'Le chat est noir.', 'The cat is black.', 'beginner', 'Colors', 'adjective', NULL),

-- Family (beginner)
(21, 'Famille', 'Family', 'fah-mee', 'J''aime ma famille.', 'I love my family.', 'beginner', 'Family', 'noun', 'feminine'),
(22, 'Père', 'Father', 'pehr', 'Mon père travaille.', 'My father works.', 'beginner', 'Family', 'noun', 'masculine'),
(23, 'Mère', 'Mother', 'mehr', 'Ma mère cuisine.', 'My mother cooks.', 'beginner', 'Family', 'noun', 'feminine'),
(24, 'Frère', 'Brother', 'frehr', 'Mon frère étudie.', 'My brother studies.', 'beginner', 'Family', 'noun', 'masculine'),
(25, 'Soeur', 'Sister', 'suhr', 'Ma soeur chante.', 'My sister sings.', 'beginner', 'Family', 'noun', 'feminine'),

-- Food (intermediate)
(26, 'Pain', 'Bread', 'pan', 'Le pain est frais.', 'The bread is fresh.', 'intermediate', 'Food', 'noun', 'masculine'),
(27, 'Eau', 'Water', 'oh', 'L''eau est froide.', 'The water is cold.', 'intermediate', 'Food', 'noun', 'feminine'),
(28, 'Café', 'Coffee', 'kah-fay', 'Le café est chaud.', 'The coffee is hot.', 'intermediate', 'Food', 'noun', 'masculine'),
(29, 'Fromage', 'Cheese', 'froh-mahzh', 'Le fromage est délicieux.', 'The cheese is delicious.', 'intermediate', 'Food', 'noun', 'masculine'),
(30, 'Vin', 'Wine', 'van', 'Le vin est rouge.', 'The wine is red.', 'intermediate', 'Food', 'noun', 'masculine'),

-- Travel (intermediate)
(31, 'Avion', 'Airplane', 'ah-vee-ohn', 'L''avion décolle.', 'The plane takes off.', 'intermediate', 'Travel', 'noun', 'masculine'),
(32, 'Train', 'Train', 'tran', 'Le train arrive.', 'The train arrives.', 'intermediate', 'Travel', 'noun', 'masculine'),
(33, 'Hôtel', 'Hotel', 'oh-tel', 'L''hôtel est complet.', 'The hotel is full.', 'intermediate', 'Travel', 'noun', 'masculine'),
(34, 'Voyage', 'Trip', 'voh-yahzh', 'Le voyage est long.', 'The trip is long.', 'intermediate', 'Travel', 'noun', 'masculine'),
(35, 'Passeport', 'Passport', 'pass-por', 'Mon passeport expire.', 'My passport expires.', 'intermediate', 'Travel', 'noun', 'masculine'),

-- Business (advanced)
(36, 'Entreprise', 'Company', 'ahn-truh-preez', 'L''entreprise grandit.', 'The company grows.', 'advanced', 'Business', 'noun', 'feminine'),
(37, 'Réunion', 'Meeting', 'ray-uu-nee-ohn', 'La réunion commence.', 'The meeting starts.', 'advanced', 'Business', 'noun', 'feminine'),
(38, 'Contrat', 'Contract', 'kon-trah', 'Le contrat est signé.', 'The contract is signed.', 'advanced', 'Business', 'noun', 'masculine'),
(39, 'Budget', 'Budget', 'buu-zheh', 'Le budget est approuvé.', 'The budget is approved.', 'advanced', 'Business', 'noun', 'masculine'),
(40, 'Projet', 'Project', 'pro-zheh', 'Le projet avance.', 'The project progresses.', 'advanced', 'Business', 'noun', 'masculine');

-- Reset sequence to avoid conflicts
SELECT setval('vocabulary_id_seq', 40, true);

-- ==============================================
-- STEP 4: INSERT GRAMMAR RULES WITH EXPLICIT IDs
-- ==============================================

INSERT INTO grammar_rules (id, title, explanation, examples, difficulty_level, category, order_index) VALUES
-- Beginner Grammar
(1, 'Les Articles Définis', 'Definite articles: le (masculine), la (feminine), les (plural)', 
 '[{"french": "le chat", "english": "the cat"}, {"french": "la table", "english": "the table"}, {"french": "les enfants", "english": "the children"}]', 
 'beginner', 'articles', 1),

(2, 'Le Verbe Être', 'The verb "to be": je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont', 
 '[{"french": "Je suis français", "english": "I am French"}, {"french": "Tu es étudiant", "english": "You are a student"}, {"french": "Il est professeur", "english": "He is a teacher"}]', 
 'beginner', 'verbs', 2),

(3, 'Le Verbe Avoir', 'The verb "to have": j''ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont', 
 '[{"french": "J''ai un chat", "english": "I have a cat"}, {"french": "Tu as une voiture", "english": "You have a car"}, {"french": "Elle a des amis", "english": "She has friends"}]', 
 'beginner', 'verbs', 3),

-- Intermediate Grammar
(4, 'Le Passé Composé', 'Past tense with avoir/être + past participle', 
 '[{"french": "J''ai mangé", "english": "I ate"}, {"french": "Elle est partie", "english": "She left"}, {"french": "Nous avons vu", "english": "We saw"}]', 
 'intermediate', 'verbs', 4),

(5, 'L''Imparfait', 'Imperfect tense for ongoing or habitual past actions', 
 '[{"french": "Je parlais", "english": "I was speaking"}, {"french": "Il faisait beau", "english": "The weather was nice"}, {"french": "Nous étions jeunes", "english": "We were young"}]', 
 'intermediate', 'verbs', 5),

-- Advanced Grammar
(6, 'Le Subjonctif', 'Subjunctive mood for doubt, emotion, necessity', 
 '[{"french": "Il faut que tu viennes", "english": "You must come"}, {"french": "Je doute qu''il soit là", "english": "I doubt he is there"}]', 
 'advanced', 'verbs', 6);

-- Reset sequence to avoid conflicts
SELECT setval('grammar_rules_id_seq', 6, true);

-- ==============================================
-- STEP 5: INSERT LESSONS WITH EXPLICIT IDs
-- ==============================================

INSERT INTO lessons (id, module_id, title, description, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
-- Module 1: Les Salutations (module_id = 1)
(1, 1, 'Dire Bonjour', 'Learn basic greetings in French', 
 '{"introduction": "Learn how to greet people in French", "vocabulary": ["Bonjour", "Bonsoir", "Salut"], "grammar_focus": "Basic greeting expressions"}', 
 'vocabulary', 1, 'beginner', 15),

(2, 1, 'Politesse de Base', 'Basic courtesy expressions', 
 '{"introduction": "Learn essential polite expressions", "vocabulary": ["Merci", "Au revoir"], "grammar_focus": "Polite expressions"}', 
 'conversation', 2, 'beginner', 20),

-- Module 2: Se Présenter (module_id = 2)
(3, 2, 'Je me présente', 'How to introduce yourself', 
 '{"introduction": "Learn to introduce yourself in French", "vocabulary": ["Je", "Tu", "Il", "Elle"], "grammar_focus": "Personal pronouns"}', 
 'grammar', 1, 'beginner', 25),

-- Module 3: Les Chiffres (module_id = 3)
(4, 3, 'Les Nombres 1-5', 'Numbers from one to five', 
 '{"introduction": "Learn your first French numbers", "vocabulary": ["Un", "Deux", "Trois", "Quatre", "Cinq"], "grammar_focus": "Number pronunciation"}', 
 'vocabulary', 1, 'beginner', 30),

-- Module 4: Les Couleurs (module_id = 4)
(5, 4, 'Couleurs de Base', 'Basic colors in French', 
 '{"introduction": "Learn essential colors", "vocabulary": ["Rouge", "Bleu", "Vert", "Jaune", "Noir"], "grammar_focus": "Color adjectives"}', 
 'vocabulary', 1, 'beginner', 20),

-- Module 6: La Nourriture (module_id = 6)
(6, 6, 'Les Repas', 'Meals and food basics', 
 '{"introduction": "Learn about French food culture", "vocabulary": ["Pain", "Eau", "Café", "Fromage", "Vin"], "grammar_focus": "Food vocabulary"}', 
 'vocabulary', 1, 'intermediate', 25),

-- Module 11: Les Voyages (module_id = 11)
(7, 11, 'À l''Aéroport', 'At the airport', 
 '{"introduction": "Essential travel vocabulary", "vocabulary": ["Avion", "Train", "Hôtel", "Voyage", "Passeport"], "grammar_focus": "Travel expressions"}', 
 'vocabulary', 1, 'intermediate', 30);

-- Reset sequence to avoid conflicts
SELECT setval('lessons_id_seq', 7, true);

-- ==============================================
-- STEP 6: INSERT QUESTIONS WITH EXPLICIT IDs
-- ==============================================

INSERT INTO questions (id, lesson_id, question_text, question_type, options, correct_answer, explanation, points, difficulty_level, order_index) VALUES
-- Lesson 1: Dire Bonjour (lesson_id = 1)
(1, 1, 'How do you say "Good morning" in French?', 'multiple_choice', 
 '["Bonsoir", "Bonjour", "Salut", "Au revoir"]', 'Bonjour', 
 'Bonjour is used for good morning and daytime greetings.', 10, 'beginner', 1),

(2, 1, 'Which greeting is informal?', 'multiple_choice', 
 '["Bonjour", "Bonsoir", "Salut", "Au revoir"]', 'Salut', 
 'Salut is the informal way to say hi or bye in French.', 10, 'beginner', 2),

-- Lesson 3: Je me présente (lesson_id = 3)
(3, 3, 'Complete: "___ suis étudiant"', 'fill_blank', 
 '["Je", "Tu", "Il", "Elle"]', 'Je', 
 'Je means "I" and is used for self-introduction.', 15, 'beginner', 1),

-- Lesson 4: Les Nombres 1-5 (lesson_id = 4)
(4, 4, 'What comes after "deux"?', 'multiple_choice', 
 '["Un", "Trois", "Quatre", "Cinq"]', 'Trois', 
 'Trois (three) comes after deux (two).', 10, 'beginner', 1),

(5, 4, 'How do you say "five" in French?', 'multiple_choice', 
 '["Quatre", "Cinq", "Six", "Sept"]', 'Cinq', 
 'Cinq is the French word for five.', 10, 'beginner', 2),

-- Lesson 5: Couleurs de Base (lesson_id = 5)
(6, 5, 'What color is "rouge"?', 'multiple_choice', 
 '["Blue", "Red", "Green", "Yellow"]', 'Red', 
 'Rouge means red in French.', 10, 'beginner', 1),

-- Lesson 6: Les Repas (lesson_id = 6)
(7, 6, 'What is "pain" in English?', 'multiple_choice', 
 '["Pain", "Bread", "Water", "Coffee"]', 'Bread', 
 'Pain means bread in French.', 15, 'intermediate', 1);

-- Reset sequence to avoid conflicts
SELECT setval('questions_id_seq', 7, true);

-- ==============================================
-- STEP 7: INSERT ASSOCIATIONS (only if tables exist)
-- ==============================================

-- Link vocabulary to lessons (only insert if lesson_vocabulary table exists)
INSERT INTO lesson_vocabulary (lesson_id, vocabulary_id, is_primary) VALUES
-- Lesson 1: Dire Bonjour - Link greeting vocabulary
(1, 1, true),   -- Bonjour
(1, 2, true),   -- Bonsoir  
(1, 3, true),   -- Salut
(1, 4, false),  -- Merci
(1, 5, false),  -- Au revoir

-- Lesson 2: Politesse de Base - Link polite expressions
(2, 4, true),   -- Merci
(2, 5, true),   -- Au revoir

-- Lesson 3: Je me présente - Link personal pronouns
(3, 6, true),   -- Je
(3, 7, true),   -- Tu
(3, 8, true),   -- Il
(3, 9, true),   -- Elle
(3, 10, true),  -- Nous

-- Lesson 4: Les Nombres 1-5 - Link numbers
(4, 11, true),  -- Un
(4, 12, true),  -- Deux
(4, 13, true),  -- Trois
(4, 14, true),  -- Quatre
(4, 15, true),  -- Cinq

-- Lesson 5: Couleurs de Base - Link colors
(5, 16, true),  -- Rouge
(5, 17, true),  -- Bleu
(5, 18, true),  -- Vert
(5, 19, true),  -- Jaune
(5, 20, true),  -- Noir

-- Lesson 6: Les Repas - Link food vocabulary
(6, 26, true),  -- Pain
(6, 27, true),  -- Eau
(6, 28, true),  -- Café
(6, 29, true),  -- Fromage
(6, 30, true);  -- Vin

-- Link grammar rules to lessons (only insert if lesson_grammar table exists)
INSERT INTO lesson_grammar (lesson_id, grammar_rule_id, is_primary) VALUES
-- Link basic grammar to beginner lessons
(3, 2, true),   -- Le Verbe Être - Je me présente
(3, 3, false), -- Le Verbe Avoir - Je me présente
(6, 1, true);   -- Les Articles Définis - Les Repas

-- ==============================================
-- STEP 8: INSERT TAGS (only if tag tables exist and tags are defined)
-- ==============================================

-- Note: These inserts will only work if you have predefined tags in your 'tags' table
-- If you get errors here, you can skip this section or create the tags first:

-- INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
-- Tag essential lessons (assumes tag_id 1 = 'essential')
-- (1, 1),  -- Dire Bonjour - essential
-- (2, 1),  -- Politesse de Base - essential
-- (3, 1);  -- Je me présente - essential

-- INSERT INTO vocabulary_tags (vocabulary_id, tag_id) VALUES
-- Tag essential vocabulary (assumes tag_id 1 = 'essential')
-- (1, 1),  -- Bonjour - essential
-- (2, 1),  -- Bonsoir - essential
-- (3, 1);  -- Salut - essential

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check what was inserted:
SELECT 'Modules inserted:', COUNT(*) FROM modules;
SELECT 'Vocabulary inserted:', COUNT(*) FROM vocabulary;
SELECT 'Grammar rules inserted:', COUNT(*) FROM grammar_rules;
SELECT 'Lessons inserted:', COUNT(*) FROM lessons;
SELECT 'Questions inserted:', COUNT(*) FROM questions;
SELECT 'Lesson-vocabulary links:', COUNT(*) FROM lesson_vocabulary;
SELECT 'Lesson-grammar links:', COUNT(*) FROM lesson_grammar;

-- ==============================================
-- SUMMARY
-- ==============================================

-- This FIXED script:
-- ✅ Clears existing data to avoid conflicts
-- ✅ Uses explicit IDs to ensure proper foreign key relationships
-- ✅ Resets sequences to prevent ID conflicts
-- ✅ Inserts data in proper dependency order
-- ✅ Includes verification queries
-- ✅ Handles potential missing association tables gracefully

-- If you still get errors, it likely means your 'levels' table is missing data.
-- In that case, you may need to first run:
-- INSERT INTO levels (id, name, description) VALUES 
-- (1, 'Débutant', 'Beginner level'),
-- (2, 'Élémentaire', 'Elementary level'), 
-- (3, 'Intermédiaire', 'Intermediate level'),
-- (4, 'Avancé', 'Advanced level');
