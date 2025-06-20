// Question Progress Component - Stage 4.2
// Visual progress indicator for questions

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

interface QuestionProgressProps {
	current: number;
	total: number;
	score: number;
	maxScore: number;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({
	current,
	total,
	score,
	maxScore,
}) => {
	const progressPercentage = (current / total) * 100;
	const scorePercentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

	return (
		<View style={styles.container}>
			{/* Question Progress */}
			<View style={styles.questionProgress}>
				<Text style={styles.progressText}>
					Question {current} of {total}
				</Text>
				<View style={styles.progressBar}>
					<View
						style={[styles.progressFill, { width: `${progressPercentage}%` }]}
					/>
				</View>
			</View>

			{/* Score Display */}
			<View style={styles.scoreContainer}>
				<Text style={styles.scoreText}>
					{score}/{maxScore}
				</Text>
				<Text style={styles.scoreLabel}>pts</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flex: 1,
	},
	questionProgress: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	progressText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	progressBar: {
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: theme.colors.primary,
	},
	scoreContainer: {
		flexDirection: "row",
		alignItems: "baseline",
	},
	scoreText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
	},
	scoreLabel: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginLeft: 2,
	},
});
