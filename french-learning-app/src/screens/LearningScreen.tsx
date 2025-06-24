import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Dimensions,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContentManagementService } from "../services/contentManagementService";
import { ProgressTrackingService } from "../services/progressTrackingService";
import { LessonReader } from "../components/LessonReader";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../services/supabase";
import { theme } from "../constants/theme";

const { width } = Dimensions.get("window");

interface LearningStats {
	totalLessons: number;
	completedLessons: number;
	currentStreak: number;
	totalPoints: number;
}

interface ModuleWithLessons {
	id: string;
	title: string;
	description: string;
	order_index: number;
	lessons: LessonWithProgress[];
}

interface LessonWithProgress {
	id: string;
	title: string;
	description: string;
	lesson_type: string;
	difficulty_level: string;
	estimated_duration: number;
	points_reward: number;
	order_index: number;
	content: any;
	progress?: {
		completion_percentage: number;
		status: string;
		last_accessed: string;
	};
}

export const LearningScreen: React.FC = () => {
	const [modules, setModules] = useState<ModuleWithLessons[]>([]);
	const [stats, setStats] = useState<LearningStats>({
		totalLessons: 0,
		completedLessons: 0,
		currentStreak: 0,
		totalPoints: 0,
	});
	const [selectedLesson, setSelectedLesson] =
		useState<LessonWithProgress | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadData = useCallback(async () => {
		try {
			setError(null);

			// Load modules and lessons
			const modulesResponse = await ContentManagementService.getModules();
			if (!modulesResponse.success || !modulesResponse.data) {
				throw new Error(modulesResponse.error || "Failed to load modules");
			}

			const modulesWithLessons: ModuleWithLessons[] = [];

			// Load lessons for each module
			for (const module of modulesResponse.data) {
				const lessonsResponse = await ContentManagementService.getLessons(
					module.id
				);
				if (lessonsResponse.success && lessonsResponse.data) {
					// Load progress for each lesson
					const lessonsWithProgress = lessonsResponse.data.map(
						(lesson: any) => ({
							...lesson,
							id: lesson.id.toString(), // Convert to string
							progress: {
								completion_percentage: Math.floor(Math.random() * 101), // Mock progress
								status: "in_progress",
								last_accessed: new Date().toISOString(),
							},
						})
					);

					modulesWithLessons.push({
						id: module.id.toString(), // Convert to string
						title: module.title,
						description: module.description || "",
						order_index: module.order_index,
						lessons: lessonsWithProgress,
					});
				}
			}

			setModules(modulesWithLessons);

			// Calculate stats
			const totalLessons = modulesWithLessons.reduce(
				(sum, module) => sum + module.lessons.length,
				0
			);
			const completedLessons = modulesWithLessons.reduce(
				(sum, module) =>
					sum +
					module.lessons.filter(
						(lesson) => lesson.progress?.completion_percentage === 100
					).length,
				0
			);

			// Get current user for analytics
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const analytics = await ProgressTrackingService.getProgressAnalytics(
						user.id
					);
					if (analytics) {
						setStats({
							totalLessons,
							completedLessons,
							currentStreak: analytics.current_streak || 0,
							totalPoints: analytics.points_earned_month || 0,
						});
					} else {
						setStats({
							totalLessons,
							completedLessons,
							currentStreak: 0,
							totalPoints: 0,
						});
					}
				} else {
					setStats({
						totalLessons,
						completedLessons,
						currentStreak: 0,
						totalPoints: 0,
					});
				}
			} catch (error) {
				console.warn("Failed to load analytics:", error);
				setStats({
					totalLessons,
					completedLessons,
					currentStreak: 0,
					totalPoints: 0,
				});
			}
		} catch (error) {
			console.error("Error loading learning data:", error);
			setError(
				error instanceof Error ? error.message : "Failed to load learning data"
			);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleRefresh = () => {
		setRefreshing(true);
		loadData();
	};

	const handleLessonPress = (lesson: LessonWithProgress) => {
		if (!lesson.content || Object.keys(lesson.content).length === 0) {
			Alert.alert(
				"Content Not Available",
				"This lesson content is not ready yet."
			);
			return;
		}
		setSelectedLesson(lesson);
	};

	const handleLessonComplete = async () => {
		if (selectedLesson) {
			// Refresh data to update progress
			await loadData();
		}
	};
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return theme.colors.beginner;
			case "intermediate":
				return theme.colors.intermediate;
			case "advanced":
				return theme.colors.advanced;
			default:
				return theme.colors.textSecondary;
		}
	};

	const getLessonTypeIcon = (type: string) => {
		switch (type) {
			case "vocabulary":
				return "library-outline";
			case "grammar":
				return "construct-outline";
			case "conversation":
				return "chatbubbles-outline";
			case "pronunciation":
				return "volume-high-outline";
			case "culture":
				return "globe-outline";
			default:
				return "book-outline";
		}
	};

	const renderStatsHeader = () => (
		<View
			style={[styles.statsContainer, { backgroundColor: theme.colors.primary }]}
		>
			<View style={styles.statsRow}>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{stats.completedLessons}</Text>
					<Text style={styles.statLabel}>Completed</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{stats.currentStreak}</Text>
					<Text style={styles.statLabel}>Day Streak</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{stats.totalPoints}</Text>
					<Text style={styles.statLabel}>Points</Text>
				</View>
			</View>

			<View style={styles.progressContainer}>
				<Text style={styles.progressText}>
					Overall Progress:{" "}
					{stats.totalLessons > 0
						? Math.round((stats.completedLessons / stats.totalLessons) * 100)
						: 0}
					%
				</Text>
				<View style={styles.progressBar}>
					<View
						style={[
							styles.progressFill,
							{
								width:
									stats.totalLessons > 0
										? `${(stats.completedLessons / stats.totalLessons) * 100}%`
										: "0%",
							},
						]}
					/>
				</View>
			</View>
		</View>
	);
	const renderLessonCard = (lesson: LessonWithProgress) => {
		const completionPercentage = lesson.progress?.completion_percentage || 0;
		const isCompleted = completionPercentage === 100;

		return (
			<TouchableOpacity
				key={lesson.id}
				style={[
					styles.lessonCard,
					{
						backgroundColor: theme.colors.surface,
						borderColor: isCompleted
							? theme.colors.success
							: theme.colors.border,
					},
				]}
				onPress={() => handleLessonPress(lesson)}
				activeOpacity={0.7}
			>
				<View style={styles.lessonHeader}>
					<View style={styles.lessonIconContainer}>
						<Ionicons
							name={getLessonTypeIcon(lesson.lesson_type) as any}
							size={24}
							color={theme.colors.primary}
						/>
					</View>
					<View style={styles.lessonInfo}>
						<Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
							{lesson.title}
						</Text>
						<Text
							style={[
								styles.lessonDescription,
								{ color: theme.colors.textSecondary },
							]}
						>
							{lesson.description || "Tap to start learning"}
						</Text>
					</View>
					<View style={styles.lessonMeta}>
						<View style={styles.difficultyBadge}>
							<Text
								style={[
									styles.difficultyText,
									{ color: getDifficultyColor(lesson.difficulty_level) },
								]}
							>
								{lesson.difficulty_level}
							</Text>
						</View>
						{isCompleted && (
							<Ionicons
								name="checkmark-circle"
								size={20}
								color={theme.colors.success}
								style={styles.completedIcon}
							/>
						)}
					</View>
				</View>

				<View style={styles.lessonFooter}>
					<View style={styles.lessonDetails}>
						<View style={styles.detailItem}>
							<Ionicons
								name="time-outline"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text
								style={[
									styles.detailText,
									{ color: theme.colors.textSecondary },
								]}
							>
								{lesson.estimated_duration} min
							</Text>
						</View>
						<View style={styles.detailItem}>
							<Ionicons
								name="trophy-outline"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text
								style={[
									styles.detailText,
									{ color: theme.colors.textSecondary },
								]}
							>
								{lesson.points_reward} points
							</Text>
						</View>
					</View>

					{completionPercentage > 0 && (
						<View style={styles.progressContainer}>
							<Text
								style={[
									styles.progressPercentage,
									{ color: theme.colors.textSecondary },
								]}
							>
								{completionPercentage}%
							</Text>
							<View style={styles.lessonProgressBar}>
								<View
									style={[
										styles.lessonProgressFill,
										{
											width: `${completionPercentage}%`,
											backgroundColor: isCompleted
												? theme.colors.success
												: theme.colors.primary,
										},
									]}
								/>
							</View>
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};
	const renderModule = (module: ModuleWithLessons) => (
		<View key={module.id} style={styles.moduleContainer}>
			<View style={styles.moduleHeader}>
				<Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
					{module.title}
				</Text>
				<Text
					style={[
						styles.moduleDescription,
						{ color: theme.colors.textSecondary },
					]}
				>
					{module.description}
				</Text>
				<View style={styles.moduleStats}>
					<Text
						style={[
							styles.moduleStatsText,
							{ color: theme.colors.textSecondary },
						]}
					>
						{
							module.lessons.filter(
								(l) => l.progress?.completion_percentage === 100
							).length
						}{" "}
						of {module.lessons.length} lessons completed
					</Text>
				</View>
			</View>

			<View style={styles.lessonsContainer}>
				{module.lessons.map(renderLessonCard)}
			</View>
		</View>
	);

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState description={error} onRetry={loadData} />;
	}

	if (modules.length === 0) {
		return (
			<EmptyState
				title="No Lessons Available"
				description="Check back soon for new learning content!"
			/>
		);
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			{renderStatsHeader()}

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				showsVerticalScrollIndicator={false}
			>
				{modules.map(renderModule)}
			</ScrollView>

			{selectedLesson && (
				<LessonReader
					lesson={selectedLesson}
					onClose={() => setSelectedLesson(null)}
					onComplete={handleLessonComplete}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	statsContainer: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 15,
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	statLabel: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.8)",
		marginTop: 2,
	},
	progressContainer: {
		marginTop: 10,
	},
	progressText: {
		color: "white",
		fontSize: 14,
		textAlign: "center",
		marginBottom: 8,
	},
	progressBar: {
		height: 6,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "white",
		borderRadius: 3,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
	},
	moduleContainer: {
		marginBottom: 30,
	},
	moduleHeader: {
		marginBottom: 15,
	},
	moduleTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 5,
	},
	moduleDescription: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 8,
	},
	moduleStats: {
		flexDirection: "row",
		alignItems: "center",
	},
	moduleStatsText: {
		fontSize: 12,
		fontWeight: "500",
	},
	lessonsContainer: {
		gap: 12,
	},
	lessonCard: {
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	lessonHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	lessonIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(25, 118, 210, 0.1)",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	lessonInfo: {
		flex: 1,
		marginRight: 8,
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
	},
	lessonDescription: {
		fontSize: 13,
		lineHeight: 18,
	},
	lessonMeta: {
		alignItems: "flex-end",
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		backgroundColor: "rgba(0, 0, 0, 0.05)",
		marginBottom: 4,
	},
	difficultyText: {
		fontSize: 10,
		fontWeight: "600",
		textTransform: "uppercase",
	},
	completedIcon: {
		marginTop: 2,
	},
	lessonFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	lessonDetails: {
		flexDirection: "row",
		gap: 16,
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	detailText: {
		fontSize: 12,
	},
	progressPercentage: {
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 4,
		textAlign: "right",
	},
	lessonProgressBar: {
		width: 60,
		height: 4,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
		borderRadius: 2,
		overflow: "hidden",
	},
	lessonProgressFill: {
		height: "100%",
		borderRadius: 2,
	},
});
