-- Clean and Upload French Learning Content
-- This script cleans existing demo content and uploads structured content from markdown

-- 1. CLEAN EXISTING CONTENT
-- Delete in reverse order due to foreign key constraints
DELETE FROM pronunciation_words WHERE id > 0;
DELETE FROM lesson_vocabulary WHERE id > 0;
DELETE FROM lesson_grammar_rules WHERE id > 0;
DELETE FROM questions WHERE id > 0;
DELETE FROM vocabulary WHERE id > 0;
DELETE FROM grammar_rules WHERE id > 0;
DELETE FROM lessons WHERE id > 0;
DELETE FROM modules WHERE id > 0;
DELETE FROM levels WHERE id > 0;

-- Reset sequences
ALTER SEQUENCE levels_id_seq RESTART WITH 1;
ALTER SEQUENCE modules_id_seq RESTART WITH 1;
ALTER SEQUENCE lessons_id_seq RESTART WITH 1;
ALTER SEQUENCE vocabulary_id_seq RESTART WITH 1;
ALTER SEQUENCE grammar_rules_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE pronunciation_words_id_seq RESTART WITH 1;

-- 2. INSERT NEW STRUCTURED CONTENT

-- Create Beginner Level
INSERT INTO levels (name, description, order_index, is_active) VALUES
('Beginner', 'Foundational French learning covering essential vocabulary, grammar, and pronunciation', 1, true);

-- Create Modules
INSERT INTO modules (level_id, title, description, order_index, estimated_duration_minutes, difficulty_level, is_active) VALUES
(1, 'Module I: Greetings (Les Salutations)', 'Learn fundamental greetings, formal vs informal language, and basic introductions', 1, 45, 'beginner', true),
(1, 'Module II: At the Restaurant (Au Restaurant)', 'Essential vocabulary and phrases for dining out, ordering food and drinks', 2, 45, 'beginner', true),
(1, 'Module III: Talking about Professions (Parler des Professions)', 'Learn to describe professions, nationalities, and daily routines', 3, 45, 'beginner', true),
(1, 'Module V: At the Discotheque (À la Discothèque)', 'Question formation, negation, and social conversation skills', 4, 45, 'beginner', true);

-- Create Lessons for each module
INSERT INTO lessons (module_id, title, description, content, lesson_type, order_index, estimated_time_minutes, difficulty_level, is_active) VALUES
-- Module I Lessons
(1, 'Formal vs Informal: vous and tu', 'Master the crucial distinction between formal and informal address in French', 
 '{"sections": ["explanation", "examples", "practice"], "key_concepts": ["vous usage", "tu usage", "verb conjugations"]}', 
 'grammar', 1, 20, 'beginner', true),
(1, 'Greetings Throughout the Day', 'Learn appropriate greetings for different times and situations', 
 '{"sections": ["morning_greetings", "evening_greetings", "casual_greetings"], "vocabulary": ["bonjour", "bonsoir", "salut"]}', 
 'vocabulary', 2, 15, 'beginner', true),
(1, 'Introductions and Names', 'How to introduce yourself and ask for names in French', 
 '{"sections": ["asking_names", "introducing_yourself", "politeness"], "phrases": ["comment vous appelez-vous", "je m\''appelle"]}', 
 'conversation', 3, 20, 'beginner', true),

-- Module II Lessons  
(2, 'Ordering Food and Drinks', 'Essential phrases for ordering in restaurants using polite conditional forms', 
 '{"sections": ["conditional_forms", "menu_vocabulary", "polite_ordering"], "key_verb": "vouloir"}', 
 'vocabulary', 1, 25, 'beginner', true),
(2, 'Restaurant Vocabulary and Etiquette', 'Complete restaurant vocabulary and French dining customs', 
 '{"sections": ["menu_items", "courses", "drinks", "etiquette"], "cultural_notes": ["tipping", "service_compris"]}', 
 'vocabulary', 2, 20, 'beginner', true),

