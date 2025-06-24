const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Initialize Supabase client
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
	console.log("🔍 Checking database schema...");

	try {
		// Check modules table structure
		const { data: modules, error: modulesError } = await supabase
			.from("modules")
			.select("*")
			.limit(1);

		if (modulesError) {
			console.log("❌ Modules table error:", modulesError.message);
		} else {
			console.log("✅ Modules table exists");
		}

		// Check if pronunciation_words table exists
		const { data: pronWords, error: pronError } = await supabase
			.from("pronunciation_words")
			.select("*")
			.limit(1);

		if (pronError) {
			console.log("❌ Pronunciation words table error:", pronError.message);
		} else {
			console.log("✅ Pronunciation words table exists");
		}

		// Try to get table schema info
		const { data: schemaInfo, error: schemaError } = await supabase.rpc(
			"get_table_columns",
			{ table_name: "modules" }
		);

		if (schemaError) {
			console.log("❌ Schema info error:", schemaError.message);
		} else {
			console.log("📋 Modules table schema:", schemaInfo);
		}
	} catch (error) {
		console.error("❌ Schema check failed:", error);
	}
}

async function uploadPronunciationWords() {
	console.log("📤 Uploading pronunciation words...");

	const pronunciationWords = [
		{
			word: "bonjour",
			phonetic: "/bon-ZHOOR/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "au revoir",
			phonetic: "/oh ruh-VWAR/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "s'il vous plaît",
			phonetic: "/seel voo PLAY/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "merci",
			phonetic: "/mer-SEE/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "excusez-moi",
			phonetic: "/ehk-skew-zay MWAH/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "pardon",
			phonetic: "/par-DOHN/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "oui",
			phonetic: "/WEE/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "non",
			phonetic: "/NOHN/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "peut-être",
			phonetic: "/puh-TETR/",
			audio_url: null,
			difficulty_level: "intermediate",
		},
		{
			word: "combien",
			phonetic: "/kom-bee-AHN/",
			audio_url: null,
			difficulty_level: "intermediate",
		},
		{
			word: "où",
			phonetic: "/OO/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "quand",
			phonetic: "/KAHN/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "comment",
			phonetic: "/ko-MAHN/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "pourquoi",
			phonetic: "/poor-KWAH/",
			audio_url: null,
			difficulty_level: "intermediate",
		},
		{
			word: "je ne sais pas",
			phonetic: "/zhuh nuh say PAH/",
			audio_url: null,
			difficulty_level: "intermediate",
		},
		{
			word: "ça va",
			phonetic: "/sah VAH/",
			audio_url: null,
			difficulty_level: "beginner",
		},
		{
			word: "bonne nuit",
			phonetic: "/bun NWEE/",
			audio_url: null,
			difficulty_level: "beginner",
		},
	];

	try {
		// First, clear existing pronunciation words
		const { error: deleteError } = await supabase
			.from("pronunciation_words")
			.delete()
			.neq("id", 0); // Delete all records

		if (deleteError) {
			console.log(
				"⚠️  Delete error (might be expected if table is empty):",
				deleteError.message
			);
		} else {
			console.log("✅ Cleared existing pronunciation words");
		}

		// Insert new pronunciation words
		const { data, error } = await supabase
			.from("pronunciation_words")
			.insert(pronunciationWords);

		if (error) {
			console.error("❌ Upload error:", error);
		} else {
			console.log(
				"✅ Successfully uploaded",
				pronunciationWords.length,
				"pronunciation words"
			);
		}

		// Verify the upload
		const { data: verifyData, error: verifyError } = await supabase
			.from("pronunciation_words")
			.select("*");

		if (verifyError) {
			console.error("❌ Verification error:", verifyError);
		} else {
			console.log(
				"✅ Verification: Found",
				verifyData.length,
				"pronunciation words in database"
			);
			console.log(
				"📋 Sample words:",
				verifyData.slice(0, 3).map((w) => w.word)
			);
		}
	} catch (error) {
		console.error("❌ Upload failed:", error);
	}
}

async function main() {
	await checkSchema();
	console.log("---");
	await uploadPronunciationWords();
}

main().catch(console.error);
