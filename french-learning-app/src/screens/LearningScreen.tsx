import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { ThemeSwitchButton, ModernCard } from "../components/ModernUI";
import { useAuth } from "../contexts/AuthContext";
import { Module } from "../types";
import { Lesson, UserProgress } from "../types/LessonTypes";
import { ContentManagementService } from "../services/contentManagementService";
import { LessonService } from "../services/lessonService";
import { ProgressTrackingService } from "../services/progressTrackingService";

export const LearningScreen: React.FC = () => {
	const { user } = useAuth();
	const navigation = useNavigation<any>();
	const [modules, setModules] = useState<Module[]>([]);
	const [lessonsByModule, setLessonsByModule] = useState<{
		[key: number]: Lesson[];
	}>({});
	const [progressByLesson, setProgressByLesson] = useState<{
		[key: number]: UserProgress;
	}>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [gamification, setGamification] = useState<any>(null);

	useEffect(() => {
		const fetchLearningContent = async () => {
			if (!user?.id) return;
			setLoading(true);
			setError(null);
			try {
				const modulesRes = await ContentManagementService.getModules();
				if (!modulesRes.success || !modulesRes.data)
					throw new Error(modulesRes.error || "Failed to load modules");
				setModules(modulesRes.data);

				const lessonsMap: { [key: number]: Lesson[] } = {};
				const progressMap: { [key: number]: UserProgress } = {};

				for (const mod of modulesRes.data) {
					const { lessons, progress } = await LessonService.getLessonsByModule(
						mod.id,
						user.id
					);
					lessonsMap[mod.id] = lessons;
					progress.forEach((p) => {
						progressMap[p.lesson_id] = p;
					});
				}
				setLessonsByModule(lessonsMap);
				setProgressByLesson(progressMap);

				// Fetch gamification stats
				const gamificationStats =
					await ProgressTrackingService.getProgressAnalytics(user.id);
				setGamification(gamificationStats);
			} catch (err: any) {
				setError(err.message || "An error occurred");
			} finally {
				setLoading(false);
			}
		};
		fetchLearningContent();
	}, [user?.id]);

	const handleLessonPress = (lesson: Lesson) => {
		if (!user) return;
		navigation.navigate("Lesson", {
			lessonId: lesson.id,
			lessonTitle: lesson.title,
			userId: user.id,
		});
	};
	const renderProgress = (progress?: UserProgress) => {
		if (!progress) {
			return (
				<View style={styles.progressBadge}>
					<Ionicons name="play-circle-outline" size={16} color="#666" />
					<Text style={styles.progressBadgeText}>Start</Text>
				</View>
			);
		}
		if (progress.status === "completed") {
			return (
				<View style={[styles.progressBadge, styles.completedBadge]}>
					<Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
					<Text style={[styles.progressBadgeText, { color: "#4CAF50" }]}>
						Complete
					</Text>
				</View>
			);
		}
		if (progress.status === "in_progress") {
			return (
				<View style={[styles.progressBadge, styles.inProgressBadge]}>
					<Ionicons name="time-outline" size={16} color="#FF9800" />
					<Text style={[styles.progressBadgeText, { color: "#FF9800" }]}>
						In Progress
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.progressBadge}>
				<Text style={styles.progressBadgeText}>{progress.status}</Text>
			</View>
		);
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "beginner":
				return "#4CAF50";
			case "intermediate":
				return "#FF9800";
			case "advanced":
				return "#F44336";
			default:
				return "#2196F3";
		}
	};

	const getLessonTypeIcon = (type: string) => {
		switch (type.toLowerCase()) {
			case "vocabulary":
				return "book-outline";
			case "grammar":
				return "library-outline";
			case "conversation":
				return "chatbubbles-outline";
			case "listening":
				return "volume-high-outline";
			case "reading":
				return "document-text-outline";
			default:
				return "school-outline";
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Modern Header */}
				<View style={styles.modernHeader}>
					<View style={styles.headerContent}>
						<View style={styles.headerTextContainer}>
							<Text style={styles.modernTitle}>Learning Path</Text>
							<Text style={styles.modernSubtitle}>
								Master French step by step
							</Text>
						</View>
						<TouchableOpacity style={styles.headerActionButton}>
							<Ionicons name="calendar-outline" size={24} color="#2196F3" />
						</TouchableOpacity>
					</View>
				</View>

				{/* Enhanced Stats Dashboard */}
				{gamification && (
					<View style={styles.statsSection}>
						<Text style={styles.sectionTitle}>Your Progress Today</Text>
						<View style={styles.statsGrid}>
							<View style={styles.statCard}>
								<View style={styles.statIconContainer}>
									<Ionicons name="star" size={24} color="#FFD700" />
								</View>
								<Text style={styles.statNumber}>
									{gamification.points_earned_today ?? 0}
								</Text>
								<Text style={styles.statLabel}>Points Today</Text>
							</View>
							<View style={styles.statCard}>
								<View style={styles.statIconContainer}>
									<Ionicons name="flame" size={24} color="#FF6B35" />
								</View>
								<Text style={styles.statNumber}>
									{gamification.current_streak ?? 0}
								</Text>
								<Text style={styles.statLabel}>Day Streak</Text>
							</View>
							<View style={styles.statCard}>
								<View style={styles.statIconContainer}>
									<Ionicons name="trophy" size={24} color="#4ECDC4" />
								</View>
								<Text style={styles.statNumber}>
									{gamification.total_lessons_completed ?? 0}
								</Text>
								<Text style={styles.statLabel}>Lessons Done</Text>
							</View>
						</View>
					</View>
				)}

				{/* Loading State */}
				{loading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#2196F3" />
						<Text style={styles.loadingText}>Loading your lessons...</Text>
					</View>
				)}

				{/* Error State */}
				{error && (
					<View style={styles.errorContainer}>
						<Ionicons name="alert-circle" size={48} color="#F44336" />
						<Text style={styles.errorTitle}>Oops! Something went wrong</Text>
						<Text style={styles.errorMessage}>{error}</Text>
						<TouchableOpacity style={styles.retryButton}>
							<Text style={styles.retryButtonText}>Try Again</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Modules and Lessons */}
				{!loading && !error && (
					<View style={styles.modulesSection}>
						{modules.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Ionicons name="book-outline" size={64} color="#ccc" />
								<Text style={styles.emptyTitle}>No lessons available</Text>
								<Text style={styles.emptyMessage}>
									Check back later or contact support
								</Text>
							</View>
						) : (
							modules.map((mod, index) => (
								<View key={mod.id} style={styles.moduleContainer}>
									{/* Module Header */}
									<View style={styles.moduleHeader}>
										<View style={styles.moduleIconContainer}>
											<Text style={styles.moduleNumber}>{index + 1}</Text>
										</View>
										<View style={styles.moduleTextContainer}>
											<Text style={styles.moduleTitle}>{mod.title}</Text>
											<Text style={styles.moduleDescription}>
												{mod.description}
											</Text>
										</View>
									</View>

									{/* Lessons List */}
									{lessonsByModule[mod.id] &&
									lessonsByModule[mod.id].length > 0 ? (
										<View style={styles.lessonsContainer}>
											{lessonsByModule[mod.id].map((lesson, lessonIndex) => {
												const progress = progressByLesson[lesson.id];
												return (
													<TouchableOpacity
														key={lesson.id}
														onPress={() => handleLessonPress(lesson)}
														style={styles.lessonCard}
														activeOpacity={0.7}
													>
														<View style={styles.lessonCardContent}>
															{/* Left side - Icon and number */}
															<View style={styles.lessonLeftSection}>
																<View
																	style={[
																		styles.lessonIconContainer,
																		{
																			backgroundColor:
																				getDifficultyColor(
																					lesson.difficulty_level
																				) + "20",
																		},
																	]}
																>
																	<Ionicons
																		name={getLessonTypeIcon(lesson.lesson_type)}
																		size={20}
																		color={getDifficultyColor(
																			lesson.difficulty_level
																		)}
																	/>
																</View>
																<Text style={styles.lessonNumber}>
																	{lessonIndex + 1}
																</Text>
															</View>

															{/* Center - Content */}
															<View style={styles.lessonCenterSection}>
																<Text style={styles.lessonTitle}>
																	{lesson.title}
																</Text>
																<Text
																	style={styles.lessonDescription}
																	numberOfLines={2}
																>
																	{lesson.content?.introduction ||
																		"Start this lesson to learn new concepts"}
																</Text>
																<View style={styles.lessonMetaRow}>
																	<View style={styles.lessonMetaItem}>
																		<Ionicons
																			name="time-outline"
																			size={14}
																			color="#666"
																		/>
																		<Text style={styles.lessonMetaText}>
																			{lesson.estimated_time_minutes || 15}
																			min
																		</Text>
																	</View>
																	<View
																		style={[
																			styles.difficultyTag,
																			{
																				backgroundColor:
																					getDifficultyColor(
																						lesson.difficulty_level
																					) + "20",
																			},
																		]}
																	>
																		<Text
																			style={[
																				styles.difficultyText,
																				{
																					color: getDifficultyColor(
																						lesson.difficulty_level
																					),
																				},
																			]}
																		>
																			{lesson.difficulty_level}
																		</Text>
																	</View>
																</View>
															</View>

															{/* Right side - Progress */}
															<View style={styles.lessonRightSection}>
																{renderProgress(progress)}
																<Ionicons
																	name="chevron-forward"
																	size={20}
																	color="#ccc"
																/>
															</View>
														</View>
													</TouchableOpacity>
												);
											})}
										</View>
									) : (
										<View style={styles.noLessonsContainer}>
											<Ionicons name="school-outline" size={32} color="#ccc" />
											<Text style={styles.noLessonsText}>
												No lessons available for this module
											</Text>
										</View>
									)}
								</View>
							))
						)}
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

	// Modern Header
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
		justifyContent: "space-between",
	},
	headerTextContainer: {
		flex: 1,
	},
	modernTitle: {
		fontSize: 28,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	modernSubtitle: {
		fontSize: 16,
		color: "#666666",
		fontWeight: "400",
	},
	headerActionButton: {
		backgroundColor: "#E3F2FD",
		borderRadius: 12,
		padding: 12,
	},

	// Stats Section
	statsSection: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 16,
	},
	statsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
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
	statIconContainer: {
		marginBottom: 8,
	},
	statNumber: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#666666",
		fontWeight: "500",
		textAlign: "center",
	},

	// Progress Badges
	progressBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	progressBadgeText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#666",
	},
	completedBadge: {
		backgroundColor: "#E8F5E8",
	},
	inProgressBadge: {
		backgroundColor: "#FFF3E0",
	},

	// Loading States
	loadingContainer: {
		alignItems: "center",
		paddingVertical: 40,
	},
	loadingText: {
		fontSize: 16,
		color: "#666",
		marginTop: 16,
	},

	// Error States
	errorContainer: {
		alignItems: "center",
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	errorTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#F44336",
		marginTop: 16,
		marginBottom: 8,
	},
	errorMessage: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: "#2196F3",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#ffffff",
		fontWeight: "600",
	},

	// Empty States
	emptyContainer: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#666",
		marginTop: 16,
		marginBottom: 8,
	},
	emptyMessage: {
		fontSize: 14,
		color: "#999",
		textAlign: "center",
	},

	// Modules Section
	modulesSection: {
		paddingHorizontal: 20,
	},
	moduleContainer: {
		marginBottom: 32,
	},
	moduleHeader: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#ffffff",
		padding: 20,
		borderRadius: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	moduleIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#2196F3",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	moduleNumber: {
		fontSize: 18,
		fontWeight: "700",
		color: "#ffffff",
	},
	moduleTextContainer: {
		flex: 1,
	},
	moduleTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	moduleDescription: {
		fontSize: 14,
		color: "#666666",
		lineHeight: 20,
	},

	// Lessons Container
	lessonsContainer: {
		gap: 12,
	},
	lessonCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	lessonCardContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	lessonLeftSection: {
		alignItems: "center",
		marginRight: 16,
	},
	lessonIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	lessonNumber: {
		fontSize: 12,
		fontWeight: "600",
		color: "#666",
	},
	lessonCenterSection: {
		flex: 1,
		marginRight: 12,
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	lessonDescription: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
		marginBottom: 8,
	},
	lessonMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	lessonMetaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	lessonMetaText: {
		fontSize: 12,
		color: "#666",
	},
	difficultyTag: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 8,
	},
	difficultyText: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "uppercase",
	},
	lessonRightSection: {
		alignItems: "center",
		gap: 8,
	},

	// No Lessons State
	noLessonsContainer: {
		alignItems: "center",
		paddingVertical: 20,
	},
	noLessonsText: {
		fontSize: 14,
		color: "#999",
		marginTop: 8,
		textAlign: "center",
	},
});
