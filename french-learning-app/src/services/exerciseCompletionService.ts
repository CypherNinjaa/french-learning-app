// Exercise Completion Service - Centralized activity completion with gamification
// Handles completion of various learning activities with proper point calculation

import { gamificationService } from './gamificationService';

export interface ActivityCompletionData {
  activityId: number;
  activityType: 'vocabulary_quiz' | 'grammar_exercise' | 'pronunciation_practice' | 'conversation_practice' | 'cultural_lesson' | 'question_completion';
  score: number;
  totalQuestions?: number;
  timeSpent: number;
  perfectScore?: boolean;
  firstAttempt?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  accuracy?: number;
  hintsUsed?: number;
  consecutiveCorrect?: number;
  metadata?: Record<string, any>;
}

export interface ActivityResult {
  pointsEarned: number;
  achievementsUnlocked: any[];
  milestonesReached: any[];
  newLevel?: string;
  streakUpdated?: boolean;
  feedback?: string;
}

class ExerciseCompletionService {
  /**
   * Complete any learning activity with comprehensive gamification integration
   */
  static async completeActivity(
    userId: string,
    activityData: ActivityCompletionData
  ): Promise<ActivityResult> {
    try {
      // Calculate base points based on activity type and performance
      const basePoints = this.calculateBasePoints(activityData);
      
      // Prepare activity data for gamification service
      const gamificationData = {
        activityId: activityData.activityId,
        score: activityData.score,
        timeSpent: activityData.timeSpent,
        isPerfectScore: activityData.perfectScore || (activityData.score >= 100),
        accuracy: activityData.accuracy || activityData.score,
        difficulty: activityData.difficulty || 'beginner',
        isFirstAttempt: activityData.firstAttempt !== false,
        hintsUsed: activityData.hintsUsed || 0,
        consecutiveCorrect: activityData.consecutiveCorrect || 0,
        totalQuestions: activityData.totalQuestions || 1,
        ...activityData.metadata
      };

      // Calculate points with gamification bonuses
      const pointsResult = await gamificationService.calculatePointsEarned(
        userId,
        activityData.activityType,
        basePoints,
        gamificationData
      );

      // Check and unlock achievements
      const achievements = await gamificationService.checkAndUnlockAchievements(userId, {
        activity: activityData.activityType,
        ...gamificationData,
        pointsEarned: pointsResult.total_points
      });

      // Update user streak
      const streakResult = await gamificationService.updateUserStreak(userId);

      // Check milestones
      const milestones = await gamificationService.checkMilestones(userId);

      return {
        pointsEarned: pointsResult.total_points,
        achievementsUnlocked: pointsResult.achievements_unlocked || [],
        milestonesReached: pointsResult.milestones_reached || [],
        streakUpdated: !!streakResult,
        feedback: this.generateFeedbackMessage(pointsResult, achievements)
      };

    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    }
  }

  /**
   * Complete vocabulary quiz with specific logic
   */
  static async completeVocabularyQuiz(
    userId: string,
    quizId: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    consecutiveCorrect: number = 0
  ): Promise<ActivityResult> {
    const score = (correctAnswers / totalQuestions) * 100;
    
    return this.completeActivity(userId, {
      activityId: quizId,
      activityType: 'vocabulary_quiz',
      score,
      totalQuestions,
      timeSpent,
      perfectScore: score >= 100,
      consecutiveCorrect,
      accuracy: score,
      metadata: {
        correctAnswers,
        questionsAnswered: totalQuestions
      }
    });
  }

  /**
   * Complete grammar exercise with specific logic
   */
  static async completeGrammarExercise(
    userId: string,
    exerciseId: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    isFirstAttempt: boolean = true,
    hintsUsed: number = 0
  ): Promise<ActivityResult> {
    const score = (correctAnswers / totalQuestions) * 100;
    
    return this.completeActivity(userId, {
      activityId: exerciseId,
      activityType: 'grammar_exercise',
      score,
      totalQuestions,
      timeSpent,
      perfectScore: score >= 100,
      firstAttempt: isFirstAttempt,
      hintsUsed,
      accuracy: score,
      metadata: {
        correctAnswers,
        questionsAnswered: totalQuestions
      }
    });
  }

