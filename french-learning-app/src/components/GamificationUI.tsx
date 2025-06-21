// Stage 7.2: Gamification UI Components
// Modern UI components for achievements, streaks, and progress

import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Modal,
	Animated,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { ModernCard, ModernButton, ModernProgressBar } from "./ModernUI";
import {
	Achievement,
	UserAchievement,
	DailyChallenge,
	StreakShield,
} from "../services/gamificationService";

const { width: screenWidth } = Dimensions.get("window");

// Achievement Badge Component
interface AchievementBadgeProps {
	achievement: Achievement;
	isUnlocked: boolean;
	progress?: number;
	onPress?: () => void;
	size?: "small" | "medium" | "large";
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
	achievement,
	isUnlocked,
	progress = 0,
	onPress,
	size = "medium",
}) => {
	const { theme } = useTheme();

	const sizes = {
		small: { container: 60, icon: 24, text: 10 },
		medium: { container: 80, icon: 32, text: 12 },
		large: { container: 100, icon: 40, text: 14 },
	};

	const sizeConfig = sizes[size];

	const badgeStyle = [
		styles.achievementBadge,
		{
			width: sizeConfig.container,
			height: sizeConfig.container,
			backgroundColor: isUnlocked
				? achievement.badge_color
				: theme.colors.surfaceSecondary,
			borderColor: isUnlocked ? achievement.badge_color : theme.colors.border,
			opacity: isUnlocked ? 1 : 0.6,
		},
	];

	return (
		<TouchableOpacity style={badgeStyle} onPress={onPress} disabled={!onPress}>
			<Text style={[styles.achievementIcon, { fontSize: sizeConfig.icon }]}>
				{achievement.icon}
			</Text>
			{!isUnlocked && progress > 0 && (
				<View
					style={[
						styles.progressOverlay,
						{ backgroundColor: theme.colors.overlay },
					]}
				>
					<Text
						style={[
							styles.progressText,
							{
								color: theme.colors.white,
								fontSize: sizeConfig.text,
							},
						]}
					>
						{Math.round(progress)}%
					</Text>
				</View>
			)}
			{isUnlocked && (
				<View style={styles.unlockedIndicator}>
					<Ionicons
						name="checkmark-circle"
						size={16}
						color={theme.colors.success}
					/>
				</View>
			)}
		</TouchableOpacity>
	);
};

