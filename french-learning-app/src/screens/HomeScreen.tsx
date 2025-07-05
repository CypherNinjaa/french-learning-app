import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";
import { CommonActions } from "@react-navigation/native";

interface HomeScreenProps {
	navigation: any; // Will be properly typed with navigation types later
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
	const { user, signOut, isAdmin } = useAuth();
	const currentTheme = theme;
	// Navigation helper function to handle both tab and stack navigation
	const navigateToScreen = (screenName: string) => {
		// For tab screens, navigate within the tab navigator
		if (
			[
				"Learning",
				"Practice",
				"Vocabulary",
				"PronunciationTest",
				"Questions",
				"Profile",
			].includes(screenName)
		) {
			navigation.navigate(screenName);
		} else {
			// For stack screens, navigate to the parent navigator
			navigation.getParent()?.navigate(screenName);
		}
	};

	// Calculate dynamic learning progress based on available metrics
	const calculateProgress = () => {
		const totalPoints = user?.points || 0;
		const streakDays = user?.streakDays || 0;
		const timeSpent = user?.totalTimeSpent ?? Math.floor(totalPoints / 2);

		// Overall progress calculation (0-100%)
		const pointsProgress = Math.min((totalPoints / 1000) * 100, 100);
		const streakProgress = Math.min((streakDays / 30) * 100, 100);
		const timeProgress = Math.min((timeSpent / 300) * 100, 100);

		const overallProgress =
			(pointsProgress + streakProgress + timeProgress) / 3;
		return Math.round(overallProgress);
	};

	const progress = calculateProgress();

