import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ModernButton, ModernCard } from "../components/ModernUI";
import { theme } from "../constants/theme";

interface HomeScreenProps {
	navigation: any; // Will be properly typed with navigation types later
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
	const { user, signOut, isAdmin } = useAuth();
	const { theme: currentTheme, isDark, toggleTheme } = useTheme();

	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		const checkOnboarding = async () => {
			try {
				const seen = await AsyncStorage.getItem("hasSeenHomeOnboarding");
				if (!seen) setShowOnboarding(true);
			} catch (e) {
				setShowOnboarding(true); // fallback: show if error
			}
		};
		checkOnboarding();
	}, []);

	const handleDismissOnboarding = async () => {
		try {
			await AsyncStorage.setItem("hasSeenHomeOnboarding", "true");
		} catch {}
		setShowOnboarding(false);
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const learningOptions = [
		{
			title: "Start Learning",
			description: "Begin your French journey",
			icon: "play-circle" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.primary,
			onPress: () => navigation.navigate("Levels"),
		},
		{
			title: "Grammar Practice",
			description: "Master French grammar",
			icon: "book-outline" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.info,
			onPress: () => navigation.navigate("GrammarManagement"),
		},
		{
			title: "Question Practice",
			description: "Test your knowledge",
			icon: "help-circle-outline" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.secondary,
			onPress: () => navigation.navigate("QuestionsManagement"),
		},
		{
			title: "Vocabulary Practice",
			description: "Learn new words",
			icon: "library" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.success,
			onPress: () => navigation.navigate("Vocabulary"),
		},
		{
			title: "Personalized Learning",
			description: "Adaptive learning path",
			icon: "school" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.secondary,
			onPress: () => navigation.navigate("PersonalizedLearning"),
		},
		{
			title: "🎮 Gamification",
			description: "Track achievements & streaks",
			icon: "trophy" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.warning,
			onPress: () => navigation.navigate("Gamification"),
		},
		{
			title: "Leaderboard",
			description: "See top learners",
			icon: "podium-outline" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.success,
			onPress: () => navigation.navigate("Gamification"), // Or a dedicated Leaderboard screen if available
		},
	];

	const aiOptions = [
		{
			title: "AI Conversation Partner",
			description: "Practice with AI chatbot",
			icon: "chatbubbles" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.conversation,
			onPress: () => navigation.navigate("ConversationalAI"),
		},
		{
			title: "AI Features Test",
			description: "Try all AI-powered tools",
			icon: "rocket-outline" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.primary,
			onPress: () => navigation.navigate("AITest"),
		},
		{
			title: "Personalized Learning",
			description: "Adaptive learning path",
			icon: "school" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.secondary,
			onPress: () => navigation.navigate("PersonalizedLearning"),
		},
	];

	const adminOptions = isAdmin()
		? [
				{
					title: "Admin Dashboard",
					icon: "shield-checkmark" as keyof typeof Ionicons.glyphMap,
					color: currentTheme.colors.error,
					onPress: () => navigation.navigate("AdminDashboard"),
				},
				{
					title: "Content Management",
					icon: "folder-open-outline" as keyof typeof Ionicons.glyphMap,
					color: currentTheme.colors.info,
					onPress: () => navigation.navigate("ContentManagementDashboard"),
				},
		  ]
		: [];

	const quickActions = [
		{
			title: "View Profile",
			icon: "person" as keyof typeof Ionicons.glyphMap,
			onPress: () => navigation.navigate("Profile"),
		},
		{
			title: "Progress",
			icon: "stats-chart" as keyof typeof Ionicons.glyphMap,
			onPress: () => navigation.navigate("Progress"),
		},
		{
			title: "Settings",
			icon: "settings" as keyof typeof Ionicons.glyphMap,
			onPress: () => navigation.navigate("ThemeSettings"),
		},
	];

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: currentTheme.colors.background },
			]}
		>
			{/* Onboarding Tooltip Overlay */}
			{showOnboarding && (
				<View style={styles.onboardingOverlay} pointerEvents="box-none">
					<View style={styles.onboardingBox}>
						<Text style={styles.onboardingTitle}>
							Welcome to Your French Journey! 🇫🇷
						</Text>
						<Text style={styles.onboardingText}>
							Start by tapping{" "}
							<Text style={{ fontWeight: "bold" }}>Start Learning</Text> to
							begin lessons. Explore{" "}
							<Text style={{ fontWeight: "bold" }}>
								AI Conversation Partner
							</Text>{" "}
							for practice, and check{" "}
							<Text style={{ fontWeight: "bold" }}>Gamification</Text> to track
							your progress and achievements!
						</Text>
						<Text style={styles.onboardingText}>
							You can always find your{" "}
							<Text style={{ fontWeight: "bold" }}>Profile</Text>,{" "}
							<Text style={{ fontWeight: "bold" }}>Progress</Text>, and{" "}
							<Text style={{ fontWeight: "bold" }}>Settings</Text> in Quick
							Actions below.
						</Text>
						<TouchableOpacity
							style={styles.onboardingButton}
							onPress={handleDismissOnboarding}
						>
							<Text style={styles.onboardingButtonText}>Got it!</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			{/* Header */}
			<View
				style={[
					styles.header,
					{ backgroundColor: currentTheme.colors.surface },
				]}
			>
				<View style={styles.headerContent}>
					<View style={styles.welcomeSection}>
						<Text
							style={[styles.welcomeText, { color: currentTheme.colors.text }]}
						>
							Bonjour! 👋
						</Text>
						<Text
							style={[
								styles.usernameText,
								{ color: currentTheme.colors.textSecondary },
							]}
						>
							{user?.username || user?.email}
						</Text>
					</View>

					<View style={styles.headerActions}>
						<TouchableOpacity
							style={[
								styles.themeToggle,
								{ backgroundColor: currentTheme.colors.surfaceSecondary },
							]}
							onPress={toggleTheme}
						>
							<Ionicons
								name={isDark ? "sunny" : "moon"}
								size={20}
								color={currentTheme.colors.primary}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.settingsButton,
								{ backgroundColor: currentTheme.colors.surfaceSecondary },
							]}
							onPress={() => navigation.navigate("ThemeSettings")}
						>
							<Ionicons
								name="settings"
								size={20}
								color={currentTheme.colors.primary}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Stats Cards */}
				<View style={styles.statsContainer}>
					<ModernCard style={styles.statCard}>
						<Text
							style={[
								styles.statNumber,
								{ color: currentTheme.colors.primary },
							]}
						>
							{user?.points || 0}
						</Text>
						<Text
							style={[
								styles.statLabel,
								{ color: currentTheme.colors.textSecondary },
							]}
						>
							Points
						</Text>
					</ModernCard>

					<ModernCard style={styles.statCard}>
						<Text
							style={[
								styles.statNumber,
								{ color: currentTheme.colors.success },
							]}
						>
							{user?.streakDays || 0}
						</Text>
						<Text
							style={[
								styles.statLabel,
								{ color: currentTheme.colors.textSecondary },
							]}
						>
							Day Streak
						</Text>
					</ModernCard>

					<ModernCard style={styles.statCard}>
						<Text
							style={[
								styles.statLevel,
								{ color: currentTheme.colors.secondary },
							]}
						>
							{user?.level || "beginner"}
						</Text>
						<Text
							style={[
								styles.statLabel,
								{ color: currentTheme.colors.textSecondary },
							]}
						>
							Level
						</Text>
					</ModernCard>
				</View>
				{/* Learning Section */}
				<View style={styles.section}>
					<Text
						style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
					>
						Learning
					</Text>
					<View style={styles.learningGrid}>
						{learningOptions.map((option, index) => (
							<ModernCard
								key={index}
								style={styles.learningCard}
								onPress={option.onPress}
							>
								<View
									style={[
										styles.iconContainer,
										{ backgroundColor: `${option.color}20` },
									]}
								>
									<Ionicons name={option.icon} size={28} color={option.color} />
								</View>
								<Text
									style={[
										styles.cardTitle,
										{ color: currentTheme.colors.text },
									]}
								>
									{option.title}
								</Text>
								<Text
									style={[
										styles.cardDescription,
										{ color: currentTheme.colors.textSecondary },
									]}
								>
									{option.description}
								</Text>
							</ModernCard>
						))}
					</View>
				</View>

				{/* AI & Smart Tools Section */}
				<View style={styles.section}>
					<Text
						style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
					>
						AI & Smart Tools
					</Text>
					<View style={styles.learningGrid}>
						{aiOptions.map((option, index) => (
							<ModernCard
								key={index}
								style={styles.learningCard}
								onPress={option.onPress}
							>
								<View
									style={[
										styles.iconContainer,
										{ backgroundColor: `${option.color}20` },
									]}
								>
									<Ionicons name={option.icon} size={28} color={option.color} />
								</View>
								<Text
									style={[
										styles.cardTitle,
										{ color: currentTheme.colors.text },
									]}
								>
									{option.title}
								</Text>
								<Text
									style={[
										styles.cardDescription,
										{ color: currentTheme.colors.textSecondary },
									]}
								>
									{option.description}
								</Text>
							</ModernCard>
						))}
					</View>
				</View>

				{/* Admin & Content Management Section */}
				{adminOptions.length > 0 && (
					<View style={styles.section}>
						<Text
							style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
						>
							Admin & Content
						</Text>
						<View style={styles.learningGrid}>
							{adminOptions.map((option, index) => (
								<ModernCard
									key={index}
									style={styles.learningCard}
									onPress={option.onPress}
								>
									<View
										style={[
											styles.iconContainer,
											{ backgroundColor: `${option.color}20` },
										]}
									>
										<Ionicons
											name={option.icon}
											size={28}
											color={option.color}
										/>
									</View>
									<Text
										style={[
											styles.cardTitle,
											{ color: currentTheme.colors.text },
										]}
									>
										{option.title}
									</Text>
								</ModernCard>
							))}
						</View>
					</View>
				)}

				{/* Quick Actions */}
				<View style={styles.section}>
					<Text
						style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
					>
						Quick Actions
					</Text>
					<View style={styles.quickActionsRow}>
						{quickActions.map((action: any, index: number) => (
							<ModernCard
								key={index}
								style={styles.quickActionCard}
								onPress={action.onPress}
							>
								<Ionicons
									name={action.icon}
									size={24}
									color={currentTheme.colors.primary}
								/>
								<Text
									style={[
										styles.quickActionText,
										{ color: currentTheme.colors.text },
									]}
								>
									{action.title}
								</Text>
							</ModernCard>
						))}
					</View>
				</View>
				{/* Development/Testing Options */}
				<View style={styles.section}>
					<Text
						style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
					>
						Development & Testing
					</Text>
					<ModernButton
						title="🧪 Conversational AI Test"
						variant="outline"
						onPress={() => navigation.navigate("ConversationalAITest")}
						style={styles.testButton}
					/>
					<ModernButton
						title="🤖 AI Features Test"
						variant="outline"
						onPress={() => navigation.navigate("AITest")}
						style={styles.testButton}
					/>
					{isAdmin() && (
						<ModernButton
							title="👑 Admin Panel"
							variant="primary"
							icon="shield-checkmark"
							onPress={() => navigation.navigate("AdminDashboard")}
							style={styles.testButton}
						/>
					)}
				</View>
				{/* Sign Out */}
				<View style={styles.signOutContainer}>
					<ModernButton
						title="Sign Out"
						variant="ghost"
						icon="log-out"
						onPress={handleSignOut}
						style={{
							...styles.signOutButton,
							borderColor: currentTheme.colors.error,
						}}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingVertical: 16,
		paddingHorizontal: 20,
		...theme.shadows.sm,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	welcomeSection: {
		flex: 1,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 4,
	},
	usernameText: {
		fontSize: 16,
		fontWeight: "400",
	},
	headerActions: {
		flexDirection: "row",
		gap: 12,
	},
	themeToggle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	settingsButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		flex: 1,
		padding: 20,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
		gap: 12,
	},
	statCard: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 20,
	},
	statNumber: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 4,
	},
	statLevel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
		textTransform: "capitalize",
	},
	statLabel: {
		fontSize: 14,
		fontWeight: "400",
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 16,
	},
	learningGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	learningCard: {
		padding: 20,
		alignItems: "center",
		minHeight: 120,
		marginBottom: 12,
	},
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
		textAlign: "center",
	},
	cardDescription: {
		fontSize: 14,
		textAlign: "center",
	},
	quickActionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	quickActionCard: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 8,
	},
	quickActionText: {
		fontSize: 12,
		fontWeight: "500",
		marginTop: 8,
		textAlign: "center",
	},
	testButton: {
		marginBottom: 12,
	},
	signOutContainer: {
		marginTop: 20,
		marginBottom: 32,
	},
	signOutButton: {
		borderWidth: 1,
	},
	onboardingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.45)",
		zIndex: 100,
		justifyContent: "center",
		alignItems: "center",
	},
	onboardingBox: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 28,
		maxWidth: 340,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
	},
	onboardingTitle: {
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 12,
		textAlign: "center",
	},
	onboardingText: {
		fontSize: 15,
		marginBottom: 10,
		color: "#333",
		textAlign: "center",
	},
	onboardingButton: {
		marginTop: 10,
		backgroundColor: "#2563eb",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 24,
		alignSelf: "center",
	},
	onboardingButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});
