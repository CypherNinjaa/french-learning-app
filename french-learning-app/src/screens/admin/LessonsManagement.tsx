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
	Modal,
	TextInput,
	Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { ContentManagementService } from "../../services/contentManagementService";
import { BookLessonEditor } from "./BookLessonEditor";
import { ContentPreview } from "../../components/admin/ContentPreview";
import { theme } from "../../constants/theme";
import {
	Module,
	Level,
	CreateLessonDto,
	UpdateLessonDto,
	LessonType as BaseLessonType,
	DifficultyLevel as BaseDifficultyLevel,
} from "../../types";
import {
	Lesson,
	LessonType,
	DifficultyLevel,
	LessonContent,
} from "../../types/LessonTypes";

// Helper types for form editing
interface BookStyleSection {
	introduction_title: string;
	introduction_content: string;
	explanation_title: string;
	explanation_content: string;
	example: string;
	questions?: SectionQuestion[];
}

interface SectionQuestion {
	id?: number;
	question_text: string;
	question_type:
		| "multiple_choice"
		| "fill_blank"
		| "translation"
		| "listening"
		| "pronunciation"
		| "matching";
	options?: string[];
	correct_answer: string;
	explanation?: string;
	points: number;
}

interface BookStyleLessonContent {
	sections: BookStyleSection[];
}

// Convert between form content and proper LessonContent
const convertToLessonContent = (
	simple: BookStyleLessonContent
): LessonContent => {
	return {
		sections: simple.sections.map((section, index) => ({
			id: `section-${index}`,
			type: "text" as any,
			title: section.introduction_title,
			content: {
				introduction_title: section.introduction_title,
				introduction_content: section.introduction_content,
				explanation_title: section.explanation_title,
				explanation_content: section.explanation_content,
				example: section.example,
			},
			order_index: index,
			is_required: true,
		})),
	};
};

const convertFromLessonContent = (
	content: LessonContent
): BookStyleLessonContent => {
	if (content.sections && content.sections.length > 0) {
		return {
			sections: content.sections.map((section) => ({
				introduction_title:
					(section.content as any)?.introduction_title || section.title || "",
				introduction_content:
					(section.content as any)?.introduction_content || "",
				explanation_title: (section.content as any)?.explanation_title || "",
				explanation_content:
					(section.content as any)?.explanation_content || "",
				example: (section.content as any)?.example || "",
			})),
		};
	}

	// Handle legacy format
	return {
		sections: [
			{
				introduction_title: content.introduction_title || "",
				introduction_content: content.introduction || "",
				explanation_title: content.explanation_title || "",
				explanation_content: content.explanation || "",
				example: content.example || "",
			},
		],
	};
};

interface LessonFormData {
	title: string;
	module_id: number;
	lesson_type: LessonType;
	order_index: number;
	difficulty_level: DifficultyLevel;
	content: BookStyleLessonContent; // Use new book-style content for form
	is_active: boolean;
}