// Achievement Detail Modal
interface AchievementModalProps {
	achievement: Achievement | null;
	isUnlocked: boolean;
	progress: number;
	visible: boolean;
	onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
	achievement,
	isUnlocked,
	progress,
	visible,
	onClose,
}) => {
	const { theme } = useTheme();

	if (!achievement) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View
				style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
			>
				<ModernCard
					style={
						[
							styles.achievementModalCard,
							{ backgroundColor: theme.colors.surface },
						] as any
					}
				>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Ionicons
							name="close"
							size={24}
							color={theme.colors.textSecondary}
						/>
					</TouchableOpacity>

					<View style={styles.modalHeader}>
						<AchievementBadge
							achievement={achievement}
							isUnlocked={isUnlocked}
							progress={progress}
							size="large"
						/>
						<Text
							style={[styles.achievementTitle, { color: theme.colors.text }]}
						>
							{achievement.name}
						</Text>
						<Text
							style={[
								styles.achievementDescription,
								{ color: theme.colors.textSecondary },
							]}
						>
							{achievement.description}
						</Text>
					</View>

					<View style={styles.achievementDetails}>
						<View style={styles.detailRow}>
							<Text
								style={[
									styles.detailLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Points Reward:
							</Text>
							<Text
								style={[styles.detailValue, { color: theme.colors.primary }]}
							>
								{achievement.points_required}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text
								style={[
									styles.detailLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Category:
							</Text>
							<Text style={[styles.detailValue, { color: theme.colors.text }]}>
								{achievement.category}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text
								style={[
									styles.detailLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Type:
							</Text>
							<Text style={[styles.detailValue, { color: theme.colors.text }]}>
								{achievement.achievement_type}
							</Text>
						</View>
						{!isUnlocked && (
							<View style={styles.achievementProgressSection}>
								<Text
									style={[
										styles.detailLabel,
										{ color: theme.colors.textSecondary },
									]}
								>
									Progress:
								</Text>
								<ModernProgressBar
									progress={progress / 100}
									height={8}
									style={styles.progressBar}
								/>
								<Text
									style={[
										styles.progressPercentage,
										{ color: theme.colors.primary },
									]}
								>
									{Math.round(progress)}%
								</Text>
							</View>
						)}
					</View>

					<ModernButton
						title={isUnlocked ? "Achieved!" : "Keep Going!"}
						variant={isUnlocked ? "success" : "primary"}
						onPress={onClose}
						disabled={isUnlocked}
						icon={isUnlocked ? "checkmark-circle" : "arrow-forward"}
					/>
				</ModernCard>
			</View>
		</Modal>
	);
};

// Streak Display Component
interface StreakDisplayProps {
	currentStreak: number;
	longestStreak: number;
	shields: StreakShield[];
	onUseShield?: (shieldId: number) => void;
	size?: "compact" | "full";
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
	currentStreak,
	longestStreak,
	shields,
	onUseShield,
	size = "full",
}) => {
	const { theme } = useTheme();

	const getStreakColor = (streak: number) => {
		if (streak >= 30) return theme.colors.error;
		if (streak >= 14) return theme.colors.warning;
		if (streak >= 7) return theme.colors.primary;
		if (streak >= 3) return theme.colors.success;
		return theme.colors.textSecondary;
	};

	const getStreakIcon = (streak: number) => {
		if (streak >= 30) return "🔥🔥🔥";
		if (streak >= 14) return "🔥🔥";
		if (streak >= 7) return "🔥";
		if (streak >= 3) return "⚡";
		return "📚";
	};

	if (size === "compact") {
		return (
			<View style={styles.streakCompact}>
				<Text style={[styles.streakIcon, { fontSize: 24 }]}>
					{getStreakIcon(currentStreak)}
				</Text>
				<Text
					style={[
						styles.streakNumber,
						{ color: getStreakColor(currentStreak) },
					]}
				>
					{currentStreak}
				</Text>
				<Text
					style={[styles.streakLabel, { color: theme.colors.textSecondary }]}
				>
					days
				</Text>
			</View>
		);
	}

	return (
		<ModernCard style={styles.streakCard}>
			<View style={styles.streakHeader}>
				<Text style={[styles.streakTitle, { color: theme.colors.text }]}>
					Current Streak
				</Text>
				{shields.length > 0 && (
					<View style={styles.shieldsContainer}>
						<Ionicons name="shield" size={16} color={theme.colors.warning} />
						<Text
							style={[styles.shieldsCount, { color: theme.colors.warning }]}
						>
							{shields.length}
						</Text>
					</View>
				)}
			</View>

			<View style={styles.streakContent}>
				<Text style={[styles.streakIconLarge, { fontSize: 48 }]}>
					{getStreakIcon(currentStreak)}
				</Text>
				<Text
					style={[
						styles.streakNumberLarge,
						{ color: getStreakColor(currentStreak) },
					]}
				>
					{currentStreak}
				</Text>
				<Text
					style={[
						styles.streakLabelLarge,
						{ color: theme.colors.textSecondary },
					]}
				>
					{currentStreak === 1 ? "day" : "days"} in a row
				</Text>
			</View>

			<View style={styles.streakStats}>
				<View style={styles.statItem}>
					<Text style={[styles.statValue, { color: theme.colors.text }]}>
						{longestStreak}
					</Text>
					<Text
						style={[styles.statLabel, { color: theme.colors.textSecondary }]}
					>
						Longest
					</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={[styles.statValue, { color: theme.colors.text }]}>
						{shields.length}
					</Text>
					<Text
						style={[styles.statLabel, { color: theme.colors.textSecondary }]}
					>
						Shields
					</Text>
				</View>
			</View>

			{shields.length > 0 && onUseShield && (
				<ModernButton
					title="Use Shield to Protect Streak"
					variant="outline"
					size="small"
					icon="shield"
					onPress={() => onUseShield(shields[0].id)}
				/>
			)}
		</ModernCard>
	);
};

// Daily Challenge Card
interface DailyChallengeCardProps {
	challenge: DailyChallenge;
	isCompleted: boolean;
	progress?: any;
	onComplete?: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
	challenge,
	isCompleted,
	progress,
	onComplete,
}) => {
	const { theme } = useTheme();

	const getChallengeIcon = (type: string) => {
		switch (type) {
			case "lesson":
				return "book";
			case "vocabulary":
				return "library";
			case "streak":
				return "flame";
			case "accuracy":
				return "target";
			default:
				return "trophy";
		}
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return theme.colors.success;
			case "intermediate":
				return theme.colors.warning;
			case "advanced":
				return theme.colors.error;
			default:
				return theme.colors.primary;
		}
	};

	return (
		<ModernCard
			style={
				[
					styles.challengeCard,
					isCompleted && { backgroundColor: theme.colors.success + "20" },
				] as any
			}
		>
			<View style={styles.challengeHeader}>
				<View
					style={[
						styles.challengeIcon,
						{
							backgroundColor:
								getDifficultyColor(challenge.difficulty_level) + "20",
						},
					]}
				>
					<Ionicons
						name={getChallengeIcon(challenge.challenge_type) as any}
						size={24}
						color={getDifficultyColor(challenge.difficulty_level)}
					/>
				</View>
				<View style={styles.challengeInfo}>
					<Text style={[styles.challengeTitle, { color: theme.colors.text }]}>
						{challenge.title}
					</Text>
					<Text
						style={[
							styles.challengeDescription,
							{ color: theme.colors.textSecondary },
						]}
					>
						{challenge.description}
					</Text>
				</View>
				{isCompleted && (
					<Ionicons
						name="checkmark-circle"
						size={24}
						color={theme.colors.success}
					/>
				)}
			</View>

			<View style={styles.challengeReward}>
				<Ionicons name="diamond" size={16} color={theme.colors.warning} />
				<Text style={[styles.rewardText, { color: theme.colors.warning }]}>
					{challenge.reward_points} points
				</Text>
			</View>

			{!isCompleted && onComplete && (
				<ModernButton
					title="Start Challenge"
					variant="primary"
					size="small"
					onPress={onComplete}
					icon="play"
				/>
			)}

			{isCompleted && (
				<View
					style={[
						styles.completedBanner,
						{ backgroundColor: theme.colors.success },
					]}
				>
					<Text style={[styles.completedText, { color: theme.colors.white }]}>
						Challenge Completed! 🎉
					</Text>
				</View>
			)}
		</ModernCard>
	);
};

// Points Animation Component
interface PointsAnimationProps {
	points: number;
	visible: boolean;
	onComplete: () => void;
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({
	points,
	visible,
	onComplete,
}) => {
	const { theme } = useTheme();
	const [slideAnim] = useState(new Animated.Value(50));
	const [fadeAnim] = useState(new Animated.Value(0));

	React.useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: -100,
					duration: 2000,
					useNativeDriver: true,
				}),
				Animated.sequence([
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}),
					Animated.delay(1400),
					Animated.timing(fadeAnim, {
						toValue: 0,
						duration: 300,
						useNativeDriver: true,
					}),
				]),
			]).start(() => {
				onComplete();
				slideAnim.setValue(50);
				fadeAnim.setValue(0);
			});
		}
	}, [visible, slideAnim, fadeAnim, onComplete]);

	if (!visible) return null;

	return (
		<Animated.View
			style={[
				styles.pointsAnimation,
				{
					transform: [{ translateY: slideAnim }],
					opacity: fadeAnim,
				},
			]}
		>
			<Text style={[styles.pointsText, { color: theme.colors.warning }]}>
				+{points} points
			</Text>
		</Animated.View>
	);
};

