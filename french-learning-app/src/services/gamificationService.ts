// Stage 7.2: Gamification Service
// Complete gamification system implementation

import { supabase } from './supabase';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  badge_color: string;
  achievement_type: 'beginner' | 'intermediate' | 'advanced' | 'special';
  category: 'learning' | 'streak' | 'social' | 'challenge';
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  progress: number;
  is_claimed: boolean;
  achievement?: Achievement;
}

export interface DailyChallenge {
  id: number;
  challenge_date: string;
  title: string;
  description: string;
  requirements: any;
  reward_points: number;
  challenge_type: 'lesson' | 'vocabulary' | 'streak' | 'accuracy';
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
}

export interface UserChallengeCompletion {
  id: number;
  user_id: string;
  challenge_id: number;
  completed_at: string;
  points_earned: number;
  performance_data: any;
  challenge?: DailyChallenge;
}

export interface LeaderboardEntry {
  id: number;
  user_id: string;
  username?: string;
  leaderboard_type: 'weekly' | 'monthly' | 'all_time' | 'streak';
  period_start: string;
  period_end: string;
  score: number;
  rank: number;
  additional_data: any;
  created_at: string;
}

export interface StreakShield {
  id: number;
  user_id: string;
  earned_at: string;
  used_at?: string;
  shield_type: 'daily' | 'weekly';
  is_used: boolean;
}

export interface UserGamificationStats {
  id: number;
  user_id: string;
  total_achievements: number;
  current_streak: number;
  longest_streak: number;
  total_shields: number;
  used_shields: number;
  weekly_points: number;
  monthly_points: number;
  total_study_time: number;
  lessons_completed_today: number;
  last_activity_date: string;
  streak_freeze_used: boolean;
  updated_at: string;
}

export interface MilestoneReward {
  id: number;
  milestone_type: 'points' | 'streak' | 'level' | 'achievements';
  threshold_value: number;
  reward_type: 'points' | 'badge' | 'content' | 'feature';
  reward_data: any;
  description: string;
  is_active: boolean;
}

export interface UserMilestoneCompletion {
  id: number;
  user_id: string;
  milestone_id: number;
  completed_at: string;
  reward_claimed: boolean;
  milestone?: MilestoneReward;
}

export interface PointsEarned {
  base_points: number;
  streak_multiplier: number;
  accuracy_bonus: number;
  perfect_score_bonus: number;
  total_points: number;
  achievements_unlocked: Achievement[];
  milestones_reached: MilestoneReward[];
}

