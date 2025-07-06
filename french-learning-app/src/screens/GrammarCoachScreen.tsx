import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";

interface GrammarCoachScreenProps {
	navigation: any;
}

interface GrammarRule {
	id: string;
	title: string;
	description: string;
	examples: string[];
	difficulty: "beginner" | "intermediate" | "advanced";
}

interface GrammarExercise {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	rule: string;
}

export const GrammarCoachScreen: React.FC<GrammarCoachScreenProps> = ({
	navigation,
}) => {
	const [currentTab, setCurrentTab] = useState<"rules" | "exercises" | "chat">(
		"rules"
	);
	const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
	const [currentExercise, setCurrentExercise] =
		useState<GrammarExercise | null>(null);
	const [exerciseIndex, setExerciseIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [score, setScore] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [grammarQuery, setGrammarQuery] = useState("");

	// Mock data for grammar rules
	const grammarRules: GrammarRule[] = [
		{
			id: "1",
			title: "Les Articles Définis",
			description: "Learn when and how to use definite articles (le, la, les)",
			examples: [
				"Le chat (masculine singular)",
				"La maison (feminine singular)",
				"Les enfants (plural)",
			],
			difficulty: "beginner",
		},
		{
			id: "2",
			title: "Accord des Adjectifs",
			description: "Agreement of adjectives with nouns in gender and number",
			examples: [
				"Un homme grand → Une femme grande",
				"Des hommes grands → Des femmes grandes",
			],
			difficulty: "intermediate",
		},
		{
			id: "3",
			title: "Le Subjonctif",
			description: "When and how to use the subjunctive mood",
			examples: ["Il faut que tu viennes", "Je doute qu'il soit là"],
			difficulty: "advanced",
		},
	];

	// Mock data for exercises
	const grammarExercises: GrammarExercise[] = [
		{
			id: "1",
			question: "Complétez: ___ chat est noir.",
			options: ["Le", "La", "Les", "Un"],
			correctAnswer: 0,
			explanation: "'Chat' is masculine singular, so we use 'Le'",
			rule: "Les Articles Définis",
		},
		{
			id: "2",
			question: "Choisissez la forme correcte: Elle est ___",
			options: ["grand", "grande", "grands", "grandes"],
			correctAnswer: 1,
			explanation:
				"'Elle' is feminine singular, so the adjective must agree: 'grande'",
			rule: "Accord des Adjectifs",
		},
	];

	useEffect(() => {
		if (grammarExercises.length > 0) {
			setCurrentExercise(grammarExercises[0]);
		}
	}, []);

	const handleAnswerSelect = (answerIndex: number) => {
		setSelectedAnswer(answerIndex);
		setShowResult(true);

		if (answerIndex === currentExercise?.correctAnswer) {
			setScore(score + 1);
		}

		setTimeout(() => {
			handleNextExercise();
		}, 3000);
	};

	const handleNextExercise = () => {
		setShowResult(false);
		setSelectedAnswer(null);

		if (exerciseIndex < grammarExercises.length - 1) {
			const nextIndex = exerciseIndex + 1;
			setExerciseIndex(nextIndex);
			setCurrentExercise(grammarExercises[nextIndex]);
		} else {
			Alert.alert(
				"Exercise Complete!",
				`You scored ${score}/${grammarExercises.length}`,
				[{ text: "OK", onPress: () => setExerciseIndex(0) }]
			);
		}
	};

	const handleGrammarQuery = async () => {
		if (!grammarQuery.trim()) return;

		setIsLoading(true);
		// TODO: Integrate with Groq API for grammar explanations
		setTimeout(() => {
			setIsLoading(false);
			Alert.alert(
				"Grammar Explanation",
				"This feature will provide AI-powered grammar explanations using Groq API."
			);
		}, 1500);
	};

	const renderRulesTab = () => (
		<ScrollView style={styles.tabContent}>
			{grammarRules.map((rule) => (
				<TouchableOpacity
					key={rule.id}
					style={styles.ruleCard}
					onPress={() => setSelectedRule(rule)}
				>
					<View style={styles.ruleHeader}>
						<Text style={styles.ruleTitle}>{rule.title}</Text>
						<View
							style={[
								styles.difficultyBadge,
								{ backgroundColor: getDifficultyColor(rule.difficulty) },
							]}
						>
							<Text style={styles.difficultyText}>{rule.difficulty}</Text>
						</View>
					</View>
					<Text style={styles.ruleDescription}>{rule.description}</Text>
					{selectedRule?.id === rule.id && (
						<View style={styles.examplesContainer}>
							<Text style={styles.examplesTitle}>Examples:</Text>
							{rule.examples.map((example, index) => (
								<Text key={index} style={styles.exampleText}>
									• {example}
								</Text>
							))}
						</View>
					)}
				</TouchableOpacity>
			))}
		</ScrollView>
	);

	const renderExercisesTab = () => (
		<View style={styles.tabContent}>
			{currentExercise ? (
				<View style={styles.exerciseContainer}>
					<View style={styles.exerciseHeader}>
						<Text style={styles.exerciseProgress}>
							Question {exerciseIndex + 1} of {grammarExercises.length}
						</Text>
						<Text style={styles.exerciseScore}>Score: {score}</Text>
					</View>

					<Text style={styles.exerciseQuestion}>
						{currentExercise.question}
					</Text>

					<View style={styles.optionsContainer}>
						{currentExercise.options.map((option, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.optionButton,
									selectedAnswer === index && {
										backgroundColor:
											index === currentExercise.correctAnswer
												? theme.colors.success
												: theme.colors.error,
									},
								]}
								onPress={() => handleAnswerSelect(index)}
								disabled={showResult}
							>
								<Text
									style={[
										styles.optionText,
										selectedAnswer === index && styles.selectedOptionText,
									]}
								>
									{option}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{showResult && (
						<View style={styles.resultContainer}>
							<Text
								style={[
									styles.resultText,
									{
										color:
											selectedAnswer === currentExercise.correctAnswer
												? theme.colors.success
												: theme.colors.error,
									},
								]}
							>
								{selectedAnswer === currentExercise.correctAnswer
									? "Correct!"
									: "Incorrect"}
							</Text>
							<Text style={styles.explanationText}>
								{currentExercise.explanation}
							</Text>
						</View>
					)}
				</View>
			) : (
				<Text style={styles.noExerciseText}>No exercises available</Text>
			)}
		</View>
	);

	const renderChatTab = () => (
		<View style={styles.tabContent}>
			<Text style={styles.chatTitle}>Ask the Grammar Coach</Text>
			<Text style={styles.chatSubtitle}>
				Ask any French grammar question and get instant AI-powered explanations
			</Text>

			<View style={styles.queryContainer}>
				<TextInput
					style={styles.queryInput}
					placeholder="e.g., When do I use 'du' vs 'de la'?"
					value={grammarQuery}
					onChangeText={setGrammarQuery}
					multiline
				/>
				<TouchableOpacity
					style={styles.queryButton}
					onPress={handleGrammarQuery}
					disabled={isLoading || !grammarQuery.trim()}
				>
					{isLoading ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Ionicons name="send" size={20} color="white" />
					)}
				</TouchableOpacity>
			</View>

			<View style={styles.suggestionsContainer}>
				<Text style={styles.suggestionsTitle}>Popular Questions:</Text>
				{[
					"When to use être vs avoir?",
					"How do French adjectives agree?",
					"What's the difference between passé composé and imparfait?",
				].map((suggestion, index) => (
					<TouchableOpacity
						key={index}
						style={styles.suggestionChip}
						onPress={() => setGrammarQuery(suggestion)}
					>
						<Text style={styles.suggestionText}>{suggestion}</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return theme.colors.success;
			case "intermediate":
				return theme.colors.warning;
			case "advanced":
				return theme.colors.error;
			default:
				return theme.colors.primary;
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={24} color="white" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Grammar Coach</Text>
				<View style={styles.headerRight} />
			</LinearGradient>

			<View style={styles.tabBar}>
				{[
					{ key: "rules", title: "Rules", icon: "book-outline" },
					{ key: "exercises", title: "Practice", icon: "fitness-outline" },
					{ key: "chat", title: "Ask AI", icon: "chatbubble-outline" },
				].map((tab) => (
					<TouchableOpacity
						key={tab.key}
						style={[styles.tab, currentTab === tab.key && styles.activeTab]}
						onPress={() => setCurrentTab(tab.key as any)}
					>
						<Ionicons
							name={tab.icon as any}
							size={20}
							color={
								currentTab === tab.key
									? theme.colors.primary
									: theme.colors.textSecondary
							}
						/>
						<Text
							style={[
								styles.tabText,
								currentTab === tab.key && styles.activeTabText,
							]}
						>
							{tab.title}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{currentTab === "rules" && renderRulesTab()}
			{currentTab === "exercises" && renderExercisesTab()}
			{currentTab === "chat" && renderChatTab()}
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
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	backButton: {
		padding: 5,
	},
	headerTitle: {
		flex: 1,
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
		textAlign: "center",
	},
	headerRight: {
		width: 34,
	},
	tabBar: {
		flexDirection: "row",
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 15,
		gap: 5,
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: theme.colors.primary,
	},
	tabText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	activeTabText: {
		color: theme.colors.primary,
		fontWeight: "600",
	},
	tabContent: {
		flex: 1,
		padding: 20,
	},
	ruleCard: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	ruleHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	ruleTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: theme.colors.text,
		flex: 1,
	},
	difficultyBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	difficultyText: {
		fontSize: 12,
		color: "white",
		fontWeight: "600",
	},
	ruleDescription: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	examplesContainer: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	examplesTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 8,
	},
	exampleText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 4,
	},
	exerciseContainer: {
		flex: 1,
	},
	exerciseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	exerciseProgress: {
		fontSize: 14,
		color: theme.colors.textSecondary,
	},
	exerciseScore: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
	},
	exerciseQuestion: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 24,
		lineHeight: 26,
	},
	optionsContainer: {
		gap: 12,
	},
	optionButton: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	optionText: {
		fontSize: 16,
		color: theme.colors.text,
		textAlign: "center",
	},
	selectedOptionText: {
		color: "white",
		fontWeight: "600",
	},
	resultContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: theme.colors.surface,
		borderRadius: 12,
	},
	resultText: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
	},
	explanationText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		lineHeight: 20,
	},
	noExerciseText: {
		fontSize: 16,
		color: theme.colors.textSecondary,
		textAlign: "center",
		marginTop: 40,
	},
	chatTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: 8,
	},
	chatSubtitle: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: 20,
		lineHeight: 20,
	},
	queryContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	queryInput: {
		flex: 1,
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		borderWidth: 1,
		borderColor: theme.colors.border,
		minHeight: 80,
		textAlignVertical: "top",
	},
	queryButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: 12,
		padding: 16,
		justifyContent: "center",
		alignItems: "center",
		width: 60,
	},
	suggestionsContainer: {
		marginTop: 20,
	},
	suggestionsTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 12,
	},
	suggestionChip: {
		backgroundColor: "white",
		borderRadius: 20,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	suggestionText: {
		fontSize: 14,
		color: theme.colors.text,
	},
});
