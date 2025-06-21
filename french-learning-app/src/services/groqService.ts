// Rate limiting configuration
interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
}

interface RequestTracker {
  minute: { count: number; resetTime: number };
  hour: { count: number; resetTime: number };
  day: { count: number; resetTime: number };
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class GroqAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1';
  private rateLimits: RateLimitConfig;
  private requestTracker: RequestTracker;
  private availableModels: string[] = [
    'llama3-8b-8192',
    'llama3-70b-8192', 
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ];
  private currentModelIndex: number = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    // Rate limiting configuration
    this.rateLimits = {
      maxRequestsPerMinute: 30,
      maxRequestsPerHour: 500,
      maxRequestsPerDay: 2000,
    };

    this.requestTracker = {
      minute: { count: 0, resetTime: Date.now() + 60000 },
      hour: { count: 0, resetTime: Date.now() + 3600000 },
      day: { count: 0, resetTime: Date.now() + 86400000 },
    };
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Reset counters if time windows have passed
    if (now > this.requestTracker.minute.resetTime) {
      this.requestTracker.minute.count = 0;
      this.requestTracker.minute.resetTime = now + 60000;
    }

    if (now > this.requestTracker.hour.resetTime) {
      this.requestTracker.hour.count = 0;
      this.requestTracker.hour.resetTime = now + 3600000;
    }

    if (now > this.requestTracker.day.resetTime) {
      this.requestTracker.day.count = 0;
      this.requestTracker.day.resetTime = now + 86400000;
    }

