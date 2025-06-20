// Question Hints Component - Stage 4.2
// Interactive hints system for questions

import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Easing,
} from "react-native";
import { theme } from "../../../constants/theme";
import { EnhancedQuestion } from "../../../types/QuestionTypes";

interface QuestionHintsProps {
	question: EnhancedQuestion;
	hintsUsed: string[];
	onHintRequest: (hintId: string) => void;
	disabled?: boolean;
}

interface Hint {
	id: string;
	text: string;
	level: "gentle" | "medium" | "strong";
	cost: number; // points deducted
}

export const QuestionHints: React.FC<QuestionHintsProps> = ({
	question,
	hintsUsed,
	onHintRequest,
	disabled = false,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [animatedHeight] = useState(new Animated.Value(0));

	// Generate hints based on question type and content
	const generateHints = (): Hint[] => {
		const hints: Hint[] = [];

		// Generic hints
		hints.push({
			id: "gentle_1",
			text: "Read the question carefully and think about what type of answer is expected.",
			level: "gentle",
			cost: 1,
		});

		// Question-specific hints based on type
		switch (question.question_config?.type) {
			case "multiple_choice":
				hints.push({
					id: "mc_eliminate",
					text: "Try to eliminate obviously wrong answers first.",
					level: "gentle",
					cost: 1,
				});
				hints.push({
					id: "mc_context",
					text: "Look for context clues in the question that might hint at the correct answer.",
					level: "medium",
					cost: 2,
				});
				break;

			case "fill_blank":
				hints.push({
					id: "fb_grammar",
					text: "Think about the grammar rule that applies to this sentence.",
					level: "gentle",
					cost: 1,
				});
				hints.push({
					id: "fb_word_type",
					text: "Consider what type of word (noun, verb, adjective) should go in each blank.",
					level: "medium",
					cost: 2,
				});
				break;

			case "text_input":
				hints.push({
					id: "ti_structure",
					text: "Remember to use proper French sentence structure.",
					level: "gentle",
					cost: 1,
				});
				hints.push({
					id: "ti_vocabulary",
					text: "Think about the vocabulary words from this lesson.",
					level: "medium",
					cost: 2,
				});
				break;
		}

		// Strong hint (partial answer)
		if (question.explanation) {
			hints.push({
				id: "strong_explanation",
				text: question.explanation,
				level: "strong",
				cost: 3,
			});
		}

		return hints;
	};

	const hints = generateHints();
	const availableHints = hints.filter((hint) => !hintsUsed.includes(hint.id));
	const usedHintObjects = hints.filter((hint) => hintsUsed.includes(hint.id));

	const toggleExpanded = () => {
		const toValue = expanded ? 0 : 1;
		setExpanded(!expanded);

		Animated.timing(animatedHeight, {
			toValue,
			duration: 300,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			useNativeDriver: false,
		}).start();
	};

	const handleHintRequest = (hint: Hint) => {
		if (disabled) return;
		onHintRequest(hint.id);
	};

	const getHintIcon = (level: string): string => {
		switch (level) {
			case "gentle":
				return "💡";
			case "medium":
				return "🔍";
			case "strong":
				return "🎯";
			default:
				return "💡";
		}
	};

	const getHintColor = (level: string): string => {
		switch (level) {
			case "gentle":
				return "#4CAF50";
			case "medium":
				return "#FF9800";
			case "strong":
				return "#F44336";
			default:
				return theme.colors.primary;
		}
	};

	if (hints.length === 0) return null;

	return (
		<View style={styles.container}>
			{/* Hints Header */}
			<TouchableOpacity
				style={styles.header}
				onPress={toggleExpanded}
				disabled={disabled}
			>
				<View style={styles.headerContent}>
					<Text style={styles.headerIcon}>💡</Text>
					<Text style={styles.headerTitle}>Hints</Text>
					<View style={styles.hintsCount}>
						<Text style={styles.hintsCountText}>
							{hintsUsed.length}/{hints.length}
						</Text>
					</View>
				</View>
				<Text
					style={[
						styles.expandIcon,
						{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
					]}
				>
					▼
				</Text>
			</TouchableOpacity>

			{/* Hints Content */}
			<Animated.View
				style={[
					styles.content,
					{
						maxHeight: animatedHeight.interpolate({
							inputRange: [0, 1],
							outputRange: [0, 300],
						}),
						opacity: animatedHeight,
					},
				]}
			>
				{/* Used Hints */}
				{usedHintObjects.map((hint, index) => (
					<View
						key={hint.id}
						style={[
							styles.hintItem,
							styles.usedHint,
							{ borderLeftColor: getHintColor(hint.level) },
						]}
					>
						<View style={styles.hintHeader}>
							<Text style={styles.hintIcon}>{getHintIcon(hint.level)}</Text>
							<Text style={styles.hintLevel}>{hint.level} hint</Text>
							<Text style={styles.hintCost}>-{hint.cost} pts</Text>
						</View>
						<Text style={styles.hintText}>{hint.text}</Text>
					</View>
				))}

				{/* Available Hints */}
				{availableHints.map((hint, index) => (
					<TouchableOpacity
						key={hint.id}
						style={[
							styles.hintItem,
							styles.availableHint,
							{ borderLeftColor: getHintColor(hint.level) },
							disabled && styles.disabledHint,
						]}
						onPress={() => handleHintRequest(hint)}
						disabled={disabled}
					>
						<View style={styles.hintHeader}>
							<Text style={styles.hintIcon}>{getHintIcon(hint.level)}</Text>
							<Text style={styles.hintLevel}>{hint.level} hint</Text>
							<Text style={styles.hintCost}>-{hint.cost} pts</Text>
						</View>
						<Text style={styles.hintPreview}>
							Tap to reveal {hint.level} hint...
						</Text>
					</TouchableOpacity>
				))}

				{availableHints.length === 0 && usedHintObjects.length > 0 && (
					<View style={styles.noMoreHints}>
						<Text style={styles.noMoreHintsText}>No more hints available</Text>
					</View>
				)}
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		marginVertical: theme.spacing.md,
		overflow: "hidden",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.md,
		backgroundColor: theme.colors.background,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	headerIcon: {
		fontSize: 20,
		marginRight: theme.spacing.sm,
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		flex: 1,
	},
	hintsCount: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 2,
		borderRadius: 12,
	},
	hintsCountText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	expandIcon: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		marginLeft: theme.spacing.sm,
	},
	content: {
		overflow: "hidden",
	},
	hintItem: {
		padding: theme.spacing.md,
		borderLeftWidth: 4,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	usedHint: {
		backgroundColor: theme.colors.surface,
	},
	availableHint: {
		backgroundColor: theme.colors.background,
	},
	disabledHint: {
		opacity: 0.5,
	},
	hintHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	hintIcon: {
		fontSize: 16,
		marginRight: theme.spacing.sm,
	},
	hintLevel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		textTransform: "capitalize",
		flex: 1,
	},
	hintCost: {
		fontSize: 12,
		color: "#F44336",
		fontWeight: "600",
	},
	hintText: {
		fontSize: 14,
		color: theme.colors.text,
		lineHeight: 20,
	},
	hintPreview: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	noMoreHints: {
		padding: theme.spacing.md,
		alignItems: "center",
	},
	noMoreHintsText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
});
