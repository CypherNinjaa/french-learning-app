// Local Test Service - Fully offline test system
// No database dependencies, all data stored locally

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestQuestion, TestAttempt, LessonTest } from '../types/LearningTypes';

import { LearningService } from './LearningService';


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
    LESSON_PROGRESS: 'lesson_progress',
    TEST_ATTEMPTS: 'test_attempts',
    UNLOCKED_LESSONS: 'unlocked_lessons',
  };

  // ============================================================================
  // LESSON ACCESS MANAGEMENT
  // ============================================================================

  /**
   * Check if a lesson is unlocked locally
   */
  static async isLessonUnlocked(userId: string, lessonId: number): Promise<boolean> {
    try {
      const progressData = await this.getLessonProgress(userId, lessonId);
      
      // First lesson is always unlocked
      if (progressData.lessonId === 1) {
        return true;
      }
      
      // Check if the lesson was unlocked (has unlockedAt timestamp)
      return !!progressData.unlockedAt;

    } catch (error) {
      console.error('Error checking lesson unlock status:', error);
      return false;
    }
  }

  /**
   * Unlock the next lesson locally
   */
  static async unlockNextLesson(userId: string, currentLessonId: number): Promise<void> {
    try {
      const nextLessonId = currentLessonId + 1;
      
      // Get current progress
      const allProgress = await this.getAllLessonProgress(userId);
      
      // Update next lesson as unlocked
      allProgress[nextLessonId] = {

        userId,
        lessonId: nextLessonId,
        bookId: 1, // Default book ID
        status: 'not_started',
        testPassed: false,
        bestScore: 0,
        totalAttempts: 0,
        unlockedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),

      };

      await this.saveAllLessonProgress(userId, allProgress);
      console.log(`Locally unlocked lesson ${nextLessonId} for user ${userId}`);
      
      // Optional: Sync to database in background (non-blocking)
      this.syncProgressToDatabase(userId, nextLessonId).catch(error => {
        console.warn('Background sync failed:', error);
      });
      
    } catch (error) {
      console.error('Error unlocking next lesson locally:', error);
    }
  }

  /**
   * Initialize first lesson access
   */
  static async initializeFirstLesson(userId: string, bookId: number): Promise<void> {
    try {
      const allProgress = await this.getAllLessonProgress(userId);
      
      // Unlock first lesson
      allProgress[1] = {

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

      await this.saveAllLessonProgress(userId, allProgress);
      console.log(`Initialized first lesson access for user ${userId}`);
      
    } catch (error) {
      console.error('Error initializing first lesson:', error);
    }
  }

  // ============================================================================
  // TEST MANAGEMENT
  // ============================================================================

  /**
   * Start a test locally - no database calls
   */
  static async startTest(
    userId: string, 
    lessonId: number, 
    testId: number, 
    questions: TestQuestion[]
  ): Promise<LocalTestAttempt> {
    try {
      // Get attempt number
      const attempts = await this.getTestAttempts(userId, testId);
      const attemptNumber = attempts.length + 1;
      
      const testAttempt: LocalTestAttempt = {
        id: `${userId}-${testId}-${Date.now()}`,
        userId,
        lessonId,
        testId,

        attemptNumber,
        answers: [],
        score: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        passed: false,
        startedAt: new Date().toISOString(),

      };

      // Save attempt
      await this.saveTestAttempt(testAttempt);
      
      console.log(`Started test locally: ${testAttempt.id}`);
      return testAttempt;
      
    } catch (error) {
      console.error('Error starting test locally:', error);
      throw error;
    }
  }

  /**
   * Submit test and calculate results locally
   */
  static async submitTest(
    attemptId: string,
    answers: { questionId: number; answer: string; timeSpent: number }[]
  ): Promise<{ 
    score: number; 
    passed: boolean; 
    nextLessonUnlocked: boolean;
    attempt: LocalTestAttempt;
  }> {
    try {
      // Get the test attempt
      const attempt = await this.getTestAttempt(attemptId);
      if (!attempt) {
        throw new Error('Test attempt not found');
      }


      // Get questions from the learning service for scoring
      const testsResponse = await LearningService.getLessonTests(attempt.lessonId);
      if (!testsResponse.success || !testsResponse.data || testsResponse.data.length === 0) {
        throw new Error('Test questions not found');
      }
      
      const test = testsResponse.data.find(t => t.id === attempt.testId);
      if (!test || !test.questions) {
        throw new Error('Test questions not found');
      }

      // Process answers to match LocalTestAnswer format
      const processedAnswers: LocalTestAnswer[] = answers.map(answer => {
        const question = test.questions!.find((q: any) => q.id === answer.questionId);
        const isCorrect = question ? question.correct_answer === answer.answer : false;
        
        return {
          questionId: answer.questionId,
          userAnswer: answer.answer,
          correctAnswer: question?.correct_answer || '',
          isCorrect,
          timeTakenSeconds: answer.timeSpent,
        };
      });

      // Calculate score locally
      const { score, passed } = this.calculateScore(test.questions, answers);
      
      // Update attempt
      attempt.answers = processedAnswers;
      attempt.score = score;
      attempt.correctAnswers = processedAnswers.filter(a => a.isCorrect).length;
      attempt.passed = passed;
      attempt.completedAt = new Date().toISOString();
      attempt.timeTakenMinutes = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 60000);

      
      // Save updated attempt
      await this.saveTestAttempt(attempt);
      
      // Update lesson progress
      const progressUpdated = await this.updateLessonProgress(
        attempt.userId, 
        attempt.lessonId, 
        score, 
        passed
      );

      let nextLessonUnlocked = false;
      
      // If test passed, unlock next lesson
      if (passed) {
        await this.unlockNextLesson(attempt.userId, attempt.lessonId);
        nextLessonUnlocked = true;
      }

      console.log(`Test submitted locally: Score ${score}%, Passed: ${passed}`);
      
      return {
        score,
        passed,
        nextLessonUnlocked,
        attempt,
      };
      
    } catch (error) {
      console.error('Error submitting test locally:', error);
      throw error;
    }
  }

  /**
   * Calculate test score locally
   */
  private static calculateScore(
    questions: TestQuestion[], 
    answers: { questionId: number; answer: string; timeSpent: number }[]
  ): { score: number; passed: boolean } {
    let correctAnswers = 0;
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && question.correct_answer === answer.answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70; // Default passing score
    
    return { score, passed };
  }

  // ============================================================================
  // STORAGE MANAGEMENT
  // ============================================================================

  private static async getLessonProgress(userId: string, lessonId: number): Promise<LocalLessonProgress> {
    const allProgress = await this.getAllLessonProgress(userId);
    
    return allProgress[lessonId] || {

      userId,
      lessonId,
      bookId: 0, // Default value, would need to be set properly
      status: lessonId === 1 ? 'not_started' : 'not_started', // First lesson available
      testPassed: false,
      bestScore: 0,
      totalAttempts: 0,
      unlockedAt: lessonId === 1 ? new Date().toISOString() : '',
      lastAccessedAt: new Date().toISOString(),

    };
  }

  private static async getAllLessonProgress(userId: string): Promise<Record<number, LocalLessonProgress>> {
    try {
      const key = `${this.STORAGE_KEYS.LESSON_PROGRESS}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return {};
    }
  }

  private static async saveAllLessonProgress(userId: string, progress: Record<number, LocalLessonProgress>): Promise<void> {
    try {
      const key = `${this.STORAGE_KEYS.LESSON_PROGRESS}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  }

  private static async updateLessonProgress(
    userId: string, 
    lessonId: number, 
    score: number, 
    passed: boolean
  ): Promise<void> {
    try {
      const allProgress = await this.getAllLessonProgress(userId);
      const current = allProgress[lessonId] || {

        userId,
        lessonId,
        bookId: 0, // We'll need to get this from the lesson
        status: 'not_started' as const,
        testPassed: false,
        bestScore: 0,
        totalAttempts: 0,
        unlockedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      };

      // Update progress
      current.status = passed ? 'completed' : 'in_progress';
      current.testPassed = passed;
      current.bestScore = Math.max(current.bestScore, score);
      current.totalAttempts += 1;
      current.lastAccessedAt = new Date().toISOString();


      allProgress[lessonId] = current;
      await this.saveAllLessonProgress(userId, allProgress);
      
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  }

  private static async getTestAttempt(attemptId: string): Promise<LocalTestAttempt | null> {
    try {
      const key = `${this.STORAGE_KEYS.TEST_ATTEMPTS}_${attemptId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting test attempt:', error);
      return null;
    }
  }

  private static async saveTestAttempt(attempt: LocalTestAttempt): Promise<void> {
    try {
      const key = `${this.STORAGE_KEYS.TEST_ATTEMPTS}_${attempt.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(attempt));
    } catch (error) {
      console.error('Error saving test attempt:', error);
    }
  }

  private static async getTestAttempts(userId: string, testId: number): Promise<LocalTestAttempt[]> {
    try {
      // This would require indexing, for now return empty array
      // In production, you might want to maintain an index
      return [];
    } catch (error) {
      console.error('Error getting test attempts:', error);
      return [];
    }
  }

  // ============================================================================
  // OPTIONAL DATABASE SYNC
  // ============================================================================

  /**
   * Sync progress to database in background (optional, non-blocking)
   */
  private static async syncProgressToDatabase(userId: string, lessonId: number): Promise<void> {
    try {
      // Optional: Update database in background
      await LearningService.updateLessonProgress(userId, {
        lesson_id: lessonId,
        action: 'start_lesson',
        data: {},
      });
    } catch (error) {
      console.warn('Background database sync failed:', error);
      // Don't throw - this is optional
    }
  }

  /**
   * Get lesson unlock status for UI
   */
  static async getLessonUnlockStatus(userId: string, lessonIds: number[]): Promise<Record<number, boolean>> {
    const result: Record<number, boolean> = {};
    
    for (const lessonId of lessonIds) {
      result[lessonId] = await this.isLessonUnlocked(userId, lessonId);
    }
    
    return result;
  }

  /**
   * Clear all local data (for logout/reset)
   */
  static async clearUserData(userId: string): Promise<void> {
    try {
      const keys = [
        `${this.STORAGE_KEYS.LESSON_PROGRESS}_${userId}`,
        // Note: Test attempts use individual keys, might need cleanup strategy
      ];
      
      await AsyncStorage.multiRemove(keys);
      console.log('Cleared local user data');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}