    // Check if we're within limits
    return (
      this.requestTracker.minute.count < this.rateLimits.maxRequestsPerMinute &&
      this.requestTracker.hour.count < this.rateLimits.maxRequestsPerHour &&
      this.requestTracker.day.count < this.rateLimits.maxRequestsPerDay
    );
  }

  /**
   * Increment request counters
   */
  private incrementRequestCount(): void {
    this.requestTracker.minute.count++;
    this.requestTracker.hour.count++;
    this.requestTracker.day.count++;
  }
  /**
   * Make a request to Groq API with rate limiting and error handling
   */
  private async makeRequest(messages: GroqMessage[], options: any = {}): Promise<GroqResponse> {
    // Check rate limits
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      this.incrementRequestCount();      const requestBody = {
        messages,
        model: 'llama3-8b-8192', // Using Llama3 model (currently supported)
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: options.topP || 0.9,
        ...options,
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API Error Response:', errorData);
        
        // Handle specific error status codes
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API configuration.');
        } else if (response.status === 500) {
          throw new Error('Groq service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`API request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Groq API Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('Rate limit') || error.message.includes('API')) {
        throw error; // Re-throw API-specific errors
      } else {
        throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }
  /**
   * Generate practice sentences based on vocabulary and user level
   */
  async generatePracticeSentences(
    vocabulary: string[], 
    userLevel: string = 'beginner',
    count: number = 5
  ): Promise<string[]> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a French language teacher. Generate ${count} practice sentences in French using the provided vocabulary words. The sentences should be appropriate for a ${userLevel} level student. Make them engaging and practical for daily use. Return only the French sentences, one per line.`,
      },
      {
        role: 'user',
        content: `Create practice sentences using these French words: ${vocabulary.join(', ')}`,
      },
    ];    try {
      const response = await this.makeRequest(messages, { temperature: 0.8 });
      const content = response.choices[0]?.message?.content || '';
      const sentences = content.split('\n').filter((sentence: string) => sentence.trim().length > 0);
      
      // Fallback if no sentences generated
      if (sentences.length === 0) {
        return [
          'Bonjour, comment allez-vous?',
          'Je voudrais apprendre le français.',
          'Où est la bibliothèque?',
          'Combien ça coûte?',
          'Merci beaucoup!'
        ].slice(0, count);
      }
      
      return sentences.slice(0, count);
    } catch (error) {
      console.error('Error generating practice sentences:', error);
      // Return fallback sentences instead of throwing error
      return [
        'Bonjour, comment allez-vous?',
        'Je voudrais apprendre le français.',
        'Où est la bibliothèque?',
        'Combien ça coûte?',
        'Merci beaucoup!'
      ].slice(0, count);
    }
  }
  /**
   * Provide intelligent feedback on user answers
   */
  async provideFeedback(
    userAnswer: string,
    correctAnswer: string,
    context: string = ''
  ): Promise<{
    isCorrect: boolean;
    feedback: string;
    explanation: string;
    encouragement: string;
  }> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a helpful French language teacher. Compare the user's answer with the correct answer and provide constructive feedback. Be encouraging and explain why the correct answer is right. Always respond in JSON format with the fields: isCorrect (boolean), feedback (string), explanation (string), encouragement (string).`,
      },
      {
        role: 'user',
        content: `Context: ${context}\nUser answer: "${userAnswer}"\nCorrect answer: "${correctAnswer}"\n\nPlease provide feedback in JSON format.`,
      },
    ];    try {
      const response = await this.makeRequest(messages, { temperature: 0.3 });
      const content = response.choices[0]?.message?.content || '';
      
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        return {
          isCorrect,
          feedback: isCorrect ? 'Correct!' : 'Not quite right.',
          explanation: content || 'Please try again.',
          encouragement: isCorrect ? 'Great job!' : 'Keep practicing!',
        };
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
      // Return fallback feedback instead of throwing error
      const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      return {
        isCorrect,
        feedback: isCorrect ? 'Correct!' : 'Not quite right.',
        explanation: isCorrect ? 'Your answer is correct!' : `The correct answer is: ${correctAnswer}`,
        encouragement: isCorrect ? 'Excellent work!' : 'Keep trying, you\'re learning!',
      };
    }
  }
  /**
   * Generate contextual hints for difficult questions
   */
  async generateHint(
    question: string,
    correctAnswer: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<string> {
    const hintLevel = difficulty === 'easy' ? 'very subtle' : difficulty === 'medium' ? 'moderate' : 'clear';
    
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a French language teacher. Generate a ${hintLevel} hint for the given question without revealing the answer directly. The hint should guide the student toward the correct answer.`,
      },
      {
        role: 'user',
        content: `Question: ${question}\nCorrect answer: ${correctAnswer}\n\nGenerate a helpful hint.`,
      },
    ];    try {
      const response = await this.makeRequest(messages, { temperature: 0.6 });
      return response.choices[0]?.message?.content || 'Try thinking about the context of the question.';
    } catch (error) {
      console.error('Error generating hint:', error);
      // Return fallback hint instead of throwing error
      return 'Try thinking about the context and grammar rules. Look for clues in the question.';
    }
  }
  /**
   * Generate explanation for grammar rules
   */
  async explainGrammar(
    rule: string,
    example: string = '',
    userLevel: string = 'beginner'
  ): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a French grammar expert. Explain the given grammar rule in simple terms appropriate for a ${userLevel} level student. Use clear examples and make it easy to understand.`,
      },
      {
        role: 'user',
        content: `Explain this French grammar rule: ${rule}${example ? `\nExample: ${example}` : ''}`,
      },
    ];    try {
      const response = await this.makeRequest(messages, { temperature: 0.4 });
      return response.choices[0]?.message?.content || 'Grammar explanation unavailable.';
    } catch (error) {
      console.error('Error explaining grammar:', error);
      // Return fallback explanation instead of throwing error
      return `Grammar rule: ${rule}. This is a fundamental concept in French. Practice with examples to better understand this rule.`;
    }
  }  /**
   * Generate dynamic questions based on content
   */
  async generateQuestions(
    topic: string,
    questionType: 'multiple_choice' | 'fill_blank' | 'translation' = 'multiple_choice',
    difficulty: string = 'beginner',
    count: number = 3
  ): Promise<any[]> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a French language teacher. Generate ${count} ${questionType} questions about ${topic} for ${difficulty} level students. 

IMPORTANT: You must respond with ONLY a valid JSON array. Do not include any explanatory text, introductions, or formatting. 

For multiple_choice questions, each question must have this exact structure:
{
  "question": "Question text here?",
  "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
  "correct_answer": "A. Option 1",
  "explanation": "Brief explanation of why this is correct"
}

