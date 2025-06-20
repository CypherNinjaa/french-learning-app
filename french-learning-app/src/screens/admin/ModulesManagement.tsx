// Stage 3.2: Modules Management Screen
// Comprehensive modules management interface for admin users

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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ContentManagementService } from "../../services/contentManagementService";
import { theme } from "../../constants/theme";
import {
	Module,
	Level,
	CreateModuleDto,
	UpdateModuleDto,
	DifficultyLevel,
} from "../../types";

interface ModuleFormData {
	title: string;
	description: string;
	level_id: number;
	order_index: number;
	estimated_duration_minutes: number;
	difficulty_level: "beginner" | "intermediate" | "advanced";
	learning_objectives: string[];
	is_active: boolean;
}

export const ModulesManagement = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [modules, setModules] = useState<Module[]>([]);
	const [levels, setLevels] = useState<Level[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingModule, setEditingModule] = useState<Module | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	const [formData, setFormData] = useState<ModuleFormData>({
		title: "",
		description: "",
		level_id: 0,
		order_index: 1,
		estimated_duration_minutes: 30,
		difficulty_level: "beginner",
		learning_objectives: [],
		is_active: true,
	});

	const loadData = async () => {
		try {
			const [levelsRes, modulesRes] = await Promise.all([
				ContentManagementService.getLevels(),
				ContentManagementService.getModules(selectedLevel || undefined),
			]);

			if (levelsRes.success && levelsRes.data) {
				setLevels(levelsRes.data);
				if (!selectedLevel && levelsRes.data.length > 0) {
					setSelectedLevel(levelsRes.data[0].id);
				}
			}

			if (modulesRes.success && modulesRes.data) {
				setModules(modulesRes.data);
			}
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Failed to load modules and levels");
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
			modules.length > 0 ? Math.max(...modules.map((m) => m.order_index)) : 0;
		setFormData({
			title: "",
			description: "",
			level_id: selectedLevel || (levels.length > 0 ? levels[0].id : 0),
			order_index: maxOrder + 1,
			estimated_duration_minutes: 30,
			difficulty_level: "beginner",
			learning_objectives: [],
			is_active: true,
		});
		setEditingModule(null);
		setModalVisible(true);
	};

	const openEditModal = (module: Module) => {
		setFormData({
			title: module.title,
			description: module.description || "",
			level_id: module.level_id,
			order_index: module.order_index,
			estimated_duration_minutes: module.estimated_duration_minutes || 30,
			difficulty_level: module.difficulty_level || "beginner",
			learning_objectives: module.learning_objectives || [],
			is_active: module.is_active,
		});
		setEditingModule(module);
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		if (!formData.title.trim()) {
			Alert.alert("Error", "Please enter a module title");
			return;
		}

		if (!formData.level_id) {
			Alert.alert("Error", "Please select a level");
			return;
		}

		setFormLoading(true);

		try {
			if (editingModule) {
				// Update existing module
				const updateData: UpdateModuleDto = {
					title: formData.title,
					description: formData.description,
					order_index: formData.order_index,
					estimated_duration_minutes: formData.estimated_duration_minutes,
					difficulty_level: formData.difficulty_level,
					learning_objectives: formData.learning_objectives,
					is_active: formData.is_active,
				};

				const result = await ContentManagementService.updateModule(
					editingModule.id,
					updateData
				);
				if (result.success) {
					Alert.alert("Success", "Module updated successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to update module");
				}
			} else {
				// Create new module
				const createData: CreateModuleDto = {
					title: formData.title,
					description: formData.description,
					level_id: formData.level_id,
					order_index: formData.order_index,
					estimated_duration_minutes: formData.estimated_duration_minutes,
					difficulty_level: formData.difficulty_level,
					learning_objectives: formData.learning_objectives,
				};

				const result = await ContentManagementService.createModule(createData);
				if (result.success) {
					Alert.alert("Success", "Module created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create module");
				}
			}

			setModalVisible(false);
			await loadData();
		} catch (error) {
			console.error("Error saving module:", error);
			Alert.alert("Error", "Failed to save module");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = (module: Module) => {
		Alert.alert(
			"Delete Module",
			`Are you sure you want to delete "${module.title}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							// Note: We should implement deleteModule in the service
							Alert.alert("Info", "Delete functionality will be implemented");
						} catch (error) {
							Alert.alert("Error", "Failed to delete module");
						}
					},
				},
			]
		);
	};

	const addLearningObjective = () => {
		setFormData((prev) => ({
			...prev,
			learning_objectives: [...prev.learning_objectives, ""],
		}));
	};

	const updateLearningObjective = (index: number, value: string) => {
		setFormData((prev) => ({
			...prev,
			learning_objectives: prev.learning_objectives.map((obj, i) =>
				i === index ? value : obj
			),
		}));
	};

	const removeLearningObjective = (index: number) => {
		setFormData((prev) => ({
			...prev,
			learning_objectives: prev.learning_objectives.filter(
				(_, i) => i !== index
			),
		}));
	};

	useEffect(() => {
		loadData();
	}, [selectedLevel]);

	const ModuleCard = ({ module }: { module: Module }) => (
		<View style={styles.moduleCard}>
			<View style={styles.moduleHeader}>
				<View style={styles.moduleInfo}>
					<Text style={styles.moduleTitle}>{module.title}</Text>
					<Text style={styles.moduleDescription}>{module.description}</Text>
				</View>
				<View style={styles.moduleActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.editButton]}
						onPress={() => openEditModal(module)}
					>
						<Text style={styles.editButtonText}>Edit</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.actionButton, styles.deleteButton]}
						onPress={() => handleDelete(module)}
					>
						<Text style={styles.deleteButtonText}>Delete</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.moduleDetails}>
				<View style={styles.moduleDetailItem}>
					<Text style={styles.detailLabel}>Order:</Text>
					<Text style={styles.detailValue}>{module.order_index}</Text>
				</View>
				<View style={styles.moduleDetailItem}>
					<Text style={styles.detailLabel}>Duration:</Text>
					<Text style={styles.detailValue}>
						{module.estimated_duration_minutes}min
					</Text>
				</View>
				<View style={styles.moduleDetailItem}>
					<Text style={styles.detailLabel}>Difficulty:</Text>
					<Text
						style={[
							styles.detailValue,
							styles.difficultyBadge,
							{
								backgroundColor:
									module.difficulty_level === "beginner"
										? "#E8F5E8"
										: module.difficulty_level === "intermediate"
										? "#FFF4E6"
										: "#FFE6E6",
								color:
									module.difficulty_level === "beginner"
										? "#2E7D32"
										: module.difficulty_level === "intermediate"
										? "#F57C00"
										: "#D32F2F",
							},
						]}
					>
						{module.difficulty_level}
					</Text>
				</View>
			</View>
			{module.learning_objectives && module.learning_objectives.length > 0 && (
				<View style={styles.objectivesContainer}>
					<Text style={styles.objectivesTitle}>Learning Objectives:</Text>
					{module.learning_objectives.map(
						(objective: string, index: number) => (
							<Text key={index} style={styles.objective}>
								• {objective}
							</Text>
						)
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
					<Text style={styles.loadingText}>Loading modules...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Modules Management</Text>
				<TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
					<Text style={styles.createButtonText}>+ Create Module</Text>
				</TouchableOpacity>
			</View>

			{/* Level Filter */}
			<View style={styles.filterContainer}>
				<Text style={styles.filterLabel}>Filter by Level:</Text>
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
			{/* Modules List */}
			<ScrollView
				style={styles.modulesList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{modules.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{selectedLevel
								? "No modules found for this level"
								: "No modules created yet"}
						</Text>
						<Text style={styles.emptySubtext}>
							Create your first module to get started
						</Text>
					</View>
				) : (
					modules.map((module) => (
						<ModuleCard key={module.id} module={module} />
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
							{editingModule ? "Edit Module" : "Create Module"}
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
								placeholder="Module title"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.fieldLabel}>Description</Text>
							<TextInput
								style={[styles.textInput, styles.textArea]}
								value={formData.description}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, description: text }))
								}
								placeholder="Module description"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={3}
							/>
						</View>

						{/* Level and Order */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Organization</Text>
							<Text style={styles.fieldLabel}>Level *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.level_id.toString()}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											level_id: Number(value),
										}))
									}
									style={styles.picker}
								>
									{levels.map((level) => (
										<Picker.Item
											key={level.id}
											label={level.name}
											value={level.id.toString()}
										/>
									))}
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

						{/* Module Settings */}
						<View style={styles.formSection}>
							<Text style={styles.sectionTitle}>Settings</Text>

							<Text style={styles.fieldLabel}>
								Estimated Duration (minutes)
							</Text>
							<TextInput
								style={styles.textInput}
								value={formData.estimated_duration_minutes.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										estimated_duration_minutes: parseInt(text) || 30,
									}))
								}
								placeholder="Duration in minutes"
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
						</View>

						{/* Learning Objectives */}
						<View style={styles.formSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Learning Objectives</Text>
								<TouchableOpacity
									onPress={addLearningObjective}
									style={styles.addButton}
								>
									<Text style={styles.addButtonText}>+ Add</Text>
								</TouchableOpacity>
							</View>

							{formData.learning_objectives.map((objective, index) => (
								<View key={index} style={styles.objectiveInput}>
									<TextInput
										style={[styles.textInput, styles.flexInput]}
										value={objective}
										onChangeText={(text) =>
											updateLearningObjective(index, text)
										}
										placeholder={`Learning objective ${index + 1}`}
										placeholderTextColor={theme.colors.textSecondary}
									/>
									<TouchableOpacity
										onPress={() => removeLearningObjective(index)}
										style={styles.removeButton}
									>
										<Text style={styles.removeButtonText}>×</Text>
									</TouchableOpacity>
								</View>
							))}
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
	filterContainer: {
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	filterLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	pickerContainer: {
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	picker: {
		height: 50,
	},
	modulesList: {
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
	moduleCard: {
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
	moduleHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	moduleInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	moduleTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	moduleDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	moduleActions: {
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
	moduleDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
		marginBottom: theme.spacing.md,
	},
	moduleDetailItem: {
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
	objectivesContainer: {
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		paddingTop: theme.spacing.md,
	},
	objectivesTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	objective: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: 2,
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
		height: 80,
		textAlignVertical: "top",
	},
	flexInput: {
		flex: 1,
		marginRight: theme.spacing.sm,
		marginBottom: 0,
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
	objectiveInput: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	removeButton: {
		backgroundColor: "#FF6B6B",
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	removeButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
