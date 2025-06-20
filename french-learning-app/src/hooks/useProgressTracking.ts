// Custom hook for lesson progress tracking
import { useState, useEffect, useCallback } from 'react';
import { 
  UserProgress, 
  ProgressStatus, 
  SectionProgress,
  DifficultyLevel,
  LessonType 
} from '../types/LessonTypes';
import { LessonService } from '../services/lessonService';

interface UseProgressTrackingProps {
  userId: string;
  lessonId: number;
}

interface UseProgressTrackingReturn {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  updateSectionProgress: (sectionId: string, score: number, timeSpent: number) => Promise<void>;
  completeLesson: (finalScore: number, totalTime: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  getCompletionPercentage: () => number;
  isLessonCompleted: () => boolean;
  canProceedToNext: () => boolean;
}

export const useProgressTracking = ({ 
  userId, 
  lessonId 
}: UseProgressTrackingProps): UseProgressTrackingReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial progress
  useEffect(() => {
    loadProgress();
  }, [userId, lessonId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userProgress = await LessonService.getUserProgress(userId, lessonId);
      setProgress(userProgress);
    } catch (err) {
      setError('Failed to load progress');
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSectionProgress = useCallback(async (
    sectionId: string, 
    score: number, 
    timeSpent: number
  ) => {
    if (!progress) return;

    try {
      const updatedSectionProgress = [...(progress.section_progress || [])];
      const existingIndex = updatedSectionProgress.findIndex(
        sp => sp.section_id === sectionId
      );

      const sectionProgressUpdate: SectionProgress = {
        section_id: sectionId,
        completed: true,
        score,
        time_spent: timeSpent,
        attempts: existingIndex >= 0 ? updatedSectionProgress[existingIndex].attempts + 1 : 1,
        completed_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        updatedSectionProgress[existingIndex] = sectionProgressUpdate;
      } else {
        updatedSectionProgress.push(sectionProgressUpdate);
      }

      // Update local state
      const updatedProgress = {
        ...progress,
        section_progress: updatedSectionProgress,
        last_accessed: new Date().toISOString()
      };
      setProgress(updatedProgress);

      // Update in database
      await LessonService.updateProgress(userId, lessonId, {
        section_progress: updatedSectionProgress,
        last_accessed: new Date().toISOString()
      });

    } catch (err) {
      setError('Failed to update section progress');
      console.error('Error updating section progress:', err);
    }
  }, [progress, userId, lessonId]);

  const completeLesson = useCallback(async (
    finalScore: number, 
    totalTime: number
  ) => {
    try {
      // Complete lesson through service
      const success = await LessonService.completeLesson(
        userId, 
        lessonId, 
        finalScore, 
        totalTime
      );

      if (success && progress) {
        // Update local state
        setProgress({
          ...progress,
          status: 'completed' as ProgressStatus,
          score: finalScore,
          time_spent: totalTime,
          completed_at: new Date().toISOString()
        });
      } else {
        setError('Failed to complete lesson');
      }
    } catch (err) {
      setError('Failed to complete lesson');
      console.error('Error completing lesson:', err);
    }
  }, [progress, userId, lessonId]);

  const resetProgress = useCallback(async () => {
    try {      // Reset progress in database
      await LessonService.updateProgress(userId, lessonId, {
        status: 'not_started' as ProgressStatus,
        score: 0,
        time_spent: 0,
        section_progress: []
      });

      // Reload progress
      await loadProgress();
    } catch (err) {
      setError('Failed to reset progress');
      console.error('Error resetting progress:', err);
    }
  }, [userId, lessonId]);

  const getCompletionPercentage = useCallback((): number => {
    if (!progress?.section_progress) return 0;

    const completedSections = progress.section_progress.filter(sp => sp.completed);
    const totalSections = progress.section_progress.length;
    
    if (totalSections === 0) return 0;
    
    return Math.round((completedSections.length / totalSections) * 100);
  }, [progress]);

  const isLessonCompleted = useCallback((): boolean => {
    return progress?.status === 'completed';
  }, [progress]);

  const canProceedToNext = useCallback((): boolean => {
    if (!progress) return false;
    
    // Can proceed if lesson is completed with sufficient score
    return progress.status === 'completed' && progress.score >= 60;
  }, [progress]);

  return {
    progress,
    loading,
    error,
    updateSectionProgress,
    completeLesson,
    resetProgress,
    getCompletionPercentage,
    isLessonCompleted,
    canProceedToNext
  };
};

// Hook for adaptive difficulty tracking
interface UseAdaptiveDifficultyProps {
  userId: string;
  lessonType: LessonType;
}

export const useAdaptiveDifficulty = ({ 
  userId, 
  lessonType 
}: UseAdaptiveDifficultyProps) => {
  const [recommendedDifficulty, setRecommendedDifficulty] = useState<DifficultyLevel>('beginner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedDifficulty();
  }, [userId, lessonType]);

  const loadRecommendedDifficulty = async () => {
    try {
      setLoading(true);
      const difficulty = await LessonService.getAdaptiveDifficulty(userId, lessonType);
      setRecommendedDifficulty(difficulty);
    } catch (error) {
      console.error('Error loading adaptive difficulty:', error);
      // Keep default 'beginner' difficulty
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendedDifficulty,
    loading,
    refreshDifficulty: loadRecommendedDifficulty
  };
};

// Hook for lesson completion analytics
export const useLessonAnalytics = (userId: string) => {
  const [stats, setStats] = useState({
    totalLessonsCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    streakDays: 0,
    strongAreas: [] as string[],
    weakAreas: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // This would typically make multiple API calls to gather analytics
      // For now, we'll implement basic analytics
      
      // Note: This would be expanded with actual analytics queries
      setStats({
        totalLessonsCompleted: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        streakDays: 0,
        strongAreas: [],
        weakAreas: []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refreshAnalytics: loadAnalytics
  };
};
