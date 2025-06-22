-- ================================================
-- COMPLETE FRENCH LEARNING CONTENT UPLOAD
-- ================================================
-- This script will clear all existing content and upload new French learning content
-- based on the structured markdown content provided by the user.

-- ==============================================
-- STEP 1: CLEAR ALL EXISTING CONTENT & RESET SEQUENCES
-- ==============================================

-- Delete all content in proper order to avoid foreign key constraints
DELETE FROM lesson_vocabulary;
DELETE FROM lesson_grammar_rules;
DELETE FROM pronunciation_words;
DELETE FROM questions;
DELETE FROM lessons;
DELETE FROM grammar_rules;
DELETE FROM vocabulary;
DELETE FROM modules;

-- Reset auto-increment sequences
ALTER SEQUENCE modules_id_seq RESTART WITH 1;
ALTER SEQUENCE vocabulary_id_seq RESTART WITH 1;
ALTER SEQUENCE grammar_rules_id_seq RESTART WITH 1;
ALTER SEQUENCE lessons_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE pronunciation_words_id_seq RESTART WITH 1;

-- ==============================================
-- STEP 2: INSERT MODULES FROM MARKDOWN CONTENT
-- ==============================================

INSERT INTO modules (title, description, difficulty_level, order_index, is_active, created_at) VALUES
('Module I: Greetings & Introductions', 
 'Learn essential French greetings, introductions, and courtesy expressions. Master formal vs informal address, basic conversation starters, and cultural norms for French politeness.',
 'beginner', 1, true, NOW()),

('Module II: Basic Grammar Foundations', 
 'Fundamental French grammar including the être verb conjugation, basic sentence structure, and essential grammar rules for beginners.',
 'beginner', 2, true, NOW()),

('Module III: Essential Vocabulary', 
 'Core vocabulary for everyday situations including numbers, colors, family, and common objects.',
 'beginner', 3, true, NOW()),

('Module IV: Expressions & Phrases', 
 'Essential polite expressions and courtesy phrases for everyday interactions.',
 'beginner', 4, true, NOW());

-- ==============================================
-- STEP 3: INSERT VOCABULARY FROM MARKDOWN
-- ==============================================