-- Module III Lessons
(3, 'Stating Professions and Nationalities', 'Learn to describe occupations and nationalities with proper agreement', 
 '{"sections": ["profession_grammar", "nationality_agreement", "gender_rules"], "grammar_focus": "no_articles_with_professions"}', 
 'grammar', 1, 25, 'beginner', true),
(3, 'Daily Routines with Reflexive Verbs', 'Master reflexive verbs for describing daily activities', 
 '{"sections": ["reflexive_pronouns", "daily_verbs", "conjugation"], "verb_focus": "reflexive_verbs"}', 
 'grammar', 2, 30, 'beginner', true),

-- Module V Lessons
(4, 'Question Formation Methods', 'Three ways to ask questions in French: intonation, est-ce que, and inversion', 
 '{"sections": ["intonation_questions", "est_ce_que", "inversion"], "formality_levels": ["informal", "neutral", "formal"]}', 
 'grammar', 1, 25, 'beginner', true),
(4, 'Negation with ne...pas', 'Master the standard French negation pattern with ne...pas', 
 '{"sections": ["basic_negation", "with_vowels", "two_verb_sentences"], "pattern": "ne_verb_pas"}', 
 'grammar', 2, 20, 'beginner', true);

-- Insert Vocabulary Items
INSERT INTO vocabulary (french_word, english_translation, pronunciation, difficulty_level, category, gender, word_type, is_active) VALUES
-- Module I Vocabulary
('bonjour', 'good day, hello', 'bon-zhoor', 'beginner', 'greetings', 'masculine', 'interjection', true),
('salut', 'hi, bye', 'sa-loot', 'beginner', 'greetings', null, 'interjection', true),
('bonsoir', 'good evening', 'bon-swahr', 'beginner', 'greetings', 'masculine', 'interjection', true),
('bonne nuit', 'good night', 'bun nwee', 'beginner', 'greetings', 'feminine', 'interjection', true),
('au revoir', 'goodbye', 'oh ruh-vwahr', 'beginner', 'greetings', null, 'interjection', true),
('à bientôt', 'see you soon', 'ah bee-an-toh', 'beginner', 'greetings', null, 'interjection', true),
('vous', 'you (formal/plural)', 'voo', 'beginner', 'pronouns', null, 'pronoun', true),
('tu', 'you (informal)', 'tuu', 'beginner', 'pronouns', null, 'pronoun', true),
('un ami', 'a friend (male)', 'un na-mee', 'beginner', 'people', 'masculine', 'noun', true),
('une amie', 'a friend (female)', 'une na-mee', 'beginner', 'people', 'feminine', 'noun', true),
('monsieur', 'sir, mister', 'muh-syur', 'beginner', 'titles', 'masculine', 'noun', true),
('madame', 'madam, mrs', 'ma-dam', 'beginner', 'titles', 'feminine', 'noun', true),
('enchanté', 'pleased to meet you (male)', 'on-shon-tay', 'beginner', 'greetings', null, 'adjective', true),
('enchantée', 'pleased to meet you (female)', 'on-shon-tay', 'beginner', 'greetings', null, 'adjective', true),

-- Module II Vocabulary
('restaurant', 'restaurant', 'ress-toh-ron', 'beginner', 'restaurant', 'masculine', 'noun', true),
('serveur', 'waiter', 'ser-vur', 'beginner', 'restaurant', 'masculine', 'noun', true),
('serveuse', 'waitress', 'ser-vuhz', 'beginner', 'restaurant', 'feminine', 'noun', true),
('carte', 'menu', 'kart', 'beginner', 'restaurant', 'feminine', 'noun', true),
('addition', 'bill, check', 'a-dee-syon', 'beginner', 'restaurant', 'feminine', 'noun', true),
('entrée', 'appetizer', 'on-tray', 'beginner', 'restaurant', 'feminine', 'noun', true),
('plat principal', 'main course', 'plah pran-see-pal', 'beginner', 'restaurant', 'masculine', 'noun', true),
('dessert', 'dessert', 'deh-sehr', 'beginner', 'restaurant', 'masculine', 'noun', true),
('poulet', 'chicken', 'poo-leh', 'beginner', 'food', 'masculine', 'noun', true),
('poisson', 'fish', 'pwah-son', 'beginner', 'food', 'masculine', 'noun', true),
('légumes', 'vegetables', 'lay-goom', 'beginner', 'food', 'masculine', 'noun', true),
('frites', 'fries', 'freet', 'beginner', 'food', 'feminine', 'noun', true),
('eau', 'water', 'oh', 'beginner', 'drinks', 'feminine', 'noun', true),
('café', 'coffee', 'ka-fay', 'beginner', 'drinks', 'masculine', 'noun', true),
('bière', 'beer', 'bee-ehr', 'beginner', 'drinks', 'feminine', 'noun', true),
('vin', 'wine', 'van', 'beginner', 'drinks', 'masculine', 'noun', true),

