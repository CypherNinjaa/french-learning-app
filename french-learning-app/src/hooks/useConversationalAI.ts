import { useState, useCallback } from 'react';
import { 
  conversationalAIService, 
  ConversationContext, 
  ChatMessage, 
  GrammarError,
  AdaptiveQuestion 
} from '../services/conversationalAIService';

interface UseConversationalAIReturn {
  // State
  isLoading: boolean;
  error: string | null;
  currentContext: ConversationContext | null;
  
  // Conversation functions
  startConversation: (topic: string, userLevel: string) => Promise<ConversationContext>;
  sendMessage: (message: string) => Promise<{
    aiResponse: ChatMessage;
    grammarFeedback: GrammarError[];
    updatedContext: ConversationContext;
  }>;
  
  // Grammar and feedback functions
  checkGrammar: (text: string, userLevel: string) => Promise<GrammarError[]>;
  generateAdaptiveQuestions: (
    topic: string,
    userLevel: string,
    performanceMetrics: ConversationContext['userPerformance']
  ) => Promise<AdaptiveQuestion[]>;
  
  // Utility functions
  getConversationSummary: () => Promise<{
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  }>;
  clearConversation: () => void;
  clearError: () => void;
}

export const useConversationalAI = (): UseConversationalAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<ConversationContext | null>(null);

  const handleError = useCallback((err: any) => {
    const errorMessage = err.message || 'An unexpected error occurred';
    setError(errorMessage);
    console.error('Conversational AI Error:', err);
  }, []);

  const startConversation = useCallback(async (topic: string, userLevel: string): Promise<ConversationContext> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const context = await conversationalAIService.startConversation(topic, userLevel);
      setCurrentContext(context);
      return context;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const sendMessage = useCallback(async (message: string) => {
    if (!currentContext) {
      throw new Error('No active conversation. Please start a conversation first.');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await conversationalAIService.sendMessage(message, currentContext);
      setCurrentContext(result.updatedContext);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentContext, handleError]);

  const checkGrammar = useCallback(async (text: string, userLevel: string): Promise<GrammarError[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await conversationalAIService.checkGrammar(text, userLevel);
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateAdaptiveQuestions = useCallback(async (
    topic: string,
    userLevel: string,
    performanceMetrics: ConversationContext['userPerformance']
  ): Promise<AdaptiveQuestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await conversationalAIService.generateAdaptiveQuestions(topic, userLevel, performanceMetrics);
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getConversationSummary = useCallback(async () => {
    if (!currentContext) {
      throw new Error('No active conversation to summarize.');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      return await conversationalAIService.getConversationSummary(currentContext);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentContext, handleError]);

  const clearConversation = useCallback(() => {
    conversationalAIService.clearConversationHistory();
    setCurrentContext(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    currentContext,
    startConversation,
    sendMessage,
    checkGrammar,
    generateAdaptiveQuestions,
    getConversationSummary,
    clearConversation,
    clearError,
  };
};

// Utility hook for grammar checking
export const useGrammarChecker = () => {
  const { checkGrammar, isLoading, error, clearError } = useConversationalAI();

  return {
    checkGrammar,
    isLoading,
    error,
    clearError,
  };
};
