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

interface FocusedPracticeSessionProps {
	navigation: any;
	route: any;
}

interface FocusArea {
	id: string;
	name: string;
	description: string;
	icon: string;
	exerciseCount: number;
	estimatedTime: string;
}

interface FocusedExercise {
	id: string;
	focusArea: string;
	type: "vocabulary" | "grammar" | "pronunciation" | "comprehension";
	question: string;
	options?: string[];
	correctAnswer: string;
	explanation: string;
	userResponse?: string;
	isCorrect?: boolean;
}

export const FocusedPracticeSession: React.FC<FocusedPracticeSessionProps> = ({
	navigation,
	route,
}) => {
	const { user } = useAuth();
	const [focusAreas] = useState<FocusArea[]>([
		{
			id: "weak-grammar",
			name: "Grammar Weak Spots",
			description: "Practice your most challenging grammar concepts",
			icon: "library-outline",
			exerciseCount: 8,
			estimatedTime: "10-15 min",
		},
		{
			id: "new-vocabulary",
			name: "New Vocabulary",
			description: "Master recently learned words and phrases",
			icon: "book-outline",
			exerciseCount: 12,
			estimatedTime: "8-12 min",
		},
		{
			id: "pronunciation",
			name: "Pronunciation Practice",
			description: "Improve your French pronunciation accuracy",
			icon: "mic-outline",
			exerciseCount: 6,
			estimatedTime: "5-8 min",
		},
		{
			id: "conversation",
			name: "Conversation Skills",
			description: "Practice real-world French conversations",
			icon: "chatbubbles-outline",
			exerciseCount: 10,
			estimatedTime: "12-18 min",
		},
	]);

	const [selectedFocusArea, setSelectedFocusArea] = useState<FocusArea | null>(
		null
	);
	const [exercises, setExercises] = useState<FocusedExercise[]>([]);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [showResult, setShowResult] = useState(false);
	const [sessionScore, setSessionScore] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [sessionComplete, setSessionComplete] = useState(false);

	const selectFocusArea = async (focusArea: FocusArea) => {
		setSelectedFocusArea(focusArea);
		setIsLoading(true);

		try {
			if (!user?.id) {
				throw new Error("User not authenticated");
			}

			// Get user learning data for better personalization
			const userLearningData = await enhancedGroqService.getUserLearningData(
				user.id
			);

			// Generate focused exercises using Groq AI
			const exercises = await enhancedGroqService.generatePersonalizedExercises(
				{
					type: "focused",
					difficulty: userLearningData.preferences.difficulty,
					focusArea: focusArea.id,
					count: focusArea.exerciseCount,
					userContext: userLearningData,
				}
			);

			if (exercises && exercises.length > 0) {
				// Convert to FocusedExercise format
				const focusedExercises: FocusedExercise[] = exercises.map(
					(exercise, index) => ({
						id: exercise.id || `exercise_${index + 1}`,
						focusArea: focusArea.name,
						type: exercise.type,
						question: exercise.question,
						options: exercise.options,
						correctAnswer: exercise.correctAnswer,
						explanation: exercise.explanation,
					})
				);
				setExercises(focusedExercises);
			} else {
				// Fallback to mock exercises
				const mockExercises = generateMockExercises(focusArea);
				setExercises(mockExercises);
			}

			setIsLoading(false);
		} catch (error) {
			console.error("Error generating focused exercises:", error);

			// Fallback to mock exercises on error
			const mockExercises = generateMockExercises(focusArea);
			setExercises(mockExercises);
			setIsLoading(false);
		}
	};

	const generateMockExercises = (focusArea: FocusArea): FocusedExercise[] => {
		switch (focusArea.id) {
			case "weak-grammar":
				return [
					{
						id: "1",
						focusArea: focusArea.name,
						type: "grammar",
						question: "Choose the correct article: '___ maison est belle.'",
						options: ["Le", "La", "Les", "L'"],
						correctAnswer: "La",
						explanation: "'Maison' is feminine, so we use 'la'.",
					},
					{
						id: "2",
						focusArea: focusArea.name,
						type: "grammar",
						question: "Conjugate 'avoir' for 'nous': 'Nous ___ une voiture.'",
						options: ["avons", "avez", "ont", "ai"],
						correctAnswer: "avons",
						explanation: "With 'nous', we use 'avons' (first person plural).",
					},
				];
			case "new-vocabulary":
				return [
					{
						id: "1",
						focusArea: focusArea.name,
						type: "vocabulary",
						question: "What does 'ordinateur' mean?",
						options: ["Computer", "Television", "Phone", "Radio"],
						correctAnswer: "Computer",
						explanation: "'Ordinateur' is the French word for computer.",
					},
					{
						id: "2",
						focusArea: focusArea.name,
						type: "vocabulary",
						question: "How do you say 'library' in French?",
						options: ["librairie", "bibliothèque", "magasin", "école"],
						correctAnswer: "bibliothèque",
						explanation:
							"'Bibliothèque' means library. 'Librairie' means bookstore.",
					},
				];
			default:
				return [
					{
						id: "1",
						focusArea: focusArea.name,
						type: "vocabulary",
						question: "Sample question for " + focusArea.name,
						options: ["Option 1", "Option 2", "Option 3", "Option 4"],
						correctAnswer: "Option 1",
						explanation: "This is a sample explanation.",
					},
				];
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
			if (user?.id && selectedFocusArea) {
				// Calculate session duration
				const duration = exercises.length * 2; // Assume 2 minutes per exercise

				// Save session results to database
				await enhancedGroqService.savePracticeSession(user.id, {
					type: "focused",
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

	const resetSession = () => {
		setSelectedFocusArea(null);
		setExercises([]);
		setCurrentExerciseIndex(0);
		setSelectedAnswer("");
		setShowResult(false);
		setSessionScore(0);
		setSessionComplete(false);
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>
						Preparing {selectedFocusArea?.name} exercises...
					</Text>
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
					<Text style={styles.completionTitle}>Focused Session Complete!</Text>
					<Text style={styles.completionFocus}>{selectedFocusArea?.name}</Text>
					<Text style={styles.completionScore}>
						Score: {sessionScore}/{exercises.length}
					</Text>
					<Text style={styles.completionPercentage}>
						{Math.round((sessionScore / exercises.length) * 100)}% Mastery
					</Text>
					<View style={styles.completionButtons}>
						<TouchableOpacity
							style={styles.anotherSessionButton}
							onPress={resetSession}
						>
							<Text style={styles.anotherSessionButtonText}>
								Another Focus Area
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.completeButton}
							onPress={handleSessionComplete}
						>
							<Text style={styles.completeButtonText}>Finish</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	if (!selectedFocusArea) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Focused Practice</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView style={styles.content}>
					<Text style={styles.sectionTitle}>Choose Your Focus Area</Text>
					<Text style={styles.sectionDescription}>
						Select a specific area to improve with targeted exercises
					</Text>

					<View style={styles.focusAreasContainer}>
						{focusAreas.map((area) => (
							<TouchableOpacity
								key={area.id}
								style={styles.focusAreaCard}
								onPress={() => selectFocusArea(area)}
							>
								<View style={styles.focusAreaHeader}>
									<View style={styles.focusAreaIconContainer}>
										<Ionicons
											name={area.icon as any}
											size={24}
											color={theme.colors.primary}
										/>
									</View>
									<View style={styles.focusAreaMeta}>
										<Text style={styles.exerciseCount}>
											{area.exerciseCount} exercises
										</Text>
										<Text style={styles.estimatedTime}>
											{area.estimatedTime}
										</Text>
									</View>
								</View>
								<Text style={styles.focusAreaName}>{area.name}</Text>
								<Text style={styles.focusAreaDescription}>
									{area.description}
								</Text>
								<View style={styles.startButton}>
									<Text style={styles.startButtonText}>Start Practice</Text>
									<Ionicons
										name="arrow-forward"
										size={16}
										color={theme.colors.primary}
									/>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	const currentExercise = exercises[currentExerciseIndex];

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={resetSession}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>{selectedFocusArea.name}</Text>
					<Text style={styles.headerSubtitle}>
						{currentExerciseIndex + 1} of {exercises.length}
					</Text>
				</View>
				<TouchableOpacity onPress={resetSession}>
					<Ionicons name="close" size={24} color={theme.colors.textSecondary} />
				</TouchableOpacity>
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
								? "Next Question"
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
		textAlign: "center",
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
	headerCenter: {
		flex: 1,
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
	},
	headerSubtitle: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 2,
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
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginBottom: 24,
		lineHeight: 22,
	},
	focusAreasContainer: {
		gap: 16,
	},
	focusAreaCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	focusAreaHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	focusAreaIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: `${theme.colors.primary}15`,
		alignItems: "center",
		justifyContent: "center",
	},
	focusAreaMeta: {
		alignItems: "flex-end",
	},
	exerciseCount: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
	},
	estimatedTime: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	focusAreaName: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 8,
	},
	focusAreaDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
		marginBottom: 16,
	},
	startButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: `${theme.colors.primary}15`,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	startButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	exerciseCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
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
	completionFocus: {
		fontSize: 16,
		color: theme.colors.primary,
		marginBottom: 16,
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
	completionButtons: {
		flexDirection: "row",
		gap: 12,
	},
	anotherSessionButton: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	anotherSessionButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
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
