// Debug script to test lesson creation directly
const { createClient } = require("@supabase/supabase-js");

// Use production config values
const supabaseUrl = "https://ozcdaztxzadwdytuzfay.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLessonCreation() {
	console.log("🔍 Testing lesson creation...");

	try {
		// First, let's check if we can connect to Supabase
		console.log("1. Testing Supabase connection...");
		const { data: testData, error: testError } = await supabase
			.from("learning_books")
			.select("count")
			.limit(1);

		if (testError) {
			console.error("❌ Supabase connection failed:", testError);
			return;
		}
		console.log("✅ Supabase connection successful");

		// Check available books
		console.log("2. Checking available books...");
		const { data: books, error: booksError } = await supabase
			.from("learning_books")
			.select("id, title, is_published, is_active");

		if (booksError) {
			console.error("❌ Error fetching books:", booksError);
			return;
		}

		console.log("📚 All books:", books);

		const publishedBooks =
			books?.filter((book) => book.is_published && book.is_active) || [];
		console.log("📚 Published books:", publishedBooks);

		if (!publishedBooks || publishedBooks.length === 0) {
			console.log("❌ No published books available for lesson creation");

			// Let's try to find any book at all
			if (books && books.length > 0) {
				console.log(
					"📖 Using first available book regardless of publish status..."
				);
				const targetBook =
					publishedBooks.length > 0 ? publishedBooks[0] : books[0];
				console.log(
					`📖 Using book: ${targetBook.title} (ID: ${targetBook.id})`
				);
			} else {
				console.log("❌ No books at all in database");
				return;
			}
		} else {
			const targetBook = publishedBooks[0];
			console.log(`📖 Using book: ${targetBook.title} (ID: ${targetBook.id})`);
		}

		// Check current lessons count
		console.log("3. Checking current lessons...");
		const { data: existingLessons, error: lessonsError } = await supabase
			.from("learning_lessons")
			.select("id, title, order_index")
			.eq("book_id", targetBook.id)
			.order("order_index");

		if (lessonsError) {
			console.error("❌ Error fetching lessons:", lessonsError);
			return;
		}

		console.log(`📝 Existing lessons (${existingLessons?.length || 0}):`);
		existingLessons?.forEach((lesson) => {
			console.log(`  - ${lesson.title} (Order: ${lesson.order_index})`);
		});

		// Test lesson data
		const testLessonData = {
			book_id: targetBook.id,
			title: `Test Lesson ${Date.now()}`,
			description: "This is a test lesson created for debugging",
			content: {
				introduction: "Welcome to this test lesson!",
				main_content: [
					{
						id: "intro-section",
						type: "text",
						title: "Introduction",
						content: "This is test content.",
						order_index: 1,
					},
				],
				summary: "Complete this lesson to progress.",
				key_points: ["Test point 1", "Test point 2"],
			},
			vocabulary_words: ["test", "debug", "lesson"],
			estimated_duration_minutes: 15,
			difficulty_level: "beginner",
			learning_objectives: ["Learn debugging", "Test creation"],
			order_index: (existingLessons?.length || 0) + 1,
			is_published: true,
			is_active: true,
		};

		console.log("4. Creating test lesson...");
		console.log("📄 Lesson data:", JSON.stringify(testLessonData, null, 2));

		const { data: newLesson, error: createError } = await supabase
			.from("learning_lessons")
			.insert([testLessonData])
			.select("*")
			.single();

		if (createError) {
			console.error("❌ Error creating lesson:", createError);
			console.error("Error details:", JSON.stringify(createError, null, 2));
			return;
		}

		console.log("✅ Lesson created successfully!");
		console.log("📝 New lesson:", newLesson);

		// Verify the lesson exists
		console.log("5. Verifying lesson creation...");
		const { data: verifyLesson, error: verifyError } = await supabase
			.from("learning_lessons")
			.select("*")
			.eq("id", newLesson.id)
			.single();

		if (verifyError) {
			console.error("❌ Error verifying lesson:", verifyError);
			return;
		}

		if (verifyLesson) {
			console.log("✅ Lesson verified in database!");
			console.log("📝 Verified lesson:", verifyLesson);
		} else {
			console.log("❌ Lesson not found in verification step");
		}

		// Check if lesson appears in listing
		console.log("6. Checking if lesson appears in book listings...");
		const { data: updatedLessons, error: listError } = await supabase
			.from("learning_lessons")
			.select("id, title, order_index")
			.eq("book_id", targetBook.id)
			.order("order_index");

		if (listError) {
			console.error("❌ Error fetching updated lessons:", listError);
			return;
		}

		console.log(`📝 Updated lessons list (${updatedLessons?.length || 0}):`);
		updatedLessons?.forEach((lesson) => {
			console.log(
				`  - ${lesson.title} (Order: ${lesson.order_index}) ${
					lesson.id === newLesson.id ? "← NEW" : ""
				}`
			);
		});
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

testLessonCreation()
	.then(() => {
		console.log("🏁 Debug script completed");
	})
	.catch((error) => {
		console.error("💥 Script failed:", error);
	});
