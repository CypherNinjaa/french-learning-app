// Text Input Question Renderer - Stage 4.2
// Interactive text input validation component

import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Alert,
} from "react-native";
import { theme } from "../../../constants/theme";
import { BaseQuestionProps } from "../../../types/QuestionTypes";
import { Question } from "../../../types";

interface TextInputProps extends BaseQuestionProps {
	question: Question;
}

interface ValidationResult {
	isValid: boolean;
	score: number;
	feedback: string[];
	suggestions: string[];
}

export const TextInputRenderer: React.FC<TextInputProps> = ({
	question,
	onAnswer,
	isAnswered,
	userAnswer,
	showCorrectAnswer,
	disabled,
	timeUp,
}) => {
	const [inputValue, setInputValue] = useState<string>(
		typeof userAnswer === "string" ? userAnswer : ""
	);
	const [validation, setValidation] = useState<ValidationResult | null>(null);
	const [wordCount, setWordCount] = useState<number>(0);
	const [characterCount, setCharacterCount] = useState<number>(0);
	const inputRef = useRef<TextInput>(null);

	const inputType = (question.options as any)?.input_type || "text";
	const maxLength = (question.options as any)?.max_length || 500;
	const minLength = (question.options as any)?.min_length || 1;
	const placeholder =
		(question.options as any)?.placeholder || "Type your answer here...";

	useEffect(() => {
		if (timeUp && !isAnswered) {
			handleSubmit();
		}
	}, [timeUp, isAnswered]);

	useEffect(() => {
		// Update counts when input changes
		const words = inputValue
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0);
		setWordCount(words.length);
		setCharacterCount(inputValue.length);
	}, [inputValue]);

	const validateInput = (text: string): ValidationResult => {
		const correctAnswers = question.correct_answer.split("|"); // Multiple acceptable answers
		const feedback: string[] = [];
		const suggestions: string[] = [];
		let score = 0;
		let isValid = false;

		// Check for exact matches first
		for (const correctAnswer of correctAnswers) {
			if (text.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
				isValid = true;
				score = 100;
				feedback.push("Perfect match!");
				return { isValid, score, feedback, suggestions };
			}
		}

		// Check for partial matches and provide feedback
		const userWords = text.toLowerCase().trim().split(/\s+/);
		const correctWords = correctAnswers[0].toLowerCase().trim().split(/\s+/);

		// Word-by-word comparison
		let matchingWords = 0;
		const missingWords: string[] = [];
		const extraWords: string[] = [];

		correctWords.forEach((word) => {
			if (userWords.includes(word)) {
				matchingWords++;
			} else {
				missingWords.push(word);
			}
		});

		userWords.forEach((word) => {
			if (!correctWords.includes(word)) {
				extraWords.push(word);
			}
		});

		// Calculate partial score
		if (matchingWords > 0) {
			score = Math.round((matchingWords / correctWords.length) * 100);

			if (score >= 70) {
				feedback.push("Very close! Almost there.");
				isValid = true;
			} else if (score >= 50) {
				feedback.push("Good attempt, but needs improvement.");
			} else {
				feedback.push("Keep trying! You're on the right track.");
			}
		}

		// Provide specific suggestions
		if (missingWords.length > 0) {
			suggestions.push(`Missing words: ${missingWords.join(", ")}`);
		}

		if (extraWords.length > 0) {
			suggestions.push(
				`Extra words that might not be needed: ${extraWords.join(", ")}`
			);
		}

		// Length validation
		if (text.length < minLength) {
			suggestions.push(`Try to write at least ${minLength} characters.`);
		}

		// Grammar and spelling suggestions (simplified)
		if (inputType === "sentence" && !text.match(/^[A-Z]/) && text.length > 0) {
			suggestions.push("Remember to start with a capital letter.");
		}

		if (inputType === "sentence" && !text.match(/[.!?]$/) && text.length > 0) {
			suggestions.push("Don't forget punctuation at the end.");
		}

		return { isValid, score, feedback, suggestions };
	};

	const handleInputChange = (text: string) => {
		if (disabled) return;

		setInputValue(text);

		// Real-time validation for immediate feedback
		if (text.length > 2) {
			const result = validateInput(text);
			setValidation(result);
		} else {
			setValidation(null);
		}
	};

	const handleSubmit = () => {
		if (!inputValue.trim() && !timeUp) {
			Alert.alert(
				"Empty Answer",
				"Please enter your answer before submitting."
			);
			return;
		}

		const startTime = Date.now();
		const result = validateInput(inputValue);
		setValidation(result);

		onAnswer(inputValue.trim(), result.isValid, Date.now() - startTime);
	};
	const getInputStyle = () => {
		const baseStyles: any[] = [styles.textInput];

		if (inputType === "paragraph") {
			baseStyles.push(styles.paragraphInput);
		}

		if (validation) {
			if (validation.isValid) {
				baseStyles.push(styles.validInput);
			} else if (validation.score > 0) {
				baseStyles.push(styles.partialInput);
			} else {
				baseStyles.push(styles.invalidInput);
			}
		}

		if (disabled) {
			baseStyles.push(styles.disabledInput);
		}

		return baseStyles;
	};

	const showValidation = validation && (isAnswered || validation.score > 50);

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Question */}
				<View style={styles.questionContainer}>
					<Text style={styles.questionText}>{question.question_text}</Text>

					{inputType === "sentence" && (
						<Text style={styles.instructionText}>
							Write a complete sentence in French.
						</Text>
					)}

					{inputType === "paragraph" && (
						<Text style={styles.instructionText}>
							Write a short paragraph (3-5 sentences) in French.
						</Text>
					)}
				</View>

				{/* Text Input */}
				<View style={styles.inputContainer}>
					<TextInput
						ref={inputRef}
						style={getInputStyle()}
						value={inputValue}
						onChangeText={handleInputChange}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.textSecondary}
						multiline={inputType === "paragraph"}
						numberOfLines={inputType === "paragraph" ? 6 : 1}
						maxLength={maxLength}
						editable={!disabled}
						autoCapitalize="sentences"
						autoCorrect={false}
						keyboardType="default"
						returnKeyType="done"
						onSubmitEditing={inputType === "text" ? handleSubmit : undefined}
					/>

					{/* Character/Word Count */}
					<View style={styles.countsContainer}>
						<Text style={styles.countText}>
							{characterCount}/{maxLength} characters
						</Text>
						{inputType === "paragraph" && (
							<Text style={styles.countText}>{wordCount} words</Text>
						)}
					</View>
				</View>

				{/* Real-time Validation Feedback */}
				{showValidation && (
					<View style={styles.validationContainer}>
						<View style={styles.scoreContainer}>
							<Text style={styles.scoreText}>Score: {validation.score}%</Text>
							<View
								style={[
									styles.scoreBar,
									{
										backgroundColor: validation.isValid ? "#4CAF50" : "#FF9800",
									},
								]}
							>
								<View
									style={[
										styles.scoreProgress,
										{ width: `${validation.score}%` },
									]}
								/>
							</View>
						</View>

						{validation.feedback.map((feedback, index) => (
							<Text key={index} style={styles.feedbackText}>
								💬 {feedback}
							</Text>
						))}

						{validation.suggestions.map((suggestion, index) => (
							<Text key={index} style={styles.suggestionText}>
								💡 {suggestion}
							</Text>
						))}
					</View>
				)}

				{/* Correct Answer (when shown) */}
				{showCorrectAnswer && !validation?.isValid && (
					<View style={styles.correctAnswerContainer}>
						<Text style={styles.correctAnswerTitle}>Correct Answer:</Text>
						<Text style={styles.correctAnswerText}>
							{question.correct_answer.split("|")[0]}
						</Text>
						{question.explanation && (
							<Text style={styles.explanationText}>{question.explanation}</Text>
						)}
					</View>
				)}

				{/* Submit Button */}
				{!isAnswered && inputValue.trim().length >= minLength && (
					<TouchableOpacity
						style={[
							styles.submitButton,
							disabled && styles.disabledSubmitButton,
						]}
						onPress={handleSubmit}
						disabled={disabled}
					>
						<Text style={styles.submitButtonText}>Submit Answer</Text>
					</TouchableOpacity>
				)}

				{/* Progress Indicator */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						{inputValue.length >= minLength ? "✓" : "○"} Minimum length reached
					</Text>
					{inputType === "sentence" && (
						<Text style={styles.progressText}>
							{inputValue.match(/^[A-Z]/) ? "✓" : "○"} Starts with capital
							letter
						</Text>
					)}
					{inputType === "sentence" && (
						<Text style={styles.progressText}>
							{inputValue.match(/[.!?]$/) ? "✓" : "○"} Ends with punctuation
						</Text>
					)}
				</View>

				{/* Time Up Indicator */}
				{timeUp && (
					<View style={styles.timeUpContainer}>
						<Text style={styles.timeUpText}>⏰ Time's up!</Text>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: theme.spacing.xl,
	},
	questionContainer: {
		marginBottom: theme.spacing.lg,
	},
	questionText: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		lineHeight: 26,
		marginBottom: theme.spacing.sm,
	},
	instructionText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	inputContainer: {
		marginBottom: theme.spacing.lg,
	},
	textInput: {
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.border,
		borderRadius: 12,
		padding: theme.spacing.lg,
		fontSize: 16,
		color: theme.colors.text,
		textAlignVertical: "top",
	},
	paragraphInput: {
		height: 150,
	},
	validInput: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "05",
	},
	partialInput: {
		borderColor: "#FF9800",
		backgroundColor: "#FF9800" + "05",
	},
	invalidInput: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "05",
	},
	disabledInput: {
		opacity: 0.6,
	},
	countsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: theme.spacing.sm,
	},
	countText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
	},
	validationContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	scoreContainer: {
		marginBottom: theme.spacing.md,
	},
	scoreText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	scoreBar: {
		height: 8,
		backgroundColor: theme.colors.border,
		borderRadius: 4,
		overflow: "hidden",
	},
	scoreProgress: {
		height: "100%",
		backgroundColor: "#4CAF50",
	},
	feedbackText: {
		fontSize: 14,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
		fontWeight: "500",
	},
	suggestionText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	correctAnswerContainer: {
		backgroundColor: "#4CAF50" + "10",
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderLeftWidth: 4,
		borderLeftColor: "#4CAF50",
	},
	correctAnswerTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#4CAF50",
		marginBottom: theme.spacing.sm,
	},
	correctAnswerText: {
		fontSize: 16,
		color: theme.colors.text,
		fontWeight: "500",
		marginBottom: theme.spacing.sm,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: theme.spacing.lg,
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	disabledSubmitButton: {
		opacity: 0.5,
	},
	submitButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	progressContainer: {
		marginBottom: theme.spacing.lg,
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	timeUpContainer: {
		backgroundColor: "#FF9800",
		padding: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
	},
	timeUpText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
});
