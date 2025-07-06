import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Dimensions,
	TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { LearningService } from "../services/LearningService";
import {
	LocalTestService,
	LocalTestAttempt,
} from "../services/LocalTestService";
import { supabase } from "../services/supabase";
import {
	LessonTest,
	TestQuestion,
	QuestionType,
	TestAttempt,
} from "../types/LearningTypes";

const { width } = Dimensions.get("window");

interface LessonTestScreenProps {
	navigation: any;
	route: {
		params: {
			lessonId: number;
			bookId: number;
		};
	};
}

export const LessonTestScreen: React.FC<LessonTestScreenProps> = ({
	navigation,
	route,
}) => {
	const { lessonId, bookId } = route.params;
	const { user } = useAuth();

	const [test, setTest] = useState<LessonTest | null>(null);
	const [questions, setQuestions] = useState<TestQuestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
	const [showResults, setShowResults] = useState(false);
	const [score, setScore] = useState(0);
	const [testCompleted, setTestCompleted] = useState(false);
	const [testAttempt, setTestAttempt] = useState<LocalTestAttempt | null>(null);
	const [startTime, setStartTime] = useState<Date>(new Date());

	useEffect(() => {
		loadTest();
	}, [lessonId]);

	const loadTest = async () => {
		try {
			setLoading(true);
			const response = await LearningService.getLessonTests(lessonId);

			if (response.success && response.data && response.data.length > 0) {
				const testData = response.data[0]; // Get the first test for this lesson
				setTest(testData);

				// Load questions for this test
				const questionsResponse = await LearningService.getTestQuestions(
					testData.id
				);
				if (questionsResponse.success && questionsResponse.data) {
					setQuestions(questionsResponse.data);

					// Create a local test attempt
					if (user?.id) {
						await createLocalTestAttempt(testData.id);
					}
				}
			}
		} catch (error) {
			console.error("Error loading test:", error);
			Alert.alert("Error", "Failed to load test. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const createLocalTestAttempt = async (testId: number) => {
		try {
			// Initialize first lesson access
			await LocalTestService.initializeFirstLesson(user!.id, bookId);

			// Create local test attempt
			const attempt = await LocalTestService.startTest(
				user!.id,
				lessonId,
				testId
			);
			console.log("Local test attempt created successfully:", attempt);
			setTestAttempt(attempt);
			setStartTime(new Date());
		} catch (error) {
			console.error("Error creating local test attempt:", error);
			Alert.alert("Error", "Failed to start test. Please try again.");
		}
	};

	const handleAnswer = (answer: string) => {
		console.log(
			`Setting answer for question index ${currentQuestionIndex}: ${answer}`
		);
		setUserAnswers((prev) => ({
			...prev,
			[currentQuestionIndex]: answer,
		}));
	};

	const nextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			submitTest();
		}
	};

	const previousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const submitTest = async () => {
		if (!user?.id || !testAttempt || !test) {
			Alert.alert("Error", "Cannot submit test. Please try again.");
			return;
		}

		try {
			setLoading(true);

			// Prepare answers in the required format
			const formattedAnswers = [];

			// Loop through all questions to ensure we have an answer for each
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				const userAnswer = userAnswers[i] || ""; // Get answer or empty string if not answered

				formattedAnswers.push({
					questionId: question.id,
					userAnswer: userAnswer,
				});

				console.log(
					`Question ${i + 1} (ID: ${
						question.id
					}): User answered "${userAnswer}"`
				);
			}

			// Calculate time taken in minutes
			const endTime = new Date();
			const timeElapsed =
				(endTime.getTime() - startTime.getTime()) / (1000 * 60); // convert ms to minutes

			// Log debug info
			console.log("Submitting local test attempt:", {
				attempt_id: testAttempt.id,
				answers_count: formattedAnswers.length,
				time_taken_minutes: timeElapsed,
			});

			// Submit test using LocalTestService
			const completedAttempt = await LocalTestService.submitTest(
				testAttempt.id,
				formattedAnswers,
				questions,
				test.passing_percentage,
				timeElapsed
			);

			setScore(completedAttempt.score);
			setShowResults(true);
			setTestCompleted(true);
			console.log(
				`Local test completed: ${completedAttempt.score}% (${
					completedAttempt.passed ? "PASSED" : "FAILED"
				})`
			);
		} catch (error) {
			console.error("Error submitting local test:", error);
			Alert.alert("Error", "Failed to submit test. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const retakeTest = () => {
		setCurrentQuestionIndex(0);
		setUserAnswers({});
		setShowResults(false);
		setScore(0);
		setTestCompleted(false);
		setTestAttempt(null);
		// Create a new local test attempt
		if (test && user?.id) {
			createLocalTestAttempt(test.id);
		}
	};

	const finishTest = () => {
		navigation.goBack();
	};

	const renderQuestion = () => {
		if (!questions.length) return null;

		const question = questions[currentQuestionIndex];
		const userAnswer = userAnswers[currentQuestionIndex];

		// Handle both string array and QuestionOption array formats
		const getOptionText = (option: any): string => {
			return typeof option === "string" ? option : option.text;
		};

		const getOptions = (options: any[]): string[] => {
			return options.map((option) => getOptionText(option));
		};

		return (
			<View style={styles.questionContainer}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionNumber}>
						Question {currentQuestionIndex + 1} of {questions.length}
					</Text>
					<Text style={styles.questionText}>{question.question_text}</Text>
				</View>

				{question.question_type === "multiple_choice" && (
					<View style={styles.optionsContainer}>
						{getOptions(question.options).map((optionText, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.optionButton,
									userAnswer === optionText && styles.selectedOption,
								]}
								onPress={() => handleAnswer(optionText)}
							>
								<Text
									style={[
										styles.optionText,
										userAnswer === optionText && styles.selectedOptionText,
									]}
								>
									{optionText}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}

				{question.question_type === "true_false" && (
					<View style={styles.optionsContainer}>
						{["True", "False"].map((option) => (
							<TouchableOpacity
								key={option}
								style={[
									styles.optionButton,
									userAnswer === option && styles.selectedOption,
								]}
								onPress={() => handleAnswer(option)}
							>
								<Text
									style={[
										styles.optionText,
										userAnswer === option && styles.selectedOptionText,
									]}
								>
									{option}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}

				{question.question_type === "fill_blank" && (
					<View style={styles.fillBlankContainer}>
						<Text style={styles.fillBlankHint}>Type your answer below:</Text>
						<TextInput
							style={styles.fillBlankInput}
							value={userAnswer || ""}
							onChangeText={(text) => handleAnswer(text)}
							placeholder="Enter your answer..."
							placeholderTextColor={theme.colors.textSecondary}
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>
				)}
			</View>
		);
	};

	const renderResults = () => {
		const passed = score >= (test?.passing_percentage || 70);

		return (
			<View style={styles.resultsContainer}>
				<LinearGradient
					colors={passed ? ["#4CAF50", "#66BB6A"] : ["#F44336", "#EF5350"]}
					style={styles.scoreCard}
				>
					<Ionicons
						name={passed ? "checkmark-circle" : "close-circle"}
						size={64}
						color="white"
					/>
					<Text style={styles.scoreText}>{score}%</Text>
					<Text style={styles.resultText}>
						{passed ? "Test Passed!" : "Test Failed"}
					</Text>
					<Text style={styles.resultSubtext}>
						{passed
							? "Great job! You can proceed to the next lesson."
							: `You need ${
									test?.passing_percentage || 70
							  }% to pass. Try again!`}
					</Text>
				</LinearGradient>

				<View style={styles.resultsActions}>
					{!passed && (
						<TouchableOpacity
							style={[styles.actionButton, styles.retakeButton]}
							onPress={retakeTest}
						>
							<Ionicons name="refresh" size={20} color="white" />
							<Text style={styles.actionButtonText}>Retake Test</Text>
						</TouchableOpacity>
					)}

					<TouchableOpacity
						style={[styles.actionButton, styles.finishButton]}
						onPress={finishTest}
					>
						<Ionicons name="checkmark" size={20} color="white" />
						<Text style={styles.actionButtonText}>Finish</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Loading test...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!test || !questions.length) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Ionicons name="alert-circle" size={64} color={theme.colors.error} />
					<Text style={styles.errorText}>
						No test available for this lesson
					</Text>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.backButtonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="close" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{test.title}</Text>
				<View style={styles.progressIndicator}>
					<Text style={styles.progressText}>
						{currentQuestionIndex + 1}/{questions.length}
					</Text>
				</View>
			</View>

			{/* Progress Bar */}
			<View style={styles.progressBarContainer}>
				<View style={styles.progressBar}>
					<View
						style={[
							styles.progressFill,
							{
								width: `${
									((currentQuestionIndex + 1) / questions.length) * 100
								}%`,
							},
						]}
					/>
				</View>
			</View>

			{/* Content */}
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{showResults ? renderResults() : renderQuestion()}
			</ScrollView>

			{/* Navigation */}
			{!showResults && (
				<View style={styles.navigation}>
					<TouchableOpacity
						style={[
							styles.navButton,
							currentQuestionIndex === 0 && styles.navButtonDisabled,
						]}
						onPress={previousQuestion}
						disabled={currentQuestionIndex === 0}
					>
						<Ionicons name="chevron-back" size={20} color="white" />
						<Text style={styles.navButtonText}>Previous</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.navButton,
							styles.nextButton,
							!userAnswers[currentQuestionIndex] && styles.navButtonDisabled,
						]}
						onPress={nextQuestion}
						disabled={!userAnswers[currentQuestionIndex]}
					>
						<Text style={styles.navButtonText}>
							{currentQuestionIndex === questions.length - 1
								? "Finish"
								: "Next"}
						</Text>
						<Ionicons name="chevron-forward" size={20} color="white" />
					</TouchableOpacity>
				</View>
			)}
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
	closeButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
		textAlign: "center",
	},
	progressIndicator: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	progressText: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	progressBarContainer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	progressBar: {
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
	},
	progressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
		borderRadius: 2,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	questionContainer: {
		marginBottom: 30,
	},
	questionHeader: {
		marginBottom: 24,
	},
	questionNumber: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 8,
	},
	questionText: {
		fontSize: 20,
		fontWeight: "600",
		color: theme.colors.text,
		lineHeight: 28,
	},
	optionsContainer: {
		gap: 12,
	},
	optionButton: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: "transparent",
	},
	selectedOption: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	optionText: {
		fontSize: 16,
		color: theme.colors.text,
		fontWeight: "500",
	},
	selectedOptionText: {
		color: "white",
	},
	fillBlankContainer: {
		marginTop: 20,
	},
	fillBlankHint: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 12,
	},
	fillBlankInput: {
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.border,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: theme.colors.text,
		marginTop: 8,
	},
	navigation: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	navButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.textSecondary,
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 12,
		gap: 8,
	},
	nextButton: {
		backgroundColor: theme.colors.primary,
	},
	navButtonDisabled: {
		backgroundColor: theme.colors.border,
		opacity: 0.5,
	},
	navButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
	resultsContainer: {
		alignItems: "center",
		paddingVertical: 40,
	},
	scoreCard: {
		alignItems: "center",
		padding: 40,
		borderRadius: 20,
		marginBottom: 30,
		width: "100%",
	},
	scoreText: {
		fontSize: 48,
		fontWeight: "bold",
		color: "white",
		marginVertical: 16,
	},
	resultText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
		marginBottom: 8,
	},
	resultSubtext: {
		fontSize: 16,
		color: "rgba(255,255,255,0.9)",
		textAlign: "center",
		lineHeight: 22,
	},
	resultsActions: {
		flexDirection: "row",
		gap: 16,
		width: "100%",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	retakeButton: {
		backgroundColor: theme.colors.warning,
	},
	finishButton: {
		backgroundColor: theme.colors.success,
	},
	actionButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
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
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	errorText: {
		fontSize: 18,
		color: theme.colors.text,
		textAlign: "center",
		marginVertical: 20,
	},
	backButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
});
