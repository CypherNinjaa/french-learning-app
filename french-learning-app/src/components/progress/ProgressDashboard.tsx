// Stage 4.3: Progress Dashboard Component
// Comprehensive progress tracking dashboard with analytics and insights

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
	Alert,
} from "react-native";
import {
	ProgressTrackingService,
	ProgressAnalytics,
	ProgressInsight,
} from "../../services/progressTrackingService";
import { theme } from "../../constants/theme";
import { DifficultyLevel, LessonType } from "../../types/LessonTypes";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";

interface ProgressDashboardProps {
	userId: string;
	onLessonSelect?: (lessonId: number) => void;
	onGoalCreate?: () => void;
}

const { width } = Dimensions.get("window");

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
	userId,
	onLessonSelect,
	onGoalCreate,
}) => {
	const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
	const [insights, setInsights] = useState<ProgressInsight[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTab, setSelectedTab] = useState<
		"overview" | "performance" | "insights"
	>("overview");

	useEffect(() => {
		loadProgressData();
	}, [userId]);

	const loadProgressData = async () => {
		try {
			setLoading(true);
			const [analyticsData, insightsData] = await Promise.all([
				ProgressTrackingService.getProgressAnalytics(userId),
				ProgressTrackingService.generateInsights(userId),
			]);

			setAnalytics(analyticsData);
			setInsights(insightsData);
		} catch (error) {
			console.error("Error loading progress data:", error);
			Alert.alert("Error", "Failed to load progress data");
		} finally {
			setLoading(false);
		}
	};

	const renderProgressCard = (
		title: string,
		value: string | number,
		subtitle?: string,
		color?: string,
		onPress?: () => void
	) => (
		<TouchableOpacity
			style={[styles.progressCard, onPress && styles.pressableCard]}
			onPress={onPress}
			disabled={!onPress}
		>
			<Text style={styles.cardTitle}>{title}</Text>
			<Text style={[styles.cardValue, color && { color }]}>{value}</Text>
			{subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
		</TouchableOpacity>
	);

	const renderOverviewTab = () => {
		if (!analytics) return null;

		return (
			<ScrollView
				style={styles.tabContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Stats Grid */}
				<View style={styles.statsGrid}>
					{renderProgressCard(
						"Lessons Completed",
						analytics.total_lessons_completed,
						"Total progress",
						theme.colors.primary
					)}
					{renderProgressCard(
						"Current Streak",
						`${analytics.current_streak} days`,
						`Best: ${analytics.longest_streak} days`,
						"#FF6B6B"
					)}
					{renderProgressCard(
						"Average Score",
						`${analytics.average_score}%`,
						"Overall performance",
						"#00B894"
					)}
					{renderProgressCard(
						"Study Time",
						`${analytics.total_time_spent}m`,
						"Total time invested",
						"#6C5CE7"
					)}
				</View>

				{/* Today's Activity */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Today's Activity</Text>
					<View style={styles.activityRow}>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>
								{analytics.lessons_completed_today}
							</Text>
							<Text style={styles.activityLabel}>Lessons</Text>
						</View>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>
								{analytics.points_earned_today}
							</Text>
							<Text style={styles.activityLabel}>Points</Text>
						</View>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>
								{analytics.vocabulary_mastery.words_learned_today}
							</Text>
							<Text style={styles.activityLabel}>Words</Text>
						</View>
					</View>
				</View>

				{/* Weekly Progress */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>This Week</Text>
					<View style={styles.weeklyStats}>
						<View style={styles.weeklyItem}>
							<Text style={styles.weeklyLabel}>Lessons Completed</Text>
							<Text style={styles.weeklyValue}>
								{analytics.lessons_completed_week}
							</Text>
						</View>
						<View style={styles.weeklyItem}>
							<Text style={styles.weeklyLabel}>Points Earned</Text>
							<Text style={styles.weeklyValue}>
								{analytics.points_earned_week}
							</Text>
						</View>
						<View style={styles.weeklyItem}>
							<Text style={styles.weeklyLabel}>Learning Velocity</Text>
							<Text style={styles.weeklyValue}>
								{analytics.learning_velocity}/day
							</Text>
						</View>
					</View>
				</View>

				{/* Mastery Overview */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Mastery Progress</Text>
					<View style={styles.masteryContainer}>
						<View style={styles.masteryItem}>
							<Text style={styles.masteryLabel}>Vocabulary</Text>
							<View style={styles.progressBar}>
								<View
									style={[
										styles.progressFill,
										{
											width: `${Math.min(
												analytics.vocabulary_mastery.mastery_percentage,
												100
											)}%`,
										},
									]}
								/>
							</View>
							<Text style={styles.masteryPercentage}>
								{Math.round(analytics.vocabulary_mastery.mastery_percentage)}%
							</Text>
						</View>
						<View style={styles.masteryItem}>
							<Text style={styles.masteryLabel}>Grammar</Text>
							<View style={styles.progressBar}>
								<View
									style={[
										styles.progressFill,
										{
											width: `${Math.min(
												analytics.grammar_mastery.mastery_percentage,
												100
											)}%`,
										},
									]}
								/>
							</View>
							<Text style={styles.masteryPercentage}>
								{Math.round(analytics.grammar_mastery.mastery_percentage)}%
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		);
	};

	const renderPerformanceTab = () => {
		if (!analytics) return null;

		const lessonTypes: LessonType[] = [
			"vocabulary",
			"grammar",
			"pronunciation",
			"conversation",
			"cultural",
			"mixed",
		];
		const difficulties: DifficultyLevel[] = [
			"beginner",
			"intermediate",
			"advanced",
		];

		return (
			<ScrollView
				style={styles.tabContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Performance by Lesson Type */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Performance by Lesson Type</Text>
					{lessonTypes.map((type) => {
						const performance = analytics.performance_by_type[type];
						if (performance.total_attempted === 0) return null;

						return (
							<View key={type} style={styles.performanceItem}>
								<View style={styles.performanceHeader}>
									<Text style={styles.performanceType}>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</Text>
									<Text style={styles.performanceScore}>
										{performance.average_score}%
									</Text>
								</View>
								<View style={styles.performanceDetails}>
									{" "}
									<Text style={styles.performanceDetail}>
										{performance.total_completed}/{performance.total_attempted}{" "}
										completed
									</Text>
									<Text
										style={[
											styles.performanceTrend,
											{
												color:
													performance.improvement_trend === "improving"
														? "#00B894"
														: performance.improvement_trend === "declining"
														? "#E17055"
														: "#636E72",
											},
										]}
									>
										{performance.improvement_trend === "improving"
											? "📈 Improving"
											: performance.improvement_trend === "declining"
											? "📉 Needs attention"
											: "➡️ Stable"}
									</Text>
								</View>
							</View>
						);
					})}
				</View>

				{/* Mastery by Difficulty */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Mastery by Difficulty</Text>
					{difficulties.map((difficulty) => {
						const mastery = analytics.mastery_by_difficulty[difficulty];
						if (mastery === 0) return null;

						return (
							<View key={difficulty} style={styles.difficultyItem}>
								<Text style={styles.difficultyLabel}>
									{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
								</Text>
								<View style={styles.difficultyProgress}>
									<View style={styles.progressBar}>
										<View
											style={[
												styles.progressFill,
												{
													width: `${Math.min(mastery, 100)}%`,
													backgroundColor:
														difficulty === "beginner"
															? "#00B894"
															: difficulty === "intermediate"
															? "#FDCB6E"
															: "#E17055",
												},
											]}
										/>
									</View>
									<Text style={styles.difficultyScore}>
										{Math.round(mastery)}%
									</Text>
								</View>
							</View>
						);
					})}
				</View>

				{/* Consistency Score */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Learning Consistency</Text>
					<View style={styles.consistencyContainer}>
						<View style={styles.consistencyCircle}>
							<Text style={styles.consistencyScore}>
								{analytics.consistency_score}%
							</Text>
							<Text style={styles.consistencyLabel}>Active Days</Text>
						</View>
						<View style={styles.consistencyDetails}>
							<Text style={styles.consistencyDescription}>
								You've been active {analytics.consistency_score}% of the last 30
								days.
							</Text>
							<Text
								style={[
									styles.consistencyFeedback,
									{
										color:
											analytics.consistency_score >= 80
												? "#00B894"
												: analytics.consistency_score >= 60
												? "#FDCB6E"
												: "#E17055",
									},
								]}
							>
								{analytics.consistency_score >= 80
									? "Excellent consistency! 🌟"
									: analytics.consistency_score >= 60
									? "Good consistency! Keep it up! 👍"
									: "Try to practice more regularly for better results 📈"}
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		);
	};

	const renderInsightsTab = () => (
		<ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Personal Insights</Text>
				{insights.length === 0 ? (
					<EmptyState
						title="No Insights Yet"
						description="Complete more lessons to unlock insights!"
					/>
				) : (
					insights.map((insight, index) => (
						<TouchableOpacity
							key={index}
							style={[styles.insightCard, { borderLeftColor: insight.color }]}
							onPress={
								insight.action
									? () => console.log("Action:", insight.action)
									: undefined
							}
						>
							<View style={styles.insightHeader}>
								<Text style={styles.insightIcon}>{insight.icon}</Text>
								<View style={styles.insightContent}>
									<Text style={styles.insightTitle}>{insight.title}</Text>
									<Text style={styles.insightDescription}>
										{insight.description}
									</Text>
								</View>
							</View>
							{insight.action && (
								<TouchableOpacity style={styles.insightAction}>
									<Text style={styles.insightActionText}>{insight.action}</Text>
								</TouchableOpacity>
							)}
						</TouchableOpacity>
					))
				)}
			</View>
		</ScrollView>
	);

	if (loading) {
		return <LoadingState />;
	}

	if (!analytics) {
		return (
			<ErrorState
				title="Unable to load progress data"
				description="Please check your connection or try again later."
			/>
		);
	}

	return (
		<View style={styles.container}>
			{/* Tab Navigation */}
			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
					onPress={() => setSelectedTab("overview")}
				>
					<Text
						style={[
							styles.tabText,
							selectedTab === "overview" && styles.activeTabText,
						]}
					>
						Overview
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.tab,
						selectedTab === "performance" && styles.activeTab,
					]}
					onPress={() => setSelectedTab("performance")}
				>
					<Text
						style={[
							styles.tabText,
							selectedTab === "performance" && styles.activeTabText,
						]}
					>
						Performance
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, selectedTab === "insights" && styles.activeTab]}
					onPress={() => setSelectedTab("insights")}
				>
					<Text
						style={[
							styles.tabText,
							selectedTab === "insights" && styles.activeTabText,
						]}
					>
						Insights
					</Text>
				</TouchableOpacity>
			</View>

			{/* Tab Content */}
			{selectedTab === "overview" && renderOverviewTab()}
			{selectedTab === "performance" && renderPerformanceTab()}
			{selectedTab === "insights" && renderInsightsTab()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.medium,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
		padding: 32,
	},
	errorText: {
		fontSize: 18,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: 24,
		fontFamily: theme.typography.fontFamily.medium,
	},
	retryButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontFamily: theme.typography.fontFamily.bold,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	tab: {
		flex: 1,
		paddingVertical: 16,
		alignItems: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: theme.colors.primary,
	},
	tabText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.medium,
	},
	activeTabText: {
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
	},
	tabContent: {
		flex: 1,
		padding: 16,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	progressCard: {
		width: (width - 48) / 2,
		backgroundColor: "#FFFFFF",
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	pressableCard: {
		// Add any press styles if needed
	},
	cardTitle: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 8,
		fontFamily: theme.typography.fontFamily.medium,
	},
	cardValue: {
		fontSize: 24,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.regular,
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 20,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
		marginBottom: 16,
	},
	activityRow: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		justifyContent: "space-around",
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	activityItem: {
		alignItems: "center",
	},
	activityValue: {
		fontSize: 32,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
		marginBottom: 4,
	},
	activityLabel: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.medium,
	},
	weeklyStats: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	weeklyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	weeklyLabel: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.medium,
	},
	weeklyValue: {
		fontSize: 16,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
	},
	masteryContainer: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	masteryItem: {
		marginBottom: 20,
	},
	masteryLabel: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.medium,
		marginBottom: 8,
	},
	progressBar: {
		height: 8,
		backgroundColor: "#F1F3F4",
		borderRadius: 4,
		marginBottom: 8,
	},
	progressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
		borderRadius: 4,
	},
	masteryPercentage: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.medium,
	},
	performanceItem: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	performanceHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	performanceType: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
	},
	performanceScore: {
		fontSize: 18,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
	},
	performanceDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	performanceDetail: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.regular,
	},
	performanceTrend: {
		fontSize: 14,
		fontFamily: theme.typography.fontFamily.medium,
	},
	difficultyItem: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	difficultyLabel: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
		marginBottom: 12,
	},
	difficultyProgress: {
		flexDirection: "row",
		alignItems: "center",
	},
	difficultyScore: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
		marginLeft: 12,
		minWidth: 50,
	},
	consistencyContainer: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	consistencyCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: theme.colors.primary + "20",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 20,
	},
	consistencyScore: {
		fontSize: 24,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
	},
	consistencyLabel: {
		fontSize: 12,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.medium,
	},
	consistencyDetails: {
		flex: 1,
	},
	consistencyDescription: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.regular,
		marginBottom: 8,
	},
	consistencyFeedback: {
		fontSize: 14,
		fontFamily: theme.typography.fontFamily.medium,
	},
	noInsights: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 40,
		alignItems: "center",
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	noInsightsText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		fontFamily: theme.typography.fontFamily.medium,
	},
	insightCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderLeftWidth: 4,
	},
	insightHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	insightIcon: {
		fontSize: 24,
		marginRight: 12,
		marginTop: 4,
	},
	insightContent: {
		flex: 1,
	},
	insightTitle: {
		fontSize: 16,
		color: theme.colors.text,
		fontFamily: theme.typography.fontFamily.bold,
		marginBottom: 4,
	},
	insightDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontFamily: theme.typography.fontFamily.regular,
		lineHeight: 20,
	},
	insightAction: {
		alignSelf: "flex-end",
		marginTop: 12,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: theme.colors.primary + "20",
		borderRadius: 6,
	},
	insightActionText: {
		fontSize: 14,
		color: theme.colors.primary,
		fontFamily: theme.typography.fontFamily.bold,
	},
});
