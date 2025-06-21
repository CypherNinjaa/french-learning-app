// Image-Based Question Renderer - Stage 4.2
// Interactive image-based question component with clickable regions

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Dimensions,
	Alert,
	ScrollView,
} from "react-native";
import { theme } from "../../../constants/theme";
import { BaseQuestionProps } from "../../../types/QuestionTypes";
import { Question } from "../../../types";

interface ImageBasedProps extends BaseQuestionProps {
	question: Question;
}

interface ClickableRegion {
	id: string;
	x: number; // percentage
	y: number; // percentage
	width: number; // percentage
	height: number; // percentage
	label: string;
	isCorrect: boolean;
}

interface ImageDimensions {
	width: number;
	height: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_IMAGE_WIDTH = SCREEN_WIDTH - theme.spacing.lg * 2;

export const ImageBasedRenderer: React.FC<ImageBasedProps> = ({
	question,
	onAnswer,
	isAnswered,
	userAnswer,
	showCorrectAnswer,
	disabled,
	timeUp,
}) => {
	const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
		width: 0,
		height: 0,
	});
	const [clickableRegions, setClickableRegions] = useState<ClickableRegion[]>(
		[]
	);

	const questionType = (question.options as any)?.question_type || "identify";
	const regions = (question.options as any)?.clickable_regions || [];

	useEffect(() => {
		if (regions && regions.length > 0) {
			setClickableRegions(regions);
		}
	}, [question]);

	useEffect(() => {
		if (timeUp && !isAnswered) {
			handleSubmit();
		}
	}, [timeUp, isAnswered]);

	useEffect(() => {
		if (Array.isArray(userAnswer)) {
			setSelectedRegions(userAnswer);
		} else if (typeof userAnswer === "string" && userAnswer) {
			setSelectedRegions([userAnswer]);
		}
	}, [userAnswer]);

	const handleImageLoad = (event: any) => {
		const { width, height } = event.nativeEvent.source;
		const aspectRatio = height / width;
		const displayWidth = Math.min(width, MAX_IMAGE_WIDTH);
		const displayHeight = displayWidth * aspectRatio;

		setImageDimensions({
			width: displayWidth,
			height: displayHeight,
		});
	};

	const handleRegionPress = (regionId: string) => {
		if (disabled) return;

		const region = clickableRegions.find((r) => r.id === regionId);
		if (!region) return;

		if (questionType === "click_regions") {
			// Multiple selection allowed
			setSelectedRegions((prev) =>
				prev.includes(regionId)
					? prev.filter((id) => id !== regionId)
					: [...prev, regionId]
			);
		} else {
			// Single selection
			setSelectedRegions([regionId]);
		}
	};

	const handleSubmit = () => {
		if (selectedRegions.length === 0 && !timeUp) {
			Alert.alert(
				"No Selection",
				"Please select an area on the image before submitting."
			);
			return;
		}

		const startTime = Date.now();
		const correctRegionIds = clickableRegions
			.filter((region) => region.isCorrect)
			.map((region) => region.id);

		let isCorrect = false;

		if (questionType === "click_regions") {
			// Check if all correct regions are selected and no incorrect ones
			isCorrect =
				correctRegionIds.every((id) => selectedRegions.includes(id)) &&
				selectedRegions.every((id) => correctRegionIds.includes(id));
		} else {
			// Single selection - check if the selected region is correct
			isCorrect =
				selectedRegions.length === 1 &&
				correctRegionIds.includes(selectedRegions[0]);
		}

		const answer =
			questionType === "click_regions"
				? selectedRegions
				: selectedRegions[0] || "";
		onAnswer(answer, isCorrect, Date.now() - startTime);
	};
	const getRegionStyle = (region: ClickableRegion) => {
		const isSelected = selectedRegions.includes(region.id);
		const baseStyles: any[] = [styles.clickableRegion];

		if (isSelected) {
			baseStyles.push(styles.selectedRegion);
		}

		if (isAnswered || showCorrectAnswer) {
			if (region.isCorrect) {
				baseStyles.push(styles.correctRegion);
			} else if (isSelected && !region.isCorrect) {
				baseStyles.push(styles.incorrectRegion);
			}
		}

		// Calculate actual position and size based on image dimensions
		const actualX = (region.x / 100) * imageDimensions.width;
		const actualY = (region.y / 100) * imageDimensions.height;
		const actualWidth = (region.width / 100) * imageDimensions.width;
		const actualHeight = (region.height / 100) * imageDimensions.height;

		return [
			...baseStyles,
			{
				left: actualX,
				top: actualY,
				width: actualWidth,
				height: actualHeight,
			},
		];
	};

	const renderRegionLabels = () => {
		if (!showCorrectAnswer && !isAnswered) return null;

		return clickableRegions.map((region) => {
			const isSelected = selectedRegions.includes(region.id);
			const actualX = (region.x / 100) * imageDimensions.width;
			const actualY = (region.y / 100) * imageDimensions.height;

			if (region.isCorrect || (isSelected && !region.isCorrect)) {
				return (
					<View
						key={`label_${region.id}`}
						style={[
							styles.regionLabel,
							{
								left: actualX,
								top: actualY - 30,
							},
						]}
					>
						<Text style={styles.regionLabelText}>
							{region.isCorrect ? "✓" : "✗"} {region.label}
						</Text>
					</View>
				);
			}
			return null;
		});
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.scrollContent}
		>
			{/* Question */}
			<View style={styles.questionContainer}>
				<Text style={styles.questionText}>{question.question_text}</Text>

				<Text style={styles.instructionText}>
					{questionType === "click_regions"
						? "Tap on all the correct areas in the image."
						: "Tap on the correct area in the image."}
				</Text>
			</View>

			{/* Image with Clickable Regions */}
			<View style={styles.imageContainer}>
				{question.image_url ? (
					<View style={styles.imageWrapper}>
						<Image
							source={{ uri: question.image_url }}
							style={[
								styles.questionImage,
								imageDimensions.width > 0 && {
									width: imageDimensions.width,
									height: imageDimensions.height,
								},
							]}
							onLoad={handleImageLoad}
							resizeMode="contain"
						/>

						{/* Clickable Regions Overlay */}
						{imageDimensions.width > 0 &&
							clickableRegions.map((region) => (
								<TouchableOpacity
									key={region.id}
									style={getRegionStyle(region)}
									onPress={() => handleRegionPress(region.id)}
									disabled={disabled}
									activeOpacity={0.7}
								>
									<View style={styles.regionOverlay}>
										{selectedRegions.includes(region.id) && (
											<Text style={styles.regionSelectedIcon}>✓</Text>
										)}
									</View>
								</TouchableOpacity>
							))}

						{/* Region Labels (shown after answer) */}
						{imageDimensions.width > 0 && renderRegionLabels()}
					</View>
				) : (
					<View style={styles.noImageContainer}>
						<Text style={styles.noImageText}>No image provided</Text>
					</View>
				)}
			</View>

			{/* Selection Summary */}
			{selectedRegions.length > 0 && (
				<View style={styles.selectionSummary}>
					<Text style={styles.selectionTitle}>Selected:</Text>
					{selectedRegions.map((regionId) => {
						const region = clickableRegions.find((r) => r.id === regionId);
						return region ? (
							<Text key={regionId} style={styles.selectionItem}>
								• {region.label}
							</Text>
						) : null;
					})}
				</View>
			)}

			{/* Correct Answer Display */}
			{showCorrectAnswer && (
				<View style={styles.correctAnswerContainer}>
					<Text style={styles.correctAnswerTitle}>Correct Areas:</Text>
					{clickableRegions
						.filter((region) => region.isCorrect)
						.map((region) => (
							<Text key={region.id} style={styles.correctAnswerItem}>
								✓ {region.label}
							</Text>
						))}

					{question.explanation && (
						<Text style={styles.explanationText}>{question.explanation}</Text>
					)}
				</View>
			)}

			{/* Submit Button */}
			{!isAnswered && selectedRegions.length > 0 && (
				<TouchableOpacity
					style={[styles.submitButton, disabled && styles.disabledSubmitButton]}
					onPress={handleSubmit}
					disabled={disabled}
				>
					<Text style={styles.submitButtonText}>Submit Selection</Text>
				</TouchableOpacity>
			)}

			{/* Progress */}
			<View style={styles.progressContainer}>
				<Text style={styles.progressText}>
					{selectedRegions.length} area{selectedRegions.length !== 1 ? "s" : ""}{" "}
					selected
				</Text>
				{questionType === "click_regions" && (
					<Text style={styles.progressHint}>
						💡 You may need to select multiple areas
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
	imageContainer: {
		marginBottom: theme.spacing.lg,
		alignItems: "center",
	},
	imageWrapper: {
		position: "relative",
	},
	questionImage: {
		borderRadius: 12,
		maxWidth: MAX_IMAGE_WIDTH,
	},
	noImageContainer: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.xl,
		borderRadius: 12,
		alignItems: "center",
	},
	noImageText: {
		color: theme.colors.textSecondary,
		fontSize: 16,
	},
	clickableRegion: {
		position: "absolute",
		borderWidth: 2,
		borderColor: "transparent",
		borderRadius: 4,
	},
	selectedRegion: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primary + "20",
	},
	correctRegion: {
		borderColor: "#4CAF50",
		backgroundColor: "#4CAF50" + "20",
	},
	incorrectRegion: {
		borderColor: "#F44336",
		backgroundColor: "#F44336" + "20",
	},
	regionOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	regionSelectedIcon: {
		fontSize: 20,
		color: theme.colors.primary,
		fontWeight: "bold",
		textShadowColor: "white",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	regionLabel: {
		position: "absolute",
		backgroundColor: "rgba(0,0,0,0.8)",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 4,
		zIndex: 10,
	},
	regionLabelText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	selectionSummary: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.lg,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	selectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	selectionItem: {
		fontSize: 14,
		color: theme.colors.text,
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
		fontSize: 16,
		fontWeight: "600",
		color: "#4CAF50",
		marginBottom: theme.spacing.sm,
	},
	correctAnswerItem: {
		fontSize: 14,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
		marginTop: theme.spacing.sm,
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
		alignItems: "center",
		marginBottom: theme.spacing.lg,
	},
	progressText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	progressHint: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
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
