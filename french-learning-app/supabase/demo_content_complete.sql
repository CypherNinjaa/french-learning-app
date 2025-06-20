-- Complete Demo Content for French Learning App
-- Populates ALL tables with proper relationships
-- Based on Stage 3.2 content management schema

-- ==============================================
-- STEP 1: MODULES (depends on levels)
-- ==============================================

INSERT INTO modules (level_id, title, description, order_index) VALUES
-- Level 1: Débutant (id=1)
(1, 'Les Salutations', 'Learn basic greetings and polite expressions', 1),
(1, 'Se Présenter', 'Introduce yourself and ask basic questions', 2),
(1, 'Les Chiffres', 'Numbers from 0 to 100', 3),
(1, 'Les Couleurs', 'Basic colors and descriptions', 4),
(1, 'La Famille', 'Family members and relationships', 5),

-- Level 2: Élémentaire (id=2)
(2, 'La Nourriture', 'Food vocabulary and meals', 1),
(2, 'Les Vêtements', 'Clothing and shopping', 2),
(2, 'Le Temps et les Saisons', 'Weather, time, and seasons', 3),
(2, 'Les Directions', 'Asking for and giving directions', 4),
(2, 'Au Restaurant', 'Ordering food and restaurant conversations', 5),

-- Level 3: Intermédiaire (id=3)
(3, 'Les Voyages', 'Travel vocabulary and situations', 1),
(3, 'Le Travail', 'Jobs, professions, and workplace', 2),
(3, 'Les Loisirs', 'Hobbies and free time activities', 3),
(3, 'La Santé', 'Health, body parts, and medical situations', 4),
(3, 'Les Émotions', 'Expressing feelings and emotions', 5),

-- Level 4: Avancé (id=4)
(4, 'La Culture Française', 'French culture and traditions', 1),
(4, 'L''Histoire de France', 'French history and important events', 2),
(4, 'Le Français des Affaires', 'Business French and formal communication', 3),
(4, 'La Littérature', 'French literature and poetry', 4),
(4, 'Les Médias', 'News, media, and current events', 5);

-- ==============================================
-- STEP 2: VOCABULARY (independent)
-- ==============================================

