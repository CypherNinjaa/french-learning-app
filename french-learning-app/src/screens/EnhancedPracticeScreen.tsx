import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Dimensions,
	Animated,
	RefreshControl,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { useGamification } from "../hooks/useGamification";
import {
	enhancedGroqService,
	UserLearningData,
	PracticeStats,
} from "../services/enhancedGroqService";

const { width, height } = Dimensions.get("window");

interface PracticeScreenProps {
	navigation: any;
}

interface DailyGoal {
	target: number;
	current: number;
	type: "minutes" | "exercises" | "conversations";
	label: string;
}

export const EnhancedPracticeScreen: React.FC<PracticeScreenProps> = ({
	navigation,
}) => {
	const { user } = useAuth();
	const { completeActivity } = useGamification();
	const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(
		null
	);
	const [userLearningData, setUserLearningData] =
		useState<UserLearningData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		loadUserData();
		startAnimation();
	}, [user?.id]);

	const loadUserData = async () => {
		if (!user?.id) return;

		try {
			setIsLoading(true);

			// Load user learning data and practice stats
			const [userData, stats] = await Promise.all([
				enhancedGroqService.getUserLearningData(user.id),
				enhancedGroqService.getUserPracticeStats(user.id),
			]);

			setUserLearningData(userData);
			setPracticeStats(stats);

			// Generate dynamic daily goals based on user data
			const goals: DailyGoal[] = [
				{
					target: userData.preferences.sessionLength,
					current: stats.todayMinutes,
					type: "minutes",
					label: "Study Time",
				},
				{
					target: 20,
					current: Math.floor(stats.todayMinutes / 2), // Estimate exercises completed
					type: "exercises",
					label: "Exercises",
				},
				{
					target: 3,
					current: Math.min(Math.floor(stats.todayMinutes / 10), 3), // AI conversations
					type: "conversations",
					label: "AI Chats",
				},
			];
			setDailyGoals(goals);
		} catch (error) {
			console.error("Error loading user data:", error);
			Alert.alert(
				"Error",
				"Failed to load your practice data. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const startAnimation = () => {
		Animated.timing(animatedValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: true,
		}).start();
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadUserData();
		setRefreshing(false);
	};

	const renderHeader = () => (
		<LinearGradient
			colors={[theme.colors.primary, "#667eea"]}
			style={styles.headerGradient}
		>
			<View style={styles.headerContent}>
				<View style={styles.userInfo}>
					<Text style={styles.welcomeText}>Welcome back!</Text>
					<Text style={styles.userName}>{user?.email || "Student"}</Text>
				</View>
				<View style={styles.levelInfo}>
					<Text style={styles.levelText}>
						{practiceStats?.level || "Loading..."}
					</Text>
					<View style={styles.levelProgressBar}>
						<View
							style={[
								styles.levelProgressFill,
								{ width: `${practiceStats?.nextLevelProgress || 0}%` },
							]}
						/>
					</View>
					<Text style={styles.levelProgressText}>
						{Math.round((practiceStats?.nextLevelProgress || 0) * 100)}% to
						Advanced
					</Text>
				</View>
			</View>
		</LinearGradient>
	);

	const renderStatsOverview = () => (
		<View style={styles.statsContainer}>
			<Text style={styles.sectionTitle}>Today's Progress</Text>
			<View style={styles.statsGrid}>
				<View style={styles.statCard}>
					<Ionicons
						name="time-outline"
						size={28}
						color={theme.colors.primary}
					/>
					<Text style={styles.statValue}>
						{practiceStats?.todayMinutes || 0}m
					</Text>
					<Text style={styles.statLabel}>Study Time</Text>
				</View>
				<View style={styles.statCard}>
					<Ionicons name="flame-outline" size={28} color="#ff6b6b" />
					<Text style={styles.statValue}>{practiceStats?.weekStreak || 0}</Text>
					<Text style={styles.statLabel}>Day Streak</Text>
				</View>
				<View style={styles.statCard}>
					<Ionicons name="trophy-outline" size={28} color="#ffd43b" />
					<Text style={styles.statValue}>
						{practiceStats?.totalPoints || 0}
					</Text>
					<Text style={styles.statLabel}>Total Points</Text>
				</View>
			</View>
		</View>
	);

	const renderDailyGoals = () => (
		<View style={styles.goalsContainer}>
			<Text style={styles.sectionTitle}>Daily Goals</Text>
			<View style={styles.goalsList}>
				{dailyGoals.map((goal, index) => (
					<View key={index} style={styles.goalCard}>
						<View style={styles.goalInfo}>
							<Text style={styles.goalLabel}>{goal.label}</Text>
							<Text style={styles.goalProgress}>
								{goal.current}/{goal.target} {goal.type}
							</Text>
						</View>
						<View style={styles.goalProgressBar}>
							<View
								style={[
									styles.goalProgressFill,
									{ width: `${(goal.current / goal.target) * 100}%` },
								]}
							/>
						</View>
					</View>
				))}
			</View>
		</View>
	);

	const renderSmartSessions = () => (
		<View style={styles.sessionsContainer}>
			<Text style={styles.sectionTitle}>Smart Practice Sessions</Text>
			<View style={styles.sessionsGrid}>
				<TouchableOpacity
					style={styles.sessionCard}
					onPress={() =>
						navigation.navigate("AdaptivePracticeSession", {
							userLearningData,
							practiceStats,
						})
					}
				>
					<LinearGradient
						colors={["#667eea", "#764ba2"]}
						style={styles.sessionGradient}
					>
						<Ionicons name="bulb-outline" size={32} color="white" />
						<Text style={styles.sessionTitle}>Adaptive Practice</Text>
						<Text style={styles.sessionDescription}>
							AI adjusts difficulty based on your performance
						</Text>
						<View style={styles.sessionFeatures}>
							<Text style={styles.sessionFeature}>
								• Personalized questions
							</Text>
							<Text style={styles.sessionFeature}>
								• Weak areas:{" "}
								{practiceStats?.weakAreas.slice(0, 1).join("") || "Loading..."}
							</Text>
							<Text style={styles.sessionFeature}>• Progress tracking</Text>
						</View>
					</LinearGradient>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.sessionCard}
					onPress={() =>
						navigation.navigate("FocusedPracticeSession", {
							userLearningData,
							practiceStats,
						})
					}
				>
					<LinearGradient
						colors={["#f093fb", "#f5576c"]}
						style={styles.sessionGradient}
					>
						<Ionicons name="locate-outline" size={32} color="white" />
						<Text style={styles.sessionTitle}>Focused Practice</Text>
						<Text style={styles.sessionDescription}>
							Target specific weak areas for improvement
						</Text>
						<View style={styles.sessionFeatures}>
							<Text style={styles.sessionFeature}>• Weak area detection</Text>
							<Text style={styles.sessionFeature}>• Targeted exercises</Text>
							<Text style={styles.sessionFeature}>
								• Skill mastery tracking
							</Text>
						</View>
					</LinearGradient>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.sessionCard}
					onPress={() =>
						navigation.navigate("QuickPracticeSession", {
							userLearningData,
							practiceStats,
						})
					}
				>
					<LinearGradient
						colors={["#4facfe", "#00f2fe"]}
						style={styles.sessionGradient}
					>
						<Ionicons name="flash-outline" size={32} color="white" />
						<Text style={styles.sessionTitle}>Quick Practice</Text>
						<Text style={styles.sessionDescription}>
							Fast-paced 5-minute sessions for busy schedules
						</Text>
						<View style={styles.sessionFeatures}>
							<Text style={styles.sessionFeature}>• 5-minute sessions</Text>
							<Text style={styles.sessionFeature}>
								• Quick response challenges
							</Text>
							<Text style={styles.sessionFeature}>• Perfect for breaks</Text>
						</View>
					</LinearGradient>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderAITools = () => (
		<View style={styles.aiToolsContainer}>
			<Text style={styles.sectionTitle}>AI-Powered Tools</Text>
			<View style={styles.aiToolsGrid}>
				<TouchableOpacity
					style={styles.aiToolCard}
					onPress={() => navigation.navigate("ConversationalAI")}
				>
					<View style={styles.aiToolIcon}>
						<Ionicons name="chatbubbles-outline" size={24} color="white" />
					</View>
					<Text style={styles.aiToolTitle}>Smart Conversations</Text>
					<Text style={styles.aiToolSubtitle}>AI chat with memory</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.aiToolCard}
					onPress={() => navigation.navigate("AITest")}
				>
					<View style={styles.aiToolIcon}>
						<MaterialCommunityIcons name="spellcheck" size={24} color="white" />
					</View>
					<Text style={styles.aiToolTitle}>Grammar Coach</Text>
					<Text style={styles.aiToolSubtitle}>Instant corrections</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.aiToolCard}
					onPress={() => navigation.navigate("PronunciationTest")}
				>
					<View style={styles.aiToolIcon}>
						<Ionicons name="mic-outline" size={24} color="white" />
					</View>
					<Text style={styles.aiToolTitle}>Pronunciation Pro</Text>
					<Text style={styles.aiToolSubtitle}>Voice analysis</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderLearningAnalytics = () => (
		<View style={styles.analyticsContainer}>
			<Text style={styles.sectionTitle}>Learning Analytics</Text>

			<View style={styles.analyticsSection}>
				<Text style={styles.analyticsTitle}>Areas for Improvement</Text>
				<View style={styles.weakAreasContainer}>
					<Text style={styles.areaTitle}>Weak Areas</Text>
					<View style={styles.areaList}>
						{(practiceStats?.weakAreas || []).map((area, index) => (
							<View key={index} style={[styles.areaTag, styles.weakAreaTag]}>
								<Text style={[styles.areaTagText, styles.weakAreaText]}>
									{area}
								</Text>
							</View>
						))}
						{(!practiceStats?.weakAreas ||
							practiceStats.weakAreas.length === 0) && (
							<Text style={styles.areaTagText}>
								No weak areas identified yet
							</Text>
						)}
					</View>
				</View>

				<View style={styles.strongAreasContainer}>
					<Text style={styles.areaTitle}>Strong Areas</Text>
					<View style={styles.areaList}>
						{(practiceStats?.strongAreas || []).map((area, index) => (
							<View key={index} style={[styles.areaTag, styles.strongAreaTag]}>
								<Text style={[styles.areaTagText, styles.strongAreaText]}>
									{area}
								</Text>
							</View>
						))}
						{(!practiceStats?.strongAreas ||
							practiceStats.strongAreas.length === 0) && (
							<Text style={styles.areaTagText}>
								Keep practicing to identify strong areas
							</Text>
						)}
					</View>
				</View>

				<View style={styles.recommendationsContainer}>
					<Text style={styles.areaTitle}>AI Recommendations</Text>
					<View style={styles.areaList}>
						{(practiceStats?.recommendedPractice || []).map(
							(recommendation, index) => (
								<TouchableOpacity
									key={index}
									style={[styles.areaTag, styles.recommendationTag]}
									onPress={() => {
										// TODO: Navigate to specific practice based on recommendation
										Alert.alert(
											"Recommendation",
											`Focus on: ${recommendation}`
										);
									}}
								>
									<Text style={[styles.areaTagText, styles.recommendationText]}>
										{recommendation}
									</Text>
								</TouchableOpacity>
							)
						)}
						{(!practiceStats?.recommendedPractice ||
							practiceStats.recommendedPractice.length === 0) && (
							<Text style={styles.areaTagText}>Loading recommendations...</Text>
						)}
					</View>
				</View>
			</View>
		</View>
	);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading your practice data...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{renderHeader()}
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				{renderStatsOverview()}
				{renderDailyGoals()}
				{renderSmartSessions()}
				{renderAITools()}
				{renderLearningAnalytics()}
				<View style={styles.bottomSpacer} />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	scrollView: {
		flex: 1,
	},
	headerGradient: {
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		paddingBottom: 24,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	userInfo: {
		flex: 1,
	},
	welcomeText: {
		fontSize: 16,
		color: "rgba(255,255,255,0.9)",
		marginBottom: 4,
	},
	userName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	levelInfo: {
		alignItems: "flex-end",
		flex: 1,
	},
	levelText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
		marginBottom: 8,
	},
	levelProgressBar: {
		width: 120,
		height: 8,
		backgroundColor: "rgba(255,255,255,0.3)",
		borderRadius: 4,
		overflow: "hidden",
		marginBottom: 4,
	},
	levelProgressFill: {
		height: "100%",
		backgroundColor: "white",
		borderRadius: 4,
	},
	levelProgressText: {
		fontSize: 12,
		color: "rgba(255,255,255,0.8)",
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 16,
	},
	statsContainer: {
		paddingHorizontal: 20,
		paddingTop: 24,
		marginBottom: 24,
	},
	statsGrid: {
		flexDirection: "row",
		gap: 12,
	},
	statCard: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 8,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	goalsContainer: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	goalsList: {
		gap: 12,
	},
	goalCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	goalInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	goalLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
	},
	goalProgress: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	goalProgressBar: {
		height: 6,
		backgroundColor: theme.colors.background,
		borderRadius: 3,
		overflow: "hidden",
	},
	goalProgressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
		borderRadius: 3,
	},
	sessionsContainer: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	sessionsGrid: {
		gap: 16,
	},
	sessionCard: {
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 8,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
	},
	sessionGradient: {
		padding: 20,
	},
	sessionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
		marginTop: 12,
		marginBottom: 4,
	},
	sessionDescription: {
		fontSize: 14,
		color: "rgba(255,255,255,0.9)",
		marginBottom: 12,
	},
	sessionFeatures: {
		gap: 4,
	},
	sessionFeature: {
		fontSize: 12,
		color: "rgba(255,255,255,0.8)",
	},
	aiToolsContainer: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	aiToolsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "space-between",
	},
	aiToolCard: {
		width: (width - 48) / 2 - 6,
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	aiToolIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: theme.colors.primary,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	aiToolTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: 4,
	},
	aiToolSubtitle: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	analyticsContainer: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	analyticsSection: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	analyticsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 16,
	},
	weakAreasContainer: {
		marginBottom: 16,
	},
	strongAreasContainer: {
		marginBottom: 16,
	},
	recommendationsContainer: {
		marginTop: 8,
	},
	areaTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	areaList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	areaTag: {
		backgroundColor: theme.colors.background,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		borderWidth: 1,
	},
	weakAreaTag: {
		borderColor: "#ff6b6b",
		backgroundColor: "rgba(255, 107, 107, 0.1)",
	},
	strongAreaTag: {
		borderColor: "#51cf66",
		backgroundColor: "rgba(81, 207, 102, 0.1)",
	},
	recommendationTag: {
		borderColor: theme.colors.primary,
		backgroundColor: `rgba(100, 149, 237, 0.1)`,
	},
	areaTagText: {
		fontSize: 12,
		fontWeight: "500",
	},
	weakAreaText: {
		color: "#ff6b6b",
	},
	strongAreaText: {
		color: "#51cf66",
	},
	recommendationText: {
		color: theme.colors.primary,
	},
	bottomSpacer: {
		height: 40,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	loadingText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 16,
	},
});
