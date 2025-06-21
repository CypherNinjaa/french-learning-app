// Enhanced Question Renderer - Stage 4.2
// Central component for rendering all question types with gamification integration

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { theme } from "../../constants/theme";
import {
	EnhancedQuestion,
	QuestionResult,
	QuestionState,
	QuestionRendererProps,
	QuestionFeedback,
} from "../../types/QuestionTypes";
import { useGamification } from "../../hooks/useGamification";

// Question type components
import {
	MultipleChoiceRenderer,
	FillInBlankRenderer,
	DragAndDropRenderer,
	TextInputRenderer,
	ImageBasedRenderer,
} from "./question-types";

// UI Components
import {
	QuestionProgress,
	QuestionTimer,
	QuestionFeedbackModal,
	QuestionHints,
} from "./ui";

export const EnhancedQuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	onAnswer,
	onNext,
	onPrevious,
	onSkip,
	onHint,
	settings,
}) => {
	const { completeActivity } = useGamification();

	const [questionState, setQuestionState] = useState<QuestionState>({
		currentAnswer:
			question.question_config.type === "multiple_choice" ? "" : [],
		isAnswered: false,
		showFeedback: false,
		startTime: Date.now(),
		timeSpent: 0,
		attempts: 0,
		hints_used: [],
		partial_score: 0,
	});

	const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
	const [timeUp, setTimeUp] = useState(false);

	// Handle time limit
	useEffect(() => {
		if (settings.time_limit && settings.time_limit > 0) {
			const timer = setTimeout(() => {
				setTimeUp(true);
				handleTimeout();
			}, settings.time_limit * 1000);

			return () => clearTimeout(timer);
		}
	}, [settings.time_limit]);

	// Update time spent
	useEffect(() => {
		const interval = setInterval(() => {
			setQuestionState((prev) => ({
				...prev,
				timeSpent: Date.now() - prev.startTime,
			}));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleTimeout = useCallback(() => {
		if (!questionState.isAnswered) {
			const result: QuestionResult = {
				question_id: question.id,
				user_answer: questionState.currentAnswer,
				correct_answer: question.correct_answer,
				is_correct: false,
				time_spent: settings.time_limit! * 1000,
				attempts: questionState.attempts,
				partial_score: 0,
				hints_used: questionState.hints_used,
				feedback_shown: false,
			};

			onAnswer(result);
		}
	}, [question, questionState, settings.time_limit, onAnswer]);

	const handleAnswerSubmit = useCallback(
		(answer: string | string[]) => {
			const timeSpent = Date.now() - questionState.startTime;
			const attempts = questionState.attempts + 1;

			// Calculate if answer is correct
			const isCorrect = checkAnswer(answer, question.correct_answer);
			const partialScore = calculatePartialScore(answer, question, isCorrect);

			// Create result object
			const result: QuestionResult = {
				question_id: question.id,
				user_answer: answer,
				correct_answer: question.correct_answer,
				is_correct: isCorrect,
				time_spent: timeSpent,
				attempts: attempts,
				partial_score: partialScore,
				hints_used: questionState.hints_used,
				feedback_shown: settings.show_immediate_feedback,
			};

			// Update state
			setQuestionState((prev) => ({
				...prev,
				currentAnswer: answer,
				isAnswered: true,
				isCorrect: isCorrect,
				attempts: attempts,
				timeSpent: timeSpent,
				partial_score: partialScore,
				showFeedback: settings.show_immediate_feedback,
			})); // Generate feedback
			if (settings.show_immediate_feedback) {
				const questionFeedback = generateFeedback(result, question);
				setFeedback(questionFeedback);
			}

			// Award points for question completion using gamification system
			if (isCorrect || partialScore > 0) {
				const activityType = getActivityTypeForQuestion(
					question.question_config.type
				);
				const basePoints = getBasePointsForQuestion(
					question.question_config.type
				);

				completeActivity(activityType, basePoints, {
					questionId: question.id,
					questionType: question.question_config.type,
					isCorrect,
					partialScore,
					timeSpent,
					attempts,
					hintsUsed: questionState.hints_used.length,
					difficulty: question.difficulty_level || "beginner",
					isFirstAttempt: attempts === 1,
				}).catch((error) => {
					console.error("Error awarding points for question:", error);
				});
			}

			// Call parent callback
			onAnswer(result);

			// Auto advance if enabled and correct
			if (settings.auto_advance && isCorrect) {
				setTimeout(
					() => {
						onNext();
					},
					settings.show_immediate_feedback ? 2000 : 500
				);
			}
		},
		[question, questionState, settings, onAnswer, onNext, completeActivity]
	);

	const handleRetry = useCallback(() => {
		if (
			settings.allow_multiple_attempts &&
			questionState.attempts <
				(question.question_config.ui_config.max_attempts || 3)
		) {
			setQuestionState((prev) => ({
				...prev,
				isAnswered: false,
				showFeedback: false,
				currentAnswer:
					question.question_config.type === "multiple_choice" ? "" : [],
			}));
			setFeedback(null);
		}
	}, [settings.allow_multiple_attempts, questionState.attempts, question]);

	const handleHintRequest = useCallback(
		(hintId: string) => {
			if (settings.enable_hints && !questionState.hints_used.includes(hintId)) {
				setQuestionState((prev) => ({
					...prev,
					hints_used: [...prev.hints_used, hintId],
				}));

				if (onHint) {
					onHint(hintId);
				}
			}
		},
		[settings.enable_hints, questionState.hints_used, onHint]
	);

	const renderQuestionType = () => {
		const baseProps = {
			question,
			onAnswer: handleAnswerSubmit,
			isAnswered: questionState.isAnswered,
			userAnswer: questionState.currentAnswer,
			showCorrectAnswer:
				settings.show_correct_answer && questionState.isAnswered,
			disabled: questionState.isAnswered && !settings.allow_multiple_attempts,
			timeUp,
		};

		switch (question.question_config.type) {
			case "multiple_choice":
				return <MultipleChoiceRenderer {...baseProps} />;
			case "fill_blank":
				return <FillInBlankRenderer {...baseProps} />;
			case "drag_drop":
				return <DragAndDropRenderer {...baseProps} />;
			case "text_input":
				return <TextInputRenderer {...baseProps} />;
			case "image_based":
				return <ImageBasedRenderer {...baseProps} />;
			default:
				return (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>Unsupported question type</Text>
					</View>
				);
		}
	};

	return (
		<View style={styles.container}>
			{/* Progress and Timer Header */}
			<View style={styles.header}>
				<QuestionProgress
					current={1}
					total={1}
					score={questionState.partial_score || 0}
					maxScore={question.points}
				/>
				{settings.time_limit && (
					<QuestionTimer
						timeLimit={settings.time_limit}
						startTime={questionState.startTime}
						onTimeout={handleTimeout}
					/>
				)}
			</View>

			{/* Question Content */}
			<View style={styles.content}>{renderQuestionType()}</View>

			{/* Hints */}
			{settings.enable_hints &&
				question.question_config.ui_config.hint_enabled && (
					<QuestionHints
						question={question}
						hintsUsed={questionState.hints_used}
						onHintRequest={handleHintRequest}
						disabled={questionState.isAnswered}
					/>
				)}

			{/* Feedback Modal */}
			{feedback && questionState.showFeedback && (
				<QuestionFeedbackModal
					feedback={feedback}
					onClose={() => {
						setQuestionState((prev) => ({ ...prev, showFeedback: false }));
						setFeedback(null);
					}}
					onRetry={settings.allow_multiple_attempts ? handleRetry : undefined}
					onNext={onNext}
					showRetry={
						settings.allow_multiple_attempts &&
						!feedback.is_correct &&
						questionState.attempts <
							(question.question_config.ui_config.max_attempts || 3)
					}
				/>
			)}
		</View>
	);
};

// Helper functions
function checkAnswer(
	userAnswer: string | string[],
	correctAnswer: string
): boolean {
	if (Array.isArray(userAnswer)) {
		// For fill-in-blank or multi-part answers
		const correctAnswers = correctAnswer.split("|"); // Multiple correct answers separated by |
		return userAnswer.every((answer, index) => {
			const possibleAnswers = correctAnswers[index]?.split(",") || [];
			return possibleAnswers.some(
				(possible) =>
					possible.toLowerCase().trim() === answer.toLowerCase().trim()
			);
		});
	} else {
		// For single answers
		const possibleAnswers = correctAnswer.split(",");
		return possibleAnswers.some(
			(possible) =>
				possible.toLowerCase().trim() === userAnswer.toLowerCase().trim()
		);
	}
}

function calculatePartialScore(
	userAnswer: string | string[],
	question: EnhancedQuestion,
	isCorrect: boolean
): number {
	if (isCorrect) {
		return question.points;
	}

	if (!question.question_config.scoring.partial_credit) {
		return 0;
	}

	// Implement partial scoring logic based on question type
	// This is a simplified version - can be enhanced based on specific requirements
	if (Array.isArray(userAnswer)) {
		const correctAnswers = question.correct_answer.split("|");
		const correctCount = userAnswer.filter((answer, index) => {
			const possibleAnswers = correctAnswers[index]?.split(",") || [];
			return possibleAnswers.some(
				(possible) =>
					possible.toLowerCase().trim() === answer.toLowerCase().trim()
			);
		}).length;

		return Math.round((correctCount / userAnswer.length) * question.points);
	}
	return 0;
}

// Helper function to get activity type for gamification based on question type
function getActivityTypeForQuestion(questionType: string): string {
	switch (questionType) {
		case "multiple_choice":
			return "multiple_choice_question";
		case "fill_blank":
			return "grammar_exercise";
		case "drag_drop":
			return "vocabulary_quiz";
		case "text_input":
			return "grammar_exercise";
		case "image_based":
			return "vocabulary_quiz";
		default:
			return "question_completion";
	}
}

// Helper function to get base points for different question types based on gamification rules
function getBasePointsForQuestion(questionType: string): number {
	switch (questionType) {
		case "multiple_choice":
			return 2; // Multiple Choice (Correct): 2 points
		case "fill_blank":
			return 3; // Fill-in-the-Blank (Correct): 3 points
		case "drag_drop":
			return 2; // Vocabulary Match: 2 points
		case "text_input":
			return 3; // Grammar Exercise: 3 points
		case "image_based":
			return 2; // Vocabulary Match: 2 points
		default:
			return 2; // Default base points
	}
}

function generateFeedback(
	result: QuestionResult,
	question: EnhancedQuestion
): QuestionFeedback {
	const encouragements = {
		correct: ["Excellent!", "Great job!", "Perfect!", "Well done!", "Bravo!"],
		incorrect: [
			"Keep trying!",
			"Almost there!",
			"Good effort!",
			"Try again!",
			"You can do it!",
		],
		partial: [
			"Good start!",
			"Getting closer!",
			"Nice try!",
			"On the right track!",
		],
	};

	let category: "correct" | "incorrect" | "partial" = "incorrect";
	if (result.is_correct) {
		category = "correct";
	} else if (result.partial_score > 0) {
		category = "partial";
	}

	const encouragement =
		encouragements[category][
			Math.floor(Math.random() * encouragements[category].length)
		];

	return {
		is_correct: result.is_correct,
		score: result.partial_score,
		max_score: question.points,
		explanation: question.explanation,
		correct_answer: question.correct_answer,
		encouragement,
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	content: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		color: theme.colors.error,
		textAlign: "center",
	},
});
