// Stage 7.2: Gamification Hooks
// React hooks for easy gamification integration

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  gamificationService, 
  Achievement, 
  UserAchievement, 
  DailyChallenge, 
  UserGamificationStats, 
  LeaderboardEntry, 
  StreakShield,
  PointsEarned 
} from '../services/gamificationService';

// Hook for user achievements
export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [allAchievements, userAchievements] = await Promise.all([
        gamificationService.getAllAchievements(),
        gamificationService.getUserAchievements(user.id)
      ]);

      setAchievements(allAchievements);
      setUserAchievements(userAchievements);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const unlockAchievement = useCallback(async (achievementId: number) => {
    if (!user) return false;

    try {
      await gamificationService.unlockAchievement(user.id, achievementId);
      await loadAchievements(); // Refresh achievements
      return true;
    } catch (err) {
      console.error('Error unlocking achievement:', err);
      return false;
    }
  }, [user, loadAchievements]);

  // Get progress for achievements that aren't unlocked yet
  const getAchievementProgress = useCallback((achievementId: number) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement ? userAchievement.progress : 0;
  }, [userAchievements]);

  // Check if achievement is unlocked
  const isAchievementUnlocked = useCallback((achievementId: number) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  }, [userAchievements]);

  // Get achievements by category
  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  // Get achievements by type
  const getAchievementsByType = useCallback((type: string) => {
    return achievements.filter(a => a.achievement_type === type);
  }, [achievements]);

  return {
    achievements,
    userAchievements,
    loading,
    error,
    unlockAchievement,
    getAchievementProgress,
    isAchievementUnlocked,
    getAchievementsByCategory,
    getAchievementsByType,
    refresh: loadAchievements
  };
};

// Hook for daily challenges
export const useDailyChallenge = () => {
  const { user } = useAuth();
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayChallenge = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const challenge = await gamificationService.getTodayChallenge();
      setTodayChallenge(challenge);

      if (challenge) {
        const progress = await gamificationService.getUserChallengeProgress(user.id, challenge.id);
        setChallengeProgress(progress);
        setIsCompleted(!!progress);
      }
    } catch (err) {
      console.error('Error loading today challenge:', err);
      setError('Failed to load daily challenge');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTodayChallenge();
  }, [loadTodayChallenge]);

  const completeChallenge = useCallback(async (performanceData: any) => {
    if (!user || !todayChallenge || isCompleted) return false;

    try {
      const success = await gamificationService.completeChallenge(
        user.id, 
        todayChallenge.id, 
        performanceData
      );

      if (success) {
        setIsCompleted(true);
        await loadTodayChallenge(); // Refresh data
      }

      return success;
    } catch (err) {
      console.error('Error completing challenge:', err);
      return false;
    }
  }, [user, todayChallenge, isCompleted, loadTodayChallenge]);

  return {
    todayChallenge,
    challengeProgress,
    isCompleted,
    loading,
    error,
    completeChallenge,
    refresh: loadTodayChallenge
  };
};

// Hook for user gamification stats
export const useGamificationStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [streakShields, setStreakShields] = useState<StreakShield[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [userStats, shields] = await Promise.all([
        gamificationService.getUserGamificationStats(user.id),
        gamificationService.getUnusedStreakShields(user.id)
      ]);

      setStats(userStats);
      setStreakShields(shields);
    } catch (err) {
      console.error('Error loading gamification stats:', err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateStreak = useCallback(async (activityDate?: Date) => {
    if (!user) return null;

    try {
      const result = await gamificationService.updateUserStreak(user.id, activityDate);
      await loadStats(); // Refresh stats
      return result;
    } catch (err) {
      console.error('Error updating streak:', err);
      return null;
    }
  }, [user, loadStats]);

  const useShield = useCallback(async (shieldId: number) => {
    if (!user) return false;

    try {
      await gamificationService.useStreakShield(user.id, shieldId);
      await loadStats(); // Refresh stats
      return true;
    } catch (err) {
      console.error('Error using shield:', err);
      return false;
    }
  }, [user, loadStats]);

  return {
    stats,
    streakShields,
    loading,
    error,
    updateStreak,
    useShield,
    refresh: loadStats
  };
};

// Hook for points and experience
export const usePointsSystem = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const earnPoints = useCallback(async (
    activity: string, 
    basePoints: number, 
    activityData: any = {}
  ): Promise<PointsEarned | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const result = await gamificationService.calculatePointsEarned(
        user.id, 
        activity, 
        basePoints, 
        activityData
      );

      return result;
    } catch (err) {
      console.error('Error earning points:', err);
      setError('Failed to calculate points');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    earnPoints,
    loading,
    error
  };
};

