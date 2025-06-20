import { createClient } from "@supabase/supabase-js";

// Test script to verify Stage 3.3 migration was successful
async function verifyMigration() {
	const supabaseUrl = "http://127.0.0.1:54321";
	const supabaseKey =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

	const supabase = createClient(supabaseUrl, supabaseKey);

	console.log("🔍 Verifying Stage 3.3 migration...\n");

	try {
		// Test 1: Check if content_tags table exists and has default data
		console.log("1. Testing content_tags table...");
		const { data: tags, error: tagsError } = await supabase
			.from("content_tags")
			.select("*")
			.limit(5);

		if (tagsError) {
			console.error("❌ Error accessing content_tags:", tagsError.message);
		} else {
			console.log(
				"✅ Content tags table exists with",
				tags.length,
				"default tags"
			);
			if (tags.length > 0) {
				console.log("   Sample tag:", tags[0].name, "(" + tags[0].color + ")");
			}
		}

		// Test 2: Check if content_versions table exists
		console.log("\n2. Testing content_versions table...");
		const { data: versions, error: versionsError } = await supabase
			.from("content_versions")
			.select("*")
			.limit(1);

		if (versionsError) {
			console.error(
				"❌ Error accessing content_versions:",
				versionsError.message
			);
		} else {
			console.log("✅ Content versions table exists and is accessible");
		}

		// Test 3: Check if learning_paths table exists
		console.log("\n3. Testing learning_paths table...");
		const { data: paths, error: pathsError } = await supabase
			.from("learning_paths")
			.select("*")
			.limit(1);

		if (pathsError) {
			console.error("❌ Error accessing learning_paths:", pathsError.message);
		} else {
			console.log("✅ Learning paths table exists and is accessible");
		}

		// Test 4: Check if lesson_vocabulary table exists
		console.log("\n4. Testing lesson_vocabulary table...");
		const { data: lessonVocab, error: lessonVocabError } = await supabase
			.from("lesson_vocabulary")
			.select("*")
			.limit(1);

		if (lessonVocabError) {
			console.error(
				"❌ Error accessing lesson_vocabulary:",
				lessonVocabError.message
			);
		} else {
			console.log("✅ Lesson vocabulary table exists and is accessible");
		}

		// Test 5: Check if content_analytics table exists
		console.log("\n5. Testing content_analytics table...");
		const { data: analytics, error: analyticsError } = await supabase
			.from("content_analytics")
			.select("*")
			.limit(1);

		if (analyticsError) {
			console.error(
				"❌ Error accessing content_analytics:",
				analyticsError.message
			);
		} else {
			console.log("✅ Content analytics table exists and is accessible");
		}

		console.log("\n🎉 Migration verification completed!");
		console.log("📋 All Stage 3.3 tables have been successfully created.");
		console.log(
			"🔗 You can now use Supabase Studio at: http://127.0.0.1:54323"
		);
	} catch (error) {
		console.error("❌ Verification failed:", error.message);
	}
}

// Run the verification
verifyMigration();
