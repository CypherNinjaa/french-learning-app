import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { enhancedGroqService } from "../services/enhancedGroqService";

interface AdaptivePracticeSessionProps {
	navigation: any;
	route: any;
}

interface AdaptiveExercise {
	id: string;
	type: "vocabulary" | "grammar" | "pronunciation" | "comprehension";
	difficulty: "easy" | "medium" | "hard";
	question: string;
	options?: string[];
	correctAnswer: string;
	explanation: string;
	userResponse?: string;
	isCorrect?: boolean;
}

export const AdaptivePracticeSession: React.FC<
	AdaptivePracticeSessionProps
> = ({ navigation, route }) => {
	const { user } = useAuth();
	const { userStats, userContext } = route.params || {};
	const [exercises, setExercises] = useState<AdaptiveExercise[]>([]);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [showResult, setShowResult] = useState(false);
	const [sessionScore, setSessionScore] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [loadingText, setLoadingText] = useState(
		"Analyzing your learning patterns..."
	);

	useEffect(() => {
		generateAdaptiveExercises();
	}, []);

	const generateAdaptiveExercises = async () => {
		setIsLoading(true);
		try {
			if (!user?.id) {
				throw new Error("User not authenticated");
			}

			setLoadingText("Creating personalized exercises...");

			// Get user learning data first
			const userLearningData = await enhancedGroqService.getUserLearningData(
				user.id
			);

			// Generate adaptive exercises using Groq AI based on user data
			const exercises = await enhancedGroqService.generatePersonalizedExercises(
				{
					type: "adaptive",
					difficulty: userLearningData.preferences.difficulty,
					count: 5,
					userContext: userLearningData,
				}
			);

			if (exercises && exercises.length > 0) {
				// Convert to AdaptiveExercise format
				const adaptiveExercises: AdaptiveExercise[] = exercises.map(
					(exercise, index) => ({
						id: exercise.id || `exercise_${index + 1}`,
						type: exercise.type,
						difficulty: exercise.difficulty,
						question: exercise.question,
						options: exercise.options,
						correctAnswer: exercise.correctAnswer,
						explanation: exercise.explanation,
					})
				);
				setExercises(adaptiveExercises);
			} else {
				throw new Error("No exercises generated");
			}
			setIsLoading(false);
		} catch (error) {
			console.error("Error generating adaptive exercises:", error);

			// Fallback to basic exercises if AI generation fails
			console.warn("AI generation failed, using fallback exercises");
			const mockExercises: AdaptiveExercise[] = [
				{
					id: "1",
					type: "vocabulary",
					difficulty: "medium",
					question: "What does 'bonjour' mean in English?",
					options: ["Good evening", "Good morning", "Good night", "Goodbye"],
					correctAnswer: "Good morning",
					explanation:
						"'Bonjour' is a French greeting used during the day, meaning 'good morning' or 'hello'.",
				},
				{
					id: "2",
					type: "grammar",
					difficulty: "medium",
					question: "Choose the correct form: 'Je ___ français.'",
					options: ["parle", "parles", "parlons", "parlez"],
					correctAnswer: "parle",
					explanation:
						"With 'je' (I), we use the first person singular form 'parle'.",
				},
				{
					id: "3",
					type: "vocabulary",
					difficulty: "easy",
					question: "How do you say 'cat' in French?",
					options: ["chien", "chat", "oiseau", "poisson"],
					correctAnswer: "chat",
					explanation: "'Chat' is the French word for cat.",
				},
			];
			setExercises(mockExercises);
			setIsLoading(false);
		}
	};

	const handleAnswerSelect = (answer: string) => {
		if (showResult) return;
		setSelectedAnswer(answer);
	};

	const handleSubmitAnswer = () => {
		if (!selectedAnswer) {
			Alert.alert(
				"Please select an answer",
				"You must choose an option before submitting."
			);
			return;
		}

		const currentExercise = exercises[currentExerciseIndex];
		const isCorrect = selectedAnswer === currentExercise.correctAnswer;

		// Update exercise with user response
		const updatedExercises = [...exercises];
		updatedExercises[currentExerciseIndex] = {
			...currentExercise,
			userResponse: selectedAnswer,
			isCorrect,
		};
		setExercises(updatedExercises);

		if (isCorrect) {
			setSessionScore(sessionScore + 1);
		}

		setShowResult(true);
	};

	const handleNextExercise = () => {
		if (currentExerciseIndex < exercises.length - 1) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
			setSelectedAnswer("");
			setShowResult(false);
		} else {
			setSessionComplete(true);
		}
	};

	const handleSessionComplete = async () => {
		try {
			if (user?.id) {
				// Calculate session duration (approximate)
				const duration = exercises.length * 2; // Assume 2 minutes per exercise

				// Save session results to database using Groq service
				await enhancedGroqService.savePracticeSession(user.id, {
					type: "adaptive",
					duration: duration,
					score: sessionScore,
					exercises: exercises,
				});
			}
		} catch (error) {
			console.error("Error saving session results:", error);
		}

		navigation.goBack();
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>{loadingText}</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (sessionComplete) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.completionContainer}>
					<Ionicons
						name="checkmark-circle"
						size={80}
						color={theme.colors.success}
					/>
					<Text style={styles.completionTitle}>Session Complete!</Text>
					<Text style={styles.completionScore}>
						Score: {sessionScore}/{exercises.length}
					</Text>
					<Text style={styles.completionPercentage}>
						{Math.round((sessionScore / exercises.length) * 100)}% Correct
					</Text>
					<TouchableOpacity
						style={styles.completeButton}
						onPress={handleSessionComplete}
					>
						<Text style={styles.completeButtonText}>Continue</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const currentExercise = exercises[currentExerciseIndex];

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Adaptive Practice</Text>
				<Text style={styles.progressText}>
					{currentExerciseIndex + 1}/{exercises.length}
				</Text>
			</View>

			<View style={styles.progressBar}>
				<View
					style={[
						styles.progressFill,
						{
							width: `${
								((currentExerciseIndex + 1) / exercises.length) * 100
							}%`,
						},
					]}
				/>
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.exerciseCard}>
					<View style={styles.exerciseHeader}>
						<Text style={styles.exerciseType}>
							{currentExercise.type.toUpperCase()}
						</Text>
						<View
							style={[
								styles.difficultyBadge,
								styles[`difficulty${currentExercise.difficulty}`],
							]}
						>
							<Text style={styles.difficultyText}>
								{currentExercise.difficulty}
							</Text>
						</View>
					</View>

					<Text style={styles.question}>{currentExercise.question}</Text>

					<View style={styles.optionsContainer}>
						{currentExercise.options?.map((option, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.optionCard,
									selectedAnswer === option && styles.selectedOption,
									showResult &&
										option === currentExercise.correctAnswer &&
										styles.correctOption,
									showResult &&
										selectedAnswer === option &&
										option !== currentExercise.correctAnswer &&
										styles.incorrectOption,
								]}
								onPress={() => handleAnswerSelect(option)}
								disabled={showResult}
							>
								<Text
									style={[
										styles.optionText,
										selectedAnswer === option && styles.selectedOptionText,
										showResult &&
											option === currentExercise.correctAnswer &&
											styles.correctOptionText,
										showResult &&
											selectedAnswer === option &&
											option !== currentExercise.correctAnswer &&
											styles.incorrectOptionText,
									]}
								>
									{option}
								</Text>
								{showResult && option === currentExercise.correctAnswer && (
									<Ionicons name="checkmark" size={20} color="white" />
								)}
								{showResult &&
									selectedAnswer === option &&
									option !== currentExercise.correctAnswer && (
										<Ionicons name="close" size={20} color="white" />
									)}
							</TouchableOpacity>
						))}
					</View>

					{showResult && (
						<View style={styles.explanationContainer}>
							<Text style={styles.explanationTitle}>Explanation:</Text>
							<Text style={styles.explanationText}>
								{currentExercise.explanation}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>

			<View style={styles.footer}>
				{!showResult ? (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!selectedAnswer && styles.disabledButton,
						]}
						onPress={handleSubmitAnswer}
						disabled={!selectedAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.nextButton}
						onPress={handleNextExercise}
					>
						<Text style={styles.nextButtonText}>
							{currentExerciseIndex < exercises.length - 1
								? "Next Exercise"
								: "Complete Session"}
						</Text>
					</TouchableOpacity>
				)}
			</View>
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
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	progressBar: {
		height: 4,
		backgroundColor: theme.colors.border,
		marginHorizontal: 20,
		borderRadius: 2,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	exerciseCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
	},
	exerciseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	exerciseType: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.primary,
		letterSpacing: 1,
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	difficultyeasy: {
		backgroundColor: "#51cf66",
	},
	difficultymedium: {
		backgroundColor: "#ffd43b",
	},
	difficultyhard: {
		backgroundColor: "#ff6b6b",
	},
	difficultyText: {
		fontSize: 10,
		fontWeight: "600",
		color: "white",
		textTransform: "uppercase",
	},
	question: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 20,
		lineHeight: 24,
	},
	optionsContainer: {
		gap: 12,
	},
	optionCard: {
		backgroundColor: theme.colors.background,
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: theme.colors.border,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	selectedOption: {
		borderColor: theme.colors.primary,
		backgroundColor: `${theme.colors.primary}15`,
	},
	correctOption: {
		borderColor: "#51cf66",
		backgroundColor: "#51cf66",
	},
	incorrectOption: {
		borderColor: "#ff6b6b",
		backgroundColor: "#ff6b6b",
	},
	optionText: {
		fontSize: 16,
		color: theme.colors.text,
		flex: 1,
	},
	selectedOptionText: {
		color: theme.colors.primary,
		fontWeight: "500",
	},
	correctOptionText: {
		color: "white",
		fontWeight: "500",
	},
	incorrectOptionText: {
		color: "white",
		fontWeight: "500",
	},
	explanationContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: theme.colors.background,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	explanationTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	footer: {
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: theme.colors.border,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
	nextButton: {
		backgroundColor: theme.colors.success,
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
	},
	nextButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
	completionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	completionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginTop: 20,
		marginBottom: 8,
	},
	completionScore: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: 4,
	},
	completionPercentage: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 32,
	},
	completeButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
	},
	completeButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "white",
	},
});
