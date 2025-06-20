// Lesson List Screen for Stage 4.1 - Core Learning Features
import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
	Lesson,
	UserProgress,
	DifficultyLevel,
	LessonType,
} from "../types/LessonTypes";
import { LessonService } from "../services/lessonService";
import { useAdaptiveDifficulty } from "../hooks/useProgressTracking";

interface LessonListScreenProps {
	route: {
		params: {
			moduleId: number;
			moduleName: string;
			userId: string;
		};
	};
}

interface LessonWithProgress extends Lesson {
	userProgress?: UserProgress;
	isUnlocked: boolean;
	nextUnlocked: boolean;
}

export const LessonListScreen: React.FC<LessonListScreenProps> = ({
	route,
}) => {
	const { moduleId, moduleName, userId } = route.params;
	const navigation = useNavigation();

	const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Adaptive difficulty for recommendations
	const { recommendedDifficulty } = useAdaptiveDifficulty({
		userId,
		lessonType: "mixed" as LessonType,
	});

	useEffect(() => {
		loadLessons();
	}, [moduleId, userId]);

	const loadLessons = async () => {
		try {
			setError(null);

			const { lessons: lessonsData, progress } =
				await LessonService.getLessonsByModule(moduleId, userId); // Combine lessons with progress and determine unlock status
			const lessonsWithProgress: LessonWithProgress[] = lessonsData.map(
				(lesson: Lesson, index: number) => {
					const userProgress = progress.find(
						(p: UserProgress) => p.lesson_id === lesson.id
					);
					const isFirstLesson = index === 0;
					const previousLessonCompleted =
						index === 0 ||
						progress.some(
							(p: UserProgress) =>
								p.lesson_id === lessonsData[index - 1]?.id &&
								p.status === "completed" &&
								p.score >= 60
						);

					return {
						...lesson,
						userProgress,
						isUnlocked: isFirstLesson || previousLessonCompleted,
						nextUnlocked:
							userProgress?.status === "completed" && userProgress.score >= 60,
					};
				}
			);

			setLessons(lessonsWithProgress);
		} catch (err) {
			setError("Failed to load lessons");
			console.error("Error loading lessons:", err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		loadLessons();
	}, []);
	const handleLessonPress = (lesson: LessonWithProgress) => {
		if (!lesson.isUnlocked) {
			Alert.alert(
				"Lesson Locked",
				"Complete the previous lesson to unlock this one.",
				[{ text: "OK" }]
			);
			return;
		}

		// Navigate to lesson renderer
		// Note: This would need proper navigation setup with typed navigation
		console.log("Navigate to lesson:", lesson.id, lesson.title);
		Alert.alert("Lesson Selected", `Opening ${lesson.title}...`);
	};

	const getDifficultyColor = (difficulty: DifficultyLevel): string => {
		switch (difficulty) {
			case "beginner":
				return "#34C759";
			case "intermediate":
				return "#FF9500";
			case "advanced":
				return "#FF3B30";
			default:
				return "#007AFF";
		}
	};

	const getProgressColor = (progress?: UserProgress): string => {
		if (!progress) return "#E0E0E0";

		switch (progress.status) {
			case "completed":
				return "#34C759";
			case "in_progress":
				return "#FF9500";
			case "mastered":
				return "#007AFF";
			default:
				return "#E0E0E0";
		}
	};

	const getProgressText = (progress?: UserProgress): string => {
		if (!progress) return "Not Started";

		switch (progress.status) {
			case "completed":
				return `${progress.score}%`;
			case "in_progress":
				return "In Progress";
			case "mastered":
				return "Mastered";
			default:
				return "Not Started";
		}
	};

	const renderLessonItem = ({
		item,
		index,
	}: {
		item: LessonWithProgress;
		index: number;
	}) => (
		<TouchableOpacity
			style={[styles.lessonCard, !item.isUnlocked && styles.lessonCardLocked]}
			onPress={() => handleLessonPress(item)}
			disabled={!item.isUnlocked}
		>
			<View style={styles.lessonHeader}>
				<View style={styles.lessonNumber}>
					<Text style={styles.lessonNumberText}>{index + 1}</Text>
				</View>

				<View style={styles.lessonInfo}>
					<Text
						style={[
							styles.lessonTitle,
							!item.isUnlocked && styles.lessonTitleLocked,
						]}
					>
						{item.title}
					</Text>

					<View style={styles.lessonMeta}>
						<View
							style={[
								styles.difficultyBadge,
								{ backgroundColor: getDifficultyColor(item.difficulty_level) },
							]}
						>
							<Text style={styles.difficultyText}>{item.difficulty_level}</Text>
						</View>

						<Text style={styles.lessonType}>{item.lesson_type}</Text>

						<Text style={styles.lessonDuration}>
							{item.estimated_duration || 5}min
						</Text>
					</View>
				</View>

				<View style={styles.lessonStatus}>
					{!item.isUnlocked ? (
						<Ionicons name="lock-closed" size={24} color="#999" />
					) : (
						<View style={styles.progressContainer}>
							<View
								style={[
									styles.progressIndicator,
									{ backgroundColor: getProgressColor(item.userProgress) },
								]}
							>
								{item.userProgress?.status === "completed" && (
									<Ionicons name="checkmark" size={16} color="#fff" />
								)}
								{item.userProgress?.status === "in_progress" && (
									<View style={styles.progressDot} />
								)}
							</View>
							<Text style={styles.progressText}>
								{getProgressText(item.userProgress)}
							</Text>
						</View>
					)}
				</View>
			</View>

			{item.userProgress && (
				<View style={styles.lessonStats}>
					<View style={styles.stat}>
						<Ionicons name="star" size={16} color="#FFD700" />
						<Text style={styles.statText}>{item.userProgress.score}%</Text>
					</View>

					<View style={styles.stat}>
						<Ionicons name="time" size={16} color="#666" />
						<Text style={styles.statText}>
							{Math.floor(item.userProgress.time_spent / 60)}m
						</Text>
					</View>

					<View style={styles.stat}>
						<Ionicons name="refresh" size={16} color="#666" />
						<Text style={styles.statText}>{item.userProgress.attempts}x</Text>
					</View>
				</View>
			)}

			{item.difficulty_level === recommendedDifficulty && (
				<View style={styles.recommendedBadge}>
					<Ionicons name="trending-up" size={14} color="#007AFF" />
					<Text style={styles.recommendedText}>Recommended</Text>
				</View>
			)}
		</TouchableOpacity>
	);

	const renderHeader = () => (
		<View style={styles.header}>
			<Text style={styles.moduleTitle}>{moduleName}</Text>{" "}
			<Text style={styles.moduleSubtitle}>
				{lessons.length} lessons •{" "}
				{lessons.filter((l) => l.userProgress?.status === "completed").length}{" "}
				completed
			</Text>
			{recommendedDifficulty && (
				<View style={styles.recommendationContainer}>
					<Ionicons name="bulb" size={20} color="#FF9500" />
					<Text style={styles.recommendationText}>
						Recommended difficulty: {recommendedDifficulty}
					</Text>
				</View>
			)}
		</View>
	);

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Ionicons name="book-outline" size={64} color="#ccc" />
			<Text style={styles.emptyTitle}>No Lessons Available</Text>
			<Text style={styles.emptyText}>
				Lessons for this module haven't been created yet.
			</Text>
		</View>
	);

	const renderError = () => (
		<View style={styles.errorContainer}>
			<Ionicons name="warning-outline" size={64} color="#FF3B30" />
			<Text style={styles.errorTitle}>Error Loading Lessons</Text>
			<Text style={styles.errorText}>{error}</Text>
			<TouchableOpacity style={styles.retryButton} onPress={loadLessons}>
				<Text style={styles.retryButtonText}>Try Again</Text>
			</TouchableOpacity>
		</View>
	);

	if (error) {
		return (
			<SafeAreaView style={styles.container}>{renderError()}</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<FlatList
				data={lessons}
				renderItem={renderLessonItem}
				keyExtractor={(item) => item.id.toString()}
				ListHeaderComponent={renderHeader}
				ListEmptyComponent={!loading ? renderEmpty : null}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#007AFF"]}
						tintColor="#007AFF"
					/>
				}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	header: {
		paddingVertical: 20,
		paddingBottom: 16,
	},
	moduleTitle: {
		fontSize: 28,
		fontWeight: "700",
		color: "#333",
		marginBottom: 4,
	},
	moduleSubtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 12,
	},
	recommendationContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFF9E6",
		padding: 12,
		borderRadius: 8,
		marginTop: 8,
	},
	recommendationText: {
		fontSize: 14,
		color: "#B8860B",
		marginLeft: 8,
		fontWeight: "500",
	},
	lessonCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	lessonCardLocked: {
		opacity: 0.6,
		backgroundColor: "#f8f8f8",
	},
	lessonHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	lessonNumber: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#007AFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	lessonNumberText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	lessonInfo: {
		flex: 1,
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 6,
	},
	lessonTitleLocked: {
		color: "#999",
	},
	lessonMeta: {
		flexDirection: "row",
		alignItems: "center",
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		marginRight: 8,
	},
	difficultyText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	lessonType: {
		fontSize: 12,
		color: "#666",
		marginRight: 8,
		textTransform: "capitalize",
	},
	lessonDuration: {
		fontSize: 12,
		color: "#666",
	},
	lessonStatus: {
		alignItems: "center",
	},
	progressContainer: {
		alignItems: "center",
	},
	progressIndicator: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	progressDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#fff",
	},
	progressText: {
		fontSize: 10,
		color: "#666",
		fontWeight: "500",
	},
	lessonStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	stat: {
		flexDirection: "row",
		alignItems: "center",
	},
	statText: {
		fontSize: 12,
		color: "#666",
		marginLeft: 4,
		fontWeight: "500",
	},
	recommendedBadge: {
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "#E3F2FD",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	recommendedText: {
		fontSize: 10,
		color: "#007AFF",
		marginLeft: 4,
		fontWeight: "600",
	},
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#666",
		marginTop: 16,
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 16,
		color: "#999",
		textAlign: "center",
		paddingHorizontal: 32,
	},
	errorContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
		paddingHorizontal: 32,
	},
	errorTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FF3B30",
		marginTop: 16,
		marginBottom: 8,
	},
	errorText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 24,
	},
	retryButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