INSERT INTO vocabulary (french_word, english_translation, pronunciation, example_sentence_fr, example_sentence_en, difficulty_level, category, word_type, gender) VALUES
-- Module I: Greetings vocabulary from markdown
('bonjour', 'good day, hello', 'bon-zhoor', 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'beginner', 'greetings', 'interjection', NULL),
('salut', 'hi, bye (informal)', 'sa-loot', 'Salut, ça va?', 'Hi, how are you?', 'beginner', 'greetings', 'interjection', NULL),
('bonsoir', 'good evening', 'bon-swahr', 'Bonsoir madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'greetings', 'interjection', NULL),
('bonne nuit', 'good night', 'bun nwee', 'Bonne nuit et dormez bien.', 'Good night and sleep well.', 'beginner', 'greetings', 'interjection', NULL),
('au revoir', 'goodbye', 'oh ruh-vwahr', 'Au revoir et à bientôt!', 'Goodbye and see you soon!', 'beginner', 'greetings', 'interjection', NULL),
('à bientôt', 'see you soon', 'ah bee-an-toh', 'À bientôt mes amis!', 'See you soon my friends!', 'beginner', 'greetings', 'interjection', NULL),
('ça va', 'how are you / I''m okay', 'sa va', 'Ça va bien, merci.', 'I''m doing well, thank you.', 'beginner', 'greetings', 'interjection', NULL),

-- Formal vs informal pronouns
('vous', 'you (formal/plural)', 'voo', 'Comment vous appelez-vous?', 'What is your name?', 'beginner', 'pronouns', 'noun', NULL),
('tu', 'you (informal)', 'tuu', 'Comment t''appelles-tu?', 'What is your name?', 'beginner', 'pronouns', 'noun', NULL),

-- People and relationships
('un ami', 'a friend (male)', 'un na-mee', 'Il est mon ami.', 'He is my friend.', 'beginner', 'people', 'noun', 'masculine'),
('une amie', 'a friend (female)', 'une na-mee', 'Elle est mon amie.', 'She is my friend.', 'beginner', 'people', 'noun', 'feminine'),
('un homme', 'a man', 'un ohm', 'Cet homme est grand.', 'This man is tall.', 'beginner', 'people', 'noun', 'masculine'),
('une femme', 'a woman', 'une fam', 'Cette femme est intelligente.', 'This woman is intelligent.', 'beginner', 'people', 'noun', 'feminine'),
('un garçon', 'a boy', 'un gar-son', 'Le garçon joue au football.', 'The boy plays football.', 'beginner', 'people', 'noun', 'masculine'),
('une fille', 'a girl', 'une fee', 'La fille lit un livre.', 'The girl reads a book.', 'beginner', 'people', 'noun', 'feminine'),

-- Titles and courtesy
('monsieur', 'sir, mister', 'muh-syur', 'Bonjour Monsieur Dupont.', 'Hello Mr. Dupont.', 'beginner', 'titles', 'noun', 'masculine'),
('madame', 'ma''am, mrs', 'ma-dam', 'Bonsoir Madame Martin.', 'Good evening Mrs. Martin.', 'beginner', 'titles', 'noun', 'feminine'),
('mademoiselle', 'miss', 'mad-mwa-zel', 'Bonjour Mademoiselle Sophie.', 'Hello Miss Sophie.', 'beginner', 'titles', 'noun', 'feminine'),

-- Basic responses
('oui', 'yes', 'wee', 'Oui, c''est correct.', 'Yes, that''s correct.', 'beginner', 'basic', 'adverb', NULL),
('non', 'no', 'non', 'Non, ce n''est pas vrai.', 'No, that''s not true.', 'beginner', 'basic', 'adverb', NULL),
('merci', 'thank you', 'mer-see', 'Merci beaucoup!', 'Thank you very much!', 'beginner', 'greetings', 'interjection', NULL),
('s''il vous plaît', 'please (formal)', 'seel voo pleh', 'Un café, s''il vous plaît.', 'A coffee, please.', 'beginner', 'courtesy', 'interjection', NULL),
('s''il te plaît', 'please (informal)', 'seel tuh pleh', 'Aide-moi, s''il te plaît.', 'Help me, please.', 'beginner', 'courtesy', 'interjection', NULL),

-- Meeting people
('enchanté', 'pleased to meet you (male)', 'on-shon-tay', 'Enchanté de vous rencontrer.', 'Pleased to meet you.', 'beginner', 'introductions', 'adjective', NULL),
('enchantée', 'pleased to meet you (female)', 'on-shon-tay', 'Enchantée de faire votre connaissance.', 'Pleased to make your acquaintance.', 'beginner', 'introductions', 'adjective', NULL),

-- Essential être conjugations
('je suis', 'I am', 'zhuh swee', 'Je suis français.', 'I am French.', 'beginner', 'verbs', 'verb', NULL),
('tu es', 'you are (informal)', 'tuu eh', 'Tu es étudiant?', 'Are you a student?', 'beginner', 'verbs', 'verb', NULL),
('il est', 'he is', 'eel eh', 'Il est professeur.', 'He is a teacher.', 'beginner', 'verbs', 'verb', NULL),
('elle est', 'she is', 'ell eh', 'Elle est médecin.', 'She is a doctor.', 'beginner', 'verbs', 'verb', NULL),
('nous sommes', 'we are', 'noo som', 'Nous sommes amis.', 'We are friends.', 'beginner', 'verbs', 'verb', NULL),
('vous êtes', 'you are (formal/plural)', 'voo zet', 'Vous êtes le professeur.', 'You are the teacher.', 'beginner', 'verbs', 'verb', NULL),
('ils sont', 'they are (masculine)', 'eel son', 'Ils sont étudiants.', 'They are students.', 'beginner', 'verbs', 'verb', NULL),
('elles sont', 'they are (feminine)', 'ell son', 'Elles sont françaises.', 'They are French.', 'beginner', 'verbs', 'verb', NULL),

-- Question words and common adverbs
('comment', 'how', 'kom-mohn', 'Comment vous appelez-vous?', 'What is your name?', 'beginner', 'questions', 'adverb', NULL),
('où', 'where', 'oo', 'Où habitez-vous?', 'Where do you live?', 'beginner', 'questions', 'adverb', NULL),
('quand', 'when', 'kohn', 'Quand arrivez-vous?', 'When do you arrive?', 'beginner', 'questions', 'adverb', NULL),
('pourquoi', 'why', 'poor-kwah', 'Pourquoi partez-vous?', 'Why are you leaving?', 'beginner', 'questions', 'adverb', NULL),
('pardon', 'excuse me, pardon', 'par-don', 'Pardon, où est la gare?', 'Excuse me, where is the station?', 'beginner', 'courtesy', 'interjection', NULL),
('excusez-moi', 'excuse me (formal)', 'ex-ku-zay mwah', 'Excusez-moi, pouvez-vous m''aider?', 'Excuse me, can you help me?', 'beginner', 'courtesy', 'interjection', NULL),

-- Additional courtesy expressions
('de rien', 'you''re welcome', 'duh ree-ahn', 'De rien, c''est normal.', 'You''re welcome, it''s normal.', 'beginner', 'courtesy', 'interjection', NULL),
('je vous en prie', 'you''re welcome (formal)', 'zhuh voo zahn pree', 'Je vous en prie, monsieur.', 'You''re welcome, sir.', 'beginner', 'courtesy', 'interjection', NULL);

-- ==============================================
-- STEP 4: INSERT GRAMMAR RULES FROM MARKDOWN
-- ==============================================

INSERT INTO grammar_rules (title, explanation, examples, difficulty_level, category, order_index, created_at) VALUES
('Formal vs. Informal: vous and tu', 
 'The pronoun you choose shows respect and your relationship with the person. Use tu with friends, family, children, peers, and anyone who invites you to use it. Use vous with strangers, older people, authority figures (teachers, police), in professional settings, or when addressing a group. When in doubt, use vous - it is always safer and more polite.',
 '[{"french": "Comment vous appelez-vous?", "english": "What is your name? (formal)"}, {"french": "Comment t''appelles-tu?", "english": "What is your name? (informal)"}, {"french": "Vous êtes le professeur", "english": "You are the teacher"}, {"french": "Tu es mon ami", "english": "You are my friend"}]',
 'beginner', 'pronouns', 1, NOW()),

('The Verb être (to be) - Present Tense',
 'Être is the most important verb in French, meaning "to be". It is irregular and must be memorized. Use it to describe identity, profession, nationality, characteristics, and location with certain expressions.',
 '[{"french": "Je suis professeur", "english": "I am a teacher"}, {"french": "Tu es français?", "english": "Are you French?"}, {"french": "Il est grand", "english": "He is tall"}, {"french": "Nous sommes amis", "english": "We are friends"}, {"french": "Vous êtes médecins", "english": "You are doctors"}, {"french": "Elles sont intelligentes", "english": "They are intelligent"}]',
 'beginner', 'verbs', 2, NOW()),

('French Greeting Customs',
 'French greetings vary by time of day and relationship. Use bonjour until evening (around 6 PM), then bonsoir. Salut is informal for both hello and goodbye among friends. Always greet before asking questions or making requests.',
 '[{"french": "Bonjour madame", "english": "Good morning/day, ma''am"}, {"french": "Bonsoir monsieur", "english": "Good evening, sir"}, {"french": "Salut les amis!", "english": "Hi friends!"}, {"french": "Au revoir et bonne nuit", "english": "Goodbye and good night"}]',
 'beginner', 'culture', 3, NOW()),

('Question Formation with Comment',
 'Comment means "how" and is used to ask about methods, ways, or to request information. Common phrases include "Comment allez-vous?" (formal) and "Comment ça va?" (informal).',
 '[{"french": "Comment allez-vous?", "english": "How are you? (formal)"}, {"french": "Comment ça va?", "english": "How are you? (informal)"}, {"french": "Comment vous appelez-vous?", "english": "What is your name?"}, {"french": "Comment dit-on...?", "english": "How do you say...?"}]',
 'beginner', 'questions', 4, NOW());

-- ==============================================
-- STEP 5: INSERT LESSONS FROM MARKDOWN
-- ==============================================

INSERT INTO lessons (module_id, title, description, content, difficulty_level, order_index, created_at) VALUES
-- Module I lessons
(1, 'Formal vs Informal Greetings', 
 'Learn when to use formal vous vs informal tu, and master appropriate greetings for different social situations.',
 '{"introduction": "Understanding formal and informal address in French", "key_concepts": ["vous vs tu usage", "formal greetings", "informal greetings"], "social_contexts": ["meeting strangers", "talking to friends", "professional settings", "family situations"], "practice_scenarios": ["greeting your teacher", "meeting a friend", "entering a shop", "talking to elderly people"]}',
 'beginner', 1, NOW()),

(1, 'Essential Greetings & Times of Day', 
 'Master basic French greetings for different times of day and learn proper French greeting etiquette.',
 '{"introduction": "French greetings change with time of day", "greetings": ["bonjour (morning/afternoon)", "bonsoir (evening)", "bonne nuit (goodnight)", "salut (informal hi/bye)"], "timing": ["bonjour: until ~6 PM", "bonsoir: after ~6 PM", "bonne nuit: when going to bed"], "etiquette": ["always greet before asking questions", "acknowledge people when entering spaces", "use appropriate formality level"]}',
 'beginner', 2, NOW()),

(1, 'Introduction Expressions', 
 'Learn how to introduce yourself and others, including basic courtesy expressions for meeting new people.',
 '{"introduction": "Making introductions in French", "key_phrases": ["Comment vous appelez-vous?", "Je m''appelle...", "Enchanté(e)", "Comment allez-vous?"], "responses": ["Ça va bien, merci", "Très bien, et vous?", "Enchanté(e) de vous rencontrer"], "cultural_notes": ["shake hands when meeting", "use proper titles (Monsieur/Madame)", "maintain appropriate formality"]}',
 'beginner', 3, NOW()),

(2, 'The Verb être (to be)', 
 'Master the complete conjugation of être, the most important French verb, with practical examples and usage.',
 '{"introduction": "être is the foundation of French grammar", "conjugation": {"je": "suis", "tu": "es", "il/elle": "est", "nous": "sommes", "vous": "êtes", "ils/elles": "sont"}, "uses": ["identity", "profession", "nationality", "characteristics", "location (with certain expressions)"], "examples": ["Je suis étudiant", "Elle est française", "Nous sommes amis", "Vous êtes professeur"]}',
 'beginner', 4, NOW()),

(4, 'Courtesy Expressions', 
 'Essential polite expressions and courtesy phrases for everyday interactions.',
 '{"introduction": "Fundamental politeness in French culture", "expressions": ["merci/merci beaucoup", "s''il vous plaît/s''il te plaît", "pardon/excusez-moi", "de rien/je vous en prie"], "cultural_importance": ["Politeness is crucial in French culture", "Always say please and thank you", "Acknowledge people when entering spaces"], "usage_contexts": ["shopping", "restaurants", "asking for help", "apologizing"]}',
 'beginner', 5, NOW());

-- ==============================================
-- STEP 6: INSERT PRONUNCIATION WORDS
-- ==============================================

INSERT INTO pronunciation_words (word, phonetic, audio_url, difficulty_level, category, created_at) VALUES
-- Basic greetings with pronunciation
('bonjour', 'bon-zhoor', NULL, 'beginner', 'greetings', NOW()),
('bonsoir', 'bon-swahr', NULL, 'beginner', 'greetings', NOW()),
('salut', 'sa-loot', NULL, 'beginner', 'greetings', NOW()),
('au revoir', 'oh ruh-vwahr', NULL, 'beginner', 'greetings', NOW()),

-- Courtesy expressions with pronunciation
('merci', 'mer-see', NULL, 'beginner', 'courtesy', NOW()),
('s''il vous plaît', 'seel voo pleh', NULL, 'beginner', 'courtesy', NOW()),
('excusez-moi', 'ex-ku-zay mwah', NULL, 'beginner', 'courtesy', NOW()),

-- Introduction expressions with pronunciation
('enchanté', 'on-shon-tay', NULL, 'beginner', 'introductions', NOW()),
('comment', 'kom-mohn', NULL, 'beginner', 'questions', NOW()),

-- Être conjugations with pronunciation
('je suis', 'zhuh swee', NULL, 'beginner', 'verbs', NOW()),
('vous êtes', 'voo zet', NULL, 'beginner', 'verbs', NOW()),
('nous sommes', 'noo som', NULL, 'beginner', 'verbs', NOW()),

-- People and titles with pronunciation
('monsieur', 'muh-syur', NULL, 'beginner', 'titles', NOW()),
('madame', 'ma-dam', NULL, 'beginner', 'titles', NOW()),
('mademoiselle', 'mad-mwa-zel', NULL, 'beginner', 'titles', NOW());

-- ==============================================
-- STEP 7: INSERT QUESTIONS FOR LESSONS
-- ==============================================

INSERT INTO questions (lesson_id, question_text, question_type, options, correct_answer, explanation, points, difficulty_level, order_index, created_at) VALUES
-- Lesson 1: Formal vs Informal questions (assuming lesson_id=1)
(1, 'When should you use "vous" instead of "tu"?', 'multiple_choice', 
 '["With close friends only", "With strangers or in formal situations", "Only with children", "Never, always use tu"]',
 'With strangers or in formal situations', 
 'Vous is used for formal situations, with strangers, older people, authority figures, and in professional settings. When in doubt, always use vous.', 
 10, 'beginner', 1, NOW()),

(1, 'Complete the formal question: "Comment ___ appelez-vous?"', 'fill_blank', 
 '["vous", "tu", "il", "elle"]',
 'vous', 
 'In formal situations, use "vous" - so the complete question is "Comment vous appelez-vous?" meaning "What is your name?"', 
 10, 'beginner', 2, NOW()),

(1, 'Which greeting is appropriate for evening?', 'multiple_choice',
 '["Bonjour", "Bonsoir", "Bonne nuit", "Salut"]',
 'Bonsoir',
 'Bonsoir is used for evening greetings (after about 6 PM). Bonne nuit is only for saying goodnight when going to bed.',
 10, 'beginner', 3, NOW()),

-- Lesson 2: Greetings questions
(2, 'What time of day do you stop saying "bonjour" and start saying "bonsoir"?', 'multiple_choice',
 '["12 PM (noon)", "3 PM", "6 PM", "9 PM"]',
 '6 PM',
 'Generally, you switch from bonjour to bonsoir around 6 PM in the evening.',
 10, 'beginner', 1, NOW()),

(2, 'Which is the informal way to say both "hi" and "bye"?', 'multiple_choice',
 '["Bonjour", "Bonsoir", "Salut", "Au revoir"]',
 'Salut',
 'Salut is an informal greeting that can mean both "hi" and "bye" - used with friends, family, and peers.',
 10, 'beginner', 2, NOW()),

-- Lesson 4: être verb questions  
(4, 'Complete: "Je ___ français."', 'fill_blank',
 '["suis", "es", "est", "êtes"]',
 'suis',
 'With "je" (I), you use "suis" - so "Je suis français" means "I am French".',
 10, 'beginner', 1, NOW()),

(4, 'What is the correct form: "Vous ___ professeur."', 'fill_blank',
 '["suis", "es", "est", "êtes"]',
 'êtes',
 'With "vous", you use "êtes" - so "Vous êtes professeur" means "You are a teacher".',
 10, 'beginner', 2, NOW()),

(4, 'Translate: "They are students" (masculine)', 'fill_blank',
 '["Ils sont étudiants", "Elles sont étudiantes", "Nous sommes étudiants", "Vous êtes étudiants"]',
 'Ils sont étudiants',
 'For "they" masculine, use "ils sont" - so "Ils sont étudiants" means "They are students".',
 15, 'beginner', 3, NOW()),

-- Lesson 5: Courtesy expressions questions
(5, 'How do you say "please" formally?', 'multiple_choice',
 '["S''il te plaît", "S''il vous plaît", "Merci", "De rien"]',
 'S''il vous plaît',
 'S''il vous plaît is the formal way to say please. S''il te plaît is informal.',
 10, 'beginner', 1, NOW()),

(5, 'What is the formal response to "merci"?', 'multiple_choice',
 '["De rien", "Je vous en prie", "S''il vous plaît", "Pardon"]',
 'Je vous en prie',
 'Je vous en prie is the formal way to say "you''re welcome". De rien is more casual.',
 10, 'beginner', 2, NOW());

-- ==============================================
-- STEP 8: LINK VOCABULARY TO LESSONS
-- ==============================================

-- Link vocabulary to lessons (assuming vocabulary IDs 1-37 and lesson IDs 1-5)
INSERT INTO lesson_vocabulary (lesson_id, vocabulary_id) VALUES
-- Lesson 1: Formal vs Informal (link formal/informal pronouns and basic greetings)
(1, 8), (1, 9), -- vous, tu
(1, 1), (1, 2), (1, 3), -- bonjour, salut, bonsoir
(1, 18), (1, 19), (1, 20), -- monsieur, madame, mademoiselle

-- Lesson 2: Essential Greetings (link greeting vocabulary)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), -- all greetings

