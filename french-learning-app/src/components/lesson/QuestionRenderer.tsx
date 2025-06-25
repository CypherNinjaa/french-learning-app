// Dynamic Question Renderer Component
// Handles all question types with user-friendly interface and full functionality

import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	Animated,
	Dimensions,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { theme } from "../../constants/theme";
import { Question } from "../../types";
import { SpeechService } from "../../services/speechService";

// Import all question type renderers
import {
	MultipleChoiceRenderer,
	FillInBlankRenderer,
	TextInputRenderer,
} from "./question-types";

// Question UI components
import { QuestionProgress } from "./ui/QuestionProgress";

interface QuestionRendererProps {
	question: Question;
	questionIndex: number;
	totalQuestions: number;
	onAnswer: (
		questionId: number,
		answer: string | string[],
		isCorrect: boolean,
		timeTaken: number,
		score: number
	) => void;
	onNext: () => void;
	onPrevious?: () => void;
	onSkip?: () => void;
	onHint?: (questionId: number, hintIndex: number) => void;
	settings?: QuestionSettings;
	userProgress?: QuestionProgressData;
}

interface QuestionSettings {
	timeLimit?: number; // seconds
	showTimer: boolean;
	showProgress: boolean;
	allowSkip: boolean;
	allowPrevious: boolean;
	maxAttempts: number;
	showHints: boolean;
	autoAdvance: boolean;
	soundEnabled: boolean;
	showExplanation: boolean;
	immediateResult: boolean;
}

interface QuestionProgressData {
	attemptCount: number;
	hintsUsed: number[];
	startTime: number;
	bestScore: number;
}

