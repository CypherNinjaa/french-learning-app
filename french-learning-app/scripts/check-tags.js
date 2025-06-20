import { createClient } from "@supabase/supabase-js";

// Check content tags specifically
async function checkContentTags() {
	const supabaseUrl = "http://127.0.0.1:54321";
	const supabaseKey =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

	const supabase = createClient(supabaseUrl, supabaseKey);

	console.log("🏷️  Checking content tags...\n");

	try {
		const { data: tags, error } = await supabase
			.from("content_tags")
			.select("*")
			.order("name");

		if (error) {
			console.error("❌ Error:", error.message);
			return;
		}

		if (tags.length === 0) {
			console.log("📝 No tags found. Inserting default tags...");

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

			const { data: insertedTags, error: insertError } = await supabase
				.from("content_tags")
				.insert(defaultTags)
				.select();

			if (insertError) {
				console.error("❌ Error inserting tags:", insertError.message);
			} else {
				console.log(
					"✅ Successfully inserted",
					insertedTags.length,
					"default tags"
				);
				insertedTags.forEach((tag) => {
					console.log(`   • ${tag.name} (${tag.color}) - ${tag.description}`);
				});
			}
		} else {
			console.log("✅ Found", tags.length, "content tags:");
			tags.forEach((tag) => {
				console.log(`   • ${tag.name} (${tag.color}) - ${tag.description}`);
			});
		}
	} catch (error) {
		console.error("❌ Unexpected error:", error.message);
	}
}

checkContentTags();
