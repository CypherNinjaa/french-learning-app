#!/usr/bin/env node

// Script to fix lesson content structure
// This ensures lessons have proper sections for the DynamicLessonRenderer

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Supabase configuration
const supabaseUrl =
	process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

console.log("🔧 Fixing lesson content structure...");

// Read and execute the SQL fix
const sqlPath = path.join(
	__dirname,
	"..",
	"supabase",
	"fix_lesson_content.sql"
);

if (!fs.existsSync(sqlPath)) {
	console.error("❌ SQL fix file not found:", sqlPath);
	process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, "utf8");

// For now, just show the SQL commands that need to be run
console.log(
	"\n📝 The following SQL commands should be run in your Supabase SQL editor:"
);
console.log("=".repeat(60));
console.log(sqlContent);
console.log("=".repeat(60));

console.log("\n🔍 Or run this command in your terminal:");
console.log("supabase db sql < supabase/fix_lesson_content.sql");

console.log(
	"\n✅ After running the SQL, your lessons will have proper section structure!"
);
console.log(
	'🎯 The DynamicLessonRenderer will then show actual content instead of "No Content".'
);
