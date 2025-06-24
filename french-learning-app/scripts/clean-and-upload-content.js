// Clean existing content and upload new content from markdown
// This script processes the french_notes_Version3.md file and uploads structured content

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey =
	process.env.SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to clean existing content
async function cleanExistingContent() {
	console.log("🗑️  Cleaning existing content...");

	try {
		// Delete in reverse order due to foreign key constraints
		await supabase.from("pronunciation_words").delete().neq("id", 0);
		await supabase.from("lesson_vocabulary").delete().neq("id", 0);
		await supabase.from("lesson_grammar_rules").delete().neq("id", 0);
		await supabase.from("questions").delete().neq("id", 0);
		await supabase.from("vocabulary").delete().neq("id", 0);
		await supabase.from("grammar_rules").delete().neq("id", 0);
		await supabase.from("lessons").delete().neq("id", 0);
		await supabase.from("modules").delete().neq("id", 0);
		await supabase.from("levels").delete().neq("id", 0);

		console.log("✅ Existing content cleaned successfully");
	} catch (error) {
		console.error("❌ Error cleaning content:", error);
		throw error;
	}
}

// Function to ensure pronunciation_words table exists
async function ensurePronunciationWordsTable() {
	console.log("📋 Ensuring pronunciation_words table exists...");

	try {
		const { data, error } = await supabase.rpc(
			"create_pronunciation_words_table"
		);
		if (error && !error.message.includes("already exists")) {
			throw error;
		}
		console.log("✅ Pronunciation words table ready");
	} catch (error) {
		console.log("⚠️  Table might already exist, continuing...");
	}
}

// Function to parse markdown content
function parseMarkdownContent() {
	console.log("📖 Parsing markdown content...");

	const markdownPath = path.join(
		__dirname,
		"..",
		"..",
		"french_notes_Version3.md"
	);

	if (!fs.existsSync(markdownPath)) {
		throw new Error(`Markdown file not found at: ${markdownPath}`);
	}

	const content = fs.readFileSync(markdownPath, "utf-8");

	// Parse the content structure
	const modules = [];
	const vocabularyItems = [];
	const grammarRules = [];
	const pronunciationWords = [];

	// Split content by modules
	const moduleMatches = content.split(/##\s*\*\*Module\s+([IVX]+):/);

	for (let i = 1; i < moduleMatches.length; i += 2) {
		const moduleNumber = moduleMatches[i];
		const moduleContent = moduleMatches[i + 1];

		// Extract module title
		const titleMatch = moduleContent.match(/([^*]+)\*\*/);
		const moduleTitle = titleMatch
			? titleMatch[1].trim()
			: `Module ${moduleNumber}`;

		// Extract learning level
		const levelMatch = moduleContent.match(
			/Learning Level[\s\S]*?\*\s*\*\*([^:]+):\*\*/
		);
		const level = levelMatch ? levelMatch[1].trim() : "Beginner";

		// Extract vocabulary from tables
		const vocabMatches = moduleContent.match(
			/\|[^|]*French[^|]*\|[^|]*English[^|]*\|([\s\S]*?)(?=\n\n|\n###|\n##|$)/g
		);
		if (vocabMatches) {
			vocabMatches.forEach((table) => {
				const rows = table
					.split("\n")
					.filter(
						(row) =>
							row.includes("|") &&
							!row.includes("---") &&
							!row.includes("French")
					);
				rows.forEach((row) => {
					const cells = row
						.split("|")
						.map((cell) => cell.trim())
						.filter((cell) => cell);
					if (cells.length >= 2) {
						vocabularyItems.push({
							french_word: cells[0],
							english_translation: cells[1],
							notes: cells[2] || null,
							module: moduleTitle,
							difficulty_level: level.toLowerCase(),
						});
					}
				});
			});
		}

		// Extract pronunciation guides
		const pronunciationSection = moduleContent.match(
			/###\s*6\.\s*Pronunciation Guide([\s\S]*?)(?=\n---|\n##|$)/
		);
		if (pronunciationSection) {
			const pronunciationContent = pronunciationSection[1];
			const pronunciationMatches = pronunciationContent.match(
				/\*\*([^*]+):\*\*\s*`([^`]+)`/g
			);
			if (pronunciationMatches) {
				pronunciationMatches.forEach((match) => {
					const [, word, pronunciation] = match.match(
						/\*\*([^*]+):\*\*\s*`([^`]+)`/
					);
					pronunciationWords.push({
						french_word: word.trim(),
						pronunciation: pronunciation.trim(),
						module: moduleTitle,
						difficulty_level: level.toLowerCase(),
					});
				});
			}
		}

		// Extract grammar rules
		const grammarSection = moduleContent.match(
			/###\s*4\.\s*In-Depth Grammar([\s\S]*?)(?=\n###|\n---|\n##|$)/
		);
		if (grammarSection) {
			const grammarContent = grammarSection[1];
			const ruleMatches = grammarContent.match(
				/\*\s*\*\*([^*]+)\*\*([\s\S]*?)(?=\*\s*\*\*|\n###|$)/g
			);
			if (ruleMatches) {
				ruleMatches.forEach((rule) => {
					const [, title, explanation] = rule.match(
						/\*\s*\*\*([^*]+)\*\*([\s\S]*)/
					);
					grammarRules.push({
						title: title.trim(),
						explanation: explanation.trim(),
						module: moduleTitle,
						difficulty_level: level.toLowerCase(),
						category: "general",
					});
				});
			}
		}

		modules.push({
			title: moduleTitle,
			description: `Complete ${moduleTitle} with vocabulary, grammar, and pronunciation`,
			level: level,
			order_index: i / 2,
		});
	}

	console.log(
		`✅ Parsed ${modules.length} modules, ${vocabularyItems.length} vocabulary items, ${grammarRules.length} grammar rules, ${pronunciationWords.length} pronunciation words`
	);

	return {
		modules,
		vocabularyItems,
		grammarRules,
		pronunciationWords,
	};
}