Return an array of ${count} questions in this exact JSON format.`,
      },
      {
        role: 'user',
        content: `Generate ${count} ${questionType} questions about French ${topic}. Respond with ONLY the JSON array, no other text.`,
      },
    ];

    try {
      const response = await this.makeRequest(messages, { temperature: 0.3 });
      let content = response.choices[0]?.message?.content || '';
      
      // Clean the response - remove any markdown formatting or extra text
      content = content.trim();
      
      // Remove markdown code blocks if present
      if (content.startsWith('```json')) {
        content = content.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      try {
        const questions = JSON.parse(content);
        if (Array.isArray(questions) && questions.length > 0) {
          // Validate question structure
          const validQuestions = questions.filter(q => 
            q.question && q.options && Array.isArray(q.options) && q.correct_answer
          );
          
          if (validQuestions.length > 0) {
            return validQuestions.slice(0, count);
          }
        }
        
        // If parsing succeeded but structure is invalid, fall back
        throw new Error('Invalid question structure');
        
      } catch (parseError) {
        console.error('Failed to parse generated questions:', parseError);
        console.error('Raw content:', content);
        
        // Return well-structured fallback questions based on topic
        return this.getFallbackQuestions(topic, count);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getFallbackQuestions(topic, count);
    }
  }

  /**
   * Make a custom AI request for conversational features
   */
  async makeCustomRequest(
    messages: GroqMessage[],
    options: any = {}
  ): Promise<string> {
    try {
      const response = await this.makeRequest(messages, options);
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error making custom AI request:', error);
      throw error;
    }
  }

  /**
   * Get fallback questions when AI generation fails
   */
  private getFallbackQuestions(topic: string, count: number): any[] {
    const fallbackQuestions: { [key: string]: any[] } = {
      'greetings': [
        {
          question: "What is the French word for 'Hello'?",
          options: ["A. Bonjour", "B. Bonsoir", "C. Salut", "D. Au revoir"],
          correct_answer: "A. Bonjour",
          explanation: "Bonjour is the most common way to say hello in French."
        },
        {
          question: "How do you say 'Good evening' in French?",
          options: ["A. Bonjour", "B. Bonsoir", "C. Bonne nuit", "D. Salut"],
          correct_answer: "B. Bonsoir",
          explanation: "Bonsoir is used to greet someone in the evening."
        }
      ],
      'numbers': [
        {
          question: "What is 'five' in French?",
          options: ["A. Quatre", "B. Cinq", "C. Six", "D. Sept"],
          correct_answer: "B. Cinq",
          explanation: "Cinq is the French word for the number five."
        },
        {
          question: "How do you say 'ten' in French?",
          options: ["A. Neuf", "B. Huit", "C. Dix", "D. Onze"],
          correct_answer: "C. Dix",
          explanation: "Dix is the French word for the number ten."
        }
      ],
      'colors': [
        {
          question: "What is 'red' in French?",
          options: ["A. Bleu", "B. Vert", "C. Rouge", "D. Jaune"],
          correct_answer: "C. Rouge",
          explanation: "Rouge is the French word for the color red."
        },
        {
          question: "How do you say 'blue' in French?",
          options: ["A. Bleu", "B. Blanc", "C. Noir", "D. Gris"],
          correct_answer: "A. Bleu",
          explanation: "Bleu is the French word for the color blue."
        }
      ]
    };

    // Get questions for the topic, or use generic ones
    const topicQuestions = fallbackQuestions[topic.toLowerCase()] || [
      {
        question: `What is a common French word related to ${topic}?`,
        options: ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
        correct_answer: "A. Option A",
        explanation: `This is a basic question about ${topic} in French.`
      }
    ];

    // Return requested number of questions
    return topicQuestions.slice(0, count);
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): {
    minute: { remaining: number; resetTime: number };
    hour: { remaining: number; resetTime: number };
    day: { remaining: number; resetTime: number };
  } {
    return {
      minute: {
        remaining: Math.max(0, this.rateLimits.maxRequestsPerMinute - this.requestTracker.minute.count),
        resetTime: this.requestTracker.minute.resetTime,
      },
      hour: {
        remaining: Math.max(0, this.rateLimits.maxRequestsPerHour - this.requestTracker.hour.count),
        resetTime: this.requestTracker.hour.resetTime,
      },
      day: {
        remaining: Math.max(0, this.rateLimits.maxRequestsPerDay - this.requestTracker.day.count),
        resetTime: this.requestTracker.day.resetTime,
      },    };
  }
}

// Create and export singleton instance
const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not defined in environment variables');
}

const groqService = new GroqAIService(groqApiKey);

export { groqService, GroqAIService };
export type { RateLimitConfig, RequestTracker };
