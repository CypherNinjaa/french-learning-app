// AI Configuration
import { getConfig } from './productionConfig';

const config = getConfig();

export const AI_CONFIG = {
  GROQ_API_KEY: config.groq.apiKey,
  
  // Rate limiting settings
  RATE_LIMITS: {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 500,
    maxRequestsPerDay: 2000,
  },
  
  // Default AI model settings
  MODEL_CONFIG: {
    model: 'llama3-8b-8192',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
  },
  
  // Feature flags
  FEATURES: {
    enableAIHints: true,
    enableAIFeedback: true,
    enableDynamicQuestions: true,
    enablePracticeSentences: true,
    enableGrammarExplanations: true,
  },
};

// AI Service Status
export type AIServiceStatus = 'available' | 'rate_limited' | 'error' | 'offline';

// Response types
export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitStatus?: {
    remaining: number;
    resetTime: number;
  };
}

// Question types for AI generation
export interface AIGeneratedQuestion {
  id?: string;
  question: string;
  question_type: 'multiple_choice' | 'fill_blank' | 'translation';
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty_level: string;
  topic: string;
  points: number;
}

// Feedback types
export interface AIFeedback {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  encouragement: string;
  score?: number;
}

// Practice sentence generation
export interface PracticeSentenceRequest {
  vocabulary: string[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  topic?: string;
}

export interface PracticeSentence {
  french: string;
  english?: string;
  difficulty: string;
  vocabulary_used: string[];
}
