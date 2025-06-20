// Pronunciation Component for Stage 5.1 - Text-to-Speech Integration
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert,
	ViewStyle,
	TextStyle,
} from "react-native";
import {
	SpeechService,
	SpeechOptions,
	VoiceOption,
} from "../../services/speechService";
import { theme } from "../../constants/theme";

interface PronunciationPlayerProps {
	text: string;
	label?: string;
	rate?: "slow" | "normal" | "fast" | "veryFast";
	showSpeedControls?: boolean;
	showSpellButton?: boolean;
	variant?: "primary" | "secondary" | "minimal";
	disabled?: boolean;
	onPlayStart?: () => void;
	onPlayEnd?: () => void;
	onError?: (error: any) => void;
}

export const PronunciationPlayer: React.FC<PronunciationPlayerProps> = ({
	text,
	label,
	rate = "normal",
	showSpeedControls = true,
	showSpellButton = false,
	variant = "primary",
	disabled = false,
	onPlayStart,
	onPlayEnd,
	onError,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentRate, setCurrentRate] = useState<
		"slow" | "normal" | "fast" | "veryFast"
	>(rate);
	const [isLoading, setIsLoading] = useState(false);

	const handleSpeak = async () => {
		if (disabled || !text.trim()) return;

		try {
			setIsLoading(true);
			setIsPlaying(true);
			onPlayStart?.();

			const options: SpeechOptions = {
				rate: SpeechService.SPEECH_RATES[currentRate],
				onStart: () => setIsLoading(false),
				onDone: () => {
					setIsPlaying(false);
					onPlayEnd?.();
				},
				onStopped: () => {
					setIsPlaying(false);
					onPlayEnd?.();
				},
				onError: (error) => {
					setIsPlaying(false);
					setIsLoading(false);
					onError?.(error);
					Alert.alert("Speech Error", "Unable to play pronunciation");
				},
			};

			await SpeechService.speakFrench(text, options);
		} catch (error) {
			setIsPlaying(false);
			setIsLoading(false);
			onError?.(error);
			Alert.alert("Error", "Unable to play pronunciation");
		}
	};

	const handleSpell = async () => {
		if (disabled || !text.trim()) return;

		try {
			setIsLoading(true);
			onPlayStart?.();

			const options: SpeechOptions = {
				onStart: () => setIsLoading(false),
				onDone: () => onPlayEnd?.(),
				onStopped: () => onPlayEnd?.(),
				onError: (error) => {
					setIsLoading(false);
					onError?.(error);
					Alert.alert("Speech Error", "Unable to spell word");
				},
			};

			await SpeechService.spellWord(text, options);
		} catch (error) {
			setIsLoading(false);
			onError?.(error);
			Alert.alert("Error", "Unable to spell word");
		}
	};

	const handleStop = async () => {
		try {
			await SpeechService.stopSpeaking();
			setIsPlaying(false);
			setIsLoading(false);
		} catch (error) {
			console.error("Error stopping speech:", error);
		}
	};
	const getMainButtonStyle = () => {
		switch (variant) {
			case "secondary":
				return [
					styles.playButton,
					styles.playButtonSecondary,
					disabled && styles.playButtonDisabled,
				].filter(Boolean);
			case "minimal":
				return [
					styles.playButton,
					styles.playButtonMinimal,
					disabled && styles.playButtonDisabled,
				].filter(Boolean);
			default:
				return [
					styles.playButton,
					styles.playButtonPrimary,
					disabled && styles.playButtonDisabled,
				].filter(Boolean);
		}
	};
	const getMainButtonTextStyle = () => {
		switch (variant) {
			case "secondary":
				return [styles.playButtonText, styles.playButtonTextSecondary];
			case "minimal":
				return [styles.playButtonText, styles.playButtonTextMinimal];
			default:
				return [styles.playButtonText, styles.playButtonTextPrimary];
		}
	};

	const formatRateLabel = (rateKey: string) => {
		const labels = {
			slow: "🐌 Slow",
			normal: "🚶 Normal",
			fast: "🏃 Fast",
			veryFast: "⚡ Very Fast",
		};
		return labels[rateKey as keyof typeof labels] || rateKey;
	};

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}

			<View style={styles.mainControls}>
				<TouchableOpacity
					style={getMainButtonStyle()}
					onPress={isPlaying ? handleStop : handleSpeak}
					disabled={disabled || isLoading}
				>
					{isLoading ? (
						<ActivityIndicator
							color={variant === "primary" ? "white" : theme.colors.primary}
							size="small"
						/>
					) : (
						<Text style={getMainButtonTextStyle()}>
							{isPlaying ? "⏹️ Stop" : "🔊 Play"}
						</Text>
					)}
				</TouchableOpacity>

				{showSpellButton && (
					<TouchableOpacity
						style={[styles.spellButton, disabled && styles.spellButtonDisabled]}
						onPress={handleSpell}
						disabled={disabled || isLoading}
					>
						<Text style={styles.spellButtonText}>📝 Spell</Text>
					</TouchableOpacity>
				)}
			</View>

			{showSpeedControls && (
				<View style={styles.speedControls}>
					<Text style={styles.speedLabel}>Speed:</Text>
					<View style={styles.speedButtons}>
						{(["slow", "normal", "fast", "veryFast"] as const).map(
							(rateOption) => (
								<TouchableOpacity
									key={rateOption}
									style={[
										styles.speedButton,
										currentRate === rateOption && styles.speedButtonActive,
										disabled && styles.speedButtonDisabled,
									]}
									onPress={() => setCurrentRate(rateOption)}
									disabled={disabled}
								>
									<Text
										style={[
											styles.speedButtonText,
											currentRate === rateOption &&
												styles.speedButtonTextActive,
										]}
									>
										{formatRateLabel(rateOption)}
									</Text>
								</TouchableOpacity>
							)
						)}
					</View>
				</View>
			)}
		</View>
	);
};

