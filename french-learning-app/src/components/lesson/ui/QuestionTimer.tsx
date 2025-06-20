// Question Timer Component - Stage 4.2
// Visual countdown timer for timed questions

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";

interface QuestionTimerProps {
	timeLimit: number; // in seconds
	startTime: number;
	onTimeout: () => void;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
	timeLimit,
	startTime,
	onTimeout,
}) => {
	const [timeRemaining, setTimeRemaining] = useState(timeLimit);

	useEffect(() => {
		const interval = setInterval(() => {
			const elapsed = Math.floor((Date.now() - startTime) / 1000);
			const remaining = Math.max(0, timeLimit - elapsed);

			setTimeRemaining(remaining);

			if (remaining === 0) {
				onTimeout();
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLimit, startTime, onTimeout]);

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const getTimerColor = (): string => {
		const percentage = (timeRemaining / timeLimit) * 100;
		if (percentage <= 20) return "#F44336"; // Red
		if (percentage <= 50) return "#FF9800"; // Orange
		return theme.colors.primary; // Blue
	};

	const getTimerProgress = (): number => {
		return (timeRemaining / timeLimit) * 100;
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.timerText, { color: getTimerColor() }]}>
				{formatTime(timeRemaining)}
			</Text>
			<View style={styles.progressContainer}>
				<View
					style={[
						styles.progressBar,
						{
							width: `${getTimerProgress()}%`,
							backgroundColor: getTimerColor(),
						},
					]}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
	},
	timerText: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: theme.spacing.xs,
	},
	progressContainer: {
		width: 60,
		height: 4,
		backgroundColor: theme.colors.border,
		borderRadius: 2,
		overflow: "hidden",
	},
	progressBar: {
		height: "100%",
		borderRadius: 2,
	},
});
