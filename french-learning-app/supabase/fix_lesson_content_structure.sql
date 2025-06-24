-- Fix lesson content structure to match LessonContent interface
-- This script converts the old JSON format to the new sections-based format

-- UPDATE existing lessons to use proper section structure
UPDATE lessons SET content = 
CASE 
  WHEN module_id = 1 AND title = 'Dire Bonjour' THEN
    '{
      "introduction": "Learn how to greet people in French",
      "sections": [
        {
          "id": "vocab-greetings",
          "type": "vocabulary",
          "title": "Basic Greetings",
          "content": {
            "explanation": "These are the most common greetings in French",
            "words": [
              {"french": "Bonjour", "english": "Hello/Good morning", "pronunciation": "bon-ZHOOR"},
              {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"},
              {"french": "Salut", "english": "Hi/Bye (informal)", "pronunciation": "sah-LUU"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 1 AND title = 'Politesse de Base' THEN
    '{
      "introduction": "Learn essential polite expressions",
      "sections": [
        {
          "id": "vocab-politeness",
          "type": "vocabulary",
          "title": "Polite Expressions",
          "content": {
            "explanation": "These expressions show good manners in French",
            "words": [
              {"french": "Merci", "english": "Thank you", "pronunciation": "mer-SEE"},
              {"french": "Au revoir", "english": "Goodbye", "pronunciation": "oh ruh-VWAHR"},
              {"french": "S''il vous plaît", "english": "Please", "pronunciation": "seel voo PLAY"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 2 AND title = 'Je me présente' THEN
    '{
      "introduction": "Learn to introduce yourself in French",
      "sections": [
        {
          "id": "grammar-pronouns",
          "type": "grammar",
          "title": "Personal Pronouns",
          "content": {
            "explanation": "Personal pronouns are essential for introducing yourself",
            "pronouns": [
              {"french": "Je", "english": "I", "example": "Je suis étudiant"},
              {"french": "Tu", "english": "You (informal)", "example": "Tu es français?"},
              {"french": "Il", "english": "He", "example": "Il s''appelle Pierre"},
              {"french": "Elle", "english": "She", "example": "Elle est professeure"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 3 AND title = 'Les Nombres 1-5' THEN
    '{
      "introduction": "Learn your first French numbers",
      "sections": [
        {
          "id": "vocab-numbers",
          "type": "vocabulary",
          "title": "Numbers 1-5",
          "content": {
            "explanation": "Master the first five numbers in French",
            "numbers": [
              {"french": "Un", "english": "One", "pronunciation": "uhn"},
              {"french": "Deux", "english": "Two", "pronunciation": "duh"},
              {"french": "Trois", "english": "Three", "pronunciation": "twah"},
              {"french": "Quatre", "english": "Four", "pronunciation": "KAH-truh"},
              {"french": "Cinq", "english": "Five", "pronunciation": "sank"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 4 AND title = 'Couleurs de Base' THEN
    '{
      "introduction": "Learn essential colors",
      "sections": [
        {
          "id": "vocab-colors",
          "type": "vocabulary",
          "title": "Basic Colors",
          "content": {
            "explanation": "These are the most important colors to know",
            "colors": [
              {"french": "Rouge", "english": "Red", "pronunciation": "roozh"},
              {"french": "Bleu", "english": "Blue", "pronunciation": "bluh"},
              {"french": "Vert", "english": "Green", "pronunciation": "vair"},
              {"french": "Jaune", "english": "Yellow", "pronunciation": "zhohn"},
              {"french": "Noir", "english": "Black", "pronunciation": "nwahr"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 6 AND title = 'Les Repas' THEN
    '{
      "introduction": "Learn about French food culture",
      "sections": [
        {
          "id": "vocab-food",
          "type": "vocabulary",
          "title": "Basic Food Items",
          "content": {
            "explanation": "Essential food vocabulary for everyday conversations",
            "foods": [
              {"french": "Pain", "english": "Bread", "pronunciation": "pan"},
              {"french": "Eau", "english": "Water", "pronunciation": "oh"},
              {"french": "Café", "english": "Coffee", "pronunciation": "kah-FAY"},
              {"french": "Fromage", "english": "Cheese", "pronunciation": "froh-MAHZH"},
              {"french": "Vin", "english": "Wine", "pronunciation": "van"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  WHEN module_id = 11 AND title = 'À l''Aéroport' THEN
    '{
      "introduction": "Essential travel vocabulary",
      "sections": [
        {
          "id": "vocab-travel",
          "type": "vocabulary",
          "title": "Travel Vocabulary",
          "content": {
            "explanation": "Important words for traveling in French-speaking countries",
            "travel_words": [
              {"french": "Avion", "english": "Airplane", "pronunciation": "ah-vee-OHN"},
              {"french": "Train", "english": "Train", "pronunciation": "tran"},
              {"french": "Hôtel", "english": "Hotel", "pronunciation": "oh-TELL"},
              {"french": "Voyage", "english": "Trip/Journey", "pronunciation": "voy-AHZH"},
              {"french": "Passeport", "english": "Passport", "pronunciation": "pahs-por"}
            ]
          },
          "order_index": 1,
          "is_required": true
        }
      ]
    }'::jsonb
  ELSE content -- Keep existing content if no specific update
END
WHERE is_active = true;
