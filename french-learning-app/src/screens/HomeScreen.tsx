import React from "react";
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
			onPress: () => navigation.navigate("Learning"), // Changed to navigate to the Learning tab
		},
		{
			title: "AI Conversation Partner",
			description: "Practice with AI chatbot",
			icon: "chatbubbles" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.conversation,
			onPress: () => navigation.navigate("ConversationalAI"),
		},
		{
			title: "Practice Pronunciation",
			description: "Improve your speaking",
			icon: "mic" as keyof typeof Ionicons.glyphMap,
			color: currentTheme.colors.pronunciation,
			onPress: () => navigation.navigate("PronunciationTest"),
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
	];

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
				</View>

				{/* Beginner Learning Flow */}
				{user?.level === "beginner" && (
					<View style={styles.section}>
						<Text
							style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
						>
							Start Your French Journey
						</Text>
						<ModernCard
							style={styles.learningCard}
							onPress={() => navigation.navigate("Learning")}
						>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: `${currentTheme.colors.primary}20` },
								]}
							>
								<Ionicons
									name="play-circle"
									size={32}
									color={currentTheme.colors.primary}
								/>
							</View>
							<Text
								style={[styles.cardTitle, { color: currentTheme.colors.text }]}
							>
								Start Learning
							</Text>
							<Text
								style={[
									styles.cardDescription,
									{ color: currentTheme.colors.textSecondary },
								]}
							>
								Begin with guided lessons designed for absolute beginners.
							</Text>
						</ModernCard>
						<ModernCard
							style={styles.learningCard}
							onPress={() => navigation.navigate("Vocabulary")}
						>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: `${currentTheme.colors.success}20` },
								]}
							>
								<Ionicons
									name="library"
									size={32}
									color={currentTheme.colors.success}
								/>
							</View>
							<Text
								style={[styles.cardTitle, { color: currentTheme.colors.text }]}
							>
								Vocabulary Practice
							</Text>
							<Text
								style={[
									styles.cardDescription,
									{ color: currentTheme.colors.textSecondary },
								]}
							>
								Learn essential French words and phrases.
							</Text>
						</ModernCard>
						<ModernCard
							style={styles.learningCard}
							onPress={() => navigation.navigate("PronunciationTest")}
						>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: `${currentTheme.colors.pronunciation}20` },
								]}
							>
								<Ionicons
									name="mic"
									size={32}
									color={currentTheme.colors.pronunciation}
								/>
							</View>
							<Text
								style={[styles.cardTitle, { color: currentTheme.colors.text }]}
							>
								Practice Pronunciation
							</Text>
							<Text
								style={[
									styles.cardDescription,
									{ color: currentTheme.colors.textSecondary },
								]}
							>
								Improve your speaking and listening skills.
							</Text>
						</ModernCard>
					</View>
				)}

				{/* Only show Quick Actions for non-beginners */}
				{user?.level !== "beginner" && (
					<View style={styles.section}>
						<Text
							style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
						>
							Quick Actions
						</Text>
						<View style={styles.quickActionsRow}>
							{quickActions.map((action, index) => (
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
				)}

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
						title="🧑‍💻 AI Features Test"
						variant="outline"
						onPress={() => navigation.navigate("AITest")}
						style={styles.testButton}
					/>
					{isAdmin() && (
						<ModernButton
							title="👑 Admin Panel"
							variant="primary"
							icon="shield-checkmark"
							onPress={() => navigation.getParent()?.navigate("AdminDashboard")}
							style={styles.testButton}
						/>
					)}
					{isAdmin() && (
						<ModernButton
							title="📚 Content Management"
							variant="primary"
							icon="folder"
							onPress={() =>
								navigation.getParent()?.navigate("ContentManagementDashboard")
							}
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
		fontSize: 13, // Decreased from 16
		fontWeight: "500", // Slightly lighter
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
});
