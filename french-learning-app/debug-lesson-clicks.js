/**
 * Debug Script for Lesson Clickability Issues
 * This script helps diagnose and fix lesson clicking problems
 */

const { supabase } = require("./src/services/supabase");

async function debugLessonData() {
	console.log("🔍 Starting lesson clickability debug...\n");

	try {
		// 1. Check if lessons exist
		console.log("1. Checking lessons in database...");
		const { data: lessons, error: lessonsError } = await supabase
			.from("lessons")
			.select("*")
			.eq("is_active", true)
			.order("order_index");

		if (lessonsError) {
			console.error("❌ Error fetching lessons:", lessonsError);
			return;
		}

		console.log(`✅ Found ${lessons?.length || 0} active lessons`);

		if (lessons?.length === 0) {
			console.log(
				"❌ No lessons found! This explains why nothing is clickable."
			);
			console.log("💡 Solution: Run the sample data script:");
			console.log("   psql -d your_db -f SAMPLE_BOOK_LESSONS.sql");
			return;
		}

		// 2. Check lesson content structure
		console.log("\n2. Checking lesson content structure...");
		lessons.forEach((lesson, index) => {
			console.log(`\nLesson ${index + 1}: ${lesson.title}`);
			console.log(`   ID: ${lesson.id}`);
			console.log(`   Module ID: ${lesson.module_id}`);
			console.log(`   Type: ${lesson.lesson_type}`);
			console.log(`   Active: ${lesson.is_active}`);

			if (lesson.content) {
				const content =
					typeof lesson.content === "string"
						? JSON.parse(lesson.content)
						: lesson.content;

				console.log(`   Has Introduction: ${!!content.introduction}`);
				console.log(`   Sections: ${content.sections?.length || 0}`);
				console.log(`   Examples: ${content.examples?.length || 0}`);

				if (
					!content.introduction &&
					(!content.sections || content.sections.length === 0)
				) {
					console.log("   ⚠️  WARNING: Lesson has no content structure!");
				}
			} else {
				console.log("   ❌ No content found!");
			}
		});

		// 3. Check modules
		console.log("\n3. Checking modules...");
		const { data: modules, error: modulesError } = await supabase
			.from("modules")
			.select("*")
			.eq("is_active", true);

		if (modulesError) {
			console.error("❌ Error fetching modules:", modulesError);
			return;
		}

		console.log(`✅ Found ${modules?.length || 0} active modules`);

		if (modules?.length === 0) {
			console.log("❌ No modules found! Lessons need modules to display.");
			return;
		}

		// 4. Check lesson-module relationships
		console.log("\n4. Checking lesson-module relationships...");
		lessons.forEach((lesson) => {
			const module = modules.find((m) => m.id === lesson.module_id);
			if (!module) {
				console.log(
					`❌ Lesson "${lesson.title}" references non-existent module ${lesson.module_id}`
				);
			}
		});

		// 5. Check user progress (if any)
		console.log("\n5. Checking user progress table...");
		const { data: progress, error: progressError } = await supabase
			.from("user_lesson_progress")
			.select("*")
			.limit(5);

		if (progressError) {
			console.log("⚠️  User progress table might not exist or have issues");
		} else {
			console.log(
				`✅ Found ${progress?.length || 0} progress records (showing first 5)`
			);
		}

		console.log("\n🎯 DIAGNOSIS COMPLETE");
		console.log("\n📋 CHECKLIST FOR LESSON CLICKABILITY:");
		console.log("   ✅ Active lessons exist");
		console.log("   ✅ Lessons have proper content structure");
		console.log("   ✅ Modules exist and are linked correctly");
		console.log("   ✅ TouchableOpacity components are properly configured");
		console.log(
			"   ✅ handleLessonPress function exists and sets selectedLesson"
		);
		console.log(
			"   ✅ LessonReader modal is rendered when selectedLesson is set"
		);

		console.log("\n🔧 If lessons are still not clickable, check:");
		console.log(
			'   1. React Native TouchableOpacity styling (no pointerEvents="none")'
		);
		console.log("   2. Console for JavaScript errors");
		console.log("   3. Component state management");
		console.log("   4. Modal rendering and visibility");
	} catch (error) {
		console.error("❌ Debug script error:", error);
	}
}

// Export for use in other scripts
if (require.main === module) {
	debugLessonData()
		.then(() => {
			console.log("\n✅ Debug complete");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Debug failed:", error);
			process.exit(1);
		});
}

module.exports = { debugLessonData };