// Simplified pronunciation button for vocabulary cards
interface PronunciationButtonProps {
	text: string;
	size?: "small" | "medium" | "large";
	disabled?: boolean;
}

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({
	text,
	size = "medium",
	disabled = false,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);

	const handleSpeak = async () => {
		if (disabled || !text.trim()) return;

		try {
			setIsPlaying(true);

			await SpeechService.speakVocabulary(text, "normal", {
				onDone: () => setIsPlaying(false),
				onStopped: () => setIsPlaying(false),
				onError: () => setIsPlaying(false),
			});
		} catch (error) {
			setIsPlaying(false);
			console.error("Pronunciation error:", error);
		}
	};
	const getButtonStyle = (): ViewStyle[] => {
		const styles_to_apply: ViewStyle[] = [styles.quickButton];

		switch (size) {
			case "small":
				styles_to_apply.push(styles.quickButtonSmall);
				break;
			case "large":
				styles_to_apply.push(styles.quickButtonLarge);
				break;
			default:
				styles_to_apply.push(styles.quickButtonMedium);
		}

		if (disabled) {
			styles_to_apply.push(styles.quickButtonDisabled);
		}

		if (isPlaying) {
			styles_to_apply.push(styles.quickButtonPlaying);
		}

		return styles_to_apply;
	};

	const getIconSize = () => {
		switch (size) {
			case "small":
				return 12;
			case "large":
				return 20;
			default:
				return 16;
		}
	};

	return (
		<TouchableOpacity
			style={getButtonStyle()}
			onPress={handleSpeak}
			disabled={disabled}
		>
			<Text style={[styles.quickButtonIcon, { fontSize: getIconSize() }]}>
				{isPlaying ? "⏸️" : "🔊"}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: theme.spacing.sm,
	},
	label: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
		fontSize: 14,
	},
	mainControls: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	playButton: {
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 100,
	},
	playButtonPrimary: {
		backgroundColor: theme.colors.primary,
	},
	playButtonSecondary: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.primary,
	},
	playButtonMinimal: {
		backgroundColor: "transparent",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},
	playButtonDisabled: {
		opacity: 0.5,
	},
	playButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	playButtonTextPrimary: {
		color: "white",
	},
	playButtonTextSecondary: {
		color: theme.colors.primary,
	},
	playButtonTextMinimal: {
		color: theme.colors.primary,
		fontSize: 14,
	},
	spellButton: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 6,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	spellButtonDisabled: {
		opacity: 0.5,
	},
	spellButtonText: {
		color: theme.colors.textSecondary,
		fontSize: 14,
		fontWeight: "500",
	},
	speedControls: {
		marginTop: theme.spacing.md,
	},
	speedLabel: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		fontSize: 14,
		marginBottom: theme.spacing.xs,
	},
	speedButtons: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.xs,
	},
	speedButton: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 4,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	speedButtonActive: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	speedButtonDisabled: {
		opacity: 0.5,
	},
	speedButtonText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	speedButtonTextActive: {
		color: "white",
		fontWeight: "600",
	},
	quickButton: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 4,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	quickButtonSmall: {
		width: 24,
		height: 24,
	},
	quickButtonMedium: {
		width: 32,
		height: 32,
	},
	quickButtonLarge: {
		width: 40,
		height: 40,
	},
	quickButtonDisabled: {
		opacity: 0.5,
	},
	quickButtonPlaying: {
		backgroundColor: theme.colors.primary + "20",
		borderColor: theme.colors.primary,
	},
	quickButtonIcon: {
		textAlign: "center",
	},
});
