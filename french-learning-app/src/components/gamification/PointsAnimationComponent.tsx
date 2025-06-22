// Points Animation Component - Immediate feedback for point earning
// Shows animated point notifications and achievement unlocks

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Modal,
	TouchableOpacity,
	Dimensions,
} from "react-native";
import { theme } from "../../constants/theme";

interface PointsAnimationProps {
	visible: boolean;
	points: number;
	achievements?: string[];
	streakMultiplier?: number;
	perfectScoreBonus?: number;
	onClose: () => void;
	encouragementMessage?: string;
}

export const PointsAnimationComponent: React.FC<PointsAnimationProps> = ({
	visible,
	points,
	achievements = [],
	streakMultiplier = 1,
	perfectScoreBonus = 0,
	onClose,
	encouragementMessage,
}) => {
	const [animatedValue] = useState(new Animated.Value(0));
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		if (visible) {
			// Animate in
			Animated.sequence([
				Animated.timing(animatedValue, {
					toValue: 1,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.delay(2000),
				Animated.timing(animatedValue, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start(() => {
				if (!showDetails) {
					onClose();
				}
			});
		}
	}, [visible, animatedValue, onClose, showDetails]);

	const handleShowDetails = () => {
		setShowDetails(true);
	};

	const handleClose = () => {
		setShowDetails(false);
		onClose();
	};

	if (!visible) return null;

	const scale = animatedValue.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0.3, 1.2, 1],
	});

	const opacity = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 1],
	});

	return (
		<Modal transparent visible={visible} animationType="none">
			<View style={styles.overlay}>
				{!showDetails ? (
					// Quick animation
					<Animated.View
						style={[
							styles.animationContainer,
							{
								transform: [{ scale }],
								opacity,
							},
						]}
					>
						<TouchableOpacity onPress={handleShowDetails} activeOpacity={0.8}>
							<Text style={styles.pointsText}>+{points}</Text>
							<Text style={styles.pointsLabel}>points!</Text>

							{achievements.length > 0 && (
								<Text style={styles.achievementHint}>🏆 Tap for details</Text>
							)}
						</TouchableOpacity>
					</Animated.View>
				) : (
					// Detailed view
					<View style={styles.detailsContainer}>
						<View style={styles.detailsContent}>
							<Text style={styles.detailsTitle}>Awesome Work! 🎉</Text>

							<View style={styles.pointsBreakdown}>
								<Text style={styles.totalPoints}>+{points} Total Points</Text>

								{streakMultiplier > 1 && (
									<View style={styles.bonusRow}>
										<Text style={styles.bonusLabel}>Streak Bonus:</Text>
										<Text style={styles.bonusValue}>
											{Math.round((streakMultiplier - 1) * 100)}% multiplier
										</Text>
									</View>
								)}

								{perfectScoreBonus > 0 && (
									<View style={styles.bonusRow}>
										<Text style={styles.bonusLabel}>Perfect Score:</Text>
										<Text style={styles.bonusValue}>
											+{perfectScoreBonus} points
										</Text>
									</View>
								)}
							</View>

							{achievements.length > 0 && (
								<View style={styles.achievementsSection}>
									<Text style={styles.achievementsTitle}>
										🏆 New Achievement{achievements.length > 1 ? "s" : ""}{" "}
										Unlocked!
									</Text>
									{achievements.map((achievement, index) => (
										<Text key={index} style={styles.achievementText}>
											• {achievement}
										</Text>
									))}
								</View>
							)}

							{encouragementMessage && (
								<Text style={styles.encouragementText}>
									{encouragementMessage}
								</Text>
							)}

							<TouchableOpacity
								style={styles.closeButton}
								onPress={handleClose}
							>
								<Text style={styles.closeButtonText}>Continue</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</View>
		</Modal>
	);
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	animationContainer: {
		backgroundColor: theme.colors.primary,
		borderRadius: 60,
		width: 120,
		height: 120,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	pointsText: {
		fontSize: 28,
		fontWeight: "bold",
		color: "white",
		textAlign: "center",
	},
	pointsLabel: {
		fontSize: 14,
		color: "white",
		textAlign: "center",
		marginTop: 4,
	},
	achievementHint: {
		fontSize: 12,
		color: "white",
		textAlign: "center",
		marginTop: 8,
		opacity: 0.9,
	},
	detailsContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.lg,
	},
	detailsContent: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: theme.spacing.xl,
		width: width * 0.85,
		maxWidth: 400,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.25,
		shadowRadius: 16,
		elevation: 16,
	},
	detailsTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.lg,
		textAlign: "center",
	},
	pointsBreakdown: {
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	totalPoints: {
		fontSize: 32,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginBottom: theme.spacing.md,
	},
	bonusRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginVertical: theme.spacing.xs,
	},
	bonusLabel: {
		fontSize: 16,
		color: theme.colors.textSecondary,
	},
	bonusValue: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	achievementsSection: {
		width: "100%",
		marginBottom: theme.spacing.lg,
	},
	achievementsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: theme.spacing.md,
	},
	achievementText: {
		fontSize: 16,
		color: theme.colors.text,
		marginVertical: theme.spacing.xs,
		textAlign: "center",
	},
	encouragementText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginBottom: theme.spacing.lg,
		lineHeight: 22,
	},
	closeButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.xl,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		minWidth: 120,
	},
	closeButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
