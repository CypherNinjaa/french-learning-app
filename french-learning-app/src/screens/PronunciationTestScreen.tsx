// Test Screen for Stage 5.1 - Text-to-Speech Integration
import React, { useState, useEffect } from "react";
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
import { supabase } from "../services/supabase";

interface PronunciationTestScreenProps {
	navigation: any;
}

export const PronunciationTestScreen: React.FC<
	PronunciationTestScreenProps
> = ({ navigation }) => {
	const [error, setError] = useState<string | null>(null);
	const [words, setWords] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [speedValue, setSpeedValue] = useState(1.0);

	useEffect(() => {
		const fetchWords = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("pronunciation_words")
				.select("id, french, english, pronunciation, example");
			if (error) {
				setError("Failed to load pronunciation words.");
				setWords([]);
			} else {
				setWords(data || []);
			}
			setLoading(false);
		};
		fetchWords();
	}, []);

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

	if (loading) {
		return <LoadingState />;
	}

	if (words.length === 0) {
		return (
			<EmptyState
				title="No Pronunciation Words"
				description="No pronunciation words available. Please check back later!"
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
				{/* Speed Control System */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Playback Speed</Text>
					<View style={styles.speedControls}>
						{[
							{ label: "🐢 Slow", value: 0.7 },
							{ label: "🚶 Normal", value: 1.0 },
							{ label: "⚡ Fast", value: 1.3 },
							{ label: "⚡⚡ Very Fast", value: 1.6 },
						].map((speed) => (
							<TouchableOpacity
								key={speed.value}
								style={[
									styles.speedButton,
									speedValue === speed.value && styles.speedButtonSelected,
								]}
								onPress={() => setSpeedValue(speed.value)}
							>
								<Text
									style={[
										styles.speedButtonText,
										speedValue === speed.value &&
											styles.speedButtonTextSelected,
									]}
								>
									{speed.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Dynamic Pronunciation Words List */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Pronunciation Words</Text>
					<View style={styles.vocabularyGrid}>
						{words.map((word, index) => (
							<View key={word.id || index} style={styles.pronunciationCard}>
								<View style={{ flex: 1 }}>
									<Text style={styles.pronunciationFrench}>{word.french}</Text>
									<Text style={styles.pronunciationEnglish}>
										{word.english}
									</Text>
									{word.pronunciation ? (
										<Text style={styles.pronunciationIPA}>
											/{word.pronunciation}/
										</Text>
									) : null}
									{word.example ? (
										<Text style={styles.pronunciationExample}>
											{word.example}
										</Text>
									) : null}
								</View>
								<View style={styles.pronunciationActions}>
									<PronunciationButton
										text={word.french}
										size="large"
										speed={speedValue}
									/>
								</View>
							</View>
						))}
					</View>
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
	speedControls: {
		flexDirection: "row",
		gap: theme.spacing.sm,
		marginBottom: theme.spacing.md,
	},
	speedButton: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: 8,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	speedButtonSelected: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	speedButtonText: {
		color: theme.colors.textSecondary,
		fontSize: 14,
		fontWeight: "500",
	},
	speedButtonTextSelected: {
		color: "white",
		fontWeight: "600",
	},
	vocabularyGrid: {
		gap: theme.spacing.md,
	},
	pronunciationCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 1,
	},
	pronunciationFrench: {
		fontSize: 18,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginBottom: 2,
	},
	pronunciationEnglish: {
		fontSize: 16,
		color: theme.colors.text,
		marginBottom: 2,
	},
	pronunciationIPA: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
		marginBottom: 4,
	},
	pronunciationExample: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginTop: 4,
		fontStyle: "italic",
	},
	pronunciationActions: {
		marginLeft: theme.spacing.lg,
		alignItems: "center",
		justifyContent: "center",
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
