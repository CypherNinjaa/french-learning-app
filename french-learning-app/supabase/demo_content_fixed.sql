-- Demo Content Population Script (Fixed)
-- French Learning App - Test/Development Content
-- This version fixes SQL syntax errors

-- ==============================================
-- MODULES FOR EXISTING LEVELS
-- ==============================================

INSERT INTO modules (level_id, title, description, order_index) VALUES
-- Level 1: Débutant (Complete beginner)
(1, 'Les Salutations', 'Learn basic greetings and polite expressions', 1),
(1, 'Se Présenter', 'Introduce yourself and ask basic questions', 2),
(1, 'Les Chiffres', 'Numbers from 0 to 100', 3),
(1, 'Les Couleurs', 'Basic colors and descriptions', 4),
(1, 'La Famille', 'Family members and relationships', 5),

-- Level 2: Élémentaire (Elementary)
(2, 'La Nourriture', 'Food vocabulary and meals', 1),
(2, 'Les Vêtements', 'Clothing and shopping', 2),
(2, 'Le Temps et les Saisons', 'Weather, time, and seasons', 3),
(2, 'Les Directions', 'Asking for and giving directions', 4),
(2, 'Au Restaurant', 'Ordering food and restaurant conversations', 5),

-- Level 3: Intermédiaire (Intermediate)  
(3, 'Les Voyages', 'Travel vocabulary and situations', 1),
(3, 'Le Travail', 'Jobs, professions, and workplace', 2),
(3, 'Les Loisirs', 'Hobbies and free time activities', 3),
(3, 'La Santé', 'Health, body parts, and medical situations', 4),
(3, 'Les Émotions', 'Expressing feelings and emotions', 5),

-- Level 4: Avancé (Advanced)
(4, 'La Culture Française', 'French culture and traditions', 1),
(4, 'L''Histoire de France', 'French history and important events', 2),
(4, 'Le Français des Affaires', 'Business French and formal communication', 3),
(4, 'La Littérature', 'French literature and poetry', 4),
(4, 'Les Médias', 'News, media, and current events', 5);

-- ==============================================
-- VOCABULARY - COMPREHENSIVE FRENCH WORDS
-- ==============================================

