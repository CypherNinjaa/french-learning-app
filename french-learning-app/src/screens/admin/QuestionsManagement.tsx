// Stage 3.2: Questions Management Screen
// Comprehensive questions management interface for admin users

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Modal,
	TextInput,
	ActivityIndicator,
	Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ContentManagementService } from "../../services/contentManagementService";
import { theme } from "../../constants/theme";
import {
	Question,
	Lesson,
	Module,
	Level,
	CreateQuestionDto,
	UpdateQuestionDto,
	QuestionType,
	DifficultyLevel,
} from "../../types";

interface QuestionFormData {
	lesson_id: number;
	question_text: string;
	question_type: QuestionType;
	options: any;
	correct_answer: string;
	explanation: string;
	points: number;
	difficulty_level: DifficultyLevel;
	audio_url: string;
	image_url: string;
	order_index: number;
	is_active: boolean;
}

export const QuestionsManagement = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [modules, setModules] = useState<Module[]>([]);
	const [levels, setLevels] = useState<Level[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
	const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
	const [selectedModule, setSelectedModule] = useState<number | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
	const [selectedType, setSelectedType] = useState<QuestionType | "">("");
	const [formLoading, setFormLoading] = useState(false);

	const [formData, setFormData] = useState<QuestionFormData>({
		lesson_id: 0,
		question_text: "",
		question_type: "multiple_choice",
		options: null,
		correct_answer: "",
		explanation: "",
		points: 10,
		difficulty_level: "beginner",
		audio_url: "",
		image_url: "",
		order_index: 1,
		is_active: true,
	});

	const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([
		"",
		"",
		"",
		"",
	]);

	const loadData = async () => {
		try {
			const [levelsRes, modulesRes, lessonsRes, questionsRes] =
				await Promise.all([
					ContentManagementService.getLevels(),
					ContentManagementService.getModules(),
					ContentManagementService.getLessons(),
					ContentManagementService.getQuestions(selectedLesson || undefined),
				]);

			if (levelsRes.success && levelsRes.data) {
				setLevels(levelsRes.data);
			}

			if (modulesRes.success && modulesRes.data) {
				setModules(modulesRes.data);
			}

			if (lessonsRes.success && lessonsRes.data) {
				setLessons(lessonsRes.data);
			}

			if (questionsRes.success && questionsRes.data) {
				setQuestions(questionsRes.data);
			}
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Failed to load questions data");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const getFilteredModules = () => {
		return selectedLevel
			? modules.filter((module) => module.level_id === selectedLevel)
			: modules;
	};

	const getFilteredLessons = () => {
		return selectedModule
			? lessons.filter((lesson) => lesson.module_id === selectedModule)
			: lessons;
	};

	const getFilteredQuestions = () => {
		let filtered = questions;

		if (selectedLesson) {
			filtered = filtered.filter((q) => q.lesson_id === selectedLesson);
		}

		if (selectedType) {
			filtered = filtered.filter((q) => q.question_type === selectedType);
		}

		return filtered;
	};

	const openCreateModal = () => {
		const filteredLessons = getFilteredLessons();
		const maxOrder =
			questions.length > 0
				? Math.max(...questions.map((q) => q.order_index || 0))
				: 0;

		setFormData({
			lesson_id: filteredLessons.length > 0 ? filteredLessons[0].id : 0,
			question_text: "",
			question_type: "multiple_choice",
			options: null,
			correct_answer: "",
			explanation: "",
			points: 10,
			difficulty_level: "beginner",
			audio_url: "",
			image_url: "",
			order_index: maxOrder + 1,
			is_active: true,
		});
		setMultipleChoiceOptions(["", "", "", ""]);
		setEditingQuestion(null);
		setModalVisible(true);
	};

	const openEditModal = (question: Question) => {
		setFormData({
			lesson_id: question.lesson_id,
			question_text: question.question_text,
			question_type: question.question_type,
			options: question.options,
			correct_answer: question.correct_answer,
			explanation: question.explanation || "",
			points: question.points,
			difficulty_level: question.difficulty_level,
			audio_url: question.audio_url || "",
			image_url: question.image_url || "",
			order_index: question.order_index || 1,
			is_active: question.is_active,
		});

		// Handle multiple choice options
		if (question.question_type === "multiple_choice" && question.options) {
			const options = Array.isArray(question.options) ? question.options : [];
			setMultipleChoiceOptions([...options, "", "", "", ""].slice(0, 4));
		} else {
			setMultipleChoiceOptions(["", "", "", ""]);
		}

		setEditingQuestion(question);
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		if (!formData.question_text.trim()) {
			Alert.alert("Error", "Please enter a question");
			return;
		}

		if (!formData.lesson_id) {
			Alert.alert("Error", "Please select a lesson");
			return;
		}

		if (!formData.correct_answer.trim()) {
			Alert.alert("Error", "Please enter the correct answer");
			return;
		}

		setFormLoading(true);

		try {
			// Prepare options based on question type
			let options = null;
			if (formData.question_type === "multiple_choice") {
				const validOptions = multipleChoiceOptions.filter((opt) => opt.trim());
				if (validOptions.length < 2) {
					Alert.alert(
						"Error",
						"Please provide at least 2 options for multiple choice questions"
					);
					setFormLoading(false);
					return;
				}
				options = validOptions;
			}

			if (editingQuestion) {
				// Update existing question - Note: We need to implement this in the service
				Alert.alert("Info", "Update functionality will be implemented");
			} else {
				// Create new question
				const createData: CreateQuestionDto = {
					lesson_id: formData.lesson_id,
					question_text: formData.question_text,
					question_type: formData.question_type,
					options: options,
					correct_answer: formData.correct_answer,
					explanation: formData.explanation || undefined,
					points: formData.points,
					difficulty_level: formData.difficulty_level,
					audio_url: formData.audio_url || undefined,
					image_url: formData.image_url || undefined,
					order_index: formData.order_index,
				};

				const result = await ContentManagementService.createQuestion(
					createData
				);
				if (result.success) {
					Alert.alert("Success", "Question created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create question");
				}
			}

			setModalVisible(false);
			await loadData();
		} catch (error) {
			console.error("Error saving question:", error);
			Alert.alert("Error", "Failed to save question");
		} finally {
			setFormLoading(false);
		}
	};
	const handleDelete = (question: Question) => {
		Alert.alert(
			"Delete Question",
			`Are you sure you want to delete this question? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							const result = await ContentManagementService.deleteQuestion(
								question.id
							);
							if (result.success) {
								Alert.alert("Success", "Question deleted successfully");
								// Refresh the questions list
								loadData();
							} else {
								Alert.alert(
									"Error",
									result.error || "Failed to delete question"
								);
							}
						} catch (error) {
							console.error("Delete question error:", error);
							Alert.alert("Error", "Failed to delete question");
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};

	const updateMultipleChoiceOption = (index: number, value: string) => {
		const newOptions = [...multipleChoiceOptions];
		newOptions[index] = value;
		setMultipleChoiceOptions(newOptions);
	};

	const getQuestionTypeIcon = (type: QuestionType) => {
		const icons = {
			multiple_choice: "🔘",
			fill_blank: "✏️",
			pronunciation: "🗣️",
			matching: "🔗",
			translation: "🔄",
			listening: "👂",
		};
		return icons[type] || "❓";
	};

	const getQuestionTypeColor = (type: QuestionType) => {
		const colors = {
			multiple_choice: "#4ECDC4",
			fill_blank: "#45B7D1",
			pronunciation: "#FFEAA7",
			matching: "#96CEB4",
			translation: "#DDA0DD",
			listening: "#FF6B6B",
		};
		return colors[type] || theme.colors.primary;
	};

	useEffect(() => {
		loadData();
	}, [selectedLesson, selectedModule, selectedLevel]);

	const QuestionCard = ({ question }: { question: Question }) => {
		const lesson = lessons.find((l) => l.id === question.lesson_id);
		const module = modules.find((m) => m.id === lesson?.module_id);
		const level = levels.find((l) => l.id === module?.level_id);

		return (
			<View style={styles.questionCard}>
				<View style={styles.questionHeader}>
					<View style={styles.questionInfo}>
						<View style={styles.questionTitleRow}>
							<Text style={styles.questionTypeIcon}>
								{getQuestionTypeIcon(question.question_type)}
							</Text>
							<Text style={styles.questionText} numberOfLines={2}>
								{question.question_text}
							</Text>
						</View>
						<View style={styles.questionMeta}>
							<Text style={styles.metaText}>
								{level?.name} › {module?.title} › {lesson?.title}
							</Text>
						</View>
					</View>
					<View style={styles.questionActions}>
						<TouchableOpacity
							style={[styles.actionButton, styles.editButton]}
							onPress={() => openEditModal(question)}
						>
							<Text style={styles.editButtonText}>Edit</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.deleteButton]}
							onPress={() => handleDelete(question)}
						>
							<Text style={styles.deleteButtonText}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.questionDetails}>
					<View style={styles.questionDetailItem}>
						<Text style={styles.detailLabel}>Type:</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getQuestionTypeColor(question.question_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.detailValue,
									{ color: getQuestionTypeColor(question.question_type) },
								]}
							>
								{question.question_type.replace("_", " ")}
							</Text>
						</View>
					</View>
					<View style={styles.questionDetailItem}>
						<Text style={styles.detailLabel}>Points:</Text>
						<Text style={styles.detailValue}>{question.points}</Text>
					</View>
					<View style={styles.questionDetailItem}>
						<Text style={styles.detailLabel}>Difficulty:</Text>
						<Text
							style={[
								styles.detailValue,
								styles.difficultyBadge,
								{
									backgroundColor:
										question.difficulty_level === "beginner"
											? "#E8F5E8"
											: question.difficulty_level === "intermediate"
											? "#FFF4E6"
											: "#FFE6E6",
									color:
										question.difficulty_level === "beginner"
											? "#2E7D32"
											: question.difficulty_level === "intermediate"
											? "#F57C00"
											: "#D32F2F",
								},
							]}
						>
							{question.difficulty_level}
						</Text>
					</View>
				</View>

				<View style={styles.answerContainer}>
					<Text style={styles.answerLabel}>Correct Answer:</Text>
					<Text style={styles.answerText}>{question.correct_answer}</Text>
				</View>

				{question.explanation && (
					<View style={styles.explanationContainer}>
						<Text style={styles.explanationLabel}>Explanation:</Text>
						<Text style={styles.explanationText}>{question.explanation}</Text>
					</View>
				)}
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading questions...</Text>
				</View>
			</View>
		);
	}

	const filteredQuestions = getFilteredQuestions();
	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Questions</Text>
				<TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
					<Text style={styles.createButtonText}>+ Create Question</Text>
				</TouchableOpacity>
			</View>
			{/* Filters */}
			<View style={styles.filtersContainer}>
				<View style={styles.filterRow}>
					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Level:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedLevel?.toString() || ""}
								onValueChange={(value: string) =>
									setSelectedLevel(value ? Number(value) : null)
								}
								style={styles.picker}
							>
								<Picker.Item label="All Levels" value="" />
								{levels.map((level) => (
									<Picker.Item
										key={level.id}
										label={level.name}
										value={level.id.toString()}
									/>
								))}
							</Picker>
						</View>
					</View>

					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Module:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedModule?.toString() || ""}
								onValueChange={(value: string) =>
									setSelectedModule(value ? Number(value) : null)
								}
								style={styles.picker}
							>
								<Picker.Item label="All Modules" value="" />
								{getFilteredModules().map((module) => (
									<Picker.Item
										key={module.id}
										label={module.title}
										value={module.id.toString()}
									/>
								))}
							</Picker>
						</View>
					</View>
				</View>

				<View style={styles.filterRow}>
					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Lesson:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedLesson?.toString() || ""}
								onValueChange={(value: string) =>
									setSelectedLesson(value ? Number(value) : null)
								}
								style={styles.picker}
							>
								<Picker.Item label="All Lessons" value="" />
								{getFilteredLessons().map((lesson) => (
									<Picker.Item
										key={lesson.id}
										label={lesson.title}
										value={lesson.id.toString()}
									/>
								))}
							</Picker>
						</View>
					</View>

					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Type:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedType}
								onValueChange={(value: QuestionType | "") =>
									setSelectedType(value)
								}
								style={styles.picker}
							>
								<Picker.Item label="All Types" value="" />
								<Picker.Item label="Multiple Choice" value="multiple_choice" />
								<Picker.Item label="Fill in Blank" value="fill_blank" />
								<Picker.Item label="Pronunciation" value="pronunciation" />
								<Picker.Item label="Matching" value="matching" />
								<Picker.Item label="Translation" value="translation" />
								<Picker.Item label="Listening" value="listening" />
							</Picker>
						</View>
					</View>
				</View>
			</View>
			{/* Questions List */}
			<ScrollView
				style={styles.questionsList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.statsContainer}>
					<Text style={styles.statsText}>
						{filteredQuestions.length} questions found
					</Text>
				</View>
				{filteredQuestions.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No questions found</Text>
						<Text style={styles.emptySubtext}>
							Create your first question to get started
						</Text>
					</View>
				) : (
					filteredQuestions.map((question) => (
						<QuestionCard key={question.id} question={question} />
					))
				)}
			</ScrollView>
			{/* Create/Edit Modal */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setModalVisible(false)}>
							<Text style={styles.modalCancelButton}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{editingQuestion ? "Edit Question" : "New Question"}
						</Text>
						<TouchableOpacity onPress={handleSubmit} disabled={formLoading}>
							<Text
								style={[
									styles.modalSaveButton,
									formLoading && styles.disabledButton,
								]}
							>
								{formLoading ? "Saving..." : "Save"}
							</Text>
						</TouchableOpacity>
					</View>
					<ScrollView style={styles.modalContent}>
						{/* Basic Information */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Basic Information</Text>

							<Text style={styles.fieldLabel}>Question Text *</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.question_text}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, question_text: text }))
								}
								placeholder="Enter the question"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={3}
							/>

							<Text style={styles.fieldLabel}>Lesson *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.lesson_id.toString()}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											lesson_id: Number(value),
										}))
									}
									style={styles.picker}
								>
									{lessons.map((lesson) => (
										<Picker.Item
											key={lesson.id}
											label={lesson.title}
											value={lesson.id.toString()}
										/>
									))}
								</Picker>
							</View>

							<Text style={styles.fieldLabel}>Question Type *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.question_type}
									onValueChange={(value: QuestionType) =>
										setFormData((prev) => ({ ...prev, question_type: value }))
									}
									style={styles.picker}
								>
									<Picker.Item
										label="Multiple Choice"
										value="multiple_choice"
									/>
									<Picker.Item label="Fill in Blank" value="fill_blank" />
									<Picker.Item label="Pronunciation" value="pronunciation" />
									<Picker.Item label="Matching" value="matching" />
									<Picker.Item label="Translation" value="translation" />
									<Picker.Item label="Listening" value="listening" />
								</Picker>
							</View>
						</View>

						{/* Multiple Choice Options */}
						{formData.question_type === "multiple_choice" && (
							<View style={styles.formSection}>
								<Text style={styles.sectionTitle}>Answer Options</Text>
								{multipleChoiceOptions.map((option, index) => (
									<View key={index}>
										<Text style={styles.fieldLabel}>Option {index + 1}</Text>
										<TextInput
											style={styles.textInput}
											value={option}
											onChangeText={(text) =>
												updateMultipleChoiceOption(index, text)
											}
											placeholder={`Option ${index + 1}`}
											placeholderTextColor={theme.colors.textSecondary}
										/>
									</View>
								))}
							</View>
						)}

						{/* Answer and Explanation */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Answer & Explanation</Text>

							<Text style={styles.fieldLabel}>Correct Answer *</Text>
							<TextInput
								style={styles.textInput}
								value={formData.correct_answer}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, correct_answer: text }))
								}
								placeholder="Enter the correct answer"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Explanation</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.explanation}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, explanation: text }))
								}
								placeholder="Why is this the correct answer?"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={3}
							/>
						</View>

						{/* Settings */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Settings</Text>

							<Text style={styles.fieldLabel}>Points</Text>
							<TextInput
								style={styles.textInput}
								value={formData.points.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										points: parseInt(text) || 10,
									}))
								}
								placeholder="Points for correct answer"
								keyboardType="numeric"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Difficulty Level</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.difficulty_level}
									onValueChange={(value: DifficultyLevel) =>
										setFormData((prev) => ({
											...prev,
											difficulty_level: value,
										}))
									}
									style={styles.picker}
								>
									<Picker.Item label="Beginner" value="beginner" />
									<Picker.Item label="Intermediate" value="intermediate" />
									<Picker.Item label="Advanced" value="advanced" />
								</Picker>
							</View>

							<Text style={styles.fieldLabel}>Order Index</Text>
							<TextInput
								style={styles.textInput}
								value={formData.order_index.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										order_index: parseInt(text) || 1,
									}))
								}
								placeholder="Order index"
								keyboardType="numeric"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						{/* Media */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Media (Optional)</Text>

							<Text style={styles.fieldLabel}>Audio URL</Text>
							<TextInput
								style={styles.textInput}
								value={formData.audio_url}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, audio_url: text }))
								}
								placeholder="URL to audio file (for listening questions)"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Image URL</Text>
							<TextInput
								style={styles.textInput}
								value={formData.image_url}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, image_url: text }))
								}
								placeholder="URL to image file"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<View style={styles.switchRow}>
								<Text style={styles.fieldLabel}>Active</Text>
								<Switch
									value={formData.is_active}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, is_active: value }))
									}
									trackColor={{
										false: theme.colors.border,
										true: theme.colors.primary,
									}}
									thumbColor={formData.is_active ? "white" : "#f4f3f4"}
								/>
							</View>
						</View>
					</ScrollView>
				</View>
			</Modal>
		</View>
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
		marginTop: theme.spacing.md,
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		paddingRight: theme.spacing.md,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.md,
	},
	createButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.xl,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		minWidth: 140,
	},
	createButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	filtersContainer: {
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		zIndex: 999,
		elevation: 1,
	},
	filterRow: {
		flexDirection: "row",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.md,
		alignItems: "flex-start",
	},
	filterItem: {
		flex: 1,
		minHeight: 80,
	},
	filterLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	pickerContainer: {
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
		minHeight: 50,
		overflow: "visible",
		zIndex: 1000,
	},
	picker: {
		height: 50,
		paddingHorizontal: 12,
	},
	questionsList: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	statsContainer: {
		marginBottom: theme.spacing.md,
	},
	statsText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl * 2,
	},
	emptyText: {
		fontSize: 18,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: theme.spacing.sm,
	},
	emptySubtext: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
	},
	questionCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.lg,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	questionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	questionInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	questionTitleRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: theme.spacing.sm,
	},
	questionTypeIcon: {
		fontSize: 16,
		marginRight: theme.spacing.sm,
		marginTop: 2,
	},
	questionText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		flex: 1,
		lineHeight: 22,
	},
	questionMeta: {
		marginBottom: theme.spacing.sm,
	},
	metaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	questionActions: {
		flexDirection: "row",
		gap: theme.spacing.sm,
	},
	actionButton: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
	},
	editButton: {
		backgroundColor: theme.colors.primary,
	},
	editButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 12,
	},
	deleteButton: {
		backgroundColor: "#FF6B6B",
	},
	deleteButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 12,
	},
	questionDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.md,
	},
	questionDetailItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	detailLabel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginRight: theme.spacing.xs,
	},
	detailValue: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.text,
	},
	typeBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 10,
		textTransform: "capitalize",
	},
	difficultyBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 10,
		fontSize: 10,
		textTransform: "capitalize",
	},
	answerContainer: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.sm,
		borderRadius: 8,
		marginBottom: theme.spacing.sm,
	},
	answerLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 2,
	},
	answerText: {
		fontSize: 14,
		color: theme.colors.primary,
		fontWeight: "500",
	},
	explanationContainer: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.sm,
		borderRadius: 8,
	},
	explanationLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 2,
	},
	explanationText: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		lineHeight: 18,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	modalCancelButton: {
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	modalSaveButton: {
		fontSize: 16,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	disabledButton: {
		opacity: 0.5,
	},
	modalContent: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	formSection: {
		marginBottom: theme.spacing.xl,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	fieldLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	textInput: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	textArea: {
		height: 80,
		textAlignVertical: "top",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
});
