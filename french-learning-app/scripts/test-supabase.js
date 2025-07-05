// Test Supabase connection
const testSupabase = async () => {
	console.log("=== Supabase Connection Test ===");

	try {
		const supabaseUrl = "https://ozcdaztxzadwdytuzfay.supabase.co";
		const supabaseKey =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk";

		console.log("URL:", supabaseUrl);
		console.log("Key:", supabaseKey ? "✓ Set" : "✗ Missing");

		// Test basic connection
		const response = await fetch(`${supabaseUrl}/rest/v1/`, {
			method: "GET",
			headers: {
				apikey: supabaseKey,
				Authorization: `Bearer ${supabaseKey}`,
				"Content-Type": "application/json",
			},
		});

		console.log("Response status:", response.status);
		console.log(
			"Response headers:",
			Object.fromEntries(response.headers.entries())
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.log("Error response:", errorText);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		console.log("✓ Supabase connection successful");

		// Test auth endpoint
		const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
			method: "GET",
			headers: {
				apikey: supabaseKey,
				Authorization: `Bearer ${supabaseKey}`,
				"Content-Type": "application/json",
			},
		});

		console.log("Auth endpoint status:", authResponse.status);

		if (authResponse.ok) {
			const authData = await authResponse.json();
			console.log("✓ Auth endpoint accessible");
			console.log("Auth settings:", authData);
		} else {
			console.log("✗ Auth endpoint issue");
		}
	} catch (error) {
		console.log("✗ Supabase Test Failed:", error.message);
	}
};

testSupabase();
