import { groqService } from './groqService';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  correctedVersion?: string;
  grammarErrors?: GrammarError[];
}

export interface GrammarError {
  originalText: string;
  correctedText: string;
  explanation: string;
  errorType: string;
  position: { start: number; end: number };
}

export interface ConversationContext {
  topic: string;
  userLevel: string;
  conversationHistory: ChatMessage[];
  userPerformance: {
    grammarAccuracy: number;
    vocabularyUsage: number;
    conversationFlow: number;
  };
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  expectedResponse: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hints: string[];
  alternatives: string[];
}

class ConversationalAIService {
  private conversationHistory: ChatMessage[] = [];
  private currentContext: ConversationContext | null = null;

  /**
   * Initialize a new conversation with a topic and user level
   */
  async startConversation(topic: string, userLevel: string): Promise<ConversationContext> {
    const context: ConversationContext = {
      topic,
      userLevel,
      conversationHistory: [],
      userPerformance: {
        grammarAccuracy: 0,
        vocabularyUsage: 0,
        conversationFlow: 0,
      },
    };

    this.currentContext = context;
    this.conversationHistory = [];

    // Generate an opening message from the AI
    const openingMessage = await this.generateContextualResponse('', context);
    
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      content: openingMessage,
      isUser: false,
      timestamp: new Date(),
    };

    context.conversationHistory.push(aiMessage);
    this.conversationHistory.push(aiMessage);

