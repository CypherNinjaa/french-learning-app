// Lesson Service for Stage 4.1 - Core Learning Features
import { supabase } from './supabase';
import { ProgressTrackingService } from './progressTrackingService';
import {
  Lesson, 
  UserProgress, 
  DifficultyMetrics, 
  AdaptiveDifficultyConfig,
  CompletionCriteria,
  ProgressStatus,
  DifficultyLevel,
  LessonType,
  LessonSection
} from '../types/LessonTypes';

export class LessonService {
  // Adaptive difficulty configuration
  private static readonly DIFFICULTY_CONFIG: AdaptiveDifficultyConfig = {
    min_lessons_for_analysis: 5,
    score_threshold_easy: 85,
    score_threshold_hard: 60,
    time_threshold_fast: 120, // 2 minutes
    time_threshold_slow: 600, // 10 minutes
    success_rate_threshold: 80
  };

  /**
   * Get lesson by ID with content
   */
  static async getLessonById(lessonId: number): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          modules!inner (
            id,
            title,
            level_id,
            levels!inner (
              id,
              name
            )
          )
        `)
        .eq('id', lessonId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching lesson:', error);
        return null;
      }      const lesson = data as Lesson;
      
      // Handle missing or invalid content
      if (!lesson.content) {
        lesson.content = { introduction: '', sections: [] };
      }
      
      // Convert legacy content format to new sections format
      if (!lesson.content.sections || lesson.content.sections.length === 0) {
        // Check if this is legacy content format with any additional properties
        const legacyContent = lesson.content as any;
        if (legacyContent.vocabulary || legacyContent.grammar_focus) {
          lesson.content.sections = this.convertLegacyContent(legacyContent, lesson);
        } else {
          // Create default section
          lesson.content.sections = [
            {
              id: 'default-section',
              type: 'text',
              title: 'Sample Section',
              content: 'This is a sample section. Please update this lesson with real content.',
              order_index: 0,
              is_required: true
            }
          ];
        }
      }
      return lesson;
    } catch (error) {
      console.error('Error in getLessonById:', error);
      return null;
    }
  }

  /**
   * Get lessons by module with user progress
   */
  static async getLessonsByModule(
    moduleId: number, 
    userId?: string
  ): Promise<{ lessons: Lesson[], progress: UserProgress[] }> {
    try {
      // Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch user progress if userId provided
      let progress: UserProgress[] = [];
      if (userId && lessons) {
        const lessonIds = lessons.map(l => l.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds);

        if (!progressError && progressData) {
          progress = progressData as UserProgress[];
        }
      }

      return { lessons: lessons || [], progress };
    } catch (error) {
      console.error('Error fetching lessons by module:', error);
      return { lessons: [], progress: [] };
    }
  }

  /**
   * Get user progress for a specific lesson
   */
  static async getUserProgress(userId: string, lessonId: number): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user progress:', error);
        return null;
      }

      return data as UserProgress || null;
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      return null;
    }
  }

  /**
   * Initialize or update user progress
   */
  static async initializeProgress(userId: string, lessonId: number): Promise<UserProgress | null> {
    try {
      const existingProgress = await this.getUserProgress(userId, lessonId);
      
      if (existingProgress) {
        // Update last_accessed
        const { data, error } = await supabase
          .from('user_progress')
          .update({ 
            last_accessed: new Date().toISOString(),
            attempts: existingProgress.attempts + 1
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        return data as UserProgress;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            status: 'in_progress' as ProgressStatus,
            score: 0,
            time_spent: 0,
            attempts: 1,
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
            section_progress: []
          })
          .select()
          .single();

        if (error) throw error;
        return data as UserProgress;
      }
    } catch (error) {
      console.error('Error initializing progress:', error);
      return null;
    }
  }

  /**
   * Update user progress for a lesson
   */
  static async updateProgress(
    userId: string, 
    lessonId: number, 
    updates: Partial<UserProgress>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          ...updates,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) {
        console.error('Error updating progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProgress:', error);
      return false;
    }
  }
  /**
   * Complete a lesson and update user stats with full gamification integration
   */
  static async completeLesson(
    userId: string, 
    lessonId: number, 
    finalScore: number, 
    totalTime: number
  ): Promise<boolean> {
    try {
      // Update lesson progress
      const progressUpdate = await this.updateProgress(userId, lessonId, {
        status: 'completed' as ProgressStatus,
        score: finalScore,
        time_spent: totalTime,
        completed_at: new Date().toISOString()
      });

      if (!progressUpdate) return false;

      // Get lesson details for activity data
      const lesson = await this.getLessonById(lessonId);
      const isPerfectScore = finalScore >= 100;
      
      // Use comprehensive gamification system for points calculation and rewards
      const { gamificationService } = await import('./gamificationService');
      
      // Calculate base points (50 for lesson completion as per gamification rules)
      const basePoints = 50;
      
      // Calculate points with full gamification logic
      const pointsResult = await gamificationService.calculatePointsEarned(
        userId,
        'lesson_completion',
        basePoints,
        {
          lessonId,
          score: finalScore,
          timeSpent: totalTime,
          isPerfectScore,
          difficulty: lesson?.difficulty_level || 'beginner',
          isFirstAttempt: true // Could be enhanced to track actual attempts
        }
      );

      // Log points history with detailed information
      await this.logPoints(userId, lessonId, pointsResult.total_points, 'lesson');

      // Update daily stats through ProgressTrackingService
      await ProgressTrackingService.updateLessonProgress(
        userId, 
        lessonId, 
        finalScore, 
        totalTime,
        [] // section progress - could be enhanced to pass actual section data
      );

      // Check and unlock achievements based on lesson completion
      await gamificationService.checkAndUnlockAchievements(userId, {
        activity: 'lesson_completion',
        lessonId,
        score: finalScore,
        timeSpent: totalTime,
        isPerfectScore,
        pointsEarned: pointsResult.total_points
      });

      // Update user streak
      await gamificationService.updateUserStreak(userId);

      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      return false;
    }
  }

  /**
   * Calculate points for lesson completion
   */
  private static async calculatePoints(
    lessonId: number, 
    score: number, 
    timeSpent: number
  ): Promise<number> {
    try {
      // Get lesson details for point calculation
      const lesson = await this.getLessonById(lessonId);
      if (!lesson) return 0;

      let points = 10; // Base points

      // Score bonuses
      if (score >= 100) points += 5; // Perfect score
      if (score >= 85) points += 3;  // High score

      // Speed bonuses (if completed quickly)
      if (timeSpent < 120) points += 5; // Under 2 minutes
      if (timeSpent < 60) points += 3;  // Under 1 minute

      // Difficulty multiplier
      switch (lesson.difficulty_level) {
        case 'intermediate': points *= 1.2; break;
        case 'advanced': points *= 1.5; break;
      }

      return Math.round(points);
    } catch (error) {
      console.error('Error calculating points:', error);
      return 10; // Default points
    }
  }

  /**
   * Log points to history table
   */
  private static async logPoints(
    userId: string, 
    sourceId: number, 
    points: number, 
    type: string
  ): Promise<void> {
    try {
      await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          points_earned: points,
          points_type: type,
          source_id: sourceId,
          earned_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging points:', error);
      // Don't throw - points logging shouldn't break lesson completion
    }
  }

  /**
   * Get adaptive difficulty recommendation for user
   */
  static async getAdaptiveDifficulty(
    userId: string, 
    lessonType: LessonType
  ): Promise<DifficultyLevel> {
    try {
      // Get user's recent performance for this lesson type
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          score,
          time_spent,
          lessons!inner (
            lesson_type,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .eq('lessons.lesson_type', lessonType)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(this.DIFFICULTY_CONFIG.min_lessons_for_analysis);

      if (error || !data || data.length < this.DIFFICULTY_CONFIG.min_lessons_for_analysis) {
        return 'beginner'; // Default for new users
      }

      // Calculate performance metrics
      const avgScore = data.reduce((sum, p) => sum + p.score, 0) / data.length;
      const avgTime = data.reduce((sum, p) => sum + p.time_spent, 0) / data.length;

      // Determine recommended difficulty
      if (avgScore >= this.DIFFICULTY_CONFIG.score_threshold_easy && 
          avgTime <= this.DIFFICULTY_CONFIG.time_threshold_fast) {
        return 'advanced';
      } else if (avgScore >= this.DIFFICULTY_CONFIG.score_threshold_hard) {
        return 'intermediate';
      } else {
        return 'beginner';
      }
    } catch (error) {
      console.error('Error calculating adaptive difficulty:', error);
      return 'beginner';
    }
  }

  /**
   * Get lessons filtered by difficulty and type
   */
  static async getRecommendedLessons(
    userId: string,
    lessonType?: LessonType,
    difficulty?: DifficultyLevel,
    limit: number = 10
  ): Promise<Lesson[]> {
    try {
      let query = supabase
        .from('lessons')
        .select(`
          *,
          modules!inner (
            id,
            title,
            levels!inner (
              id,
              name
            )
          )
        `)
        .eq('is_active', true);

      if (lessonType) {
        query = query.eq('lesson_type', lessonType);
      }

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }

      const { data, error } = await query
        .order('order_index')
        .limit(limit);

      if (error) {
        console.error('Error fetching recommended lessons:', error);
        return [];
      }

      return data as Lesson[] || [];
    } catch (error) {
      console.error('Error in getRecommendedLessons:', error);
      return [];
    }
  }

  /**
   * Get completion criteria for a lesson
   */
  static getCompletionCriteria(lesson: Lesson): CompletionCriteria {
    // Default completion criteria based on lesson type and difficulty
    const baseCriteria: CompletionCriteria = {
      min_score: 70,
      required_sections: [],
      mastery_threshold: 85
    };

    // Adjust based on difficulty
    switch (lesson.difficulty_level) {
      case 'beginner':
        baseCriteria.min_score = 60;
        baseCriteria.max_attempts = 5;
        break;
      case 'intermediate':
        baseCriteria.min_score = 70;
        baseCriteria.max_attempts = 3;
        break;
      case 'advanced':
        baseCriteria.min_score = 80;
        baseCriteria.max_attempts = 2;
        baseCriteria.time_limit = 1800; // 30 minutes
        break;
    }

    // Extract required sections from lesson content
    if (lesson.content?.sections) {
      baseCriteria.required_sections = lesson.content.sections
        .filter(section => section.is_required)
        .map(section => section.id);
    }

    return baseCriteria;
  }

  /**
   * Check if lesson is completed according to criteria
   */
  static isLessonCompleted(progress: UserProgress, criteria: CompletionCriteria): boolean {
    if (progress.status !== 'completed') return false;
    if (progress.score < criteria.min_score) return false;
    
    // Check required sections
    if (criteria.required_sections.length > 0) {
      const completedSections = progress.section_progress
        .filter(sp => sp.completed)
        .map(sp => sp.section_id);
      
      const allRequiredCompleted = criteria.required_sections.every(
        sectionId => completedSections.includes(sectionId)
      );
      
      if (!allRequiredCompleted) return false;
    }

    return true;
  }

  /**
   * Convert legacy content format to new sections format
   */
  private static convertLegacyContent(legacyContent: any, lesson: Lesson): LessonSection[] {
    const sections: LessonSection[] = [];
    
    // Create a vocabulary section if vocabulary exists
    if (legacyContent.vocabulary && Array.isArray(legacyContent.vocabulary)) {
      sections.push({
        id: 'vocabulary-section',
        type: 'vocabulary',
        title: 'Vocabulary',
        content: {
          words: legacyContent.vocabulary.map((word: string) => ({
            french: word,
            english: 'Translation needed',
            pronunciation: 'Pronunciation needed'
          })),
          explanation: 'Learn these essential vocabulary words.'
        },
        order_index: 0,
        is_required: true
      });
    }
    
    // Create a grammar section if grammar focus exists
    if (legacyContent.grammar_focus) {
      sections.push({
        id: 'grammar-section',
        type: 'text',
        title: 'Grammar Focus',
        content: legacyContent.grammar_focus,
        order_index: sections.length,
        is_required: true
      });
    }
    
    // Create a general content section with introduction
    if (legacyContent.introduction) {
      sections.push({
        id: 'introduction-section',
        type: 'text',
        title: 'Introduction',
        content: legacyContent.introduction,
        order_index: sections.length,
        is_required: true
      });
    }
    
    // If no sections were created, add a default one
    if (sections.length === 0) {
      sections.push({
        id: 'default-section',
        type: 'text',
        title: lesson.title || 'Lesson Content',
        content: 'This lesson is being updated with new content.',
        order_index: 0,
        is_required: true
      });
    }
    
    return sections;
  }
}