// Function to upload content to database
async function uploadContent(parsedContent) {
	console.log("📤 Uploading content to database...");

	try {
		// 1. Create Beginner level
		const { data: level, error: levelError } = await supabase
			.from("levels")
			.insert({
				name: "Beginner",
				description: "Foundational French learning for beginners",
				order_index: 1,
			})
			.select()
			.single();

		if (levelError) throw levelError;
		console.log("✅ Level created");

		// 2. Create modules
		const moduleInserts = parsedContent.modules.map((module) => ({
			level_id: level.id,
			title: module.title,
			description: module.description,
			order_index: module.order_index,
			estimated_duration_minutes: 45,
			difficulty_level: "beginner",
		}));

		const { data: modules, error: moduleError } = await supabase
			.from("modules")
			.insert(moduleInserts)
			.select();

		if (moduleError) throw moduleError;
		console.log(`✅ ${modules.length} modules created`);

		// 3. Create lessons for each module
		const lessonInserts = [];
		modules.forEach((module, index) => {
			lessonInserts.push({
				module_id: module.id,
				title: `${module.title} - Complete Lesson`,
				description: `Comprehensive lesson covering all aspects of ${module.title}`,
				content: {
					type: "comprehensive",
					sections: ["vocabulary", "grammar", "pronunciation", "practice"],
				},
				lesson_type: "vocabulary",
				order_index: 1,
				estimated_time_minutes: 30,
				difficulty_level: "beginner",
			});
		});

		const { data: lessons, error: lessonError } = await supabase
			.from("lessons")
			.insert(lessonInserts)
			.select();

		if (lessonError) throw lessonError;
		console.log(`✅ ${lessons.length} lessons created`);

		// 4. Upload vocabulary
		if (parsedContent.vocabularyItems.length > 0) {
			const { error: vocabError } = await supabase.from("vocabulary").insert(
				parsedContent.vocabularyItems.map((item) => ({
					french_word: item.french_word,
					english_translation: item.english_translation,
					difficulty_level: item.difficulty_level,
					category: item.module.toLowerCase().replace(/\s+/g, "_"),
					word_type: "general",
				}))
			);

			if (vocabError) throw vocabError;
			console.log(
				`✅ ${parsedContent.vocabularyItems.length} vocabulary items uploaded`
			);
		}

		// 5. Upload grammar rules
		if (parsedContent.grammarRules.length > 0) {
			const { error: grammarError } = await supabase
				.from("grammar_rules")
				.insert(
					parsedContent.grammarRules.map((rule, index) => ({
						title: rule.title,
						explanation: rule.explanation,
						difficulty_level: rule.difficulty_level,
						category: rule.category,
						order_index: index + 1,
					}))
				);

			if (grammarError) throw grammarError;
			console.log(
				`✅ ${parsedContent.grammarRules.length} grammar rules uploaded`
			);
		}

		// 6. Upload pronunciation words
		if (parsedContent.pronunciationWords.length > 0) {
			const { error: pronunciationError } = await supabase
				.from("pronunciation_words")
				.insert(
					parsedContent.pronunciationWords.map((item) => ({
						french_word: item.french_word,
						pronunciation: item.pronunciation,
						difficulty_level: item.difficulty_level,
						category: item.module.toLowerCase().replace(/\s+/g, "_"),
					}))
				);

			if (pronunciationError) {
				console.log(
					"ℹ️  Pronunciation words table might not exist, creating it..."
				);
				// Create the table and try again
				await createPronunciationWordsTable();

				const { error: retryError } = await supabase
					.from("pronunciation_words")
					.insert(
						parsedContent.pronunciationWords.map((item) => ({
							french_word: item.french_word,
							pronunciation: item.pronunciation,
							difficulty_level: item.difficulty_level,
							category: item.module.toLowerCase().replace(/\s+/g, "_"),
						}))
					);

				if (retryError) throw retryError;
			}
			console.log(
				`✅ ${parsedContent.pronunciationWords.length} pronunciation words uploaded`
			);
		}

		console.log("🎉 All content uploaded successfully!");
	} catch (error) {
		console.error("❌ Error uploading content:", error);
		throw error;
	}
}