-- Module III Vocabulary
('profession', 'profession', 'pro-feh-syon', 'beginner', 'professions', 'feminine', 'noun', true),
('médecin', 'doctor', 'may-duh-san', 'beginner', 'professions', 'masculine', 'noun', true),
('avocat', 'lawyer (male)', 'a-vo-kah', 'beginner', 'professions', 'masculine', 'noun', true),
('avocate', 'lawyer (female)', 'a-vo-kat', 'beginner', 'professions', 'feminine', 'noun', true),
('enseignant', 'teacher (male)', 'on-say-nyon', 'beginner', 'professions', 'masculine', 'noun', true),
('enseignante', 'teacher (female)', 'on-say-nyont', 'beginner', 'professions', 'feminine', 'noun', true),
('étudiant', 'student (male)', 'ay-tuu-dyon', 'beginner', 'professions', 'masculine', 'noun', true),
('étudiante', 'student (female)', 'ay-tuu-dyont', 'beginner', 'professions', 'feminine', 'noun', true),
('français', 'French (male)', 'fron-seh', 'beginner', 'nationalities', 'masculine', 'adjective', true),
('française', 'French (female)', 'fron-sez', 'beginner', 'nationalities', 'feminine', 'adjective', true),
('américain', 'American (male)', 'a-may-ree-kan', 'beginner', 'nationalities', 'masculine', 'adjective', true),
('américaine', 'American (female)', 'a-may-ree-ken', 'beginner', 'nationalities', 'feminine', 'adjective', true),

-- Module V Vocabulary  
('discothèque', 'discotheque', 'dees-ko-tek', 'beginner', 'entertainment', 'feminine', 'noun', true),
('musique', 'music', 'muu-zeek', 'beginner', 'entertainment', 'feminine', 'noun', true),
('danser', 'to dance', 'don-say', 'beginner', 'activities', null, 'verb', true),
('chanter', 'to sing', 'shon-tay', 'beginner', 'activities', null, 'verb', true),
('fête', 'party', 'fet', 'beginner', 'entertainment', 'feminine', 'noun', true),
('verre', 'glass, drink', 'vehr', 'beginner', 'drinks', 'masculine', 'noun', true),
('chanson', 'song', 'shon-son', 'beginner', 'entertainment', 'feminine', 'noun', true);

-- Insert Grammar Rules
INSERT INTO grammar_rules (title, explanation, examples, difficulty_level, category, order_index, is_active) VALUES
('The verb être (to be)', 'The most fundamental irregular verb in French, used for identity, description, and location.',
 '[{"french": "Je suis Paul", "english": "I am Paul"}, {"french": "Vous êtes le professeur", "english": "You are the teacher"}, {"french": "Ils sont étudiants", "english": "They are students"}]',
 'beginner', 'verbs', 1, true),

('Reflexive verb s''appeler (to be called)', 'Used to state names. Reflexive verbs reflect the action back onto the subject using reflexive pronouns.',
 '[{"french": "Je m''appelle Marie", "english": "My name is Marie"}, {"french": "Comment vous appelez-vous?", "english": "What is your name?"}, {"french": "Il s''appelle David", "english": "His name is David"}]',
 'beginner', 'verbs', 2, true),

('Partitive articles: du, de la, de l'', des', 'Used for unspecified quantities of food, drink, or uncountable nouns.',
 '[{"french": "Je mange du pain", "english": "I eat some bread"}, {"french": "Elle boit de la bière", "english": "She drinks some beer"}, {"french": "Nous prenons de l''eau", "english": "We have some water"}]',
 'beginner', 'articles', 3, true),

