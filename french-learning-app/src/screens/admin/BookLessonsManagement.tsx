// Stage 4.4: Book-Style Lessons Management Screen
// Enhanced lessons management interface for book-style content

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContentManagementService } from "../../services/contentManagementService";
import { BookLessonEditor } from "./BookLessonEditor";
import { Module } from "../../types";
import { Lesson } from "../../types/LessonTypes";

export const BookLessonsManagement: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [modules, setModules] = useState<Module[]>([]);
	const [selectedModule, setSelectedModule] = useState<number | null>(null);
	const [editorVisible, setEditorVisible] = useState(false);
	const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load modules
			const modulesResult = await ContentManagementService.getModules();
			if (modulesResult.success && modulesResult.data) {
				setModules(modulesResult.data);
				if (modulesResult.data.length > 0 && !selectedModule) {
					setSelectedModule(modulesResult.data[0].id);
				}
			}

			// Load lessons for selected module
			if (selectedModule) {
				await loadLessonsForModule(selectedModule);
			}
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Failed to load lessons data");
		} finally {
			setLoading(false);
		}
	};
	const loadLessonsForModule = async (moduleId: number) => {
		try {
			// Use the lesson service to get lessons for a specific module
			const result = await ContentManagementService.getLessons(moduleId);
			if (result.success && result.data) {
				setLessons(result.data as unknown as Lesson[]);
			}
		} catch (error) {
			console.error("Error loading lessons:", error);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const handleModuleSelect = async (moduleId: number) => {
		setSelectedModule(moduleId);
		await loadLessonsForModule(moduleId);
	};

	const handleCreateLesson = () => {
		setEditingLesson(null);
		setEditorVisible(true);
	};

	const handleEditLesson = (lesson: Lesson) => {
		setEditingLesson(lesson);
		setEditorVisible(true);
	};

	const handleSaveLesson = async (lessonData: any) => {
		try {
			let result;

			if (editingLesson) {
				// Update existing lesson
				result = await ContentManagementService.updateLesson(
					editingLesson.id,
					lessonData
				);
			} else {
				// Create new lesson
				result = await ContentManagementService.createLesson(lessonData);
			}

			if (result.success) {
				Alert.alert(
					"Success",
					editingLesson
						? "Lesson updated successfully"
						: "Lesson created successfully"
				);
				setEditorVisible(false);
				setEditingLesson(null);
				if (selectedModule) {
					await loadLessonsForModule(selectedModule);
				}
			} else {
				Alert.alert("Error", result.error || "Failed to save lesson");
			}
		} catch (error) {
			console.error("Error saving lesson:", error);
			Alert.alert("Error", "Failed to save lesson");
		}
	};

	const handleDeleteLesson = (lesson: Lesson) => {
		Alert.alert(
			"Delete Lesson",
			`Are you sure you want to delete "${lesson.title}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const result = await ContentManagementService.deleteLesson(
								lesson.id
							);
							if (result.success) {
								Alert.alert("Success", "Lesson deleted successfully");
								if (selectedModule) {
									await loadLessonsForModule(selectedModule);
								}
							} else {
								Alert.alert("Error", result.error || "Failed to delete lesson");
							}
						} catch (error) {
							console.error("Error deleting lesson:", error);
							Alert.alert("Error", "Failed to delete lesson");
						}
					},
				},
			]
		);
	};

	const renderModuleSelector = () => (
		<View style={styles.moduleSelector}>
			<Text style={styles.sectionTitle}>Select Module</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.moduleScrollView}
			>
				{modules.map((module) => (
					<TouchableOpacity
						key={module.id}
						style={[
							styles.moduleChip,
							selectedModule === module.id && styles.selectedModuleChip,
						]}
						onPress={() => handleModuleSelect(module.id)}
					>
						<Text
							style={[
								styles.moduleChipText,
								selectedModule === module.id && styles.selectedModuleChipText,
							]}
						>
							{module.title}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);

	const renderLessonCard = (lesson: Lesson) => (
		<View key={lesson.id} style={styles.lessonCard}>
			<View style={styles.lessonHeader}>
				<View style={styles.lessonInfo}>
					<Text style={styles.lessonTitle}>{lesson.title}</Text>
					<View style={styles.lessonMeta}>
						<View style={styles.metaItem}>
							<Ionicons name="time-outline" size={14} color="#666" />
							<Text style={styles.metaText}>
								{lesson.estimated_duration} min
							</Text>
						</View>
						<View style={styles.metaItem}>
							<Ionicons
								name={
									lesson.lesson_type === "vocabulary"
										? "book-outline"
										: lesson.lesson_type === "grammar"
										? "library-outline"
										: lesson.lesson_type === "conversation"
										? "chatbubbles-outline"
										: "school-outline"
								}
								size={14}
								color="#666"
							/>
							<Text style={styles.metaText}>{lesson.lesson_type}</Text>
						</View>
						<View
							style={[
								styles.difficultyBadge,
								lesson.difficulty_level === "beginner" && styles.beginnerBadge,
								lesson.difficulty_level === "intermediate" &&
									styles.intermediateBadge,
								lesson.difficulty_level === "advanced" && styles.advancedBadge,
							]}
						>
							<Text style={styles.difficultyText}>
								{lesson.difficulty_level}
							</Text>
						</View>
					</View>
				</View>
				<View style={styles.lessonActions}>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => handleEditLesson(lesson)}
					>
						<Ionicons name="create-outline" size={20} color="#007AFF" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => handleDeleteLesson(lesson)}
					>
						<Ionicons name="trash-outline" size={20} color="#F44336" />
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.lessonContent}>
				{lesson.content?.introduction && (
					<Text style={styles.lessonIntro} numberOfLines={2}>
						{lesson.content.introduction}
					</Text>
				)}

				<View style={styles.lessonStats}>
					{lesson.content?.sections && lesson.content.sections.length > 0 && (
						<View style={styles.statItem}>
							<Ionicons name="document-text-outline" size={16} color="#666" />
							<Text style={styles.statText}>
								{lesson.content.sections.length} section
								{lesson.content.sections.length > 1 ? "s" : ""}
							</Text>
						</View>
					)}

					{lesson.content?.examples && lesson.content.examples.length > 0 && (
						<View style={styles.statItem}>
							<Ionicons name="bulb-outline" size={16} color="#666" />
							<Text style={styles.statText}>
								{lesson.content.examples.length} example
								{lesson.content.examples.length > 1 ? "s" : ""}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	);

	const selectedModuleData = modules.find((m) => m.id === selectedModule);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Book-Style Lessons</Text>
				<TouchableOpacity
					style={styles.createButton}
					onPress={handleCreateLesson}
					disabled={!selectedModule}
				>
					<Ionicons name="add" size={20} color="#fff" />
					<Text style={styles.createButtonText}>Create Lesson</Text>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>Loading lessons...</Text>
				</View>
			) : (
				<ScrollView
					style={styles.content}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					{renderModuleSelector()}

					{selectedModuleData && (
						<View style={styles.moduleInfo}>
							<Text style={styles.moduleTitle}>{selectedModuleData.title}</Text>
							<Text style={styles.moduleDescription}>
								{selectedModuleData.description}
							</Text>
						</View>
					)}

					<View style={styles.lessonsSection}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>
								Lessons ({lessons.length})
							</Text>
						</View>

						{lessons.length === 0 ? (
							<View style={styles.emptyState}>
								<Ionicons name="book-outline" size={48} color="#ccc" />
								<Text style={styles.emptyStateText}>No lessons found</Text>
								<Text style={styles.emptyStateSubtext}>
									Create your first book-style lesson
								</Text>
							</View>
						) : (
							lessons.map(renderLessonCard)
						)}
					</View>
				</ScrollView>
			)}

			{/* Lesson Editor Modal */}
			<BookLessonEditor
				visible={editorVisible}
				onClose={() => {
					setEditorVisible(false);
					setEditingLesson(null);
				}}
				onSave={handleSaveLesson}
				editingLesson={editingLesson}
				modules={modules}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	createButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	createButtonText: {
		color: "#fff",
		fontWeight: "600",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
	content: {
		flex: 1,
	},
	moduleSelector: {
		padding: 16,
		backgroundColor: "#fff",
		marginBottom: 8,
	},
	moduleScrollView: {
		marginTop: 8,
	},
	moduleChip: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 8,
	},
	selectedModuleChip: {
		backgroundColor: "#007AFF",
	},
	moduleChipText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	selectedModuleChipText: {
		color: "#fff",
	},
	moduleInfo: {
		padding: 16,
		backgroundColor: "#fff",
		marginBottom: 8,
	},
	moduleTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	moduleDescription: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
	},
	lessonsSection: {
		padding: 16,
	},
	sectionHeader: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
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
		elevation: 2,
	},
	lessonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	lessonInfo: {
		flex: 1,
		marginRight: 12,
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	lessonMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	metaText: {
		fontSize: 12,
		color: "#666",
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
	},
	beginnerBadge: {
		backgroundColor: "#E8F5E8",
	},
	intermediateBadge: {
		backgroundColor: "#FFF3E0",
	},
	advancedBadge: {
		backgroundColor: "#FFEBEE",
	},
	difficultyText: {
		fontSize: 10,
		fontWeight: "600",
		textTransform: "uppercase",
		color: "#666",
	},
	lessonActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		padding: 8,
	},
	lessonContent: {
		marginTop: 8,
	},
	lessonIntro: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
		marginBottom: 8,
	},
	lessonStats: {
		flexDirection: "row",
		gap: 16,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	statText: {
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyStateText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#666",
		marginTop: 16,
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: "#999",
		marginTop: 8,
	},
});
