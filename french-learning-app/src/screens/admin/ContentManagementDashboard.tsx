// Stage 3.2: Admin Content Management Dashboard
// Beautiful and comprehensive content management interface

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ContentManagementService } from "../../services/contentManagementService";
import { theme } from "../../constants/theme";
import { Vocabulary, GrammarRule } from "../../types";
import { supabase } from "../../services/supabase";
import { FloatingActionButton } from "../../components/FloatingActionButton";

interface ContentStats {
	vocabulary: number;
	grammarRules: number;
	questions: number;
	pronunciationWords: number;
}

interface Stats extends ContentStats {
	pronunciationWords: number;
}

interface RecentActivity {
	id: string;
	type: "vocabulary" | "grammar" | "question";
	action: "created" | "updated" | "deleted";
	title: string;
	description: string;
	timestamp: string;
	icon: string;
	color: string;
}

export const ContentManagementDashboard = () => {
	const navigation = useNavigation();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [stats, setStats] = useState<Stats>({
		vocabulary: 0,
		grammarRules: 0,
		questions: 0,
		pronunciationWords: 0,
	});
	const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

	const loadRecentActivity = async (
		vocabulary?: Vocabulary[],
		grammarRules?: GrammarRule[]
	) => {
		try {
			const activities: RecentActivity[] = [];

			// Get recent vocabulary
			if (vocabulary && vocabulary.length > 0) {
				const recentVocab = vocabulary.slice(0, 3);
				recentVocab.forEach((vocab) => {
					activities.push({
						id: `vocab-${vocab.id}`,
						type: "vocabulary",
						action: "created",
						title: `Vocabulary "${vocab.french_word}" added`,
						description: `${vocab.french_word} - ${vocab.english_translation}`,
						timestamp: vocab.created_at,
						icon: "📝",
						color: "#96CEB4",
					});
				});
			}

			// Get recent grammar rules
			if (grammarRules && grammarRules.length > 0) {
				grammarRules.slice(0, 2).forEach((rule) => {
					activities.push({
						id: `grammar-${rule.id}`,
						type: "grammar",
						action: "created",
						title: `Grammar rule "${rule.title}" created`,
						description: rule.explanation || "New grammar rule added",
						timestamp: rule.created_at,
						icon: "📋",
						color: "#FFEAA7",
					});
				});
			}

			// Sort by timestamp (most recent first) and take top 5
			const sortedActivities = activities
				.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
				)
				.slice(0, 5);

			setRecentActivity(sortedActivities);
		} catch (error) {
			console.error("Error loading recent activity:", error);
		}
	};
	const loadStats = async () => {
		try {
			// Load content statistics
			const [vocabRes, grammarRes, pronWordsRes] = await Promise.all([
				ContentManagementService.getVocabulary({ limit: 1000 }),
				ContentManagementService.getGrammarRules(),
				// New: fetch pronunciation words count using correct supabase client
				supabase
					.from("pronunciation_words")
					.select("id", { count: "exact", head: true }),
			]);

			setStats({
				vocabulary: vocabRes.data?.length || 0,
				grammarRules: grammarRes.data?.length || 0,
				questions: 0, // Questions removed with lesson system
				pronunciationWords: pronWordsRes.count || 0,
			}); // Load recent activity
			await loadRecentActivity(
				vocabRes.data || undefined,
				grammarRes.data || undefined
			);
		} catch (error) {
			console.error("Error loading content stats:", error);
			Alert.alert("Error", "Failed to load content statistics");
		} finally {
			setLoading(false);
		}
	};
	const onRefresh = async () => {
		setRefreshing(true);
		await loadStats();
		setRefreshing(false);
	};

	useEffect(() => {
		loadStats();
	}, []);

	const getRelativeTime = (timestamp: string) => {
		const now = new Date();
		const date = new Date(timestamp);
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return "Just now";
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		} else if (diffInSeconds < 2592000) {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days} day${days > 1 ? "s" : ""} ago`;
		} else {
			const months = Math.floor(diffInSeconds / 2592000);
			return `${months} month${months > 1 ? "s" : ""} ago`;
		}
	};
	const StatCard = ({
		title,
		count,
		color,
		icon,
		onPress,
	}: {
		title: string;
		count: number;
		color: string;
		icon: string;
		onPress: () => void;
	}) => (
		<TouchableOpacity
			style={[styles.statCard, { borderLeftColor: color }]}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<View style={styles.statHeader}>
				<View
					style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
				>
					<Text style={styles.statIcon}>{icon}</Text>
				</View>
				<Text style={[styles.statCount, { color }]}>{count}</Text>
			</View>
			<Text style={styles.statTitle}>{title}</Text>
			<View style={styles.statFooter}>
				<Text style={styles.statAction}>Tap to manage →</Text>
			</View>
		</TouchableOpacity>
	);

	const ActionCard = ({
		title,
		description,
		icon,
		color,
		onPress,
	}: {
		title: string;
		description: string;
		icon: string;
		color: string;
		onPress: () => void;
	}) => (
		<TouchableOpacity style={styles.actionCard} onPress={onPress}>
			<View style={[styles.actionIcon, { backgroundColor: color }]}>
				<Text style={styles.actionIconText}>{icon}</Text>
			</View>
			<View style={styles.actionContent}>
				<Text style={styles.actionTitle}>{title}</Text>
				<Text style={styles.actionDescription}>{description}</Text>
			</View>
			<Text style={styles.actionArrow}>›</Text>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading content dashboard...</Text>
				</View>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Content Management</Text>
				<Text style={styles.headerSubtitle}>
					Create and manage learning content
				</Text>
			</View>
			{/* Statistics Overview */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>📊 Content Overview</Text>
					<Text style={styles.sectionSubtitle}>
						Tap any card to manage that content type
					</Text>
				</View>
				<View style={styles.statsGrid}>
					<StatCard
						title="Vocabulary"
						count={stats.vocabulary}
						color="#96CEB4"
						icon="📝"
						onPress={() => navigation.navigate("VocabularyManagement" as never)}
					/>
					<StatCard
						title="Grammar Rules"
						count={stats.grammarRules}
						color="#FFEAA7"
						icon="📋"
						onPress={() => navigation.navigate("GrammarManagement" as never)}
					/>
					<StatCard
						title="Questions"
						count={stats.questions}
						color="#DDA0DD"
						icon="❓"
						onPress={() => navigation.navigate("QuestionsManagement" as never)}
					/>
					<StatCard
						title="Pronunciation Words"
						count={stats.pronunciationWords || 0}
						color="#A0E7E5"
						icon="🔊"
						onPress={() =>
							navigation.navigate("PronunciationWordsManagement" as never)
						}
					/>
				</View>
			</View>
			{/* Quick Actions */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
					<Text style={styles.sectionSubtitle}>
						Manage your content efficiently
					</Text>
				</View>
				<Text style={styles.placeholderText}>
					Quick actions for content management will be available here
				</Text>
			</View>
			{/* Recent Activity */}
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>🕒 Recent Content Updates</Text>
					<Text style={styles.sectionSubtitle}>
						Latest changes to your content
					</Text>
				</View>
				<View style={styles.recentActivity}>
					{recentActivity.length === 0 ? (
						<View style={styles.emptyActivity}>
							<Text style={styles.emptyActivityText}>
								No recent activity to display
							</Text>
							<Text style={styles.emptyActivitySubtext}>
								Start creating content to see updates here
							</Text>
						</View>
					) : (
						recentActivity.map((activity) => (
							<View key={activity.id} style={styles.activityItem}>
								<View
									style={[
										styles.activityIcon,
										{ backgroundColor: activity.color },
									]}
								>
									<Text style={styles.activityIconText}>{activity.icon}</Text>
								</View>
								<View style={styles.activityContent}>
									<Text style={styles.activityTitle}>{activity.title}</Text>
									<Text style={styles.activityDescription} numberOfLines={2}>
										{activity.description}
									</Text>
									<Text style={styles.activityTime}>
										{getRelativeTime(activity.timestamp)}
									</Text>
								</View>
							</View>
						))
					)}
				</View>
			</View>
			<FloatingActionButton
				icon="add"
				onPress={() => navigation.navigate("BookManagement" as never)}
			/>
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
	},
	loadingText: {
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
	},
	header: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.xl,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	headerSubtitle: {
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
	},
	section: {
		padding: theme.spacing.lg,
	},
	sectionHeader: {
		marginBottom: theme.spacing.md,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	sectionSubtitle: {
		fontSize: theme.typography.caption.fontSize,
		color: theme.colors.textSecondary,
	},
	placeholderText: {
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginVertical: theme.spacing.lg,
		fontStyle: "italic",
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: theme.spacing.sm,
	},
	statCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		width: "47.5%",
		borderLeftWidth: 4,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		marginBottom: theme.spacing.md,
		minHeight: 100,
	},
	statHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	statIconContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	statIcon: {
		fontSize: 18,
	},
	statCount: {
		fontSize: 24,
		fontWeight: "bold",
	},
	statTitle: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontWeight: "500",
		marginBottom: theme.spacing.xs,
	},
	statFooter: {
		marginTop: "auto",
		paddingTop: theme.spacing.xs,
	},
	statAction: {
		fontSize: 11,
		color: theme.colors.primary,
		fontWeight: "500",
		opacity: 0.8,
	},
	actionsContainer: {
		gap: theme.spacing.md,
	},
	actionCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		flexDirection: "row",
		alignItems: "center",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	actionIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.md,
	},
	actionIconText: {
		fontSize: 20,
		color: "white",
	},
	actionContent: {
		flex: 1,
	},
	actionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	actionDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	actionArrow: {
		fontSize: 24,
		color: theme.colors.textSecondary,
		fontWeight: "300",
	},
	recentActivity: {
		gap: theme.spacing.md,
	},
	activityItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.md,
	},
	activityIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.md,
	},
	activityIconText: {
		fontSize: 16,
		color: "white",
	},
	activityContent: {
		flex: 1,
	},
	activityTitle: {
		fontSize: 14,
		fontWeight: "500",
		color: theme.colors.text,
		marginBottom: 2,
	},
	activityDescription: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: 2,
		lineHeight: 16,
	},
	activityTime: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 2,
	},
	emptyActivity: {
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	emptyActivityText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: theme.spacing.xs,
	},
	emptyActivitySubtext: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	modalContainer: {
		flex: 1,
		backgroundColor: theme.colors.background,
		padding: theme.spacing.lg,
		justifyContent: "center",
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	textInput: {
		backgroundColor: theme.colors.surface,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	modalActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: theme.spacing.md,
	},
	modalButton: {
		flex: 1,
		backgroundColor: theme.colors.primary,
		borderRadius: 8,
		padding: theme.spacing.md,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.md,
	},
	modalButtonText: {
		fontSize: 16,
		color: "white",
		fontWeight: "500",
	},
	modalCloseButton: {
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
	},
	modalCloseButtonText: {
		fontSize: 16,
		color: theme.colors.text,
		fontWeight: "500",
	},
	exportDataContainer: {
		backgroundColor: theme.colors.surface,
		borderRadius: 8,
		padding: theme.spacing.md,
		flex: 1,
	},
	exportData: {
		fontSize: 14,
		color: theme.colors.text,
	},
	fab: {
		position: "absolute",
		bottom: 16,
		right: 16,
	},
});