('Regular -er verb conjugation', 'The most common verb group in French. Remove -er and add the appropriate ending.',
 '[{"french": "Je parle français", "english": "I speak French"}, {"french": "Tu travailles ici", "english": "You work here"}, {"french": "Nous habitons à Paris", "english": "We live in Paris"}]',
 'beginner', 'verbs', 4, true),

('Question formation with est-ce que', 'A neutral way to form questions by adding "est-ce que" to the beginning of a statement.',
 '[{"french": "Est-ce que tu aimes la musique?", "english": "Do you like music?"}, {"french": "Est-ce que vous parlez français?", "english": "Do you speak French?"}, {"french": "Est-ce qu''il travaille ici?", "english": "Does he work here?"}]',
 'beginner', 'questions', 5, true),

('Negation with ne...pas', 'The standard way to make sentences negative by placing "ne" before the verb and "pas" after it.',
 '[{"french": "Je ne parle pas anglais", "english": "I don''t speak English"}, {"french": "Elle n''aime pas le café", "english": "She doesn''t like coffee"}, {"french": "Nous ne dansons pas", "english": "We don''t dance"}]',
 'beginner', 'negation', 6, true);

-- Insert Pronunciation Words
INSERT INTO pronunciation_words (french_word, pronunciation, difficulty_level, category, example_sentence, notes, is_active) VALUES
-- Module I Pronunciations
('bonjour', 'bon-zhoor', 'beginner', 'greetings', 'Bonjour, comment allez-vous?', 'The "on" is a nasal sound', true),
('comment', 'kom-mohn', 'beginner', 'questions', 'Comment vous appelez-vous?', 'The "en" is nasal, final "t" is silent', true),
('s''appeler', 'sa-pell-ay', 'beginner', 'verbs', 'Je m''appelle Marie', 'Reflexive verb pronunciation', true),
('vous', 'voo', 'beginner', 'pronouns', 'Comment vous appelez-vous?', 'The final "s" is silent', true),
('ça va', 'sa va', 'beginner', 'expressions', 'Ça va bien, merci', 'Common casual expression', true),

-- Module II Pronunciations  
('restaurant', 'ress-toh-ron', 'beginner', 'restaurant', 'Nous allons au restaurant', 'Final "t" is silent', true),
('l''addition', 'la-dee-syon', 'beginner', 'restaurant', 'L''addition, s''il vous plaît', 'Liaison with "l''', true),
('voudrais', 'voo-dray', 'beginner', 'verbs', 'Je voudrais un café', 'Polite conditional form', true),
('l''eau', 'low', 'beginner', 'drinks', 'Une carafe d''eau, s''il vous plaît', 'Rounded "o" sound', true),
('vin', 'van', 'beginner', 'drinks', 'Un verre de vin rouge', 'Nasal sound', true),

-- Module III Pronunciations
('profession', 'pro-feh-syon', 'beginner', 'professions', 'Quelle est votre profession?', 'Emphasis on final syllable', true),
('travailler', 'tra-vai-yay', 'beginner', 'verbs', 'Je travaille à Paris', 'The "ll" sounds like "y"', true),
('habiter', 'a-bee-tay', 'beginner', 'verbs', 'J''habite en France', 'Silent "h", liaison with previous word', true),
('indien', 'an-dyan', 'beginner', 'nationalities', 'Il est indien', 'Nasal ending', true),
('indienne', 'an-dyenn', 'beginner', 'nationalities', 'Elle est indienne', 'Feminine form with different ending', true),

-- Module V Pronunciations
('discothèque', 'dees-ko-tek', 'beginner', 'entertainment', 'Nous allons à la discothèque', 'Accent on final syllable', true),
('question', 'kess-tyon', 'beginner', 'grammar', 'C''est une bonne question', 'The "qu" sounds like "k"', true),
('pourquoi', 'poor-kwa', 'beginner', 'questions', 'Pourquoi tu ne danses pas?', 'Question word', true),
('est-ce que', 'ess-kuh', 'beginner', 'questions', 'Est-ce que tu viens?', 'Often pronounced quickly', true),
('musique', 'muu-zeek', 'beginner', 'entertainment', 'J''aime la musique française', 'The "qu" sounds like "k"', true);

