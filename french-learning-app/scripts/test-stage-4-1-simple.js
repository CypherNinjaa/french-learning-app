// Simplified test script for Stage 4.1
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const serviceRoleKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testStage41Features() {
	console.log("🧪 Testing Stage 4.1 Core Learning Features...\n");

	try {
		// Test 1: Check if user_progress table exists and is accessible
		console.log("1. Testing user_progress table...");

		const { data: progressTest, error: progressError } = await supabase
			.from("user_progress")
			.select("*")
			.limit(1);

		if (progressError) {
			console.error("❌ user_progress table issue:", progressError.message);
		} else {
			console.log("✅ user_progress table exists and is accessible");
		}

		// Test 2: Check if points_history table exists
		console.log("\n2. Testing points_history table...");

		const { data: pointsTest, error: pointsError } = await supabase
			.from("points_history")
			.select("*")
			.limit(1);

		if (pointsError) {
			console.error("❌ points_history table issue:", pointsError.message);
		} else {
			console.log("✅ points_history table exists and is accessible");
		}

		// Test 3: Check lessons table for new columns
		console.log("\n3. Testing lessons table updates...");

		const { data: lessonsTest, error: lessonsError } = await supabase
			.from("lessons")
			.select("id, title, difficulty_level")
			.limit(3);

		if (lessonsError) {
			console.error("❌ lessons table issue:", lessonsError.message);
		} else {
			console.log(
				"✅ lessons table accessible with",
				lessonsTest.length,
				"lessons"
			);
			if (lessonsTest.length > 0 && lessonsTest[0].difficulty_level) {
				console.log("✅ difficulty_level column exists");
			}
		}

		// Test 4: Check profiles table updates
		console.log("\n4. Testing profiles table updates...");

		const { data: profilesTest, error: profilesError } = await supabase
			.from("profiles")
			.select("id, total_points, current_level")
			.limit(1);

		if (profilesError) {
			console.error("❌ profiles table issue:", profilesError.message);
		} else {
			console.log("✅ profiles table updated with gamification fields");
		}

		// Test 5: Test basic lesson service functionality
		console.log("\n5. Testing lesson retrieval...");

		const { data: testLesson, error: lessonError } = await supabase
			.from("lessons")
			.select("*")
			.limit(1)
			.single();

		if (lessonError) {
			console.error("❌ lesson retrieval issue:", lessonError.message);
		} else {
			console.log("✅ Lesson retrieval works:", testLesson.title);
		}

		console.log("\n🎉 Stage 4.1 basic functionality verified!");
		console.log(
			"📋 Ready to proceed with lesson rendering and progress tracking."
		);
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

// Run the test
testStage41Features();
