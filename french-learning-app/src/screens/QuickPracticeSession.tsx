import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { enhancedGroqService } from "../services/enhancedGroqService";

interface QuickPracticeSessionProps {
	navigation: any;
	route: any;
}

interface QuickExercise {
	id: string;
	type: "vocabulary" | "grammar" | "quick-translation" | "listening";
	question: string;
	options?: string[];
	correctAnswer: string;
	explanation?: string;
	timeLimit: number; // in seconds
	difficulty: "easy" | "medium" | "hard";
	userResponse?: string;
	isCorrect?: boolean;
}

export const QuickPracticeSession: React.FC<QuickPracticeSessionProps> = ({
	navigation,
	route,
}) => {
	const { user } = useAuth();
	const [exercises, setExercises] = useState<QuickExercise[]>([]);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [showResult, setShowResult] = useState(false);
	const [sessionScore, setSessionScore] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [timerActive, setTimerActive] = useState(false);
	const [streak, setStreak] = useState(0);
	const [totalTime, setTotalTime] = useState(0);

	// Animation values
	const scaleAnim = new Animated.Value(1);
	const fadeAnim = new Animated.Value(1);

	useEffect(() => {
		generateQuickExercises();
	}, []);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (timerActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft(timeLeft - 1);
				setTotalTime((prev) => prev + 1);
			}, 1000);
		} else if (timeLeft === 0 && timerActive) {
			handleTimeUp();
		}
		return () => clearInterval(interval);
	}, [timerActive, timeLeft]);

	const generateQuickExercises = async () => {
		setIsLoading(true);
		try {
			if (!user?.id) {
				throw new Error("User not authenticated");
			}

			// Get user learning data for personalization
			const userLearningData = await enhancedGroqService.getUserLearningData(
				user.id
			);

			// Generate quick exercises using Groq AI
			const exercises = await enhancedGroqService.generatePersonalizedExercises(
				{
					type: "quick",
					difficulty: userLearningData.preferences.difficulty,
					count: 5,
					userContext: userLearningData,
				}
			);

			if (exercises && exercises.length > 0) {
				// Convert to QuickExercise format with time limits
				const quickExercises: QuickExercise[] = exercises.map(
					(exercise, index) => ({
						id: exercise.id || `exercise_${index + 1}`,
						type: exercise.type as
							| "vocabulary"
							| "grammar"
							| "quick-translation"
							| "listening",
						question: exercise.question,
						options: exercise.options,
						correctAnswer: exercise.correctAnswer,
						explanation: exercise.explanation,
						timeLimit:
							exercise.timeLimit ||
							(exercise.difficulty === "easy"
								? 10
								: exercise.difficulty === "medium"
								? 12
								: 15),
						difficulty: exercise.difficulty,
					})
				);
				setExercises(quickExercises);
				if (quickExercises.length > 0) {
					setTimeLeft(quickExercises[0].timeLimit);
					setTimerActive(true);
				}
			} else {
				// Fallback to mock exercises
				const mockExercises = generateMockExercises();
				setExercises(mockExercises);
				if (mockExercises.length > 0) {
					setTimeLeft(mockExercises[0].timeLimit);
					setTimerActive(true);
				}
			}

			setIsLoading(false);
		} catch (error) {
			console.error("Error generating quick exercises:", error);

			// Fallback to mock exercises on error
			const mockExercises = generateMockExercises();
			setExercises(mockExercises);
			if (mockExercises.length > 0) {
				setTimeLeft(mockExercises[0].timeLimit);
				setTimerActive(true);
			}
			setIsLoading(false);
		}
	};

	const generateMockExercises = (): QuickExercise[] => {
		return [
			{
				id: "1",
				type: "vocabulary",
				question: "Quick! What's 'hello' in French?",
				options: ["Bonjour", "Bonsoir", "Salut", "Au revoir"],
				correctAnswer: "Bonjour",
				explanation: "'Bonjour' is the most common way to say hello in French.",
				timeLimit: 10,
				difficulty: "easy",
			},
			{
				id: "2",
				type: "quick-translation",
				question: "Translate: 'I am happy'",
				options: [
					"Je suis triste",
					"Je suis content",
					"Je suis fatigué",
					"Je suis malade",
				],
				correctAnswer: "Je suis content",
				explanation: "'Je suis content' means 'I am happy' in French.",
				timeLimit: 12,
				difficulty: "easy",
			},
			{
				id: "3",
				type: "grammar",
				question: "Quick conjugation: 'Je ___ (to eat)'",
				options: ["mange", "manges", "mangez", "mangeons"],
				correctAnswer: "mange",
				explanation: "With 'je', we use 'mange' (first person singular).",
				timeLimit: 8,
				difficulty: "medium",
			},
			{
				id: "4",
				type: "vocabulary",
				question: "What color is 'rouge'?",
				options: ["Blue", "Red", "Green", "Yellow"],
				correctAnswer: "Red",
				explanation: "'Rouge' means red in French.",
				timeLimit: 6,
				difficulty: "easy",
			},
			{
				id: "5",
				type: "quick-translation",
				question: "Quick! How do you say 'thank you'?",
				options: ["Merci", "Pardon", "Excusez-moi", "De rien"],
				correctAnswer: "Merci",
				explanation: "'Merci' is the standard way to say thank you.",
				timeLimit: 5,
				difficulty: "easy",
			},
		];
	};

	const handleTimeUp = () => {
		if (!showResult) {
			setTimerActive(false);
			setShowResult(true);
			// Auto-submit with no answer
			const currentExercise = exercises[currentExerciseIndex];
			const updatedExercises = [...exercises];
			updatedExercises[currentExerciseIndex] = {
				...currentExercise,
				userResponse: "",
				isCorrect: false,
			};
			setExercises(updatedExercises);
			setStreak(0);

			// Shake animation for time up
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 0.95,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1.05,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		}
	};

	const handleAnswerSelect = (answer: string) => {
		if (showResult || !timerActive) return;

		setSelectedAnswer(answer);
		setTimerActive(false);

		const currentExercise = exercises[currentExerciseIndex];
		const isCorrect = answer === currentExercise.correctAnswer;

		// Update exercise with user response
		const updatedExercises = [...exercises];
		updatedExercises[currentExerciseIndex] = {
			...currentExercise,
			userResponse: answer,
			isCorrect,
		};
		setExercises(updatedExercises);

		if (isCorrect) {
			setSessionScore(sessionScore + 1);
			setStreak(streak + 1);
			// Success animation
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 1.1,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			setStreak(0);
			// Error animation
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 0.95,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		}

		setShowResult(true);
	};

	const handleNextExercise = () => {
		if (currentExerciseIndex < exercises.length - 1) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
			setSelectedAnswer("");
			setShowResult(false);
			setTimeLeft(exercises[currentExerciseIndex + 1].timeLimit);
			setTimerActive(true);

			// Fade animation for next question
			Animated.sequence([
				Animated.timing(fadeAnim, {
					toValue: 0.3,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			setSessionComplete(true);
		}
	};

	const handleSessionComplete = async () => {
		try {
			if (user?.id) {
				// Calculate session duration (sum of all time limits)
				const totalTimeLimit = exercises.reduce(
					(sum, ex) => sum + ex.timeLimit,
					0
				);
				const duration = Math.round(totalTimeLimit / 60); // Convert to minutes

				// Save session results to database
				await enhancedGroqService.savePracticeSession(user.id, {
					type: "quick",
					duration: Math.max(duration, 1), // At least 1 minute
					score: sessionScore,
					exercises: exercises,
				});
			}
		} catch (error) {
			console.error("Error saving session results:", error);
		}

		navigation.goBack();
	};

	const getTimeColor = () => {
		if (timeLeft <= 3) return "#ff6b6b";
		if (timeLeft <= 6) return "#ffd43b";
		return theme.colors.primary;
	};

	const formatTime = (seconds: number) => {
		return seconds.toString().padStart(2, "0");
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Preparing quick practice...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (sessionComplete) {
		const accuracy = Math.round((sessionScore / exercises.length) * 100);
		const avgTimePerQuestion = Math.round(totalTime / exercises.length);

		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.completionContainer}>
					<Ionicons
						name={accuracy >= 80 ? "trophy" : "checkmark-circle"}
						size={80}
						color={accuracy >= 80 ? "#ffd43b" : theme.colors.success}
					/>
					<Text style={styles.completionTitle}>Quick Session Complete!</Text>
					<View style={styles.statsContainer}>
						<View style={styles.statItem}>
							<Text style={styles.statValue}>
								{sessionScore}/{exercises.length}
							</Text>
							<Text style={styles.statLabel}>Correct</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.statValue}>{accuracy}%</Text>
							<Text style={styles.statLabel}>Accuracy</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.statValue}>{avgTimePerQuestion}s</Text>
							<Text style={styles.statLabel}>Avg Time</Text>
						</View>
					</View>
					{streak > 0 && (
						<View style={styles.streakContainer}>
							<Ionicons name="flame" size={20} color="#ff6b6b" />
							<Text style={styles.streakText}>Best streak: {streak}</Text>
						</View>
					)}
					<View style={styles.completionButtons}>
						<TouchableOpacity
							style={styles.againButton}
							onPress={() => {
								setCurrentExerciseIndex(0);
								setSessionScore(0);
								setStreak(0);
								setTotalTime(0);
								setSessionComplete(false);
								setTimeLeft(exercises[0].timeLimit);
								setTimerActive(true);
								setSelectedAnswer("");
								setShowResult(false);
							}}
						>
							<Text style={styles.againButtonText}>Play Again</Text>
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

	const currentExercise = exercises[currentExerciseIndex];

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="close" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Quick Practice</Text>
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						{currentExerciseIndex + 1}/{exercises.length}
					</Text>
				</View>
			</View>

			<View style={styles.timerContainer}>
				<View style={[styles.timerCircle, { borderColor: getTimeColor() }]}>
					<Text style={[styles.timerText, { color: getTimeColor() }]}>
						{formatTime(timeLeft)}
					</Text>
				</View>
				<View style={styles.streakInfo}>
					{streak > 0 && (
						<View style={styles.currentStreak}>
							<Ionicons name="flame" size={16} color="#ff6b6b" />
							<Text style={styles.currentStreakText}>{streak}</Text>
						</View>
					)}
				</View>
			</View>

			<Animated.View
				style={[
					styles.content,
					{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
				]}
			>
				<View style={styles.exerciseCard}>
					<View style={styles.exerciseHeader}>
						<Text style={styles.exerciseType}>
							{currentExercise.type.replace("-", " ").toUpperCase()}
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
								disabled={showResult || !timerActive}
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

					{showResult && currentExercise.explanation && (
						<View style={styles.explanationContainer}>
							<Text style={styles.explanationText}>
								{currentExercise.explanation}
							</Text>
						</View>
					)}

					{showResult && !selectedAnswer && (
						<View style={styles.timeUpContainer}>
							<Ionicons name="time" size={24} color="#ff6b6b" />
							<Text style={styles.timeUpText}>Time's up!</Text>
						</View>
					)}
				</View>
			</Animated.View>

			{showResult && (
				<View style={styles.footer}>
					<TouchableOpacity
						style={styles.nextButton}
						onPress={handleNextExercise}
					>
						<Text style={styles.nextButtonText}>
							{currentExerciseIndex < exercises.length - 1
								? "Next Question"
								: "Finish Session"}
						</Text>
						<Ionicons name="arrow-forward" size={20} color="white" />
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
	progressContainer: {
		alignItems: "flex-end",
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	timerContainer: {
		alignItems: "center",
		paddingVertical: 24,
		flexDirection: "row",
		justifyContent: "center",
		gap: 20,
	},
	timerCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 4,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.surface,
	},
	timerText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	streakInfo: {
		alignItems: "center",
	},
	currentStreak: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "rgba(255, 107, 107, 0.1)",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	currentStreakText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#ff6b6b",
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
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 24,
		lineHeight: 28,
		textAlign: "center",
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
		minHeight: 56,
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
		fontWeight: "500",
	},
	selectedOptionText: {
		color: theme.colors.primary,
		fontWeight: "600",
	},
	correctOptionText: {
		color: "white",
		fontWeight: "600",
	},
	incorrectOptionText: {
		color: "white",
		fontWeight: "600",
	},
	explanationContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: theme.colors.background,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	timeUpContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: "rgba(255, 107, 107, 0.1)",
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	timeUpText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#ff6b6b",
	},
	footer: {
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	nextButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
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
		marginBottom: 24,
	},
	statsContainer: {
		flexDirection: "row",
		gap: 24,
		marginBottom: 20,
	},
	statItem: {
		alignItems: "center",
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.primary,
	},
	statLabel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 4,
	},
	streakContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 32,
		backgroundColor: "rgba(255, 107, 107, 0.1)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 16,
	},
	streakText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#ff6b6b",
	},
	completionButtons: {
		flexDirection: "row",
		gap: 12,
	},
	againButton: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	againButtonText: {
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
