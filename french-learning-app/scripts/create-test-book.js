// Script to create a test book for lesson creation
const { createClient } = require("@supabase/supabase-js");

// Use production config values
const supabaseUrl = "https://ozcdaztxzadwdytuzfay.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBook() {
	console.log("📚 Creating test book...");

	try {
		const bookData = {
			title: "French Fundamentals",
			description:
				"Learn the basics of French language with interactive lessons",
			difficulty_level: "beginner",
			estimated_duration_hours: 20,
			order_index: 1,
			is_published: true,
			is_active: true,
			tags: ["french", "basics", "beginner"],
			prerequisites: [],
			learning_objectives: [
				"Master basic French greetings",
				"Learn numbers 1-20",
				"Understand basic introductions",
				"Practice common vocabulary",
			],
		};

		console.log("📄 Book data:", JSON.stringify(bookData, null, 2));

		const { data: newBook, error: createError } = await supabase
			.from("learning_books")
			.insert([bookData])
			.select("*")
			.single();

		if (createError) {
			console.error("❌ Error creating book:", createError);
			console.error("Error details:", JSON.stringify(createError, null, 2));
			return;
		}

		console.log("✅ Book created successfully!");
		console.log("📚 New book:", newBook);

		// Verify the book exists
		const { data: verifyBook, error: verifyError } = await supabase
			.from("learning_books")
			.select("*")
			.eq("id", newBook.id)
			.single();

		if (verifyError) {
			console.error("❌ Error verifying book:", verifyError);
			return;
		}

		if (verifyBook) {
			console.log("✅ Book verified in database!");
		} else {
			console.log("❌ Book not found in verification step");
		}
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

createTestBook()
	.then(() => {
		console.log("🏁 Book creation completed");
	})
	.catch((error) => {
		console.error("💥 Script failed:", error);
	});
