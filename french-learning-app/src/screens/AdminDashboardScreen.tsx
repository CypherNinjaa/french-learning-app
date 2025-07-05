// Admin Dashboard Screen - Enhanced Professional UI
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StatusBar,
	Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface AdminStats {
	totalUsers: number;
	totalAdmins: number;
	newUsersThisWeek: number;
	activeUsersToday: number;
	sessionsToday: number;
}

interface DashboardCard {
	title: string;
	description: string;
	icon: string;
	color: string;
	gradient: string[];
	onPress: () => void;
}

export const AdminDashboardScreen = ({ navigation }: any) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<AdminStats | null>(null);

	useEffect(() => {
		loadAdminStats();
	}, []);

	const loadAdminStats = async () => {
		try {
			setLoading(true);
			const result = await SupabaseService.getAdminDashboardStats();

			if (result.success && result.data) {
				setStats(result.data);
			} else {
				Alert.alert("Error", "Failed to load admin statistics");
			}
		} catch (error) {
			console.error("Error loading admin stats:", error);
			Alert.alert("Error", "Failed to load admin data");
		} finally {
			setLoading(false);
		}
	};
	const handleUserManagement = () => {
		Alert.alert(
			"Coming Soon",
			"User management features will be available in Stage 3"
		);
	};

	const handleContentManagement = () => {
		navigation.navigate("ContentManagementDashboard");
	};

	const handleAnalytics = () => {
		Alert.alert(
			"Coming Soon",
			"Advanced analytics will be available in Stage 8"
		);
	};

	const handleSettings = () => {
		Alert.alert(
			"Coming Soon",
			"System settings will be available in future updates"
		);
	};

	const handleReports = () => {
		Alert.alert("Coming Soon", "Advanced reporting features coming soon");
	};

	const handleNotifications = () => {
		Alert.alert("Coming Soon", "Notification management coming soon");
	};

	const dashboardCards: DashboardCard[] = [
		{
			title: "User Management",
			description: "Manage users and permissions",
			icon: "👥",
			color: "#4F46E5",
			gradient: ["#4F46E5", "#7C3AED"],
			onPress: handleUserManagement,
		},
		{
			title: "Book Management",
			description: "Create and manage learning books",
			icon: "📚",
			color: "#059669",
			gradient: ["#059669", "#0D9488"],
			onPress: () => navigation.navigate("BookManagement"),
		},
		{
			title: "Test Management",
			description: "Create and manage lesson tests",
			icon: "📝",
			color: "#7C2D12",
			gradient: ["#7C2D12", "#A16207"],
			onPress: () => navigation.navigate("TestManagement"),
		},
		{
			title: "Content Management",
			description: "Legacy content management",
			icon: "📖",
			color: "#6B7280",
			gradient: ["#6B7280", "#9CA3AF"],
			onPress: handleContentManagement,
		},
		{
			title: "Analytics",
			description: "View platform insights",
			icon: "📊",
			color: "#DC2626",
			gradient: ["#DC2626", "#EA580C"],
			onPress: handleAnalytics,
		},
		{
			title: "System Settings",
			description: "Configure app settings",
			icon: "⚙️",
			color: "#7C2D12",
			gradient: ["#7C2D12", "#A16207"],
			onPress: handleSettings,
		},
		{
			title: "Reports",
			description: "Generate detailed reports",
			icon: "📋",
			color: "#BE185D",
			gradient: ["#BE185D", "#C2410C"],
			onPress: handleReports,
		},
		{
			title: "Notifications",
			description: "Manage system alerts",
			icon: "🔔",
			color: "#0369A1",
			gradient: ["#0369A1", "#0891B2"],
			onPress: handleNotifications,
		},
	];
	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
				<LinearGradient
					colors={["#4F46E5", "#7C3AED"]}
					style={styles.loadingGradient}
				>
					<ActivityIndicator size="large" color="#FFFFFF" />
					<Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
				</LinearGradient>
			</SafeAreaView>
		);
	}

	const renderStatCard = (
		stat: keyof AdminStats,
		label: string,
		icon: string,
		color: string
	) => (
		<View style={[styles.statCard, { borderLeftColor: color }]}>
			<View style={styles.statCardHeader}>
				<Text style={styles.statIcon}>{icon}</Text>
				<Text style={[styles.statNumber, { color }]}>
					{stats ? stats[stat] : 0}
				</Text>
			</View>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);

	const renderDashboardCard = (card: DashboardCard, index: number) => (
		<TouchableOpacity
			key={index}
			style={styles.dashboardCard}
			onPress={card.onPress}
			activeOpacity={0.8}
		>
			<LinearGradient
				colors={card.gradient as [string, string]}
				style={styles.cardGradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.cardContent}>
					<Text style={styles.cardIcon}>{card.icon}</Text>
					<Text style={styles.cardTitle}>{card.title}</Text>
					<Text style={styles.cardDescription}>{card.description}</Text>
				</View>
				<View style={styles.cardArrow}>
					<Text style={styles.arrowText}>→</Text>
				</View>
			</LinearGradient>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

			{/* Header with Gradient */}
			<LinearGradient
				colors={["#4F46E5", "#7C3AED"] as [string, string]}
				style={styles.header}
			>
				<View style={styles.headerContent}>
					<View>
						<Text style={styles.title}>Admin Dashboard</Text>
						<Text style={styles.subtitle}>
							Welcome back, {user?.username || "Admin"}!
						</Text>
					</View>
					<TouchableOpacity
						style={styles.profileButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.profileIcon}>👤</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Statistics Section */}
				{stats && (
					<View style={styles.statsSection}>
						<Text style={styles.sectionTitle}>📈 Platform Overview</Text>
						<View style={styles.statsGrid}>
							{renderStatCard("totalUsers", "Total Users", "👥", "#4F46E5")}
							{renderStatCard("totalAdmins", "Total Admins", "🛡️", "#059669")}
							{renderStatCard(
								"newUsersThisWeek",
								"New This Week",
								"📈",
								"#DC2626"
							)}
							{renderStatCard(
								"activeUsersToday",
								"Active Today",
								"⚡",
								"#EA580C"
							)}
						</View>
					</View>
				)}

				{/* Quick Actions Section */}
				<View style={styles.actionsSection}>
					<Text style={styles.sectionTitle}>� Quick Actions</Text>
					<View style={styles.cardsGrid}>
						{dashboardCards.map((card, index) =>
							renderDashboardCard(card, index)
						)}
					</View>
				</View>

				{/* Recent Activity Section */}
				<View style={styles.recentSection}>
					<Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
					<View style={styles.activityCard}>
						<Text style={styles.activityText}>
							📚 New lesson created: "French Greetings"
						</Text>
						<Text style={styles.activityTime}>2 hours ago</Text>
					</View>
					<View style={styles.activityCard}>
						<Text style={styles.activityText}>
							👤 New user registered: Marie L.
						</Text>
						<Text style={styles.activityTime}>4 hours ago</Text>
					</View>
					<View style={styles.activityCard}>
						<Text style={styles.activityText}>📊 Weekly report generated</Text>
						<Text style={styles.activityTime}>1 day ago</Text>
					</View>
				</View>

				{/* Back Button */}
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.backButtonText}>← Back to Home</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	loadingContainer: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	loadingGradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		color: "#FFFFFF",
		marginTop: 16,
		fontSize: 16,
		fontWeight: "500",
	},
	header: {
		paddingTop: 20,
		paddingBottom: 30,
		paddingHorizontal: 20,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "#E2E8F0",
		fontWeight: "400",
	},
	profileButton: {
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	profileIcon: {
		fontSize: 18,
		color: "#FFFFFF",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 100,
	},
	statsSection: {
		backgroundColor: "#FFFFFF",
		marginHorizontal: 20,
		marginTop: -20,
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1E293B",
		marginBottom: 16,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	statCard: {
		backgroundColor: "#F8FAFC",
		borderRadius: 12,
		padding: 16,
		width: "48%",
		marginBottom: 12,
		borderLeftWidth: 4,
		borderLeftColor: "#4F46E5",
	},
	statCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	statIcon: {
		fontSize: 20,
	},
	statNumber: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#4F46E5",
	},
	statLabel: {
		fontSize: 12,
		color: "#64748B",
		fontWeight: "500",
	},
	actionsSection: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	cardsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	dashboardCard: {
		width: "48%",
		marginBottom: 16,
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 6,
	},
	cardGradient: {
		padding: 20,
		minHeight: 120,
		justifyContent: "space-between",
	},
	cardContent: {
		flex: 1,
	},
	cardIcon: {
		fontSize: 28,
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	cardDescription: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.8)",
		lineHeight: 16,
	},
	cardArrow: {
		alignSelf: "flex-end",
		marginTop: 8,
	},
	arrowText: {
		fontSize: 18,
		color: "#FFFFFF",
		fontWeight: "bold",
	},
	recentSection: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	activityCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
		borderLeftWidth: 3,
		borderLeftColor: "#4F46E5",
	},
	activityText: {
		fontSize: 14,
		color: "#1E293B",
		marginBottom: 4,
	},
	activityTime: {
		fontSize: 12,
		color: "#64748B",
	},
	backButton: {
		backgroundColor: "#64748B",
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 20,
		marginHorizontal: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	backButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});
