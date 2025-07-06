// Check lesson status in database
const { createClient } = require("@supabase/supabase-js");

// Use production config values
const supabaseUrl = "https://ozcdaztxzadwdytuzfay.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLessonsStatus() {
	console.log("🔍 Checking lesson status in database...");

	try {
		// Get all lessons with their publication status
		const { data: allLessons, error } = await supabase
			.from("learning_lessons")
			.select("id, title, book_id, is_published, is_active, order_index")
			.order("book_id", { ascending: true })
			.order("order_index", { ascending: true });

		if (error) {
			console.error("❌ Error fetching lessons:", error);
			return;
		}

		console.log(
			`📝 Found ${allLessons?.length || 0} total lessons in database:`
		);
		console.log("");

		// Group by book
		const lessonsByBook = {};
		allLessons?.forEach((lesson) => {
			if (!lessonsByBook[lesson.book_id]) {
				lessonsByBook[lesson.book_id] = [];
			}
			lessonsByBook[lesson.book_id].push(lesson);
		});

		// Display by book
		for (const [bookId, lessons] of Object.entries(lessonsByBook)) {
			console.log(`📚 Book ${bookId}:`);
			lessons.forEach((lesson, index) => {
				const status =
					lesson.is_published && lesson.is_active ? "✅ VISIBLE" : "❌ HIDDEN";
				console.log(
					`  ${index + 1}. ${lesson.title} (ID: ${lesson.id}) - ${status}`
				);
				console.log(
					`     Published: ${lesson.is_published}, Active: ${lesson.is_active}`
				);
			});
			console.log("");
		}

		// Check specifically for Book 1 (French Fundamentals)
		console.log("🔍 Checking specifically for Book 1 (French Fundamentals):");
		const book1Lessons = lessonsByBook["1"] || [];
		const visibleLessons = book1Lessons.filter(
			(l) => l.is_published && l.is_active
		);
		const hiddenLessons = book1Lessons.filter(
			(l) => !l.is_published || !l.is_active
		);

		console.log(`📊 Book 1 Summary:`);
		console.log(`  Total lessons: ${book1Lessons.length}`);
		console.log(`  Visible to users: ${visibleLessons.length}`);
		console.log(`  Hidden from users: ${hiddenLessons.length}`);

		if (hiddenLessons.length > 0) {
			console.log("");
			console.log("❌ Hidden lessons that need to be fixed:");
			hiddenLessons.forEach((lesson) => {
				console.log(`  - ${lesson.title} (ID: ${lesson.id})`);
			});
			console.log("");
			console.log(
				"💡 Run the fix-lesson-visibility.sql script in Supabase to fix these!"
			);
		}
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

checkLessonsStatus()
	.then(() => {
		console.log("🏁 Lesson status check completed");
	})
	.catch((error) => {
		console.error("💥 Script failed:", error);
	});
