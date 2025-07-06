import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Image,
	ActivityIndicator,
	Dimensions,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { LearningService } from "../services/LearningService";
import {
	LearningBook,
	LearningLesson,
	DifficultyLevel,
} from "../types/LearningTypes";

const { width } = Dimensions.get("window");

interface BookDetailScreenProps {
	navigation: any;
	route: {
		params: {
			bookId: number;
		};
	};
}

export const BookDetailScreen: React.FC<BookDetailScreenProps> = ({
	navigation,
	route,
}) => {
	const { bookId } = route.params;
	const { user } = useAuth();
	const [book, setBook] = useState<LearningBook | null>(null);
	const [lessons, setLessons] = useState<LearningLesson[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadBookDetails();
	}, [bookId]);

	const loadBookDetails = async () => {
		try {
			setLoading(true);

			// Load book details
			const bookResponse = await LearningService.getBook(bookId);
			if (bookResponse.success && bookResponse.data) {
				setBook(bookResponse.data);
			}
			// Load lessons for this book
			console.log(
				"📚 [BookDetailScreen] Loading lessons for book:",
				bookId,
				"user:",
				user?.id
			);
			const lessonsResponse = await LearningService.getLessonsForBook(
				bookId,
				user?.id
			);
			console.log(
				"📚 [BookDetailScreen] Lessons response:",
				JSON.stringify(lessonsResponse, null, 2)
			);

			if (lessonsResponse.success && lessonsResponse.data) {
				setLessons(lessonsResponse.data);
				console.log(
					`✅ [BookDetailScreen] Loaded ${lessonsResponse.data.length} lessons for user view`
				);
				lessonsResponse.data.forEach((lesson, index) => {
					console.log(
						`  ${index + 1}. ${lesson.title} (ID: ${lesson.id}, Published: ${
							lesson.is_published
						}, Active: ${lesson.is_active})`
					);
				});
			} else {
				console.error(
					"❌ [BookDetailScreen] Failed to load lessons:",
					lessonsResponse.error
				);
			}
		} catch (error) {
			console.error("Error loading book details:", error);
			Alert.alert("Error", "Failed to load book details. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const getDifficultyColor = (
		difficulty: DifficultyLevel
	): [string, string] => {
		switch (difficulty) {
			case "beginner":
				return ["#4CAF50", "#66BB6A"];
			case "intermediate":
				return ["#FF9800", "#FFB74D"];
			case "advanced":
				return ["#F44336", "#EF5350"];
			default:
				return ["#2196F3", "#42A5F5"];
		}
	};

	const getDifficultyIcon = (difficulty: DifficultyLevel) => {
		switch (difficulty) {
			case "beginner":
				return "leaf-outline";
			case "intermediate":
				return "flame-outline";
			case "advanced":
				return "rocket-outline";
			default:
				return "book-outline";
		}
	};

	const getLessonStatusIcon = (lesson: LearningLesson) => {
		if (lesson.is_locked) return "lock-closed";
		if (lesson.user_progress?.status === "completed") return "checkmark-circle";
		if (lesson.user_progress?.status === "in_progress") return "play-circle";
		return "ellipse-outline";
	};

	const getLessonStatusColor = (lesson: LearningLesson) => {
		if (lesson.is_locked) return theme.colors.textSecondary;
		if (lesson.user_progress?.status === "completed") return "#4CAF50";
		if (lesson.user_progress?.status === "in_progress") return "#FF9800";
		return theme.colors.primary;
	};

	const canStartLesson = (lesson: LearningLesson) => {
		return !lesson.is_locked;
	};

	const handleLessonPress = (lesson: LearningLesson) => {
		if (!canStartLesson(lesson)) {
			Alert.alert(
				"Lesson Locked",
				"Complete the previous lesson AND pass its test to unlock this lesson.",
				[{ text: "OK" }]
			);
			return;
		}

		navigation.navigate("LessonDetail", {
			lessonId: lesson.id,
			bookId: bookId,
		});
	};

	const renderLessonCard = (lesson: LearningLesson, index: number) => (
		<TouchableOpacity
			key={lesson.id}
			style={[
				styles.lessonCard,
				!canStartLesson(lesson) && styles.lessonCardDisabled,
			]}
			onPress={() => handleLessonPress(lesson)}
			disabled={!canStartLesson(lesson)}
			activeOpacity={0.7}
		>
			<View style={styles.lessonHeader}>
				<View style={styles.lessonNumber}>
					<Text style={styles.lessonNumberText}>{index + 1}</Text>
				</View>

				<View style={styles.lessonInfo}>
					<Text
						style={[
							styles.lessonTitle,
							!canStartLesson(lesson) && styles.lessonTitleDisabled,
						]}
					>
						{lesson.title}
					</Text>
					{lesson.description && (
						<Text
							style={[
								styles.lessonDescription,
								!canStartLesson(lesson) && styles.lessonDescriptionDisabled,
							]}
						>
							{lesson.description}
						</Text>
					)}
				</View>

				<View style={styles.lessonStatus}>
					<Ionicons
						name={getLessonStatusIcon(lesson)}
						size={24}
						color={getLessonStatusColor(lesson)}
					/>
				</View>
			</View>

			<View style={styles.lessonMeta}>
				<View style={styles.lessonMetaItem}>
					<Ionicons
						name="time-outline"
						size={16}
						color={theme.colors.textSecondary}
					/>
					<Text style={styles.lessonMetaText}>
						{lesson.estimated_duration_minutes} min
					</Text>
				</View>

				{lesson.vocabulary_words && lesson.vocabulary_words.length > 0 && (
					<View style={styles.lessonMetaItem}>
						<Ionicons
							name="library-outline"
							size={16}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.lessonMetaText}>
							{lesson.vocabulary_words.length} words
						</Text>
					</View>
				)}

				{/* Progress and Status Display */}
				<View style={styles.lessonStatusContainer}>
					{lesson.user_progress ? (
						<>
							{lesson.user_progress.status === "completed" &&
								lesson.user_progress.test_passed && (
									<View style={styles.statusBadge}>
										<Ionicons
											name="checkmark-circle"
											size={16}
											color="#4CAF50"
										/>
										<Text style={[styles.statusText, { color: "#4CAF50" }]}>
											Complete
										</Text>
									</View>
								)}

							{lesson.user_progress.status === "completed" &&
								!lesson.user_progress.test_passed && (
									<View style={styles.statusBadge}>
										<Ionicons name="warning" size={16} color="#FF9800" />
										<Text style={[styles.statusText, { color: "#FF9800" }]}>
											Test Required
										</Text>
									</View>
								)}

							{lesson.user_progress.status === "in_progress" && (
								<View style={styles.statusBadge}>
									<Ionicons name="play-circle" size={16} color="#2196F3" />
									<Text style={[styles.statusText, { color: "#2196F3" }]}>
										In Progress
									</Text>
								</View>
							)}

							{lesson.user_progress.completion_percentage !== undefined && (
								<View style={styles.progressContainer}>
									<View style={styles.progressBar}>
										<View
											style={[
												styles.progressFill,
												{
													width: `${lesson.user_progress.completion_percentage}%`,
												},
											]}
										/>
									</View>
									<Text style={styles.progressText}>
										{Math.round(lesson.user_progress.completion_percentage)}%
									</Text>
								</View>
							)}
						</>
					) : (
						<View style={styles.statusBadge}>
							<Ionicons
								name="ellipse-outline"
								size={16}
								color={theme.colors.textSecondary}
							/>
							<Text
								style={[
									styles.statusText,
									{ color: theme.colors.textSecondary },
								]}
							>
								Not Started
							</Text>
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading book details...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!book) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color={theme.colors.error}
					/>
					<Text style={styles.errorTitle}>Book Not Found</Text>
					<Text style={styles.errorText}>
						The book you're looking for doesn't exist.
					</Text>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.backButtonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Book Details</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollViewContent}
			>
				{/* Book Hero Section */}
				<LinearGradient
					colors={getDifficultyColor(book.difficulty_level)}
					style={styles.heroSection}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
				>
					<View style={styles.heroContent}>
						{/* Book Cover */}
						<View style={styles.bookCover}>
							{book.cover_image_url ? (
								<Image
									source={{ uri: book.cover_image_url }}
									style={styles.coverImage}
								/>
							) : (
								<View style={styles.placeholderCover}>
									<Ionicons name="book" size={48} color="white" />
								</View>
							)}
						</View>

						{/* Book Info */}
						<View style={styles.bookInfo}>
							<Text style={styles.bookTitle}>{book.title}</Text>

							<View style={styles.bookMeta}>
								<View style={styles.difficultyBadge}>
									<Ionicons
										name={getDifficultyIcon(book.difficulty_level)}
										size={16}
										color="white"
									/>
									<Text style={styles.difficultyText}>
										{book.difficulty_level.charAt(0).toUpperCase() +
											book.difficulty_level.slice(1)}
									</Text>
								</View>

								<View style={styles.durationBadge}>
									<Ionicons name="time-outline" size={16} color="white" />
									<Text style={styles.durationText}>
										{book.estimated_duration_hours}h total
									</Text>
								</View>
							</View>

							{book.description && (
								<Text style={styles.bookDescription}>{book.description}</Text>
							)}

							{/* Progress */}
							{book.progress_percentage !== undefined && (
								<View style={styles.progressSection}>
									<View style={styles.progressHeader}>
										<Text style={styles.progressLabel}>Your Progress</Text>
										<Text style={styles.progressPercentage}>
											{Math.round(book.progress_percentage)}%
										</Text>
									</View>
									<View style={styles.heroProgressBar}>
										<View
											style={[
												styles.heroProgressFill,
												{ width: `${book.progress_percentage}%` },
											]}
										/>
									</View>
									<Text style={styles.progressSubtext}>
										{book.completed_lessons || 0} lessons completed
									</Text>
								</View>
							)}
						</View>
					</View>
				</LinearGradient>

				{/* Learning Objectives */}
				{book.learning_objectives && book.learning_objectives.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>What you'll learn</Text>
						{book.learning_objectives.map((objective, index) => (
							<View key={index} style={styles.objectiveItem}>
								<Ionicons
									name="checkmark-circle"
									size={20}
									color={theme.colors.primary}
								/>
								<Text style={styles.objectiveText}>{objective}</Text>
							</View>
						))}
					</View>
				)}

				{/* Lessons */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
					{lessons.length > 0 ? (
						lessons.map((lesson, index) => renderLessonCard(lesson, index))
					) : (
						<View style={styles.emptyState}>
							<Ionicons
								name="document-text-outline"
								size={48}
								color={theme.colors.textSecondary}
							/>
							<Text style={styles.emptyStateText}>
								No lessons available yet
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16, // Reduced horizontal padding
		paddingVertical: 12, // Reduced vertical padding
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backBtn: {
		padding: 4,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		textAlign: "center",
	},
	headerSpacer: {
		width: 32,
	},
	heroSection: {
		padding: 16, // Reduced padding to make it more compact
	},
	heroContent: {
		flexDirection: "row",
		gap: 12, // Reduced gap between book cover and content
	},
	bookCover: {
		width: 120,
		height: 160,
	},
	coverImage: {
		width: "100%",
		height: "100%",
		borderRadius: 12,
	},
	placeholderCover: {
		width: "100%",
		height: "100%",
		borderRadius: 12,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	bookInfo: {
		flex: 1,
	},
	bookTitle: {
		fontSize: 22, // Slightly smaller font
		fontWeight: "bold",
		color: "white",
		marginBottom: 8, // Reduced bottom margin
		lineHeight: 28, // Adjusted line height for smaller font
	},
	bookMeta: {
		flexDirection: "row",
		gap: 8, // Reduced gap between badges
		marginBottom: 10, // Reduced bottom margin
	},
	difficultyBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.2)",
		paddingHorizontal: 10, // Reduced horizontal padding
		paddingVertical: 4, // Reduced vertical padding
		borderRadius: 14, // Slightly smaller radius
		gap: 4, // Reduced gap
	},
	difficultyText: {
		fontSize: 14,
		fontWeight: "500",
		color: "white",
	},
	durationBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.2)",
		paddingHorizontal: 10, // Reduced horizontal padding
		paddingVertical: 4, // Reduced vertical padding
		borderRadius: 14, // Slightly smaller radius
		gap: 4, // Reduced gap
	},
	durationText: {
		fontSize: 14,
		fontWeight: "500",
		color: "white",
	},
	bookDescription: {
		fontSize: 15, // Slightly smaller font
		color: "rgba(255,255,255,0.9)",
		lineHeight: 21, // Adjusted line height
		marginBottom: 14, // Reduced bottom margin
	},
	progressSection: {
		backgroundColor: "rgba(255,255,255,0.1)",
		padding: 12, // Reduced padding
		borderRadius: 10, // Slightly smaller radius
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	progressLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
	progressPercentage: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	heroProgressBar: {
		height: 8,
		backgroundColor: "rgba(255,255,255,0.3)",
		borderRadius: 4,
		marginBottom: 8,
	},
	heroProgressFill: {
		height: "100%",
		backgroundColor: "white",
		borderRadius: 4,
	},
	progressSubtext: {
		fontSize: 14,
		color: "rgba(255,255,255,0.8)",
	},
	section: {
		padding: 14, // Reduced padding to make sections more compact
	},
	sectionTitle: {
		fontSize: 18, // Slightly smaller font
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 12, // Reduced bottom margin
	},
	objectiveItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8, // Reduced spacing between objectives
		gap: 8, // Reduced gap between icon and text
	},
	objectiveText: {
		flex: 1,
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 22,
	},
	lessonCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 10, // Slightly smaller radius
		padding: 12, // Reduced internal padding
		marginBottom: 8, // Reduced spacing between lesson cards
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	lessonCardDisabled: {
		opacity: 0.6,
	},
	lessonHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8, // Reduced bottom margin
		gap: 8, // Reduced gap between elements
	},
	lessonNumber: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	lessonNumberText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
	lessonInfo: {
		flex: 1,
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 4,
	},
	lessonTitleDisabled: {
		color: theme.colors.textSecondary,
	},
	lessonDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	lessonDescriptionDisabled: {
		color: theme.colors.textSecondary,
		opacity: 0.7,
	},
	lessonStatus: {
		justifyContent: "center",
	},
	lessonMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10, // Reduced gap between metadata items
	},
	lessonMetaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	lessonMetaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	progressContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: "auto",
		gap: 8,
	},
	progressBar: {
		width: 60,
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
	},
	progressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
		borderRadius: 2,
	},
	progressText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	// Status display styles
	lessonStatusContainer: {
		marginTop: 8,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 4,
		alignSelf: "flex-start",
		gap: 4,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "500",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 16,
		marginBottom: 8,
	},
	errorText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: 24,
	},
	backButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyStateText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginTop: 12,
	},
	scrollViewContent: {
		paddingBottom: 12, // Add bottom padding to the scroll content
	},
});