const defaultSettings: QuestionSettings = {
	timeLimit: 60,
	showTimer: true,
	showProgress: true,
	allowSkip: true,
	allowPrevious: false,
	maxAttempts: 3,
	showHints: true,
	autoAdvance: false,
	soundEnabled: true,
	showExplanation: true,
	immediateResult: true,
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	questionIndex,
	totalQuestions,
	onAnswer,
	onNext,
	onPrevious,
	onSkip,
	onHint,
	settings = defaultSettings,
	userProgress,
}) => {
	const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");
	const [isAnswered, setIsAnswered] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [attempts, setAttempts] = useState(userProgress?.attemptCount || 0);
	const [timeLeft, setTimeLeft] = useState(settings.timeLimit || 60);
	const [startTime] = useState(Date.now());
	const [showFeedback, setShowFeedback] = useState(false);
	const [score, setScore] = useState(0);
	const [hintsUsed, setHintsUsed] = useState<number[]>(
		userProgress?.hintsUsed || []
	);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [animatedValue] = useState(new Animated.Value(0));

	// Timer effect
	useEffect(() => {
		if (!settings.showTimer || isAnswered) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isAnswered, settings.showTimer]);

	// Animation on mount
	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		}).start();
	}, []);

	// Cleanup audio
	useEffect(() => {
		return () => {
			if (sound) {
				sound.unloadAsync();
			}
		};
	}, [sound]);

	const handleTimeUp = useCallback(() => {
		if (!isAnswered) {
			handleAnswer(currentAnswer, false);
		}
	}, [currentAnswer, isAnswered]);

	const handleAnswer = useCallback(
		(answer: string | string[], correct: boolean) => {
			if (isAnswered) return;

			const timeTaken = Math.floor((Date.now() - startTime) / 1000);
			const newAttempts = attempts + 1;

			// Calculate score based on correctness, time, attempts, and hints
			let calculatedScore = 0;
			if (correct) {
				calculatedScore = question.points || 10;

				// Time bonus (faster = more points)
				if (settings.timeLimit) {
					const timeBonus = Math.floor((timeLeft / settings.timeLimit) * 2);
					calculatedScore += timeBonus;
				}

				// Attempt penalty (fewer attempts = more points)
				const attemptPenalty = Math.max(0, (newAttempts - 1) * 2);
				calculatedScore -= attemptPenalty;

				// Hint penalty
				const hintPenalty = hintsUsed.length * 1;
				calculatedScore -= hintPenalty;

				calculatedScore = Math.max(1, calculatedScore); // Minimum 1 point
			}

			setIsAnswered(true);
			setIsCorrect(correct);
			setAttempts(newAttempts);
			setScore(calculatedScore);

			if (settings.immediateResult) {
				setShowFeedback(true);
			}

			// Play sound feedback
			if (settings.soundEnabled) {
				playFeedbackSound(correct);
			}

			// Speak result if enabled
			if (settings.soundEnabled) {
				const message = correct ? "Correct!" : "Try again";
				SpeechService.speakVocabulary(message);
			}

			onAnswer(question.id, answer, correct, timeTaken, calculatedScore);

			// Auto advance if enabled and correct
			if (settings.autoAdvance && correct) {
				setTimeout(() => {
					onNext();
				}, 2000);
			}
		},
		[
			question,
			isAnswered,
			attempts,
			startTime,
			timeLeft,
			hintsUsed,
			settings,
			onAnswer,
			onNext,
		]
	);

	const playFeedbackSound = async (correct: boolean) => {
		try {
			// You can add custom sound files here
			const soundUri = correct ? "success.mp3" : "error.mp3";
			// For now, we'll use a simple beep or system sound
			// Implementation depends on your audio assets
		} catch (error) {
			console.log("Error playing feedback sound:", error);
		}
	};

	const handleRetry = () => {
		if (attempts >= settings.maxAttempts) {
			Alert.alert(
				"Maximum attempts reached",
				"You can move to the next question."
			);
			return;
		}

		setCurrentAnswer("");
		setIsAnswered(false);
		setIsCorrect(null);
		setShowFeedback(false);
		setTimeLeft(settings.timeLimit || 60);
	};

	const handleHintRequest = (hintIndex: number) => {
		if (!hintsUsed.includes(hintIndex)) {
			setHintsUsed([...hintsUsed, hintIndex]);
			onHint?.(question.id, hintIndex);
		}
	};

	const handleSkip = () => {
		if (settings.allowSkip) {
			Alert.alert(
				"Skip Question",
				"Are you sure you want to skip this question?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Skip",
						style: "destructive",
						onPress: () => {
							onSkip?.();
						},
					},
				]
			);
		}
	};
	const renderQuestionContent = () => {
		const baseProps = {
			question,
			onAnswer: handleAnswer,
			isAnswered,
			userAnswer: currentAnswer,
			showCorrectAnswer: showFeedback && !isCorrect,
			disabled: isAnswered,
			timeUp: timeLeft === 0,
		};

		switch (question.question_type) {
			case "multiple_choice":
				return <MultipleChoiceRenderer {...baseProps} />;
			case "fill_blank":
				return <FillInBlankRenderer {...baseProps} />;
			case "translation":
			case "listening":
			case "pronunciation":
			case "matching":
				return <TextInputRenderer {...baseProps} />;
			default:
				return (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>
							Unsupported question type: {question.question_type}
						</Text>
					</View>
				);
		}
	};

	return (
		<Animated.View
			style={[
				styles.container,
				{
					opacity: animatedValue,
					transform: [
						{
							translateY: animatedValue.interpolate({
								inputRange: [0, 1],
								outputRange: [50, 0],
							}),
						},
					],
				},
			]}
		>
			{/* Header */}
			<View style={styles.header}>
				{settings.showProgress && (
					<QuestionProgress
						current={questionIndex + 1}
						total={totalQuestions}
						score={score}
						maxScore={question.points || 10}
					/>
				)}
				{settings.showTimer && (
					<View style={styles.timerContainer}>
						<Ionicons name="time" size={16} color={theme.colors.primary} />
						<Text style={styles.timerText}>
							{Math.floor(timeLeft / 60)}:
							{(timeLeft % 60).toString().padStart(2, "0")}
						</Text>
					</View>
				)}
			</View>

			{/* Question Content */}
			<ScrollView
				style={styles.questionContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Question Text */}
				<View style={styles.questionHeader}>
					<Text style={styles.questionText}>{question.question_text}</Text>
					{question.audio_url && settings.soundEnabled && (
						<TouchableOpacity
							style={styles.audioButton}
							onPress={() =>
								SpeechService.speakVocabulary(question.question_text)
							}
						>
							<Ionicons
								name="volume-high"
								size={24}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					)}
				</View>

				{/* Question Image */}
				{question.image_url && (
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: question.image_url }}
							style={styles.questionImage}
						/>
					</View>
				)}

				{/* Dynamic Question Renderer */}
				{renderQuestionContent()}

				{/* Hints */}
				{settings.showHints && question.explanation && (
					<View style={styles.hintsContainer}>
						<TouchableOpacity
							style={styles.hintButton}
							onPress={() => handleHintRequest(0)}
							disabled={hintsUsed.includes(0)}
						>
							<Ionicons
								name={hintsUsed.includes(0) ? "bulb" : "bulb-outline"}
								size={20}
								color={
									hintsUsed.includes(0)
										? theme.colors.warning
										: theme.colors.primary
								}
							/>
							<Text style={styles.hintButtonText}>
								{hintsUsed.includes(0) ? "Hint Used" : "Get Hint"}
							</Text>
						</TouchableOpacity>
						{hintsUsed.includes(0) && (
							<Text style={styles.hintText}>{question.explanation}</Text>
						)}
					</View>
				)}

				{/* Feedback */}
				{isAnswered && settings.showExplanation && (
					<View
						style={[
							styles.feedbackContainer,
							isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
						]}
					>
						<View style={styles.feedbackHeader}>
							<Ionicons
								name={isCorrect ? "checkmark-circle" : "close-circle"}
								size={24}
								color={isCorrect ? theme.colors.success : theme.colors.error}
							/>
							<Text
								style={[
									styles.feedbackTitle,
									{
										color: isCorrect
											? theme.colors.success
											: theme.colors.error,
									},
								]}
							>
								{isCorrect ? "Correct!" : "Incorrect"}
							</Text>
						</View>
						{question.explanation && (
							<Text style={styles.feedbackText}>{question.explanation}</Text>
						)}
						<Text style={styles.scoreText}>Score: {score} points</Text>
					</View>
				)}
			</ScrollView>

			{/* Action Buttons */}
			<View style={styles.actionButtons}>
				{settings.allowPrevious && onPrevious && (
					<TouchableOpacity style={styles.secondaryButton} onPress={onPrevious}>
						<Ionicons name="chevron-back" size={20} color={theme.colors.text} />
						<Text style={styles.secondaryButtonText}>Previous</Text>
					</TouchableOpacity>
				)}

				{settings.allowSkip && !isAnswered && (
					<TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
						<Text style={styles.secondaryButtonText}>Skip</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={theme.colors.text}
						/>
					</TouchableOpacity>
				)}

				{isAnswered ? (
					<View style={styles.mainButtonContainer}>
						{!isCorrect && attempts < settings.maxAttempts && (
							<TouchableOpacity
								style={styles.retryButton}
								onPress={handleRetry}
							>
								<Ionicons name="refresh" size={20} color="#fff" />
								<Text style={styles.retryButtonText}>Try Again</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity style={styles.nextButton} onPress={onNext}>
							<Text style={styles.nextButtonText}>Next Question</Text>
							<Ionicons name="chevron-forward" size={20} color="#fff" />
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={[
							styles.submitButton,
							!currentAnswer && styles.submitButtonDisabled,
						]}
						onPress={() => handleAnswer(currentAnswer, false)}
						disabled={!currentAnswer}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				)}
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	questionContent: {
		flex: 1,
		padding: 16,
	},
	questionHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	questionText: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		flex: 1,
		lineHeight: 24,
	},
	audioButton: {
		marginLeft: 12,
		padding: 8,
		borderRadius: 20,
		backgroundColor: theme.colors.primary + "20",
	},
	imageContainer: {
		marginBottom: 16,
		alignItems: "center",
	},
	questionImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
		resizeMode: "contain",
	},
	feedbackContainer: {
		marginTop: 16,
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
	},
	correctFeedback: {
		backgroundColor: theme.colors.success + "10",
		borderColor: theme.colors.success,
	},
	incorrectFeedback: {
		backgroundColor: theme.colors.error + "10",
		borderColor: theme.colors.error,
	},
	feedbackHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	feedbackTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	feedbackText: {
		fontSize: 14,
		color: theme.colors.text,
		lineHeight: 20,
		marginBottom: 8,
	},
	scoreText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	secondaryButtonText: {
		fontSize: 16,
		color: theme.colors.text,
		marginHorizontal: 4,
	},
	mainButtonContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		minWidth: 120,
		alignItems: "center",
	},
	submitButtonDisabled: {
		backgroundColor: theme.colors.border,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	retryButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.warning,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 4,
	},
	nextButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.success,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		marginRight: 4,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	errorText: {
		fontSize: 16,
		color: theme.colors.error,
		textAlign: "center",
	},
	// Timer styles
	timerContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: theme.colors.primary + "20",
		borderRadius: 12,
	},
	timerText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
		marginLeft: 4,
	},
	// Hints styles
	hintsContainer: {
		marginTop: 16,
		padding: 16,
		backgroundColor: theme.colors.surface,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	hintButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: theme.colors.primary + "10",
		borderRadius: 6,
		alignSelf: "flex-start",
	},
	hintButtonText: {
		fontSize: 14,
		color: theme.colors.primary,
		marginLeft: 6,
		fontWeight: "500",
	},
	hintText: {
		fontSize: 14,
		color: theme.colors.text,
		lineHeight: 20,
		marginTop: 8,
		fontStyle: "italic",
	},
});
