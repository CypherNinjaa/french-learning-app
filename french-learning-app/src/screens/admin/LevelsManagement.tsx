// Stage 3.2: Levels Management Screen
// Beautiful interface for managing learning levels

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	TextInput,
	Modal,
	RefreshControl,
} from "react-native";
import { ContentManagementService } from "../../services/contentManagementService";
import { theme } from "../../constants/theme";
import { Level, CreateLevelDto, UpdateLevelDto } from "../../types";

export const LevelsManagement = () => {
	const [levels, setLevels] = useState<Level[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingLevel, setEditingLevel] = useState<Level | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		order_index: 0,
	});

	const loadLevels = async () => {
		try {
			const result = await ContentManagementService.getLevels();
			if (result.success && result.data) {
				setLevels(result.data);
			}
		} catch (error) {
			console.error("Error loading levels:", error);
			Alert.alert("Error", "Failed to load levels");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadLevels();
		setRefreshing(false);
	};

	useEffect(() => {
		loadLevels();
	}, []);

	const openCreateModal = () => {
		setEditingLevel(null);
		setFormData({
			name: "",
			description: "",
			order_index: levels.length + 1,
		});
		setModalVisible(true);
	};

	const openEditModal = (level: Level) => {
		setEditingLevel(level);
		setFormData({
			name: level.name,
			description: level.description || "",
			order_index: level.order_index,
		});
		setModalVisible(true);
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			Alert.alert("Error", "Level name is required");
			return;
		}

		try {
			setLoading(true);

			if (editingLevel) {
				// Update existing level
				const updateData: UpdateLevelDto = {
					name: formData.name,
					description: formData.description,
					order_index: formData.order_index,
				};
				const result = await ContentManagementService.updateLevel(
					editingLevel.id,
					updateData
				);
				if (result.success) {
					Alert.alert("Success", "Level updated successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to update level");
				}
			} else {
				// Create new level
				const createData: CreateLevelDto = {
					name: formData.name,
					description: formData.description,
					order_index: formData.order_index,
				};
				const result = await ContentManagementService.createLevel(createData);
				if (result.success) {
					Alert.alert("Success", "Level created successfully");
				} else {
					Alert.alert("Error", result.error || "Failed to create level");
				}
			}

			setModalVisible(false);
			await loadLevels();
		} catch (error) {
			console.error("Error saving level:", error);
			Alert.alert("Error", "Failed to save level");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (level: Level) => {
		Alert.alert(
			"Delete Level",
			`Are you sure you want to delete "${level.name}"? This will also affect all associated modules and lessons.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const result = await ContentManagementService.deleteLevel(
								level.id
							);
							if (result.success) {
								Alert.alert("Success", "Level deleted successfully");
								await loadLevels();
							} else {
								Alert.alert("Error", result.error || "Failed to delete level");
							}
						} catch (error) {
							console.error("Error deleting level:", error);
							Alert.alert("Error", "Failed to delete level");
						}
					},
				},
			]
		);
	};

	const LevelCard = ({ level }: { level: Level }) => (
		<View style={styles.levelCard}>
			<View style={styles.levelHeader}>
				<View style={styles.levelInfo}>
					<Text style={styles.levelName}>{level.name}</Text>
					<Text style={styles.levelOrder}>Order: {level.order_index}</Text>
				</View>
				<View style={styles.levelActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.editButton]}
						onPress={() => openEditModal(level)}
					>
						<Text style={styles.editButtonText}>✏️ Edit</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.actionButton, styles.deleteButton]}
						onPress={() => handleDelete(level)}
					>
						<Text style={styles.deleteButtonText}>🗑️ Delete</Text>
					</TouchableOpacity>
				</View>
			</View>
			{level.description && (
				<Text style={styles.levelDescription}>{level.description}</Text>
			)}
			<View style={styles.levelMeta}>
				<Text style={styles.levelMetaText}>
					Created: {new Date(level.created_at).toLocaleDateString()}
				</Text>
				<Text style={styles.levelMetaText}>
					Updated: {new Date(level.updated_at).toLocaleDateString()}
				</Text>
			</View>
		</View>
	);

	if (loading && levels.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading levels...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Learning Levels</Text>
				<TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
					<Text style={styles.addButtonText}>+ Add Level</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{levels.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>No Levels Created</Text>
						<Text style={styles.emptyDescription}>
							Create your first learning level to get started with content
							management.
						</Text>
						<TouchableOpacity
							style={styles.emptyAction}
							onPress={openCreateModal}
						>
							<Text style={styles.emptyActionText}>Create First Level</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.levelsContainer}>
						{levels.map((level) => (
							<LevelCard key={level.id} level={level} />
						))}
					</View>
				)}
			</ScrollView>

			{/* Create/Edit Modal */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setModalVisible(false)}>
							<Text style={styles.modalCancel}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{editingLevel ? "Edit Level" : "Create Level"}
						</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text style={styles.modalSave}>Save</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Level Name *</Text>
							<TextInput
								style={styles.formInput}
								value={formData.name}
								onChangeText={(text) =>
									setFormData({ ...formData, name: text })
								}
								placeholder="e.g., Beginner, Intermediate"
								maxLength={50}
							/>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Description</Text>
							<TextInput
								style={[styles.formInput, styles.formTextArea]}
								value={formData.description}
								onChangeText={(text) =>
									setFormData({ ...formData, description: text })
								}
								placeholder="Describe what students will learn at this level"
								multiline
								numberOfLines={4}
								maxLength={500}
							/>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Order Index</Text>
							<TextInput
								style={styles.formInput}
								value={formData.order_index.toString()}
								onChangeText={(text) => {
									const num = parseInt(text) || 0;
									setFormData({ ...formData, order_index: num });
								}}
								placeholder="1"
								keyboardType="numeric"
							/>
							<Text style={styles.formHint}>
								Determines the order in which levels appear to students
							</Text>
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
		fontSize: theme.typography.body.fontSize,
		color: theme.colors.textSecondary,
	},
	header: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.lg,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
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
	addButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.xl,
		paddingVertical: theme.spacing.md,
		borderRadius: theme.borderRadius.medium,
		minWidth: 120,
	},
	addButtonText: {
		color: theme.colors.white,
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	content: {
		flex: 1,
	},
	levelsContainer: {
		padding: theme.spacing.lg,
		gap: theme.spacing.md,
	},
	levelCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.medium,
		padding: theme.spacing.lg,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	levelHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
	},
	levelInfo: {
		flex: 1,
	},
	levelName: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	levelOrder: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	levelActions: {
		flexDirection: "row",
		gap: theme.spacing.sm,
	},
	actionButton: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.borderRadius.small,
	},
	editButton: {
		backgroundColor: "#E3F2FD",
	},
	editButtonText: {
		color: "#1976D2",
		fontSize: 12,
		fontWeight: "600",
	},
	deleteButton: {
		backgroundColor: "#FFEBEE",
	},
	deleteButtonText: {
		color: "#D32F2F",
		fontSize: 12,
		fontWeight: "600",
	},
	levelDescription: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
		marginBottom: theme.spacing.md,
	},
	levelMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		paddingTop: theme.spacing.sm,
	},
	levelMetaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.xl,
		minHeight: 400,
	},
	emptyTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	emptyDescription: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: theme.spacing.xl,
	},
	emptyAction: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: theme.borderRadius.medium,
	},
	emptyActionText: {
		color: theme.colors.white,
		fontWeight: "600",
		fontSize: 16,
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
	modalCancel: {
		color: theme.colors.textSecondary,
		fontSize: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	modalSave: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: "600",
	},
	modalContent: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	formGroup: {
		marginBottom: theme.spacing.lg,
	},
	formLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	formInput: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.borderRadius.medium,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: 16,
		color: theme.colors.text,
	},
	formTextArea: {
		height: 100,
		textAlignVertical: "top",
	},
	formHint: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginTop: theme.spacing.xs,
	},
});