-- Lesson 3: Introductions (link introduction-related vocabulary)
(3, 26), (3, 27), -- enchanté, enchantée
(3, 33), -- comment
(3, 23), (3, 24), (3, 25), -- merci, s'il vous plaît, s'il te plaît

-- Lesson 4: être verb (link all être conjugations)
(4, 28), (4, 29), (4, 30), (4, 31), (4, 32), (4, 33), (4, 34), (4, 35), -- être conjugations

-- Lesson 5: Courtesy expressions (link courtesy vocabulary)
(5, 23), (5, 24), (5, 25), -- merci, s'il vous plaît, s'il te plaît
(5, 37), (5, 38), -- pardon, excusez-moi
(5, 39), (5, 40); -- de rien, je vous en prie

-- ==============================================
-- STEP 9: LINK GRAMMAR RULES TO LESSONS
-- ==============================================

INSERT INTO lesson_grammar_rules (lesson_id, grammar_rule_id) VALUES
-- Link grammar rules to appropriate lessons
(1, 1), -- Formal vs Informal rule to lesson 1
(2, 3), -- Greeting customs to lesson 2  
(3, 4), -- Question formation to lesson 3
(4, 2), -- être verb rule to lesson 4
(5, 3); -- Greeting customs also relevant to courtesy lesson

-- ==============================================
-- FINAL VERIFICATION
-- ==============================================

SELECT 'SUCCESS: All content uploaded successfully!' as status;
SELECT COUNT(*) as modules_count FROM modules;
SELECT COUNT(*) as vocabulary_count FROM vocabulary;
SELECT COUNT(*) as grammar_rules_count FROM grammar_rules;
SELECT COUNT(*) as lessons_count FROM lessons;
SELECT COUNT(*) as questions_count FROM questions;
SELECT COUNT(*) as pronunciation_words_count FROM pronunciation_words;
SELECT '📚 Content includes: Greetings, Formal/Informal usage, Introductions, Être verb, and Courtesy expressions' as content_summary;
