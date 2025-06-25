// Simple test script to validate Groq API key
const GROQ_API_KEY = "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";

async function testGroqAPI() {
	try {
		console.log("Testing Groq API...");

		const response = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${GROQ_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{ role: "system", content: "You are a helpful assistant." },
						{ role: "user", content: "Say hello" },
					],
					model: "llama3-8b-8192",
					temperature: 0.7,
					max_tokens: 100,
				}),
			}
		);

		if (!response.ok) {
			const errorData = await response.text();
			console.error("❌ API Error:", response.status, errorData);
		} else {
			const data = await response.json();
			console.log("✅ API Test Successful!");
			console.log("Response:", data.choices[0]?.message?.content);
		}
	} catch (error) {
		console.error("❌ Network Error:", error.message);
	}
}

testGroqAPI();
