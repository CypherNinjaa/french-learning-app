-- Sample Book-Style Lesson Content for Testing
-- This script adds comprehensive book-style lessons for testing the new system

-- Insert sample book-style lesson content
INSERT INTO lessons (
    title, 
    module_id, 
    lesson_type, 
    order_index, 
    is_active, 
    difficulty_level, 
    estimated_duration, 
    points_reward,
    content
) VALUES 
(
    'French Greetings and Politeness',
    1, -- Assuming module 1 exists
    'vocabulary',
    1,
    true,
    'beginner',
    20,
    15,
    '{
        "introduction": "Welcome to your first comprehensive lesson on French greetings and polite expressions. In this chapter, you will discover the rich world of French social etiquette and learn how to make great first impressions.",
        "sections": [
            {
                "id": "greetings-basics",
                "title": "Essential Daily Greetings",
                "content": "French greetings are the cornerstone of polite conversation. Unlike English, French has specific greetings for different times of day and social contexts.\n\nThe word ''bonjour'' is perhaps the most important French word you will learn. It literally means ''good day'' and is used from morning until about 5 PM. After 5 PM, French speakers switch to ''bonsoir'' (good evening).\n\nWhat makes French greetings special is their cultural significance. In France, failing to greet someone properly can be considered rude, especially in shops, elevators, or when meeting someone for the first time.",
                "examples": [
                    {
                        "french": "Bonjour",
                        "english": "Hello / Good day",
                        "pronunciation": "bon-ZHOOR",
                        "context": "Use from morning until 5 PM"
                    },
                    {
                        "french": "Bonsoir", 
                        "english": "Good evening",
                        "pronunciation": "bon-SWAHR",
                        "context": "Use after 5 PM"
                    },
                    {
                        "french": "Bonne nuit",
                        "english": "Good night",
                        "pronunciation": "bun NWEE",
                        "context": "Only when going to bed or leaving late at night"
                    }
                ]
            },
            {
                "id": "formal-informal",
                "title": "Formal vs Informal Communication",
                "content": "One of the most important aspects of French culture is the distinction between formal (formal) and informal (familier) communication. This affects not only greetings but also the entire way you interact.\n\nWhen meeting someone for the first time, in professional settings, with older people, or in customer service situations, always use formal greetings. This shows respect and cultural awareness.\n\nInformal greetings are reserved for friends, family, people your age, and casual social situations among peers.",
                "examples": [
                    {
                        "french": "Bonjour Monsieur Dupont",
                        "english": "Hello Mr. Dupont", 
                        "pronunciation": "bon-ZHOOR muh-SYUR du-PON",
                        "context": "Formal greeting with title and surname"
                    },
                    {
                        "french": "Salut Pierre!",
                        "english": "Hi Pierre!",
                        "pronunciation": "sah-LUU pee-YAIR",
                        "context": "Informal greeting with a friend"
                    },
                    {
                        "french": "Bonsoir Madame",
                        "english": "Good evening Madam",
                        "pronunciation": "bon-SWAHR mah-DAHM", 
                        "context": "Formal evening greeting"
                    }
                ]
            },
            {
                "id": "polite-expressions",
                "title": "Essential Polite Expressions",
                "content": "Beyond basic greetings, French culture places great emphasis on politeness markers. These small words and phrases can make the difference between sounding rude and sounding respectful.\n\n''S''il vous plaît'' (please) and ''merci'' (thank you) are essential, but French has many other courtesy expressions that native speakers use constantly. Learning these will make your French sound more natural and show cultural sensitivity.",
                "examples": [
                    {
                        "french": "S''il vous plaît",
                        "english": "Please (formal)",
                        "pronunciation": "seel voo PLAY",
                        "context": "Use in formal situations or with strangers"
                    },
                    {
                        "french": "S''il te plaît",
                        "english": "Please (informal)",
                        "pronunciation": "seel tuh PLAY",
                        "context": "Use with friends, family, children"
                    },
                    {
                        "french": "Excusez-moi",
                        "english": "Excuse me (formal)",
                        "pronunciation": "ek-skuu-zay MWAH",
                        "context": "To get attention or apologize formally"
                    },
                    {
                        "french": "Pardon",
                        "english": "Sorry / Excuse me",
                        "pronunciation": "par-DON",
                        "context": "Quick apology or when you didn''t hear something"
                    }
                ]
            }
        ],
        "summary": "Congratulations! You have learned the fundamental building blocks of French social interaction. You now know how to greet people appropriately throughout the day, distinguish between formal and informal situations, and use essential polite expressions. These skills will serve as your foundation for all future French conversations.",
        "examples": [
            {
                "french": "Bonjour Madame, comment allez-vous?",
                "english": "Hello Madam, how are you?",
                "pronunciation": "bon-ZHOOR mah-DAHM, koh-mahn tah-lay VOO"
            },
            {
                "french": "Salut! Ça va?",
                "english": "Hi! How''s it going?", 
                "pronunciation": "sah-LUU! sah VAH"
            }
        ]
    }'
),
(
    'French Numbers and Counting',
    1,
    'vocabulary', 
    2,
    true,
    'beginner',
    25,
    20,
    '{
        "introduction": "Numbers are everywhere in daily life - from telling time to shopping, from giving your phone number to discussing ages. This comprehensive lesson will take you through the French number system step by step.",
        "sections": [
            {
                "id": "numbers-1-20",
                "title": "Numbers 1-20: The Foundation",
                "content": "The numbers 1-20 in French must be memorized as they form the foundation for all other numbers. Unlike English, French numbers follow different patterns that you''ll need to master.\n\nPay special attention to the pronunciation of these numbers, as they appear constantly in everyday French. Notice how some numbers have silent letters or unusual pronunciations.",
                "examples": [
                    {
                        "french": "un, deux, trois",
                        "english": "one, two, three",
                        "pronunciation": "uhn, deuh, twah"
                    },
                    {
                        "french": "quatre, cinq, six",
                        "english": "four, five, six", 
                        "pronunciation": "KAH-truh, sank, sees"
                    },
                    {
                        "french": "sept, huit, neuf, dix",
                        "english": "seven, eight, nine, ten",
                        "pronunciation": "set, weet, neuf, dees"
                    }
                ]
            },
            {
                "id": "numbers-patterns",
                "title": "Number Patterns and Rules",
                "content": "French numbers follow specific patterns once you know the basics. Understanding these patterns will help you count to any number with confidence.\n\nFrom 21-69, French combines tens and units with ''et'' (and) for 21, 31, 41, 51, 61, but uses hyphens for other combinations. The system becomes more complex with 70s, 80s, and 90s, which have unique historical origins.",
                "examples": [
                    {
                        "french": "vingt-et-un",
                        "english": "twenty-one",
                        "pronunciation": "van-tay-UHN"
                    },
                    {
                        "french": "soixante-dix",
                        "english": "seventy (literally: sixty-ten)",
                        "pronunciation": "swah-sahnt-DEES"
                    },
                    {
                        "french": "quatre-vingt-dix-neuf",
                        "english": "ninety-nine (literally: four-twenty-ten-nine)",
                        "pronunciation": "kah-truh-van-dees-NEUF"
                    }
                ]
            }
        ],
        "summary": "You have mastered the essential French number system! You can now count confidently, understand the unique patterns French uses, and apply these numbers in practical situations like shopping, telling time, and giving personal information.",
        "examples": [
            {
                "french": "J''ai vingt-cinq ans",
                "english": "I am twenty-five years old",
                "pronunciation": "zhay van-sank AHN"
            },
            {
                "french": "Ça coûte quinze euros",
                "english": "That costs fifteen euros",
                "pronunciation": "sah koot kanz öh-ROH"
            }
        ]
    }'
),
(
    'Describing Yourself and Others',
    2, -- Different module
    'vocabulary',
    1,
    true,
    'intermediate',
    30,
    25,
    '{
        "introduction": "Personal descriptions are essential for meaningful conversations. In this lesson, you will learn to describe physical appearance, personality traits, and personal characteristics with confidence and cultural appropriateness.",
        "sections": [
            {
                "id": "physical-description",
                "title": "Physical Appearance",
                "content": "Describing physical appearance in French involves understanding gender agreement, appropriate vocabulary, and cultural sensitivity. French adjectives must agree with the gender and number of the person being described.\n\nWhen describing someone, French speakers often focus on distinctive features rather than providing exhaustive descriptions. The key is to be respectful and use appropriate register.",
                "examples": [
                    {
                        "french": "Elle est grande et brune",
                        "english": "She is tall and brunette",
                        "pronunciation": "el ay grahnd ay brün"
                    },
                    {
                        "french": "Il a les yeux bleus",
                        "english": "He has blue eyes",
                        "pronunciation": "eel ah lay zyeu bleu"
                    },
                    {
                        "french": "C''est une femme élégante",
                        "english": "She is an elegant woman",
                        "pronunciation": "say tün fahm ay-lay-gahnt"
                    }
                ]
            },
            {
                "id": "personality-traits",
                "title": "Personality and Character",
                "content": "Describing personality in French allows for rich, nuanced expression. French has many subtle ways to describe character traits, and choosing the right words shows sophistication in the language.\n\nPersonality adjectives in French often have more specific meanings than their English counterparts. Understanding these nuances will help you express yourself more precisely.",
                "examples": [
                    {
                        "french": "Il est très sympa et drôle",
                        "english": "He is very nice and funny",
                        "pronunciation": "eel ay tray sam-PAH ay droll"
                    },
                    {
                        "french": "Elle est intelligente mais timide",
                        "english": "She is intelligent but shy",
                        "pronunciation": "el ay an-tay-lee-zhahngt may tee-meed"
                    },
                    {
                        "french": "C''est quelqu''un de généreux",
                        "english": "He/She is someone generous",
                        "pronunciation": "say kel-kuhn duh zhay-nay-reuh"
                    }
                ]
            }
        ],
        "summary": "You now have the tools to describe people in French with accuracy and cultural appropriateness. You understand how adjective agreement works, can describe both physical and personality traits, and know how to be respectful in your descriptions.",
        "examples": [
            {
                "french": "Ma sœur est petite, blonde, et très énergique",
                "english": "My sister is short, blonde, and very energetic",
                "pronunciation": "mah seur ay puh-teet, blohnd, ay tray ay-ner-zheek"
            }
        ]
    }'
)
ON CONFLICT (id) DO NOTHING;

-- Update existing lessons to have book-style content
UPDATE lessons 
SET content = '{
    "introduction": "This lesson introduces you to fundamental French concepts with a structured, book-like approach to learning.",
    "sections": [
        {
            "id": "section-1",
            "title": "Core Concepts",
            "content": "Every language learning journey begins with understanding core concepts. This section will provide you with essential knowledge.",
            "examples": [
                {
                    "french": "C''est important",
                    "english": "It''s important",
                    "pronunciation": "say tam-por-tahn"
                }
            ]
        }
    ],
    "summary": "You have completed this foundational lesson and are ready to progress to more advanced topics.",
    "examples": [
        {
            "french": "Très bien!",
            "english": "Very good!",
            "pronunciation": "tray bee-ahn"
        }
    ]
}'
WHERE content IS NULL OR content = '{}' OR content = 'null';

-- Verify the sample content
SELECT 
    id,
    title,
    lesson_type,
    difficulty_level,
    content->'introduction' as introduction,
    jsonb_array_length(content->'sections') as section_count,
    jsonb_array_length(content->'examples') as example_count
FROM lessons 
WHERE content IS NOT NULL
ORDER BY id;
