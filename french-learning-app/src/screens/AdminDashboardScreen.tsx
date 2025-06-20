// Admin Dashboard Screen - Stage 2.3
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { SupabaseService } from "../services/supabaseService";
import { theme } from "../constants/theme";

interface AdminStats {
	totalUsers: number;
	totalAdmins: number;
	newUsersThisWeek: number;
	activeUsersToday: number;
	sessionsToday: number;
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
		Alert.alert(
			"Coming Soon",
			"Content management features will be available in Stage 3"
		);
	};

	const handleAnalytics = () => {
		Alert.alert(
			"Coming Soon",
			"Advanced analytics will be available in Stage 8"
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={theme.colors.primary} />
				<Text style={styles.loadingText}>Loading admin dashboard...</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Admin Dashboard</Text>
				<Text style={styles.subtitle}>Welcome back, {user?.username}!</Text>
			</View>

			{stats && (
				<View style={styles.statsSection}>
					<Text style={styles.sectionTitle}>Platform Statistics</Text>

					<View style={styles.statsGrid}>
						<View style={styles.statCard}>
							<Text style={styles.statNumber}>{stats.totalUsers}</Text>
							<Text style={styles.statLabel}>Total Users</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statNumber}>{stats.totalAdmins}</Text>
							<Text style={styles.statLabel}>Total Admins</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statNumber}>{stats.newUsersThisWeek}</Text>
							<Text style={styles.statLabel}>New This Week</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statNumber}>{stats.activeUsersToday}</Text>
							<Text style={styles.statLabel}>Active Today</Text>
						</View>
					</View>
				</View>
			)}

			<View style={styles.actionsSection}>
				<Text style={styles.sectionTitle}>Admin Actions</Text>

				<TouchableOpacity
					style={styles.actionButton}
					onPress={handleUserManagement}
				>
					<Text style={styles.actionButtonText}>👥 Manage Users</Text>
					<Text style={styles.actionDescription}>
						View and manage user accounts
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.actionButton}
					onPress={handleContentManagement}
				>
					<Text style={styles.actionButtonText}>📚 Manage Content</Text>
					<Text style={styles.actionDescription}>
						Create and edit learning materials
					</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.actionButton} onPress={handleAnalytics}>
					<Text style={styles.actionButtonText}>📊 View Analytics</Text>
					<Text style={styles.actionDescription}>
						Platform usage and performance metrics
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionButton, styles.backButton]}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.backButtonText}>← Back to Home</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
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
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.md,
	},
	header: {
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.xl,
		paddingHorizontal: theme.spacing.lg,
		marginBottom: theme.spacing.md,
	},
	title: {
		...theme.typography.heading,
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
	},
	subtitle: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
	},
	statsSection: {
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.lg,
		paddingHorizontal: theme.spacing.lg,
		marginBottom: theme.spacing.md,
	},
	sectionTitle: {
		...theme.typography.subheading,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	statCard: {
		backgroundColor: theme.colors.background,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.sm,
		borderRadius: 8,
		alignItems: "center",
		width: "48%",
		marginBottom: theme.spacing.sm,
	},
	statNumber: {
		fontSize: 28,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
	},
	statLabel: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	actionsSection: {
		backgroundColor: theme.colors.surface,
		paddingVertical: theme.spacing.lg,
		paddingHorizontal: theme.spacing.lg,
	},
	actionButton: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.primary,
		borderRadius: 8,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		marginBottom: theme.spacing.md,
	},
	actionButtonText: {
		...theme.typography.subheading,
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
	},
	actionDescription: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		fontSize: 14,
	},
	backButton: {
		backgroundColor: theme.colors.textSecondary,
		borderColor: theme.colors.textSecondary,
		marginTop: theme.spacing.lg,
	},
	backButtonText: {
		...theme.typography.body,
		color: theme.colors.surface,
		fontWeight: "600",
		textAlign: "center",
	},
});