class GamificationService {
  // Achievement Management
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('achievement_type', { ascending: true })
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  async checkAndUnlockAchievements(userId: string, activityData: any): Promise<Achievement[]> {
    try {
      const unlockedAchievements: Achievement[] = [];
      
      // Get user stats
      const stats = await this.getUserGamificationStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);
      
      // Get all available achievements
      const allAchievements = await this.getAllAchievements();
      const availableAchievements = allAchievements.filter(a => !earnedAchievementIds.includes(a.id));

      // Check each achievement criteria
      for (const achievement of availableAchievements) {
        let shouldUnlock = false;

        switch (achievement.name) {
          case 'First Steps':
            shouldUnlock = activityData.lessonCompleted && activityData.isFirstLesson;
            break;
          case 'Vocabulary Builder':
            shouldUnlock = activityData.totalVocabularyLearned >= 50;
            break;
          case 'Grammar Explorer':
            shouldUnlock = activityData.grammarExercisesCompleted >= 10;
            break;
          case 'Pronunciation Pioneer':
            shouldUnlock = activityData.pronunciationExercisesCompleted >= 5;
            break;
          case 'Consistent Learner':
            shouldUnlock = stats.current_streak >= 7;
            break;
          case 'Conversation Starter':
            shouldUnlock = activityData.conversationCompleted && activityData.isFirstConversation;
            break;
          case 'Culture Enthusiast':
            shouldUnlock = activityData.culturalLessonsCompleted >= 5;
            break;
          case 'Grammar Master':
            shouldUnlock = activityData.perfectGrammarScores >= 20;
            break;
          case 'Speed Learner':
            shouldUnlock = stats.lessons_completed_today >= 10;
            break;
          case 'Dedicated Student':
            shouldUnlock = stats.current_streak >= 30;
            break;
          // Add more achievement checks as needed
        }

        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
          unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  async unlockAchievement(userId: string, achievementId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          progress: 100,
          is_claimed: false
        });

      if (error) throw error;

      // Update user stats
      await this.updateUserGamificationStats(userId, { total_achievements: 1 });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Points and Experience System
  async calculatePointsEarned(
    userId: string,
    activity: string,
    basePoints: number,
    activityData: any = {}
  ): Promise<PointsEarned> {
    try {
      const stats = await this.getUserGamificationStats(userId);
      
      // Calculate streak multiplier
      let streakMultiplier = 1;
      if (stats.current_streak >= 30) streakMultiplier = 2.0;
      else if (stats.current_streak >= 14) streakMultiplier = 1.75;
      else if (stats.current_streak >= 7) streakMultiplier = 1.5;
      else if (stats.current_streak >= 3) streakMultiplier = 1.25;

      // Calculate accuracy bonus
      let accuracyBonus = 0;
      if (activityData.accuracy && activityData.accuracy > 70) {
        accuracyBonus = (activityData.accuracy - 70) * 0.5;
      }

      // Calculate perfect score bonus
      let perfectScoreBonus = 0;
      if (activityData.isPerfectScore) {
        perfectScoreBonus = basePoints * 0.5;
      }

      // Apply activity-specific bonuses
      let finalBasePoints = basePoints;
      switch (activity) {
        case 'lesson_completion':
          if (activityData.isPerfectScore) finalBasePoints += 25;
          break;
        case 'vocabulary_quiz':
          if (activityData.streakCount >= 5) finalBasePoints += 5;
          break;
        case 'grammar_exercise':
          if (activityData.isFirstAttempt) finalBasePoints += 10;
          break;
        case 'pronunciation_practice':
          if (activityData.accuracy > 90) finalBasePoints += 15;
          break;
        case 'daily_challenge':
          if (activityData.hasStreak) finalBasePoints += 50;
          break;
        case 'conversation_practice':
          if (activityData.exchangeCount >= 10) finalBasePoints += 25;
          break;
      }

      const totalPoints = Math.round(
        (finalBasePoints * streakMultiplier) + accuracyBonus + perfectScoreBonus
      );

      // Update user points
      await this.addPointsToUser(userId, totalPoints);

      // Check for achievements and milestones
      const achievementsUnlocked = await this.checkAndUnlockAchievements(userId, {
        ...activityData,
        pointsEarned: totalPoints,
        activity
      });

      const milestonesReached = await this.checkMilestones(userId);

      return {
        base_points: finalBasePoints,
        streak_multiplier: streakMultiplier,
        accuracy_bonus: accuracyBonus,
        perfect_score_bonus: perfectScoreBonus,
        total_points: totalPoints,
        achievements_unlocked: achievementsUnlocked,
        milestones_reached: milestonesReached
      };
    } catch (error) {
      console.error('Error calculating points:', error);
      throw error;
    }
  }
  async addPointsToUser(userId: string, points: number): Promise<void> {
    try {
      // Get current points first
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update profile points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          points: (profile?.points || 0) + points
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Get current stats
      const { data: stats, error: statsError } = await supabase
        .from('user_gamification_stats')
        .select('weekly_points, monthly_points')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;

      // Update gamification stats
      const { error: updateError } = await supabase
        .from('user_gamification_stats')
        .update({
          weekly_points: (stats?.weekly_points || 0) + points,
          monthly_points: (stats?.monthly_points || 0) + points,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error adding points to user:', error);
      throw error;
    }
  }

  // Streak Management
  async updateUserStreak(userId: string, activityDate: Date = new Date()): Promise<{ streakUpdated: boolean; newStreak: number; shieldsEarned: number }> {
    try {
      const stats = await this.getUserGamificationStats(userId);
      const today = activityDate.toISOString().split('T')[0];
      const lastActivity = new Date(stats.last_activity_date);
      const daysDiff = Math.floor((activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = stats.current_streak;
      let shieldsEarned = 0;
      let streakUpdated = false;

      if (daysDiff === 1 || (daysDiff === 0 && stats.last_activity_date !== today)) {
        // Continue streak
        newStreak = stats.current_streak + 1;
        streakUpdated = true;

        // Award streak shield every 7 days
        if (newStreak % 7 === 0) {
          await this.awardStreakShield(userId, 'daily');
          shieldsEarned = 1;
        }
      } else if (daysDiff > 1) {
        // Check if user has shields to protect streak
        const shields = await this.getUnusedStreakShields(userId);
        if (shields.length > 0) {
          // Use a shield to protect streak
          await this.useStreakShield(userId, shields[0].id);
          streakUpdated = true;
        } else {
          // Reset streak
          newStreak = 1;
          streakUpdated = true;
        }
      }

      // Update stats
      await supabase
        .from('user_gamification_stats')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, stats.longest_streak),
          last_activity_date: today,
          total_shields: stats.total_shields + shieldsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return { streakUpdated, newStreak, shieldsEarned };
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  }

  async getUnusedStreakShields(userId: string): Promise<StreakShield[]> {
    try {
      const { data, error } = await supabase
        .from('streak_shields')
        .select('*')
        .eq('user_id', userId)
        .eq('is_used', false)
        .order('earned_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching streak shields:', error);
      return [];
    }
  }

  async awardStreakShield(userId: string, shieldType: 'daily' | 'weekly'): Promise<void> {
    try {
      const { error } = await supabase
        .from('streak_shields')
        .insert({
          user_id: userId,
          shield_type: shieldType
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error awarding streak shield:', error);
    }
  }
  async useStreakShield(userId: string, shieldId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('streak_shields')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', shieldId);

      if (error) throw error;

      // Get current stats and update shields used
      const { data: stats, error: fetchError } = await supabase
        .from('user_gamification_stats')
        .select('used_shields')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update user stats
      const { error: updateError } = await supabase
        .from('user_gamification_stats')
        .update({
          used_shields: (stats?.used_shields || 0) + 1
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error using streak shield:', error);
    }
  }

  // Daily Challenges
  async getTodayChallenge(): Promise<DailyChallenge | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching today challenge:', error);
      return null;
    }
  }

  async getUserChallengeProgress(userId: string, challengeId: number): Promise<UserChallengeCompletion | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching user challenge progress:', error);
      return null;
    }
  }

  async completeChallenge(userId: string, challengeId: number, performanceData: any): Promise<boolean> {
    try {
      const challenge = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (!challenge.data) return false;

      const { error } = await supabase
        .from('user_challenge_completions')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          points_earned: challenge.data.reward_points,
          performance_data: performanceData
        });

      if (error) throw error;

      // Award points
      await this.addPointsToUser(userId, challenge.data.reward_points);

      return true;
    } catch (error) {
      console.error('Error completing challenge:', error);
      return false;
    }
  }

  // Leaderboards
  async getLeaderboard(type: 'weekly' | 'monthly' | 'all_time' | 'streak', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          profiles:user_id(username, level)
        `)
        .eq('leaderboard_type', type)
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async updateLeaderboards(): Promise<void> {
    try {
      // This would typically be run as a scheduled function
      // For now, we'll implement basic leaderboard update logic
      
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Weekly leaderboard
      await this.updateLeaderboardForPeriod('weekly', weekStart, new Date());
      
      // Monthly leaderboard
      await this.updateLeaderboardForPeriod('monthly', monthStart, new Date());
    } catch (error) {
      console.error('Error updating leaderboards:', error);
    }
  }

  private async updateLeaderboardForPeriod(type: string, startDate: Date, endDate: Date): Promise<void> {
    // Implementation would fetch user stats for the period and update leaderboard_entries
    // This is a simplified version
  }

  // User Stats
  async getUserGamificationStats(userId: string): Promise<UserGamificationStats> {
    try {
      const { data, error } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no stats exist, create them
        if (error.code === 'PGRST116') {
          const { data: newStats, error: insertError } = await supabase
            .from('user_gamification_stats')
            .insert({ user_id: userId })
            .select()
            .single();

          if (insertError) throw insertError;
          return newStats;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user gamification stats:', error);
      throw error;
    }
  }

  async updateUserGamificationStats(userId: string, updates: Partial<UserGamificationStats>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_gamification_stats')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user gamification stats:', error);
      throw error;
    }
  }

  // Milestones
  async checkMilestones(userId: string): Promise<MilestoneReward[]> {
    try {
      const reachedMilestones: MilestoneReward[] = [];
      
      // Get user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', userId)
        .single();

      const stats = await this.getUserGamificationStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      
      // Get completed milestones
      const { data: completedMilestones } = await supabase
        .from('user_milestone_completions')
        .select('milestone_id')
        .eq('user_id', userId);

      const completedMilestoneIds = completedMilestones?.map(cm => cm.milestone_id) || [];

      // Get all milestones
      const { data: allMilestones } = await supabase
        .from('milestone_rewards')
        .select('*')
        .eq('is_active', true);

      // Check each milestone
      for (const milestone of allMilestones || []) {
        if (completedMilestoneIds.includes(milestone.id)) continue;

        let shouldUnlock = false;

        switch (milestone.milestone_type) {
          case 'points':
            shouldUnlock = (profile?.points || 0) >= milestone.threshold_value;
            break;
          case 'streak':
            shouldUnlock = stats.current_streak >= milestone.threshold_value;
            break;
          case 'level':
            const levelNumber = this.getLevelNumber(profile?.level || 'beginner');
            shouldUnlock = levelNumber >= milestone.threshold_value;
            break;
          case 'achievements':
            shouldUnlock = userAchievements.length >= milestone.threshold_value;
            break;
        }

        if (shouldUnlock) {
          await this.completeMilestone(userId, milestone.id);
          reachedMilestones.push(milestone);
        }
      }

      return reachedMilestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return [];
    }
  }

  private getLevelNumber(level: string): number {
    const levelMap: { [key: string]: number } = {
      'beginner': 1,
      'elementary': 2,
      'pre-intermediate': 3,
      'intermediate': 4,
      'upper-intermediate': 5,
      'advanced': 6,
      'expert': 7
    };
    return levelMap[level] || 1;
  }

  async completeMilestone(userId: string, milestoneId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_milestone_completions')
        .insert({
          user_id: userId,
          milestone_id: milestoneId,
          reward_claimed: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  }
}

export const gamificationService = new GamificationService();
