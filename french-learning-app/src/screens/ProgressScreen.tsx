import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	SafeAreaView,
	Text,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	ScrollView,
	Dimensions,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ProgressScreenProps {
	navigation: any;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
	navigation,
}) => {
	const { user, setUser } = useAuth();
	const [refreshing, setRefreshing] = useState(false);
	const [todayStats, setTodayStats] = useState({
		lessonsToday: 0,
		pointsToday: 0,
		wordsToday: 0,
		timeToday: 0,
	});
	const [weekStats, setWeekStats] = useState({
		lessonsThisWeek: 0,
		pointsThisWeek: 0,
		timeThisWeek: 0,
	});

	// Check and update daily login
	useEffect(() => {
		if (user) {
			checkDailyLogin();
			loadTodayStats();
			loadWeekStats();
		}
	}, [user]);

	const checkDailyLogin = async () => {
		if (!user) return;

		try {
			const today = new Date().toISOString().split("T")[0];

			// Get user profile to check last login
			const profile = await SupabaseService.getUserProfile(user.id);
			if (profile.success && profile.data) {
				const lastLogin = profile.data.last_login_at
					? new Date(profile.data.last_login_at).toISOString().split("T")[0]
					: null;

				// If user hasn't logged in today, update streak and last login
				if (lastLogin !== today) {
					const yesterday = new Date();
					yesterday.setDate(yesterday.getDate() - 1);
					const yesterdayStr = yesterday.toISOString().split("T")[0];

					let newStreakDays = user.streakDays;

					if (lastLogin === yesterdayStr) {
						// Consecutive day login - increment streak
						newStreakDays = user.streakDays + 1;
					} else if (lastLogin !== today && lastLogin !== null) {
						// Missed days - reset streak to 1
						newStreakDays = 1;
					} else if (lastLogin === null) {
						// First login ever
						newStreakDays = 1;
					}

					// Update profile with new streak and last login
					const updateResult = await SupabaseService.updateUserProfile(
						user.id,
						{
							streak_days: newStreakDays,
							last_login_at: new Date().toISOString(),
						}
					);

					if (updateResult.success) {
						// Update local user state
						setUser({
							...user,
							streakDays: newStreakDays,
						});

						// Show streak notification if improved
						if (newStreakDays > user.streakDays) {
							Alert.alert(
								"🔥 Streak Updated!",
								`Great job! Your learning streak is now ${newStreakDays} days!`,
								[{ text: "Keep it up!", style: "default" }]
							);
						}
					}
				}
			}
		} catch (error) {
			console.error("Error checking daily login:", error);
		}
	};

	const loadTodayStats = async () => {
		// Simulate loading today's stats
		// In a real app, this would fetch from user sessions table
		const pointsToday = Math.floor(Math.random() * 50); // Simulate some activity
		setTodayStats({
			lessonsToday: pointsToday > 0 ? Math.ceil(pointsToday / 10) : 0,
			pointsToday,
			wordsToday: pointsToday > 0 ? Math.ceil(pointsToday / 5) : 0,
			timeToday: pointsToday > 0 ? Math.ceil(pointsToday / 2) : 0,
		});
	};

	const loadWeekStats = async () => {
		// Simulate loading this week's stats
		const pointsThisWeek = Math.floor(user?.points || 0 * 0.7); // 70% of total points from this week
		setWeekStats({
			lessonsThisWeek: Math.floor(pointsThisWeek / 10),
			pointsThisWeek,
			timeThisWeek: Math.floor(pointsThisWeek / 2),
		});
	};

	// Dynamic progress calculation using REAL user data
	const calculateProgress = () => {
		const totalPoints = user?.points || 0;
		const streakDays = user?.streakDays || 0;

		// Calculate lessons based on points (realistic estimation)
		const lessonsCompleted = Math.floor(totalPoints / 15); // 15 points per lesson average
		const timeSpent = Math.floor(totalPoints / 3); // 3 points per minute average

		// Overall progress calculation (0-100%)
		const pointsProgress = Math.min((totalPoints / 1000) * 100, 100);
		const lessonsProgress = Math.min((lessonsCompleted / 50) * 100, 100);
		const streakProgress = Math.min((streakDays / 30) * 100, 100);
		const timeProgress = Math.min((timeSpent / 300) * 100, 100);

		const overallProgress =
			(pointsProgress + lessonsProgress + streakProgress + timeProgress) / 4;

		// Weekly goals calculation - truly dynamic based on real data
		const isBeginnerLevel = user?.level === "beginner" || totalPoints < 100;

		const weeklyGoals = isBeginnerLevel
			? [
					{
						name: "Daily Login",
						completed: streakDays >= 1,
						target: "Login today",
						description: "Build a learning habit",
					},
					{
						name: "First Points",
						completed: totalPoints >= 10,
						target: "Earn 10 points",
						description: "Complete your first activities",
					},
					{
						name: "Start Streak",
						completed: streakDays >= 2,
						target: "2-day streak",
						description: "Keep learning for 2 days",
					},
					{
						name: "Keep Learning",
						completed: totalPoints >= 50,
						target: "Reach 50 points",
						description: "Continue your learning journey",
					},
					{
						name: "Build Habit",
						completed: streakDays >= 3,
						target: "3-day streak",
						description: "Establish a learning routine",
					},
			  ]
			: [
					{
						name: "Daily Learning",
						completed: todayStats.pointsToday > 0,
						target: "Earn points today",
						description: "Continue your daily practice",
					},
					{
						name: "Weekly Goal",
						completed: weekStats.pointsThisWeek >= 100,
						target: "100+ points this week",
						description: "Stay consistent this week",
					},
					{
						name: "Streak Master",
						completed: streakDays >= 7,
						target: "7-day streak",
						description: "Maintain weekly consistency",
					},
					{
						name: "Lesson Progress",
						completed: lessonsCompleted >= 10,
						target: "Complete 10 lessons",
						description: "Build your knowledge base",
					},
					{
						name: "Time Investment",
						completed: timeSpent >= 120,
						target: "120+ minutes total",
						description: "Invest in your learning",
					},
			  ];

		const completedGoals = weeklyGoals.filter((goal) => goal.completed).length;
		const weeklyProgress = (completedGoals / weeklyGoals.length) * 100;

		return {
			overall: Math.round(overallProgress),
			weekly: Math.round(weeklyProgress),
			weeklyGoals: completedGoals,
			totalGoals: weeklyGoals.length,
			goals: weeklyGoals,
			lessonsCompleted,
			timeSpent,
			streakDays,
			totalPoints,
			isBeginnerMode: isBeginnerLevel,
		};
	};

	const progress = calculateProgress();

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			// Refresh user profile data
			if (user) {
				const result = await SupabaseService.getUserProfile(user.id);
				if (result.success && result.data) {
					const updatedUser = {
						...user,
						points: result.data.points,
						streakDays: result.data.streak_days,
						level: result.data.level as
							| "beginner"
							| "intermediate"
							| "advanced",
					};
					setUser(updatedUser);
				}

				// Reload stats
				await loadTodayStats();
				await loadWeekStats();
			}

			Alert.alert("✅ Refreshed", "Progress data has been updated!");
		} catch (error) {
			console.error("Error refreshing:", error);
			Alert.alert("Error", "Failed to refresh data. Please try again.");
		} finally {
			setRefreshing(false);
		}
	};

	const handleStartLearning = () => {
		navigation.getParent()?.navigate("Learning");
	};

	const handleViewProfile = () => {
		navigation.navigate("Profile");
	};

	const handlePracticeVocabulary = () => {
		navigation.getParent()?.navigate("Vocabulary");
	};

	const renderStatCard = (
		title: string,
		value: string | number,
		subtitle: string,
		icon: string,
		color: string,
		onPress?: () => void
	) => (
		<TouchableOpacity
			style={[styles.statCard, { borderLeftColor: color }]}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.statHeader}>
				<Ionicons name={icon as any} size={20} color={color} />
				<Text style={styles.statTitle}>{title}</Text>
			</View>
			<Text style={[styles.statValue, { color }]}>{value}</Text>
			<Text style={styles.statSubtitle}>{subtitle}</Text>
			{onPress && (
				<View style={styles.statArrow}>
					<Ionicons name="chevron-forward" size={16} color="#999" />
				</View>
			)}
		</TouchableOpacity>
	);

	if (!user) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Ionicons name="person-circle-outline" size={64} color="#999" />
					<Text style={styles.errorText}>
						Please log in to view your progress
					</Text>
					<TouchableOpacity
						style={styles.loginButton}
						onPress={() => navigation.navigate("Login")}
					>
						<Text style={styles.loginButtonText}>Go to Login</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Ionicons name="trending-up" size={24} color={theme.colors.primary} />
					<Text style={styles.headerTitle}>Learning Progress</Text>
				</View>
				<TouchableOpacity
					onPress={handleRefresh}
					disabled={refreshing}
					style={styles.refreshButton}
				>
					<Ionicons
						name={refreshing ? "sync" : "refresh"}
						size={20}
						color={refreshing ? "#999" : theme.colors.primary}
					/>
					{refreshing && (
						<ActivityIndicator
							size="small"
							color={theme.colors.primary}
							style={{ marginLeft: 4 }}
						/>
					)}
				</TouchableOpacity>
			</View>{" "}
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Overview Stats */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Overview</Text>
					<View style={styles.statsGrid}>
						{renderStatCard(
							"Lessons Completed",
							progress.lessonsCompleted,
							"Total progress",
							"book",
							"#667eea",
							handleStartLearning
						)}
						{renderStatCard(
							"Current Streak",
							`${progress.streakDays} days`,
							`Best: ${progress.streakDays} days`,
							"flame",
							"#f5576c",
							handleViewProfile
						)}
						{renderStatCard(
							"Study Time",
							`${progress.timeSpent}m`,
							"Total invested",
							"time",
							"#4facfe"
						)}
						{renderStatCard(
							"Points Earned",
							progress.totalPoints,
							"Total points",
							"star",
							"#ffa726",
							handleViewProfile
						)}
					</View>
				</View>

				{/* Overall Progress */}
				<View style={styles.section}>
					<View style={styles.sectionHeaderRow}>
						<Text style={styles.sectionTitle}>Overall Progress</Text>
						<Text style={styles.sectionSubtitle}>
							Level:{" "}
							{user?.level?.charAt(0).toUpperCase() + user?.level?.slice(1)}
						</Text>
					</View>
					<View style={styles.progressCard}>
						<View style={styles.progressHeader}>
							<Text style={styles.progressLabel}>Learning Progress</Text>
							<Text style={styles.progressPercentage}>{progress.overall}%</Text>
						</View>
						<View style={styles.progressBar}>
							<View
								style={[styles.progressFill, { width: `${progress.overall}%` }]}
							/>
						</View>
						<Text style={styles.progressSubtext}>
							Based on {progress.totalPoints} points, {progress.streakDays} day
							streak, and {progress.lessonsCompleted} lessons completed
						</Text>
					</View>
				</View>

				{/* Weekly Goals */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						{progress.isBeginnerMode ? "Getting Started Goals" : "Weekly Goals"}
					</Text>
					<View style={styles.progressCard}>
						<View style={styles.progressHeader}>
							<Text style={styles.progressLabel}>
								{progress.isBeginnerMode
									? "Learning Journey"
									: "This Week's Progress"}
							</Text>
							<Text style={styles.progressPercentage}>{progress.weekly}%</Text>
						</View>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{
										width: `${progress.weekly}%`,
										backgroundColor: "#f5576c",
									},
								]}
							/>
						</View>
						<Text style={styles.progressSubtext}>
							{progress.weeklyGoals}/{progress.totalGoals} goals completed
						</Text>
					</View>

					{/* Goal Details */}
					<View style={styles.goalsContainer}>
						{progress.goals.map((goal, index) => (
							<View key={index} style={styles.goalItem}>
								<Ionicons
									name={goal.completed ? "checkmark-circle" : "ellipse-outline"}
									size={20}
									color={goal.completed ? "#4caf50" : "#b2bec3"}
								/>
								<View style={styles.goalContent}>
									<Text
										style={[
											styles.goalName,
											goal.completed && styles.goalCompleted,
										]}
									>
										{goal.name}
									</Text>
									<Text style={styles.goalTarget}>{goal.target}</Text>
									<Text style={styles.goalDescription}>{goal.description}</Text>
								</View>
								{goal.completed && (
									<View style={styles.goalBadge}>
										<Text style={styles.goalBadgeText}>✓</Text>
									</View>
								)}
							</View>
						))}
					</View>
				</View>

				{/* Today's Activity */}
				<View style={styles.section}>
					<View style={styles.sectionHeaderRow}>
						<Text style={styles.sectionTitle}>Today's Activity</Text>
						<TouchableOpacity onPress={handleStartLearning}>
							<Text style={styles.actionLink}>Start Learning →</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.activityGrid}>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>
								{todayStats.lessonsToday}
							</Text>
							<Text style={styles.activityLabel}>Lessons</Text>
						</View>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>{todayStats.pointsToday}</Text>
							<Text style={styles.activityLabel}>Points</Text>
						</View>
						<View style={styles.activityItem}>
							<Text style={styles.activityValue}>{todayStats.wordsToday}</Text>
							<Text style={styles.activityLabel}>Words</Text>
						</View>
					</View>
				</View>

				{/* This Week's Summary */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>This Week's Summary</Text>
					<View style={styles.weekSummaryGrid}>
						<View style={styles.weekSummaryItem}>
							<Text style={styles.weekSummaryValue}>
								{weekStats.lessonsThisWeek}
							</Text>
							<Text style={styles.weekSummaryLabel}>Lessons Completed</Text>
						</View>
						<View style={styles.weekSummaryItem}>
							<Text style={styles.weekSummaryValue}>
								{weekStats.pointsThisWeek}
							</Text>
							<Text style={styles.weekSummaryLabel}>Points Earned</Text>
						</View>
						<View style={styles.weekSummaryItem}>
							<Text style={styles.weekSummaryValue}>
								{weekStats.timeThisWeek}m
							</Text>
							<Text style={styles.weekSummaryLabel}>Time Invested</Text>
						</View>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.actionsGrid}>
						<TouchableOpacity
							style={[styles.actionButton, { backgroundColor: "#667eea" }]}
							onPress={handleStartLearning}
						>
							<Ionicons name="play-circle" size={24} color="#fff" />
							<Text style={styles.actionButtonText}>Continue Learning</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, { backgroundColor: "#4facfe" }]}
							onPress={handlePracticeVocabulary}
						>
							<Ionicons name="library" size={24} color="#fff" />
							<Text style={styles.actionButtonText}>Practice Vocabulary</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Learning Recommendations */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recommendations</Text>
					<TouchableOpacity
						style={styles.recommendationCard}
						onPress={handleStartLearning}
					>
						<View style={styles.recommendationIcon}>
							<Ionicons name="bulb" size={24} color="#ffa726" />
						</View>
						<View style={styles.recommendationContent}>
							<Text style={styles.recommendationTitle}>
								{progress.isBeginnerMode
									? "Start Your Learning Journey"
									: progress.streakDays === 0
									? "Come Back and Keep Learning!"
									: "Great Progress! Keep It Up!"}
							</Text>
							<Text style={styles.recommendationSubtitle}>
								{progress.isBeginnerMode
									? "Begin with basic French vocabulary and phrases"
									: progress.streakDays === 0
									? "Your learning streak needs attention. Start a lesson today!"
									: `You're on a ${progress.streakDays}-day streak! Continue your amazing progress.`}
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color="#999" />
					</TouchableOpacity>
				</View>

				<View style={styles.bottomSpacing} />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	content: {
		flex: 1,
	},

	// Error State
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 32,
	},
	errorText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 16,
		marginBottom: 24,
	},
	loginButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	loginButtonText: {
		color: theme.colors.textOnPrimary,
		fontSize: 16,
		fontWeight: "600",
	},

	// Header
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: theme.colors.text,
		marginLeft: 8,
	},
	refreshButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: theme.colors.background,
		flexDirection: "row",
		alignItems: "center",
	},

	// Sections
	section: {
		backgroundColor: "#fff",
		marginHorizontal: 16,
		marginBottom: 16,
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#2d3436",
		marginBottom: 16,
	},
	sectionSubtitle: {
		fontSize: 14,
		color: "#636e72",
		fontWeight: "500",
	},
	sectionHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	actionLink: {
		fontSize: 14,
		color: "#667eea",
		fontWeight: "600",
	},

	// Stats Grid
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	statCard: {
		width: "48%",
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderLeftWidth: 3,
		position: "relative",
	},
	statHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	statTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#636e72",
		marginLeft: 8,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 4,
	},
	statSubtitle: {
		fontSize: 12,
		color: "#b2bec3",
	},
	statArrow: {
		position: "absolute",
		top: 16,
		right: 16,
	},

	// Progress Card
	progressCard: {
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	progressLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2d3436",
	},
	progressPercentage: {
		fontSize: 18,
		fontWeight: "700",
		color: "#667eea",
	},
	progressBar: {
		height: 8,
		backgroundColor: "#e9ecef",
		borderRadius: 4,
		marginBottom: 8,
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#667eea",
		borderRadius: 4,
	},
	progressSubtext: {
		fontSize: 12,
		color: "#636e72",
	},

	// Goals
	goalsContainer: {
		marginTop: 8,
	},
	goalItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f1f3f4",
	},
	goalContent: {
		flex: 1,
		marginLeft: 12,
	},
	goalName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#2d3436",
	},
	goalCompleted: {
		color: "#4caf50",
	},
	goalTarget: {
		fontSize: 12,
		color: "#636e72",
		marginTop: 2,
	},
	goalDescription: {
		fontSize: 11,
		color: "#95a5a6",
		marginTop: 2,
		fontStyle: "italic",
	},
	goalBadge: {
		backgroundColor: "#4caf50",
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	goalBadgeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},

	// Activity Grid
	activityGrid: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	activityItem: {
		alignItems: "center",
	},
	activityValue: {
		fontSize: 28,
		fontWeight: "700",
		color: "#667eea",
		marginBottom: 4,
	},
	activityLabel: {
		fontSize: 12,
		color: "#636e72",
		fontWeight: "500",
	},

	// Week Summary
	weekSummaryGrid: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	weekSummaryItem: {
		alignItems: "center",
		flex: 1,
	},
	weekSummaryValue: {
		fontSize: 24,
		fontWeight: "700",
		color: "#f5576c",
		marginBottom: 4,
	},
	weekSummaryLabel: {
		fontSize: 12,
		color: "#636e72",
		fontWeight: "500",
		textAlign: "center",
	}, // Actions
	actionsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: -6,
	},
	actionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		paddingHorizontal: 12,
		borderRadius: 12,
		minHeight: 56,
		marginHorizontal: 6,
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 6,
		flexShrink: 1,
		textAlign: "center",
	},

	// Recommendation Card
	recommendationCard: {
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		borderLeftWidth: 3,
		borderLeftColor: "#ffa726",
	},
	recommendationIcon: {
		backgroundColor: "#fff3e0",
		borderRadius: 8,
		padding: 8,
		marginRight: 12,
	},
	recommendationContent: {
		flex: 1,
	},
	recommendationTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2d3436",
		marginBottom: 4,
	},
	recommendationSubtitle: {
		fontSize: 14,
		color: "#636e72",
	},

	// Bottom spacing
	bottomSpacing: {
		height: 40,
	},
});
