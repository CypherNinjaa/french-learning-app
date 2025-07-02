// Test configuration and API connectivity
import { getConfig } from "../src/config/productionConfig";
import { supabaseConfig } from "../src/constants/config";
import { AI_CONFIG } from "../src/config/aiConfig";

console.log("=== Configuration Test ===");

// Test configuration loading
const config = getConfig();
console.log("✓ Configuration loaded successfully");

// Test Supabase config
console.log("\n=== Supabase Configuration ===");
console.log("URL:", supabaseConfig.url ? "✓ Set" : "✗ Missing");
console.log("Anon Key:", supabaseConfig.anonKey ? "✓ Set" : "✗ Missing");

// Test AI config
console.log("\n=== AI Configuration ===");
console.log("Groq API Key:", AI_CONFIG.GROQ_API_KEY ? "✓ Set" : "✗ Missing");

// Test Groq service
console.log("\n=== Testing Groq Service ===");
try {
	const { groqService } = require("../src/services/groqService");
	console.log("✓ Groq service loaded successfully");

	// Test a simple request
	groqService
		.makeCustomRequest(
			[{ role: "user", content: 'Say "API test successful" in French' }],
			{ temperature: 0.5 }
		)
		.then((response) => {
			console.log("✓ API Test Response:", response);
		})
		.catch((error) => {
			console.log("✗ API Test Failed:", error.message);
		});
} catch (error) {
	console.log("✗ Failed to load Groq service:", error.message);
}
