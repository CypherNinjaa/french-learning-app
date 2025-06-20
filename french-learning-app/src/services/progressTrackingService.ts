// Stage 4.3: Progress Tracking Service
// Enhanced progress tracking with analytics, insights, and learning optimization

import { supabase } from './supabase';
import { DifficultyLevel, LessonType, ProgressStatus } from '../types/LessonTypes';

// Enhanced progress tracking interfaces
export interface ProgressAnalytics {
  user_id: string;
  total_lessons_completed: number;
  total_time_spent: number; // in minutes
  average_score: number;
  current_streak: number;
  longest_streak: number;
  points_earned_today: number;
  points_earned_week: number;
  points_earned_month: number;
  lessons_completed_today: number;
  lessons_completed_week: number;
  lessons_completed_month: number;
  mastery_by_difficulty: Record<DifficultyLevel, number>;
  performance_by_type: Record<LessonType, PerformanceMetrics>;
  vocabulary_mastery: VocabularyMastery;
  grammar_mastery: GrammarMastery;
  learning_velocity: number; // lessons per day
  consistency_score: number; // 0-100
  achievement_count: number;
  last_activity: string;
}

export interface PerformanceMetrics {
  total_attempted: number;
  total_completed: number;
  average_score: number;
  average_time: number;
  completion_rate: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
}

export interface VocabularyMastery {
  total_words: number;
  mastered_words: number;
  learning_words: number;
  difficult_words: number;
  mastery_percentage: number;
  words_learned_today: number;
  words_learned_week: number;
}

export interface GrammarMastery {
  total_rules: number;
  mastered_rules: number;
  learning_rules: number;
  difficult_rules: number;
  mastery_percentage: number;
  rules_learned_today: number;
  rules_learned_week: number;
}

