-- SQL to execute in Supabase to fix lesson content structure
-- Copy and paste this entire code into Supabase SQL Editor

-- First, let's check what lessons exist
SELECT id, module_id, title, content FROM lessons WHERE is_active = true ORDER BY module_id, order_index;

-- Now update the lesson content structure to match the expected format
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
  -- For any lessons that don't match the specific cases above, create a generic structure
  ELSE 
    CASE 
      WHEN content IS NULL OR content = '{}' OR content = '' THEN
        '{
          "introduction": "' || title || '",
          "sections": [
            {
              "id": "section-1",
              "type": "text",
              "title": "' || title || '",
              "content": {
                "text": "Content for this lesson will be added soon."
              },
              "order_index": 1,
              "is_required": true
            }
          ]
        }'::jsonb
      ELSE
        -- Try to preserve existing content but wrap it in proper structure
        jsonb_build_object(
          'introduction', COALESCE(content->>'introduction', title),
          'sections', 
          CASE 
            -- If it already has sections, keep them
            WHEN content ? 'sections' THEN content->'sections'
            -- Otherwise create a section from the existing content
            ELSE '[{
              "id": "section-1",
              "type": "text",
              "title": "' || title || '",
              "content": ' || content::text || ',
              "order_index": 1,
              "is_required": true
            }]'::jsonb
          END
        )
    END
END
WHERE is_active = true;

-- Verify the update worked
SELECT id, module_id, title, 
       jsonb_pretty(content) as formatted_content 
FROM lessons 
WHERE is_active = true 
ORDER BY module_id, order_index 
LIMIT 5;

-- Check that all lessons now have the sections array
SELECT 
  COUNT(*) as total_lessons,
  COUNT(CASE WHEN content ? 'sections' THEN 1 END) as lessons_with_sections,
  COUNT(CASE WHEN jsonb_array_length(content->'sections') > 0 THEN 1 END) as lessons_with_content
FROM lessons 
WHERE is_active = true;
