// Local Test Service - Fully offline test system
// No database dependencies, all data stored locally

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestQuestion, TestAttempt, LessonTest } from '../types/LearningTypes';

export interface LocalTestAttempt {
  id: string;
  userId: string;
  lessonId: number;
  testId: number;
  attemptNumber: number;
  answers: LocalTestAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeTakenMinutes?: number;
}

export interface LocalTestAnswer {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
}

export interface LocalLessonProgress {
  userId: string;
  lessonId: number;
  bookId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  testPassed: boolean;
  bestScore: number;
  totalAttempts: number;
  unlockedAt: string;
  lastAccessedAt: string;
}

export class LocalTestService {
  private static readonly STORAGE_KEYS = {
    TEST_ATTEMPTS: 'local_test_attempts',
    LESSON_PROGRESS: 'local_lesson_progress',
    UNLOCKED_LESSONS: 'unlocked_lessons',
  };

  // ============================================================================
  // TEST ATTEMPT MANAGEMENT
  // ============================================================================

  /**
   * Start a new test attempt locally
   */
  static async startTest(
    userId: string, 
    lessonId: number, 
    testId: number
  ): Promise<LocalTestAttempt> {
    try {
      // Get existing attempts for this user and test
      const attempts = await this.getUserTestAttempts(userId, testId);
      const attemptNumber = attempts.length + 1;

      const newAttempt: LocalTestAttempt = {
        id: `${userId}_${testId}_${Date.now()}`,
        userId,
        lessonId,
        testId,
        attemptNumber,
        answers: [],
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        passed: false,
        startedAt: new Date().toISOString(),
      };

      // Save attempt locally
      await this.saveTestAttempt(newAttempt);

      console.log('Local test attempt created:', newAttempt.id);
      return newAttempt;
    } catch (error) {
      console.error('Error starting local test:', error);
      throw new Error('Failed to start test locally');
    }
  }