export interface ProgressInsight {
  type: 'achievement' | 'improvement' | 'suggestion' | 'milestone' | 'warning';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

export interface LearningGoal {
  id: string;
  user_id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  metric: 'lessons' | 'points' | 'time' | 'streak' | 'vocabulary' | 'grammar';
  deadline?: string;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
}

export class ProgressTrackingService {
  /**
   * Get comprehensive progress analytics for a user
   */
  static async getProgressAnalytics(userId: string): Promise<ProgressAnalytics | null> {
    try {
      // Get basic user stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, current_streak, longest_streak')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get lesson progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('user_progress')
        .select(`
          *,
          lessons!inner (
            lesson_type,
            difficulty_level,
            estimated_time_minutes,
            points_reward
          )
        `)
        .eq('user_id', userId);

      if (lessonError) throw lessonError;

      // Get vocabulary progress
      const { data: vocabProgress, error: vocabError } = await supabase
        .from('user_vocabulary_progress')
        .select('*')
        .eq('user_id', userId);

      if (vocabError) throw vocabError;

      // Get grammar progress
      const { data: grammarProgress, error: grammarError } = await supabase
        .from('user_grammar_progress')
        .select('*')
        .eq('user_id', userId);

      if (grammarError) throw grammarError;

      // Get points history for recent activity
      const { data: pointsHistory, error: pointsError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(100);

      if (pointsError) throw pointsError;

      // Get daily stats
      const { data: dailyStats, error: dailyError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (dailyError) throw dailyError;

      // Calculate analytics
      const analytics = this.calculateAnalytics(
        profile,
        lessonProgress || [],
        vocabProgress || [],
        grammarProgress || [],
        pointsHistory || [],
        dailyStats || []
      );

      return analytics;
    } catch (error) {
      console.error('Error getting progress analytics:', error);
      return null;
    }
  }

  /**
   * Calculate detailed analytics from raw data
   */
  private static calculateAnalytics(
    profile: any,
    lessonProgress: any[],
    vocabProgress: any[],
    grammarProgress: any[],
    pointsHistory: any[],
    dailyStats: any[]
  ): ProgressAnalytics {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate completed lessons
    const completedLessons = lessonProgress.filter(p => p.status === 'completed');
    const totalLessonsCompleted = completedLessons.length;
    const totalTimeSpent = completedLessons.reduce((sum, p) => sum + (p.time_spent || 0), 0) / 60; // in minutes

    // Calculate average score
    const averageScore = completedLessons.length > 0 
      ? completedLessons.reduce((sum, p) => sum + p.score, 0) / completedLessons.length 
      : 0;

    // Calculate today's stats
    const todayStats = dailyStats.find(s => s.date === today);
    const pointsEarnedToday = todayStats?.points_earned || 0;
    const lessonsCompletedToday = todayStats?.lessons_completed || 0;

    // Calculate week stats
    const weekStats = dailyStats.filter(s => new Date(s.date) >= weekAgo);
    const pointsEarnedWeek = weekStats.reduce((sum, s) => sum + s.points_earned, 0);
    const lessonsCompletedWeek = weekStats.reduce((sum, s) => sum + s.lessons_completed, 0);

    // Calculate month stats
    const monthStats = dailyStats.filter(s => new Date(s.date) >= monthAgo);
    const pointsEarnedMonth = monthStats.reduce((sum, s) => sum + s.points_earned, 0);
    const lessonsCompletedMonth = monthStats.reduce((sum, s) => sum + s.lessons_completed, 0);

    // Calculate mastery by difficulty
    const masteryByDifficulty: Record<DifficultyLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    ['beginner', 'intermediate', 'advanced'].forEach(difficulty => {
      const lessonsAtDifficulty = completedLessons.filter(
        p => p.lessons.difficulty_level === difficulty
      );
      if (lessonsAtDifficulty.length > 0) {
        masteryByDifficulty[difficulty as DifficultyLevel] = 
          lessonsAtDifficulty.reduce((sum, p) => sum + p.score, 0) / lessonsAtDifficulty.length;
      }
    });

    // Calculate performance by lesson type
    const performanceByType: Record<LessonType, PerformanceMetrics> = {
      vocabulary: this.calculatePerformanceMetrics(lessonProgress, 'vocabulary'),
      grammar: this.calculatePerformanceMetrics(lessonProgress, 'grammar'),
      pronunciation: this.calculatePerformanceMetrics(lessonProgress, 'pronunciation'),
      conversation: this.calculatePerformanceMetrics(lessonProgress, 'conversation'),
      cultural: this.calculatePerformanceMetrics(lessonProgress, 'cultural'),
      mixed: this.calculatePerformanceMetrics(lessonProgress, 'mixed')
    };

    // Calculate vocabulary mastery
    const vocabularyMastery: VocabularyMastery = {
      total_words: vocabProgress.length,
      mastered_words: vocabProgress.filter(v => v.mastery_level >= 4).length,
      learning_words: vocabProgress.filter(v => v.mastery_level >= 1 && v.mastery_level < 4).length,
      difficult_words: vocabProgress.filter(v => v.difficulty_rating >= 4).length,
      mastery_percentage: vocabProgress.length > 0 
        ? (vocabProgress.filter(v => v.mastery_level >= 4).length / vocabProgress.length) * 100 
        : 0,
      words_learned_today: vocabProgress.filter(v => 
        v.last_practiced && v.last_practiced.startsWith(today)
      ).length,
      words_learned_week: vocabProgress.filter(v => 
        v.last_practiced && new Date(v.last_practiced) >= weekAgo
      ).length
    };

    // Calculate grammar mastery
    const grammarMastery: GrammarMastery = {
      total_rules: grammarProgress.length,
      mastered_rules: grammarProgress.filter(g => g.mastery_level >= 4).length,
      learning_rules: grammarProgress.filter(g => g.mastery_level >= 1 && g.mastery_level < 4).length,
      difficult_rules: grammarProgress.filter(g => g.difficulty_rating >= 4).length,
      mastery_percentage: grammarProgress.length > 0 
        ? (grammarProgress.filter(g => g.mastery_level >= 4).length / grammarProgress.length) * 100 
        : 0,
      rules_learned_today: grammarProgress.filter(g => 
        g.last_practiced && g.last_practiced.startsWith(today)
      ).length,
      rules_learned_week: grammarProgress.filter(g => 
        g.last_practiced && new Date(g.last_practiced) >= weekAgo
      ).length
    };

    // Calculate learning velocity (lessons per day)
    const learningVelocity = weekStats.length > 0 
      ? weekStats.reduce((sum, s) => sum + s.lessons_completed, 0) / weekStats.length 
      : 0;

    // Calculate consistency score (based on daily activity)
    const consistencyScore = this.calculateConsistencyScore(dailyStats);

    return {
      user_id: profile.id,
      total_lessons_completed: totalLessonsCompleted,
      total_time_spent: Math.round(totalTimeSpent),
      average_score: Math.round(averageScore),
      current_streak: profile.current_streak || 0,
      longest_streak: profile.longest_streak || 0,
      points_earned_today: pointsEarnedToday,
      points_earned_week: pointsEarnedWeek,
      points_earned_month: pointsEarnedMonth,
      lessons_completed_today: lessonsCompletedToday,
      lessons_completed_week: lessonsCompletedWeek,
      lessons_completed_month: lessonsCompletedMonth,
      mastery_by_difficulty: masteryByDifficulty,
      performance_by_type: performanceByType,
      vocabulary_mastery: vocabularyMastery,
      grammar_mastery: grammarMastery,
      learning_velocity: Math.round(learningVelocity * 10) / 10,
      consistency_score: consistencyScore,
      achievement_count: 0, // Will be calculated separately
      last_activity: dailyStats[0]?.date || today
    };
  }

  /**
   * Calculate performance metrics for a specific lesson type
   */
  private static calculatePerformanceMetrics(
    lessonProgress: any[], 
    lessonType: LessonType
  ): PerformanceMetrics {
    const typeProgress = lessonProgress.filter(p => p.lessons.lesson_type === lessonType);
    const completed = typeProgress.filter(p => p.status === 'completed');

    if (typeProgress.length === 0) {
      return {
        total_attempted: 0,
        total_completed: 0,
        average_score: 0,
        average_time: 0,
        completion_rate: 0,
        improvement_trend: 'stable'
      };
    }

    const averageScore = completed.length > 0 
      ? completed.reduce((sum, p) => sum + p.score, 0) / completed.length 
      : 0;

    const averageTime = completed.length > 0 
      ? completed.reduce((sum, p) => sum + (p.time_spent || 0), 0) / completed.length 
      : 0;

    const completionRate = (completed.length / typeProgress.length) * 100;

    // Calculate improvement trend (simplified)
    const recentCompleted = completed.slice(-5);
    const olderCompleted = completed.slice(-10, -5);
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';

    if (recentCompleted.length >= 3 && olderCompleted.length >= 3) {
      const recentAvg = recentCompleted.reduce((sum, p) => sum + p.score, 0) / recentCompleted.length;
      const olderAvg = olderCompleted.reduce((sum, p) => sum + p.score, 0) / olderCompleted.length;
      
      if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';
    }

    return {
      total_attempted: typeProgress.length,
      total_completed: completed.length,
      average_score: Math.round(averageScore),
      average_time: Math.round(averageTime),
      completion_rate: Math.round(completionRate),
      improvement_trend: improvementTrend
    };
  }

  /**
   * Calculate consistency score based on daily activity
   */
  private static calculateConsistencyScore(dailyStats: any[]): number {
    if (dailyStats.length === 0) return 0;

    const last30Days = dailyStats.slice(0, 30);
    const activeDays = last30Days.filter(s => s.lessons_completed > 0 || s.points_earned > 0).length;
    
    return Math.round((activeDays / Math.min(30, last30Days.length)) * 100);
  }

  /**
   * Generate personalized learning insights
   */
  static async generateInsights(userId: string): Promise<ProgressInsight[]> {
    try {
      const analytics = await this.getProgressAnalytics(userId);
      if (!analytics) return [];

      const insights: ProgressInsight[] = [];

      // Streak insights
      if (analytics.current_streak >= 7) {
        insights.push({
          type: 'achievement',
          title: `${analytics.current_streak} Day Streak! 🔥`,
          description: 'You\'re on fire! Keep up the consistent learning.',
          priority: 'high',
          icon: '🔥',
          color: '#FF6B6B'
        });
      } else if (analytics.current_streak === 0) {
        insights.push({
          type: 'suggestion',
          title: 'Start Your Learning Streak',
          description: 'Complete a lesson today to begin building your streak!',
          action: 'Start Learning',
          priority: 'medium',
          icon: '🚀',
          color: '#4ECDC4'
        });
      }

      // Performance insights
      if (analytics.average_score >= 90) {
        insights.push({
          type: 'achievement',
          title: 'Excellent Performance! 🌟',
          description: `Your average score of ${analytics.average_score}% is outstanding!`,
          priority: 'high',
          icon: '🌟',
          color: '#FFD93D'
        });
      } else if (analytics.average_score < 70) {
        insights.push({
          type: 'suggestion',
          title: 'Practice Makes Perfect',
          description: 'Try reviewing lessons you\'ve completed to improve your scores.',
          action: 'Review Lessons',
          priority: 'medium',
          icon: '📚',
          color: '#6C5CE7'
        });
      }

      // Learning velocity insights
      if (analytics.learning_velocity >= 2) {
        insights.push({
          type: 'achievement',
          title: 'Fast Learner! ⚡',
          description: `You're completing ${analytics.learning_velocity} lessons per day on average.`,
          priority: 'medium',
          icon: '⚡',
          color: '#FDCB6E'
        });
      }

      // Vocabulary mastery insights
      if (analytics.vocabulary_mastery.mastery_percentage >= 80) {
        insights.push({
          type: 'achievement',
          title: 'Vocabulary Master! 📖',
          description: `You've mastered ${analytics.vocabulary_mastery.mastery_percentage.toFixed(0)}% of vocabulary.`,
          priority: 'high',
          icon: '📖',
          color: '#00B894'
        });
      }

      // Consistency insights
      if (analytics.consistency_score >= 80) {
        insights.push({
          type: 'achievement',
          title: 'Consistent Learner! 📈',
          description: `You've been active ${analytics.consistency_score}% of the last 30 days.`,
          priority: 'medium',
          icon: '📈',
          color: '#0984E3'
        });
      } else if (analytics.consistency_score < 50) {
        insights.push({
          type: 'suggestion',
          title: 'Build Consistency',
          description: 'Try to practice a little each day for better results.',
          action: 'Set Daily Goal',
          priority: 'high',
          icon: '⏰',
          color: '#E17055'
        });
      }

      // Milestone insights
      if (analytics.total_lessons_completed >= 100) {
        insights.push({
          type: 'milestone',
          title: 'Century Club! 💯',
          description: `You've completed ${analytics.total_lessons_completed} lessons!`,
          priority: 'high',
          icon: '💯',
          color: '#A29BFE'
        });
      } else if (analytics.total_lessons_completed >= 50) {
        insights.push({
          type: 'milestone',
          title: 'Halfway Hero! 🎯',
          description: `${analytics.total_lessons_completed} lessons completed! You're making great progress.`,
          priority: 'medium',
          icon: '🎯',
          color: '#74B9FF'
        });
      }

      return insights.slice(0, 5); // Return top 5 insights
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Update user progress after lesson completion
   */
  static async updateLessonProgress(
    userId: string,
    lessonId: number,
    score: number,
    timeSpent: number,
    sectionProgress: any[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'completed',
          score: score,
          time_spent: timeSpent,
          completed_at: new Date().toISOString(),
          section_progress: sectionProgress
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      // Update daily stats
      await this.updateDailyStats(userId, score, timeSpent);

      return true;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return false;
    }
  }

  /**
   * Update daily statistics
   */
  private static async updateDailyStats(
    userId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingStats, error: fetchError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const studyTimeMinutes = Math.round(timeSpent / 60);
      const isPerfectScore = score >= 100;

      if (existingStats) {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('daily_stats')
          .update({
            lessons_completed: existingStats.lessons_completed + 1,
            study_time_minutes: existingStats.study_time_minutes + studyTimeMinutes,
            perfect_scores: existingStats.perfect_scores + (isPerfectScore ? 1 : 0)
          })
          .eq('id', existingStats.id);

        if (updateError) throw updateError;
      } else {
        // Create new daily stats
        const { error: insertError } = await supabase
          .from('daily_stats')
          .insert({
            user_id: userId,
            date: today,
            lessons_completed: 1,
            study_time_minutes: studyTimeMinutes,
            perfect_scores: isPerfectScore ? 1 : 0
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
      // Don't throw - daily stats update shouldn't break the flow
    }
  }

  /**
   * Get progress comparison with other users (anonymized)
   */
  static async getProgressComparison(userId: string): Promise<{
    userRank: number;
    totalUsers: number;
    percentile: number;
    averageScore: number;
    userScore: number;
  } | null> {
    try {
      // Get user's total points
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get all users' points for ranking
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('total_points')
        .order('total_points', { ascending: false });

      if (allError) throw allError;

      const userPoints = userProfile.total_points || 0;
      const userRank = allProfiles.findIndex(p => p.total_points <= userPoints) + 1;
      const totalUsers = allProfiles.length;
      const percentile = totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0;
      const averageScore = allProfiles.reduce((sum, p) => sum + (p.total_points || 0), 0) / totalUsers;

      return {
        userRank,
        totalUsers,
        percentile: Math.round(percentile),
        averageScore: Math.round(averageScore),
        userScore: userPoints
      };
    } catch (error) {
      console.error('Error getting progress comparison:', error);
      return null;
    }
  }
}