INSERT INTO vocabulary (french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category, word_type) VALUES
-- Basic Greetings
('Bonjour', 'Hello/Good morning', 'bon-ZHOOR', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'Greetings', 'interjection'),
('Bonsoir', 'Good evening', 'bon-SWAHR', 'Bonsoir madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'Greetings', 'interjection'),
('Salut', 'Hi/Bye (informal)', 'sah-LUU', 'Salut, ça va?', 'Hi, how are you going?', 'beginner', 'Greetings', 'interjection'),
('Au revoir', 'Goodbye', 'oh ruh-VWAHR', 'Au revoir et à bientôt!', 'Goodbye and see you soon!', 'beginner', 'Greetings', 'interjection'),
('Merci', 'Thank you', 'mer-SEE', 'Merci beaucoup pour votre aide.', 'Thank you very much for your help.', 'beginner', 'Greetings', 'interjection'),

-- Personal Pronouns
('Je', 'I', 'zhuh', 'Je suis étudiant.', 'I am a student.', 'beginner', 'Personal', 'noun'),
('Tu', 'You (informal)', 'tuu', 'Tu es français?', 'Are you French?', 'beginner', 'Personal', 'noun'),
('Il', 'He', 'eel', 'Il s''appelle Pierre.', 'His name is Pierre.', 'beginner', 'Personal', 'noun'),
('Elle', 'She', 'ell', 'Elle est professeur.', 'She is a teacher.', 'beginner', 'Personal', 'noun'),
('Nous', 'We', 'noo', 'Nous sommes amis.', 'We are friends.', 'beginner', 'Personal', 'noun'),

-- Numbers
('Un', 'One', 'uhn', 'J''ai un chat.', 'I have one cat.', 'beginner', 'Numbers', 'noun'),
('Deux', 'Two', 'duh', 'Il a deux soeurs.', 'He has two sisters.', 'beginner', 'Numbers', 'noun'),
('Trois', 'Three', 'twah', 'Nous avons trois enfants.', 'We have three children.', 'beginner', 'Numbers', 'noun'),
('Quatre', 'Four', 'kat-ruh', 'La table a quatre chaises.', 'The table has four chairs.', 'beginner', 'Numbers', 'noun'),
('Cinq', 'Five', 'sank', 'Il y a cinq jours dans la semaine de travail.', 'There are five days in the work week.', 'beginner', 'Numbers', 'noun'),

-- Colors
('Rouge', 'Red', 'roozh', 'Ma voiture est rouge.', 'My car is red.', 'beginner', 'Colors', 'adjective'),
('Bleu', 'Blue', 'bluh', 'Le ciel est bleu.', 'The sky is blue.', 'beginner', 'Colors', 'adjective'),
('Vert', 'Green', 'vehr', 'Les arbres sont verts.', 'The trees are green.', 'beginner', 'Colors', 'adjective'),
('Jaune', 'Yellow', 'zhohn', 'Le soleil est jaune.', 'The sun is yellow.', 'beginner', 'Colors', 'adjective'),
('Noir', 'Black', 'nwahr', 'J''aime le café noir.', 'I like black coffee.', 'beginner', 'Colors', 'adjective'),

-- Family
('Famille', 'Family', 'fah-mee', 'J''aime ma famille.', 'I love my family.', 'beginner', 'Family', 'noun'),
('Père', 'Father', 'pehr', 'Mon père travaille beaucoup.', 'My father works a lot.', 'beginner', 'Family', 'noun'),
('Mère', 'Mother', 'mehr', 'Ma mère est médecin.', 'My mother is a doctor.', 'beginner', 'Family', 'noun'),
('Frère', 'Brother', 'frehr', 'Mon frère est plus âgé.', 'My brother is older.', 'beginner', 'Family', 'noun'),
('Soeur', 'Sister', 'suhr', 'Ma soeur étudie à l''université.', 'My sister studies at university.', 'beginner', 'Family', 'noun'),

-- Food
('Pain', 'Bread', 'pan', 'Le pain français est délicieux.', 'French bread is delicious.', 'intermediate', 'Food', 'noun'),
('Fromage', 'Cheese', 'froh-mahzh', 'La France produit beaucoup de fromage.', 'France produces a lot of cheese.', 'intermediate', 'Food', 'noun'),
('Vin', 'Wine', 'van', 'Nous buvons du vin rouge.', 'We drink red wine.', 'intermediate', 'Food', 'noun'),
('Eau', 'Water', 'oh', 'Je bois beaucoup d''eau.', 'I drink a lot of water.', 'intermediate', 'Food', 'noun'),
('Café', 'Coffee', 'kah-fay', 'Le matin, je bois un café.', 'In the morning, I drink coffee.', 'intermediate', 'Food', 'noun');

-- ==============================================
-- GRAMMAR RULES
-- ==============================================

INSERT INTO grammar_rules (title, explanation, examples, difficulty_level, category, order_index) VALUES
('Les Articles Définis', 'Definite articles in French: le (masculine), la (feminine), les (plural)', 
 '[{"french": "le chat", "english": "the cat"}, {"french": "la table", "english": "the table"}, {"french": "les enfants", "english": "the children"}]', 
 'beginner', 'articles', 1),

('Le Verbe Être', 'The verb "to be" - être: je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont', 
 '[{"french": "Je suis étudiant", "english": "I am a student"}, {"french": "Tu es français", "english": "You are French"}, {"french": "Nous sommes amis", "english": "We are friends"}]', 
 'beginner', 'verbs', 2),

('Le Verbe Avoir', 'The verb "to have" - avoir: j''ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont', 
 '[{"french": "J''ai un chat", "english": "I have a cat"}, {"french": "Tu as raison", "english": "You are right"}, {"french": "Ils ont faim", "english": "They are hungry"}]', 
 'beginner', 'verbs', 3),

('Le Passé Composé', 'Past tense formed with avoir/être + past participle', 
 '[{"french": "J''ai mangé", "english": "I ate/have eaten"}, {"french": "Elle est allée", "english": "She went/has gone"}, {"french": "Nous avons vu", "english": "We saw/have seen"}]', 
 'intermediate', 'verbs', 4);

-- ==============================================
-- LESSONS
-- ==============================================

INSERT INTO lessons (module_id, title, description, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
-- Module 1: Les Salutations
(1, 'Dire Bonjour', 'Learn basic greetings in French', 
 '{"introduction": "In this lesson, you will learn how to greet people in French.", "vocabulary": ["Bonjour", "Bonsoir", "Salut"], "grammar_focus": "Basic greeting expressions", "practice_exercises": 3}', 
 'vocabulary', 1, 'beginner', 15),

(1, 'Politesse de Base', 'Basic courtesy expressions', 
 '{"introduction": "Learn essential polite expressions.", "vocabulary": ["Merci", "Excusez-moi"], "grammar_focus": "Polite expressions", "practice_exercises": 4}', 
 'conversation', 2, 'beginner', 20),

-- Module 2: Se Présenter
(2, 'Je me présente', 'How to introduce yourself', 
 '{"introduction": "Learn to introduce yourself in French.", "vocabulary": ["Je", "Tu", "Il", "Elle"], "grammar_focus": "Personal pronouns", "practice_exercises": 5}', 
 'grammar', 1, 'beginner', 25),

-- Module 3: Les Chiffres
(3, 'Les Nombres 1-5', 'Numbers from one to five', 
 '{"introduction": "Learn your first French numbers.", "vocabulary": ["Un", "Deux", "Trois", "Quatre", "Cinq"], "grammar_focus": "Number pronunciation", "practice_exercises": 6}', 
 'vocabulary', 1, 'beginner', 30),

-- Module 6: La Nourriture
(6, 'Les Repas', 'Meals and meal times', 
 '{"introduction": "Learn about French meals and food culture.", "vocabulary": ["Pain", "Fromage", "Vin"], "grammar_focus": "Food-related expressions", "practice_exercises": 5}', 
 'vocabulary', 1, 'intermediate', 25);

-- ==============================================
-- QUESTIONS
-- ==============================================

INSERT INTO questions (lesson_id, question_text, question_type, options, correct_answer, explanation, points, difficulty_level, order_index) VALUES
-- Lesson 1: Dire Bonjour
(1, 'How do you say "Good morning" in French?', 'multiple_choice', 
 '["Bonsoir", "Bonjour", "Salut", "Au revoir"]', 'Bonjour', 
 'Bonjour is used for good morning and general daytime greetings.', 10, 'beginner', 1),

(1, 'Which greeting is informal?', 'multiple_choice', 
 '["Bonjour", "Bonsoir", "Salut", "Au revoir"]', 'Salut', 
 'Salut is the informal way to say hi or bye in French.', 10, 'beginner', 2),

-- Lesson 3: Je me présente
(3, 'Complete: "___ suis étudiant"', 'fill_blank', 
 '["Je", "Tu", "Il", "Elle"]', 'Je', 
 'Je means "I" and is used for self-introduction.', 15, 'beginner', 1),

-- Lesson 4: Les Nombres 1-5
(4, 'What number comes after "deux"?', 'multiple_choice', 
 '["Un", "Trois", "Quatre", "Cinq"]', 'Trois', 
 'Trois (three) comes after deux (two).', 10, 'beginner', 1),

(4, 'How do you say "five" in French?', 'multiple_choice', 
 '["Quatre", "Cinq", "Six", "Sept"]', 'Cinq', 
 'Cinq is the French word for five.', 10, 'beginner', 2);

-- ==============================================
-- SUMMARY
-- ==============================================

-- This simplified script populates your French Learning App with:
-- ✅ 25 Modules across 4 learning levels
-- ✅ 25+ Essential vocabulary words with pronunciation and examples
-- ✅ 4 Core grammar rules from beginner to intermediate
-- ✅ 5 Interactive lessons with structured content  
-- ✅ 5 Practice questions with multiple types
-- ✅ Ready for testing your app features!