// Hook for leaderboards
export const useLeaderboard = (type: 'weekly' | 'monthly' | 'all_time' | 'streak', limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await gamificationService.getLeaderboard(type, limit);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refresh: loadLeaderboard
  };
};

// Hook for overall gamification integration
export const useGamification = () => {
  const achievements = useAchievements();
  const dailyChallenge = useDailyChallenge();
  const stats = useGamificationStats();
  const pointsSystem = usePointsSystem();

  // Complete activity with full gamification integration
  const completeActivity = useCallback(async (
    activity: string,
    basePoints: number,
    activityData: any = {}
  ) => {
    try {
      // Update streak
      const streakResult = await stats.updateStreak();
      
      // Calculate and award points
      const pointsResult = await pointsSystem.earnPoints(activity, basePoints, {
        ...activityData,
        streakInfo: streakResult
      });

      // Refresh all data
      await Promise.all([
        achievements.refresh(),
        dailyChallenge.refresh(),
        stats.refresh()
      ]);

      return {
        pointsEarned: pointsResult,
        streakUpdated: streakResult,
        newAchievements: pointsResult?.achievements_unlocked || [],
        milestonesReached: pointsResult?.milestones_reached || []
      };
    } catch (error) {
      console.error('Error completing activity:', error);
      return null;
    }
  }, [achievements, dailyChallenge, stats, pointsSystem]);

  // Get user level based on points
  const getUserLevel = useCallback(() => {
    if (!stats.stats) return { level: 1, name: 'Beginner', progress: 0, nextLevelPoints: 1000 };

    // Get user points from profile
    const userPoints = stats.stats.weekly_points + stats.stats.monthly_points; // This would be total points in practice
    
    const levels = [
      { level: 1, name: 'Beginner', range: [0, 999] },
      { level: 2, name: 'Elementary', range: [1000, 2499] },
      { level: 3, name: 'Pre-Intermediate', range: [2500, 4999] },
      { level: 4, name: 'Intermediate', range: [5000, 9999] },
      { level: 5, name: 'Upper-Intermediate', range: [10000, 19999] },
      { level: 6, name: 'Advanced', range: [20000, 39999] },
      { level: 7, name: 'Expert', range: [40000, Infinity] }
    ];

    const currentLevel = levels.find(l => userPoints >= l.range[0] && userPoints <= l.range[1]) || levels[0];
    const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
    
    const progress = nextLevel 
      ? ((userPoints - currentLevel.range[0]) / (nextLevel.range[0] - currentLevel.range[0])) * 100
      : 100;

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      progress: Math.min(progress, 100),
      nextLevelPoints: nextLevel ? nextLevel.range[0] : null,
      currentPoints: userPoints
    };
  }, [stats.stats]);

  const isLoading = achievements.loading || dailyChallenge.loading || stats.loading;
  const hasError = achievements.error || dailyChallenge.error || stats.error;

  return {
    // Individual hooks
    achievements,
    dailyChallenge,
    stats,
    pointsSystem,
    
    // Combined functionality
    completeActivity,
    getUserLevel,
    
    // Overall state
    isLoading,
    hasError,
    
    // Refresh all data
    refreshAll: useCallback(async () => {
      await Promise.all([
        achievements.refresh(),
        dailyChallenge.refresh(),
        stats.refresh()
      ]);
    }, [achievements, dailyChallenge, stats])
  };
};
