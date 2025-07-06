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
	LessonTest,
	TestQuestion,
	LearningLesson,
	CreateTestDto,
	UpdateTestDto,
	CreateQuestionDto,
	UpdateQuestionDto,
	QuestionType,
} from "../../types/LearningTypes";

interface TestManagementScreenProps {
	navigation: any;
	route: {
		params: {
			lessonId?: number;
			createNew?: boolean;
		};
	};
}

interface TestFormData {
	lesson_id: number;
	title: string;
	question_count: number;
	passing_percentage: number;
}

interface QuestionFormData {
	test_id: number;
	question_text: string;
	question_type: QuestionType;
	options: string[];
	correct_answer: string;
	explanation?: string;
	points: number;
	order_index: number;
}

export const TestManagementScreen: React.FC<TestManagementScreenProps> = ({
	navigation,
	route,
}) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [tests, setTests] = useState<LessonTest[]>([]);
	const [lessons, setLessons] = useState<LearningLesson[]>([]);
	const [showTestModal, setShowTestModal] = useState(false);
	const [showQuestionModal, setShowQuestionModal] = useState(false);
	const [editingTest, setEditingTest] = useState<LessonTest | null>(null);
	const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(
		null
	);
	const [selectedTest, setSelectedTest] = useState<LessonTest | null>(null);
	const [testFormData, setTestFormData] = useState<TestFormData>({
		lesson_id: route.params?.lessonId || 0,
		title: "",
		question_count: 5,
		passing_percentage: 65,
	});
	const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
		test_id: 0,
		question_text: "",
		question_type: "multiple_choice",
		options: ["", "", "", ""],
		correct_answer: "",
		explanation: "",
		points: 1,
		order_index: 0,
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			console.log("📚 [TestManagementScreen] Loading tests and lessons...");

			// Load all tests
			const testsResponse = await LearningService.getAllTests();
			if (testsResponse.success && testsResponse.data) {
				setTests(testsResponse.data);
				console.log(
					`✅ [TestManagementScreen] Loaded ${testsResponse.data.length} tests`
				);
			} else {
				console.error(
					"❌ [TestManagementScreen] Failed to load tests:",
					testsResponse.error
				);
			}

			// Load all lessons for test creation
			const lessonsResponse = await LearningService.getAllLessons();
			if (lessonsResponse.success && lessonsResponse.data) {
				setLessons(lessonsResponse.data);
				console.log(
					`✅ [TestManagementScreen] Loaded ${lessonsResponse.data.length} lessons`
				);
			} else {
				console.error(
					"❌ [TestManagementScreen] Failed to load lessons:",
					lessonsResponse.error
				);
			}
		} catch (error) {
			console.error("❌ [TestManagementScreen] Error loading data:", error);
			Alert.alert("Error", "Failed to load data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTest = async () => {
		try {
			console.log("📝 [TestManagementScreen] Creating test...");

			const testData: CreateTestDto = {
				lesson_id: testFormData.lesson_id,
				title: testFormData.title,
				question_count: testFormData.question_count,
				passing_percentage: testFormData.passing_percentage,
			};

			const response = await LearningService.createTest(testData);

			if (response.success) {
				console.log("✅ [TestManagementScreen] Test created successfully");
				Alert.alert("Success", "Test created successfully!");
				setShowTestModal(false);
				resetTestForm();
				loadData();
			} else {
				console.error(
					"❌ [TestManagementScreen] Failed to create test:",
					response.error
				);
				Alert.alert("Error", response.error || "Failed to create test");
			}
		} catch (error) {
			console.error("❌ [TestManagementScreen] Error creating test:", error);
			Alert.alert("Error", "Failed to create test. Please try again.");
		}
	};

	const handleUpdateTest = async () => {
		if (!editingTest) return;

		try {
			console.log("📝 [TestManagementScreen] Updating test...");

			const updateData: UpdateTestDto = {
				title: testFormData.title,
				question_count: testFormData.question_count,
				passing_percentage: testFormData.passing_percentage,
			};

			const response = await LearningService.updateTest(
				editingTest.id,
				updateData
			);

			if (response.success) {
				console.log("✅ [TestManagementScreen] Test updated successfully");
				Alert.alert("Success", "Test updated successfully!");
				setShowTestModal(false);
				setEditingTest(null);
				resetTestForm();
				loadData();
			} else {
				console.error(
					"❌ [TestManagementScreen] Failed to update test:",
					response.error
				);
				Alert.alert("Error", response.error || "Failed to update test");
			}
		} catch (error) {
			console.error("❌ [TestManagementScreen] Error updating test:", error);
			Alert.alert("Error", "Failed to update test. Please try again.");
		}
	};

	const handleDeleteTest = async (testId: number) => {
		Alert.alert(
			"Delete Test",
			"Are you sure you want to delete this test? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							console.log("🗑️ [TestManagementScreen] Deleting test...");
							const response = await LearningService.deleteTest(testId);

							if (response.success) {
								console.log(
									"✅ [TestManagementScreen] Test deleted successfully"
								);
								Alert.alert("Success", "Test deleted successfully!");
								loadData();
							} else {
								console.error(
									"❌ [TestManagementScreen] Failed to delete test:",
									response.error
								);
								Alert.alert("Error", response.error || "Failed to delete test");
							}
						} catch (error) {
							console.error(
								"❌ [TestManagementScreen] Error deleting test:",
								error
							);
							Alert.alert("Error", "Failed to delete test. Please try again.");
						}
					},
				},
			]
		);
	};

	const resetTestForm = () => {
		setTestFormData({
			lesson_id: route.params?.lessonId || 0,
			title: "",
			question_count: 5,
			passing_percentage: 65,
		});
	};

	const openTestModal = (test?: LessonTest) => {
		if (test) {
			setEditingTest(test);
			setTestFormData({
				lesson_id: test.lesson_id,
				title: test.title,
				question_count: test.question_count,
				passing_percentage: test.passing_percentage,
			});
		} else {
			setEditingTest(null);
			resetTestForm();
		}
		setShowTestModal(true);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading tests...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.title}>Test Management</Text>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{tests.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name="clipboard-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyStateTitle}>No tests yet</Text>
						<Text style={styles.emptyStateDescription}>
							Create your first test for a lesson
						</Text>
					</View>
				) : (
					<View style={styles.testList}>
						{tests.map((test) => (
							<View key={test.id} style={styles.testCard}>
								<View style={styles.testHeader}>
									<Text style={styles.testTitle}>{test.title}</Text>
									<View style={styles.testActions}>
										<TouchableOpacity
											style={styles.actionButton}
											onPress={() => openTestModal(test)}
										>
											<Ionicons
												name="pencil"
												size={20}
												color={theme.colors.primary}
											/>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.actionButton}
											onPress={() => handleDeleteTest(test.id)}
										>
											<Ionicons
												name="trash"
												size={20}
												color={theme.colors.error}
											/>
										</TouchableOpacity>
									</View>
								</View>
								<Text style={styles.testInfo}>
									Lesson: {test.lesson?.title || "Unknown"}
								</Text>
								<Text style={styles.testInfo}>
									Questions: {test.question_count} | Pass:{" "}
									{test.passing_percentage}%
								</Text>
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* Test Form Modal */}
			<Modal
				visible={showTestModal}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity
							style={styles.modalCloseButton}
							onPress={() => {
								setShowTestModal(false);
								setEditingTest(null);
								resetTestForm();
							}}
						>
							<Ionicons name="close" size={24} color={theme.colors.text} />
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{editingTest ? "Edit Test" : "Create Test"}
						</Text>
						<TouchableOpacity
							style={styles.modalSaveButton}
							onPress={editingTest ? handleUpdateTest : handleCreateTest}
						>
							<Text style={styles.modalSaveButtonText}>
								{editingTest ? "Update" : "Create"}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Lesson</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={testFormData.lesson_id}
									onValueChange={(value) =>
										setTestFormData({ ...testFormData, lesson_id: value })
									}
									style={styles.picker}
								>
									<Picker.Item label="Select a lesson..." value={0} />
									{lessons.map((lesson) => (
										<Picker.Item
											key={lesson.id}
											label={`${lesson.book?.title || "Unknown Book"} - ${
												lesson.title
											}`}
											value={lesson.id}
										/>
									))}
								</Picker>
							</View>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Test Title</Text>
							<TextInput
								style={styles.textInput}
								value={testFormData.title}
								onChangeText={(text) =>
									setTestFormData({ ...testFormData, title: text })
								}
								placeholder="Enter test title..."
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Number of Questions</Text>
							<TextInput
								style={styles.textInput}
								value={testFormData.question_count.toString()}
								onChangeText={(text) =>
									setTestFormData({
										...testFormData,
										question_count: parseInt(text) || 0,
									})
								}
								placeholder="5"
								keyboardType="numeric"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Passing Percentage</Text>
							<TextInput
								style={styles.textInput}
								value={testFormData.passing_percentage.toString()}
								onChangeText={(text) =>
									setTestFormData({
										...testFormData,
										passing_percentage: parseInt(text) || 0,
									})
								}
								placeholder="65"
								keyboardType="numeric"
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>

			<FloatingActionButton
				onPress={() => openTestModal()}
				icon="add"
				style={styles.fab}
			/>
		</SafeAreaView>
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
		marginTop: 16,
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
	},
	backButton: {
		marginRight: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: theme.colors.text,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyStateTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginTop: 16,
	},
	emptyStateDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 8,
	},
	testList: {
		gap: 12,
	},
	testCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	testHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	testTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		flex: 1,
	},
	testActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: theme.colors.background,
	},
	testInfo: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 4,
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
		backgroundColor: theme.colors.surface,
	},
	modalCloseButton: {
		padding: 4,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
	},
	modalSaveButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: theme.colors.primary,
		borderRadius: 8,
	},
	modalSaveButtonText: {
		color: theme.colors.surface,
		fontWeight: "600",
	},
	modalContent: {
		flex: 1,
		padding: 20,
	},
	formGroup: {
		marginBottom: 24,
	},
	formLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	textInput: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: theme.colors.text,
		backgroundColor: theme.colors.surface,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		backgroundColor: theme.colors.surface,
	},
	picker: {
		height: 50,
	},
	fab: {
		position: "absolute",
		bottom: 24,
		right: 24,
	},
});
