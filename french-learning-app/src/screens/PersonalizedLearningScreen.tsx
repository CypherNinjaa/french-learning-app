// Screen for Stage 6.2 - Dynamic Content Generation
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePersonalizedLearning } from "../hooks/usePersonalizedLearning";
import { theme } from "../constants/theme";

interface PersonalizedLearningScreenProps {
	navigation: any;
}

export const PersonalizedLearningScreen: React.FC<
	PersonalizedLearningScreenProps
> = ({ navigation }) => {
	const [testUserId] = useState("test-user-123");
	const [selectedTab, setSelectedTab] = useState<
		"profile" | "recommendations" | "study-plan" | "difficulty"
	>("profile");
	const [testPerformance] = useState([75, 82, 68, 90, 77, 85]); // Mock performance data

	const {
		// Profile data
		userProfile,
		profileLoading,
		profileError,

		// Recommendations
		recommendations,
		recommendationsLoading,
		recommendationsError,

		// Study plan
		todayStudyPlan,
		studyPlanLoading,
		studyPlanError,

		// Difficulty adjustment
		difficultyAdjustment,
		difficultyLoading,
		difficultyError,

		// Actions
		refreshProfile,
		refreshRecommendations,
		loadTodayStudyPlan,
		calculateDifficultyAdjustment,
		generateSpacedRepetition,
		clearErrors,
	} = usePersonalizedLearning(testUserId);

	const handleGoBack = () => {
		navigation.goBack();
	};

	const handleRefreshProfile = async () => {
		try {
			await refreshProfile();
			Alert.alert("Success", "User profile refreshed successfully!");
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to refresh profile");
		}
	};

	const handleTestDifficultyAdjustment = async () => {
		try {
			await calculateDifficultyAdjustment(5, testPerformance);
			Alert.alert("Success", "Difficulty adjustment calculated!");
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to calculate difficulty");
		}
	};

	const handleTestSpacedRepetition = async () => {
		try {
			const schedule = await generateSpacedRepetition([1, 2, 3, 4, 5]);
			Alert.alert(
				"Spaced Repetition Schedule",
				`Generated schedule for ${schedule.length} vocabulary items`
			);
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to generate schedule");
		}
	};

	const renderTabButton = (
		tab: "profile" | "recommendations" | "study-plan" | "difficulty",
		label: string,
		icon: string
	) => (
		<TouchableOpacity
			style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
			onPress={() => setSelectedTab(tab)}
		>
			<Ionicons
				name={icon as any}
				size={20}
				color={
					selectedTab === tab
						? theme.colors.surface
						: theme.colors.textSecondary
				}
			/>
			<Text
				style={[
					styles.tabButtonText,
					selectedTab === tab && styles.tabButtonTextActive,
				]}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);

	const renderProfileTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>User Learning Profile</Text>
				<TouchableOpacity
					style={styles.refreshButton}
					onPress={handleRefreshProfile}
					disabled={profileLoading}
				>
					{profileLoading ? (
						<ActivityIndicator size="small" color={theme.colors.primary} />
					) : (
						<Ionicons name="refresh" size={20} color={theme.colors.primary} />
					)}
				</TouchableOpacity>
			</View>

			{profileError && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Error: {profileError}</Text>
					<TouchableOpacity
						onPress={clearErrors}
						style={styles.clearErrorButton}
					>
						<Text style={styles.clearErrorText}>Clear</Text>
					</TouchableOpacity>
				</View>
			)}

			{userProfile && (
				<View style={styles.profileContainer}>
					<View style={styles.profileRow}>
						<Text style={styles.profileLabel}>Current Level:</Text>
						<Text style={styles.profileValue}>{userProfile.currentLevel}</Text>
					</View>
					<View style={styles.profileRow}>
						<Text style={styles.profileLabel}>Learning Style:</Text>
						<Text style={styles.profileValue}>
							{userProfile.preferredLearningStyle}
						</Text>
					</View>
					<View style={styles.profileRow}>
						<Text style={styles.profileLabel}>Study Time:</Text>
						<Text style={styles.profileValue}>
							{userProfile.availableStudyTime} min/day
						</Text>
					</View>
					<View style={styles.profileRow}>
						<Text style={styles.profileLabel}>Streak:</Text>
						<Text style={styles.profileValue}>
							{userProfile.streakDays} days
						</Text>
					</View>

					<Text style={styles.profileSubtitle}>Strengths:</Text>
					<View style={styles.tagsContainer}>
						{userProfile.strengths.map((strength, index) => (
							<View key={index} style={[styles.tag, styles.strengthTag]}>
								<Text style={styles.strengthTagText}>{strength}</Text>
							</View>
						))}
					</View>

					<Text style={styles.profileSubtitle}>Areas to Improve:</Text>
					<View style={styles.tagsContainer}>
						{userProfile.weaknesses.map((weakness, index) => (
							<View key={index} style={[styles.tag, styles.weaknessTag]}>
								<Text style={styles.weaknessTagText}>{weakness}</Text>
							</View>
						))}
					</View>

					<Text style={styles.profileSubtitle}>Study Goals:</Text>
					<View style={styles.tagsContainer}>
						{userProfile.studyGoals.map((goal, index) => (
							<View key={index} style={[styles.tag, styles.goalTag]}>
								<Text style={styles.goalTagText}>{goal}</Text>
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	);

	const renderRecommendationsTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>AI Recommendations</Text>
				<TouchableOpacity
					style={styles.refreshButton}
					onPress={refreshRecommendations}
					disabled={recommendationsLoading}
				>
					{recommendationsLoading ? (
						<ActivityIndicator size="small" color={theme.colors.primary} />
					) : (
						<Ionicons name="refresh" size={20} color={theme.colors.primary} />
					)}
				</TouchableOpacity>
			</View>

			{recommendationsError && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Error: {recommendationsError}</Text>
				</View>
			)}

			{recommendations.map((rec, index) => (
				<View key={index} style={styles.recommendationCard}>
					<View style={styles.recommendationHeader}>
						<Text style={styles.recommendationTitle}>{rec.title}</Text>
						<View style={styles.priorityBadge}>
							<Text style={styles.priorityText}>{rec.priority}/10</Text>
						</View>
					</View>
					<Text style={styles.recommendationDescription}>
						{rec.description}
					</Text>
					<View style={styles.recommendationMeta}>
						<View style={styles.metaItem}>
							<Ionicons
								name="time"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text style={styles.metaText}>{rec.estimatedTime} min</Text>
						</View>
						<View style={styles.metaItem}>
							<Ionicons
								name="trending-up"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text style={styles.metaText}>{rec.difficulty}</Text>
						</View>
						<View style={styles.metaItem}>
							<Ionicons
								name="school"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text style={styles.metaText}>{rec.type}</Text>
						</View>
					</View>
					<Text style={styles.recommendationReason}>{rec.reasoning}</Text>
				</View>
			))}
		</View>
	);

	const renderStudyPlanTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Today's Study Plan</Text>
				<TouchableOpacity
					style={styles.refreshButton}
					onPress={loadTodayStudyPlan}
					disabled={studyPlanLoading}
				>
					{studyPlanLoading ? (
						<ActivityIndicator size="small" color={theme.colors.primary} />
					) : (
						<Ionicons name="refresh" size={20} color={theme.colors.primary} />
					)}
				</TouchableOpacity>
			</View>

			{studyPlanError && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Error: {studyPlanError}</Text>
				</View>
			)}

			{todayStudyPlan && (
				<View style={styles.studyPlanContainer}>
					<View style={styles.studyPlanHeader}>
						<Text style={styles.studyPlanDate}>{todayStudyPlan.date}</Text>
						<Text style={styles.studyPlanTime}>
							{todayStudyPlan.totalTime} min total
						</Text>
					</View>

					<Text style={styles.studyPlanSubtitle}>Today's Goals:</Text>
					{todayStudyPlan.goals.map((goal, index) => (
						<View key={index} style={styles.goalItem}>
							<Ionicons
								name="checkmark-circle-outline"
								size={20}
								color={theme.colors.success}
							/>
							<Text style={styles.goalText}>{goal}</Text>
						</View>
					))}

					<Text style={styles.studyPlanSubtitle}>Study Sessions:</Text>
					{todayStudyPlan.sessions.map((session, index) => (
						<View key={index} style={styles.sessionCard}>
							<View style={styles.sessionHeader}>
								<Text style={styles.sessionType}>
									{session.type.replace("_", " ")}
								</Text>
								<Text style={styles.sessionDuration}>
									{session.duration} min
								</Text>
							</View>
							<Text style={styles.sessionObjectives}>
								Objectives: {session.objectives.join(", ")}
							</Text>
							<Text style={styles.sessionContent}>
								{session.content.length} activities planned
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);

	const renderDifficultyTab = () => (
		<View style={styles.tabContent}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Difficulty Adjustment</Text>
				<TouchableOpacity
					style={styles.testButton}
					onPress={handleTestDifficultyAdjustment}
					disabled={difficultyLoading}
				>
					<Text style={styles.testButtonText}>Test</Text>
				</TouchableOpacity>
			</View>

			{difficultyError && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Error: {difficultyError}</Text>
				</View>
			)}

			<View style={styles.performanceContainer}>
				<Text style={styles.performanceTitle}>Recent Performance:</Text>
				<View style={styles.performanceScores}>
					{testPerformance.map((score, index) => (
						<View key={index} style={styles.scoreItem}>
							<Text style={styles.scoreText}>{score}%</Text>
						</View>
					))}
				</View>
			</View>

			{difficultyAdjustment && (
				<View style={styles.difficultyContainer}>
					<View style={styles.difficultyRow}>
						<Text style={styles.difficultyLabel}>Current Difficulty:</Text>
						<Text style={styles.difficultyValue}>
							{difficultyAdjustment.currentDifficulty}/10
						</Text>
					</View>
					<View style={styles.difficultyRow}>
						<Text style={styles.difficultyLabel}>Suggested Difficulty:</Text>
						<Text style={styles.difficultyValue}>
							{difficultyAdjustment.suggestedDifficulty}/10
						</Text>
					</View>
					<View style={styles.difficultyRow}>
						<Text style={styles.difficultyLabel}>Confidence:</Text>
						<Text style={styles.difficultyValue}>
							{Math.round(difficultyAdjustment.confidenceScore * 100)}%
						</Text>
					</View>
					<Text style={styles.difficultyReason}>
						{difficultyAdjustment.adjustmentReason}
					</Text>
				</View>
			)}

			<TouchableOpacity
				style={styles.spacedRepetitionButton}
				onPress={handleTestSpacedRepetition}
			>
				<Ionicons name="repeat" size={20} color={theme.colors.surface} />
				<Text style={styles.spacedRepetitionText}>Test Spaced Repetition</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Personalized Learning</Text>
				<View style={styles.headerSpacer} />
			</View>

			{/* Tab Navigation */}
			<View style={styles.tabContainer}>
				{renderTabButton("profile", "Profile", "person")}
				{renderTabButton("recommendations", "AI Tips", "bulb")}
				{renderTabButton("study-plan", "Study Plan", "calendar")}
				{renderTabButton("difficulty", "Difficulty", "trending-up")}
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{selectedTab === "profile" && renderProfileTab()}
				{selectedTab === "recommendations" && renderRecommendationsTab()}
				{selectedTab === "study-plan" && renderStudyPlanTab()}
				{selectedTab === "difficulty" && renderDifficultyTab()}

				{/* Success Message */}
				<View style={styles.successCard}>
					<Ionicons
						name="checkmark-circle"
						size={48}
						color={theme.colors.success}
					/>
					<Text style={styles.successTitle}>Stage 6.2 Complete!</Text>
					<Text style={styles.successDescription}>
						Dynamic content generation with AI-powered personalization,
						difficulty adjustment, and intelligent learning recommendations is
						now fully functional.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: theme.spacing.xs,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		flex: 1,
		textAlign: "center",
		color: theme.colors.text,
	},
	headerSpacer: {
		width: 40,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	tabButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.xs,
		borderRadius: 8,
		marginHorizontal: theme.spacing.xs,
	},
	tabButtonActive: {
		backgroundColor: theme.colors.primary,
	},
	tabButtonText: {
		fontSize: 12,
		fontWeight: "500",
		color: theme.colors.textSecondary,
		marginLeft: theme.spacing.xs,
	},
	tabButtonTextActive: {
		color: theme.colors.surface,
		fontWeight: "600",
	},
	content: {
		flex: 1,
		paddingHorizontal: theme.spacing.lg,
	},
	tabContent: {
		paddingVertical: theme.spacing.lg,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	refreshButton: {
		padding: theme.spacing.sm,
	},
	testButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
	},
	testButtonText: {
		color: theme.colors.surface,
		fontSize: 14,
		fontWeight: "600",
	},
	errorContainer: {
		backgroundColor: theme.colors.error + "20",
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.md,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	errorText: {
		color: theme.colors.error,
		fontSize: 14,
		flex: 1,
	},
	clearErrorButton: {
		marginLeft: theme.spacing.sm,
	},
	clearErrorText: {
		color: theme.colors.error,
		fontWeight: "600",
		fontSize: 14,
	},
	profileContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	profileRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	profileLabel: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	profileValue: {
		fontSize: 16,
		color: theme.colors.text,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	profileSubtitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginTop: theme.spacing.lg,
		marginBottom: theme.spacing.sm,
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: theme.spacing.md,
	},
	tag: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 16,
		marginRight: theme.spacing.sm,
		marginBottom: theme.spacing.xs,
	},
	strengthTag: {
		backgroundColor: theme.colors.success + "20",
	},
	strengthTagText: {
		color: theme.colors.success,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	weaknessTag: {
		backgroundColor: theme.colors.error + "20",
	},
	weaknessTagText: {
		color: theme.colors.error,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	goalTag: {
		backgroundColor: theme.colors.primary + "20",
	},
	goalTagText: {
		color: theme.colors.primary,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	recommendationCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	recommendationHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	recommendationTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		flex: 1,
	},
	priorityBadge: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 12,
	},
	priorityText: {
		color: theme.colors.surface,
		fontSize: 12,
		fontWeight: "600",
	},
	recommendationDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.md,
		lineHeight: 20,
	},
	recommendationMeta: {
		flexDirection: "row",
		marginBottom: theme.spacing.sm,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: theme.spacing.lg,
	},
	metaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginLeft: theme.spacing.xs,
		textTransform: "capitalize",
	},
	recommendationReason: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
		lineHeight: 18,
	},
	studyPlanContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	studyPlanHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	studyPlanDate: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	studyPlanTime: {
		fontSize: 14,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	studyPlanSubtitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginTop: theme.spacing.lg,
		marginBottom: theme.spacing.sm,
	},
	goalItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	goalText: {
		fontSize: 14,
		color: theme.colors.text,
		marginLeft: theme.spacing.sm,
	},
	sessionCard: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sessionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
	},
	sessionType: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		textTransform: "capitalize",
	},
	sessionDuration: {
		fontSize: 12,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	sessionObjectives: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	sessionContent: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	performanceContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	performanceTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	performanceScores: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	scoreItem: {
		backgroundColor: theme.colors.primary + "20",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 8,
		marginRight: theme.spacing.sm,
		marginBottom: theme.spacing.xs,
	},
	scoreText: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "600",
	},
	difficultyContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	difficultyRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	difficultyLabel: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	difficultyValue: {
		fontSize: 16,
		color: theme.colors.text,
		fontWeight: "600",
	},
	difficultyReason: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginTop: theme.spacing.sm,
	},
	spacedRepetitionButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing.md,
		borderRadius: 8,
		marginTop: theme.spacing.md,
	},
	spacedRepetitionText: {
		color: theme.colors.surface,
		fontSize: 16,
		fontWeight: "600",
		marginLeft: theme.spacing.sm,
	},
	successCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.xl,
		borderRadius: 12,
		alignItems: "center",
		marginVertical: theme.spacing.xl,
		borderWidth: 2,
		borderColor: theme.colors.success + "20",
	},
	successTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.success,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.sm,
	},
	successDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
});
