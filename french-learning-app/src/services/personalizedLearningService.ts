import { groqService } from './groqService';
// import { supabase } from '../config/supabase'; // TODO: Fix supabase import path

// Mock supabase for now - replace with actual supabase client
const mockSupabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            // Mock data - replace with actual supabase calls
            data: [],
            error: null,
          }),
        }),
        in: (column: string, values: any[]) => ({
          data: [],
          error: null,
        }),
        single: () => ({
          data: { level: 'beginner', streak_days: 0, created_at: new Date().toISOString() },
          error: null,
        }),
        data: [],
        error: null,
      }),
    }),
  }),
};

// Types for personalized learning
export interface UserLearningProfile {
  userId: string;
  currentLevel: string;
  strengths: string[];
  weaknesses: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  studyGoals: string[];
  availableStudyTime: number; // minutes per day
  lastActive: Date;
  streakDays: number;
}

export interface LearningRecommendation {
  type: 'lesson' | 'vocabulary' | 'grammar' | 'practice';
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number; // 1-10
  reasoning: string;
  content?: any;
}

export interface StudyPlan {
  date: string;
  totalTime: number;
  sessions: StudySession[];
  goals: string[];
}

export interface StudySession {
  type: 'review' | 'new_content' | 'practice' | 'assessment';
  duration: number; // minutes
  content: LearningRecommendation[];
  objectives: string[];
}

export interface DifficultyAdjustment {
  currentDifficulty: number; // 1-10 scale
  suggestedDifficulty: number;
  adjustmentReason: string;
  confidenceScore: number; // 0-1
}

class PersonalizedLearningService {
  /**
   * Analyze user performance and generate learning profile
   */
  async generateUserLearningProfile(userId: string): Promise<UserLearningProfile> {
    try {      // Get user progress data
      const { data: progressData, error: progressError } = await mockSupabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (progressError) throw progressError;

      // Get vocabulary progress
      const { data: vocabData, error: vocabError } = await mockSupabase
        .from('user_vocabulary_progress')
        .select('*')
        .eq('user_id', userId);

      if (vocabError) throw vocabError;

      // Get user profile
      const { data: profile, error: profileError } = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Analyze performance with AI
      const performanceAnalysis = await this.analyzeUserPerformance(
        progressData || [],
        vocabData || [],
        profile
      );

      return {
        userId,
        currentLevel: profile.level || 'beginner',
        strengths: performanceAnalysis.strengths,
        weaknesses: performanceAnalysis.weaknesses,
        preferredLearningStyle: performanceAnalysis.learningStyle,
        studyGoals: performanceAnalysis.goals,
        availableStudyTime: 30, // Default 30 minutes
        lastActive: new Date(profile.created_at),
        streakDays: profile.streak_days || 0,
      };
    } catch (error) {
      console.error('Error generating learning profile:', error);
      // Return default profile
      return {
        userId,
        currentLevel: 'beginner',
        strengths: [],
        weaknesses: ['vocabulary', 'grammar'],
        preferredLearningStyle: 'visual',
        studyGoals: ['basic_conversation'],
        availableStudyTime: 30,
        lastActive: new Date(),
        streakDays: 0,
      };
    }
  }