  /**
   * Complete pronunciation practice
   */
  static async completePronunciationPractice(
    userId: string,
    exerciseId: number,
    accuracyScore: number,
    timeSpent: number,
    attemptsCount: number = 1
  ): Promise<ActivityResult> {
    return this.completeActivity(userId, {
      activityId: exerciseId,
      activityType: 'pronunciation_practice',
      score: accuracyScore,
      timeSpent,
      perfectScore: accuracyScore >= 95,
      accuracy: accuracyScore,
      firstAttempt: attemptsCount === 1,
      metadata: {
        attempts: attemptsCount,
        pronunciationAccuracy: accuracyScore
      }
    });
  }

  /**
   * Complete conversation practice
   */
  static async completeConversationPractice(
    userId: string,
    sessionId: number,
    exchangeCount: number,
    timeSpent: number,
    qualityScore: number = 80
  ): Promise<ActivityResult> {
    return this.completeActivity(userId, {
      activityId: sessionId,
      activityType: 'conversation_practice',
      score: qualityScore,
      timeSpent,
      perfectScore: qualityScore >= 90,
      accuracy: qualityScore,
      metadata: {
        exchangeCount,
        conversationQuality: qualityScore
      }
    });
  }

  /**
   * Calculate base points for activity based on type and performance
   */
  private static calculateBasePoints(activityData: ActivityCompletionData): number {
    const baseRates = {
      vocabulary_quiz: 10, // 10 per correct answer as per gamification rules
      grammar_exercise: 15, // 15 per correct answer
      pronunciation_practice: 20, // 20 base points
      conversation_practice: 75, // 75 base points
      cultural_lesson: 60, // 60 base points
      question_completion: 5 // 5 points per question
    };

    const baseRate = baseRates[activityData.activityType] || 5;
    
    // For quiz-type activities, multiply by correct answers or performance percentage
    if (activityData.totalQuestions && activityData.totalQuestions > 1) {
      const correctCount = Math.round((activityData.score / 100) * activityData.totalQuestions);
      return baseRate * correctCount;
    }
    
    return baseRate;
  }

  /**
   * Generate encouraging feedback message based on performance
   */
  private static generateFeedbackMessage(pointsResult: any, achievements: any[]): string {
    let message = `Great job! You earned ${pointsResult.total_points} points!`;
    
    if (pointsResult.streak_multiplier > 1) {
      message += ` Your ${Math.round((pointsResult.streak_multiplier - 1) * 100)}% streak bonus is impressive!`;
    }
    
    if (pointsResult.perfect_score_bonus > 0) {
      message += ` Perfect score bonus: +${pointsResult.perfect_score_bonus} points!`;
    }
    
    if (achievements.length > 0) {
      message += ` 🏆 New achievement${achievements.length > 1 ? 's' : ''} unlocked!`;
    }
    
    return message;
  }

  /**
   * Complete daily challenge with specific logic
   */
  static async completeDailyChallenge(
    userId: string,
    challengeId: number,
    score: number,
    timeSpent: number,
    hasStreak: boolean = false
  ): Promise<ActivityResult> {
    // Daily challenges use the gamification service directly
    try {
      const pointsResult = await gamificationService.calculatePointsEarned(
        userId,
        'daily_challenge',
        100, // Base points for daily challenge
        {
          challengeId,
          score,
          timeSpent,
          hasStreak,
          isPerfectScore: score >= 100
        }
      );

      return {
        pointsEarned: pointsResult.total_points,
        achievementsUnlocked: pointsResult.achievements_unlocked || [],
        milestonesReached: pointsResult.milestones_reached || [],
        feedback: `Daily challenge complete! +${pointsResult.total_points} points!`
      };
    } catch (error) {
      console.error('Error completing daily challenge:', error);
      throw error;
    }
  }
}

export { ExerciseCompletionService };
