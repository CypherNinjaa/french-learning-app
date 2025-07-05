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
	LearningBook,
	DifficultyLevel,
	CreateBookDto,
	UpdateBookDto,
} from "../../types/LearningTypes";

interface BookManagementScreenProps {
	navigation: any;
}

interface BookFormData {
	title: string;
	description: string;
	difficulty_level: DifficultyLevel;
	estimated_duration_hours: number;
	tags: string;
	learning_objectives: string;
	prerequisites: string;
}

export const BookManagementScreen: React.FC<BookManagementScreenProps> = ({
	navigation,
}) => {
	const { user, isAdmin } = useAuth();
	const [books, setBooks] = useState<LearningBook[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingBook, setEditingBook] = useState<LearningBook | null>(null);
	const [formData, setFormData] = useState<BookFormData>({
		title: "",
		description: "",
		difficulty_level: "beginner" as DifficultyLevel,
		estimated_duration_hours: 1,
		tags: "",
		learning_objectives: "",
		prerequisites: "",
	});

	useEffect(() => {
		if (!isAdmin) {
			Alert.alert(
				"Access Denied",
				"You need admin privileges to access this section."
			);
			navigation.goBack();
			return;
		}
		loadBooks();
	}, [isAdmin]);

	const loadBooks = async () => {
		try {
			setLoading(true);
			const response = await LearningService.getBooks({
				limit: 100,
			});

			if (response.success && response.data) {
				setBooks(response.data);
			}
		} catch (error) {
			console.error("Error loading books:", error);
			Alert.alert("Error", "Failed to load books.");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			difficulty_level: "beginner",
			estimated_duration_hours: 1,
			tags: "",
			learning_objectives: "",
			prerequisites: "",
		});
		setEditingBook(null);
	};

	const openCreateModal = () => {
		console.log("Opening create modal");
		resetForm();
		setShowModal(true);
	};

	const openEditModal = (book: LearningBook) => {
		setFormData({
			title: book.title,
			description: book.description || "",
			difficulty_level: book.difficulty_level,
			estimated_duration_hours: book.estimated_duration_hours,
			tags: book.tags?.join(", ") || "",
			learning_objectives: book.learning_objectives?.join("\n") || "",
			prerequisites: book.prerequisites?.join(", ") || "",
		});
		setEditingBook(book);
		setShowModal(true);
	};

	const handleSave = async () => {
		console.log("Attempting to save book with data:", formData);

		if (!formData.title.trim()) {
			Alert.alert("Error", "Please enter a book title.");
			return;
		}

		try {
			const bookData = {
				title: formData.title.trim(),
				description: formData.description.trim() || undefined,
				difficulty_level: formData.difficulty_level,
				estimated_duration_hours: formData.estimated_duration_hours,
				tags: formData.tags
					? formData.tags
							.split(",")
							.map((t) => t.trim())
							.filter((t) => t)
					: [],
				learning_objectives: formData.learning_objectives
					? formData.learning_objectives
							.split("\n")
							.map((o) => o.trim())
							.filter((o) => o)
					: [],
				prerequisites: formData.prerequisites
					? formData.prerequisites
							.split(",")
							.map((p) => p.trim())
							.filter((p) => p)
					: [],
				is_published: true,
				is_active: true,
				order_index: books.length,
			};

			let response;
			if (editingBook) {
				response = await LearningService.updateBook(
					editingBook.id,
					bookData as UpdateBookDto
				);
			} else {
				response = await LearningService.createBook(bookData as CreateBookDto);
			}

			if (response.success) {
				Alert.alert(
					"Success",
					`Book ${editingBook ? "updated" : "created"} successfully!`,
					[{ text: "OK", onPress: () => setShowModal(false) }]
				);
				loadBooks();
			} else {
				Alert.alert("Error", response.error || "Failed to save book.");
			}
		} catch (error) {
			console.error("Error saving book:", error);
			Alert.alert("Error", "Failed to save book.");
		}
	};

	const handleDelete = (book: LearningBook) => {
		Alert.alert(
			"Delete Book",
			`Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const response = await LearningService.deleteBook(book.id);
							if (response.success) {
								Alert.alert("Success", "Book deleted successfully!");
								loadBooks();
							} else {
								Alert.alert(
									"Error",
									response.error || "Failed to delete book."
								);
							}
						} catch (error) {
							console.error("Error deleting book:", error);
							Alert.alert("Error", "Failed to delete book.");
						}
					},
				},
			]
		);
	};

	const handleTogglePublish = async (book: LearningBook) => {
		try {
			const response = await LearningService.updateBook(book.id, {
				is_published: !book.is_published,
			});

			if (response.success) {
				Alert.alert(
					"Success",
					`Book ${
						book.is_published ? "unpublished" : "published"
					} successfully!`
				);
				loadBooks();
			} else {
				Alert.alert("Error", response.error || "Failed to update book.");
			}
		} catch (error) {
			console.error("Error updating book:", error);
			Alert.alert("Error", "Failed to update book.");
		}
	};

	const renderBookCard = (book: LearningBook) => (
		<View key={book.id} style={styles.bookCard}>
			<View style={styles.bookHeader}>
				<View style={styles.bookInfo}>
					<Text style={styles.bookTitle}>{book.title}</Text>
					<Text style={styles.bookMeta}>
						{book.difficulty_level} • {book.estimated_duration_hours}h
					</Text>
					{book.description && (
						<Text style={styles.bookDescription} numberOfLines={2}>
							{book.description}
						</Text>
					)}
				</View>

				<View style={styles.bookActions}>
					<TouchableOpacity
						style={[
							styles.actionBtn,
							{
								backgroundColor: book.is_published
									? theme.colors.warning
									: theme.colors.success,
							},
						]}
						onPress={() => handleTogglePublish(book)}
					>
						<Ionicons
							name={book.is_published ? "eye-off" : "eye"}
							size={16}
							color="white"
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.actionBtn,
							{ backgroundColor: theme.colors.primary },
						]}
						onPress={() => openEditModal(book)}
					>
						<Ionicons name="pencil" size={16} color="white" />
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
						onPress={() => handleDelete(book)}
					>
						<Ionicons name="trash" size={16} color="white" />
					</TouchableOpacity>
				</View>
			</View>

			{book.tags && book.tags.length > 0 && (
				<View style={styles.tagsContainer}>
					{book.tags.map((tag, index) => (
						<View key={index} style={styles.tag}>
							<Text style={styles.tagText}>{tag}</Text>
						</View>
					))}
				</View>
			)}

			{/* Manage Lessons Button - PROMINENT */}
			<TouchableOpacity
				style={styles.manageLessonsBtn}
				onPress={() => {
					console.log("Navigating to LessonManagement with bookId:", book.id);
					navigation.navigate("LessonManagement", { bookId: book.id });
				}}
			>
				<View style={styles.lessonsButtonContent}>
					<Ionicons
						name="book-outline"
						size={20}
						color={theme.colors.primary}
					/>
					<Text style={styles.manageLessonsBtnText}>📚 MANAGE LESSONS</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={18}
					color={theme.colors.primary}
				/>
			</TouchableOpacity>

			{/* Quick Add Lesson Button */}
			<TouchableOpacity
				style={styles.quickAddLessonBtn}
				onPress={() => {
					console.log("Quick add lesson for book:", book.id);
					// Navigate directly to lesson creation
					navigation.navigate("LessonManagement", {
						bookId: book.id,
						createNew: true,
					});
				}}
			>
				<Ionicons name="add-circle" size={16} color="white" />
				<Text style={styles.quickAddLessonText}>+ ADD LESSON</Text>
			</TouchableOpacity>
		</View>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading books...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Book Management</Text>
				<TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
					<Ionicons name="add" size={20} color="white" />
					<Text style={styles.addButtonText}>New</Text>
				</TouchableOpacity>
			</View>

			{/* Books List */}
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
			>
				{books.length > 0 ? (
					books.map(renderBookCard)
				) : (
					<View style={styles.emptyState}>
						<Ionicons
							name="library-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyStateTitle}>No books yet</Text>
						<Text style={styles.emptyStateText}>
							Create your first book to get started!
						</Text>
						<TouchableOpacity
							style={styles.emptyStateButton}
							onPress={openCreateModal}
						>
							<Ionicons name="add" size={20} color="white" />
							<Text style={styles.emptyStateButtonText}>Create First Book</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>

			{/* Create/Edit Modal */}
			<Modal
				visible={showModal}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowModal(false)}>
							<Text style={styles.cancelBtn}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{editingBook ? "Edit Book" : "Create Book"}
						</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text style={styles.saveBtn}>Save</Text>
						</TouchableOpacity>
					</View>
					<ScrollView
						style={styles.modalContent}
						contentContainerStyle={styles.modalScrollContent}
						showsVerticalScrollIndicator={false}
					>
						{/* Title */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>Title *</Text>
							<TextInput
								style={styles.input}
								value={formData.title}
								onChangeText={(text) =>
									setFormData({ ...formData, title: text })
								}
								placeholder="Enter book title"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						{/* Description */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>Description</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={formData.description}
								onChangeText={(text) =>
									setFormData({ ...formData, description: text })
								}
								placeholder="Enter book description"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={4}
							/>
						</View>

						{/* Difficulty Level */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>Difficulty Level</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.difficulty_level}
									onValueChange={(value) =>
										setFormData({ ...formData, difficulty_level: value })
									}
									style={styles.picker}
								>
									<Picker.Item label="Beginner" value="beginner" />
									<Picker.Item label="Intermediate" value="intermediate" />
									<Picker.Item label="Advanced" value="advanced" />
								</Picker>
							</View>
						</View>

						{/* Duration */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>Estimated Duration (hours)</Text>
							<TextInput
								style={styles.input}
								value={formData.estimated_duration_hours.toString()}
								onChangeText={(text) =>
									setFormData({
										...formData,
										estimated_duration_hours: parseInt(text) || 1,
									})
								}
								placeholder="1"
								placeholderTextColor={theme.colors.textSecondary}
								keyboardType="numeric"
							/>
						</View>

						{/* Tags */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>Tags (comma-separated)</Text>
							<TextInput
								style={styles.input}
								value={formData.tags}
								onChangeText={(text) =>
									setFormData({ ...formData, tags: text })
								}
								placeholder="grammar, vocabulary, conversation"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						{/* Learning Objectives */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>
								Learning Objectives (one per line)
							</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={formData.learning_objectives}
								onChangeText={(text) =>
									setFormData({ ...formData, learning_objectives: text })
								}
								placeholder="Learn basic French greetings&#10;Understand present tense"
								placeholderTextColor={theme.colors.textSecondary}
								multiline
								numberOfLines={6}
							/>
						</View>

						{/* Prerequisites */}
						<View style={styles.formGroup}>
							<Text style={styles.label}>
								Prerequisites (comma-separated book IDs)
							</Text>
							<TextInput
								style={styles.input}
								value={formData.prerequisites}
								onChangeText={(text) =>
									setFormData({ ...formData, prerequisites: text })
								}
								placeholder="1, 2, 3"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>

			{/* Floating Action Button */}
			<FloatingActionButton icon="add" onPress={openCreateModal} />
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
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backBtn: {
		padding: 4,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		textAlign: "center",
	},
	addBtn: {
		padding: 4,
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	addButtonText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	content: {
		flex: 1,
		padding: 16,
	},
	bookCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 10,
		padding: 14,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	bookHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	bookInfo: {
		flex: 1,
		marginRight: 16,
	},
	bookTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 4,
	},
	bookMeta: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 8,
	},
	bookDescription: {
		fontSize: 14,
		color: theme.colors.text,
		lineHeight: 20,
	},
	bookActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 4,
		marginBottom: 6,
	},
	tag: {
		backgroundColor: theme.colors.primaryLight,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	tagText: {
		fontSize: 12,
		color: theme.colors.primary,
		fontWeight: "500",
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
	emptyState: {
		alignItems: "center",
		paddingVertical: 40,
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
	emptyStateButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		marginTop: 16,
		gap: 6,
	},
	emptyStateButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	// Modal Styles
	modalContainer: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	cancelBtn: {
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	saveBtn: {
		fontSize: 16,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	modalContent: {
		flex: 1,
		padding: 16,
	},
	formGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		color: theme.colors.text,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		color: theme.colors.text,
		backgroundColor: theme.colors.surface,
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		backgroundColor: theme.colors.surface,
	},
	picker: {
		color: theme.colors.text,
	},
	manageLessonsBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: theme.colors.primaryLight,
		borderRadius: 8,
		padding: 14,
		marginTop: 10,
		borderWidth: 2,
		borderColor: theme.colors.primary,
	},
	lessonsButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	manageLessonsBtnText: {
		fontSize: 16,
		fontWeight: "700",
		color: theme.colors.primary,
		marginLeft: 8,
		textTransform: "uppercase",
	},
	quickAddLessonBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.success,
		borderRadius: 6,
		padding: 10,
		marginTop: 8,
		gap: 6,
	},
	quickAddLessonText: {
		fontSize: 12,
		fontWeight: "600",
		color: "white",
	},
	fab: {
		position: "absolute",
		bottom: 16,
		right: 16,
	},
	scrollViewContent: {
		paddingBottom: 80, // Add bottom padding for FAB
	},
	modalScrollContent: {
		paddingBottom: 20, // Add bottom padding to modal
	},
});