export const LessonsManagement = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [modules, setModules] = useState<Module[]>([]);
	const [levels, setLevels] = useState<Level[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
	const [selectedModule, setSelectedModule] = useState<number | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [currentSectionTab, setCurrentSectionTab] = useState<{
		[key: number]: "content" | "questions";
	}>({});
	const [formData, setFormData] = useState<LessonFormData>({
		title: "",
		module_id: 0,
		lesson_type: "vocabulary",
		order_index: 1,
		difficulty_level: "beginner",
		content: {
			sections: [
				{
					introduction_title: "",
					introduction_content: "",
					explanation_title: "",
					explanation_content: "",
					example: "",
				},
			],
		},
		is_active: true,
	});

	const loadData = async () => {
		try {
			const [levelsRes, modulesRes, lessonsRes] = await Promise.all([
				ContentManagementService.getLevels(),
				ContentManagementService.getModules(),
				ContentManagementService.getLessons(selectedModule || undefined),
			]);

			if (levelsRes.success && levelsRes.data) {
				setLevels(levelsRes.data);
			}

			if (modulesRes.success && modulesRes.data) {
				setModules(modulesRes.data);
				if (!selectedLevel && modulesRes.data.length > 0) {
					setSelectedLevel(modulesRes.data[0].level_id);
				}
			}
			if (lessonsRes.success && lessonsRes.data) {
				setLessons(lessonsRes.data as unknown as Lesson[]);
			}
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Failed to load lessons data");
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
	const openCreateModal = () => {
		const filteredModules = getFilteredModules();
		const maxOrder =
			lessons.length > 0 ? Math.max(...lessons.map((l) => l.order_index)) : 0;
		setFormData({
			title: "",
			module_id: filteredModules.length > 0 ? filteredModules[0].id : 0,
			lesson_type: "vocabulary",
			order_index: maxOrder + 1,
			difficulty_level: "beginner",
			content: {
				sections: [
					{
						introduction_title: "",
						introduction_content: "",
						explanation_title: "",
						explanation_content: "",
						example: "",
					},
				],
			},
			is_active: true,
		});
		setEditingLesson(null);
		setModalVisible(true);
	};
	const openEditModal = (lesson: Lesson) => {
		// Convert lesson content to simple form format
		const simpleContent = convertFromLessonContent(lesson.content || {});
		setFormData({
			title: lesson.title,
			module_id: lesson.module_id,
			lesson_type: lesson.lesson_type,
			order_index: lesson.order_index,
			difficulty_level: lesson.difficulty_level,
			content: simpleContent,
			is_active: lesson.is_active,
		});
		setEditingLesson(lesson);
		setModalVisible(true);
	};
	const validateLessonContent = (content: any): string | null => {
		if (!content) return "Content is required";
		if (!content.sections || content.sections.length === 0)
			return "At least one section is required";

		for (let i = 0; i < content.sections.length; i++) {
			const section = content.sections[i];
			if (
				!section.introduction_title ||
				section.introduction_title.trim() === ""
			)
				return `Section ${i + 1}: Introduction title is required`;
			if (
				!section.introduction_content ||
				section.introduction_content.trim() === ""
			)
				return `Section ${i + 1}: Introduction content is required`;
			if (!section.explanation_title || section.explanation_title.trim() === "")
				return `Section ${i + 1}: Explanation title is required`;
			if (
				!section.explanation_content ||
				section.explanation_content.trim() === ""
			)
				return `Section ${i + 1}: Explanation content is required`;
			if (!section.example || section.example.trim() === "")
				return `Section ${i + 1}: Example is required`;
		}
		return null;
	};

	const handleSubmit = async () => {
		if (!formData.title.trim()) {
			Alert.alert("Error", "Please enter a lesson title");
			return;
		}

		if (!formData.module_id) {
			Alert.alert("Error", "Please select a module");
			return;
		}

		// Validate lesson content
		const contentError = validateLessonContent(formData.content);
		if (contentError) {
			Alert.alert("Content Error", contentError);
			return;
		}

		setFormLoading(true);
		try {
			const convertedContent = convertToLessonContent(formData.content);
			if (editingLesson) {
				// Update existing lesson
				const updateData: UpdateLessonDto = {
					title: formData.title,
					lesson_type: formData.lesson_type as any, // Cast to handle type mismatch
					order_index: formData.order_index,
					estimated_time_minutes: 15, // Default value
					difficulty_level: formData.difficulty_level,
					content: convertedContent,
					is_active: formData.is_active,
				};

				const result = await ContentManagementService.updateLesson(
					editingLesson.id,
					updateData
				);
				if (result.success) {
					Alert.alert("Success", "Lesson updated successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to update lesson");
				}
			} else {
				// Create new lesson
				const createData: CreateLessonDto = {
					title: formData.title,
					module_id: formData.module_id,
					lesson_type: formData.lesson_type as any, // Cast to handle type mismatch
					order_index: formData.order_index,
					estimated_time_minutes: 15, // Default value
					difficulty_level: formData.difficulty_level,
					content: convertedContent,
				};

				const result = await ContentManagementService.createLesson(createData);
				if (result.success) {
					Alert.alert("Success", "Lesson created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create lesson");
				}
			}

			setModalVisible(false);
			await loadData();
		} catch (error) {
			console.error("Error saving lesson:", error);
			Alert.alert("Error", "Failed to save lesson");
		} finally {
			setFormLoading(false);
		}
	};
	const handleDelete = (lesson: Lesson) => {
		Alert.alert(
			"Delete Lesson",
			`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							const result = await ContentManagementService.deleteLesson(
								lesson.id
							);
							if (result.success) {
								Alert.alert("Success", "Lesson deleted successfully");
								// Refresh the lessons list
								loadData();
							} else {
								Alert.alert("Error", result.error || "Failed to delete lesson");
							}
						} catch (error) {
							console.error("Delete lesson error:", error);
							Alert.alert("Error", "Failed to delete lesson");
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};
	const getLessonTypeIcon = (type: LessonType) => {
		const icons = {
			vocabulary: "📝",
			grammar: "📚",
			conversation: "💬",
			pronunciation: "🗣️",
			reading: "📖",
			listening: "👂",
			cultural: "🎭",
			mixed: "🎯",
		};
		return icons[type] || "📄";
	};
	const getLessonTypeColor = (type: LessonType) => {
		const colors = {
			vocabulary: "#4ECDC4",
			grammar: "#45B7D1",
			conversation: "#96CEB4",
			pronunciation: "#FFEAA7",
			reading: "#DDA0DD",
			listening: "#FF6B6B",
			cultural: "#FF9999",
			mixed: "#B19CD9",
		};
		return colors[type] || theme.colors.primary;
	};

	const getContentTemplate = (lessonType: LessonType) => {
		const templates = {
			vocabulary: {
				introduction: "Learn new French vocabulary words and their meanings.",
				sections: [
					{
						french: "Bonjour",
						english: "Hello",
						pronunciation: "bon-ZHOOR",
						example: "Bonjour, comment allez-vous?",
					},
					{
						french: "Merci",
						english: "Thank you",
						pronunciation: "mer-SEE",
						example: "Merci beaucoup pour votre aide.",
					},
				],
			},
			grammar: {
				introduction: "Master French grammar rules and sentence structure.",
				sections: [
					{
						french: "Les articles définis: le, la, les",
						english: "Definite articles: the",
						pronunciation: "luh, lah, lay",
						example:
							"Le livre (the book), la table (the table), les enfants (the children)",
					},
				],
			},
			conversation: {
				introduction: "Practice common French conversation scenarios.",
				sections: [
					{
						french: "Comment vous appelez-vous?",
						english: "What is your name?",
						pronunciation: "koh-mahn voo zah-play voo",
						example: "- Comment vous appelez-vous? - Je m'appelle Marie.",
					},
				],
			},
			pronunciation: {
				introduction: "Learn proper French pronunciation and phonetics.",
				sections: [
					{
						french: "Les voyelles: a, e, i, o, u",
						english: "Vowels: a, e, i, o, u",
						pronunciation: "ah, eh, ee, oh, oo",
						example: "Practice: papa, bébé, midi, rôti, lune",
					},
				],
			},
			reading: {
				introduction: "Improve reading comprehension with French texts.",
				sections: [
					{
						french: "Marie va au marché chaque matin.",
						english: "Marie goes to the market every morning.",
						pronunciation: "mah-REE vah oh mar-SHAY shahk mah-TAHN",
						example: "Practice reading this sentence aloud.",
					},
				],
			},
			listening: {
				introduction: "Develop listening skills with French audio content.",
				sections: [
					{
						french: "Écoutez et répétez",
						english: "Listen and repeat",
						pronunciation: "ay-koo-TAY ay ray-pay-TAY",
						example: "Follow the audio prompts and practice pronunciation.",
					},
				],
			},
			cultural: {
				introduction: "Explore French culture, traditions, and customs.",
				sections: [
					{
						french: "La culture française",
						english: "French culture",
						pronunciation: "lah kul-TOOR frahn-SEHZ",
						example: "Learn about French traditions and way of life.",
					},
				],
			},
			mixed: {
				introduction:
					"A comprehensive lesson combining multiple learning aspects.",
				sections: [
					{
						french: "Leçon intégrée",
						english: "Integrated lesson",
						pronunciation: "luh-SOHN an-tay-GRAY",
						example: "Practice vocabulary, grammar, and conversation together.",
					},
				],
			},
		};
		return templates[lessonType] || templates.vocabulary;
	};

	useEffect(() => {
		loadData();
	}, [selectedModule, selectedLevel]);
	const LessonCard = ({ lesson }: { lesson: Lesson }) => {
		const module = modules.find((m) => m.id === lesson.module_id);
		const level = levels.find((l) => l.id === module?.level_id);
		return (
			<View style={styles.lessonCard}>
				<View style={styles.lessonHeader}>
					<View style={styles.lessonInfo}>
						<View style={styles.lessonTitleRow}>
							<Text style={styles.lessonTypeIcon}>
								{getLessonTypeIcon(lesson.lesson_type)}
							</Text>
							<Text style={styles.lessonTitle}>{lesson.title}</Text>
						</View>
						<Text style={styles.lessonDescription}>
							{lesson.content?.introduction || "No description available"}
						</Text>
						<View style={styles.lessonMeta}>
							<Text style={styles.metaText}>
								{level?.name} • {module?.title}
							</Text>
						</View>
					</View>
					<View style={styles.lessonActions}>
						<TouchableOpacity
							style={[styles.actionButton, styles.previewButton]}
							onPress={() => {
								setPreviewLesson(lesson);
								setPreviewVisible(true);
							}}
						>
							<Text style={styles.previewButtonText}>Preview</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.editButton]}
							onPress={() => openEditModal(lesson)}
						>
							<Text style={styles.editButtonText}>Edit</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.deleteButton]}
							onPress={() => handleDelete(lesson)}
						>
							<Text style={styles.deleteButtonText}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={styles.lessonDetails}>
					<View style={styles.lessonDetailItem}>
						<Text style={styles.detailLabel}>Type:</Text>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor:
										getLessonTypeColor(lesson.lesson_type) + "20",
								},
							]}
						>
							<Text
								style={[
									styles.detailValue,
									{ color: getLessonTypeColor(lesson.lesson_type) },
								]}
							>
								{lesson.lesson_type}
							</Text>
						</View>
					</View>
					<View style={styles.lessonDetailItem}>
						<Text style={styles.detailLabel}>Order:</Text>
						<Text style={styles.detailValue}>{lesson.order_index}</Text>
					</View>
					<View style={styles.lessonDetailItem}>
						<Text style={styles.detailLabel}>Duration:</Text>
						<Text style={styles.detailValue}>
							{lesson.estimated_duration}min
						</Text>
					</View>
					<View style={styles.lessonDetailItem}>
						<Text style={styles.detailLabel}>Difficulty:</Text>
						<Text
							style={[
								styles.detailValue,
								styles.difficultyBadge,
								{
									backgroundColor:
										lesson.difficulty_level === "beginner"
											? "#E8F5E8"
											: lesson.difficulty_level === "intermediate"
											? "#FFF4E6"
											: "#FFE6E6",
									color:
										lesson.difficulty_level === "beginner"
											? "#2E7D32"
											: lesson.difficulty_level === "intermediate"
											? "#F57C00"
											: "#D32F2F",
								},
							]}
						>
							{lesson.difficulty_level}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading lessons...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Lessons Management</Text>
				<TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
					<Text style={styles.createButtonText}>+ Create Lesson</Text>
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
			</View>

			{/* Lessons List */}
			<ScrollView
				style={styles.lessonsList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{lessons.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{selectedModule
								? "No lessons found for this module"
								: "No lessons created yet"}
						</Text>
						<Text style={styles.emptySubtext}>
							Create your first lesson to get started
						</Text>
					</View>
				) : (
					lessons.map((lesson) => (
						<LessonCard key={lesson.id} lesson={lesson} />
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
							{editingLesson ? "Edit Lesson" : "Create New Lesson"}
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
					</View>{" "}
					<ScrollView style={styles.modalContent}>
						{/* Basic Information */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Basic Information</Text>
							<Text style={styles.fieldLabel}>Title *</Text>
							<TextInput
								style={styles.textInput}
								value={formData.title}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, title: text }))
								}
								placeholder="Lesson title"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>
						{/* Organization */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Organization</Text>

							<Text style={styles.fieldLabel}>Module *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.module_id.toString()}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											module_id: Number(value),
										}))
									}
									style={styles.picker}
								>
									{modules.map((module) => (
										<Picker.Item
											key={module.id}
											label={module.title}
											value={module.id.toString()}
										/>
									))}
								</Picker>
							</View>

							<Text style={styles.fieldLabel}>Lesson Type *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.lesson_type}
									onValueChange={(value: LessonType) =>
										setFormData((prev) => ({ ...prev, lesson_type: value }))
									}
									style={styles.picker}
								>
									<Picker.Item label="Vocabulary" value="vocabulary" />
									<Picker.Item label="Grammar" value="grammar" />
									<Picker.Item label="Conversation" value="conversation" />
									<Picker.Item label="Pronunciation" value="pronunciation" />
									<Picker.Item label="Reading" value="reading" />
									<Picker.Item label="Listening" value="listening" />
									<Picker.Item label="Cultural" value="cultural" />
									<Picker.Item label="Mixed" value="mixed" />
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
						</View>{" "}
						{/* Lesson Settings */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Settings</Text>

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
						</View>{" "}
						{/* Content */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Lesson Content</Text>
							<Text style={styles.helpText}>
								Create multiple sections for a book-style lesson with
								introduction, explanation, and examples. Each section can have
								speech functionality.
							</Text>
							<View style={styles.contentEditor}>
								{formData.content.sections.map((section, index) => (
									<View key={index} style={styles.sectionEditor}>
										<View style={styles.sectionHeader}>
											<Text style={styles.sectionNumber}>
												Section {index + 1}
											</Text>
											{formData.content.sections.length > 1 && (
												<TouchableOpacity
													style={styles.deleteSectionButton}
													onPress={() => {
														const newSections = [...formData.content.sections];
														newSections.splice(index, 1);
														setFormData((prev) => ({
															...prev,
															content: { sections: newSections },
														}));
													}}
												>
													<Text style={styles.deleteSectionText}>Delete</Text>
												</TouchableOpacity>
											)}
										</View>

										<Text style={styles.subFieldLabel}>Introduction Title</Text>
										<TextInput
											style={styles.textInput}
											value={section.introduction_title}
											onChangeText={(text) => {
												const newSections = [...formData.content.sections];
												newSections[index] = {
													...newSections[index],
													introduction_title: text,
												};
												setFormData((prev) => ({
													...prev,
													content: { sections: newSections },
												}));
											}}
											placeholder="Introduction title"
											placeholderTextColor={theme.colors.textSecondary}
										/>

										<Text style={styles.subFieldLabel}>
											Introduction Content
										</Text>
										<TextInput
											style={[styles.textInput, styles.textArea]}
											value={section.introduction_content}
											onChangeText={(text) => {
												const newSections = [...formData.content.sections];
												newSections[index] = {
													...newSections[index],
													introduction_content: text,
												};
												setFormData((prev) => ({
													...prev,
													content: { sections: newSections },
												}));
											}}
											placeholder="Introduction content"
											placeholderTextColor={theme.colors.textSecondary}
											multiline
											numberOfLines={3}
										/>

										<Text style={styles.subFieldLabel}>Explanation Title</Text>
										<TextInput
											style={styles.textInput}
											value={section.explanation_title}
											onChangeText={(text) => {
												const newSections = [...formData.content.sections];
												newSections[index] = {
													...newSections[index],
													explanation_title: text,
												};
												setFormData((prev) => ({
													...prev,
													content: { sections: newSections },
												}));
											}}
											placeholder="Explanation title"
											placeholderTextColor={theme.colors.textSecondary}
										/>

										<Text style={styles.subFieldLabel}>
											Explanation Content
										</Text>
										<TextInput
											style={[styles.textInput, styles.textArea]}
											value={section.explanation_content}
											onChangeText={(text) => {
												const newSections = [...formData.content.sections];
												newSections[index] = {
													...newSections[index],
													explanation_content: text,
												};
												setFormData((prev) => ({
													...prev,
													content: { sections: newSections },
												}));
											}}
											placeholder="Explanation content"
											placeholderTextColor={theme.colors.textSecondary}
											multiline
											numberOfLines={3}
										/>

										<Text style={styles.subFieldLabel}>Example</Text>
										<TextInput
											style={styles.textInput}
											value={section.example}
											onChangeText={(text) => {
												const newSections = [...formData.content.sections];
												newSections[index] = {
													...newSections[index],
													example: text,
												};
												setFormData((prev) => ({
													...prev,
													content: { sections: newSections },
												}));
											}}
											placeholder="Example sentence or usage"
											placeholderTextColor={theme.colors.textSecondary}
										/>
									</View>
								))}

								<TouchableOpacity
									style={styles.addSectionButton}
									onPress={() => {
										const newSection: BookStyleSection = {
											introduction_title: "",
											introduction_content: "",
											explanation_title: "",
											explanation_content: "",
											example: "",
										};
										const newSections = [
											...formData.content.sections,
											newSection,
										];
										setFormData((prev) => ({
											...prev,
											content: { sections: newSections },
										}));
									}}
								>
									<Text style={styles.addSectionButtonText}>+ Add Section</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</View>
			</Modal>

			{/* Content Preview Modal */}
			<ContentPreview
				visible={previewVisible}
				onClose={() => {
					setPreviewVisible(false);
					setPreviewLesson(null);
				}}
				contentType="lesson"
				content={previewLesson as any}
			/>
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
	lessonsList: {
		flex: 1,
		padding: theme.spacing.lg,
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
	lessonCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginBottom: theme.spacing.lg,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		minHeight: 120,
	},
	lessonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
		minHeight: 60,
	},
	lessonInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	lessonTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
	},
	lessonTypeIcon: {
		fontSize: 20,
		marginRight: theme.spacing.sm,
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
	},
	lessonDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginBottom: theme.spacing.sm,
	},
	lessonMeta: {
		marginBottom: theme.spacing.sm,
	},
	metaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	lessonActions: {
		flexDirection: "column",
		gap: theme.spacing.xs,
		alignItems: "flex-end",
		minWidth: 100,
	},
	actionButton: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
		minWidth: 70,
		alignItems: "center",
	},
	previewButton: {
		backgroundColor: theme.colors.primary + "15",
		borderColor: theme.colors.primary,
		borderWidth: 1,
	},
	previewButtonText: {
		color: theme.colors.primary,
		fontSize: 12,
		fontWeight: "600",
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
	lessonDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
		marginTop: theme.spacing.sm,
	},
	lessonDetailItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
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
	},
	difficultyBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 10,
		fontSize: 10,
		textTransform: "capitalize",
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
	textAreaLarge: {
		height: 160,
		textAlignVertical: "top",
		fontFamily: "monospace",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	helpText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
		marginTop: -theme.spacing.sm,
	},
	// Content Editor Styles
	contentEditor: {
		marginBottom: theme.spacing.lg,
	},
	sectionEditor: {
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	sectionNumber: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	deleteSectionButton: {
		backgroundColor: theme.colors.error,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 4,
	},
	deleteSectionText: {
		color: "white",
		fontSize: 12,
		fontWeight: "500",
	},
	subFieldLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
		marginTop: theme.spacing.sm,
	},
	addSectionButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	addSectionButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	loadTemplateButton: {
		backgroundColor: theme.colors.secondary,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	loadTemplateButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	helpSection: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.md,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	helpTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	helpContent: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		lineHeight: 18,
	},
});
