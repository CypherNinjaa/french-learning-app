// Fill-in-the-Blank Question Renderer - Stage 4.2
// Interactive fill-in-the-blank question component

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	ScrollView,
	Alert,
} from "react-native";
import { Audio } from "expo-av";
import { theme } from "../../../constants/theme";
import { BaseQuestionProps } from "../../../types/QuestionTypes";
import { Question } from "../../../types";

interface FillInBlankProps extends BaseQuestionProps {
	question: Question;
}

interface BlankInput {
	id: string;
	value: string;
	position: number;
	isCorrect?: boolean;
}

export const FillInBlankRenderer: React.FC<FillInBlankProps> = ({
	question,
	onAnswer,
	isAnswered,
	userAnswer,
	showCorrectAnswer,
	disabled,
	timeUp,
}) => {
	const [blanks, setBlanks] = useState<BlankInput[]>([]);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [questionParts, setQuestionParts] = useState<string[]>([]);

	useEffect(() => {
		initializeBlanks();
	}, [question]);

	useEffect(() => {
		if (timeUp && !isAnswered) {
			handleSubmit();
		}
	}, [timeUp, isAnswered]);

	useEffect(() => {
		if (Array.isArray(userAnswer) && userAnswer.length > 0) {
			setBlanks((prev) =>
				prev.map((blank, index) => ({
					...blank,
					value: userAnswer[index] || "",
				}))
			);
		}
	}, [userAnswer]);

	useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

	const initializeBlanks = () => {
		// Parse question text to find blanks marked with [BLANK] or {blank}
		const text = question.question_text;
		const blankRegex = /\[BLANK\]|\{blank\}/gi;
		const parts = text.split(blankRegex);
		const blankCount = (text.match(blankRegex) || []).length;

		setQuestionParts(parts);

		const initialBlanks: BlankInput[] = Array.from(
			{ length: blankCount },
			(_, index) => ({
				id: `blank_${index}`,
				value: "",
				position: index,
			})
		);

		setBlanks(initialBlanks);
	};

	const playAudio = async () => {
		if (question.audio_url) {
			try {
				const { sound } = await Audio.Sound.createAsync({
					uri: question.audio_url,
				});
				setSound(sound);
				await sound.playAsync();
			} catch (error) {
				console.log("Error playing audio:", error);
			}
		}
	};

	const updateBlankValue = (blankId: string, value: string) => {
		if (disabled) return;

		setBlanks((prev) =>
			prev.map((blank) => (blank.id === blankId ? { ...blank, value } : blank))
		);
	};

	const handleSubmit = () => {
		const answers = blanks.map((blank) => blank.value.trim());
		const correctAnswers = question.correct_answer.split("|"); // Multiple answers separated by |

		if (answers.some((answer) => answer === "") && !timeUp) {
			Alert.alert("Incomplete", "Please fill in all blanks before submitting.");
			return;
		}

		const startTime = Date.now();
		let correctCount = 0;

		// Check each blank
		const updatedBlanks = blanks.map((blank, index) => {
			const possibleAnswers = correctAnswers[index]?.split(",") || [];
			const isCorrect = possibleAnswers.some(
				(possible) =>
					possible.toLowerCase().trim() === blank.value.toLowerCase().trim()
			);

			if (isCorrect) correctCount++;

			return { ...blank, isCorrect };
		});

		setBlanks(updatedBlanks);

		const isAllCorrect = correctCount === blanks.length;
		const partialScore = (correctCount / blanks.length) * 100;

		onAnswer(answers, isAllCorrect, Date.now() - startTime);
	};
	const getBlankStyle = (blank: BlankInput) => {
		const baseStyles: any[] = [styles.blankInput];

		if (isAnswered || showCorrectAnswer) {
			if (blank.isCorrect === true) {
				baseStyles.push(styles.correctBlank);
			} else if (blank.isCorrect === false) {
				baseStyles.push(styles.incorrectBlank);
			}
		}

		if (disabled) {
			baseStyles.push(styles.disabledBlank);
		}

		return baseStyles;
	};

	const renderQuestionWithBlanks = () => {
		const elements = [];

		for (let i = 0; i < questionParts.length; i++) {
			// Add text part
			if (questionParts[i]) {
				elements.push(
					<Text key={`text_${i}`} style={styles.questionTextPart}>
						{questionParts[i]}
					</Text>
				);
			}

			// Add blank input (except after the last part)
			if (i < blanks.length && blanks[i]) {
				const blank = blanks[i];
				elements.push(
					<View key={`blank_${i}`} style={styles.blankContainer}>
						<TextInput
							style={getBlankStyle(blank)}
							value={blank.value}
							onChangeText={(value) => updateBlankValue(blank.id, value)}
							placeholder="___"
							editable={!disabled}
							autoCapitalize="none"
							autoCorrect={false}
						/>
						{showCorrectAnswer && blank.isCorrect === false && (
							<Text style={styles.correctAnswerHint}>
								(Correct: {question.correct_answer.split("|")[i]?.split(",")[0]}
								)
							</Text>
						)}
					</View>
				);
			}
		}

		return elements;
	};

	const allBlanksFilled = blanks.every((blank) => blank.value.trim() !== "");

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
		>
			{/* Question Header */}
			<View style={styles.questionHeader}>
				<Text style={styles.instructionText}>Fill in the blanks:</Text>

				{question.audio_url && (
					<TouchableOpacity style={styles.audioButton} onPress={playAudio}>
						<Text style={styles.audioButtonText}>🔊 Play Audio</Text>
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

			{/* Question with Blanks */}
			<View style={styles.questionWithBlanks}>
				{renderQuestionWithBlanks()}
			</View>

			{/* Hints */}
			{question.explanation && !isAnswered && (
				<View style={styles.hintContainer}>
					<Text style={styles.hintTitle}>💡 Hint:</Text>
					<Text style={styles.hintText}>{question.explanation}</Text>
				</View>
			)}

			{/* Submit Button */}
			{!isAnswered && allBlanksFilled && (
				<TouchableOpacity
					style={[styles.submitButton, disabled && styles.disabledSubmitButton]}
					onPress={handleSubmit}
					disabled={disabled}
				>
					<Text style={styles.submitButtonText}>Submit Answer</Text>
				</TouchableOpacity>
			)}

			{/* Progress Indicator */}
			<View style={styles.progressContainer}>
				<Text style={styles.progressText}>
					{blanks.filter((b) => b.value.trim() !== "").length} / {blanks.length}{" "}
					blanks filled
				</Text>
			</View>

			{/* Time Up Indicator */}
			{timeUp && (
				<View style={styles.timeUpContainer}>
					<Text style={styles.timeUpText}>⏰ Time's up!</Text>
				</View>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		paddingBottom: theme.spacing.xl,
	},
	questionHeader: {
		marginBottom: theme.spacing.lg,
	},
	instructionText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	audioButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 8,
		alignSelf: "flex-start",
	},
	audioButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	imageContainer: {
		marginBottom: theme.spacing.lg,
		alignItems: "center",
	},
	questionImage: {
		width: "100%",
		height: 200,
		borderRadius: 12,
		resizeMode: "cover",
	},
	questionWithBlanks: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		lineHeight: 28,
		marginBottom: theme.spacing.lg,
	},
	questionTextPart: {
		fontSize: 18,
		color: theme.colors.text,
		lineHeight: 28,
	},
	blankContainer: {
		alignItems: "center",
		marginHorizontal: theme.spacing.xs,
	},
	blankInput: {
		borderBottomWidth: 2,
		borderBottomColor: theme.colors.border,
		minWidth: 80,
		maxWidth: 120,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		fontSize: 18,
		textAlign: "center",
		color: theme.colors.text,
	},
	correctBlank: {
		borderBottomColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "10",
	},
	incorrectBlank: {
		borderBottomColor: "#F44336",
		backgroundColor: "#F44336" + "10",
	},
	disabledBlank: {
		opacity: 0.6,
	},
	correctAnswerHint: {
		fontSize: 12,
		color: "#4CAF50",
		marginTop: theme.spacing.xs,
		fontStyle: "italic",
	},
	hintContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.lg,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	hintTitle: {
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	hintText: {
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginTop: theme.spacing.lg,
		alignItems: "center",
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
		alignItems: "center",
		marginTop: theme.spacing.md,
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	timeUpContainer: {
		backgroundColor: "#FF9800",
		padding: theme.spacing.md,
		borderRadius: 8,
		marginTop: theme.spacing.md,
		alignItems: "center",
	},
	timeUpText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
});
