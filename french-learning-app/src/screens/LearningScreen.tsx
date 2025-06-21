import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
		if (!progress) return <Text style={styles.progressText}>Not started</Text>;
		if (progress.status === "completed")
			return (
				<Text style={[styles.progressText, { color: theme.colors.success }]}>
					Completed ✓
				</Text>
			);
		if (progress.status === "in_progress")
			return (
				<Text style={[styles.progressText, { color: theme.colors.info }]}>
					In Progress
				</Text>
			);
		return <Text style={styles.progressText}>{progress.status}</Text>;
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.title}>Learning Path</Text>
				<ThemeSwitchButton />
			</View>
			<Text style={styles.subtitle}>
				Follow the steps below to start your French journey!
			</Text>

			{/* Gamification summary */}
			{gamification && (
				<View style={styles.gamificationRow}>
					<View style={styles.gamificationItem}>
						<Text style={styles.gamificationLabel}>Points</Text>
						<Text style={styles.gamificationValue}>
							{gamification.points_earned_today ?? 0}
						</Text>
					</View>
					<View style={styles.gamificationItem}>
						<Text style={styles.gamificationLabel}>Streak</Text>
						<Text style={styles.gamificationValue}>
							{gamification.current_streak ?? 0} 🔥
						</Text>
					</View>
					<View style={styles.gamificationItem}>
						<Text style={styles.gamificationLabel}>Lessons</Text>
						<Text style={styles.gamificationValue}>
							{gamification.total_lessons_completed ?? 0}
						</Text>
					</View>
				</View>
			)}

			{loading && (
				<ActivityIndicator
					size="large"
					color={theme.colors.primary}
					style={{ marginTop: 32 }}
				/>
			)}
			{error && <Text style={styles.errorText}>{error}</Text>}
			{!loading && !error && (
				<>
					{modules.length === 0 && (
						<Text style={styles.infoText}>
							No modules found for your level.
						</Text>
					)}
					{modules.map((mod) => (
						<ModernCard key={mod.id} style={styles.moduleCard}>
							<Text style={styles.sectionTitle}>{mod.title}</Text>
							<Text style={styles.sectionDescription}>{mod.description}</Text>
							{lessonsByModule[mod.id] && lessonsByModule[mod.id].length > 0 ? (
								<View style={styles.lessonsList}>
									{lessonsByModule[mod.id].map((lesson) => {
										const progress = progressByLesson[lesson.id];
										return (
											<TouchableOpacity
												key={lesson.id}
												onPress={() => handleLessonPress(lesson)}
												activeOpacity={0.8}
											>
												<ModernCard style={styles.lessonCard}>
													<View style={styles.lessonHeader}>
														<Text style={styles.lessonTitle}>
															{lesson.title}
														</Text>
														{renderProgress(progress)}
													</View>
													<Text style={styles.lessonDescription}>
														{lesson.content?.introduction ?? ""}
													</Text>
													<Text style={styles.lessonMeta}>
														Type: {lesson.lesson_type} | Difficulty:{" "}
														{lesson.difficulty_level}
													</Text>
												</ModernCard>
											</TouchableOpacity>
										);
									})}
								</View>
							) : (
								<Text style={styles.infoText}>
									No lessons found for this module.
								</Text>
							)}
						</ModernCard>
					))}
				</>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
		padding: 24,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: { fontSize: 24, fontWeight: "700", color: theme.colors.text },
	subtitle: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 24,
	},
	gamificationRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 18,
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 12,
	},
	gamificationItem: {
		alignItems: "center",
		flex: 1,
	},
	gamificationLabel: {
		fontSize: 13,
		color: theme.colors.textSecondary,
	},
	gamificationValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.primary,
	},
	moduleCard: {
		marginBottom: 28,
		padding: 20,
		borderRadius: 16,
		backgroundColor: theme.colors.surface,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: 4,
	},
	sectionDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 12,
	},
	lessonsList: {
		marginTop: 8,
	},
	lessonCard: {
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
		backgroundColor: theme.colors.background,
		elevation: 1,
	},
	lessonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
	},
	progressText: {
		fontSize: 13,
		color: theme.colors.info,
		fontWeight: "500",
	},
	lessonDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 4,
	},
	lessonMeta: {
		fontSize: 12,
		color: theme.colors.info,
	},
	infoText: {
		fontSize: 15,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 24,
	},
	errorText: {
		fontSize: 15,
		color: theme.colors.error,
		textAlign: "center",
		marginTop: 24,
	},
});
