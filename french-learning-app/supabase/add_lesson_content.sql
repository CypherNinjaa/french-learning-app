-- Create lessons with proper content sections for the French Learning App
-- This script adds lessons with structured content that the frontend can display

-- First, let's add lessons to the first module (Les Salutations)
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
(1, 'Dire Bonjour', '{
  "introduction": "Learn how to greet people in French - the foundation of any conversation!",
  "sections": [
    {
      "id": "introduction",
      "type": "text",
      "title": "Introduction to Greetings",
      "content": "In French culture, greetings are very important. The way you greet someone shows respect and sets the tone for your interaction.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "vocabulary",
      "type": "vocabulary",
      "title": "Basic Greetings",
      "content": {
        "words": [
          {"french": "Bonjour", "english": "Hello/Good morning", "pronunciation": "bon-ZHOOR"},
          {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"},
          {"french": "Salut", "english": "Hi/Bye (informal)", "pronunciation": "sah-LUU"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "practice",
      "type": "practice",
      "title": "Practice Greetings",
      "content": "Now try to use these greetings in different situations. Remember: Bonjour is formal, Salut is informal.",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "You have learned the basic French greetings. Practice using Bonjour for formal situations and Salut for friends!"
}', 'vocabulary', 1, 'beginner', 10),

(1, 'Politesse de Base', '{
  "introduction": "Learn essential polite expressions that every French conversation needs.",
  "sections": [
    {
      "id": "politeness-intro",
      "type": "text", 
      "title": "Why Politeness Matters",
      "content": "French people highly value politeness. Using expressions like \"s''il vous plaît\" and \"merci\" will make a great impression.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "polite-expressions",
      "type": "vocabulary",
      "title": "Essential Polite Expressions",
      "content": {
        "words": [
          {"french": "S''il vous plaît", "english": "Please (formal)", "pronunciation": "see voo PLAY"},
          {"french": "Merci", "english": "Thank you", "pronunciation": "mer-SEE"},
          {"french": "De rien", "english": "You''re welcome", "pronunciation": "duh ree-AHN"},
          {"french": "Excusez-moi", "english": "Excuse me", "pronunciation": "ek-skuu-zay MWAH"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "conversation-practice",
      "type": "conversation",
      "title": "Polite Conversation",
      "content": "Practice a polite conversation: \"Bonjour! Comment allez-vous?\" \"Très bien, merci!\"",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "Politeness is key in French culture. You now know how to be polite and respectful!"
}', 'conversation', 2, 'beginner', 15);

-- Add lessons to the second module (Se Présenter)
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
(2, 'Je me présente', '{
  "introduction": "Learn how to introduce yourself in French - your name, age, and where you''re from.",
  "sections": [
    {
      "id": "introduction-basics",
      "type": "text",
      "title": "Introducing Yourself",
      "content": "Self-introduction is essential when meeting new people. In French, there are formal and informal ways to introduce yourself.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "basic-introductions",
      "type": "vocabulary",
      "title": "Introduction Phrases",
      "content": {
        "words": [
          {"french": "Je m''appelle", "english": "My name is", "pronunciation": "zhuh mah-PELL"},
          {"french": "Je suis", "english": "I am", "pronunciation": "zhuh swee"},
          {"french": "J''ai ... ans", "english": "I am ... years old", "pronunciation": "zhay ... ahn"},
          {"french": "Je viens de", "english": "I come from", "pronunciation": "zhuh vee-AHN duh"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "personal-info",
      "type": "practice",
      "title": "Share Personal Information",
      "content": "Practice introducing yourself: \"Bonjour, je m''appelle [Your Name]. Je suis de [Your City].\"",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "Great! You can now introduce yourself in French and share basic personal information."
}', 'vocabulary', 1, 'beginner', 12);

-- Add lessons to the third module (Les Chiffres)
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
(3, 'Les Nombres 1-10', '{
  "introduction": "Master the French numbers from 1 to 10 - essential for shopping, telling time, and daily conversations.",
  "sections": [
    {
      "id": "numbers-importance",
      "type": "text",
      "title": "Why Numbers Are Important",
      "content": "Numbers are everywhere! You''ll need them for shopping, telling time, giving your age, and much more.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "numbers-1-10",
      "type": "vocabulary",
      "title": "Numbers 1-10",
      "content": {
        "words": [
          {"french": "Un", "english": "One", "pronunciation": "uhn"},
          {"french": "Deux", "english": "Two", "pronunciation": "duh"},
          {"french": "Trois", "english": "Three", "pronunciation": "twah"},
          {"french": "Quatre", "english": "Four", "pronunciation": "kat-ruh"},
          {"french": "Cinq", "english": "Five", "pronunciation": "sank"},
          {"french": "Six", "english": "Six", "pronunciation": "sees"},
          {"french": "Sept", "english": "Seven", "pronunciation": "set"},
          {"french": "Huit", "english": "Eight", "pronunciation": "weet"},
          {"french": "Neuf", "english": "Nine", "pronunciation": "nuhf"},
          {"french": "Dix", "english": "Ten", "pronunciation": "dees"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "numbers-practice",
      "type": "practice",
      "title": "Count and Practice",
      "content": "Practice counting from 1 to 10. Try saying your age in French: \"J''ai [number] ans.\"",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "Excellent! You can now count to 10 in French and use numbers in basic conversations."
}', 'vocabulary', 1, 'beginner', 10);

-- Add a lesson to the fourth module (Les Couleurs)
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
(4, 'Les Couleurs Principales', '{
  "introduction": "Discover the main colors in French and learn how to describe things around you.",
  "sections": [
    {
      "id": "colors-intro",
      "type": "text",
      "title": "Colors in French",
      "content": "Colors help us describe the world around us. In French, colors often change form depending on what they''re describing.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "basic-colors",
      "type": "vocabulary",
      "title": "Main Colors",
      "content": {
        "words": [
          {"french": "Rouge", "english": "Red", "pronunciation": "roozh"},
          {"french": "Bleu", "english": "Blue", "pronunciation": "bluh"},
          {"french": "Vert", "english": "Green", "pronunciation": "vehr"},
          {"french": "Jaune", "english": "Yellow", "pronunciation": "zhohn"},
          {"french": "Noir", "english": "Black", "pronunciation": "nwahr"},
          {"french": "Blanc", "english": "White", "pronunciation": "blahn"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "describing-objects",
      "type": "practice",
      "title": "Describe with Colors",
      "content": "Practice describing objects: \"La pomme est rouge\" (The apple is red), \"Le ciel est bleu\" (The sky is blue).",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "Perfect! You can now name colors in French and use them to describe objects."
}', 'vocabulary', 1, 'beginner', 8);

-- Add a lesson to the fifth module (La Famille)
INSERT INTO lessons (module_id, title, content, lesson_type, order_index, difficulty_level, estimated_time_minutes) VALUES
(5, 'Ma Famille', '{
  "introduction": "Learn to talk about your family members and relationships in French.",
  "sections": [
    {
      "id": "family-importance",
      "type": "text",
      "title": "Family in French Culture",
      "content": "Family is very important in French culture. Learning family vocabulary helps you share personal stories and connect with others.",
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "family-members",
      "type": "vocabulary",
      "title": "Family Members",
      "content": {
        "words": [
          {"french": "Famille", "english": "Family", "pronunciation": "fah-mee"},
          {"french": "Père", "english": "Father", "pronunciation": "pehr"},
          {"french": "Mère", "english": "Mother", "pronunciation": "mehr"},
          {"french": "Frère", "english": "Brother", "pronunciation": "frehr"},
          {"french": "Sœur", "english": "Sister", "pronunciation": "suhr"},
          {"french": "Enfant", "english": "Child", "pronunciation": "ahn-fahn"}
        ]
      },
      "order_index": 1,
      "is_required": true
    },
    {
      "id": "talking-about-family",
      "type": "conversation",
      "title": "Describe Your Family",
      "content": "Practice talking about your family: \"J''ai un frère et une sœur\" (I have a brother and a sister).",
      "order_index": 2,
      "is_required": true
    }
  ],
  "summary": "Wonderful! You can now talk about your family and ask others about theirs."
}', 'vocabulary', 1, 'beginner', 12);