  /**
   * Generate personalized learning recommendations
   */
  async generateLearningRecommendations(
    userProfile: UserLearningProfile,
    count: number = 5
  ): Promise<LearningRecommendation[]> {
    try {
      const prompt = `You are an AI French learning tutor. Generate ${count} personalized learning recommendations for a user with the following profile:

Level: ${userProfile.currentLevel}
Strengths: ${userProfile.strengths.join(', ')}
Weaknesses: ${userProfile.weaknesses.join(', ')}
Learning Style: ${userProfile.preferredLearningStyle}
Study Goals: ${userProfile.studyGoals.join(', ')}
Available Time: ${userProfile.availableStudyTime} minutes per day
Streak: ${userProfile.streakDays} days

Generate recommendations in JSON format. Each recommendation should have:
- type: 'lesson', 'vocabulary', 'grammar', or 'practice'
- title: Clear, engaging title
- description: Brief description of what the user will learn
- estimatedTime: Time in minutes (5-45)
- difficulty: 'easy', 'medium', or 'hard'
- priority: 1-10 (10 being highest priority)
- reasoning: Why this is recommended for this user

Focus on the user's weaknesses while building on their strengths. Match the learning style and available time.`;

      const response = await groqService.generateQuestions('learning recommendations', 'multiple_choice', userProfile.currentLevel, 1);
      
      // Use AI to generate recommendations
      const aiRecommendations = await this.getAIRecommendations(prompt);
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        return aiRecommendations;
      }

      // Fallback recommendations based on user profile
      return this.getFallbackRecommendations(userProfile, count);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(userProfile, count);
    }
  }

  /**
   * Create a personalized study plan for a specific day
   */
  async createDailyStudyPlan(
    userProfile: UserLearningProfile,
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<StudyPlan> {
    try {
      const recommendations = await this.generateLearningRecommendations(userProfile, 8);
      
      // Organize recommendations into study sessions
      const sessions = this.organizeIntoSessions(recommendations, userProfile.availableStudyTime);
      
      const studyPlan: StudyPlan = {
        date: targetDate,
        totalTime: sessions.reduce((total, session) => total + session.duration, 0),
        sessions,
        goals: this.extractDailyGoals(recommendations),
      };

      return studyPlan;
    } catch (error) {
      console.error('Error creating study plan:', error);
      return this.getDefaultStudyPlan(userProfile, targetDate);
    }
  }

  /**
   * Adjust difficulty based on user performance
   */
  async adjustDifficulty(
    userId: string,
    currentDifficulty: number,
    recentPerformance: number[] // Array of recent scores (0-100)
  ): Promise<DifficultyAdjustment> {
    try {
      if (recentPerformance.length === 0) {
        return {
          currentDifficulty,
          suggestedDifficulty: currentDifficulty,
          adjustmentReason: 'No recent performance data available',
          confidenceScore: 0,
        };
      }

      const averageScore = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;
      const scoreVariance = this.calculateVariance(recentPerformance);
      
      let suggestedDifficulty = currentDifficulty;
      let adjustmentReason = '';
      let confidenceScore = 0;

      // AI-powered difficulty adjustment logic
      if (averageScore >= 85 && scoreVariance < 100) {
        // Consistently high performance - increase difficulty
        suggestedDifficulty = Math.min(10, currentDifficulty + 1);
        adjustmentReason = 'Consistently high performance indicates readiness for increased difficulty';
        confidenceScore = 0.8;
      } else if (averageScore <= 60 && scoreVariance < 200) {
        // Consistently low performance - decrease difficulty
        suggestedDifficulty = Math.max(1, currentDifficulty - 1);
        adjustmentReason = 'Consistent struggles suggest need for easier content';
        confidenceScore = 0.9;
      } else if (scoreVariance > 300) {
        // Inconsistent performance - maintain current difficulty
        adjustmentReason = 'Inconsistent performance suggests current difficulty is appropriate';
        confidenceScore = 0.6;
      } else {
        // Moderate performance - slight adjustments
        if (averageScore > 75) {
          suggestedDifficulty = Math.min(10, currentDifficulty + 0.5);
          adjustmentReason = 'Good performance allows for slight difficulty increase';
          confidenceScore = 0.7;
        } else if (averageScore < 65) {
          suggestedDifficulty = Math.max(1, currentDifficulty - 0.5);
          adjustmentReason = 'Below-average performance suggests slight difficulty decrease';
          confidenceScore = 0.7;
        } else {
          adjustmentReason = 'Performance is well-balanced at current difficulty';
          confidenceScore = 0.8;
        }
      }

      return {
        currentDifficulty,
        suggestedDifficulty: Math.round(suggestedDifficulty * 10) / 10,
        adjustmentReason,
        confidenceScore,
      };
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
      return {
        currentDifficulty,
        suggestedDifficulty: currentDifficulty,
        adjustmentReason: 'Error occurred during difficulty analysis',
        confidenceScore: 0,
      };
    }
  }

  /**
   * Generate spaced repetition schedule for vocabulary
   */
  async generateSpacedRepetitionSchedule(
    userId: string,
    vocabularyIds: number[]
  ): Promise<{ vocabularyId: number; nextReviewDate: Date; confidence: number }[]> {
    try {      const { data: vocabProgress, error } = await mockSupabase
        .from('user_vocabulary_progress')
        .select('*')
        .eq('user_id', userId)
        .in('vocabulary_id', vocabularyIds);

      if (error) throw error;      return vocabularyIds.map(vocabId => {
        const progress: any = vocabProgress?.find((p: any) => p.vocabulary_id === vocabId);
        
        if (!progress) {
          // New vocabulary - schedule for immediate review
          return {
            vocabularyId: vocabId,
            nextReviewDate: new Date(),
            confidence: 0,
          };
        }

        // Calculate next review date based on mastery level
        const masteryLevel = progress.mastery_level || 0;
        const correctRate = progress.total_attempts > 0 
          ? progress.correct_attempts / progress.total_attempts 
          : 0;
        
        const daysUntilNextReview = this.calculateSpacedRepetitionInterval(masteryLevel, correctRate);
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilNextReview);

        return {
          vocabularyId: vocabId,
          nextReviewDate,
          confidence: correctRate,
        };
      });
    } catch (error) {
      console.error('Error generating spaced repetition schedule:', error);
      return vocabularyIds.map(vocabId => ({
        vocabularyId: vocabId,
        nextReviewDate: new Date(),
        confidence: 0,
      }));
    }
  }

  // Private helper methods
  private async analyzeUserPerformance(
    progressData: any[],
    vocabData: any[],
    profile: any
  ): Promise<{
    strengths: string[];
    weaknesses: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    goals: string[];
  }> {
    // Analyze performance patterns
    const avgScore = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length
      : 0;

    const vocabMastery = vocabData.length > 0
      ? vocabData.reduce((sum, v) => sum + (v.mastery_level || 0), 0) / vocabData.length
      : 0;

    // Determine strengths and weaknesses based on performance
    const strengths = [];
    const weaknesses = [];

    if (avgScore > 80) strengths.push('quick_learning');
    if (vocabMastery > 3) strengths.push('vocabulary');
    if (progressData.length > 10) strengths.push('consistency');

    if (avgScore < 60) weaknesses.push('comprehension');
    if (vocabMastery < 2) weaknesses.push('vocabulary');
    if (progressData.length < 5) weaknesses.push('practice_frequency');

    return {
      strengths: strengths.length > 0 ? strengths : ['beginner_friendly'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['vocabulary', 'grammar'],
      learningStyle: 'visual', // Default - could be enhanced with user preferences
      goals: ['basic_conversation', 'vocabulary_building'],
    };
  }

  private async getAIRecommendations(prompt: string): Promise<LearningRecommendation[]> {
    try {
      // This would use the AI service to generate recommendations
      // For now, return null to use fallback
      return [];
    } catch (error) {
      console.error('AI recommendations failed:', error);
      return [];
    }
  }

  private getFallbackRecommendations(
    userProfile: UserLearningProfile,
    count: number
  ): LearningRecommendation[] {
    const recommendations = [
      {
        type: 'vocabulary' as const,
        title: 'Daily Vocabulary Practice',
        description: 'Practice common French words and phrases',
        estimatedTime: 15,
        difficulty: userProfile.currentLevel === 'beginner' ? 'easy' as const : 'medium' as const,
        priority: 9,
        reasoning: 'Vocabulary building is essential for language learning',
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Fundamentals',
        description: 'Learn basic French grammar rules',
        estimatedTime: 20,
        difficulty: 'medium' as const,
        priority: 8,
        reasoning: 'Grammar understanding improves overall comprehension',
      },
      {
        type: 'practice' as const,
        title: 'Conversation Practice',
        description: 'Practice common conversational phrases',
        estimatedTime: 10,
        difficulty: 'easy' as const,
        priority: 7,
        reasoning: 'Practical conversation skills for daily use',
      },
      {
        type: 'lesson' as const,
        title: 'Pronunciation Guide',
        description: 'Improve your French pronunciation',
        estimatedTime: 12,
        difficulty: 'medium' as const,
        priority: 6,
        reasoning: 'Good pronunciation builds confidence',
      },
    ];

    return recommendations.slice(0, count);
  }

  private organizeIntoSessions(
    recommendations: LearningRecommendation[],
    availableTime: number
  ): StudySession[] {
    const sessions: StudySession[] = [];
    let currentSession: StudySession = {
      type: 'new_content',
      duration: 0,
      content: [],
      objectives: [],
    };

    for (const rec of recommendations) {
      if (currentSession.duration + rec.estimatedTime <= availableTime / 2) {
        currentSession.content.push(rec);
        currentSession.duration += rec.estimatedTime;
        currentSession.objectives.push(rec.title);
      } else {
        if (currentSession.content.length > 0) {
          sessions.push(currentSession);
        }
        currentSession = {
          type: 'practice',
          duration: rec.estimatedTime,
          content: [rec],
          objectives: [rec.title],
        };
      }
    }

    if (currentSession.content.length > 0) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  private extractDailyGoals(recommendations: LearningRecommendation[]): string[] {
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(r => r.title);
  }

  private getDefaultStudyPlan(userProfile: UserLearningProfile, date: string): StudyPlan {
    return {
      date,
      totalTime: userProfile.availableStudyTime,
      sessions: [
        {
          type: 'review',
          duration: 10,
          content: [],
          objectives: ['Review previous content'],
        },
        {
          type: 'new_content',
          duration: 15,
          content: [],
          objectives: ['Learn new vocabulary'],
        },
        {
          type: 'practice',
          duration: 5,
          content: [],
          objectives: ['Practice pronunciation'],
        },
      ],
      goals: ['Complete daily practice', 'Learn new words'],
    };
  }

  private calculateVariance(scores: number[]): number {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squareDiffs = scores.map(score => Math.pow(score - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateSpacedRepetitionInterval(masteryLevel: number, correctRate: number): number {
    // Spaced repetition algorithm
    const baseIntervals = [1, 3, 7, 14, 30, 60]; // days
    const masteryIndex = Math.min(masteryLevel, baseIntervals.length - 1);
    const baseInterval = baseIntervals[masteryIndex];
    
    // Adjust based on correct rate
    const adjustmentFactor = correctRate >= 0.8 ? 1.5 : correctRate >= 0.6 ? 1.0 : 0.5;
    
    return Math.round(baseInterval * adjustmentFactor);
  }
}

// Create and export singleton instance
export const personalizedLearningService = new PersonalizedLearningService();
export { PersonalizedLearningService };
