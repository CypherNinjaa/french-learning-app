// Debug script to check lesson data structure
const { createClient } = require("@supabase/supabase-js");

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "your-supabase-url";
const supabaseKey =
	process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLessonData() {
	try {
		console.log("🔍 Checking lesson data structure...\n");

		// Get all lessons
		const { data: lessons, error } = await supabase
			.from("lessons")
			.select("*")
			.eq("is_active", true)
			.limit(5);

		if (error) {
			console.error("❌ Error fetching lessons:", error);
			return;
		}

		if (!lessons || lessons.length === 0) {
			console.log("⚠️  No lessons found in database");
			return;
		}

		console.log(`📚 Found ${lessons.length} lessons:\n`);

		lessons.forEach((lesson, index) => {
			console.log(`--- Lesson ${index + 1} ---`);
			console.log(`ID: ${lesson.id}`);
			console.log(`Title: ${lesson.title}`);
			console.log(`Type: ${lesson.lesson_type}`);
			console.log(`Difficulty: ${lesson.difficulty_level}`);
			console.log(
				`Content structure:`,
				JSON.stringify(lesson.content, null, 2)
			);

			// Check if content has the expected structure
			if (!lesson.content) {
				console.log("⚠️  WARNING: No content found");
			} else if (!lesson.content.sections) {
				console.log("⚠️  WARNING: No sections found in content");
			} else if (lesson.content.sections.length === 0) {
				console.log("⚠️  WARNING: Empty sections array");
			} else {
				console.log(`✅ Has ${lesson.content.sections.length} sections`);
				lesson.content.sections.forEach((section, sIndex) => {
					console.log(`  Section ${sIndex + 1}:`);
					console.log(`    ID: ${section.id || "MISSING"}`);
					console.log(`    Type: ${section.type || "MISSING"}`);
					console.log(`    Title: ${section.title || "MISSING"}`);
					console.log(`    Has content: ${!!section.content}`);
				});
			}
			console.log("");
		});
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

// Run the debug function
debugLessonData().then(() => {
	console.log("🔍 Debug complete");
	process.exit(0);
});
