import { useState, useCallback } from 'react';
import { groqService } from '../services/groqService';
import { AIResponse, AIFeedback, AIGeneratedQuestion, PracticeSentence } from '../config/aiConfig';

interface UseAIHelperReturn {
  // State
  isLoading: boolean;
  error: string | null;
  rateLimitStatus: any;
  
  // Functions
  generatePracticeSentences: (vocabulary: string[], userLevel?: string, count?: number) => Promise<AIResponse<string[]>>;
  provideFeedback: (userAnswer: string, correctAnswer: string, context?: string) => Promise<AIResponse<AIFeedback>>;
  generateHint: (question: string, correctAnswer: string, difficulty?: 'easy' | 'medium' | 'hard') => Promise<AIResponse<string>>;
  explainGrammar: (rule: string, example?: string, userLevel?: string) => Promise<AIResponse<string>>;
  generateQuestions: (topic: string, questionType?: 'multiple_choice' | 'fill_blank' | 'translation', difficulty?: string, count?: number) => Promise<AIResponse<AIGeneratedQuestion[]>>;
  clearError: () => void;
  checkRateLimit: () => any;
}

export const useAIHelper = (): UseAIHelperReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkRateLimit = useCallback(() => {
    const status = groqService.getRateLimitStatus();
    setRateLimitStatus(status);
    return status;
  }, []);

  const handleAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<AIResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiCall();
      const rateStatus = groqService.getRateLimitStatus();
      setRateLimitStatus(rateStatus);
      
      return {
        success: true,
        data,
        rateLimitStatus: rateStatus.minute,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('AI Helper Error:', err);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePracticeSentences = useCallback(async (
    vocabulary: string[],
    userLevel: string = 'beginner',
    count: number = 5
  ): Promise<AIResponse<string[]>> => {
    return handleAPICall(() => groqService.generatePracticeSentences(vocabulary, userLevel, count));
  }, [handleAPICall]);

  const provideFeedback = useCallback(async (
    userAnswer: string,
    correctAnswer: string,
    context: string = ''
  ): Promise<AIResponse<AIFeedback>> => {
    return handleAPICall(() => groqService.provideFeedback(userAnswer, correctAnswer, context));
  }, [handleAPICall]);

  const generateHint = useCallback(async (
    question: string,
    correctAnswer: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<AIResponse<string>> => {
    return handleAPICall(() => groqService.generateHint(question, correctAnswer, difficulty));
  }, [handleAPICall]);

  const explainGrammar = useCallback(async (
    rule: string,
    example: string = '',
    userLevel: string = 'beginner'
  ): Promise<AIResponse<string>> => {
    return handleAPICall(() => groqService.explainGrammar(rule, example, userLevel));
  }, [handleAPICall]);

  const generateQuestions = useCallback(async (
    topic: string,
    questionType: 'multiple_choice' | 'fill_blank' | 'translation' = 'multiple_choice',
    difficulty: string = 'beginner',
    count: number = 3
  ): Promise<AIResponse<AIGeneratedQuestion[]>> => {
    return handleAPICall(() => groqService.generateQuestions(topic, questionType, difficulty, count));
  }, [handleAPICall]);

  return {
    isLoading,
    error,
    rateLimitStatus,
    generatePracticeSentences,
    provideFeedback,
    generateHint,
    explainGrammar,
    generateQuestions,
    clearError,
    checkRateLimit,
  };
};

// Utility hook for simple AI-powered feedback
export const useAIFeedback = () => {
  const { provideFeedback, isLoading, error } = useAIHelper();

  const getFeedback = useCallback(async (
    userAnswer: string,
    correctAnswer: string,
    context?: string
  ) => {
    const result = await provideFeedback(userAnswer, correctAnswer, context);
    return result.data;
  }, [provideFeedback]);

  return {
    getFeedback,
    isLoading,
    error,
  };
};

// Utility hook for generating practice content
export const useAIPractice = () => {
  const { generatePracticeSentences, generateQuestions, isLoading, error } = useAIHelper();

  const generatePracticeContent = useCallback(async (
    vocabulary: string[],
    userLevel: string = 'beginner'
  ) => {
    const sentences = await generatePracticeSentences(vocabulary, userLevel, 3);
    const questions = await generateQuestions(
      `Practice with: ${vocabulary.join(', ')}`,
      'multiple_choice',
      userLevel,
      2
    );

    return {
      sentences: sentences.data || [],
      questions: questions.data || [],
    };
  }, [generatePracticeSentences, generateQuestions]);

  return {
    generatePracticeContent,
    isLoading,
    error,
  };
};