    return context;
  }

  /**
   * Send a message to the AI chat partner and get a response
   */
  async sendMessage(
    userMessage: string,
    context?: ConversationContext
  ): Promise<{
    aiResponse: ChatMessage;
    grammarFeedback: GrammarError[];
    updatedContext: ConversationContext;
  }> {
    const currentContext = context || this.currentContext;
    if (!currentContext) {
      throw new Error('No conversation context available. Please start a conversation first.');
    }

    // Create user message
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    // Check grammar and get corrections
    const grammarFeedback = await this.checkGrammar(userMessage, currentContext.userLevel);
    
    // Add corrected version to user message if there are corrections
    if (grammarFeedback.length > 0) {
      userChatMessage.correctedVersion = await this.generateCorrectedVersion(userMessage, grammarFeedback);
      userChatMessage.grammarErrors = grammarFeedback;
    }

    // Add user message to history
    currentContext.conversationHistory.push(userChatMessage);
    this.conversationHistory.push(userChatMessage);

    // Generate AI response
    const aiResponseContent = await this.generateContextualResponse(userMessage, currentContext);
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponseContent,
      isUser: false,
      timestamp: new Date(),
    };

    // Add AI response to history
    currentContext.conversationHistory.push(aiResponse);
    this.conversationHistory.push(aiResponse);

    // Update user performance metrics
    await this.updatePerformanceMetrics(userMessage, grammarFeedback, currentContext);

    return {
      aiResponse,
      grammarFeedback,
      updatedContext: currentContext,
    };
  }

  /**
   * Generate contextual AI response based on conversation history and user level
   */
  private async generateContextualResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<string> {
    const conversationHistory = context.conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a friendly French conversation partner helping a ${context.userLevel} level student practice French. 

Current topic: ${context.topic}
User level: ${context.userLevel}

Guidelines:
- If user level is BEGINNER: Respond primarily in English with simple French phrases. Always provide English translations in parentheses for French words.
- If user level is INTERMEDIATE: Use 50% French and 50% English. Translate complex French words and phrases.
- If user level is ADVANCED: Respond mostly in French with occasional English explanations for complex grammar concepts.
- If user explicitly asks to speak in English, respect their request regardless of level
- Keep responses appropriate for ${context.userLevel} level
- Be encouraging and supportive
- Ask follow-up questions to keep the conversation flowing
- Use vocabulary and grammar appropriate for the user's level
- If the user makes mistakes, gently guide them but don't be overly critical
- Make the conversation engaging and natural
- Vary your responses to avoid repetition

${conversationHistory ? `Recent conversation:\n${conversationHistory}` : ''}

${userMessage ? `Respond to: "${userMessage}"` : `Start a conversation about ${context.topic} with a friendly greeting and opening question.`}`;

    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage || `Let's talk about ${context.topic}` },
      ];
      
      const content = await groqService.makeCustomRequest(messages, { temperature: 0.8 });
      return content || 'Bonjour! Comment allez-vous?';
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return 'Désolé, j\'ai un petit problème technique. Pouvez-vous répéter?';
    }
  }
  /**
   * Check grammar and provide corrections
   */  async checkGrammar(text: string, userLevel: string): Promise<GrammarError[]> {
    // Check if the text is empty or too short
    if (!text || text.trim().length < 2) {
      return [];
    }

    // Always provide some form of feedback, even for non-French text
    const systemPrompt = `You are a helpful French language teacher. Your job is to analyze text and provide constructive feedback.

User level: ${userLevel}

If the text is in French:
- Check for grammar errors appropriate for ${userLevel} level
- Focus on: verb conjugation, gender agreement, sentence structure, vocabulary usage
- Return corrections as JSON array

If the text is not in French (English, etc.):
- Provide a helpful suggestion about writing in French
- Return as a single grammar error suggesting French usage

IMPORTANT: Always return a valid JSON array. Even if there are no errors, provide encouraging feedback.

JSON format:
[
  {
    "originalText": "text that needs correction",
    "correctedText": "corrected version or suggestion",
    "explanation": "explanation in French",
    "errorType": "type of error or suggestion",
    "position": {"start": 0, "end": text_length}
  }
]

If the text is perfect French, return:
[
  {
    "originalText": "${text}",
    "correctedText": "${text}",
    "explanation": "Très bien ! Votre français est correct.",
    "errorType": "encouragement",
    "position": {"start": 0, "end": ${text.length}}
  }
]

Always provide helpful, encouraging feedback.`;

    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Analyze this text: "${text}"` },
      ];

      const content = await groqService.makeCustomRequest(messages, { temperature: 0.3 });

      try {
        // Clean the response to extract JSON
        let cleanContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/```\s*/, '').replace(/\s*```$/, '');
        }

        // Try to find JSON array in the response
        const jsonMatch = cleanContent.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }

        // If the response doesn't look like JSON, create a helpful feedback based on the response
        if (!cleanContent.startsWith('[')) {
          console.log('Grammar check response is not JSON format, creating helpful feedback from text response');
          
          // Detect if it's likely English or non-French
          const commonEnglishWords = ['hello', 'hi', 'how', 'are', 'you', 'what', 'the', 'and', 'or', 'but', 'yes', 'no', 'thank', 'please'];
          const isLikelyEnglish = commonEnglishWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
          );

          if (isLikelyEnglish) {
            return [{
              originalText: text,
              correctedText: "Bonjour ! Essayez d'écrire en français.",
              explanation: "Écrivez en français pour pratiquer et recevoir des corrections grammaticales utiles.",
              errorType: "language_suggestion",
              position: { start: 0, end: text.length }
            }];
          }

          // For French text, create encouraging feedback from the AI response
          return [{
            originalText: text,
            correctedText: text,
            explanation: content.length > 200 ? content.substring(0, 200) + "..." : content,
            errorType: "ai_feedback",
            position: { start: 0, end: text.length }
          }];
        }

        const errors = JSON.parse(cleanContent);
        if (Array.isArray(errors) && errors.length > 0) {
          return errors;
        }

        // If empty array or no errors found, provide encouraging feedback
        return [{
          originalText: text,
          correctedText: text,
          explanation: "Très bien ! Votre français est correct. Continuez comme ça !",
          errorType: "encouragement",
          position: { start: 0, end: text.length }
        }];

      } catch (parseError) {
        console.error('Error parsing grammar check response:', parseError);
        console.log('Raw response content:', content);
        
        // Always provide some form of helpful feedback, even when parsing fails
        const commonEnglishWords = ['hello', 'hi', 'how', 'are', 'you', 'what', 'the', 'and', 'or', 'but'];
        const isLikelyEnglish = commonEnglishWords.some(word => 
          text.toLowerCase().includes(word.toLowerCase())
        );

        if (isLikelyEnglish) {
          return [{
            originalText: text,
            correctedText: "Bonjour ! Comment allez-vous ?",
            explanation: "Essayez d'écrire en français pour pratiquer la langue. Par exemple : 'Bonjour' au lieu de 'Hello'.",
            errorType: "language_help",
            position: { start: 0, end: text.length }
          }];
        }

        // For French text, provide general encouragement
        return [{
          originalText: text,
          correctedText: text,
          explanation: "Merci d'écrire en français ! Continuez à pratiquer pour améliorer votre niveau.",
          errorType: "practice_encouragement",
          position: { start: 0, end: text.length }
        }];
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
      
      // Always provide fallback feedback, never return empty
      return [{
        originalText: text,
        correctedText: text,
        explanation: "Continuez à pratiquer votre français ! Chaque message vous aide à progresser.",
        errorType: "system_encouragement",
        position: { start: 0, end: text.length }
      }];
    }
  }

  /**
   * Generate corrected version of user's message
   */
  private async generateCorrectedVersion(
    originalText: string,
    grammarErrors: GrammarError[]
  ): Promise<string> {
    if (grammarErrors.length === 0) {
      return originalText;
    }

    let correctedText = originalText;
    
    // Apply corrections in reverse order to maintain position indices
    const sortedErrors = grammarErrors.sort((a, b) => b.position.start - a.position.start);
    
    for (const error of sortedErrors) {
      const before = correctedText.substring(0, error.position.start);
      const after = correctedText.substring(error.position.end);
      correctedText = before + error.correctedText + after;
    }

    return correctedText;
  }

  /**
   * Generate adaptive questions based on user performance
   */
  async generateAdaptiveQuestions(
    topic: string,
    userLevel: string,
    performanceMetrics: ConversationContext['userPerformance']
  ): Promise<AdaptiveQuestion[]> {
    // Adjust difficulty based on performance
    let targetDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    const averagePerformance = (
      performanceMetrics.grammarAccuracy +
      performanceMetrics.vocabularyUsage +
      performanceMetrics.conversationFlow
    ) / 3;

    if (averagePerformance < 60) {
      targetDifficulty = 'easy';
    } else if (averagePerformance > 80) {
      targetDifficulty = 'hard';
    }

    const systemPrompt = `You are a French language teacher creating adaptive questions for a ${userLevel} student.

Topic: ${topic}
Target difficulty: ${targetDifficulty}
Student performance: ${averagePerformance.toFixed(1)}%

Create 3 questions that are:
- Appropriate for ${userLevel} level
- Focused on ${topic}
- At ${targetDifficulty} difficulty
- Designed to improve weak areas

Return as JSON array with this structure:
[
  {
    "id": "unique_id",
    "question": "Question in French",
    "expectedResponse": "Expected answer in French",
    "difficulty": "${targetDifficulty}",
    "topic": "${topic}",
    "hints": ["hint1", "hint2"],
    "alternatives": ["alternative1", "alternative2"]
  }
]`;

    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Generate 3 adaptive questions for ${topic}` },
      ];      const content = await groqService.makeCustomRequest(messages, { temperature: 0.7 });

      try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
        }

        const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }

        const questions = JSON.parse(cleanContent);
        return Array.isArray(questions) ? questions : this.getFallbackAdaptiveQuestions(topic, targetDifficulty);
      } catch (parseError) {
        console.error('Error parsing adaptive questions:', parseError);
        return this.getFallbackAdaptiveQuestions(topic, targetDifficulty);
      }
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      return this.getFallbackAdaptiveQuestions(topic, targetDifficulty);
    }
  }

  /**
   * Get fallback adaptive questions
   */
  private getFallbackAdaptiveQuestions(topic: string, difficulty: 'easy' | 'medium' | 'hard'): AdaptiveQuestion[] {
    const baseQuestions = [
      {
        id: 'fallback_1',
        question: `Parlez-moi de ${topic}`,
        expectedResponse: `J'aime ${topic}`,
        difficulty,
        topic,
        hints: ['Utilisez le verbe "aimer"', 'Commencez par "J\'aime" ou "Je n\'aime pas"'],
        alternatives: [`${topic} me plaît`, `J'adore ${topic}`],
      },
      {
        id: 'fallback_2',
        question: `Que pensez-vous de ${topic}?`,
        expectedResponse: `Je pense que ${topic} est intéressant`,
        difficulty,
        topic,
        hints: ['Utilisez "Je pense que..."', 'Donnez votre opinion'],
        alternatives: [`${topic} est formidable`, `C'est très bien`],
      },
      {
        id: 'fallback_3',
        question: `Pouvez-vous décrire ${topic}?`,
        expectedResponse: `${topic} est très important`,
        difficulty,
        topic,
        hints: ['Utilisez des adjectifs', 'Décrivez avec des détails'],
        alternatives: [`C'est magnifique`, `${topic} est excellent`],
      },
    ];

    return baseQuestions;
  }

  /**
   * Update user performance metrics based on conversation
   */
  private async updatePerformanceMetrics(
    userMessage: string,
    grammarErrors: GrammarError[],
    context: ConversationContext
  ): Promise<void> {
    // Grammar accuracy: fewer errors = higher score
    const grammarScore = Math.max(0, 100 - (grammarErrors.length * 20));
    
    // Vocabulary usage: analyze vocabulary complexity
    const vocabularyScore = await this.analyzeVocabularyUsage(userMessage, context.userLevel);
      // Conversation flow: based on message length and appropriateness
    const flowScore = await this.analyzeConversationFlow(userMessage, context);

    // Update running averages
    const previousMessages = context.conversationHistory.filter(msg => msg.isUser).length;
    const weight = 1 / Math.max(1, previousMessages);

    const currentGrammarAccuracy = context.userPerformance.grammarAccuracy || 0;
    const currentVocabularyUsage = context.userPerformance.vocabularyUsage || 0;
    const currentConversationFlow = context.userPerformance.conversationFlow || 0;

    context.userPerformance.grammarAccuracy = 
      (currentGrammarAccuracy * (1 - weight)) + (grammarScore * weight);
    
    context.userPerformance.vocabularyUsage = 
      (currentVocabularyUsage * (1 - weight)) + (vocabularyScore * weight);
    
    context.userPerformance.conversationFlow = 
      (currentConversationFlow * (1 - weight)) + (flowScore * weight);
  }

  /**
   * Analyze vocabulary usage complexity
   */
  private async analyzeVocabularyUsage(message: string, userLevel: string): Promise<number> {
    // Simple heuristic: longer messages with varied vocabulary get higher scores
    const words = message.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyRatio = uniqueWords.size / words.length;
    
    // Base score on message length and vocabulary diversity
    const lengthScore = Math.min(100, words.length * 10);
    const diversityScore = vocabularyRatio * 100;
    
    return (lengthScore + diversityScore) / 2;
  }

  /**
   * Analyze conversation flow quality
   */
  private analyzeConversationFlow(message: string, context: ConversationContext): Promise<number> {
    // Simple heuristic: appropriate length and question engagement
    const wordCount = message.split(/\s+/).length;
    
    let score = 50; // Base score
    
    // Good length (3-20 words)
    if (wordCount >= 3 && wordCount <= 20) {
      score += 30;
    } else if (wordCount > 20) {
      score += 20;
    }
    
    // Contains question or engaging elements
    if (message.includes('?') || message.includes('comment') || message.includes('pourquoi')) {
      score += 20;
    }
    
    return Promise.resolve(Math.min(100, score));
  }

  /**
   * Get conversation summary and insights
   */
  async getConversationSummary(context: ConversationContext): Promise<{
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  }> {
    const userMessages = context.conversationHistory.filter(msg => msg.isUser);
    const totalErrors = userMessages.reduce((sum, msg) => sum + (msg.grammarErrors?.length || 0), 0);
    
    return {
      summary: `Conversation about ${context.topic} with ${userMessages.length} messages.`,
      strengths: [
        context.userPerformance.grammarAccuracy > 70 ? 'Good grammar accuracy' : null,
        context.userPerformance.vocabularyUsage > 70 ? 'Rich vocabulary usage' : null,
        context.userPerformance.conversationFlow > 70 ? 'Natural conversation flow' : null,
      ].filter(Boolean) as string[],
      areasForImprovement: [
        context.userPerformance.grammarAccuracy < 50 ? 'Grammar accuracy needs work' : null,
        context.userPerformance.vocabularyUsage < 50 ? 'Expand vocabulary usage' : null,
        context.userPerformance.conversationFlow < 50 ? 'Improve conversation engagement' : null,
      ].filter(Boolean) as string[],
      recommendations: [
        'Continue practicing conversations',
        'Focus on grammar exercises',
        'Expand your vocabulary with new topics',
        'Try more complex sentence structures',
      ],
    };
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
    this.currentContext = null;
  }

  /**
   * Get current conversation context
   */
  getCurrentContext(): ConversationContext | null {
    return this.currentContext;
  }
}

// Create and export singleton instance
export const conversationalAIService = new ConversationalAIService();
