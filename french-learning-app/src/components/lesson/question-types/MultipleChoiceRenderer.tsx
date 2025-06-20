// Multiple Choice Question Renderer - Stage 4.2
// Interactive multiple choice question component

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Pressable,
	Animated,
} from "react-native";
import { Audio } from "expo-av";
import { theme } from "../../../constants/theme";
import { BaseQuestionProps } from "../../../types/QuestionTypes";
import { Question } from "../../../types";

interface MultipleChoiceProps extends BaseQuestionProps {
	question: Question;
}

export const MultipleChoiceRenderer: React.FC<MultipleChoiceProps> = ({
	question,
	onAnswer,
	isAnswered,
	userAnswer,
	showCorrectAnswer,
	disabled,
	timeUp,
}) => {
	const [selectedOption, setSelectedOption] = useState<string>(
		typeof userAnswer === "string" ? userAnswer : ""
	);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [animatedValues] = useState(
		question.options?.map(() => new Animated.Value(1)) || []
	);

	const options = (question.options as string[]) || [];

	useEffect(() => {
		if (timeUp && !isAnswered) {
			handleSubmit();
		}
	}, [timeUp, isAnswered]);

	useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

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

	const handleOptionSelect = (option: string, index: number) => {
		if (disabled) return;

		setSelectedOption(option);

		// Animate selection
		Animated.sequence([
			Animated.timing(animatedValues[index], {
				toValue: 0.9,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(animatedValues[index], {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handleSubmit = () => {
		if (!selectedOption && !timeUp) return;

		const startTime = Date.now();
		const answer = selectedOption || "";
		const isCorrect =
			answer.toLowerCase().trim() ===
			question.correct_answer.toLowerCase().trim();

		onAnswer(answer, isCorrect, Date.now() - startTime);
	};
	const getOptionStyle = (option: string, index: number) => {
		const baseStyles: any[] = [styles.option];

		if (isAnswered || showCorrectAnswer) {
			if (option === question.correct_answer) {
				baseStyles.push(styles.correctOption);
			} else if (
				option === selectedOption &&
				option !== question.correct_answer
			) {
				baseStyles.push(styles.incorrectOption);
			} else if (option === selectedOption) {
				baseStyles.push(styles.selectedOption);
			}
		} else if (option === selectedOption) {
			baseStyles.push(styles.selectedOption);
		}

		if (disabled) {
			baseStyles.push(styles.disabledOption);
		}

		return baseStyles;
	};

	const getOptionTextStyle = (option: string) => {
		const baseStyles: any[] = [styles.optionText];

		if (isAnswered || showCorrectAnswer) {
			if (option === question.correct_answer) {
				baseStyles.push(styles.correctOptionText);
			} else if (
				option === selectedOption &&
				option !== question.correct_answer
			) {
				baseStyles.push(styles.incorrectOptionText);
			}
		}

		return baseStyles;
	};

	const renderOptionIcon = (option: string) => {
		if (!isAnswered && !showCorrectAnswer) {
			return option === selectedOption ? "●" : "○";
		}

		if (option === question.correct_answer) {
			return "✓";
		} else if (
			option === selectedOption &&
			option !== question.correct_answer
		) {
			return "✗";
		}

		return "○";
	};

	return (
		<View style={styles.container}>
			{/* Question Header */}
			<View style={styles.questionHeader}>
				<Text style={styles.questionText}>{question.question_text}</Text>

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

			{/* Options */}
			<View style={styles.optionsContainer}>
				{options.map((option, index) => {
					const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

					return (
						<Animated.View
							key={index}
							style={[{ transform: [{ scale: animatedValues[index] }] }]}
						>
							<Pressable
								style={getOptionStyle(option, index)}
								onPress={() => handleOptionSelect(option, index)}
								disabled={disabled}
								android_ripple={{ color: theme.colors.primary + "20" }}
							>
								<View style={styles.optionContent}>
									<View style={styles.optionPrefix}>
										<Text style={styles.optionLetter}>{optionLetter}</Text>
										<Text style={styles.optionIcon}>
											{renderOptionIcon(option)}
										</Text>
									</View>
									<Text style={getOptionTextStyle(option)}>{option}</Text>
								</View>
							</Pressable>
						</Animated.View>
					);
				})}
			</View>

			{/* Submit Button */}
			{!isAnswered && selectedOption && (
				<TouchableOpacity
					style={[styles.submitButton, disabled && styles.disabledSubmitButton]}
					onPress={handleSubmit}
					disabled={disabled}
				>
					<Text style={styles.submitButtonText}>Submit Answer</Text>
				</TouchableOpacity>
			)}

			{/* Time Up Indicator */}
			{timeUp && (
				<View style={styles.timeUpContainer}>
					<Text style={styles.timeUpText}>⏰ Time's up!</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	questionHeader: {
		marginBottom: theme.spacing.lg,
	},
	questionText: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		lineHeight: 26,
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
	optionsContainer: {
		gap: theme.spacing.md,
	},
	option: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.lg,
		borderWidth: 2,
		borderColor: theme.colors.border,
	},
	selectedOption: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primary + "10",
	},
	correctOption: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "15",
	},
	incorrectOption: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "15",
	},
	disabledOption: {
		opacity: 0.6,
	},
	optionContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionPrefix: {
		marginRight: theme.spacing.md,
		alignItems: "center",
		minWidth: 40,
	},
	optionLetter: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.textSecondary,
		marginBottom: 2,
	},
	optionIcon: {
		fontSize: 16,
		color: theme.colors.primary,
	},
	optionText: {
		flex: 1,
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 22,
	},
	correctOptionText: {
		color: "#4CAF50",
		fontWeight: "600",
	},
	incorrectOptionText: {
		color: "#F44336",
	},
	submitButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: theme.spacing.lg,
		marginTop: theme.spacing.xl,
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
