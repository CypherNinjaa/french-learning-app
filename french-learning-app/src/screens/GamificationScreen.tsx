import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { ModernCard, ModernButton } from "../components/ModernUI";
import {
	AchievementBadge,
	AchievementModal,
	StreakDisplay,
	DailyChallengeCard,
	PointsAnimation,
	LevelProgress,
} from "../components/GamificationUI";
import { useGamification } from "../hooks/useGamification";
import { Achievement } from "../services/gamificationService";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

export const GamificationScreen: React.FC = () => {
	const {
		achievements,
		dailyChallenge,
		stats,
		completeActivity,
		getUserLevel,
		refreshAll,
		isLoading,
	} = useGamification();

	const [selectedAchievement, setSelectedAchievement] =
		useState<Achievement | null>(null);
	const [showAchievementModal, setShowAchievementModal] = useState(false);
	const [pointsAnimation, setPointsAnimation] = useState({
		visible: false,
		points: 0,
	});
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const levelInfo = getUserLevel();

	const handleRefresh = async () => {
		try {
			setError(null);
			setRefreshing(true);
			await refreshAll();
		} catch (e) {
			setError("Failed to refresh gamification data. Please try again.");
		} finally {
			setRefreshing(false);
		}
	};

	const handleAchievementPress = (achievement: Achievement) => {
		setSelectedAchievement(achievement);
		setShowAchievementModal(true);
	};

	const handleDailyChallengeComplete = async () => {
		if (!dailyChallenge.todayChallenge) return;

		try {
			const result = await dailyChallenge.completeChallenge({
				completedAt: new Date().toISOString(),
				score: 100,
				timeSpent: 300, // 5 minutes
			});

			if (result) {
				// Show points animation
				setPointsAnimation({
					visible: true,
					points: dailyChallenge.todayChallenge.reward_points,
				});

				// Refresh data
				await refreshAll();
			}
		} catch (error) {
			console.error("Error completing daily challenge:", error);
		}
	};

	const handleUseStreakShield = async (shieldId: number) => {
		try {
			// This would be implemented in the stats hook
			console.log("Using streak shield:", shieldId);
			await stats.refresh();
		} catch (error) {
			console.error("Error using streak shield:", error);
		}
	};

	const getAchievementProgress = (achievement: Achievement): number => {
		const userAchievement = achievements.userAchievements.find(
			(ua) => ua.achievement_id === achievement.id
		);
		return userAchievement ? userAchievement.progress : 0;
	};

	const isAchievementUnlocked = (achievement: Achievement): boolean => {
		return achievements.isAchievementUnlocked(achievement.id);
	};

	const renderAchievementsSection = () => (
		<ModernCard style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<Ionicons name="trophy" size={24} color={theme.colors.primary} />
				<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
					Achievements
				</Text>
			</View>

			<View style={styles.achievementGrid}>
				{achievements.achievements.slice(0, 6).map((achievement) => (
					<AchievementBadge
						key={achievement.id}
						achievement={achievement}
						isUnlocked={isAchievementUnlocked(achievement)}
						progress={getAchievementProgress(achievement)}
						size="medium"
						onPress={() => handleAchievementPress(achievement)}
					/>
				))}
			</View>

			<ModernButton
				title="View All Achievements"
				variant="secondary"
				size="small"
				onPress={() => {
					/* Navigate to achievements screen */
				}}
				icon="arrow-forward"
			/>
		</ModernCard>
	);

	const renderStreakSection = () => (
		<ModernCard style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<Ionicons name="flame" size={24} color={theme.colors.warning} />
				<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
					Daily Streak
				</Text>
			</View>
			{stats.stats && (
				<StreakDisplay
					currentStreak={stats.stats.current_streak || 0}
					longestStreak={stats.stats.longest_streak || 0}
					shields={[]} // TODO: Implement shield fetching
					onUseShield={handleUseStreakShield}
					size="full"
				/>
			)}
		</ModernCard>
	);

	const renderDailyChallengeSection = () => (
		<ModernCard style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<Ionicons name="calendar" size={24} color={theme.colors.success} />
				<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
					Daily Challenge
				</Text>
			</View>

			{dailyChallenge.todayChallenge ? (
				<DailyChallengeCard
					challenge={dailyChallenge.todayChallenge}
					isCompleted={dailyChallenge.isCompleted}
					onComplete={handleDailyChallengeComplete}
				/>
			) : (
				<Text
					style={[
						styles.noChallengeText,
						{ color: theme.colors.textSecondary },
					]}
				>
					No daily challenge available
				</Text>
			)}
		</ModernCard>
	);

	const renderLevelSection = () => (
		<ModernCard style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<Ionicons name="ribbon" size={24} color={theme.colors.primary} />
				<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
					Level Progress
				</Text>
			</View>

			<LevelProgress
				level={levelInfo.level}
				levelName={levelInfo.name}
				currentPoints={levelInfo.currentPoints || 0}
				nextLevelPoints={levelInfo.nextLevelPoints}
				progress={levelInfo.progress}
			/>
		</ModernCard>
	);

	const renderStatsSection = () => (
		<ModernCard style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<Ionicons name="stats-chart" size={24} color={theme.colors.info} />
				<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
					Your Stats
				</Text>
			</View>

			{stats.stats && (
				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<Text style={[styles.statValue, { color: theme.colors.primary }]}>
							{stats.stats.weekly_points || 0}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Weekly Points
						</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={[styles.statValue, { color: theme.colors.success }]}>
							{stats.stats.monthly_points || 0}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Monthly Points
						</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={[styles.statValue, { color: theme.colors.warning }]}>
							{achievements.userAchievements.length}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Achievements
						</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={[styles.statValue, { color: theme.colors.error }]}>
							{stats.stats.longest_streak || 0}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Best Streak
						</Text>
					</View>
				</View>
			)}
		</ModernCard>
	);

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<ErrorState
				title="Gamification Error"
				description={error}
				onRetry={handleRefresh}
			/>
		);
	}

	if (!stats.stats && !achievements.achievements.length) {
		return (
			<EmptyState
				title="No Gamification Data"
				description="No gamification data found. Start learning to unlock achievements and stats!"
				onRetry={handleRefresh}
			/>
		);
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				<View style={styles.header}>
					<Text style={[styles.title, { color: theme.colors.text }]}>
						🎮 Gamification
					</Text>
					<Text
						style={[styles.subtitle, { color: theme.colors.textSecondary }]}
					>
						Track your progress and achievements
					</Text>
				</View>

				{renderLevelSection()}
				{renderStreakSection()}
				{renderDailyChallengeSection()}
				{renderAchievementsSection()}
				{renderStatsSection()}
			</ScrollView>

			{/* Achievement Modal */}
			<AchievementModal
				achievement={selectedAchievement}
				visible={showAchievementModal}
				onClose={() => setShowAchievementModal(false)}
				isUnlocked={
					selectedAchievement
						? isAchievementUnlocked(selectedAchievement)
						: false
				}
				progress={
					selectedAchievement ? getAchievementProgress(selectedAchievement) : 0
				}
			/>

			{/* Points Animation */}
			<PointsAnimation
				points={pointsAnimation.points}
				visible={pointsAnimation.visible}
				onComplete={() => setPointsAnimation({ visible: false, points: 0 })}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
	},
	header: {
		padding: 20,
		paddingBottom: 10,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
	},
	sectionCard: {
		margin: 16,
		padding: 20,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginLeft: 12,
	},
	achievementGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	noChallengeText: {
		textAlign: "center",
		fontSize: 16,
		marginVertical: 20,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	statItem: {
		width: "48%",
		alignItems: "center",
		padding: 16,
		marginBottom: 12,
		borderRadius: 12,
		backgroundColor: "rgba(0,0,0,0.05)",
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		textAlign: "center",
	},
});