	const avatar = user?.avatarUrl ? (
		<Image source={{ uri: user.avatarUrl }} style={styles.avatarLarge} />
	) : (
		<View style={styles.avatarLargePlaceholder}>
			<Text style={styles.avatarInitialsLarge}>
				{user?.username?.[0]?.toUpperCase() || "👤"}
			</Text>
		</View>
	);
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Modern Header */}
				<View style={styles.modernHeader}>
					<View style={styles.headerContent}>
						{avatar}
						<View style={styles.greetingContainer}>
							<Text style={styles.modernGreeting}>
								{`Bonjour${user?.username ? ", " : "!"}${
									user?.username?.split(" ")[0] ||
									user?.email?.split("@")[0] ||
									"!"
								} 👋`}
							</Text>
							<Text style={styles.modernSubGreeting}>
								Ready to learn something new today?
							</Text>
						</View>
					</View>
				</View>
				{/* Stats Dashboard */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Ionicons name="star" size={24} color="#FFD700" />
						<Text style={styles.statNumber}>{user?.points || 0}</Text>
						<Text style={styles.statLabel}>Points</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name="flame" size={24} color="#FF6B35" />
						<Text style={styles.statNumber}>{user?.streakDays || 0}</Text>
						<Text style={styles.statLabel}>Day Streak</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name="trophy" size={24} color="#4ECDC4" />
						<Text
							style={styles.statNumber}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							{user?.level
								? user.level === "advanced"
									? "Expert"
									: user.level.charAt(0).toUpperCase() + user.level.slice(1)
								: "Beginner"}
						</Text>
						<Text style={styles.statLabel}>Level</Text>
					</View>
				</View>
				{/* Learning Progress Section */}
				<View style={styles.progressSection}>
					<TouchableOpacity
						style={styles.progressCard}
						onPress={() => navigateToScreen("Progress")}
						activeOpacity={0.8}
					>
						<View style={styles.progressHeader}>
							<View style={styles.progressHeaderLeft}>
								<Ionicons name="trending-up" size={20} color="#667eea" />
								<Text style={styles.progressTitle}>Learning Progress</Text>
							</View>
							<View style={styles.progressHeaderRight}>
								<Text style={styles.progressPercentage}>{progress}%</Text>
								<Ionicons name="chevron-forward" size={16} color="#999" />
							</View>
						</View>
						<View style={styles.progressBar}>
							<View style={[styles.progressFill, { width: `${progress}%` }]} />
						</View>
						<Text style={styles.progressSubtext}>
							Tap to view detailed progress • {user?.points || 0} points earned
						</Text>
					</TouchableOpacity>
				</View>
				{/* Main Learning Actions */}
				<View style={styles.actionsSection}>
					<Text style={styles.sectionTitle}>Start Learning</Text>
					<View style={styles.modernActionsGrid}>
						<TouchableOpacity
							style={[styles.modernActionCard, { backgroundColor: "#2196F3" }]}
							onPress={() => navigateToScreen("Learning")}
						>
							<View style={styles.actionIconContainer}>
								<Ionicons name="play-circle" size={32} color="#ffffff" />
							</View>
							<Text style={styles.actionTitle}>Start Learning</Text>
							<Text style={styles.actionSubtitle}>Begin your lesson</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modernActionCard, { backgroundColor: "#E91E63" }]}
							onPress={() => navigateToScreen("ConversationalAI")}
						>
							<View style={styles.actionIconContainer}>
								<Ionicons name="chatbubbles" size={32} color="#ffffff" />
							</View>
							<Text style={styles.actionTitle}>AI Chat</Text>
							<Text style={styles.actionSubtitle}>Practice conversation</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modernActionCard, { backgroundColor: "#4CAF50" }]}
							onPress={() => navigateToScreen("Practice")}
						>
							<View style={styles.actionIconContainer}>
								<Ionicons name="rocket" size={32} color="#ffffff" />
							</View>
							<Text style={styles.actionTitle}>Practice</Text>
							<Text style={styles.actionSubtitle}>Review & improve</Text>
						</TouchableOpacity>
					</View>
				</View>
				{/* Quick Actions */}
				<View style={styles.quickActionsSection}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.quickActionsGrid}>
						<TouchableOpacity
							style={styles.quickActionCard}
							onPress={() => navigateToScreen("Profile")}
						>
							<Ionicons name="person" size={24} color="#2196F3" />
							<Text style={styles.quickActionText}>Profile</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.quickActionCard}
							onPress={() => navigateToScreen("Vocabulary")}
						>
							<Ionicons name="library" size={24} color="#9C27B0" />
							<Text style={styles.quickActionText}>Vocabulary</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.quickActionCard}
							onPress={() => navigateToScreen("Questions")}
						>
							<Ionicons name="help-circle" size={24} color="#FF5722" />
							<Text style={styles.quickActionText}>Questions</Text>
						</TouchableOpacity>
					</View>
				</View>
				{/* Admin Dashboard - Redesigned */}
				{isAdmin() && (
					<View style={styles.adminSection}>
						<TouchableOpacity
							style={styles.adminDashboardCard}
							onPress={() => {
								if (isAdmin()) {
									navigateToScreen("AdminDashboard");
								} else {
									alert("Access denied: Admins only.");
								}
							}}
						>
							<View style={styles.adminIconContainer}>
								<Ionicons name="shield-checkmark" size={28} color="#1565C0" />
							</View>
							<View style={styles.adminTextContainer}>
								<Text style={styles.adminTitle}>Admin Dashboard</Text>
								<Text style={styles.adminSubtitle}>Manage content & users</Text>
							</View>
							<Ionicons name="chevron-forward" size={24} color="#1565C0" />
						</TouchableOpacity>
					</View>
				)}
				<View style={{ height: 100 }} />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	// Modern Header Styles
	modernHeader: {
		backgroundColor: "#ffffff",
		paddingTop: 20,
		paddingBottom: 20,
		paddingHorizontal: 20,
		marginBottom: 20,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	greetingContainer: {
		flex: 1,
		marginLeft: 16,
	},
	modernGreeting: {
		fontSize: 24,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	modernSubGreeting: {
		fontSize: 16,
		color: "#666666",
		fontWeight: "400",
	},

	// Stats Dashboard
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	statCard: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		marginHorizontal: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1a1a1a",
		marginTop: 8,
		marginBottom: 4,
		textAlign: "center",
	},
	statLabel: {
		fontSize: 12,
		color: "#666666",
		fontWeight: "500",
		textAlign: "center",
	},

	// Actions Section
	actionsSection: {
		paddingHorizontal: 20,
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 16,
	},
	modernActionsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		flexWrap: "wrap",
	},
	modernActionCard: {
		width: "30%",
		borderRadius: 20,
		padding: 16,
		alignItems: "center",
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 6,
	},
	actionIconContainer: {
		marginBottom: 12,
	},
	actionTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#ffffff",
		textAlign: "center",
		marginBottom: 4,
	},
	actionSubtitle: {
		fontSize: 11,
		color: "#ffffff",
		textAlign: "center",
		opacity: 0.9,
	},

	// Quick Actions
	quickActionsSection: {
		paddingHorizontal: 20,
		marginBottom: 32,
	},
	quickActionsGrid: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	quickActionCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		minWidth: 80,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	quickActionText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#1a1a1a",
		marginTop: 8,
		textAlign: "center",
	},

	// Admin Section - New Design
	adminSection: {
		paddingHorizontal: 20,
		marginBottom: 32,
	},
	adminDashboardCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		borderLeftWidth: 4,
		borderLeftColor: "#1565C0",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
	},
	adminIconContainer: {
		backgroundColor: "#E3F2FD",
		borderRadius: 12,
		padding: 12,
		marginRight: 16,
	},
	adminTextContainer: {
		flex: 1,
	},
	adminTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1565C0",
		marginBottom: 4,
	},
	adminSubtitle: {
		fontSize: 14,
		color: "#666666",
		fontWeight: "400",
	},
	// Legacy styles for avatar (keeping these for compatibility)
	avatarLarge: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#e0e0e0",
	},
	avatarLargePlaceholder: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#e0e0e0",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitialsLarge: {
		fontSize: 28,
		fontWeight: "700",
		color: "#888",
	},

	// Progress Section Styles
	progressSection: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	progressCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	progressHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	progressHeaderRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	progressTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
		marginLeft: 8,
	},
	progressPercentage: {
		fontSize: 16,
		fontWeight: "700",
		color: "#667eea",
		marginRight: 4,
	},
	progressBar: {
		height: 8,
		backgroundColor: "#f1f3f4",
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
		color: "#666666",
		fontWeight: "400",
	},
});
