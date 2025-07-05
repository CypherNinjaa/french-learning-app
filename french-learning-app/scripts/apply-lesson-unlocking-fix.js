// Script to apply lesson unlocking fixes
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Path to the SQL file
const sqlFilePath = path.join(__dirname, "fix-lesson-unlocking.sql");

console.log("Running lesson unlocking fix...");

try {
	// Read the environment variables for database connection
	require("dotenv").config();

	const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE } =
		process.env;

	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
		console.error(
			"Missing Supabase environment variables. Please check your .env file."
		);
		process.exit(1);
	}

	// Extract database information from the Supabase URL
	// Format: https://[project-ref].supabase.co
	const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

	// Execute the SQL using Supabase CLI
	console.log("Applying database fixes...");
	const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

	// Write SQL to a temporary file
	const tempSqlFile = path.join(__dirname, "temp-fix.sql");
	fs.writeFileSync(tempSqlFile, sqlContent);

	// Run SQL against Supabase using their CLI
	execSync(
		`npx supabase db push --project-ref ${projectRef} --db-url "postgres://postgres:${SUPABASE_SERVICE_ROLE}@db.${projectRef}.supabase.co:5432/postgres" ${tempSqlFile}`,
		{ stdio: "inherit" }
	);

	// Clean up temp file
	fs.unlinkSync(tempSqlFile);

	console.log("Lesson unlocking fix completed successfully!");
} catch (error) {
	console.error("Error applying lesson unlocking fix:", error);
	process.exit(1);
}