// Level Progress Component
interface LevelProgressProps {
	level: number;
	levelName: string;
	progress: number;
	currentPoints: number;
	nextLevelPoints?: number | null;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
	level,
	levelName,
	progress,
	currentPoints,
	nextLevelPoints,
}) => {
	const { theme } = useTheme();

	const getLevelColor = (level: number) => {
		if (level >= 7) return theme.colors.error;
		if (level >= 5) return theme.colors.warning;
		if (level >= 3) return theme.colors.primary;
		return theme.colors.success;
	};

	return (
		<ModernCard style={styles.levelCard}>
			<View style={styles.levelHeader}>
				<View
					style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}
				>
					<Text style={[styles.levelNumber, { color: theme.colors.white }]}>
						{level}
					</Text>
				</View>
				<View style={styles.levelInfo}>
					<Text style={[styles.levelName, { color: theme.colors.text }]}>
						{levelName}
					</Text>
					<Text
						style={[
							styles.levelSubtitle,
							{ color: theme.colors.textSecondary },
						]}
					>
						Level {level}
					</Text>
				</View>
			</View>

			<View style={styles.progressSection}>
				<ModernProgressBar
					progress={progress / 100}
					height={12}
					color={getLevelColor(level)}
					style={styles.levelProgressBar}
				/>
				<View style={styles.progressLabels}>
					<Text
						style={[
							styles.levelProgressText,
							{ color: theme.colors.textSecondary },
						]}
					>
						{currentPoints} points
					</Text>
					{nextLevelPoints && (
						<Text
							style={[
								styles.levelProgressText,
								{ color: theme.colors.textSecondary },
							]}
						>
							{nextLevelPoints} needed
						</Text>
					)}
				</View>
			</View>
		</ModernCard>
	);
};

