// Activity Tracking Hook - Centralized activity completion with gamification integration
// Provides a consistent interface for tracking all learning activities

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExerciseCompletionService } from '../services/exerciseCompletionService';
import { useGamification } from './useGamification';

interface ActivityState {
  loading: boolean;
  error: string | null;
  lastResult: any | null;
  showPointsAnimation: boolean;
  pointsData: {
    points: number;
    achievements: string[];
    streakMultiplier: number;
    perfectScoreBonus: number;
    encouragementMessage: string;
  } | null;
}

export const useActivityTracking = () => {
  const { user } = useAuth();
  const { refreshAll } = useGamification();
  
  const [state, setState] = useState<ActivityState>({
    loading: false,
    error: null,
    lastResult: null,
    showPointsAnimation: false,
    pointsData: null,
  });

  const showPointsFeedback = useCallback((result: any) => {
    setState(prev => ({
      ...prev,
      showPointsAnimation: true,
      pointsData: {
        points: result.pointsEarned || 0,
        achievements: result.achievementsUnlocked?.map((a: any) => a.name || a.title) || [],
        streakMultiplier: result.streakMultiplier || 1,
        perfectScoreBonus: result.perfectScoreBonus || 0,
        encouragementMessage: result.feedback || 'Great job!'
      }
    }));
  }, []);

  const hidePointsFeedback = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPointsAnimation: false,
      pointsData: null
    }));
  }, []);

  /**
   * Complete lesson with full gamification integration
   */
  const completeLesson = useCallback(async (
    lessonId: number,
    score: number,
    timeSpent: number,
    sectionScores: number[] = []
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completeActivity(user.id, {
        activityId: lessonId,
        activityType: 'cultural_lesson', // Lessons are treated as cultural lessons in gamification
        score,
        timeSpent,
        perfectScore: score >= 100,
        firstAttempt: true,
        difficulty: 'beginner', // Could be determined from lesson data
        metadata: {
          sectionScores,
          lessonId
        }
      });

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      
      // Refresh gamification data
      await refreshAll();
      
      // Show points feedback
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete lesson'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete vocabulary quiz
   */
  const completeVocabularyQuiz = useCallback(async (
    quizId: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    consecutiveCorrect: number = 0
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completeVocabularyQuiz(
        user.id,
        quizId,
        correctAnswers,
        totalQuestions,
        timeSpent,
        consecutiveCorrect
      );

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      await refreshAll();
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete quiz'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete grammar exercise
   */
  const completeGrammarExercise = useCallback(async (
    exerciseId: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    isFirstAttempt: boolean = true,
    hintsUsed: number = 0
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completeGrammarExercise(
        user.id,
        exerciseId,
        correctAnswers,
        totalQuestions,
        timeSpent,
        isFirstAttempt,
        hintsUsed
      );

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      await refreshAll();
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete exercise'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete pronunciation practice
   */
  const completePronunciationPractice = useCallback(async (
    exerciseId: number,
    accuracyScore: number,
    timeSpent: number,
    attemptsCount: number = 1
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completePronunciationPractice(
        user.id,
        exerciseId,
        accuracyScore,
        timeSpent,
        attemptsCount
      );

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      await refreshAll();
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete pronunciation practice'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete conversation practice
   */
  const completeConversationPractice = useCallback(async (
    sessionId: number,
    exchangeCount: number,
    timeSpent: number,
    qualityScore: number = 80
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completeConversationPractice(
        user.id,
        sessionId,
        exchangeCount,
        timeSpent,
        qualityScore
      );

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      await refreshAll();
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete conversation practice'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete daily challenge
   */
  const completeDailyChallenge = useCallback(async (
    challengeId: number,
    score: number,
    timeSpent: number,
    hasStreak: boolean = false
  ) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ExerciseCompletionService.completeDailyChallenge(
        user.id,
        challengeId,
        score,
        timeSpent,
        hasStreak
      );

      setState(prev => ({ ...prev, loading: false, lastResult: result }));
      await refreshAll();
      showPointsFeedback(result);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete daily challenge'
      }));
      throw error;
    }
  }, [user, refreshAll, showPointsFeedback]);

  /**
   * Complete individual question (for real-time feedback)
   */
  const completeQuestion = useCallback(async (
    questionId: number,
    questionType: string,
    isCorrect: boolean,
    timeSpent: number,
    hintsUsed: number = 0,
    attempts: number = 1
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Don't show loading for individual questions to keep UI responsive
      const result = await ExerciseCompletionService.completeActivity(user.id, {
        activityId: questionId,
        activityType: 'question_completion',
        score: isCorrect ? 100 : 0,
        timeSpent,
        perfectScore: isCorrect,
        firstAttempt: attempts === 1,
        hintsUsed,
        metadata: {
          questionType,
          attempts
        }
      });

      // Only show feedback for correct answers to avoid overwhelming the user
      if (isCorrect && result.pointsEarned > 0) {
        showPointsFeedback(result);
      }
      
      return result;
    } catch (error) {
      console.error('Error completing question:', error);
      // Don't throw for individual questions to avoid disrupting the flow
      return null;
    }
  }, [user, showPointsFeedback]);

  return {
    // State
    loading: state.loading,
    error: state.error,
    lastResult: state.lastResult,
    showPointsAnimation: state.showPointsAnimation,
    pointsData: state.pointsData,

    // Activity completion methods
    completeLesson,
    completeVocabularyQuiz,
    completeGrammarExercise,
    completePronunciationPractice,
    completeConversationPractice,
    completeDailyChallenge,
    completeQuestion,

    // UI control
    hidePointsFeedback,
    
    // Utility
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, [])
  };
};
