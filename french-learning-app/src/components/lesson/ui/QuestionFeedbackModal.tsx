// Question Feedback Modal - Stage 4.2
// Modal for displaying question feedback and results

import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Animated,
} from "react-native";
import { theme } from "../../../constants/theme";
import { QuestionFeedback } from "../../../types/QuestionTypes";

interface QuestionFeedbackModalProps {
	feedback: QuestionFeedback;
	onClose: () => void;
	onRetry?: () => void;
	onNext: () => void;
	showRetry?: boolean;
}

export const QuestionFeedbackModal: React.FC<QuestionFeedbackModalProps> = ({
	feedback,
	onClose,
	onRetry,
	onNext,
	showRetry = false,
}) => {
	const scaleValue = new Animated.Value(0);

	React.useEffect(() => {
		Animated.spring(scaleValue, {
			toValue: 1,
			tension: 100,
			friction: 8,
			useNativeDriver: true,
		}).start();
	}, []);

	const handleClose = () => {
		Animated.timing(scaleValue, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			onClose();
		});
	};

	const getScoreColor = (): string => {
		if (feedback.is_correct) return "#4CAF50";
		if (feedback.score > feedback.max_score * 0.5) return "#FF9800";
		return "#F44336";
	};

	const getScoreIcon = (): string => {
		if (feedback.is_correct) return "🎉";
		if (feedback.score > feedback.max_score * 0.5) return "👍";
		return "💪";
	};

	return (
		<Modal
			transparent
			visible={true}
			animationType="fade"
			onRequestClose={handleClose}
		>
			<View style={styles.overlay}>
				<Animated.View
					style={[
						styles.modal,
						{
							transform: [{ scale: scaleValue }],
						},
					]}
				>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.icon}>{getScoreIcon()}</Text>
						<Text style={[styles.encouragement, { color: getScoreColor() }]}>
							{feedback.encouragement}
						</Text>
					</View>

					{/* Score */}
					<View style={styles.scoreSection}>
						<Text style={styles.scoreLabel}>Your Score</Text>
						<View style={styles.scoreContainer}>
							<Text style={[styles.scoreText, { color: getScoreColor() }]}>
								{feedback.score}
							</Text>
							<Text style={styles.maxScoreText}>/ {feedback.max_score}</Text>
						</View>

						{/* Progress Bar */}
						<View style={styles.progressContainer}>
							<View
								style={[
									styles.progressBar,
									{
										width: `${(feedback.score / feedback.max_score) * 100}%`,
										backgroundColor: getScoreColor(),
									},
								]}
							/>
						</View>
					</View>

					{/* Explanation */}
					{feedback.explanation && (
						<View style={styles.explanationSection}>
							<Text style={styles.explanationTitle}>Explanation</Text>
							<Text style={styles.explanationText}>{feedback.explanation}</Text>
						</View>
					)}

					{/* Correct Answer */}
					{!feedback.is_correct && feedback.correct_answer && (
						<View style={styles.correctAnswerSection}>
							<Text style={styles.correctAnswerTitle}>Correct Answer</Text>
							<Text style={styles.correctAnswerText}>
								{Array.isArray(feedback.correct_answer)
									? feedback.correct_answer.join(", ")
									: feedback.correct_answer}
							</Text>
						</View>
					)}

					{/* Hints */}
					{feedback.hints && feedback.hints.length > 0 && (
						<View style={styles.hintsSection}>
							<Text style={styles.hintsTitle}>💡 Hints for next time:</Text>
							{feedback.hints.map((hint, index) => (
								<Text key={index} style={styles.hintText}>
									• {hint}
								</Text>
							))}
						</View>
					)}

					{/* Actions */}
					<View style={styles.actionsContainer}>
						{showRetry && onRetry && (
							<TouchableOpacity
								style={[styles.button, styles.retryButton]}
								onPress={() => {
									handleClose();
									onRetry();
								}}
							>
								<Text style={styles.retryButtonText}>Try Again</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity
							style={[styles.button, styles.nextButton]}
							onPress={() => {
								handleClose();
								onNext();
							}}
						>
							<Text style={styles.nextButtonText}>
								{feedback.is_correct ? "Continue" : "Next Question"}
							</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.lg,
	},
	modal: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: theme.spacing.xl,
		width: "100%",
		maxWidth: 400,
		elevation: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
	},
	header: {
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	icon: {
		fontSize: 48,
		marginBottom: theme.spacing.md,
	},
	encouragement: {
		fontSize: 20,
		fontWeight: "600",
		textAlign: "center",
	},
	scoreSection: {
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	scoreLabel: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.sm,
	},
	scoreContainer: {
		flexDirection: "row",
		alignItems: "baseline",
		marginBottom: theme.spacing.md,
	},
	scoreText: {
		fontSize: 36,
		fontWeight: "bold",
	},
	maxScoreText: {
		fontSize: 20,
		color: theme.colors.textSecondary,
		marginLeft: 4,
	},
	progressContainer: {
		width: "100%",
		height: 8,
		backgroundColor: theme.colors.border,
		borderRadius: 4,
		overflow: "hidden",
	},
	progressBar: {
		height: "100%",
		borderRadius: 4,
	},
	explanationSection: {
		marginBottom: theme.spacing.lg,
	},
	explanationTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	correctAnswerSection: {
		backgroundColor: "#4CAF50" + "10",
		padding: theme.spacing.md,
		borderRadius: 8,
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
	},
	hintsSection: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.lg,
	},
	hintsTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	hintText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	actionsContainer: {
		flexDirection: "row",
		gap: theme.spacing.md,
	},
	button: {
		flex: 1,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: 8,
		alignItems: "center",
	},
	retryButton: {
		backgroundColor: theme.colors.textSecondary,
	},
	retryButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	nextButton: {
		backgroundColor: theme.colors.primary,
	},
	nextButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
