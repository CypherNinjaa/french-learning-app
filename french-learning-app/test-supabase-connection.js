// Test Supabase connection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ozcdaztxzadwdytuzfay.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
	try {
		console.log("🔄 Testing Supabase connection...");

		// Test basic connection
		const { data, error } = await supabase
			.from("profiles")
			.select("count")
			.limit(1);

		if (error) {
			console.error("❌ Connection error:", error.message);
			return false;
		}

		console.log("✅ Supabase connection successful!");
		console.log("📊 Connection data:", data);
		return true;
	} catch (err) {
		console.error("❌ Network error:", err.message);
		return false;
	}
}

// Test auth specifically
async function testAuth() {
	try {
		console.log("🔄 Testing Supabase auth...");

		const { data, error } = await supabase.auth.signUp({
			email: "test@example.com",
			password: "testpassword123",
		});

		if (error) {
			console.log(
				"ℹ️ Auth test error (expected for existing user):",
				error.message
			);
		} else {
			console.log("✅ Auth connection working!");
		}
	} catch (err) {
		console.error("❌ Auth network error:", err.message);
	}
}

// Run tests
testConnection().then((success) => {
	if (success) {
		testAuth();
	}
});
