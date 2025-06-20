import { useState, useEffect, useCallback } from 'react';
import { 
  personalizedLearningService,
  UserLearningProfile,
  LearningRecommendation,
  StudyPlan,
  DifficultyAdjustment
} from '../services/personalizedLearningService';

interface UsePersonalizedLearningState {
  // Profile data
  userProfile: UserLearningProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Recommendations
  recommendations: LearningRecommendation[];
  recommendationsLoading: boolean;
  recommendationsError: string | null;

  // Study plan
  todayStudyPlan: StudyPlan | null;
  studyPlanLoading: boolean;
  studyPlanError: string | null;

  // Difficulty adjustment
  difficultyAdjustment: DifficultyAdjustment | null;
  difficultyLoading: boolean;
  difficultyError: string | null;
}

interface UsePersonalizedLearningActions {
  // Profile actions
  loadUserProfile: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Recommendation actions
  loadRecommendations: (count?: number) => Promise<void>;
  refreshRecommendations: () => Promise<void>;

  // Study plan actions
  loadTodayStudyPlan: () => Promise<void>;
  createCustomStudyPlan: (targetDate: string) => Promise<StudyPlan | null>;

  // Difficulty actions
  calculateDifficultyAdjustment: (
    currentDifficulty: number,
    recentPerformance: number[]
  ) => Promise<void>;

  // Utility actions
  generateSpacedRepetition: (vocabularyIds: number[]) => Promise<any[]>;
  clearErrors: () => void;
}

export interface UsePersonalizedLearningReturn extends UsePersonalizedLearningState, UsePersonalizedLearningActions {}

export const usePersonalizedLearning = (userId?: string): UsePersonalizedLearningReturn => {
  // State management
  const [state, setState] = useState<UsePersonalizedLearningState>({
    // Profile state
    userProfile: null,
    profileLoading: false,
    profileError: null,

    // Recommendations state
    recommendations: [],
    recommendationsLoading: false,
    recommendationsError: null,

    // Study plan state
    todayStudyPlan: null,
    studyPlanLoading: false,
    studyPlanError: null,

    // Difficulty state
    difficultyAdjustment: null,
    difficultyLoading: false,
    difficultyError: null,
  });

  // Profile actions
  const loadUserProfile = useCallback(async (targetUserId: string) => {
    setState(prev => ({ ...prev, profileLoading: true, profileError: null }));
    
    try {
      const profile = await personalizedLearningService.generateUserLearningProfile(targetUserId);
      setState(prev => ({ 
        ...prev, 
        userProfile: profile, 
        profileLoading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        profileError: error.message || 'Failed to load user profile',
        profileLoading: false 
      }));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (userId) {
      await loadUserProfile(userId);
    }
  }, [userId, loadUserProfile]);

  // Recommendation actions
  const loadRecommendations = useCallback(async (count: number = 5) => {
    if (!state.userProfile) {
      setState(prev => ({ 
        ...prev, 
        recommendationsError: 'User profile required for recommendations' 
      }));
      return;
    }

    setState(prev => ({ ...prev, recommendationsLoading: true, recommendationsError: null }));
    
    try {
      const recommendations = await personalizedLearningService.generateLearningRecommendations(
        state.userProfile,
        count
      );
      setState(prev => ({ 
        ...prev, 
        recommendations, 
        recommendationsLoading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        recommendationsError: error.message || 'Failed to load recommendations',
        recommendationsLoading: false 
      }));
    }
  }, [state.userProfile]);

  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations();
  }, [loadRecommendations]);

  // Study plan actions
  const loadTodayStudyPlan = useCallback(async () => {
    if (!state.userProfile) {
      setState(prev => ({ 
        ...prev, 
        studyPlanError: 'User profile required for study plan' 
      }));
      return;
    }

    setState(prev => ({ ...prev, studyPlanLoading: true, studyPlanError: null }));
    
    try {
      const studyPlan = await personalizedLearningService.createDailyStudyPlan(state.userProfile);
      setState(prev => ({ 
        ...prev, 
        todayStudyPlan: studyPlan, 
        studyPlanLoading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        studyPlanError: error.message || 'Failed to create study plan',
        studyPlanLoading: false 
      }));
    }
  }, [state.userProfile]);

  const createCustomStudyPlan = useCallback(async (targetDate: string): Promise<StudyPlan | null> => {
    if (!state.userProfile) {
      throw new Error('User profile required for study plan');
    }

    try {
      return await personalizedLearningService.createDailyStudyPlan(state.userProfile, targetDate);
    } catch (error: any) {
      console.error('Failed to create custom study plan:', error);
      return null;
    }
  }, [state.userProfile]);

  // Difficulty adjustment actions
  const calculateDifficultyAdjustment = useCallback(async (
    currentDifficulty: number,
    recentPerformance: number[]
  ) => {
    if (!userId) {
      setState(prev => ({ 
        ...prev, 
        difficultyError: 'User ID required for difficulty adjustment' 
      }));
      return;
    }

    setState(prev => ({ ...prev, difficultyLoading: true, difficultyError: null }));
    
    try {
      const adjustment = await personalizedLearningService.adjustDifficulty(
        userId,
        currentDifficulty,
        recentPerformance
      );
      setState(prev => ({ 
        ...prev, 
        difficultyAdjustment: adjustment, 
        difficultyLoading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        difficultyError: error.message || 'Failed to calculate difficulty adjustment',
        difficultyLoading: false 
      }));
    }
  }, [userId]);

  // Utility actions
  const generateSpacedRepetition = useCallback(async (vocabularyIds: number[]) => {
    if (!userId) {
      throw new Error('User ID required for spaced repetition');
    }

    try {
      return await personalizedLearningService.generateSpacedRepetitionSchedule(userId, vocabularyIds);
    } catch (error: any) {
      console.error('Failed to generate spaced repetition schedule:', error);
      return [];
    }
  }, [userId]);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      profileError: null,
      recommendationsError: null,
      studyPlanError: null,
      difficultyError: null,
    }));
  }, []);

  // Auto-load profile when userId changes
  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId, loadUserProfile]);

  // Auto-load recommendations when profile is available
  useEffect(() => {
    if (state.userProfile && !state.recommendationsLoading && state.recommendations.length === 0) {
      loadRecommendations();
    }
  }, [state.userProfile, state.recommendationsLoading, state.recommendations.length, loadRecommendations]);

  // Auto-load study plan when profile is available
  useEffect(() => {
    if (state.userProfile && !state.studyPlanLoading && !state.todayStudyPlan) {
      loadTodayStudyPlan();
    }
  }, [state.userProfile, state.studyPlanLoading, state.todayStudyPlan, loadTodayStudyPlan]);

  return {
    // State
    ...state,
    
    // Actions
    loadUserProfile,
    refreshProfile,
    loadRecommendations,
    refreshRecommendations,
    loadTodayStudyPlan,
    createCustomStudyPlan,
    calculateDifficultyAdjustment,
    generateSpacedRepetition,
    clearErrors,
  };
};
