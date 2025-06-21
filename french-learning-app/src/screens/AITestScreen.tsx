// Test Screen for Stage 6.1 - Groq AI Integration
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAIHelper } from "../hooks/useAIHelper";
import { theme } from "../constants/theme";

interface AITestScreenProps {
	navigation: any;
}

export const AITestScreen: React.FC<AITestScreenProps> = ({ navigation }) => {
	const {
		isLoading,
		error,
		rateLimitStatus,
		generatePracticeSentences,
		provideFeedback,
		generateHint,
		explainGrammar,
		generateQuestions,
		clearError,
		checkRateLimit,
	} = useAIHelper();

	const [practiceSentences, setPracticeSentences] = useState<string[]>([]);
	const [feedback, setFeedback] = useState<any>(null);
	const [hint, setHint] = useState<string>("");
	const [grammarExplanation, setGrammarExplanation] = useState<string>("");
	const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

	// Input states
	const [vocabularyInput, setVocabularyInput] = useState(
		"bonjour, merci, au revoir"
	);
	const [userAnswerInput, setUserAnswerInput] = useState("Je suis bien");
	const [correctAnswerInput, setCorrectAnswerInput] = useState("Je vais bien");
	const [grammarRuleInput, setGrammarRuleInput] = useState(
		'French verb conjugation for "être"'
	);

	const handleGoBack = () => {
		navigation.goBack();
	};

	const handleGeneratePracticeSentences = async () => {
		clearError();
		const vocabulary = vocabularyInput.split(",").map((word) => word.trim());
		const result = await generatePracticeSentences(vocabulary, "beginner", 3);

		if (result.success && result.data) {
			setPracticeSentences(result.data);
		} else {
			Alert.alert(
				"Error",
				result.error || "Failed to generate practice sentences"
			);
		}
	};

	const handleProvideFeedback = async () => {
		clearError();
		const result = await provideFeedback(
			userAnswerInput,
			correctAnswerInput,
			"French greeting conversation"
		);

		if (result.success && result.data) {
			setFeedback(result.data);
		} else {
			Alert.alert("Error", result.error || "Failed to get feedback");
		}
	};

	const handleGenerateHint = async () => {
		clearError();
		const result = await generateHint(
			'How do you say "How are you?" in French?',
			"Comment allez-vous?",
			"medium"
		);

		if (result.success && result.data) {
			setHint(result.data);
		} else {
			Alert.alert("Error", result.error || "Failed to generate hint");
		}
	};

	const handleExplainGrammar = async () => {
		clearError();
		const result = await explainGrammar(
			grammarRuleInput,
			"Je suis, tu es, il/elle est",
			"beginner"
		);

		if (result.success && result.data) {
			setGrammarExplanation(result.data);
		} else {
			Alert.alert("Error", result.error || "Failed to explain grammar");
		}
	};

	const handleGenerateQuestions = async () => {
		clearError();
		const result = await generateQuestions(
			"French greetings and basic conversation",
			"multiple_choice",
			"beginner",
			2
		);

		if (result.success && result.data) {
			setGeneratedQuestions(result.data);
		} else {
			Alert.alert("Error", result.error || "Failed to generate questions");
		}
	};

	const handleRefreshRateLimit = () => {
		checkRateLimit();
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Grammar correction</Text>
				<TouchableOpacity
					onPress={handleRefreshRateLimit}
					style={styles.refreshButton}
				>
					<Ionicons name="refresh" size={20} color={theme.colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Error Display */}
				{error && (
					<View style={styles.errorCard}>
						<Ionicons
							name="alert-circle"
							size={24}
							color={theme.colors.error}
						/>
						<Text style={styles.errorText}>{error}</Text>
						<TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
							<Text style={styles.errorDismissText}>Dismiss</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Rate Limit Status
				{rateLimitStatus && (
					<View style={styles.rateLimitCard}>
						<Text style={styles.rateLimitTitle}>API Rate Limits</Text>
						<Text style={styles.rateLimitText}>
							Minute: {rateLimitStatus.minute?.remaining || 0} remaining
						</Text>
						<Text style={styles.rateLimitText}>
							Hour: {rateLimitStatus.hour?.remaining || 0} remaining
						</Text>
						<Text style={styles.rateLimitText}>
							Day: {rateLimitStatus.day?.remaining || 0} remaining
						</Text>
					</View>
				)} */}

				{/* Practice Sentences Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						🎯 Practice Sentences
					</Text>
					<TextInput
						style={styles.input}
						placeholder="Enter French vocabulary (comma separated)"
						value={vocabularyInput}
						onChangeText={setVocabularyInput}
						multiline
					/>
					<TouchableOpacity
						style={[styles.actionButton, isLoading && styles.disabledButton]}
						onPress={handleGeneratePracticeSentences}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text style={styles.actionButtonText}>
								Generate Practice Sentences
							</Text>
						)}
					</TouchableOpacity>

					{practiceSentences.length > 0 && (
						<View style={styles.resultCard}>
							<Text style={styles.resultTitle}>Generated Sentences:</Text>
							{practiceSentences.map((sentence, index) => (
								<Text key={index} style={styles.resultText}>
									{index + 1}. {sentence}
								</Text>
							))}
						</View>
					)}
				</View>

				{/* AI Feedback Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🤖 AI Feedback System</Text>
					<TextInput
						style={styles.input}
						placeholder="User's answer"
						value={userAnswerInput}
						onChangeText={setUserAnswerInput}
					/>
					<TextInput
						style={styles.input}
						placeholder="Correct answer"
						value={correctAnswerInput}
						onChangeText={setCorrectAnswerInput}
					/>
					<TouchableOpacity
						style={[styles.actionButton, isLoading && styles.disabledButton]}
						onPress={handleProvideFeedback}
						disabled={isLoading}
					>
						<Text style={styles.actionButtonText}>Get AI Feedback</Text>
					</TouchableOpacity>

					{feedback && (
						<View style={styles.resultCard}>
							<Text style={styles.resultTitle}>AI Feedback:</Text>
							<Text
								style={[
									styles.feedbackStatus,
									feedback.isCorrect ? styles.correct : styles.incorrect,
								]}
							>
								{feedback.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
							</Text>
							<Text style={styles.resultText}>
								<Text style={styles.bold}>Feedback:</Text> {feedback.feedback}
							</Text>
							<Text style={styles.resultText}>
								<Text style={styles.bold}>Explanation:</Text>{" "}
								{feedback.explanation}
							</Text>
							<Text style={styles.resultText}>
								<Text style={styles.bold}>Encouragement:</Text>{" "}
								{feedback.encouragement}
							</Text>
						</View>
					)}
				</View>

				{/* Hint Generation Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>💡 AI Hint Generator</Text>
					<TouchableOpacity
						style={[styles.actionButton, isLoading && styles.disabledButton]}
						onPress={handleGenerateHint}
						disabled={isLoading}
					>
						<Text style={styles.actionButtonText}>Generate Hint</Text>
					</TouchableOpacity>

					{hint && (
						<View style={styles.resultCard}>
							<Text style={styles.resultTitle}>AI Hint:</Text>
							<Text style={styles.resultText}>{hint}</Text>
						</View>
					)}
				</View>

				{/* Grammar Explanation Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>📚 Grammar Explanation</Text>
					<TextInput
						style={styles.input}
						placeholder="Enter grammar rule to explain"
						value={grammarRuleInput}
						onChangeText={setGrammarRuleInput}
						multiline
					/>
					<TouchableOpacity
						style={[styles.actionButton, isLoading && styles.disabledButton]}
						onPress={handleExplainGrammar}
						disabled={isLoading}
					>
						<Text style={styles.actionButtonText}>Explain Grammar</Text>
					</TouchableOpacity>

					{grammarExplanation && (
						<View style={styles.resultCard}>
							<Text style={styles.resultTitle}>Grammar Explanation:</Text>
							<Text style={styles.resultText}>{grammarExplanation}</Text>
						</View>
					)}
				</View>

				{/* Question Generation Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>❓ Question Generator</Text>
					<TouchableOpacity
						style={[styles.actionButton, isLoading && styles.disabledButton]}
						onPress={handleGenerateQuestions}
						disabled={isLoading}
					>
						<Text style={styles.actionButtonText}>Generate Questions</Text>
					</TouchableOpacity>

					{generatedQuestions.length > 0 && (
						<View style={styles.resultCard}>
							<Text style={styles.resultTitle}>Generated Questions:</Text>
							{generatedQuestions.map((question, index) => (
								<View key={index} style={styles.questionCard}>
									<Text style={styles.questionText}>{question.question}</Text>
									{question.options && (
										<View style={styles.optionsContainer}>
											{question.options.map(
												(option: string, optIndex: number) => (
													<Text key={optIndex} style={styles.optionText}>
														{String.fromCharCode(65 + optIndex)}. {option}
													</Text>
												)
											)}
										</View>
									)}
									<Text style={styles.answerText}>
										Answer: {question.correct_answer}
									</Text>
									<Text style={styles.explanationText}>
										{question.explanation}
									</Text>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Success Message
				<View style={styles.successCard}>
					<Ionicons
						name="checkmark-circle"
						size={48}
						color={theme.colors.success}
					/>
					<Text style={styles.successTitle}>Stage 6.1 Complete!</Text>
					<Text style={styles.successDescription}>
						Groq AI integration is now fully functional with intelligent
						practice sentence generation, feedback system, hint generation,
						grammar explanations, and dynamic question creation.
					</Text>
				</View> */}
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
	refreshButton: {
		padding: theme.spacing.xs,
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
	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 8,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.md,
		fontSize: 16,
		color: theme.colors.text,
		minHeight: 50,
	},
	actionButton: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.md,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	disabledButton: {
		backgroundColor: theme.colors.textSecondary,
	},
	actionButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	resultCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.colors.border,
		marginBottom: theme.spacing.md,
	},
	resultTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	resultText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
		lineHeight: 20,
	},
	bold: {
		fontWeight: "600",
		color: theme.colors.text,
	},
	feedbackStatus: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: theme.spacing.sm,
	},
	correct: {
		color: theme.colors.success,
	},
	incorrect: {
		color: theme.colors.error,
	},
	questionCard: {
		backgroundColor: theme.colors.background,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	questionText: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	optionsContainer: {
		marginBottom: theme.spacing.sm,
	},
	optionText: {
		fontSize: 14,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.xs,
	},
	answerText: {
		fontSize: 14,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
	},
	explanationText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		fontStyle: "italic",
	},
	errorCard: {
		backgroundColor: theme.colors.error + "10",
		borderColor: theme.colors.error,
		borderWidth: 1,
		padding: theme.spacing.md,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	errorText: {
		flex: 1,
		color: theme.colors.error,
		marginLeft: theme.spacing.sm,
		fontSize: 14,
	},
	errorDismiss: {
		padding: theme.spacing.xs,
	},
	errorDismissText: {
		color: theme.colors.error,
		fontWeight: "600",
		fontSize: 12,
	},
	rateLimitCard: {
		backgroundColor: theme.colors.primary + "10",
		borderColor: theme.colors.primary,
		borderWidth: 1,
		padding: theme.spacing.md,
		borderRadius: 8,
		marginBottom: theme.spacing.md,
	},
	rateLimitTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
	},
	rateLimitText: {
		fontSize: 12,
		color: theme.colors.textSecondary,
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
