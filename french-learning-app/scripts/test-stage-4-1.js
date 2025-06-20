// Test script for Stage 4.1 Core Learning Features
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const serviceRoleKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testStage41Features() {
	console.log("🧪 Testing Stage 4.1 Core Learning Features...\n");

	try {
		// Test 1: Check if progress tracking tables exist
		console.log("1. Testing progress tracking tables...");

		const { data: progressTables, error: tablesError } = await supabase
			.from("information_schema.tables")
			.select("table_name")
			.eq("table_schema", "public")
			.in("table_name", [
				"user_progress",
				"points_history",
				"daily_stats",
				"user_vocabulary_progress",
				"user_grammar_progress",
			]);

		if (tablesError) {
			console.error("❌ Error checking tables:", tablesError.message);
		} else {
			console.log(
				"✅ Progress tracking tables found:",
				progressTables.map((t) => t.table_name).join(", ")
			);
		}

		// Test 2: Check if lesson difficulty levels were updated
		console.log("\n2. Testing lesson difficulty levels...");

		const { data: lessonsWithDifficulty, error: lessonsError } = await supabase
			.from("lessons")
			.select("id, title, difficulty_level, estimated_duration, points_reward")
			.limit(5);

		if (lessonsError) {
			console.error("❌ Error checking lessons:", lessonsError.message);
		} else {
			console.log("✅ Lessons with difficulty levels:");
			lessonsWithDifficulty.forEach((lesson) => {
				console.log(
					`   • ${lesson.title}: ${lesson.difficulty_level} (${lesson.estimated_duration}min, ${lesson.points_reward}pts)`
				);
			});
		}

		// Test 3: Check if profiles have gamification fields
		console.log("\n3. Testing profile gamification fields...");

		const { data: profileColumns, error: columnsError } = await supabase
			.from("information_schema.columns")
			.select("column_name")
			.eq("table_name", "profiles")
			.in("column_name", [
				"total_points",
				"current_level",
				"current_streak",
				"longest_streak",
				"daily_goal",
			]);

		if (columnsError) {
			console.error("❌ Error checking profile columns:", columnsError.message);
		} else {
			console.log(
				"✅ Profile gamification fields found:",
				profileColumns.map((c) => c.column_name).join(", ")
			);
		}

		// Test 4: Test level calculation function
		console.log("\n4. Testing level calculation function...");

		const { data: levelTest, error: levelError } = await supabase.rpc(
			"calculate_user_level",
			{ total_points: 150 }
		);

		if (levelError) {
			console.error("❌ Error testing level function:", levelError.message);
		} else {
			console.log(
				`✅ Level calculation works: 150 points = Level ${levelTest}`
			);
		}

		// Test 5: Create sample progress record
		console.log("\n5. Testing progress record creation...");

		// First get a lesson ID
		const { data: sampleLesson } = await supabase
			.from("lessons")
			.select("id")
			.limit(1)
			.single();

		if (sampleLesson) {
			// Create a test user progress record
			const testUserId = "00000000-0000-0000-0000-000000000001"; // Dummy UUID

			const { data: progressRecord, error: progressError } = await supabase
				.from("user_progress")
				.upsert(
					{
						user_id: testUserId,
						lesson_id: sampleLesson.id,
						status: "in_progress",
						score: 0,
						time_spent: 0,
						attempts: 1,
						section_progress: [
							{
								section_id: "intro",
								completed: true,
								score: 100,
								time_spent: 30,
								attempts: 1,
							},
						],
					},
					{ onConflict: "user_id,lesson_id" }
				)
				.select();

			if (progressError) {
				console.error(
					"❌ Error creating progress record:",
					progressError.message
				);
			} else {
				console.log("✅ Progress record created successfully");
			}
		}

		// Test 6: Check RLS policies
		console.log("\n6. Testing RLS policies...");

		const anonSupabase = createClient(
			supabaseUrl,
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
		);

		const { data: rlsTest, error: rlsError } = await anonSupabase
			.from("user_progress")
			.select("*")
			.limit(1);

		if (rlsError) {
			console.log("✅ RLS policies working (anon users blocked)");
		} else {
			console.log("⚠️  RLS policies may need adjustment (anon access allowed)");
		}

		console.log("\n🎉 Stage 4.1 testing completed!");
		console.log("📋 Core learning features are ready for development.");
		console.log("🔗 You can view the database at: http://127.0.0.1:54323");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

// Run the test
testStage41Features();