INSERT INTO vocabulary (french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category, word_type, gender) VALUES
-- Greetings (beginner)
('Bonjour', 'Hello/Good morning', 'bon-ZHOOR', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'Greetings', 'interjection', NULL),
('Bonsoir', 'Good evening', 'bon-SWAHR', 'Bonsoir madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'Greetings', 'interjection', NULL),
('Salut', 'Hi/Bye (informal)', 'sah-LUU', 'Salut, ça va?', 'Hi, how are you?', 'beginner', 'Greetings', 'interjection', NULL),
('Merci', 'Thank you', 'mer-SEE', 'Merci beaucoup.', 'Thank you very much.', 'beginner', 'Greetings', 'interjection', NULL),
('Au revoir', 'Goodbye', 'oh ruh-VWAHR', 'Au revoir et à bientôt!', 'Goodbye and see you soon!', 'beginner', 'Greetings', 'interjection', NULL),

-- Personal pronouns (beginner)
('Je', 'I', 'zhuh', 'Je suis étudiant.', 'I am a student.', 'beginner', 'Personal', 'noun', NULL),
('Tu', 'You (informal)', 'tuu', 'Tu es français?', 'Are you French?', 'beginner', 'Personal', 'noun', NULL),
('Il', 'He', 'eel', 'Il s''appelle Pierre.', 'His name is Pierre.', 'beginner', 'Personal', 'noun', 'masculine'),
('Elle', 'She', 'ell', 'Elle est professeur.', 'She is a teacher.', 'beginner', 'Personal', 'noun', 'feminine'),
('Nous', 'We', 'noo', 'Nous sommes amis.', 'We are friends.', 'beginner', 'Personal', 'noun', NULL),

-- Numbers (beginner)
('Un', 'One', 'uhn', 'J''ai un chat.', 'I have one cat.', 'beginner', 'Numbers', 'noun', 'masculine'),
('Deux', 'Two', 'duh', 'Il a deux frères.', 'He has two brothers.', 'beginner', 'Numbers', 'noun', NULL),
('Trois', 'Three', 'twah', 'Nous avons trois enfants.', 'We have three children.', 'beginner', 'Numbers', 'noun', NULL),
('Quatre', 'Four', 'kat-ruh', 'La table a quatre chaises.', 'The table has four chairs.', 'beginner', 'Numbers', 'noun', NULL),
('Cinq', 'Five', 'sank', 'Elle a cinq livres.', 'She has five books.', 'beginner', 'Numbers', 'noun', NULL),

-- Colors (beginner)
('Rouge', 'Red', 'roozh', 'La pomme est rouge.', 'The apple is red.', 'beginner', 'Colors', 'adjective', NULL),
('Bleu', 'Blue', 'bluh', 'Le ciel est bleu.', 'The sky is blue.', 'beginner', 'Colors', 'adjective', NULL),
('Vert', 'Green', 'vehr', 'L''herbe est verte.', 'The grass is green.', 'beginner', 'Colors', 'adjective', NULL),
('Jaune', 'Yellow', 'zhohn', 'Le soleil est jaune.', 'The sun is yellow.', 'beginner', 'Colors', 'adjective', NULL),
('Noir', 'Black', 'nwahr', 'Le chat est noir.', 'The cat is black.', 'beginner', 'Colors', 'adjective', NULL),

-- Family (beginner)
('Famille', 'Family', 'fah-mee', 'J''aime ma famille.', 'I love my family.', 'beginner', 'Family', 'noun', 'feminine'),
('Père', 'Father', 'pehr', 'Mon père travaille.', 'My father works.', 'beginner', 'Family', 'noun', 'masculine'),
('Mère', 'Mother', 'mehr', 'Ma mère cuisine.', 'My mother cooks.', 'beginner', 'Family', 'noun', 'feminine'),
('Frère', 'Brother', 'frehr', 'Mon frère étudie.', 'My brother studies.', 'beginner', 'Family', 'noun', 'masculine'),
('Soeur', 'Sister', 'suhr', 'Ma soeur chante.', 'My sister sings.', 'beginner', 'Family', 'noun', 'feminine'),

-- Food (intermediate)
('Pain', 'Bread', 'pan', 'Le pain est frais.', 'The bread is fresh.', 'intermediate', 'Food', 'noun', 'masculine'),
('Eau', 'Water', 'oh', 'L''eau est froide.', 'The water is cold.', 'intermediate', 'Food', 'noun', 'feminine'),
('Café', 'Coffee', 'kah-fay', 'Le café est chaud.', 'The coffee is hot.', 'intermediate', 'Food', 'noun', 'masculine'),
('Fromage', 'Cheese', 'froh-mahzh', 'Le fromage est délicieux.', 'The cheese is delicious.', 'intermediate', 'Food', 'noun', 'masculine'),
('Vin', 'Wine', 'van', 'Le vin est rouge.', 'The wine is red.', 'intermediate', 'Food', 'noun', 'masculine'),

-- Travel (intermediate)
('Avion', 'Airplane', 'ah-vee-ohn', 'L''avion décolle.', 'The plane takes off.', 'intermediate', 'Travel', 'noun', 'masculine'),
('Train', 'Train', 'tran', 'Le train arrive.', 'The train arrives.', 'intermediate', 'Travel', 'noun', 'masculine'),
('Hôtel', 'Hotel', 'oh-tel', 'L''hôtel est complet.', 'The hotel is full.', 'intermediate', 'Travel', 'noun', 'masculine'),
('Voyage', 'Trip', 'voh-yahzh', 'Le voyage est long.', 'The trip is long.', 'intermediate', 'Travel', 'noun', 'masculine'),
('Passeport', 'Passport', 'pass-por', 'Mon passeport expire.', 'My passport expires.', 'intermediate', 'Travel', 'noun', 'masculine'),

-- Business (advanced)
('Entreprise', 'Company', 'ahn-truh-preez', 'L''entreprise grandit.', 'The company grows.', 'advanced', 'Business', 'noun', 'feminine'),
('Réunion', 'Meeting', 'ray-uu-nee-ohn', 'La réunion commence.', 'The meeting starts.', 'advanced', 'Business', 'noun', 'feminine'),
('Contrat', 'Contract', 'kon-trah', 'Le contrat est signé.', 'The contract is signed.', 'advanced', 'Business', 'noun', 'masculine'),
('Budget', 'Budget', 'buu-zheh', 'Le budget est approuvé.', 'The budget is approved.', 'advanced', 'Business', 'noun', 'masculine'),
('Projet', 'Project', 'pro-zheh', 'Le projet avance.', 'The project progresses.', 'advanced', 'Business', 'noun', 'masculine');

-- ==============================================
-- STEP 3: GRAMMAR RULES (independent)
-- ==============================================

INSERT INTO grammar_rules (title, explanation, examples, difficulty_level, category, order_index) VALUES
-- Beginner Grammar
('Les Articles Définis', 'Definite articles: le (masculine), la (feminine), les (plural)', 
 '[{"french": "le chat", "english": "the cat"}, {"french": "la table", "english": "the table"}, {"french": "les enfants", "english": "the children"}]', 
 'beginner', 'articles', 1),

('Le Verbe Être', 'The verb "to be": je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont', 
 '[{"french": "Je suis français", "english": "I am French"}, {"french": "Tu es étudiant", "english": "You are a student"}, {"french": "Il est professeur", "english": "He is a teacher"}]', 
 'beginner', 'verbs', 2),

('Le Verbe Avoir', 'The verb "to have": j''ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont', 
 '[{"french": "J''ai un chat", "english": "I have a cat"}, {"french": "Tu as une voiture", "english": "You have a car"}, {"french": "Elle a des amis", "english": "She has friends"}]', 
 'beginner', 'verbs', 3),

-- Intermediate Grammar
('Le Passé Composé', 'Past tense with avoir/être + past participle', 
 '[{"french": "J''ai mangé", "english": "I ate"}, {"french": "Elle est partie", "english": "She left"}, {"french": "Nous avons vu", "english": "We saw"}]', 
 'intermediate', 'verbs', 4),

('L''Imparfait', 'Imperfect tense for ongoing or habitual past actions', 
 '[{"french": "Je parlais", "english": "I was speaking"}, {"french": "Il faisait beau", "english": "The weather was nice"}, {"french": "Nous étions jeunes", "english": "We were young"}]', 
 'intermediate', 'verbs', 5),

-- Advanced Grammar
('Le Subjonctif', 'Subjunctive mood for doubt, emotion, necessity', 
 '[{"french": "Il faut que tu viennes", "english": "You must come"}, {"french": "Je doute qu''il soit là", "english": "I doubt he is there"}]', 
 'advanced', 'verbs', 6);

-- ==============================================
-- STEP 4: LESSONS (depends on modules)
-- ==============================================

INSERT INTO lessons (module_id, title, description, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
-- Module 1: Les Salutations (module_id = 1)
(1, 'Dire Bonjour', 'Learn basic greetings in French', 
 '{"introduction": "Learn how to greet people in French", "vocabulary": ["Bonjour", "Bonsoir", "Salut"], "grammar_focus": "Basic greeting expressions"}', 
 'vocabulary', 1, 'beginner', 15),

(1, 'Politesse de Base', 'Basic courtesy expressions', 
 '{"introduction": "Learn essential polite expressions", "vocabulary": ["Merci", "Au revoir"], "grammar_focus": "Polite expressions"}', 
 'conversation', 2, 'beginner', 20),

-- Module 2: Se Présenter (module_id = 2)
(2, 'Je me présente', 'How to introduce yourself', 
 '{"introduction": "Learn to introduce yourself in French", "vocabulary": ["Je", "Tu", "Il", "Elle"], "grammar_focus": "Personal pronouns"}', 
 'grammar', 1, 'beginner', 25),

-- Module 3: Les Chiffres (module_id = 3)
(3, 'Les Nombres 1-5', 'Numbers from one to five', 
 '{"introduction": "Learn your first French numbers", "vocabulary": ["Un", "Deux", "Trois", "Quatre", "Cinq"], "grammar_focus": "Number pronunciation"}', 
 'vocabulary', 1, 'beginner', 30),

-- Module 4: Les Couleurs (module_id = 4)
(4, 'Couleurs de Base', 'Basic colors in French', 
 '{"introduction": "Learn essential colors", "vocabulary": ["Rouge", "Bleu", "Vert", "Jaune", "Noir"], "grammar_focus": "Color adjectives"}', 
 'vocabulary', 1, 'beginner', 20),

-- Module 6: La Nourriture (module_id = 6)
(6, 'Les Repas', 'Meals and food basics', 
 '{"introduction": "Learn about French food culture", "vocabulary": ["Pain", "Eau", "Café", "Fromage", "Vin"], "grammar_focus": "Food vocabulary"}', 
 'vocabulary', 1, 'intermediate', 25),

-- Module 11: Les Voyages (module_id = 11)
(11, 'À l''Aéroport', 'At the airport', 
 '{"introduction": "Essential travel vocabulary", "vocabulary": ["Avion", "Train", "Hôtel", "Voyage", "Passeport"], "grammar_focus": "Travel expressions"}', 
 'vocabulary', 1, 'intermediate', 30);

-- ==============================================
-- STEP 5: QUESTIONS (depends on lessons)
-- ==============================================

INSERT INTO questions (lesson_id, question_text, question_type, options, correct_answer, explanation, points, difficulty_level, order_index) VALUES
-- Lesson 1: Dire Bonjour (lesson_id = 1)
(1, 'How do you say "Good morning" in French?', 'multiple_choice', 
 '["Bonsoir", "Bonjour", "Salut", "Au revoir"]', 'Bonjour', 
 'Bonjour is used for good morning and daytime greetings.', 10, 'beginner', 1),

(1, 'Which greeting is informal?', 'multiple_choice', 
 '["Bonjour", "Bonsoir", "Salut", "Au revoir"]', 'Salut', 
 'Salut is the informal way to say hi or bye in French.', 10, 'beginner', 2),

-- Lesson 3: Je me présente (lesson_id = 3)
(3, 'Complete: "___ suis étudiant"', 'fill_blank', 
 '["Je", "Tu", "Il", "Elle"]', 'Je', 
 'Je means "I" and is used for self-introduction.', 15, 'beginner', 1),

-- Lesson 4: Les Nombres 1-5 (lesson_id = 4)
(4, 'What comes after "deux"?', 'multiple_choice', 
 '["Un", "Trois", "Quatre", "Cinq"]', 'Trois', 
 'Trois (three) comes after deux (two).', 10, 'beginner', 1),

(4, 'How do you say "five" in French?', 'multiple_choice', 
 '["Quatre", "Cinq", "Six", "Sept"]', 'Cinq', 
 'Cinq is the French word for five.', 10, 'beginner', 2),

-- Lesson 5: Couleurs de Base (lesson_id = 5)
(5, 'What color is "rouge"?', 'multiple_choice', 
 '["Blue", "Red", "Green", "Yellow"]', 'Red', 
 'Rouge means red in French.', 10, 'beginner', 1),

-- Lesson 6: Les Repas (lesson_id = 6)
(6, 'What is "pain" in English?', 'multiple_choice', 
 '["Pain", "Bread", "Water", "Coffee"]', 'Bread', 
 'Pain means bread in French.', 15, 'intermediate', 1);

-- ==============================================
-- STEP 6: ASSOCIATIONS - Link content together
-- ==============================================

-- Link vocabulary to lessons
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

-- Link grammar rules to lessons
INSERT INTO lesson_grammar (lesson_id, grammar_rule_id, is_primary) VALUES
-- Link basic grammar to beginner lessons
(3, 2, true),   -- Le Verbe Être - Je me présente
(3, 3, false), -- Le Verbe Avoir - Je me présente
(6, 1, true);   -- Les Articles Définis - Les Repas

-- Tag lessons for better organization
INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
-- Tag essential lessons
(1, 1),  -- Dire Bonjour - essential
(2, 1),  -- Politesse de Base - essential
(3, 1),  -- Je me présente - essential

-- Tag conversational lessons
(2, 2),  -- Politesse de Base - conversation
(3, 2),  -- Je me présente - conversation

-- Tag formal lessons
(2, 3);  -- Politesse de Base - formal

-- Tag vocabulary with appropriate tags
INSERT INTO vocabulary_tags (vocabulary_id, tag_id) VALUES
-- Tag essential vocabulary
(1, 1),  -- Bonjour - essential
(2, 1),  -- Bonsoir - essential
(3, 1),  -- Salut - essential
(4, 1),  -- Merci - essential
(5, 1),  -- Au revoir - essential

-- Tag conversational vocabulary
(3, 2),  -- Salut - conversation
(7, 2),  -- Tu - conversation

-- Tag formal vocabulary
(1, 3),  -- Bonjour - formal
(2, 3),  -- Bonsoir - formal

-- Tag informal vocabulary
(3, 4),  -- Salut - informal
(7, 4);  -- Tu - informal

-- ==============================================
-- SUMMARY
-- ==============================================

-- This complete script populates ALL Stage 3.2 tables with:
-- ✅ 20 Modules across 4 learning levels
-- ✅ 35 Vocabulary words with full metadata
-- ✅ 6 Grammar rules from beginner to advanced
-- ✅ 7 Interactive lessons with structured content
-- ✅ 7 Practice questions with multiple types
-- ✅ Complete content associations (vocabulary-lesson, grammar-lesson)
-- ✅ Content tagging system for organization
-- ✅ Proper foreign key relationships

-- Ready for testing your Content Management Dashboard!
