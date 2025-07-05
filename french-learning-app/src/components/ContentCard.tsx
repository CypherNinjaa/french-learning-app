// Stage 3.3: Enhanced Content Card Component
// Modern, reusable content card with improved UI/UX

import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import {
	theme,
	getColorForDifficulty,
	getColorForContentType,
	createShadowStyle,
} from "../constants/theme";
import { Vocabulary, GrammarRule, DifficultyLevel } from "../types";

interface ContentCardProps {
	// Content data
	content: Vocabulary | GrammarRule;
	contentType: "vocabulary" | "grammar";

	// Interaction
	onPress?: () => void;
	onLongPress?: () => void;

	// Appearance
	variant?: "default" | "compact" | "featured";
	showProgress?: boolean;
	progress?: number; // 0-100
	isSelected?: boolean;
	isDisabled?: boolean;

	// Custom styling
	style?: any;
	containerStyle?: any;
}

interface ContentCardMetadata {
	title: string;
	subtitle?: string;
	description?: string;
	difficulty?: DifficultyLevel;
	color: string;
	icon?: string;
}

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - theme.spacing.md * 3) / 2;

export const ContentCard: React.FC<ContentCardProps> = ({
	content,
	contentType,
	onPress,
	onLongPress,
	variant = "default",
	showProgress = false,
	progress = 0,
	isSelected = false,
	isDisabled = false,
	style,
	containerStyle,
}) => {
	// Extract metadata based on content type
	const getContentMetadata = (): ContentCardMetadata => {
		switch (contentType) {
			case "vocabulary":
				const vocab = content as Vocabulary;
				return {
					title: vocab.french_word,
					subtitle: vocab.english_translation,
					description: vocab.example_sentence_fr,
					difficulty: vocab.difficulty_level,
					color: getColorForContentType("vocabulary"),
				};

			case "grammar":
				const grammar = content as GrammarRule;
				return {
					title: grammar.title,
					subtitle: grammar.difficulty_level,
					description: grammar.explanation,
					difficulty: grammar.difficulty_level,
					color: getColorForContentType("grammar"),
				};

			default:
				return {
					title: "Unknown Content",
					color: theme.colors.primary,
				};
		}
	};

	const metadata = getContentMetadata();

	// Dynamic styles based on variant and state
	const getCardStyles = () => {
		const baseStyles = [
			styles.card,
			variant === "compact" && styles.cardCompact,
			variant === "featured" && styles.cardFeatured,
			isSelected && styles.cardSelected,
			isDisabled && styles.cardDisabled,
		];

		if (variant === "compact") {
			return [...baseStyles, { width: cardWidth }];
		}

		return baseStyles;
	};

	const getDifficultyBadgeColor = () => {
		if (!metadata.difficulty) return theme.colors.textSecondary;
		return getColorForDifficulty(metadata.difficulty);
	};

	const renderProgressBar = () => {
		if (!showProgress) return null;

		return (
			<View style={styles.progressContainer}>
				<View style={styles.progressTrack}>
					<View
						style={[
							styles.progressFill,
							{
								width: `${Math.max(0, Math.min(100, progress))}%`,
								backgroundColor: metadata.color,
							},
						]}
					/>
				</View>
				<Text style={styles.progressText}>{Math.round(progress)}%</Text>
			</View>
		);
	};

	const renderDifficultyBadge = () => {
		if (!metadata.difficulty) return null;

		return (
			<View
				style={[
					styles.difficultyBadge,
					{ backgroundColor: getDifficultyBadgeColor() },
				]}
			>
				<Text style={styles.difficultyText}>
					{metadata.difficulty.charAt(0).toUpperCase() +
						metadata.difficulty.slice(1)}
				</Text>
			</View>
		);
	};

	const renderContentTypeIndicator = () => {
		return (
			<View
				style={[
					styles.contentTypeIndicator,
					{ backgroundColor: metadata.color },
				]}
			/>
		);
	};

	return (
		<TouchableOpacity
			style={[getCardStyles(), containerStyle]}
			onPress={isDisabled ? undefined : onPress}
			onLongPress={isDisabled ? undefined : onLongPress}
			activeOpacity={isDisabled ? 1 : 0.7}
			disabled={isDisabled}
		>
			{renderContentTypeIndicator()}

			<View style={styles.cardContent}>
				{/* Header */}
				<View style={styles.cardHeader}>
					<Text
						style={[
							styles.cardTitle,
							variant === "compact" && styles.cardTitleCompact,
							isDisabled && styles.textDisabled,
						]}
						numberOfLines={variant === "compact" ? 2 : 3}
					>
						{metadata.title}
					</Text>
					{renderDifficultyBadge()}
				</View>

				{/* Subtitle */}
				{metadata.subtitle && (
					<Text
						style={[styles.cardSubtitle, isDisabled && styles.textDisabled]}
						numberOfLines={1}
					>
						{metadata.subtitle}
					</Text>
				)}

				{/* Description */}
				{metadata.description && variant !== "compact" && (
					<Text
						style={[styles.cardDescription, isDisabled && styles.textDisabled]}
						numberOfLines={2}
					>
						{metadata.description}
					</Text>
				)}

				{/* Progress bar */}
				{renderProgressBar()}

				{/* Footer */}
				{variant === "featured" && (
					<View style={styles.cardFooter}>
						<Text style={styles.cardFooterText}>
							{contentType.charAt(0).toUpperCase() + contentType.slice(1)}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.medium,
		marginBottom: theme.spacing.md,
		overflow: "hidden",
		...createShadowStyle("md"),
	},

	cardCompact: {
		marginBottom: theme.spacing.sm,
		marginRight: theme.spacing.sm,
	},

	cardFeatured: {
		marginBottom: theme.spacing.lg,
		...createShadowStyle("lg"),
	},

	cardSelected: {
		borderWidth: 2,
		borderColor: theme.colors.primary,
		...createShadowStyle("lg"),
	},

	cardDisabled: {
		opacity: 0.6,
		backgroundColor: theme.colors.surfaceSecondary,
	},

	contentTypeIndicator: {
		height: 4,
		width: "100%",
	},

	cardContent: {
		padding: theme.spacing.md,
	},

	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.sm,
	},

	cardTitle: {
		...theme.typography.subheading,
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.sm,
	},

	cardTitleCompact: {
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.fontSize * 1.3,
	},

	cardSubtitle: {
		...theme.typography.caption,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.sm,
	},

	cardDescription: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.sm,
		lineHeight: theme.typography.body.fontSize * 1.4,
	},

	difficultyBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.borderRadius.small,
		alignSelf: "flex-start",
	},

	difficultyText: {
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "600",
		color: theme.colors.textOnPrimary,
	},

	progressContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: theme.spacing.sm,
	},

	progressTrack: {
		flex: 1,
		height: 4,
		backgroundColor: theme.colors.borderLight,
		borderRadius: theme.borderRadius.xs,
		marginRight: theme.spacing.sm,
	},

	progressFill: {
		height: "100%",
		borderRadius: theme.borderRadius.xs,
	},

	progressText: {
		...theme.typography.caption,
		color: theme.colors.textSecondary,
		fontWeight: "600",
		minWidth: 35,
		textAlign: "right",
	},

	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: theme.spacing.sm,
		paddingTop: theme.spacing.sm,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},

	cardFooterText: {
		...theme.typography.caption,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},

	textDisabled: {
		color: theme.colors.textDisabled,
	},
});

export default ContentCard;