-- Create some sample questions for practice
INSERT INTO questions (lesson_id, question_text, question_type, options, correct_answer, explanation, points, difficulty_level, order_index, is_active) VALUES
-- Module I Questions
(1, 'When should you use "vous" instead of "tu"?', 'multiple_choice', 
 '["With close friends", "With strangers or in formal situations", "Only with children", "Never"]',
 'With strangers or in formal situations', 'Vous is used for formal situations, with strangers, older people, and authority figures', 10, 'beginner', 1, true),

(2, 'What is the appropriate greeting for the evening?', 'multiple_choice',
 '["Bonjour", "Salut", "Bonsoir", "Bonne nuit"]',
 'Bonsoir', 'Bonsoir is used to greet people in the evening, typically after 6 PM', 10, 'beginner', 2, true),

(3, 'How do you ask "What is your name?" formally?', 'multiple_choice',
 '["Comment t''appelles-tu?", "Comment vous appelez-vous?", "Quel est ton nom?", "Tu es qui?"]',
 'Comment vous appelez-vous?', 'This is the formal way to ask for someone''s name using vous', 10, 'beginner', 3, true),

-- Module II Questions  
(4, 'What is the polite way to order food in a restaurant?', 'multiple_choice',
 '["Je veux un steak", "Je voudrais un steak", "Donnez-moi un steak", "Un steak!"]',
 'Je voudrais un steak', 'Je voudrais (I would like) is the polite conditional form for ordering', 10, 'beginner', 4, true),

(5, 'Complete: "Je bois ___ bière" (I drink some beer)', 'fill_blank',
 '["du", "de la", "de l''", "des"]',
 'de la', 'Use "de la" with feminine nouns like "bière"', 10, 'beginner', 5, true),

-- Module III Questions
(6, 'How do you say "He is a doctor" in French?', 'multiple_choice',
 '["Il est un médecin", "Il est médecin", "Il a médecin", "Il fait médecin"]',
 'Il est médecin', 'No article is used when stating a profession with être', 10, 'beginner', 6, true),

(7, 'What is the correct conjugation: "Je ___ à 7 heures" (I get up at 7 o''clock)', 'fill_blank',
 '["lève", "me lève", "se lève", "nous levons"]',
 'me lève', 'Reflexive verbs require the reflexive pronoun "me" with "je"', 10, 'beginner', 7, true),

-- Module V Questions
(8, 'Which is the formal way to ask "Do you like music?"', 'multiple_choice',
 '["Tu aimes la musique?", "Est-ce que vous aimez la musique?", "Aimez-vous la musique?", "Vous aimez la musique?"]',
 'Aimez-vous la musique?', 'Inversion is the most formal way to ask questions', 10, 'beginner', 8, true),

(9, 'How do you make this sentence negative: "Je danse"', 'fill_blank',
 '["Je ne danse pas", "Je pas danse", "Je danse ne pas", "Ne je danse pas"]',
 'Je ne danse pas', 'Negation surrounds the verb: ne + verb + pas', 10, 'beginner', 9, true);

-- Success message
SELECT 'Content upload completed successfully! 🎉' as message,
       COUNT(DISTINCT l.id) as levels_created,
       COUNT(DISTINCT m.id) as modules_created, 
       COUNT(DISTINCT le.id) as lessons_created,
       COUNT(DISTINCT v.id) as vocabulary_items,
       COUNT(DISTINCT g.id) as grammar_rules,
       COUNT(DISTINCT p.id) as pronunciation_words,
       COUNT(DISTINCT q.id) as questions_created
FROM levels l
CROSS JOIN modules m  
CROSS JOIN lessons le
CROSS JOIN vocabulary v
CROSS JOIN grammar_rules g
CROSS JOIN pronunciation_words p
CROSS JOIN questions q;