  /**
   * Submit test answers and calculate results locally
   */
  static async submitTest(
    attemptId: string,
    answers: { questionId: number; userAnswer: string; timeTakenSeconds?: number }[],
    questions: TestQuestion[],
    passingPercentage: number,
    timeTakenMinutes: number
  ): Promise<LocalTestAttempt> {
    try {
      // Get the attempt
      const attempt = await this.getTestAttempt(attemptId);
      if (!attempt) {
        throw new Error('Test attempt not found');
      }

      // Calculate score locally
      const processedAnswers: LocalTestAnswer[] = [];
      let correctCount = 0;

      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        const isCorrect = question.correct_answer === answer.userAnswer;
        if (isCorrect) correctCount++;

        processedAnswers.push({
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
          timeTakenSeconds: answer.timeTakenSeconds,
        });
      }

      const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      const passed = score >= passingPercentage;

      // Update attempt with results
      const completedAttempt: LocalTestAttempt = {
        ...attempt,
        answers: processedAnswers,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        passed,
        completedAt: new Date().toISOString(),
        timeTakenMinutes,
      };

      // Save completed attempt
      await this.saveTestAttempt(completedAttempt);

      // Update lesson progress
      await this.updateLessonProgress(attempt.userId, attempt.lessonId, score, passed);

      // If passed, unlock next lesson
      if (passed) {
        await this.unlockNextLesson(attempt.userId, attempt.lessonId);
      }

      console.log(`Local test completed: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);
      return completedAttempt;
    } catch (error) {
      console.error('Error submitting local test:', error);
      throw new Error('Failed to submit test locally');
    }
  }

  // ============================================================================
  // LESSON PROGRESS MANAGEMENT
  // ============================================================================

  /**
   * Update lesson progress locally
   */
  static async updateLessonProgress(
    userId: string,
    lessonId: number,
    score: number,
    passed: boolean
  ): Promise<void> {
    try {
      const progressData = await this.getLessonProgress(userId);
      const existingProgress = progressData.find(p => p.lessonId === lessonId);

      const updatedProgress: LocalLessonProgress = {
        userId,
        lessonId,
        bookId: existingProgress?.bookId || 1, // Default to book 1 if not found
        status: passed ? 'completed' : 'in_progress',
        testPassed: passed,
        bestScore: existingProgress ? Math.max(existingProgress.bestScore, score) : score,
        totalAttempts: existingProgress ? existingProgress.totalAttempts + 1 : 1,
        unlockedAt: existingProgress?.unlockedAt || new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      };

      // Update progress array
      const newProgressData = progressData.filter(p => p.lessonId !== lessonId);
      newProgressData.push(updatedProgress);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LESSON_PROGRESS,
        JSON.stringify(newProgressData)
      );

      console.log(`Local lesson progress updated: lesson ${lessonId}, score ${score}%`);
    } catch (error) {
      console.error('Error updating local lesson progress:', error);
    }
  }

  /**
   * Unlock next lesson locally
   */
  static async unlockNextLesson(userId: string, currentLessonId: number): Promise<void> {
    try {
      // For now, assume lessons are numbered sequentially
      const nextLessonId = currentLessonId + 1;
      
      const progressData = await this.getLessonProgress(userId);
      const nextLessonExists = progressData.some(p => p.lessonId === nextLessonId);

      if (!nextLessonExists) {
        const nextLessonProgress: LocalLessonProgress = {
          userId,
          lessonId: nextLessonId,
          bookId: 1, // Default to book 1
          status: 'not_started',
          testPassed: false,
          bestScore: 0,
          totalAttempts: 0,
          unlockedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        };

        progressData.push(nextLessonProgress);
        
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.LESSON_PROGRESS,
          JSON.stringify(progressData)
        );

        console.log(`Local lesson unlocked: lesson ${nextLessonId}`);
      }
    } catch (error) {
      console.error('Error unlocking next lesson locally:', error);
    }
  }

  /**
   * Check if lesson is unlocked locally
   */
  static async isLessonUnlocked(userId: string, lessonId: number): Promise<boolean> {
    try {
      // First lesson is always unlocked
      if (lessonId === 1) return true;

      const progressData = await this.getLessonProgress(userId);
      return progressData.some(p => p.lessonId === lessonId);
    } catch (error) {
      console.error('Error checking lesson unlock status:', error);
      return lessonId === 1; // Default to first lesson only
    }
  }

  /**
   * Initialize first lesson access
   */
  static async initializeFirstLesson(userId: string, bookId: number = 1): Promise<void> {
    try {
      const progressData = await this.getLessonProgress(userId);
      const firstLessonExists = progressData.some(p => p.lessonId === 1);

      if (!firstLessonExists) {
        const firstLessonProgress: LocalLessonProgress = {
          userId,
          lessonId: 1,
          bookId,
          status: 'not_started',
          testPassed: false,
          bestScore: 0,
          totalAttempts: 0,
          unlockedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        };

        progressData.push(firstLessonProgress);
        
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.LESSON_PROGRESS,
          JSON.stringify(progressData)
        );

        console.log('First lesson initialized locally');
      }
    } catch (error) {
      console.error('Error initializing first lesson:', error);
    }
  }

  // ============================================================================
  // DATA RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get user's lesson progress
   */
  static async getLessonProgress(userId: string): Promise<LocalLessonProgress[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.LESSON_PROGRESS);
      const allProgress: LocalLessonProgress[] = data ? JSON.parse(data) : [];
      return allProgress.filter(p => p.userId === userId);
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return [];
    }
  }

  /**
   * Get specific lesson progress
   */
  static async getLessonProgressById(userId: string, lessonId: number): Promise<LocalLessonProgress | null> {
    try {
      const progressData = await this.getLessonProgress(userId);
      return progressData.find(p => p.lessonId === lessonId) || null;
    } catch (error) {
      console.error('Error getting lesson progress by ID:', error);
      return null;
    }
  }

  /**
   * Get test attempt by ID
   */
  static async getTestAttempt(attemptId: string): Promise<LocalTestAttempt | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TEST_ATTEMPTS);
      const attempts: LocalTestAttempt[] = data ? JSON.parse(data) : [];
      return attempts.find(a => a.id === attemptId) || null;
    } catch (error) {
      console.error('Error getting test attempt:', error);
      return null;
    }
  }

  /**
   * Get user's test attempts for a specific test
   */
  static async getUserTestAttempts(userId: string, testId: number): Promise<LocalTestAttempt[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TEST_ATTEMPTS);
      const allAttempts: LocalTestAttempt[] = data ? JSON.parse(data) : [];
      return allAttempts.filter(a => a.userId === userId && a.testId === testId);
    } catch (error) {
      console.error('Error getting user test attempts:', error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Save test attempt to local storage
   */
  private static async saveTestAttempt(attempt: LocalTestAttempt): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TEST_ATTEMPTS);
      const attempts: LocalTestAttempt[] = data ? JSON.parse(data) : [];
      
      // Remove existing attempt with same ID (update)
      const filteredAttempts = attempts.filter(a => a.id !== attempt.id);
      filteredAttempts.push(attempt);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.TEST_ATTEMPTS,
        JSON.stringify(filteredAttempts)
      );
    } catch (error) {
      console.error('Error saving test attempt:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear all local test data (for debugging/reset)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.TEST_ATTEMPTS,
        this.STORAGE_KEYS.LESSON_PROGRESS,
        this.STORAGE_KEYS.UNLOCKED_LESSONS,
      ]);
      console.log('All local test data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  /**
   * Get statistics for debugging
   */
  static async getDebugStats(): Promise<{
    totalAttempts: number;
    totalProgress: number;
    unlockedLessons: number;
  }> {
    try {
      const attempts = await AsyncStorage.getItem(this.STORAGE_KEYS.TEST_ATTEMPTS);
      const progress = await AsyncStorage.getItem(this.STORAGE_KEYS.LESSON_PROGRESS);
      
      const attemptCount = attempts ? JSON.parse(attempts).length : 0;
      const progressCount = progress ? JSON.parse(progress).length : 0;
      
      return {
        totalAttempts: attemptCount,
        totalProgress: progressCount,
        unlockedLessons: progressCount,
      };
    } catch (error) {
      console.error('Error getting debug stats:', error);
      return { totalAttempts: 0, totalProgress: 0, unlockedLessons: 0 };
    }
  }
}
