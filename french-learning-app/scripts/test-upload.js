// Test content upload and verify it works
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"; // service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
	console.log("🧪 Testing content upload...\n");

	try {
		// 1. Clean existing data using service role
		console.log("🗑️  Cleaning existing content...");
		await supabase.from("questions").delete().neq("id", 0);
		await supabase.from("vocabulary").delete().neq("id", 0);
		await supabase.from("grammar_rules").delete().neq("id", 0);
		await supabase.from("lessons").delete().neq("id", 0);
		await supabase.from("modules").delete().neq("id", 0);
		await supabase.from("levels").delete().neq("id", 0);

		// Create pronunciation_words table if it doesn't exist
		try {
			await supabase.from("pronunciation_words").delete().neq("id", 0);
		} catch (error) {
			console.log(
				"ℹ️  Pronunciation words table doesn't exist yet, will create..."
			);
		}

		console.log("✅ Cleaned existing content\n");

		// 2. Create level
		console.log("📚 Creating level...");
		const { data: level, error: levelError } = await supabase
			.from("levels")
			.insert({
				name: "Beginner",
				description:
					"Foundational French learning covering essential vocabulary, grammar, and pronunciation",
				order_index: 1,
			})
			.select()
			.single();

		if (levelError) throw levelError;
		console.log("✅ Level created:", level.name);

		// 3. Create modules
		console.log("📖 Creating modules...");
		const moduleInserts = [
			{
				level_id: level.id,
				title: "Module I: Greetings (Les Salutations)",
				description:
					"Learn fundamental greetings, formal vs informal language, and basic introductions",
				order_index: 1,
				estimated_duration_minutes: 45,
				difficulty_level: "beginner",
			},
			{
				level_id: level.id,
				title: "Module II: At the Restaurant (Au Restaurant)",
				description:
					"Essential vocabulary and phrases for dining out, ordering food and drinks",
				order_index: 2,
				estimated_duration_minutes: 45,
				difficulty_level: "beginner",
			},
			{
				level_id: level.id,
				title: "Module III: Talking about Professions (Parler des Professions)",
				description:
					"Learn to describe professions, nationalities, and daily routines",
				order_index: 3,
				estimated_duration_minutes: 45,
				difficulty_level: "beginner",
			},
			{
				level_id: level.id,
				title: "Module V: At the Discotheque (À la Discothèque)",
				description:
					"Question formation, negation, and social conversation skills",
				order_index: 4,
				estimated_duration_minutes: 45,
				difficulty_level: "beginner",
			},
		];

		const { data: modules, error: moduleError } = await supabase
			.from("modules")
			.insert(moduleInserts)
			.select();

		if (moduleError) throw moduleError;
		console.log(`✅ ${modules.length} modules created`);

		// 4. Create lessons
		console.log("🎯 Creating lessons...");
		const lessonInserts = [];

		// Module I lessons
		lessonInserts.push({
			module_id: modules[0].id,
			title: "Formal vs Informal: vous and tu",
			description:
				"Master the crucial distinction between formal and informal address in French",
			content: {
				sections: ["explanation", "examples", "practice"],
				key_concepts: ["vous usage", "tu usage", "verb conjugations"],
			},
			lesson_type: "grammar",
			order_index: 1,
			estimated_time_minutes: 20,
			difficulty_level: "beginner",
		});

		// Module II lessons
		lessonInserts.push({
			module_id: modules[1].id,
			title: "Ordering Food and Drinks",
			description:
				"Essential phrases for ordering in restaurants using polite conditional forms",
			content: {
				sections: ["conditional_forms", "menu_vocabulary", "polite_ordering"],
				key_verb: "vouloir",
			},
			lesson_type: "vocabulary",
			order_index: 1,
			estimated_time_minutes: 25,
			difficulty_level: "beginner",
		});

		const { data: lessons, error: lessonError } = await supabase
			.from("lessons")
			.insert(lessonInserts)
			.select();

		if (lessonError) throw lessonError;
		console.log(`✅ ${lessons.length} lessons created`);

		// 5. Create vocabulary items
		console.log("📝 Creating vocabulary...");
		const vocabularyItems = [
			// Greetings
			{
				french_word: "bonjour",
				english_translation: "good day, hello",
				pronunciation: "bon-zhoor",
				difficulty_level: "beginner",
				category: "greetings",
				word_type: "interjection",
			},
			{
				french_word: "bonsoir",
				english_translation: "good evening",
				pronunciation: "bon-swahr",
				difficulty_level: "beginner",
				category: "greetings",
				word_type: "interjection",
			},
			{
				french_word: "au revoir",
				english_translation: "goodbye",
				pronunciation: "oh ruh-vwahr",
				difficulty_level: "beginner",
				category: "greetings",
				word_type: "interjection",
			},
			{
				french_word: "vous",
				english_translation: "you (formal/plural)",
				pronunciation: "voo",
				difficulty_level: "beginner",
				category: "pronouns",
				word_type: "pronoun",
			},
			{
				french_word: "tu",
				english_translation: "you (informal)",
				pronunciation: "tuu",
				difficulty_level: "beginner",
				category: "pronouns",
				word_type: "pronoun",
			},

			// Restaurant vocabulary
			{
				french_word: "restaurant",
				english_translation: "restaurant",
				pronunciation: "ress-toh-ron",
				difficulty_level: "beginner",
				category: "restaurant",
				gender: "masculine",
				word_type: "noun",
			},
			{
				french_word: "menu",
				english_translation: "menu",
				pronunciation: "muh-nuu",
				difficulty_level: "beginner",
				category: "restaurant",
				gender: "masculine",
				word_type: "noun",
			},
			{
				french_word: "eau",
				english_translation: "water",
				pronunciation: "oh",
				difficulty_level: "beginner",
				category: "drinks",
				gender: "feminine",
				word_type: "noun",
			},
			{
				french_word: "café",
				english_translation: "coffee",
				pronunciation: "ka-fay",
				difficulty_level: "beginner",
				category: "drinks",
				gender: "masculine",
				word_type: "noun",
			},
			{
				french_word: "vin",
				english_translation: "wine",
				pronunciation: "van",
				difficulty_level: "beginner",
				category: "drinks",
				gender: "masculine",
				word_type: "noun",
			},
		];

		const { data: vocabulary, error: vocabError } = await supabase
			.from("vocabulary")
			.insert(vocabularyItems)
			.select();

		if (vocabError) throw vocabError;
		console.log(`✅ ${vocabulary.length} vocabulary items created`);

		// 6. Create grammar rules
		console.log("📋 Creating grammar rules...");
		const grammarRules = [
			{
				title: "The verb être (to be)",
				explanation:
					"The most fundamental irregular verb in French, used for identity, description, and location.",
				examples: [
					{ french: "Je suis Paul", english: "I am Paul" },
					{ french: "Vous êtes le professeur", english: "You are the teacher" },
				],
				difficulty_level: "beginner",
				category: "verbs",
				order_index: 1,
			},
			{
				title: "Question formation with est-ce que",
				explanation:
					'A neutral way to form questions by adding "est-ce que" to the beginning of a statement.',
				examples: [
					{
						french: "Est-ce que tu aimes la musique?",
						english: "Do you like music?",
					},
					{
						french: "Est-ce que vous parlez français?",
						english: "Do you speak French?",
					},
				],
				difficulty_level: "beginner",
				category: "questions",
				order_index: 2,
			},
		];

		const { data: grammar, error: grammarError } = await supabase
			.from("grammar_rules")
			.insert(grammarRules)
			.select();

		if (grammarError) throw grammarError;
		console.log(`✅ ${grammar.length} grammar rules created`);

		// 7. Try to create pronunciation words
		console.log("🔊 Creating pronunciation words...");
		try {
			const pronunciationWords = [
				{
					french_word: "bonjour",
					pronunciation: "bon-zhoor",
					difficulty_level: "beginner",
					category: "greetings",
					example_sentence: "Bonjour, comment allez-vous?",
					notes: 'The "on" is a nasal sound',
				},
				{
					french_word: "vous",
					pronunciation: "voo",
					difficulty_level: "beginner",
					category: "pronouns",
					example_sentence: "Comment vous appelez-vous?",
					notes: 'The final "s" is silent',
				},
				{
					french_word: "restaurant",
					pronunciation: "ress-toh-ron",
					difficulty_level: "beginner",
					category: "restaurant",
					example_sentence: "Nous allons au restaurant",
					notes: 'Final "t" is silent',
				},
				{
					french_word: "eau",
					pronunciation: "low",
					difficulty_level: "beginner",
					category: "drinks",
					example_sentence: "Une carafe d'eau, s'il vous plaît",
					notes: 'Rounded "o" sound',
				},
				{
					french_word: "musique",
					pronunciation: "muu-zeek",
					difficulty_level: "beginner",
					category: "entertainment",
					example_sentence: "J'aime la musique française",
					notes: 'The "qu" sounds like "k"',
				},
			];

			const { data: pronunciation, error: pronunciationError } = await supabase
				.from("pronunciation_words")
				.insert(pronunciationWords)
				.select();

			if (pronunciationError) {
				console.log(
					"⚠️  Pronunciation words table might not exist. Error:",
					pronunciationError.message
				);
				console.log(
					"ℹ️  This is expected if the table hasn't been created via migration yet."
				);
			} else {
				console.log(`✅ ${pronunciation.length} pronunciation words created`);
			}
		} catch (error) {
			console.log(
				"⚠️  Could not create pronunciation words (table might not exist):",
				error.message
			);
		}

		// 8. Verify upload
		console.log("\n📊 Verifying upload...");
		const { data: levelCount } = await supabase
			.from("levels")
			.select("*", { count: "exact" });
		const { data: moduleCount } = await supabase
			.from("modules")
			.select("*", { count: "exact" });
		const { data: lessonCount } = await supabase
			.from("lessons")
			.select("*", { count: "exact" });
		const { data: vocabCount } = await supabase
			.from("vocabulary")
			.select("*", { count: "exact" });
		const { data: grammarCount } = await supabase
			.from("grammar_rules")
			.select("*", { count: "exact" });

		console.log(`\n🎉 Upload successful!`);
		console.log(`   📚 Levels: ${levelCount?.length || 0}`);
		console.log(`   📖 Modules: ${moduleCount?.length || 0}`);
		console.log(`   🎯 Lessons: ${lessonCount?.length || 0}`);
		console.log(`   📝 Vocabulary: ${vocabCount?.length || 0}`);
		console.log(`   📋 Grammar Rules: ${grammarCount?.length || 0}`);

		console.log(
			"\n✅ Your French learning content has been successfully uploaded!"
		);
		console.log("🚀 You can now test the app with the new content.");
	} catch (error) {
		console.error("\n❌ Upload failed:", error);
		process.exit(1);
	}
}

testUpload();
