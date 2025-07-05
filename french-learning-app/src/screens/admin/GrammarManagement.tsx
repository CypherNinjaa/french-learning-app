// Stage 3.2: Grammar Rules Management Screen
// Comprehensive grammar rules management interface for admin users

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
import { FloatingActionButton } from "../../components/FloatingActionButton";
import {
	GrammarRule,
	CreateGrammarRuleDto,
	UpdateGrammarRuleDto,
	DifficultyLevel,
} from "../../types";

interface GrammarFormData {
	title: string;
	explanation: string;
	examples: Array<{ french: string; english: string }>;
	difficulty_level: DifficultyLevel;
	category: string;
	order_index: number;
	is_active: boolean;
}

export const GrammarManagement = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingGrammar, setEditingGrammar] = useState<GrammarRule | null>(
		null
	);
	const [formLoading, setFormLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		DifficultyLevel | ""
	>("");

	const [formData, setFormData] = useState<GrammarFormData>({
		title: "",
		explanation: "",
		examples: [{ french: "", english: "" }],
		difficulty_level: "beginner",
		category: "",
		order_index: 1,
		is_active: true,
	});

	const categories = [
		"Verbs",
		"Nouns",
		"Adjectives",
		"Pronouns",
		"Articles",
		"Prepositions",
		"Conjunctions",
		"Adverbs",
		"Sentence Structure",
		"Tenses",
		"Moods",
		"Voice",
		"Questions",
		"Negation",
		"Comparison",
		"Numbers",
		"Time & Date",
		"Conditionals",
		"Subjunctive",
		"Participles",
	];

	const loadData = async () => {
		try {
			const filters = {
				difficulty_level: selectedDifficulty || undefined,
				category: selectedCategory || undefined,
				search: searchText || undefined,
			};

			const result = await ContentManagementService.getGrammarRules(filters);
			if (result.success && result.data) {
				setGrammarRules(result.data);
			}
		} catch (error) {
			console.error("Error loading grammar rules:", error);
			Alert.alert("Error", "Failed to load grammar rules");
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
		const maxOrder =
			grammarRules.length > 0
				? Math.max(...grammarRules.map((g) => g.order_index || 0))
				: 0;

		setFormData({
			title: "",
			explanation: "",
			examples: [{ french: "", english: "" }],
			difficulty_level: "beginner",
			category: selectedCategory || "",
			order_index: maxOrder + 1,
			is_active: true,
		});
		setEditingGrammar(null);
		setModalVisible(true);
	};

	const openEditModal = (grammar: GrammarRule) => {
		const examples = grammar.examples || [{ french: "", english: "" }];

		setFormData({
			title: grammar.title,
			explanation: grammar.explanation,
			examples: Array.isArray(examples)
				? examples
				: [{ french: "", english: "" }],
			difficulty_level: grammar.difficulty_level,
			category: grammar.category || "",
			order_index: grammar.order_index || 1,
			is_active: grammar.is_active,
		});
		setEditingGrammar(grammar);
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		if (!formData.title.trim()) {
			Alert.alert("Error", "Please enter a grammar rule title");
			return;
		}

		if (!formData.explanation.trim()) {
			Alert.alert("Error", "Please enter an explanation");
			return;
		}

		setFormLoading(true);

		try {
			const examples = formData.examples.filter(
				(ex) => ex.french.trim() || ex.english.trim()
			);

			if (editingGrammar) {
				// Update existing grammar rule - Note: We need to implement this in the service
				Alert.alert("Info", "Update functionality will be implemented");
			} else {
				// Create new grammar rule
				const createData: CreateGrammarRuleDto = {
					title: formData.title,
					explanation: formData.explanation,
					examples: examples.length > 0 ? examples : undefined,
					difficulty_level: formData.difficulty_level,
					category: formData.category || undefined,
					order_index: formData.order_index,
				};

				const result = await ContentManagementService.createGrammarRule(
					createData
				);
				if (result.success) {
					Alert.alert("Success", "Grammar rule created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create grammar rule");
				}
			}

			setModalVisible(false);
			await loadData();
		} catch (error) {
			console.error("Error saving grammar rule:", error);
			Alert.alert("Error", "Failed to save grammar rule");
		} finally {
			setFormLoading(false);
		}
	};
	const handleDelete = (grammar: GrammarRule) => {
		Alert.alert(
			"Delete Grammar Rule",
			`Are you sure you want to delete "${grammar.title}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							const result = await ContentManagementService.deleteGrammarRule(
								grammar.id
							);
							if (result.success) {
								Alert.alert("Success", "Grammar rule deleted successfully");
								// Refresh the grammar rules list
								loadData();
							} else {
								Alert.alert(
									"Error",
									result.error || "Failed to delete grammar rule"
								);
							}
						} catch (error) {
							console.error("Delete grammar rule error:", error);
							Alert.alert("Error", "Failed to delete grammar rule");
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};

	const addExample = () => {
		setFormData((prev) => ({
			...prev,
			examples: [...prev.examples, { french: "", english: "" }],
		}));
	};

	const updateExample = (
		index: number,
		field: "french" | "english",
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			examples: prev.examples.map((ex, i) =>
				i === index ? { ...ex, [field]: value } : ex
			),
		}));
	};

	const removeExample = (index: number) => {
		if (formData.examples.length > 1) {
			setFormData((prev) => ({
				...prev,
				examples: prev.examples.filter((_, i) => i !== index),
			}));
		}
	};

	const clearFilters = () => {
		setSearchText("");
		setSelectedCategory("");
		setSelectedDifficulty("");
	};

	useEffect(() => {
		loadData();
	}, [searchText, selectedCategory, selectedDifficulty]);

	const GrammarCard = ({ grammar }: { grammar: GrammarRule }) => (
		<View style={styles.grammarCard}>
			<View style={styles.grammarHeader}>
				<View style={styles.grammarInfo}>
					<Text style={styles.grammarTitle}>{grammar.title}</Text>
					<Text style={styles.grammarExplanation} numberOfLines={3}>
						{grammar.explanation}
					</Text>
					{grammar.category && (
						<Text style={styles.grammarCategory}>
							Category: {grammar.category}
						</Text>
					)}
				</View>
				<View style={styles.grammarActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.editButton]}
						onPress={() => openEditModal(grammar)}
					>
						<Text style={styles.editButtonText}>Edit</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.actionButton, styles.deleteButton]}
						onPress={() => handleDelete(grammar)}
					>
						<Text style={styles.deleteButtonText}>Delete</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.grammarDetails}>
				<View style={styles.grammarDetailItem}>
					<Text style={styles.detailLabel}>Order:</Text>
					<Text style={styles.detailValue}>{grammar.order_index || "N/A"}</Text>
				</View>
				<View style={styles.grammarDetailItem}>
					<Text style={styles.detailLabel}>Difficulty:</Text>
					<Text
						style={[
							styles.detailValue,
							styles.difficultyBadge,
							{
								backgroundColor:
									grammar.difficulty_level === "beginner"
										? "#E8F5E8"
										: grammar.difficulty_level === "intermediate"
										? "#FFF4E6"
										: "#FFE6E6",
								color:
									grammar.difficulty_level === "beginner"
										? "#2E7D32"
										: grammar.difficulty_level === "intermediate"
										? "#F57C00"
										: "#D32F2F",
							},
						]}
					>
						{grammar.difficulty_level}
					</Text>
				</View>
			</View>

			{grammar.examples &&
				Array.isArray(grammar.examples) &&
				grammar.examples.length > 0 && (
					<View style={styles.examplesContainer}>
						<Text style={styles.examplesTitle}>Examples:</Text>
						{grammar.examples.slice(0, 2).map((example: any, index: number) => (
							<View key={index} style={styles.exampleItem}>
								<Text style={styles.exampleFrench}>{example.french}</Text>
								<Text style={styles.exampleEnglish}>{example.english}</Text>
							</View>
						))}
						{grammar.examples.length > 2 && (
							<Text style={styles.moreExamples}>
								+{grammar.examples.length - 2} more examples
							</Text>
						)}
					</View>
				)}
		</View>
	);

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading grammar rules...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Grammar Management</Text>
				<TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
					<Text style={styles.createButtonText}>+ Add Rule</Text>
				</TouchableOpacity>
			</View>

			{/* Search and Filters */}
			<View style={styles.filtersContainer}>
				<TextInput
					style={styles.searchInput}
					value={searchText}
					onChangeText={setSearchText}
					placeholder="Search grammar rules..."
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

			{/* Grammar Rules List */}
			<ScrollView
				style={styles.grammarList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.statsContainer}>
					<Text style={styles.statsText}>
						{grammarRules.length} rules found
					</Text>
				</View>

				{grammarRules.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No grammar rules found</Text>
						<Text style={styles.emptySubtext}>
							Add your first grammar rule to get started
						</Text>
					</View>
				) : (
					grammarRules.map((grammar) => (
						<GrammarCard key={grammar.id} grammar={grammar} />
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
							{editingGrammar ? "Edit Grammar Rule" : "Add Grammar Rule"}
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

							<Text style={styles.fieldLabel}>Title *</Text>
							<TextInput
								style={styles.textInput}
								value={formData.title}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, title: text }))
								}
								placeholder="Grammar rule title"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Explanation *</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.explanation}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, explanation: text }))
								}
								placeholder="Detailed explanation of the grammar rule"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={4}
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

						{/* Examples */}
						<View style={styles.formSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Examples</Text>
								<TouchableOpacity onPress={addExample} style={styles.addButton}>
									<Text style={styles.addButtonText}>+ Add Example</Text>
								</TouchableOpacity>
							</View>

							{formData.examples.map((example, index) => (
								<View key={index} style={styles.exampleInputContainer}>
									<View style={styles.exampleInputHeader}>
										<Text style={styles.exampleInputTitle}>
											Example {index + 1}
										</Text>
										{formData.examples.length > 1 && (
											<TouchableOpacity
												onPress={() => removeExample(index)}
												style={styles.removeButton}
											>
												<Text style={styles.removeButtonText}>×</Text>
											</TouchableOpacity>
										)}
									</View>

									<Text style={styles.fieldLabel}>French</Text>
									<TextInput
										style={styles.textInput}
										value={example.french}
										onChangeText={(text) =>
											updateExample(index, "french", text)
										}
										placeholder="French example sentence"
										placeholderTextColor={theme.colors.textSecondary}
									/>

									<Text style={styles.fieldLabel}>English</Text>
									<TextInput
										style={styles.textInput}
										value={example.english}
										onChangeText={(text) =>
											updateExample(index, "english", text)
										}
										placeholder="English translation"
										placeholderTextColor={theme.colors.textSecondary}
									/>
								</View>
							))}
						</View>
					</ScrollView>
				</View>
			</Modal>

			{/* Floating Action Button */}
			<FloatingActionButton icon="add" onPress={openCreateModal} />
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
		minWidth: 120,
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
	grammarList: {
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
	grammarCard: {
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
	grammarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	grammarInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	grammarTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	grammarExplanation: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginBottom: theme.spacing.sm,
	},
	grammarCategory: {
		fontSize: 12,
		color: theme.colors.primary,
		fontWeight: "500",
	},
	grammarActions: {
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
	grammarDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.md,
	},
	grammarDetailItem: {
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
	difficultyBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 10,
		fontSize: 10,
		textTransform: "capitalize",
	},
	examplesContainer: {
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		paddingTop: theme.spacing.md,
	},
	examplesTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	exampleItem: {
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
	moreExamples: {
		fontSize: 12,
		color: theme.colors.primary,
		fontStyle: "italic",
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
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
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
		height: 100,
		textAlignVertical: "top",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	addButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
	},
	addButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 12,
	},
	exampleInputContainer: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	exampleInputHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	exampleInputTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
	},
	removeButton: {
		backgroundColor: "#FF6B6B",
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	removeButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});
