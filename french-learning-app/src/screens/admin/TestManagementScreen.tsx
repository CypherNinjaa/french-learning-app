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
	QuestionType,
	CreateTestDto,
	CreateQuestionDto,
	LearningLesson,
} from "../../types/LearningTypes";

interface TestManagementScreenProps {
	navigation: any;
}

interface TestFormData {
	lesson_id: number;
	title: string;
	description: string;
	passing_percentage: number;
	randomize_questions: boolean;
	show_correct_answers: boolean;
}

interface QuestionFormData {
	test_id: number;
	question_text: string;
	question_type: QuestionType;
	options: string[];
	correct_answer: string;
	explanation: string;
	points: number;
}

export const TestManagementScreen: React.FC<TestManagementScreenProps> = ({
	navigation,
}) => {
	const { user, isAdmin } = useAuth();
	const [tests, setTests] = useState<LessonTest[]>([]);
	const [lessons, setLessons] = useState<LearningLesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [showTestModal, setShowTestModal] = useState(false);
	const [showQuestionModal, setShowQuestionModal] = useState(false);
	const [selectedTest, setSelectedTest] = useState<LessonTest | null>(null);
	const [questions, setQuestions] = useState<TestQuestion[]>([]);

	const [testFormData, setTestFormData] = useState<TestFormData>({
		lesson_id: 0,
		title: "",
		description: "",
		passing_percentage: 70,
		randomize_questions: true,
		show_correct_answers: true,
	});

	const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
		test_id: 0,
		question_text: "",
		question_type: "multiple_choice",
		options: ["", "", "", ""],
		correct_answer: "",
		explanation: "",
		points: 1,
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
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load all lessons
			const lessonsResponse = await LearningService.getAllLessons();
			if (lessonsResponse.success && lessonsResponse.data) {
				setLessons(lessonsResponse.data);
			}

			// Load all tests
			const testsResponse = await LearningService.getAllTests();
			if (testsResponse.success && testsResponse.data) {
				setTests(testsResponse.data);
			}
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Failed to load data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTest = async () => {
		try {
			if (!testFormData.title.trim() || !testFormData.lesson_id) {
				Alert.alert("Error", "Please fill in all required fields.");
				return;
			}

			const createData: CreateTestDto = {
				lesson_id: testFormData.lesson_id,
				title: testFormData.title,
				description: testFormData.description,
				passing_percentage: testFormData.passing_percentage,
				randomize_questions: testFormData.randomize_questions,
				show_correct_answers: testFormData.show_correct_answers,
			};

			const response = await LearningService.createTest(createData);
			if (response.success) {
				Alert.alert("Success", "Test created successfully!");
				setShowTestModal(false);
				resetTestForm();
				loadData();
			} else {
				Alert.alert("Error", response.error || "Failed to create test");
			}
		} catch (error) {
			console.error("Error creating test:", error);
			Alert.alert("Error", "Failed to create test. Please try again.");
		}
	};

	const handleCreateQuestion = async () => {
		try {
			if (
				!questionFormData.question_text.trim() ||
				!questionFormData.correct_answer.trim()
			) {
				Alert.alert("Error", "Please fill in all required fields.");
				return;
			}

			// Convert string options to QuestionOption format
			const questionOptions =
				questionFormData.question_type === "multiple_choice"
					? questionFormData.options
							.filter((opt) => opt.trim() !== "")
							.map((opt, index) => ({
								text: opt,
								is_correct: opt === questionFormData.correct_answer,
							}))
					: questionFormData.question_type === "true_false"
					? [
							{
								text: "True",
								is_correct: questionFormData.correct_answer === "True",
							},
							{
								text: "False",
								is_correct: questionFormData.correct_answer === "False",
							},
					  ]
					: [];

			const createData: CreateQuestionDto = {
				test_id: questionFormData.test_id,
				question_text: questionFormData.question_text,
				question_type: questionFormData.question_type,
				options: questionOptions,
				correct_answer: questionFormData.correct_answer,
				explanation: questionFormData.explanation,
				points: questionFormData.points,
				order_index: questions.length + 1,
			};

			const response = await LearningService.createQuestion(createData);
			if (response.success) {
				Alert.alert("Success", "Question created successfully!");
				setShowQuestionModal(false);
				resetQuestionForm();
				if (selectedTest) {
					loadQuestionsForTest(selectedTest.id);
				}
			} else {
				Alert.alert("Error", response.error || "Failed to create question");
			}
		} catch (error) {
			console.error("Error creating question:", error);
			Alert.alert("Error", "Failed to create question. Please try again.");
		}
	};

	const loadQuestionsForTest = async (testId: number) => {
		try {
			const response = await LearningService.getTestQuestions(testId);
			if (response.success && response.data) {
				setQuestions(response.data);
			}
		} catch (error) {
			console.error("Error loading questions:", error);
		}
	};

	const resetTestForm = () => {
		setTestFormData({
			lesson_id: 0,
			title: "",
			description: "",
			passing_percentage: 70,
			randomize_questions: true,
			show_correct_answers: true,
		});
	};

	const resetQuestionForm = () => {
		setQuestionFormData({
			test_id: selectedTest?.id || 0,
			question_text: "",
			question_type: "multiple_choice",
			options: ["", "", "", ""],
			correct_answer: "",
			explanation: "",
			points: 1,
		});
	};

	const updateQuestionOption = (index: number, value: string) => {
		const newOptions = [...questionFormData.options];
		newOptions[index] = value;
		setQuestionFormData({ ...questionFormData, options: newOptions });
	};

	const renderTestModal = () => (
		<Modal
			visible={showTestModal}
			animationType="slide"
			presentationStyle="formSheet"
		>
			<SafeAreaView style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity onPress={() => setShowTestModal(false)}>
						<Ionicons name="close" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.modalTitle}>Create Test</Text>
					<TouchableOpacity onPress={handleCreateTest}>
						<Text style={styles.saveButton}>Save</Text>
					</TouchableOpacity>
				</View>

				<ScrollView
					style={styles.modalContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.formGroup}>
						<Text style={styles.label}>Lesson *</Text>
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
										label={`${lesson.title} (Book: ${lesson.book_id})`}
										value={lesson.id}
									/>
								))}
							</Picker>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Test Title *</Text>
						<TextInput
							style={styles.input}
							value={testFormData.title}
							onChangeText={(text) =>
								setTestFormData({ ...testFormData, title: text })
							}
							placeholder="Enter test title..."
							placeholderTextColor={theme.colors.textSecondary}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={testFormData.description}
							onChangeText={(text) =>
								setTestFormData({ ...testFormData, description: text })
							}
							placeholder="Enter test description..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={3}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>
							Passing Percentage: {testFormData.passing_percentage}%
						</Text>
						<View style={styles.passingPercentageContainer}>
							<Text style={styles.percentageLabel}>0%</Text>
							<View style={styles.sliderContainer}>
								<TouchableOpacity
									style={[
										styles.percentageButton,
										testFormData.passing_percentage === 50 &&
											styles.percentageButtonActive,
									]}
									onPress={() =>
										setTestFormData({ ...testFormData, passing_percentage: 50 })
									}
								>
									<Text
										style={[
											styles.percentageButtonText,
											testFormData.passing_percentage === 50 &&
												styles.percentageButtonTextActive,
										]}
									>
										50%
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.percentageButton,
										testFormData.passing_percentage === 60 &&
											styles.percentageButtonActive,
									]}
									onPress={() =>
										setTestFormData({ ...testFormData, passing_percentage: 60 })
									}
								>
									<Text
										style={[
											styles.percentageButtonText,
											testFormData.passing_percentage === 60 &&
												styles.percentageButtonTextActive,
										]}
									>
										60%
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.percentageButton,
										testFormData.passing_percentage === 70 &&
											styles.percentageButtonActive,
									]}
									onPress={() =>
										setTestFormData({ ...testFormData, passing_percentage: 70 })
									}
								>
									<Text
										style={[
											styles.percentageButtonText,
											testFormData.passing_percentage === 70 &&
												styles.percentageButtonTextActive,
										]}
									>
										70%
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.percentageButton,
										testFormData.passing_percentage === 80 &&
											styles.percentageButtonActive,
									]}
									onPress={() =>
										setTestFormData({ ...testFormData, passing_percentage: 80 })
									}
								>
									<Text
										style={[
											styles.percentageButtonText,
											testFormData.passing_percentage === 80 &&
												styles.percentageButtonTextActive,
										]}
									>
										80%
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.percentageButton,
										testFormData.passing_percentage === 90 &&
											styles.percentageButtonActive,
									]}
									onPress={() =>
										setTestFormData({ ...testFormData, passing_percentage: 90 })
									}
								>
									<Text
										style={[
											styles.percentageButtonText,
											testFormData.passing_percentage === 90 &&
												styles.percentageButtonTextActive,
										]}
									>
										90%
									</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.percentageLabel}>100%</Text>
						</View>
						<TextInput
							style={[styles.input, styles.customPercentageInput]}
							value={testFormData.passing_percentage.toString()}
							onChangeText={(text) => {
								const percentage = Math.max(
									0,
									Math.min(100, parseInt(text) || 70)
								);
								setTestFormData({
									...testFormData,
									passing_percentage: percentage,
								});
							}}
							placeholder="Custom percentage (0-100)"
							keyboardType="numeric"
							placeholderTextColor={theme.colors.textSecondary}
						/>
						<Text style={styles.helpText}>
							Students must achieve this percentage to pass the test and unlock
							the next lesson
						</Text>
					</View>

					<View style={styles.switchGroup}>
						<TouchableOpacity
							style={[
								styles.switchOption,
								testFormData.randomize_questions && styles.switchActive,
							]}
							onPress={() =>
								setTestFormData({
									...testFormData,
									randomize_questions: !testFormData.randomize_questions,
								})
							}
						>
							<Ionicons
								name={
									testFormData.randomize_questions
										? "checkmark-circle"
										: "radio-button-off"
								}
								size={20}
								color={
									testFormData.randomize_questions
										? theme.colors.primary
										: theme.colors.textSecondary
								}
							/>
							<Text style={styles.switchLabel}>Randomize Questions</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.switchOption,
								testFormData.show_correct_answers && styles.switchActive,
							]}
							onPress={() =>
								setTestFormData({
									...testFormData,
									show_correct_answers: !testFormData.show_correct_answers,
								})
							}
						>
							<Ionicons
								name={
									testFormData.show_correct_answers
										? "checkmark-circle"
										: "radio-button-off"
								}
								size={20}
								color={
									testFormData.show_correct_answers
										? theme.colors.primary
										: theme.colors.textSecondary
								}
							/>
							<Text style={styles.switchLabel}>Show Correct Answers</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</Modal>
	);

	const renderQuestionModal = () => (
		<Modal
			visible={showQuestionModal}
			animationType="slide"
			presentationStyle="formSheet"
		>
			<SafeAreaView style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity onPress={() => setShowQuestionModal(false)}>
						<Ionicons name="close" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.modalTitle}>Add Question</Text>
					<TouchableOpacity onPress={handleCreateQuestion}>
						<Text style={styles.saveButton}>Save</Text>
					</TouchableOpacity>
				</View>

				<ScrollView
					style={styles.modalContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.formGroup}>
						<Text style={styles.label}>Question Type</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={questionFormData.question_type}
								onValueChange={(value) =>
									setQuestionFormData({
										...questionFormData,
										question_type: value,
										options:
											value === "true_false"
												? ["True", "False"]
												: value === "fill_blank"
												? []
												: ["", "", "", ""],
									})
								}
								style={styles.picker}
							>
								<Picker.Item label="Multiple Choice" value="multiple_choice" />
								<Picker.Item label="True/False" value="true_false" />
								<Picker.Item label="Fill in the Blank" value="fill_blank" />
							</Picker>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Question Text *</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={questionFormData.question_text}
							onChangeText={(text) =>
								setQuestionFormData({
									...questionFormData,
									question_text: text,
								})
							}
							placeholder="Enter your question..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={3}
						/>
					</View>

					{questionFormData.question_type === "multiple_choice" && (
						<View style={styles.formGroup}>
							<Text style={styles.label}>Answer Options</Text>
							{questionFormData.options.map((option, index) => (
								<TextInput
									key={index}
									style={[styles.input, { marginBottom: 8 }]}
									value={option}
									onChangeText={(text) => updateQuestionOption(index, text)}
									placeholder={`Option ${index + 1}...`}
									placeholderTextColor={theme.colors.textSecondary}
								/>
							))}
						</View>
					)}

					<View style={styles.formGroup}>
						<Text style={styles.label}>Correct Answer *</Text>
						<TextInput
							style={styles.input}
							value={questionFormData.correct_answer}
							onChangeText={(text) =>
								setQuestionFormData({
									...questionFormData,
									correct_answer: text,
								})
							}
							placeholder="Enter the correct answer..."
							placeholderTextColor={theme.colors.textSecondary}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Explanation</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={questionFormData.explanation}
							onChangeText={(text) =>
								setQuestionFormData({ ...questionFormData, explanation: text })
							}
							placeholder="Explain why this is the correct answer..."
							placeholderTextColor={theme.colors.textSecondary}
							multiline
							numberOfLines={3}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Points</Text>
						<TextInput
							style={styles.input}
							value={questionFormData.points.toString()}
							onChangeText={(text) =>
								setQuestionFormData({
									...questionFormData,
									points: parseInt(text) || 1,
								})
							}
							placeholder="1"
							keyboardType="numeric"
							placeholderTextColor={theme.colors.textSecondary}
						/>
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
					<Text style={styles.loadingText}>Loading tests...</Text>
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
				<Text style={styles.headerTitle}>Test Management</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => {
						resetTestForm();
						setShowTestModal(true);
					}}
				>
					<Ionicons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{tests.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name="document-text-outline"
							size={64}
							color={theme.colors.textSecondary}
						/>
						<Text style={styles.emptyStateTitle}>No tests yet</Text>
						<Text style={styles.emptyStateText}>
							Create your first test to get started
						</Text>
					</View>
				) : (
					tests.map((test) => (
						<TouchableOpacity
							key={test.id}
							style={styles.testCard}
							onPress={() => {
								setSelectedTest(test);
								loadQuestionsForTest(test.id);
							}}
						>
							<View style={styles.testHeader}>
								<Text style={styles.testTitle}>{test.title}</Text>
								<View style={styles.passingBadge}>
									<Text style={styles.passingBadgeText}>
										{test.passing_percentage}%
									</Text>
								</View>
								<TouchableOpacity
									style={styles.addQuestionButton}
									onPress={() => {
										setSelectedTest(test);
										setQuestionFormData({
											...questionFormData,
											test_id: test.id,
										});
										setShowQuestionModal(true);
									}}
								>
									<Ionicons
										name="add-circle"
										size={20}
										color={theme.colors.primary}
									/>
								</TouchableOpacity>
							</View>
							<Text style={styles.testDescription}>{test.description}</Text>
							<View style={styles.testMeta}>
								<Text style={styles.testMetaText}>
									Required to pass: {test.passing_percentage}% • Questions:{" "}
									{test.question_count || 0}
								</Text>
								<Text style={styles.testMetaSubtext}>
									Students must achieve this score to unlock the next lesson
								</Text>
							</View>
						</TouchableOpacity>
					))
				)}
			</ScrollView>

			{/* Show selected test questions */}
			{selectedTest && questions.length > 0 && (
				<View style={styles.questionsSection}>
					<Text style={styles.questionsTitle}>
						Questions for "{selectedTest.title}"
					</Text>
					{questions.map((question, index) => (
						<View key={question.id} style={styles.questionCard}>
							<Text style={styles.questionNumber}>Q{index + 1}</Text>
							<Text style={styles.questionText}>{question.question_text}</Text>
							<Text style={styles.questionType}>{question.question_type}</Text>
						</View>
					))}
				</View>
			)}

			{renderTestModal()}
			{renderQuestionModal()}

			{/* Floating Action Button */}
			<FloatingActionButton
				icon="help-circle"
				onPress={() => setShowTestModal(true)}
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
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
		textAlign: "center",
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
	testCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		marginVertical: 8,
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
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
	},
	addQuestionButton: {
		padding: 4,
	},
	testDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 8,
		lineHeight: 20,
	},
	testMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	testMetaText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	questionsSection: {
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		padding: 20,
		maxHeight: 300,
	},
	questionsTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 12,
	},
	questionCard: {
		backgroundColor: theme.colors.background,
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	questionNumber: {
		fontSize: 12,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginRight: 8,
		width: 30,
	},
	questionText: {
		fontSize: 14,
		color: theme.colors.text,
		flex: 1,
	},
	questionType: {
		fontSize: 10,
		color: theme.colors.textSecondary,
		textTransform: "uppercase",
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
	switchGroup: {
		marginBottom: 20,
	},
	switchOption: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: theme.colors.surface,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	switchActive: {
		borderColor: theme.colors.primary,
		backgroundColor: `${theme.colors.primary}10`,
	},
	switchLabel: {
		fontSize: 14,
		color: theme.colors.text,
		marginLeft: 8,
	},
	// New percentage control styles
	passingPercentageContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
		marginBottom: 12,
	},
	percentageLabel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		minWidth: 30,
	},
	sliderContainer: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 12,
		gap: 8,
	},
	percentageButton: {
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.border,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		minWidth: 50,
		alignItems: "center",
	},
	percentageButtonActive: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	percentageButtonText: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.text,
	},
	percentageButtonTextActive: {
		color: "white",
	},
	customPercentageInput: {
		marginTop: 8,
		textAlign: "center",
	},
	helpText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 4,
		fontStyle: "italic",
	},
	// Badge styles for test cards
	passingBadge: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginHorizontal: 8,
	},
	passingBadgeText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "white",
	},
	testMetaSubtext: {
		fontSize: 10,
		color: theme.colors.textSecondary,
		marginTop: 2,
		fontStyle: "italic",
	},
});