const styles = StyleSheet.create({
	// Achievement Badge Styles
	achievementBadge: {
		borderRadius: 50,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
		margin: 4,
		position: "relative",
	},
	achievementIcon: {
		textAlign: "center",
	},
	progressOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	progressText: {
		fontWeight: "bold",
	},
	unlockedIndicator: {
		position: "absolute",
		top: -2,
		right: -2,
	},

	// Achievement Modal Styles
	modalOverlay: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	achievementModalCard: {
		width: "100%",
		maxWidth: 400,
		padding: 24,
		position: "relative",
	},
	closeButton: {
		position: "absolute",
		top: 16,
		right: 16,
		zIndex: 1,
	},
	modalHeader: {
		alignItems: "center",
		marginBottom: 24,
	},
	achievementTitle: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 16,
		marginBottom: 8,
	},
	achievementDescription: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
	},
	achievementDetails: {
		marginBottom: 24,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	detailLabel: {
		fontSize: 14,
	},
	detailValue: {
		fontSize: 14,
		fontWeight: "600",
	},
	achievementProgressSection: {
		marginTop: 16,
	},
	progressBar: {
		marginVertical: 8,
	},
	progressPercentage: {
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},

	// Streak Display Styles
	streakCompact: {
		flexDirection: "row",
		alignItems: "center",
	},
	streakIcon: {
		marginRight: 4,
	},
	streakNumber: {
		fontSize: 18,
		fontWeight: "bold",
		marginRight: 4,
	},
	streakLabel: {
		fontSize: 12,
	},
	streakCard: {
		padding: 20,
	},
	streakHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	streakTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	shieldsContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	shieldsCount: {
		fontSize: 14,
		fontWeight: "600",
		marginLeft: 4,
	},
	streakContent: {
		alignItems: "center",
		marginBottom: 20,
	},
	streakIconLarge: {
		marginBottom: 8,
	},
	streakNumberLarge: {
		fontSize: 36,
		fontWeight: "bold",
		marginBottom: 4,
	},
	streakLabelLarge: {
		fontSize: 16,
	},
	streakStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 16,
	},
	statItem: {
		alignItems: "center",
	},
	statValue: {
		fontSize: 20,
		fontWeight: "bold",
	},
	statLabel: {
		fontSize: 12,
		marginTop: 4,
	},

	// Challenge Card Styles
	challengeCard: {
		padding: 16,
		marginBottom: 12,
	},
	challengeHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	challengeIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	challengeInfo: {
		flex: 1,
	},
	challengeTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	challengeDescription: {
		fontSize: 14,
		lineHeight: 20,
	},
	challengeReward: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	rewardText: {
		fontSize: 14,
		fontWeight: "600",
		marginLeft: 6,
	},
	completedBanner: {
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	completedText: {
		fontSize: 14,
		fontWeight: "600",
	},

	// Points Animation Styles
	pointsAnimation: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: [{ translateX: -50 }],
		zIndex: 1000,
	},
	pointsText: {
		fontSize: 24,
		fontWeight: "bold",
		textShadowColor: "rgba(0,0,0,0.3)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},

	// Level Progress Styles
	levelCard: {
		padding: 20,
	},
	levelHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	levelBadge: {
		width: 50,
		height: 50,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	levelNumber: {
		fontSize: 20,
		fontWeight: "bold",
	},
	levelInfo: {
		flex: 1,
	},
	levelName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4,
	},
	levelSubtitle: {
		fontSize: 14,
	},
	progressSection: {
		marginTop: 8,
	},
	levelProgressBar: {
		marginBottom: 8,
	},
	progressLabels: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	levelProgressText: {
		fontSize: 12,
	},
});
