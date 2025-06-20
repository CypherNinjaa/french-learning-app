import { createClient } from "@supabase/supabase-js";

// Use service role to insert default tags (bypasses RLS)
async function insertDefaultTags() {
	const supabaseUrl = "http://127.0.0.1:54321";
	const serviceRoleKey =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

	const supabase = createClient(supabaseUrl, serviceRoleKey);

	console.log("🏷️  Inserting default content tags with service role...\n");

	try {
		// First check if tags already exist
		const { data: existingTags } = await supabase
			.from("content_tags")
			.select("name");

		if (existingTags && existingTags.length > 0) {
			console.log(
				"✅ Content tags already exist:",
				existingTags.map((t) => t.name).join(", ")
			);
			return;
		}

		const defaultTags = [
			{
				name: "Beginner",
				color: "#34C759",
				description: "Content suitable for beginners",
			},
			{
				name: "Intermediate",
				color: "#FF9500",
				description: "Content suitable for intermediate learners",
			},
			{
				name: "Advanced",
				color: "#FF3B30",
				description: "Content suitable for advanced learners",
			},
			{
				name: "Grammar",
				color: "#5856D6",
				description: "Grammar-focused content",
			},
			{
				name: "Vocabulary",
				color: "#007AFF",
				description: "Vocabulary-focused content",
			},
			{
				name: "Pronunciation",
				color: "#AF52DE",
				description: "Pronunciation-focused content",
			},
			{
				name: "Conversation",
				color: "#FF2D92",
				description: "Conversation practice content",
			},
			{
				name: "Cultural",
				color: "#32D74B",
				description: "French culture and context",
			},
			{
				name: "Business",
				color: "#8E8E93",
				description: "Business French content",
			},
			{
				name: "Travel",
				color: "#30B0C7",
				description: "Travel-related French content",
			},
		];

		const { data: insertedTags, error } = await supabase
			.from("content_tags")
			.upsert(defaultTags, { onConflict: "name" })
			.select();

		if (error) {
			console.error("❌ Error inserting tags:", error.message);
		} else {
			console.log(
				"✅ Successfully inserted",
				insertedTags.length,
				"default tags:"
			);
			insertedTags.forEach((tag) => {
				console.log(`   • ${tag.name} (${tag.color}) - ${tag.description}`);
			});
		}

		// Now test with regular anon key
		console.log("\n🔍 Testing tag access with anon key...");
		const anonSupabase = createClient(
			supabaseUrl,
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
		);

		const { data: publicTags, error: publicError } = await anonSupabase
			.from("content_tags")
			.select("*")
			.order("name");

		if (publicError) {
			console.error(
				"❌ Error reading tags with anon key:",
				publicError.message
			);
		} else {
			console.log(
				"✅ Successfully read",
				publicTags.length,
				"tags with anon key"
			);
			console.log("   Tags:", publicTags.map((t) => t.name).join(", "));
		}
	} catch (error) {
		console.error("❌ Unexpected error:", error.message);
	}
}

insertDefaultTags();
