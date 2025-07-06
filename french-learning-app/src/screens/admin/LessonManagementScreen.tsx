import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
	Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { LearningService } from "../../services/LearningService";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import {
	LearningLesson,
	LearningBook,
	DifficultyLevel,
	CreateLessonDto,
	UpdateLessonDto,
} from "../../types/LearningTypes";

interface LessonManagementScreenProps {
	navigation: any;
	route: {
		params: {
			bookId: number;
			createNew?: boolean;
		};
	};
}

interface LessonFormData {
	book_id: number;
	title: string;
	description: string;
	content: string;
	vocabulary_words: string;
	audio_url: string;
	estimated_duration_minutes: number;
	difficulty_level: DifficultyLevel;
	learning_objectives: string;
}

export const LessonManagementScreen: React.FC<LessonManagementScreenProps> = ({
	navigation,
	route,
}) => {
	const { bookId, createNew } = route.params;
	const { user, isAdmin } = useAuth();
	const [book, setBook] = useState<LearningBook | null>(null);
	const [lessons, setLessons] = useState<LearningLesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingLesson, setEditingLesson] = useState<LearningLesson | null>(
		null
	);

	const [formData, setFormData] = useState<LessonFormData>({
		book_id: bookId,
		title: "",
		description: "",
		content: "",
		vocabulary_words: "",
		audio_url: "",
		estimated_duration_minutes: 20,
		difficulty_level: "beginner",
		learning_objectives: "",
	});

	useEffect(() => {
		if (!isAdmin) {
			Alert.alert(
				"Access Denied",
				"You need admin privileges to access this screen."
			);
			navigation.goBack();
			return;
		}
		loadData();

		// Auto-open create modal if createNew param is true
		if (createNew) {
			setTimeout(() => {
				console.log("Auto-opening lesson creation modal");
				setShowModal(true);
			}, 500);
		}
	}, [createNew]);

	const loadData = async () => {
		try {
			console.log("🔄 [LessonManagementScreen] Loading data...");
			setLoading(true);

			// Load book info
			console.log(
				"📚 [LessonManagementScreen] Loading book info for bookId:",
				bookId
			);
			const bookResponse = await LearningService.getBook(bookId);
			console.log(
				"📚 [LessonManagementScreen] Book response:",
				JSON.stringify(bookResponse, null, 2)
			);

			if (bookResponse.success && bookResponse.data) {
				setBook(bookResponse.data);
				setFormData((prev) => ({
					...prev,
					difficulty_level: bookResponse.data?.difficulty_level || "beginner",
				}));
				console.log(
					"✅ [LessonManagementScreen] Book loaded successfully:",
					bookResponse.data.title
				);
			} else {
				console.error(
					"❌ [LessonManagementScreen] Failed to load book:",
					bookResponse.error
				);
			}

			// Load lessons for this book
			console.log("📝 [LessonManagementScreen] Loading lessons for book...");
			const lessonsResponse = await LearningService.getAllLessonsForBook(
				bookId
			);
			console.log(
				"📝 [LessonManagementScreen] Lessons response:",
				JSON.stringify(lessonsResponse, null, 2)
			);

			if (lessonsResponse.success && lessonsResponse.data) {
				setLessons(lessonsResponse.data);
				console.log(
					`✅ [LessonManagementScreen] Loaded ${lessonsResponse.data.length} lessons`
				);
				lessonsResponse.data.forEach((lesson, index) => {
					console.log(`  ${index + 1}. ${lesson.title} (ID: ${lesson.id})`);
				});
			} else {
				console.error(
					"❌ [LessonManagementScreen] Failed to load lessons:",
					lessonsResponse.error
				);
			}
		} catch (error) {
			console.error("❌ [LessonManagementScreen] Error loading data:", error);
			Alert.alert("Error", "Failed to load data. Please try again.");
		} finally {
			setLoading(false);
			console.log("🔄 [LessonManagementScreen] Data loading completed");
		}
	};

	const handleCreateLesson = async () => {
		try {
			console.log("🔍 [LessonManagementScreen] Starting lesson creation...");

			if (!formData.title.trim()) {
				Alert.alert("Error", "Please enter a lesson title.");
				return;
			}

			console.log(
				"📝 [LessonManagementScreen] Form data:",
				JSON.stringify(formData, null, 2)
			);

			// Convert string data to proper formats
			const vocabularyArray = formData.vocabulary_words
				.split(",")
				.map((word) => word.trim())
				.filter((word) => word.length > 0);

			const objectivesArray = formData.learning_objectives
				.split("\n")
				.map((obj) => obj.trim())
				.filter((obj) => obj.length > 0);

			console.log(
				"📚 [LessonManagementScreen] Processed vocabulary:",
				vocabularyArray
			);
			console.log(
				"🎯 [LessonManagementScreen] Processed objectives:",
				objectivesArray
			);

			// Create structured content
			const structuredContent = {
				introduction: formData.description || "Welcome to this lesson!",
				main_content: [
					{
						id: "intro-section",
						type: "text" as const,
						title: "Introduction",
						content: formData.description || "Welcome to this lesson!",
						order_index: 1,
					},
					{
						id: "main-section",
						type: "text" as const,
						title: "Lesson Content",
						content: formData.content || "Lesson content will be here.",
						order_index: 2,
					},
				],
				summary: "Complete this lesson to progress to the test.",
				key_points: objectivesArray,
			};

			console.log(
				"📄 [LessonManagementScreen] Structured content:",
				JSON.stringify(structuredContent, null, 2)
			);

			const createData: CreateLessonDto = {
				book_id: formData.book_id,
				title: formData.title,
				description: formData.description,
				content: structuredContent,
				vocabulary_words: vocabularyArray,
				audio_url: formData.audio_url || undefined,
				estimated_duration_minutes: formData.estimated_duration_minutes,
				difficulty_level: formData.difficulty_level,
				learning_objectives: objectivesArray,
				order_index: lessons.length + 1,
			};

			console.log(
				"🚀 [LessonManagementScreen] Sending create data to service:",
				JSON.stringify(createData, null, 2)
			);

			const response = await LearningService.createLesson(createData);

			console.log(
				"📮 [LessonManagementScreen] Service response:",
				JSON.stringify(response, null, 2)
			);

			if (response.success) {
				console.log("✅ [LessonManagementScreen] Lesson created successfully!");
				Alert.alert("Success", "Lesson created successfully!");
				setShowModal(false);
				resetForm();
				await loadData(); // Make sure to await this
			} else {
				console.error(
					"❌ [LessonManagementScreen] Service returned error:",
					response.error
				);
				Alert.alert("Error", response.error || "Failed to create lesson");
			}
		} catch (error) {
			console.error(
				"❌ [LessonManagementScreen] Unexpected error creating lesson:",
				error
			);
			Alert.alert("Error", "Failed to create lesson. Please try again.");
		}
	};

	const handleUpdateLesson = async () => {
		try {
			if (!editingLesson || !formData.title.trim()) {
				Alert.alert("Error", "Please enter a lesson title.");
				return;
			}

			const vocabularyArray = formData.vocabulary_words
				.split(",")
				.map((word) => word.trim())
				.filter((word) => word.length > 0);

			const objectivesArray = formData.learning_objectives
				.split("\n")
				.map((obj) => obj.trim())
				.filter((obj) => obj.length > 0);

			const structuredContent = {
				introduction: formData.description || "Welcome to this lesson!",
				main_content: [
					{
						id: "intro-section",
						type: "text" as const,
						title: "Introduction",
						content: formData.description || "Welcome to this lesson!",
						order_index: 1,
					},
					{
						id: "main-section",
						type: "text" as const,
						title: "Lesson Content",
						content: formData.content || "Lesson content will be here.",
						order_index: 2,
					},
				],
				summary: "Complete this lesson to progress to the test.",
				key_points: objectivesArray,
			};

			const updateData: UpdateLessonDto = {
				title: formData.title,
				description: formData.description,
				content: structuredContent,
				vocabulary_words: vocabularyArray,
				audio_url: formData.audio_url || undefined,
				estimated_duration_minutes: formData.estimated_duration_minutes,
				difficulty_level: formData.difficulty_level,
				learning_objectives: objectivesArray,
			};

			const response = await LearningService.updateLesson(
				editingLesson.id,
				updateData
			);
			if (response.success) {
				Alert.alert("Success", "Lesson updated successfully!");
				setShowModal(false);
				resetForm();
				loadData();
			} else {
				Alert.alert("Error", response.error || "Failed to update lesson");
			}
		} catch (error) {
			console.error("Error updating lesson:", error);
			Alert.alert("Error", "Failed to update lesson. Please try again.");
		}
	};

	const handleDeleteLesson = async (lesson: LearningLesson) => {
		Alert.alert(
			"Delete Lesson",
			`Are you sure you want to delete "${lesson.title}"?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const response = await LearningService.deleteLesson(lesson.id);
							if (response.success) {
								Alert.alert("Success", "Lesson deleted successfully!");
								loadData();
							} else {
								Alert.alert(
									"Error",
									response.error || "Failed to delete lesson"
								);
							}
						} catch (error) {
							console.error("Error deleting lesson:", error);
							Alert.alert(
								"Error",
								"Failed to delete lesson. Please try again."
							);
						}
					},
				},
			]
		);
	};

	const openEditModal = (lesson: LearningLesson) => {
		setEditingLesson(lesson);
		setFormData({
			book_id: lesson.book_id,
			title: lesson.title,
			description: lesson.description || "",
			content:
				typeof lesson.content === "string"
					? lesson.content
					: JSON.stringify(lesson.content),
			vocabulary_words: lesson.vocabulary_words.join(", "),
			audio_url: lesson.audio_url || "",
			estimated_duration_minutes: lesson.estimated_duration_minutes,
			difficulty_level: lesson.difficulty_level,
			learning_objectives: lesson.learning_objectives.join("\n"),
		});
		setShowModal(true);
	};

	const resetForm = () => {
		setFormData({
			book_id: bookId,
			title: "",
			description: "",
			content: "",
			vocabulary_words: "",
			audio_url: "",
			estimated_duration_minutes: 20,
			difficulty_level: book?.difficulty_level || "beginner",
			learning_objectives: "",
		});
		setEditingLesson(null);
	};

	const renderModal = () => (
		<Modal
			visible={showModal}
			animationType="slide"
			presentationStyle="fullScreen"
		>
			<SafeAreaView style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity onPress={() => setShowModal(false)}>
						<Ionicons name="close" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.modalTitle}>
						{editingLesson ? "Edit Lesson" : "Create Lesson"}
					</Text>
					<TouchableOpacity
						onPress={editingLesson ? handleUpdateLesson : handleCreateLesson}
					>
						<Text style={styles.saveButton}>Save</Text>
					</TouchableOpacity>
				</View>

				<ScrollView
					style={styles.modalContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.formGroup}>
						<Text style={styles.label}>Lesson Title *</Text>
						<TextInput
							style={styles.input}
							value={formData.title}
							onChangeText={(text) => setFormData({ ...formData, title: text })}
							placeholder="Enter lesson title..."
							placeholderTextColor={theme.colors.textSecondary}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={formData.description}
							onChangeText={(text) =>
								setFormData({ ...formData, description: text })
							}
							placeholder="Enter lesson description..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={3}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Lesson Content</Text>
						<TextInput
							style={[styles.input, styles.textArea, { height: 120 }]}
							value={formData.content}
							onChangeText={(text) =>
								setFormData({ ...formData, content: text })
							}
							placeholder="Enter the main lesson content..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={6}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Vocabulary Words</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={formData.vocabulary_words}
							onChangeText={(text) =>
								setFormData({ ...formData, vocabulary_words: text })
							}
							placeholder="Enter vocabulary words separated by commas..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={3}
						/>
						<Text style={styles.helperText}>
							Separate words with commas (e.g., bonjour, au revoir, merci)
						</Text>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Learning Objectives</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={formData.learning_objectives}
							onChangeText={(text) =>
								setFormData({ ...formData, learning_objectives: text })
							}
							placeholder="Enter learning objectives (one per line)..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={4}
						/>
						<Text style={styles.helperText}>One objective per line</Text>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Audio URL (Optional)</Text>
						<TextInput
							style={styles.input}
							value={formData.audio_url}
							onChangeText={(text) =>
								setFormData({ ...formData, audio_url: text })
							}
							placeholder="https://example.com/audio.mp3"
							placeholderTextColor={theme.colors.textSecondary}
							keyboardType="url"
						/>
					</View>

					<View style={styles.formRow}>
						<View style={[styles.formGroup, styles.formGroupHalf]}>
							<Text style={styles.label}>Duration (minutes)</Text>
							<TextInput
								style={styles.input}
								value={formData.estimated_duration_minutes.toString()}
								onChangeText={(text) =>
									setFormData({
										...formData,
										estimated_duration_minutes: parseInt(text) || 20,
									})
								}
								placeholder="20"
								keyboardType="numeric"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						<View style={[styles.formGroup, styles.formGroupHalf]}>
							<Text style={styles.label}>Difficulty Level</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.difficulty_level}
									onValueChange={(value) =>
										setFormData({
											...formData,
											difficulty_level: value,
										})
									}
									style={styles.picker}
								>
									<Picker.Item label="Beginner" value="beginner" />
									<Picker.Item label="Intermediate" value="intermediate" />
									<Picker.Item label="Advanced" value="advanced" />
								</Picker>
							</View>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</Modal>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading lessons...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="chevron-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerInfo}>
					<Text style={styles.headerTitle}>Lessons</Text>
					<Text style={styles.headerSubtitle}>{book?.title}</Text>
				</View>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => {
						resetForm();
						setShowModal(true);
					}}
				>
					<Ionicons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{lessons.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name="document-text-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyStateTitle}>No lessons yet</Text>
						<Text style={styles.emptyStateText}>
							Create your first lesson for this book
						</Text>
					</View>
				) : (
					lessons.map((lesson, index) => (
						<View key={lesson.id} style={styles.lessonCard}>
							<View style={styles.lessonHeader}>
								<View style={styles.lessonInfo}>
									<Text style={styles.lessonNumber}>Lesson {index + 1}</Text>
									<Text style={styles.lessonTitle}>{lesson.title}</Text>
									<Text style={styles.lessonDescription}>
										{lesson.description}
									</Text>
								</View>
								<View style={styles.lessonActions}>
									<TouchableOpacity
										style={styles.actionButton}
										onPress={() => openEditModal(lesson)}
									>
										<Ionicons
											name="pencil"
											size={16}
											color={theme.colors.primary}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.actionButton}
										onPress={() => handleDeleteLesson(lesson)}
									>
										<Ionicons
											name="trash"
											size={16}
											color={theme.colors.error}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.actionButton}
										onPress={() =>
											navigation.navigate("TestManagement", {
												lessonId: lesson.id,
											})
										}
									>
										<Ionicons
											name="help-circle"
											size={16}
											color={theme.colors.success}
										/>
									</TouchableOpacity>
								</View>
							</View>
							<View style={styles.lessonMeta}>
								<Text style={styles.lessonMetaText}>
									⏱️ {lesson.estimated_duration_minutes}min • 📚{" "}
									{lesson.vocabulary_words.length} words • 🎯{" "}
									{lesson.learning_objectives.length} objectives
								</Text>
							</View>
						</View>
					))
				)}
			</ScrollView>

			{renderModal()}

			{/* Floating Action Button */}
			<FloatingActionButton
				icon="add"
				onPress={() => {
					resetForm();
					setShowModal(true);
				}}
			/>
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
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: 8,
	},
	headerInfo: {
		flex: 1,
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	headerSubtitle: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginTop: 2,
	},
	addButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 20,
		padding: 8,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	lessonCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
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
	lessonNumber: {
		fontSize: 12,
		color: theme.colors.primary,
		fontWeight: "600",
		marginBottom: 4,
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 4,
	},
	lessonDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	lessonActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: theme.colors.background,
	},
	lessonMeta: {
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		paddingTop: 12,
	},
	lessonMetaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 16,
	},
	emptyStateText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 8,
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
	modalContainer: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
		textAlign: "center",
	},
	saveButton: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	formGroup: {
		marginBottom: 20,
	},
	formGroupHalf: {
		flex: 1,
	},
	formRow: {
		flexDirection: "row",
		gap: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		color: theme.colors.text,
	},
	textArea: {
		height: 80,
		textAlignVertical: "top",
	},
	helperText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 4,
		fontStyle: "italic",
	},
	pickerContainer: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
	},
	picker: {
		height: 50,
		color: theme.colors.text,
	},
});
