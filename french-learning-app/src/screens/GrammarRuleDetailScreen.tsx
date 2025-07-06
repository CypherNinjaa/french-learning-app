import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Alert,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { ContentManagementService } from "../services/contentManagementService";
import { GrammarRule, DifficultyLevel } from "../types";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { SpeechService } from "../services/speechService";

const { width } = Dimensions.get("window");

interface GrammarRuleDetailScreenProps {
	navigation: any;
	route: {
		params: {
			ruleId: number;
		};
	};
}

export const GrammarRuleDetailScreen: React.FC<
	GrammarRuleDetailScreenProps
> = ({ navigation, route }) => {
	const { ruleId } = route.params;
	const [grammarRule, setGrammarRule] = useState<GrammarRule | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [playingExample, setPlayingExample] = useState<number | null>(null);

	// Load specific grammar rule
	const loadGrammarRule = async () => {
		try {
			setError(null);
			// Since we don't have a single rule endpoint, we'll get all rules and filter
			const response = await ContentManagementService.getGrammarRules();
			if (response.success && response.data) {
				const rule = response.data.find((r) => r.id === ruleId);
				if (rule) {
					setGrammarRule(rule);
				} else {
					setError("Grammar rule not found");
				}
			} else {
				setError(response.error || "Failed to load grammar rule");
			}
		} catch (error) {
			console.error("Error loading grammar rule:", error);
			setError("Failed to load grammar rule. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadGrammarRule();
	}, [ruleId]);

	const getDifficultyColor = (
		difficulty: DifficultyLevel
	): [string, string] => {
		switch (difficulty) {
			case "beginner":
				return ["#4CAF50", "#66BB6A"];
			case "intermediate":
				return ["#FF9800", "#FFB74D"];
			case "advanced":
				return ["#F44336", "#EF5350"];
			default:
				return ["#2196F3", "#42A5F5"];
		}
	};

	const getDifficultyIcon = (difficulty: DifficultyLevel) => {
		switch (difficulty) {
			case "beginner":
				return "leaf-outline";
			case "intermediate":
				return "flame-outline";
			case "advanced":
				return "rocket-outline";
			default:
				return "book-outline";
		}
	};

	const getCategoryIcon = (
		category: string
	): keyof typeof Ionicons.glyphMap => {
		const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
			Verbs: "play-outline",
			Nouns: "cube-outline",
			Adjectives: "color-palette-outline",
			Pronouns: "person-outline",
			Articles: "document-text-outline",
			Prepositions: "link-outline",
			Conjunctions: "git-merge-outline",
			Adverbs: "speedometer-outline",
			"Sentence Structure": "layers-outline",
			Tenses: "time-outline",
			Questions: "help-circle-outline",
			Negation: "close-circle-outline",
		};
		return categoryIconMap[category] || "book-outline";
	};

	const handlePlayExample = async (text: string, index: number) => {
		try {
			setPlayingExample(index);
			await SpeechService.speakFrench(text, { rate: 0.8 });
		} catch (error) {
			console.error("Error playing audio:", error);
			Alert.alert("Audio Error", "Failed to play audio. Please try again.");
		} finally {
			setPlayingExample(null);
		}
	};

	if (loading) {
		return <LoadingState />;
	}

	if (error || !grammarRule) {
		return (
			<ErrorState
				title="Error loading grammar rule"
				description={error || "Grammar rule not found"}
				onRetry={loadGrammarRule}
			/>
		);
	}

	const difficultyColors = getDifficultyColor(grammarRule.difficulty_level);
	const examples = grammarRule.examples as Array<{
		french: string;
		english: string;
	}>;

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerInfo}>
					<View style={styles.categoryBadge}>
						<Ionicons
							name={getCategoryIcon(grammarRule.category || "")}
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.categoryText}>
							{grammarRule.category || "General"}
						</Text>
					</View>
				</View>
				<View
					style={[
						styles.difficultyBadge,
						{ backgroundColor: difficultyColors[0] },
					]}
				>
					<Ionicons
						name={getDifficultyIcon(grammarRule.difficulty_level)}
						size={16}
						color="white"
					/>
				</View>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Title Section */}
				<LinearGradient
					colors={[difficultyColors[0] + "15", difficultyColors[1] + "10"]}
					style={styles.titleSection}
				>
					<Text style={styles.ruleTitle}>{grammarRule.title}</Text>
					<Text style={styles.orderIndex}>
						Rule #{grammarRule.order_index || 1}
					</Text>
				</LinearGradient>

				{/* Explanation Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons
							name="information-circle-outline"
							size={20}
							color={theme.colors.primary}
						/>
						<Text style={styles.sectionTitle}>Explanation</Text>
					</View>
					<View style={styles.explanationCard}>
						<Text style={styles.explanationText}>
							{grammarRule.explanation}
						</Text>
					</View>
				</View>

				{/* Examples Section */}
				{examples && examples.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Ionicons
								name="list-outline"
								size={20}
								color={theme.colors.primary}
							/>
							<Text style={styles.sectionTitle}>Examples</Text>
							<Text style={styles.exampleCount}>
								{examples.length} example{examples.length !== 1 ? "s" : ""}
							</Text>
						</View>

						{examples.map((example, index) => (
							<View key={index} style={styles.exampleCard}>
								<View style={styles.exampleHeader}>
									<Text style={styles.exampleNumber}>Example {index + 1}</Text>
									<TouchableOpacity
										style={styles.playButton}
										onPress={() => handlePlayExample(example.french, index)}
										disabled={playingExample === index}
									>
										<Ionicons
											name={
												playingExample === index
													? "volume-high"
													: "volume-medium-outline"
											}
											size={16}
											color={theme.colors.primary}
										/>
									</TouchableOpacity>
								</View>

								<View style={styles.exampleContent}>
									<View style={styles.frenchExample}>
										<Text style={styles.languageLabel}>🇫🇷 French</Text>
										<Text style={styles.frenchText}>{example.french}</Text>
									</View>

									<View style={styles.divider} />

									<View style={styles.englishExample}>
										<Text style={styles.languageLabel}>🇬🇧 English</Text>
										<Text style={styles.englishText}>{example.english}</Text>
									</View>
								</View>
							</View>
						))}
					</View>
				)}

				{/* Difficulty Info Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons
							name="trending-up-outline"
							size={20}
							color={theme.colors.primary}
						/>
						<Text style={styles.sectionTitle}>Difficulty Level</Text>
					</View>
					<View style={styles.difficultyCard}>
						<LinearGradient
							colors={difficultyColors}
							style={styles.difficultyGradient}
						>
							<Ionicons
								name={getDifficultyIcon(grammarRule.difficulty_level)}
								size={24}
								color="white"
							/>
							<Text style={styles.difficultyText}>
								{grammarRule.difficulty_level.charAt(0).toUpperCase() +
									grammarRule.difficulty_level.slice(1)}
							</Text>
						</LinearGradient>
						<Text style={styles.difficultyDescription}>
							{grammarRule.difficulty_level === "beginner" &&
								"Perfect for learners starting their French journey"}
							{grammarRule.difficulty_level === "intermediate" &&
								"For learners with basic French knowledge"}
							{grammarRule.difficulty_level === "advanced" &&
								"For experienced learners seeking mastery"}
						</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons
							name="flash-outline"
							size={20}
							color={theme.colors.primary}
						/>
						<Text style={styles.sectionTitle}>Quick Actions</Text>
					</View>
					<View style={styles.actionButtons}>
						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => {
								// Navigate to practice with this rule
								Alert.alert(
									"Practice Coming Soon",
									"Practice exercises for this grammar rule will be available in a future update!"
								);
							}}
						>
							<Ionicons
								name="fitness-outline"
								size={20}
								color={theme.colors.primary}
							/>
							<Text style={styles.actionButtonText}>Practice</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => {
								// Navigate to related vocabulary
								navigation.navigate("Vocabulary");
							}}
						>
							<Ionicons
								name="book-outline"
								size={20}
								color={theme.colors.primary}
							/>
							<Text style={styles.actionButtonText}>Vocabulary</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => {
								// Navigate to lessons
								navigation.navigate("Books");
							}}
						>
							<Ionicons
								name="library-outline"
								size={20}
								color={theme.colors.primary}
							/>
							<Text style={styles.actionButtonText}>Lessons</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Bottom spacer */}
				<View style={styles.bottomSpacer} />
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
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: theme.colors.background,
	},
	headerInfo: {
		flex: 1,
		alignItems: "center",
	},
	categoryBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary + "15",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		gap: 6,
	},
	categoryText: {
		fontSize: 14,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	difficultyBadge: {
		padding: 10,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		flex: 1,
	},
	titleSection: {
		padding: 24,
		alignItems: "center",
	},
	ruleTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: 8,
		lineHeight: 34,
	},
	orderIndex: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	section: {
		marginBottom: 24,
		paddingHorizontal: 20,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
		gap: 8,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
	},
	exampleCount: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontWeight: "500",
	},
	explanationCard: {
		backgroundColor: theme.colors.surface,
		padding: 20,
		borderRadius: 16,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.primary,
	},
	explanationText: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
	},
	exampleCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 20,
		marginBottom: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	exampleHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	exampleNumber: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	playButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: theme.colors.primary + "15",
	},
	exampleContent: {
		gap: 12,
	},
	frenchExample: {
		gap: 6,
	},
	englishExample: {
		gap: 6,
	},
	languageLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.textSecondary,
	},
	frenchText: {
		fontSize: 18,
		fontStyle: "italic",
		color: theme.colors.text,
		lineHeight: 26,
	},
	englishText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		lineHeight: 22,
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginVertical: 4,
	},
	difficultyCard: {
		overflow: "hidden",
		borderRadius: 16,
	},
	difficultyGradient: {
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	difficultyText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
		textTransform: "capitalize",
	},
	difficultyDescription: {
		padding: 16,
		backgroundColor: theme.colors.surface,
		fontSize: 14,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	actionButtons: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	actionButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	bottomSpacer: {
		height: 40,
	},
});
