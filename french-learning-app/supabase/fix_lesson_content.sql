-- Fix lesson content structure to match expected format
-- This script updates all lessons to have proper sections structure

-- Update Lesson 1: Dire Bonjour
UPDATE lessons SET content = '{
  "introduction": "Learn how to greet people in French with essential greeting expressions.",
  "sections": [
    {
      "id": "greeting-vocabulary",
      "type": "vocabulary",
      "title": "Essential Greetings",
      "content": {
        "words": [
          {"french": "Bonjour", "english": "Hello/Good morning", "pronunciation": "bon-ZHOOR"},
          {"french": "Bonsoir", "english": "Good evening", "pronunciation": "bon-SWAHR"},
          {"french": "Salut", "english": "Hi/Bye (informal)", "pronunciation": "sah-LUU"}
        ],
        "explanation": "These are the most common French greetings used in daily conversations."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "greeting-practice",
      "type": "text",
      "title": "Practice Time",
      "content": "Now that you know the basic greetings, try using them in different contexts. Remember: Bonjour is formal and used during the day, Bonsoir is formal for evening, and Salut is informal and can be used anytime with friends.",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 1;

-- Update Lesson 2: Politesse de Base
UPDATE lessons SET content = '{
  "introduction": "Learn essential polite expressions to be courteous in French.",
  "sections": [
    {
      "id": "polite-expressions",
      "type": "vocabulary",
      "title": "Polite Expressions",
      "content": {
        "words": [
          {"french": "Merci", "english": "Thank you", "pronunciation": "mer-SEE"},
          {"french": "Au revoir", "english": "Goodbye", "pronunciation": "oh ruh-VWAHR"}
        ],
        "explanation": "These expressions show politeness and respect in French culture."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "cultural-note",
      "type": "text",
      "title": "Cultural Note",
      "content": "In French culture, politeness is highly valued. Always say Merci when someone helps you or gives you something, and Au revoir when leaving. These simple expressions will make a great impression!",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 2;

-- Update Lesson 3: Je me présente
UPDATE lessons SET content = '{
  "introduction": "Learn to introduce yourself in French using personal pronouns.",
  "sections": [
    {
      "id": "personal-pronouns",
      "type": "grammar",
      "title": "Personal Pronouns",
      "content": {
        "pronouns": [
          {"french": "Je", "english": "I", "pronunciation": "zhuh", "example": "Je suis étudiant"},
          {"french": "Tu", "english": "You (informal)", "pronunciation": "tuu", "example": "Tu es français?"},
          {"french": "Il", "english": "He", "pronunciation": "eel", "example": "Il s''appelle Pierre"},
          {"french": "Elle", "english": "She", "pronunciation": "ell", "example": "Elle est professeur"}
        ],
        "explanation": "Personal pronouns are essential for introducing yourself and talking about others."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "introduction-practice",
      "type": "text",
      "title": "Introduction Examples",
      "content": "Try these common introductions: ''Je suis [your name]'' (I am [your name]), ''Je viens de [your country]'' (I come from [your country]), ''Je parle anglais'' (I speak English). Practice makes perfect!",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 3;

-- Update Lesson 4: Les Nombres 1-5
UPDATE lessons SET content = '{
  "introduction": "Learn your first French numbers from one to five.",
  "sections": [
    {
      "id": "numbers-1-5",
      "type": "vocabulary",
      "title": "Numbers 1-5",
      "content": {
        "numbers": [
          {"french": "Un", "english": "One", "pronunciation": "uhn", "example": "J''ai un chat"},
          {"french": "Deux", "english": "Two", "pronunciation": "duh", "example": "Il a deux frères"},
          {"french": "Trois", "english": "Three", "pronunciation": "twah", "example": "Nous avons trois enfants"},
          {"french": "Quatre", "english": "Four", "pronunciation": "kat-ruh", "example": "La table a quatre chaises"},
          {"french": "Cinq", "english": "Five", "pronunciation": "sank", "example": "Elle a cinq livres"}
        ],
        "explanation": "These basic numbers are used constantly in French. Master them first!"
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "counting-practice",
      "type": "text",
      "title": "Counting Practice",
      "content": "Practice counting from 1 to 5: Un, Deux, Trois, Quatre, Cinq. Try counting objects around you in French. Remember, numbers are the foundation for shopping, telling time, and many daily activities.",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 4;

-- Update Lesson 5: Couleurs de Base
UPDATE lessons SET content = '{
  "introduction": "Learn essential colors in French to describe the world around you.",
  "sections": [
    {
      "id": "basic-colors",
      "type": "vocabulary",
      "title": "Basic Colors",
      "content": {
        "colors": [
          {"french": "Rouge", "english": "Red", "pronunciation": "roozh", "example": "La pomme est rouge"},
          {"french": "Bleu", "english": "Blue", "pronunciation": "bluh", "example": "Le ciel est bleu"},
          {"french": "Vert", "english": "Green", "pronunciation": "vehr", "example": "L''herbe est verte"},
          {"french": "Jaune", "english": "Yellow", "pronunciation": "zhohn", "example": "Le soleil est jaune"},
          {"french": "Noir", "english": "Black", "pronunciation": "nwahr", "example": "Le chat est noir"}
        ],
        "explanation": "Colors are adjectives in French and help you describe everything you see."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "color-usage",
      "type": "text",
      "title": "Using Colors",
      "content": "Colors in French often change form based on gender (masculine/feminine) and number (singular/plural). For now, focus on learning the basic forms. You''ll use these colors to describe clothes, objects, nature, and more!",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 5;

-- Update Lesson 6: Les Repas
UPDATE lessons SET content = '{
  "introduction": "Learn about French food culture and essential food vocabulary.",
  "sections": [
    {
      "id": "food-basics",
      "type": "vocabulary",
      "title": "Food Basics",
      "content": {
        "foods": [
          {"french": "Pain", "english": "Bread", "pronunciation": "pan", "example": "Le pain est frais"},
          {"french": "Eau", "english": "Water", "pronunciation": "oh", "example": "L''eau est froide"},
          {"french": "Café", "english": "Coffee", "pronunciation": "kah-fay", "example": "Le café est chaud"},
          {"french": "Fromage", "english": "Cheese", "pronunciation": "froh-mahzh", "example": "Le fromage est délicieux"},
          {"french": "Vin", "english": "Wine", "pronunciation": "van", "example": "Le vin est rouge"}
        ],
        "explanation": "These are staples of French cuisine and culture."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "french-food-culture",
      "type": "text",
      "title": "French Food Culture",
      "content": "Food is central to French culture. Bread (pain) is eaten with almost every meal, cheese (fromage) is often served before dessert, and wine (vin) accompanies many dinners. Coffee (café) is typically enjoyed after meals, not during them!",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 6;

-- Update Lesson 7: À l'Aéroport
UPDATE lessons SET content = '{
  "introduction": "Essential travel vocabulary for navigating airports and transportation.",
  "sections": [
    {
      "id": "travel-vocabulary",
      "type": "vocabulary",
      "title": "Travel Vocabulary",
      "content": {
        "travel_words": [
          {"french": "Avion", "english": "Airplane", "pronunciation": "ah-vee-ohn", "example": "L''avion décolle"},
          {"french": "Train", "english": "Train", "pronunciation": "tran", "example": "Le train arrive"},
          {"french": "Hôtel", "english": "Hotel", "pronunciation": "oh-tel", "example": "L''hôtel est complet"},
          {"french": "Voyage", "english": "Trip", "pronunciation": "voh-yahzh", "example": "Le voyage est long"},
          {"french": "Passeport", "english": "Passport", "pronunciation": "pass-por", "example": "Mon passeport expire"}
        ],
        "explanation": "These words are essential for any traveler visiting French-speaking regions."
      },
      "order_index": 0,
      "is_required": true
    },
    {
      "id": "travel-tips",
      "type": "text",
      "title": "Travel Tips",
      "content": "When traveling to France, always have your passeport ready. You can travel by avion (plane) or train between cities. Book your hôtel in advance, especially during peak season. Bon voyage (have a good trip)!",
      "order_index": 1,
      "is_required": true
    }
  ]
}' WHERE id = 7;