// Function to create pronunciation_words table if it doesn't exist
async function createPronunciationWordsTable() {
	console.log("📋 Creating pronunciation_words table...");

	const createTableSQL = `
        CREATE TABLE IF NOT EXISTS pronunciation_words (
            id SERIAL PRIMARY KEY,
            french_word TEXT NOT NULL,
            pronunciation TEXT NOT NULL,
            audio_url TEXT,
            difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            category TEXT,
            example_sentence TEXT,
            notes TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;
        
        -- Allow public read access
        CREATE POLICY "Allow public read access" ON pronunciation_words FOR SELECT USING (true);
        
        -- Allow authenticated users to insert/update
        CREATE POLICY "Allow authenticated insert" ON pronunciation_words FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Allow authenticated update" ON pronunciation_words FOR UPDATE 
        USING (auth.role() = 'authenticated');
    `;

	try {
		const { error } = await supabase.rpc("exec", { sql: createTableSQL });
		if (error) throw error;
		console.log("✅ Pronunciation words table created");
	} catch (error) {
		console.log("ℹ️  Using alternative method to create table...");
		// Alternative: Create via migration file
		await createMigrationFile();
	}
}

// Function to create migration file for pronunciation_words table
async function createMigrationFile() {
	const timestamp = new Date()
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\..+/, "")
		.replace("T", "");
	const migrationPath = path.join(
		__dirname,
		"..",
		"supabase",
		"migrations",
		`${timestamp}_create_pronunciation_words_table.sql`
	);

	const migrationSQL = `-- Create pronunciation_words table for French learning app

CREATE TABLE IF NOT EXISTS pronunciation_words (
    id SERIAL PRIMARY KEY,
    french_word TEXT NOT NULL,
    pronunciation TEXT NOT NULL,
    audio_url TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    example_sentence TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON pronunciation_words FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON pronunciation_words FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON pronunciation_words FOR UPDATE USING (auth.role() = 'authenticated');

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_french_word ON pronunciation_words(french_word);
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_difficulty ON pronunciation_words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_category ON pronunciation_words(category);
`;

	fs.writeFileSync(migrationPath, migrationSQL);
	console.log(`✅ Migration file created: ${migrationPath}`);
	console.log("ℹ️  Please run: supabase db reset to apply the migration");
}

// Main execution function
async function main() {
	console.log("🚀 Starting content upload process...\n");

	try {
		// Step 1: Clean existing content
		await cleanExistingContent();

		// Step 2: Ensure pronunciation_words table exists
		await ensurePronunciationWordsTable();

		// Step 3: Parse markdown content
		const parsedContent = parseMarkdownContent();

		// Step 4: Upload new content
		await uploadContent(parsedContent);

		console.log("\n🎉 Content upload completed successfully!");
		console.log("\n📊 Summary:");
		console.log(`   • Modules: ${parsedContent.modules.length}`);
		console.log(
			`   • Vocabulary items: ${parsedContent.vocabularyItems.length}`
		);
		console.log(`   • Grammar rules: ${parsedContent.grammarRules.length}`);
		console.log(
			`   • Pronunciation words: ${parsedContent.pronunciationWords.length}`
		);
	} catch (error) {
		console.error("\n❌ Upload failed:", error);
		process.exit(1);
	}
}

// Execute the script
if (require.main === module) {
	main();
}

module.exports = {
	cleanExistingContent,
	parseMarkdownContent,
	uploadContent,
	createPronunciationWordsTable,
};
