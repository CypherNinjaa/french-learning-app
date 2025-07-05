// Simple AI functionality test
const testAI = async () => {
	console.log("=== AI Functionality Test ===");

	try {
		// Test basic configuration
		const groqApiKey =
			"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";

		if (!groqApiKey) {
			throw new Error("API Key not found");
		}

		console.log("✓ API Key configured");

		// Test with simple fetch request
		const response = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${groqApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "mixtral-8x7b-32768",
					messages: [
						{
							role: "user",
							content: 'Say "API connection successful" in French',
						},
					],
					temperature: 0.7,
					max_tokens: 100,
				}),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`HTTP error! status: ${response.status}, message: ${errorText}`
			);
		}

		const data = await response.json();
		console.log("✓ API Response:", data.choices[0].message.content);
		console.log("✓ AI functionality is working correctly");
	} catch (error) {
		console.log("✗ AI Test Failed:", error.message);
	}
};

testAI();
