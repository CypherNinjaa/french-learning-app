// Check what's actually in the database
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const serviceRoleKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabase() {
	console.log("🔍 Checking database schema...\n");

	try {
		// Check available tables in all schemas
		const { data: tables, error } = await supabase.rpc("sql", {
			query: `
          SELECT schemaname, tablename 
          FROM pg_tables 
          WHERE tablename IN ('user_progress', 'points_history', 'daily_stats', 'profiles', 'lessons')
          ORDER BY schemaname, tablename;
        `,
		});

		if (error) {
			console.error("❌ Error checking tables:", error.message);
		} else {
			console.log("📋 Available tables:");
			tables.forEach((table) => {
				console.log(`   ${table.schemaname}.${table.tablename}`);
			});
		}

		// Check profiles table columns
		const { data: columns, error: colError } = await supabase.rpc("sql", {
			query: `
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND table_schema = 'public'
          ORDER BY column_name;
        `,
		});

		if (colError) {
			console.error("❌ Error checking columns:", colError.message);
		} else {
			console.log("\n📊 Profiles table columns:");
			columns.forEach((col) => {
				console.log(`   ${col.column_name}: ${col.data_type}`);
			});
		}
	} catch (error) {
		console.error("❌ Database check failed:", error.message);
	}
}

checkDatabase();
