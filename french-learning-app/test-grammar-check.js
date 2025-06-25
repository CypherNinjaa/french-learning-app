// Test grammar checking specifically
const GROQ_API_KEY = "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";

async function testGrammarCheck() {
	try {
		console.log("Testing Grammar Check...");

		const systemPrompt = `You are a French grammar expert. Your task is to analyze French text for grammar errors and return ONLY a JSON array.

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, greetings, or conversation.

User level: beginner

Return ONLY a JSON array of errors. Each error should have:
- originalText: the incorrect text
- correctedText: the correct version
- explanation: simple explanation of the error
- errorType: type of error (conjugation, agreement, syntax, etc.)
- position: {start: number, end: number} - character positions in the original text

If no errors are found, return exactly: []

REMEMBER: Return ONLY the JSON array, nothing else.`;

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
						{ role: "system", content: systemPrompt },
						{
							role: "user",
							content:
								'Analyze this French text for grammar errors and return only JSON: "hello how are you"',
						},
					],
					model: "llama3-8b-8192",
					temperature: 0.1,
					max_tokens: 500,
				}),
			}
		);

		if (!response.ok) {
			const errorData = await response.text();
			console.error("❌ API Error:", response.status, errorData);
		} else {
			const data = await response.json();
			const content = data.choices[0]?.message?.content;
			console.log("✅ Grammar Check Response:");
			console.log(content);

			// Try to parse as JSON
			try {
				const parsed = JSON.parse(content);
				console.log("✅ Successfully parsed as JSON:", parsed);
			} catch (parseError) {
				console.log("❌ Failed to parse as JSON:", parseError.message);
				console.log("Raw content:", content);
			}
		}
	} catch (error) {
		console.error("❌ Network Error:", error.message);
	}
}

testGrammarCheck();
