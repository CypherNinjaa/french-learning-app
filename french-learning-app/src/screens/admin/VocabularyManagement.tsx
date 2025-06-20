// Stage 3.2: Vocabulary Management Screen
// Comprehensive vocabulary management interface for admin users

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
	Vocabulary,
	CreateVocabularyDto,
	UpdateVocabularyDto,
	DifficultyLevel,
	WordType,
	Gender,
	ConjugationGroup,
} from "../../types";

interface VocabularyFormData {
	french_word: string;
	english_translation: string;
	pronunciation: string;
	audio_url: string;
	example_sentence_fr: string;
	example_sentence_en: string;
	difficulty_level: DifficultyLevel;
	category: string;
	gender?: Gender;
	word_type?: WordType;
	conjugation_group?: ConjugationGroup;
	is_active: boolean;
}

export const VocabularyManagement = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
		null
	);
	const [formLoading, setFormLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		DifficultyLevel | ""
	>("");

	const [formData, setFormData] = useState<VocabularyFormData>({
		french_word: "",
		english_translation: "",
		pronunciation: "",
		audio_url: "",
		example_sentence_fr: "",
		example_sentence_en: "",
		difficulty_level: "beginner",
		category: "",
		gender: undefined,
		word_type: undefined,
		conjugation_group: undefined,
		is_active: true,
	});

	const categories = [
		"Food & Dining",
		"Travel & Transportation",
		"Family & Relationships",
		"Work & Business",
		"Health & Body",
		"Home & Living",
		"Nature & Environment",
		"Sports & Recreation",
		"Technology",
		"Education",
		"Shopping",
		"Emotions & Feelings",
		"Time & Calendar",
		"Colors & Shapes",
		"Numbers & Math",
		"Clothing & Fashion",
		"Arts & Culture",
		"Politics & Society",
		"Religion & Spirituality",
		"Science & Research",
	];

	const loadData = async () => {
		try {
			const filters = {
				difficulty_level: selectedDifficulty || undefined,
				category: selectedCategory || undefined,
				search: searchText || undefined,
				limit: 100,
			};

			const result = await ContentManagementService.getVocabulary(filters);
			if (result.success && result.data) {
				setVocabulary(result.data);
			}
		} catch (error) {
			console.error("Error loading vocabulary:", error);
			Alert.alert("Error", "Failed to load vocabulary");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const openCreateModal = () => {
		setFormData({
			french_word: "",
			english_translation: "",
			pronunciation: "",
			audio_url: "",
			example_sentence_fr: "",
			example_sentence_en: "",
			difficulty_level: "beginner",
			category: selectedCategory || "",
			gender: undefined,
			word_type: undefined,
			conjugation_group: undefined,
			is_active: true,
		});
		setEditingVocabulary(null);
		setModalVisible(true);
	};

	const openEditModal = (vocab: Vocabulary) => {
		setFormData({
			french_word: vocab.french_word,
			english_translation: vocab.english_translation,
			pronunciation: vocab.pronunciation || "",
			audio_url: vocab.audio_url || "",
			example_sentence_fr: vocab.example_sentence_fr || "",
			example_sentence_en: vocab.example_sentence_en || "",
			difficulty_level: vocab.difficulty_level,
			category: vocab.category || "",
			gender: vocab.gender,
			word_type: vocab.word_type,
			conjugation_group: vocab.conjugation_group,
			is_active: vocab.is_active,
		});
		setEditingVocabulary(vocab);
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		if (!formData.french_word.trim()) {
			Alert.alert("Error", "Please enter the French word");
			return;
		}

		if (!formData.english_translation.trim()) {
			Alert.alert("Error", "Please enter the English translation");
			return;
		}

		setFormLoading(true);

		try {
			if (editingVocabulary) {
				// Update existing vocabulary
				const updateData: UpdateVocabularyDto = {
					french_word: formData.french_word,
					english_translation: formData.english_translation,
					pronunciation: formData.pronunciation || undefined,
					audio_url: formData.audio_url || undefined,
					example_sentence_fr: formData.example_sentence_fr || undefined,
					example_sentence_en: formData.example_sentence_en || undefined,
					difficulty_level: formData.difficulty_level,
					category: formData.category || undefined,
					gender: formData.gender,
					word_type: formData.word_type,
					conjugation_group: formData.conjugation_group,
					is_active: formData.is_active,
				};

				const result = await ContentManagementService.updateVocabulary(
					editingVocabulary.id,
					updateData
				);
				if (result.success) {
					Alert.alert("Success", "Vocabulary updated successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to update vocabulary");
				}
			} else {
				// Create new vocabulary
				const createData: CreateVocabularyDto = {
					french_word: formData.french_word,
					english_translation: formData.english_translation,
					pronunciation: formData.pronunciation || undefined,
					audio_url: formData.audio_url || undefined,
					example_sentence_fr: formData.example_sentence_fr || undefined,
					example_sentence_en: formData.example_sentence_en || undefined,
					difficulty_level: formData.difficulty_level,
					category: formData.category || undefined,
					gender: formData.gender,
					word_type: formData.word_type,
					conjugation_group: formData.conjugation_group,
				};

				const result = await ContentManagementService.createVocabulary(
					createData
				);
				if (result.success) {
					Alert.alert("Success", "Vocabulary created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create vocabulary");
				}
			}

			setModalVisible(false);
			await loadData();
		} catch (error) {
			console.error("Error saving vocabulary:", error);
			Alert.alert("Error", "Failed to save vocabulary");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = (vocab: Vocabulary) => {
		Alert.alert(
			"Delete Vocabulary",
			`Are you sure you want to delete "${vocab.french_word}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							// Note: We should implement deleteVocabulary in the service
							Alert.alert("Info", "Delete functionality will be implemented");
						} catch (error) {
							Alert.alert("Error", "Failed to delete vocabulary");
						}
					},
				},
			]
		);
	};

	const getWordTypeColor = (type?: WordType) => {
		const colors = {
			noun: "#4ECDC4",
			verb: "#45B7D1",
			adjective: "#96CEB4",
			adverb: "#FFEAA7",
			preposition: "#DDA0DD",
			conjunction: "#FF6B6B",
			interjection: "#FFA726",
		};
		return colors[type || "noun"] || theme.colors.primary;
	};

	const clearFilters = () => {
		setSearchText("");
		setSelectedCategory("");
		setSelectedDifficulty("");
	};

	useEffect(() => {
		loadData();
	}, [searchText, selectedCategory, selectedDifficulty]);

	const VocabularyCard = ({ vocab }: { vocab: Vocabulary }) => (
		<View style={styles.vocabularyCard}>
			<View style={styles.vocabularyHeader}>
				<View style={styles.vocabularyInfo}>
					<View style={styles.wordsRow}>
						<Text style={styles.frenchWord}>{vocab.french_word}</Text>
						{vocab.gender && (
							<Text
								style={[
									styles.genderBadge,
									{
										backgroundColor:
											vocab.gender === "masculine" ? "#E3F2FD" : "#FCE4EC",
										color: vocab.gender === "masculine" ? "#1976D2" : "#C2185B",
									},
								]}
							>
								{vocab.gender === "masculine" ? "m" : "f"}
							</Text>
						)}
					</View>
					<Text style={styles.englishTranslation}>
						{vocab.english_translation}
					</Text>
					{vocab.pronunciation && (
						<Text style={styles.pronunciation}>/{vocab.pronunciation}/</Text>
					)}
					{vocab.example_sentence_fr && (
						<View style={styles.exampleContainer}>
							<Text style={styles.exampleFrench}>
								{vocab.example_sentence_fr}
							</Text>
							{vocab.example_sentence_en && (
								<Text style={styles.exampleEnglish}>
									{vocab.example_sentence_en}
								</Text>
							)}
						</View>
					)}
				</View>
				<View style={styles.vocabularyActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.editButton]}
						onPress={() => openEditModal(vocab)}
					>
						<Text style={styles.editButtonText}>Edit</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.actionButton, styles.deleteButton]}
						onPress={() => handleDelete(vocab)}
					>
						<Text style={styles.deleteButtonText}>Delete</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.vocabularyDetails}>
				{vocab.word_type && (
					<View style={styles.vocabularyDetailItem}>
						<Text style={styles.detailLabel}>Type:</Text>
						<View
							style={[
								styles.typeBadge,
								{ backgroundColor: getWordTypeColor(vocab.word_type) + "20" },
							]}
						>
							<Text
								style={[
									styles.detailValue,
									{ color: getWordTypeColor(vocab.word_type) },
								]}
							>
								{vocab.word_type}
							</Text>
						</View>
					</View>
				)}
				{vocab.category && (
					<View style={styles.vocabularyDetailItem}>
						<Text style={styles.detailLabel}>Category:</Text>
						<Text style={styles.detailValue}>{vocab.category}</Text>
					</View>
				)}
				<View style={styles.vocabularyDetailItem}>
					<Text style={styles.detailLabel}>Difficulty:</Text>
					<Text
						style={[
							styles.detailValue,
							styles.difficultyBadge,
							{
								backgroundColor:
									vocab.difficulty_level === "beginner"
										? "#E8F5E8"
										: vocab.difficulty_level === "intermediate"
										? "#FFF4E6"
										: "#FFE6E6",
								color:
									vocab.difficulty_level === "beginner"
										? "#2E7D32"
										: vocab.difficulty_level === "intermediate"
										? "#F57C00"
										: "#D32F2F",
							},
						]}
					>
						{vocab.difficulty_level}
					</Text>
				</View>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading vocabulary...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Vocabulary Management</Text>
				<TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
					<Text style={styles.createButtonText}>+ Add Word</Text>
				</TouchableOpacity>
			</View>

			{/* Search and Filters */}
			<View style={styles.filtersContainer}>
				<TextInput
					style={styles.searchInput}
					value={searchText}
					onChangeText={setSearchText}
					placeholder="Search French or English words..."
					placeholderTextColor={theme.colors.textSecondary}
				/>

				<View style={styles.filterRow}>
					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Category:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedCategory}
								onValueChange={(value: string) => setSelectedCategory(value)}
								style={styles.picker}
							>
								<Picker.Item label="All Categories" value="" />
								{categories.map((category) => (
									<Picker.Item
										key={category}
										label={category}
										value={category}
									/>
								))}
							</Picker>
						</View>
					</View>

					<View style={styles.filterItem}>
						<Text style={styles.filterLabel}>Difficulty:</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={selectedDifficulty}
								onValueChange={(value: DifficultyLevel | "") =>
									setSelectedDifficulty(value)
								}
								style={styles.picker}
							>
								<Picker.Item label="All Levels" value="" />
								<Picker.Item label="Beginner" value="beginner" />
								<Picker.Item label="Intermediate" value="intermediate" />
								<Picker.Item label="Advanced" value="advanced" />
							</Picker>
						</View>
					</View>
				</View>

				<TouchableOpacity
					style={styles.clearFiltersButton}
					onPress={clearFilters}
				>
					<Text style={styles.clearFiltersText}>Clear Filters</Text>
				</TouchableOpacity>
			</View>

			{/* Vocabulary List */}
			<ScrollView
				style={styles.vocabularyList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.statsContainer}>
					<Text style={styles.statsText}>{vocabulary.length} words found</Text>
				</View>

				{vocabulary.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No vocabulary words found</Text>
						<Text style={styles.emptySubtext}>
							Add your first vocabulary word to get started
						</Text>
					</View>
				) : (
					vocabulary.map((vocab) => (
						<VocabularyCard key={vocab.id} vocab={vocab} />
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
							{editingVocabulary ? "Edit Vocabulary" : "Add Vocabulary"}
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

							<Text style={styles.fieldLabel}>French Word *</Text>
							<TextInput
								style={styles.textInput}
								value={formData.french_word}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, french_word: text }))
								}
								placeholder="Enter French word"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>English Translation *</Text>
							<TextInput
								style={styles.textInput}
								value={formData.english_translation}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										english_translation: text,
									}))
								}
								placeholder="Enter English translation"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Pronunciation (IPA)</Text>
							<TextInput
								style={styles.textInput}
								value={formData.pronunciation}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, pronunciation: text }))
								}
								placeholder="e.g., bɔ̃ʒuʁ"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Audio URL</Text>
							<TextInput
								style={styles.textInput}
								value={formData.audio_url}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, audio_url: text }))
								}
								placeholder="URL to pronunciation audio"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						{/* Examples */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Example Sentences</Text>

							<Text style={styles.fieldLabel}>French Example</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.example_sentence_fr}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										example_sentence_fr: text,
									}))
								}
								placeholder="Example sentence in French"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={2}
							/>

							<Text style={styles.fieldLabel}>English Example</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.example_sentence_en}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										example_sentence_en: text,
									}))
								}
								placeholder="Example sentence in English"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={2}
							/>
						</View>

						{/* Classification */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Classification</Text>

							<Text style={styles.fieldLabel}>Category</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.category}
									onValueChange={(value: string) =>
										setFormData((prev) => ({ ...prev, category: value }))
									}
									style={styles.picker}
								>
									<Picker.Item label="Select Category" value="" />
									{categories.map((category) => (
										<Picker.Item
											key={category}
											label={category}
											value={category}
										/>
									))}
								</Picker>
							</View>

							<Text style={styles.fieldLabel}>Word Type</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.word_type || ""}
									onValueChange={(value: WordType | "") =>
										setFormData((prev) => ({
											...prev,
											word_type: value || undefined,
										}))
									}
									style={styles.picker}
								>
									<Picker.Item label="Select Word Type" value="" />
									<Picker.Item label="Noun" value="noun" />
									<Picker.Item label="Verb" value="verb" />
									<Picker.Item label="Adjective" value="adjective" />
									<Picker.Item label="Adverb" value="adverb" />
									<Picker.Item label="Preposition" value="preposition" />
									<Picker.Item label="Conjunction" value="conjunction" />
									<Picker.Item label="Interjection" value="interjection" />
								</Picker>
							</View>

							{formData.word_type === "noun" && (
								<>
									<Text style={styles.fieldLabel}>Gender</Text>
									<View style={styles.pickerContainer}>
										<Picker
											selectedValue={formData.gender || ""}
											onValueChange={(value: Gender | "") =>
												setFormData((prev) => ({
													...prev,
													gender: value || undefined,
												}))
											}
											style={styles.picker}
										>
											<Picker.Item label="Select Gender" value="" />
											<Picker.Item label="Masculine" value="masculine" />
											<Picker.Item label="Feminine" value="feminine" />
											<Picker.Item label="Neutral" value="neutral" />
										</Picker>
									</View>
								</>
							)}

							{formData.word_type === "verb" && (
								<>
									<Text style={styles.fieldLabel}>Conjugation Group</Text>
									<View style={styles.pickerContainer}>
										<Picker
											selectedValue={formData.conjugation_group || ""}
											onValueChange={(value: ConjugationGroup | "") =>
												setFormData((prev) => ({
													...prev,
													conjugation_group: value || undefined,
												}))
											}
											style={styles.picker}
										>
											<Picker.Item label="Select Group" value="" />
											<Picker.Item label="First Group (-er)" value="first" />
											<Picker.Item label="Second Group (-ir)" value="second" />
											<Picker.Item label="Third Group (-re)" value="third" />
											<Picker.Item label="Irregular" value="irregular" />
										</Picker>
									</View>
								</>
							)}

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
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.md,
		paddingRight: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.md,
	},
	createButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		minWidth: 100,
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
	},
	searchInput: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	filterRow: {
		flexDirection: "row",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.md,
	},
	filterItem: {
		flex: 1,
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
		justifyContent: "center",
	},
	picker: {
		height: 50,
	},
	clearFiltersButton: {
		alignSelf: "flex-start",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	clearFiltersText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	vocabularyList: {
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
	vocabularyCard: {
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
	vocabularyHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	vocabularyInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	wordsRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
	},
	frenchWord: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginRight: theme.spacing.sm,
	},
	genderBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 10,
		fontSize: 12,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	englishTranslation: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	pronunciation: {
		fontSize: 14,
		color: theme.colors.primary,
		fontStyle: "italic",
		marginBottom: theme.spacing.sm,
	},
	exampleContainer: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.sm,
		borderRadius: 8,
		marginBottom: theme.spacing.sm,
	},
	exampleFrench: {
		fontSize: 14,
		color: theme.colors.text,
		fontStyle: "italic",
		marginBottom: 2,
	},
	exampleEnglish: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	vocabularyActions: {
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
	vocabularyDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
	},
	vocabularyDetailItem: {
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
		height: 60,
		textAlignVertical: "top",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
});
