// Test Screen for Stage 5.1 - Text-to-Speech Integration
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	PronunciationPlayer,
	PronunciationButton,
} from "../components/pronunciation/PronunciationPlayer";
import { theme } from "../constants/theme";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

interface PronunciationTestScreenProps {
	navigation: any;
}

export const PronunciationTestScreen: React.FC<
	PronunciationTestScreenProps
> = ({ navigation }) => {
	const [selectedVariant, setSelectedVariant] = useState<
		"primary" | "secondary" | "minimal"
	>("primary");
	const [error, setError] = useState<string | null>(null);

	const testWords = [
		"Bonjour",
		"Comment allez-vous?",
		"Je m'appelle Pierre",
		"Voulez-vous un café?",
		"Où est la bibliothèque?",
		"Quelle heure est-il?",
		"Combien ça coûte?",
		"Pouvez-vous répéter?",
	];

	const handleGoBack = () => {
		navigation.goBack();
	};

	const handlePronunciationError = (error: any) => {
		console.error("Pronunciation error:", error);
		setError(
			"Unable to play pronunciation. Please check your device settings."
		);
		Alert.alert(
			"Error",
			"Unable to play pronunciation. Please check your device settings."
		);
	};

	if (error) {
		return (
			<ErrorState
				title="Pronunciation Error"
				description={error}
				onRetry={() => setError(null)}
			/>
		);
	}

	if (testWords.length === 0) {
		return (
			<EmptyState
				title="No Test Words"
				description="No test words available for pronunciation. Please check back later!"
			/>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Pronunciation Test</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Variant Selector */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Button Variant</Text>
					<View style={styles.variantButtons}>
						{(["primary", "secondary", "minimal"] as const).map((variant) => (
							<TouchableOpacity
								key={variant}
								style={[
									styles.variantButton,
									selectedVariant === variant && styles.variantButtonSelected,
								]}
								onPress={() => setSelectedVariant(variant)}
							>
								<Text
									style={[
										styles.variantButtonText,
										selectedVariant === variant &&
											styles.variantButtonTextSelected,
									]}
								>
									{variant.charAt(0).toUpperCase() + variant.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Full Featured Pronunciation Player */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Full Featured Player</Text>
					<PronunciationPlayer
						text="Bonjour, comment allez-vous aujourd'hui?"
						label="French greeting with speed controls"
						variant={selectedVariant}
						showSpeedControls={true}
						showSpellButton={true}
						onError={handlePronunciationError}
					/>
				</View>

				{/* Minimal Pronunciation Player */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Minimal Player</Text>
					<PronunciationPlayer
						text="Au revoir!"
						label="Simple goodbye"
						variant="minimal"
						showSpeedControls={false}
						showSpellButton={false}
						onError={handlePronunciationError}
					/>
				</View>

				{/* Vocabulary Cards with Pronunciation Buttons */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Vocabulary Cards</Text>
					<View style={styles.vocabularyGrid}>
						{testWords.map((word, index) => (
							<View key={index} style={styles.vocabularyCard}>
								<Text style={styles.vocabularyWord}>{word}</Text>
								<View style={styles.vocabularyButtons}>
									<PronunciationButton text={word} size="small" />
									<PronunciationButton text={word} size="medium" />
									<PronunciationButton text={word} size="large" />
								</View>
							</View>
						))}
					</View>
				</View>

				{/* Feature Showcase */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Feature Showcase</Text>

					<View style={styles.featureCard}>
						<Text style={styles.featureTitle}>🎯 French Pronunciation</Text>
						<Text style={styles.featureDescription}>
							Native French text-to-speech with proper accent and pronunciation
						</Text>
						<PronunciationPlayer
							text="Je suis très heureux de vous rencontrer"
							variant="secondary"
							showSpeedControls={false}
							onError={handlePronunciationError}
						/>
					</View>

					<View style={styles.featureCard}>
						<Text style={styles.featureTitle}>⚡ Speed Controls</Text>
						<Text style={styles.featureDescription}>
							Adjust playback speed for better learning
						</Text>
						<PronunciationPlayer
							text="Parlez-vous français?"
							variant="primary"
							showSpeedControls={true}
							showSpellButton={false}
							onError={handlePronunciationError}
						/>
					</View>

					<View style={styles.featureCard}>
						<Text style={styles.featureTitle}>📝 Spelling Mode</Text>
						<Text style={styles.featureDescription}>
							Spell out words letter by letter for better understanding
						</Text>
						<PronunciationPlayer
							text="Merci"
							variant="secondary"
							showSpeedControls={false}
							showSpellButton={true}
							onError={handlePronunciationError}
						/>
					</View>
				</View>

				{/* Success Message */}
				<View style={styles.successCard}>
					<Ionicons
						name="checkmark-circle"
						size={48}
						color={theme.colors.success}
					/>
					<Text style={styles.successTitle}>Stage 5.1 Complete!</Text>
					<Text style={styles.successDescription}>
						Text-to-Speech integration is now fully functional with French
						pronunciation support, speed controls, and spelling features.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: theme.spacing.xs,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		flex: 1,
		textAlign: "center",
		color: theme.colors.text,
	},
	headerSpacer: {
		width: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: theme.spacing.lg,
	},
	section: {
		marginVertical: theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	variantButtons: {
		flexDirection: "row",
		gap: theme.spacing.sm,
	},
	variantButton: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 8,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	variantButtonSelected: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	variantButtonText: {
		color: theme.colors.textSecondary,
		fontSize: 14,
		fontWeight: "500",
	},
	variantButtonTextSelected: {
		color: "white",
		fontWeight: "600",
	},
	vocabularyGrid: {
		gap: theme.spacing.md,
	},
	vocabularyCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.md,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	vocabularyWord: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	vocabularyButtons: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	featureCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	featureTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	featureDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.md,
		lineHeight: 20,
	},
	successCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.xl,
		borderRadius: 12,
		alignItems: "center",
		marginVertical: theme.spacing.xl,
		borderWidth: 2,
		borderColor: theme.colors.success + "20",
	},
	successTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.success,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.sm,
	},
	successDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
});
